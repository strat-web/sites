// Checagem "tracking" (docs/tracking.md, D7): página sem <Tracking>, script de tracking a mais ou faltando, pixel ou
// gtag colado à mão (no HTML, em <noscript> ou num .js do build), m.js fora do lugar (ordem, defer e type) e slug que
// o Rastro não conhece. O esperado de cada página sai da mesma regra do componente (planoDeTracking do kit), lida da
// linha do catálogo; a checagem compara com o HTML gerado.
import { HOTMART_LAUNCHER, METRICAAS, RASTRO, UMAMI, planoDeTracking } from '@strat/kit';
import { ehPaginaDeErro } from './contexto.js';
import { lerPagina } from './html.js';
import { ESQUELETOS } from './esqueletos.js';
import { resultado } from './resultado.js';

// Ninguém cola pixel, gtag ou GTM à mão: o Rastro injeta e daria evento em dobro (regra dura 2 do CLAUDE.md).
const COLADO_A_MAO = [
  [/connect\.facebook\.net/i, 'pixel da Meta'],
  [/\bfbq\s*\(/, 'pixel da Meta (fbq)'],
  [/facebook\.com\/tr(?![\w-])/i, 'pixel da Meta (imagem facebook.com/tr)'],
  [/googletagmanager\.com/i, 'gtag ou GTM'],
  [/google-analytics\.com/i, 'Google Analytics'],
  [/\bgtag\s*\(/, 'gtag'],
  [/analytics\.tiktok\.com/i, 'pixel do TikTok'],
];

const ATRIBUTOS = ['data-ws', 'data-pixel', 'data-pixel-consent', 'data-website-id'];

/** Script que é do componente <Tracking> (Rastro, MetricaaS, Umami ou launcher da Hotmart). */
export function ehScriptDeTracking(s) {
  const src = s.attrs.src || '';
  return (
    src.startsWith(RASTRO) ||
    src === METRICAAS ||
    src === UMAMI ||
    s.attrs.id === 'hotmart_launcher_script' ||
    s.conteudo.includes(HOTMART_LAUNCHER)
  );
}

const descrever = (s) => (s.attrs.src ? s.attrs.src : `<script id="${s.attrs.id || ''}"> inline`);

const coladoAMao = (texto) => COLADO_A_MAO.filter(([re]) => re.test(texto)).map(([, nome]) => nome);

// type que o navegador executa como JavaScript clássico. "module" também executa, mas muda a ordem e pede CORS; um
// type qualquer (text/plain de gerenciador de consentimento, por exemplo) não executa: script presente e morto.
const TIPOS_CLASSICOS = ['', 'text/javascript', 'application/javascript', 'text/ecmascript', 'application/ecmascript'];
const tipo = (s) => (s.attrs.type ?? '').trim().toLowerCase();
/** Script que o navegador executa (fica de fora o bloco de dados: JSON-LD, JSON, importmap, speculationrules). */
export const executa = (s) => TIPOS_CLASSICOS.includes(tipo(s)) || tipo(s) === 'module';

/**
 * Como o m.js entra (regra dura do lead, docs/tracking.md): no <head>, `defer`, sem `async`, JavaScript clássico e antes
 * de qualquer outro script que executa. Devolve a lista de problemas (vazia quando está certo).
 */
export function problemasDoMjs(mjs, scripts, fimDoHead = Infinity) {
  const p = [];
  if (!('defer' in mjs.attrs)) p.push('sem defer');
  if ('async' in mjs.attrs) p.push('com async (a ordem deixa de ser garantida)');
  if (!TIPOS_CLASSICOS.includes(tipo(mjs))) p.push(`com type="${mjs.attrs.type}" (só JavaScript clássico, sem type)`);
  if (mjs.inicio !== undefined && mjs.inicio > fimDoHead) p.push('fora do <head>');
  const antes = scripts.filter((s) => s !== mjs && executa(s) && s.inicio !== undefined && mjs.inicio !== undefined && s.inicio < mjs.inicio);
  if (antes.length) p.push(`depois de ${antes.map(descrever).join(', ')} (o m.js vem antes de todo script)`);
  return p;
}

/** Compara o HTML de uma página com o plano do catálogo. Devolve [{ slug, linha }] do Rastro usado. */
export function checarPaginaTracking(pagina, catalogo, r) {
  const onde = pagina.url;
  const { scripts, noindex, noscripts, fimDoHead } = lerPagina(pagina.html);

  for (const s of scripts) {
    for (const nome of coladoAMao(`${s.attrs.src || ''}\n${s.conteudo}`)) {
      r.erro(onde, `${nome} colado à mão em ${descrever(s)}: tracking só pelo <Tracking> do kit`);
    }
  }
  for (const n of noscripts) {
    for (const nome of coladoAMao(n)) r.erro(onde, `${nome} colado à mão em <noscript>: tracking só pelo <Tracking> do kit`);
  }

  const reais = scripts.filter(ehScriptDeTracking);

  if (ESQUELETOS[onde]) {
    const item = ESQUELETOS[onde];
    if (reais.length) r.erro(onde, `já carrega tracking: a migração (${item}) tem de tirar a URL de packages/checagens/src/esqueletos.js`);
    else if (!noindex) r.erro(onde, `esqueleto (até o ${item}) precisa de noindex: a página real ainda está na hospedagem antiga`);
    return [];
  }

  const linha = (catalogo.urls || []).find((l) => l.url === onde);
  if (!linha) return []; // a checagem catalogo acusa
  let plano;
  try {
    plano = planoDeTracking({ catalogo, url: onde, perfil: linha.perfil });
  } catch (e) {
    r.erro(onde, e.message.replace(/^\[kit\] Tracking em \S+: /, ''));
    return [];
  }
  for (const aviso of plano.avisos) r.aviso(onde, aviso);

  const esperados = plano.scripts.map((s) => ({ src: s.src, attrs: s.attrs }));
  const sobra = [...reais];
  for (const e of esperados) {
    const i = sobra.findIndex((s) => s.attrs.src === e.src);
    if (i < 0) {
      r.erro(onde, `falta ${e.src}: a página não usa o <Tracking> do kit (perfil "${linha.perfil}" no Layout)`);
      continue;
    }
    const [achado] = sobra.splice(i, 1);
    for (const a of ATRIBUTOS) {
      const quer = e.attrs[a];
      const tem = achado.attrs[a];
      if ((quer ?? null) !== (tem ?? null)) r.erro(onde, `${e.src}: ${a}="${tem ?? ''}", mas o catálogo pede "${quer ?? ''}"`);
    }
    if (e.src === METRICAAS) {
      for (const p of problemasDoMjs(achado, scripts, fimDoHead)) r.erro(onde, `m.js ${p}: o código do WhatsApp chegaria tarde (regra dura do lead)`);
    } else if (!TIPOS_CLASSICOS.includes(tipo(achado))) {
      r.erro(onde, `${e.src} com type="${achado.attrs.type}": o navegador não executa como o <Tracking> do kit desenha`);
    }
  }
  if (plano.hotmart) {
    const i = sobra.findIndex((s) => s.attrs.id === 'hotmart_launcher_script');
    if (i < 0) r.erro(onde, 'perfil venda sem o launcher da Hotmart do <Tracking>');
    else sobra.splice(i, 1);
  }
  for (const s of sobra) r.erro(onde, `script de tracking que o catálogo não pede (colado à mão ou em dobro): ${descrever(s)}`);

  if (esperados.length && !linha.umami_website_id) {
    r.aviso(onde, 'sem umami_website_id no catálogo: a página não mede no Umami (o id vem do Strat Tracking)');
  }
  return linha.rastro_slug && !['sem-tracking', 'por-funil'].includes(linha.consentimento) ? [{ slug: linha.rastro_slug, linha }] : [];
}

// O Rastro fora do ar (rede, tempo esgotado, 5xx, 429) não pode deixar todo PR vermelho por uma oscilação: o /sa é
// perguntado de novo antes de barrar (WEB-76). Resposta 4xx não muda na segunda vez, então não tem nova tentativa.
export const TENTATIVAS_DO_RASTRO = 3;
export const PAUSAS_DO_RASTRO = [3000, 10000];
const pausa = (ms) => new Promise((ok) => setTimeout(ok, ms));

class FalhaDoRastro extends Error {
  constructor(msg, temporaria) {
    super(msg);
    this.temporaria = temporaria;
  }
}

async function lerRastroUmaVez(slug, buscar) {
  let resposta;
  try {
    resposta = await buscar(`${RASTRO}?product=${encodeURIComponent(slug)}`, { signal: AbortSignal.timeout(15000) });
  } catch (e) {
    throw new FalhaDoRastro(`o Rastro não respondeu (${e.name === 'TimeoutError' ? 'mais de 15 s' : e.message})`, true);
  }
  if (!resposta.ok) {
    const temporaria = resposta.status >= 500 || resposta.status === 408 || resposta.status === 429;
    throw new FalhaDoRastro(`o Rastro respondeu ${resposta.status}`, temporaria);
  }
  let corpo;
  try {
    corpo = await resposta.text();
  } catch (e) {
    throw new FalhaDoRastro(`a resposta do Rastro caiu no meio (${e.message})`, true);
  }
  const json = corpo.match(/\bCFG\s*=\s*(\{[^;]*\})\s*;/)?.[1];
  let cfg;
  try {
    cfg = json && JSON.parse(json);
  } catch {
    cfg = undefined;
  }
  // Sem "known" costuma ser página de erro do proxy com 200 (deploy do Rastro no meio): vale tentar de novo.
  if (typeof cfg?.known !== 'boolean') throw new FalhaDoRastro('a resposta do Rastro não traz "known"', true);
  return cfg;
}

/**
 * Lê a configuração (CFG) que o script do Rastro entrega para o produto: known, pixel, GA4, Google e consentMode.
 * Falha temporária ganha nova tentativa (`tentativas`, com as `pausas` entre elas); a última falha sobe com
 * `tentativas` no erro, para o log dizer quantas vezes perguntou.
 */
export async function lerRastro(slug, buscar = fetch, { tentativas = TENTATIVAS_DO_RASTRO, pausas = PAUSAS_DO_RASTRO, esperar = pausa } = {}) {
  for (let n = 1; ; n++) {
    try {
      return await lerRastroUmaVez(slug, buscar);
    } catch (e) {
      if (!e.temporaria || n >= tentativas) {
        e.tentativas = n;
        throw e;
      }
      await esperar(pausas[Math.min(n - 1, pausas.length - 1)] ?? 0);
    }
  }
}

/** O Rastro responde known:true para slug cadastrado (web_products); slug desconhecido cai no pixel da Strat sem erro. */
export async function slugConhecido(slug, buscar = fetch) {
  return (await lerRastro(slug, buscar)).known;
}

const vazio = (v) => (v === '' || v === undefined ? null : v);

/**
 * O que o produto no Rastro faz de diferente do que a linha do catálogo pede (pedido do Helbert no repasse do WEB-69):
 * o pixel e o GA4 que ele injeta, a tag do Google (googleTagId ou googleAdsId) e o consentMode. Só compara o campo que
 * o Rastro manda. Hoje o kit ainda recusa "banner" com Rastro no build, então aqui sobra off × soft, ao pé da letra.
 * A regra do WEB-72 é "banner" no catálogo = "strict" no Rastro; levar isso para o kit e para cá é o WEB-81.
 */
export function diferencasDoRastro(cfg, linha) {
  const difs = [];
  const comparar = (campoRastro, quer, nome) => {
    if (!(campoRastro in cfg)) return;
    const tem = vazio(cfg[campoRastro]);
    if ((quer ?? null) !== tem) difs.push(`${nome}: o Rastro injeta "${tem ?? ''}", o catálogo pede "${quer ?? ''}"`);
  };
  comparar('metaPixelId', linha.meta_pixel, 'pixel da Meta');
  comparar('ga4Id', linha.ga4, 'GA4');
  if ('googleTagId' in cfg || 'googleAdsId' in cfg) {
    const doRastro = [vazio(cfg.googleTagId), vazio(cfg.googleAdsId)].filter(Boolean);
    const quer = linha.google_tag ?? null;
    const ok = quer ? doRastro.includes(quer) && doRastro.length === 1 : doRastro.length === 0;
    if (!ok) difs.push(`tag do Google: o Rastro injeta "${doRastro.join(', ')}", o catálogo pede "${quer ?? ''}"`);
  }
  if ('consentMode' in cfg && cfg.consentMode !== linha.consentimento) {
    difs.push(`consentimento: o produto está em consentMode "${cfg.consentMode}", o catálogo diz "${linha.consentimento}"`);
  }
  return difs;
}

/** Pixel, gtag ou GTM dentro de um .js do build (script local, chunk do Astro, arquivo de public/): também é colado à mão. */
export function checarJsDoBuild(app, r) {
  for (const js of app.js || []) {
    for (const nome of coladoAMao(js.conteudo)) {
      r.erro(js.arquivo, `${nome} colado à mão em ${js.caminho} (.js do build): tracking só pelo <Tracking> do kit`);
    }
  }
}

export async function checarTracking(ctx, { semRede = false, buscar = fetch, tentativas = TENTATIVAS_DO_RASTRO, pausas, esperar } = {}) {
  const r = resultado();
  const slugs = new Map();
  for (const app of ctx.apps) {
    checarJsDoBuild(app, r);
    for (const pagina of app.paginas) {
      if (ehPaginaDeErro(pagina)) continue;
      for (const { slug, linha } of checarPaginaTracking(pagina, ctx.catalogo, r)) {
        if (!slugs.has(slug)) slugs.set(slug, []);
        slugs.get(slug).push({ url: pagina.url, linha });
      }
    }
  }
  if (semRede) {
    if (slugs.size) r.aviso('Rastro', `slugs não conferidos (--sem-rede): ${[...slugs.keys()].join(', ')}`);
    return r;
  }
  // Se um slug esgotou as tentativas por falha temporária, o Rastro está fora: os próximos levam uma tentativa só,
  // para o job não ficar minutos esperando a mesma queda. Continua barrando: sem resposta, nada foi conferido.
  let foraDoAr = false;
  for (const [slug, paginas] of slugs) {
    let cfg;
    try {
      cfg = await lerRastro(slug, buscar, { tentativas: foraDoAr ? 1 : tentativas, pausas, esperar });
    } catch (e) {
      if (e.temporaria) foraDoAr = true;
      const vezes = e.tentativas > 1 ? ` (${e.tentativas} tentativas)` : '';
      const dica = e.temporaria ? ': o Rastro parece fora do ar, rode o job de novo quando ele voltar' : '';
      r.erro(`Rastro (${slug})`, `não deu para conferir o slug: ${e.message}${vezes}${dica}`);
      continue;
    }
    if (!cfg.known) {
      r.erro(paginas.map((p) => p.url).join(', '), `o Rastro não conhece o produto "${slug}" (known: false): cadastre em web_products antes de publicar`);
      continue;
    }
    for (const { url, linha } of paginas) {
      for (const d of diferencasDoRastro(cfg, linha)) r.erro(url, `produto "${slug}" no Rastro × catálogo, ${d}`);
    }
  }
  return r;
}
