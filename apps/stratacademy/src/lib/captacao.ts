// ============================================================
// Captação de lead — o ÚNICO lugar do site que sabe para onde o lead vai.
//
// ⚠️  ESTE DESTINO VAI MUDAR.
//
// Todo formulário de captação do site vai migrar para o Hermes (repo horus-os),
// que ainda não está definido. Quando isso acontecer, o cliente provavelmente
// nem muda: quem conhece o destino real é a Function em `functions/api/lead.ts`,
// e a troca é lá + na variável `LEAD_WEBHOOK_URL` do projeto Pages.
//
// Aqui dentro fica só o que o navegador precisa saber. Nenhum componente monta
// payload, nenhum componente conhece URL. Se você está prestes a escrever um
// `fetch` de lead em outro arquivo, pare e chame `enviarLead`.
//
// Quem já usa: components/NewsletterRubik.astro e components/FunilTool.astro
// (via scripts/funil.ts). Ao acrescentar um formulário novo, acrescente também o
// identificador dele em `Formulario` — é por esse campo que o sistema novo vai
// rotear lista e disparo.
// ============================================================

/** De qual formulário do site o lead veio. O sistema novo roteia por aqui. */
export type Formulario = 'newsletter' | 'diagnostico-funil';

export interface DadosLead {
  email: string;
  /** Opcional em todo formulário: nome ausente nunca deve custar o lead. */
  nome?: string;
  /** Idem. Só dígitos ou já formatado — normalizamos aqui. */
  telefone?: string;
  formulario: Formulario;
  /** Rótulo livre de onde no site o formulário estava (ex.: 'folha-funil'). */
  origem: string;
  /** Contexto da captação, quando o formulário tem mais de um (ex.: 'relatorio'). */
  contexto?: string;
  /** Lista de destino, quando o formulário já sabe qual é. */
  lista?: string;
  /** id do evento de tracking, para deduplicar entre PostHog/Meta e o CRM. */
  eventId?: string;
  /** Token do Turnstile. Vazio quando o widget não está configurado. */
  turnstileToken?: string;
}

/**
 * A URL completa da página, COM a query string.
 *
 * É o que destrava o e-mail de diagnóstico: os números do funil vivem em
 * `?etapas=Visitantes:10000,Leads:1200&ticket=1200`, e com esse único campo o
 * Hermes remonta o funil inteiro depois, sem precisar que o site mande etapa
 * por etapa. `rota` continua indo separado (só o pathname) porque o fluxo do
 * n8n já lê esse campo.
 *
 * Serve para qualquer formulário, não só o do funil: numa newsletter ela
 * carrega as UTMs da página, que o pathname sozinho perderia.
 */
const urlAtual = () => (typeof location !== 'undefined' ? location.href : '');

export interface ResultadoLead {
  ok: boolean;
  status?: number;
}

/**
 * O destino, do ponto de vista do navegador.
 *
 * É uma rota do próprio site — uma Cloudflare Pages Function em
 * `functions/api/lead.ts`. O navegador NÃO conhece mais a URL do n8n: ela vive
 * na variável `LEAD_WEBHOOK_URL` do projeto Pages, lida no servidor.
 *
 * Isso não é cosmético. Antes, a URL do webhook ia no bundle e o n8n aceitava
 * POST de qualquer origem — dava para inundar o Hermes de um terminal, e cada
 * lead forjado virava disparo de e-mail e WhatsApp. Agora só passa POST com
 * `Origin` do próprio site, e a Function valida antes de encaminhar.
 *
 * Caminho relativo de propósito: funciona igual em produção, no `.pages.dev` e
 * em cada preview de branch, sem variável de ambiente no cliente.
 */
export const ENDPOINT_LEAD = '/api/lead';

/** Só dígitos, no máximo 11 — o que o telefone brasileiro tem. */
export const digitosTelefone = (v: string) => String(v ?? '').replace(/\D/g, '').slice(0, 11);

/** (11) 91234-5678 · (11) 1234-5678 — formata conforme a pessoa digita. */
export function mascaraTelefone(v: string): string {
  const d = digitosTelefone(v);
  if (d.length === 0) return '';
  if (d.length <= 2) return `(${d}`;
  const ddd = d.slice(0, 2);
  const resto = d.slice(2);
  if (resto.length <= 4) return `(${ddd}) ${resto}`;
  const corte = resto.length > 8 ? 5 : 4; // celular tem 9 dígitos, fixo tem 8
  return `(${ddd}) ${resto.slice(0, corte)}-${resto.slice(corte)}`;
}

/** Válido = vazio (é opcional) ou 10/11 dígitos. */
export const telefoneValido = (v: string) => {
  const d = digitosTelefone(v);
  return d.length === 0 || d.length === 10 || d.length === 11;
};

// ------------------------------------------------------------
// Turnstile
//
// O rate limit do plano gratuito do Cloudflare só permite janela de 10s: ele
// para script apressado, não quem envia devagar. O Turnstile é o que fecha essa
// porta — e quem valida o token é a Function, no servidor. Aqui só produzimos.
//
// A site key é PÚBLICA por definição (vai no HTML de qualquer implementação do
// Turnstile). O segredo que valida fica na Function. Sem a variável, tudo isto
// vira no-op e o formulário funciona igual — é o que mantém o dev local e o
// preview de pé sem precisar de chave.
// ------------------------------------------------------------

export const TURNSTILE_KEY: string = import.meta.env.PUBLIC_TURNSTILE_KEY || '';

const URL_TURNSTILE = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

interface ApiTurnstile {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id?: string) => void;
}
const api = () => (window as unknown as { turnstile?: ApiTurnstile }).turnstile;

/** Uma carga só por página, mesmo com vários formulários. */
let carga: Promise<boolean> | null = null;

function carregarScript(): Promise<boolean> {
  if (carga) return carga;
  carga = new Promise<boolean>((resolve) => {
    if (api()) return resolve(true);
    const tag = document.createElement('script');
    tag.src = URL_TURNSTILE;
    tag.async = true;
    tag.defer = true;
    tag.onload = () => resolve(true);
    // Falha de rede ou bloqueador não pode impedir a pessoa de enviar: sem
    // token, a Function decide o que fazer.
    tag.onerror = () => resolve(false);
    document.head.appendChild(tag);
  });
  return carga;
}

interface EstadoWidget {
  id?: string;
  token: string;
  pronto: boolean;
}
const widgets = new WeakMap<HTMLElement, EstadoWidget>();

/**
 * Prepara o widget num contêiner. NÃO espera nada: é chamada na abertura do
 * popup e retorna na hora, para não atrasar em nada a exibição. O script da
 * Cloudflare só é baixado aqui — nunca no carregamento da página, porque o
 * widget não pode existir antes do clique.
 */
export function prepararTurnstile(container: HTMLElement | null): void {
  if (!container || !TURNSTILE_KEY || widgets.has(container)) return;

  const estado: EstadoWidget = { token: '', pronto: false };
  widgets.set(container, estado);

  void carregarScript().then((ok) => {
    const ts = api();
    if (!ok || !ts) {
      estado.pronto = true; // desistiu; segue sem token
      return;
    }
    try {
      estado.id = ts.render(container, {
        sitekey: TURNSTILE_KEY,
        // `interaction-only`: fica invisível e só mostra alguma coisa se o
        // desafio precisar mesmo de um humano. É o modo que não atrapalha.
        appearance: 'interaction-only',
        callback: (token: string) => {
          estado.token = token;
          estado.pronto = true;
        },
        'error-callback': () => {
          estado.token = '';
          estado.pronto = true;
        },
        'expired-callback': () => {
          estado.token = '';
          try { ts.reset(estado.id); } catch { /* widget já removido */ }
        },
      });
    } catch {
      estado.pronto = true;
    }
  });
}

/**
 * O token, se houver. Espera no máximo `esperaMs` — o desafio costuma resolver
 * em menos de um segundo, mas o envio não pode ficar preso se ele travar.
 * Devolve string vazia quando não há Turnstile configurado.
 */
export async function tokenTurnstile(
  container: HTMLElement | null,
  esperaMs = 4000,
): Promise<string> {
  if (!container || !TURNSTILE_KEY) return '';
  const estado = widgets.get(container);
  if (!estado) return '';

  const limite = Date.now() + esperaMs;
  while (!estado.token && !estado.pronto && Date.now() < limite) {
    await new Promise((r) => setTimeout(r, 100));
  }
  return estado.token;
}

/** Token do Turnstile é de uso único: depois de enviar, pede outro. */
export function resetarTurnstile(container: HTMLElement | null): void {
  if (!container) return;
  const estado = widgets.get(container);
  if (!estado?.id) return;
  estado.token = '';
  try { api()?.reset(estado.id); } catch { /* sem problema */ }
}

/**
 * Envia o lead para a Function do site.
 *
 * O corpo aqui é o mínimo semântico. Quem monta o contrato que o n8n consome
 * (`origin`, `event_type`, `product`, `ts`, `dedupe_key`, `custom`) é a Function,
 * no servidor — inclusive `ts` e `dedupe_key`, que são derivados e não devem
 * vir do cliente, onde qualquer um os forja.
 */
export async function enviarLead(dados: DadosLead): Promise<ResultadoLead> {
  if (!ENDPOINT_LEAD) return { ok: false };

  const email = dados.email.trim();
  const telefone = dados.telefone ? digitosTelefone(dados.telefone) : '';
  const eventId = dados.eventId || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

  try {
    const r = await fetch(ENDPOINT_LEAD, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        nome: dados.nome?.trim() || '',
        telefone,
        formulario: dados.formulario,
        origem: dados.origem,
        ...(dados.contexto ? { contexto: dados.contexto } : {}),
        ...(dados.lista ? { lista: dados.lista } : {}),
        eventId,
        rota: typeof location !== 'undefined' ? location.pathname : '',
        contextoUrl: urlAtual(),
        ...(dados.turnstileToken ? { turnstileToken: dados.turnstileToken } : {}),
      }),
    });
    return { ok: r.ok, status: r.status };
  } catch {
    return { ok: false };
  }
}

/**
 * Dispara o evento `Lead` no tracking e devolve o `event_id` para deduplicação.
 * Fica aqui porque todo formulário faz exatamente isto antes de enviar.
 */
export function rastrearLead(origem: string, email: string): string {
  try {
    const rastrear = (window as unknown as {
      stratTrack?: (n: string, p: object, i?: object) => string | null;
    }).stratTrack;
    if (typeof rastrear === 'function') {
      return rastrear('Lead', { origem, rota: location.pathname }, { em: email }) || '';
    }
  } catch { /* tracking nunca bloqueia a entrega do lead */ }
  return '';
}
