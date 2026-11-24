// ============================================================
// POST /api/lead — proxy de captação.
//
// POR QUE ISTO EXISTE
// Antes, o navegador carregava a URL do n8n e o webhook aceitava POST de
// qualquer origem (OPTIONS de origem arbitrária respondia 204). Como cada lead
// vira disparo de e-mail e WhatsApp no Hermes, qualquer pessoa podia inundar a
// operação a partir de um terminal. Agora o navegador só conhece `/api/lead`, e
// a URL do n8n vive em variável de ambiente server-side desta Function.
//
// Veio do horus (functions/api/lead.ts) no WEB-49, sem mudar o comportamento. É
// do site da Academy; nos outros projetos do Pages deste repositório, sem a
// LEAD_WEBHOOK_URL, responde 503 e não manda nada a lugar nenhum.
//
// ONDE ESTE ARQUIVO PRECISA FICAR
// Na RAIZ do repositório (`functions/api/lead.ts`), não em
// `apps/stratacademy/`. A documentação da Cloudflare é explícita:
//   "Make sure that the /functions directory is at the root of your Pages
//    project (and not in the static root, such as /dist)."
// O "root of your Pages project" é o Root directory configurado no projeto —
// que aqui é `/` (ver ADR 0002 §Root directory e ADR 0010). O build output
// (`apps/stratacademy/dist`) é outra coisa e NÃO leva functions dentro.
// Errar esse caminho não dá erro de build: a Function simplesmente não existe e
// o formulário quebra em produção sem aviso.
//
// VARIÁVEIS DE AMBIENTE (painel do Cloudflare Pages, produção E preview):
//   LEAD_WEBHOOK_URL — a URL do webhook do n8n. SEM prefixo PUBLIC_: ela é lida
//   aqui no servidor e nunca chega ao navegador.
//   TURNSTILE_SECRET — o segredo que valida o token do Turnstile. Também sem
//   PUBLIC_. Ausente = verificação pulada, e é assim que dev e preview sem
//   chave continuam funcionando.
// ============================================================

interface Env {
  LEAD_WEBHOOK_URL?: string;
  /** Origens extras permitidas, separadas por vírgula. Opcional. */
  LEAD_ORIGENS_EXTRA?: string;
  /**
   * Segredo do Turnstile. SEM prefixo PUBLIC_ — é ele que prova o token, e no
   * bundle não valeria nada. Ausente = verificação pulada, que é como dev e
   * preview sem chave continuam funcionando.
   */
  TURNSTILE_SECRET?: string;
}

/** Os formulários que existem. Nome fora desta lista é recusado. */
const FORMULARIOS = ['newsletter', 'diagnostico-funil'] as const;
type Formulario = (typeof FORMULARIOS)[number];

/**
 * Quais formulários coletam nome.
 *
 * NÃO é uma regra global: a newsletter é só e-mail, e exigir nome nela
 * rejeitaria toda inscrição — uma queda silenciosa do canal inteiro.
 */
const EXIGE_NOME: Record<Formulario, boolean> = {
  newsletter: false,
  'diagnostico-funil': true,
};

/**
 * Quais formulários mandam token do Turnstile.
 *
 * Os dois, desde que a newsletter ganhou widget. Enquanto ela ficou de fora, era
 * a porta aberta do endpoint: bastava mandar `formulario: 'newsletter'` para
 * passar por cima da proteção do diagnóstico.
 *
 * A regra continua valendo para quem vier depois: só vire `true` DEPOIS que o
 * formulário estiver montando o widget, ou toda submissão dele vira 403 em
 * silêncio — sem erro de build e sem nada na tela.
 */
const EXIGE_TURNSTILE: Record<Formulario, boolean> = {
  newsletter: true,
  'diagnostico-funil': true,
};

/** Tetos de tamanho. Nada aqui precisa ser grande; corpo grande é abuso. */
const MAX = {
  // 12 KB. Com `contextoUrl` o corpo cresce: 8 etapas de nome longo e acentuado
  // dão ~2,1 KB só de URL, e somadas ao token do Turnstile (2 KB) e aos demais
  // campos no máximo o corpo chega a ~5 KB. Com 4 KB o lead virava 413.
  corpo: 12 * 1024,
  email: 254, // RFC 5321
  nome: 80,
  telefone: 20,
  origem: 60,
  contexto: 40,
  lista: 60,
  eventId: 64,
  rota: 200,
  turnstile: 2048, // o token da Cloudflare é longo
  contextoUrl: 4096, // a URL carrega o funil inteiro na query
} as const;

// Formato plausível, não validação semântica: quem decide se o e-mail existe é
// o envio. O que interessa barrar é lixo e injeção de cabeçalho.
const RE_EMAIL = /^[^\s@,;:<>()[\]\\"]+@[^\s@.,;:<>()[\]\\"]+(\.[^\s@.,;:<>()[\]\\"]+)+$/;

/** Apara: tira caractere de controle (injeção de cabeçalho), espaço das pontas e corta no teto. */
const texto = (v: unknown, teto: number) =>
  typeof v === 'string'
    ? v.replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, teto)
    : '';

/**
 * A URL de contexto, validada — ou string vazia.
 *
 * Duas regras que a diferenciam de `texto()`:
 *
 * 1. NÃO TRUNCA. Uma URL cortada no meio da query decodifica para um funil
 *    diferente do que a pessoa montou, e o Hermes mandaria um e-mail com
 *    números errados. Melhor não ter o dado do que ter o dado errado.
 * 2. Só aceita URL do PRÓPRIO SITE. Este valor vem do cliente e vai parar num
 *    e-mail que nós enviamos — sem essa checagem, daria para nos fazer mandar
 *    link para qualquer lugar, com o nosso remetente.
 */
function urlDeContexto(v: unknown, permitidas: Set<string>): string {
  if (typeof v !== 'string' || !v) return '';
  if (v.length > MAX.contextoUrl) {
    console.warn('[lead] contextoUrl acima do teto, descartada');
    return '';
  }
  try {
    const u = new URL(v);
    if (!permitidas.has(u.origin)) {
      console.warn('[lead] contextoUrl de origem estranha, descartada');
      return '';
    }
    return u.href;
  } catch {
    return '';
  }
}

const recusa = (status: number, motivo: string) =>
  new Response(JSON.stringify({ erro: motivo }), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
  });

/**
 * Só aceita requisição do próprio site.
 *
 * A comparação é contra a origem DA PRÓPRIA REQUISIÇÃO, não contra um domínio
 * fixo: assim funciona igual em produção, no `.pages.dev` e em cada preview de
 * branch, sem precisar manter lista. `Origin` ausente é recusado de propósito —
 * é o caso do curl e do script, exatamente o que este proxy existe para barrar.
 */
function origensPermitidas(request: Request, env: Env): Set<string> {
  const permitidas = new Set<string>([new URL(request.url).origin]);
  for (const extra of (env.LEAD_ORIGENS_EXTRA ?? '').split(',')) {
    const limpa = extra.trim();
    if (limpa) permitidas.add(limpa);
  }
  return permitidas;
}

function mesmaOrigem(request: Request, permitidas: Set<string>): boolean {
  const origem = request.headers.get('Origin');
  return !!origem && permitidas.has(origem);
}

/**
 * Valida o token contra a Cloudflare.
 *
 * Devolve `true` quando não há segredo configurado: sem ele não existe como
 * verificar, e derrubar toda captação por falta de variável seria pior que o
 * abuso que o Turnstile evita. O painel é quem liga a proteção.
 */
async function turnstileOk(
  token: string,
  ip: string,
  env: Env,
  formulario: Formulario,
): Promise<boolean> {
  if (!env.TURNSTILE_SECRET) return true; // dev e preview sem chave
  if (!EXIGE_TURNSTILE[formulario]) return true; // formulário ainda sem widget
  if (!token) return false;

  const corpo = new FormData();
  corpo.append('secret', env.TURNSTILE_SECRET);
  corpo.append('response', token);
  if (ip) corpo.append('remoteip', ip);

  try {
    const r = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: corpo,
      signal: AbortSignal.timeout(5_000),
    });
    if (!r.ok) {
      console.error(`[lead] siteverify respondeu ${r.status}`);
      return false;
    }
    const dados = (await r.json()) as { success?: boolean; 'error-codes'?: string[] };
    if (!dados.success) {
      console.warn(`[lead] turnstile recusou: ${(dados['error-codes'] ?? []).join(',')}`);
      return false;
    }
    return true;
  } catch (e) {
    // A Cloudflare fora do ar não pode derrubar a captação junto.
    console.error('[lead] siteverify inalcançável, seguindo sem verificar', e);
    return true;
  }
}

/**
 * Handler único, de propósito.
 *
 * Exportar `onRequest` e `onRequestPost` no mesmo arquivo faria a rota depender
 * de uma precedência que a documentação não garante — e `next()` daqui cai no
 * asset estático, não no outro handler. Um handler só, com o método conferido
 * na mão, é determinístico: GET, OPTIONS, PUT e o resto levam 403.
 *
 * Recusar o OPTIONS é intencional. Sem preflight respondido, o navegador nem
 * chega a mandar POST de outra origem — e o proxy existe justamente para isso.
 */
export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  if (request.method !== 'POST') return recusa(403, 'método não permitido');
  const permitidas = origensPermitidas(request, env);
  if (!mesmaOrigem(request, permitidas)) return recusa(403, 'origem não permitida');

  const destino = env.LEAD_WEBHOOK_URL;
  if (!destino) {
    // Erro de configuração, não da pessoa. Não vaza qual variável falta.
    console.error('[lead] LEAD_WEBHOOK_URL não configurada no projeto Pages');
    return recusa(503, 'captação indisponível');
  }

  // Corpo grande é barrado antes de virar objeto.
  const cru = await request.text();
  if (cru.length > MAX.corpo) return recusa(413, 'corpo grande demais');

  let dados: Record<string, unknown>;
  try {
    dados = JSON.parse(cru);
  } catch {
    return recusa(400, 'json inválido');
  }
  if (!dados || typeof dados !== 'object' || Array.isArray(dados)) {
    return recusa(400, 'json inválido');
  }

  const formulario = texto(dados.formulario, 40) as Formulario;
  if (!FORMULARIOS.includes(formulario)) return recusa(400, 'formulário desconhecido');

  const email = texto(dados.email, MAX.email).toLowerCase();
  if (!email || !RE_EMAIL.test(email)) return recusa(400, 'e-mail inválido');

  const nome = texto(dados.nome, MAX.nome);
  if (EXIGE_NOME[formulario] && !nome) return recusa(400, 'nome obrigatório');

  // Telefone é opcional em todo formulário: perder o lead de quem não quer dar
  // o número é pior que não ter o número. Se veio, tem que ser DDD + 8 ou 9.
  const telefone = texto(dados.telefone, MAX.telefone).replace(/\D/g, '').slice(0, 11);
  if (telefone && telefone.length !== 10 && telefone.length !== 11) {
    return recusa(400, 'telefone inválido');
  }

  // Antes de qualquer coisa que custe: o token prova que veio de um navegador
  // com gente atrás. É a defesa que o rate limit de 10s não dá.
  const ip = request.headers.get('CF-Connecting-IP') ?? '';
  const token = texto(dados.turnstileToken, MAX.turnstile);
  if (!(await turnstileOk(token, ip, env, formulario))) {
    return recusa(403, 'verificação anti-robô falhou');
  }

  const origem = texto(dados.origem, MAX.origem) || formulario;
  const contexto = texto(dados.contexto, MAX.contexto);
  const lista = texto(dados.lista, MAX.lista);
  const eventId = texto(dados.eventId, MAX.eventId);
  const rota = texto(dados.rota, MAX.rota);
  // A URL completa, com o estado do funil na query. É com ela que o Hermes
  // remonta os números para montar o e-mail de diagnóstico.
  const contextoUrl = urlDeContexto(dados.contextoUrl, permitidas);

  // O contrato do n8n, EXATAMENTE como o pipeline consome hoje. `ts` e
  // `dedupe_key` são reconstruídos aqui e não aceitos do cliente: derivado que
  // vem de fora é derivado que dá para forjar.
  const payload = {
    email,
    name: nome,
    phone: telefone,

    origin: origem,
    event_type: 'web_lead',
    product: formulario,
    list: lista,
    ts: Math.floor(Date.now() / 1000),
    dedupe_key: `${email}:${formulario}`,

    formulario,
    origem,
    ...(contexto ? { contexto } : {}),

    custom: {
      event_id: eventId,
      rota,
      formulario,
      ...(contexto ? { contexto } : {}),
      ...(contextoUrl ? { contexto_url: contextoUrl } : {}),
      // De onde o lead entrou de verdade, para auditoria no Hermes.
      ip,
      pais: (request as { cf?: { country?: string } }).cf?.country ?? '',
    },
  };

  try {
    const r = await fetch(destino, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10_000),
    });
    if (!r.ok) {
      console.error(`[lead] n8n respondeu ${r.status}`);
      return recusa(502, 'não foi possível registrar agora');
    }
  } catch (e) {
    console.error('[lead] falha ao alcançar o n8n', e);
    return recusa(502, 'não foi possível registrar agora');
  }

  // 202: aceito para processamento. O corpo do n8n NÃO é repassado — o que ele
  // devolve é assunto interno e não deve virar superfície pública.
  return new Response(null, { status: 202, headers: { 'Cache-Control': 'no-store' } });
};
