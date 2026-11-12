// Checagem "tracking" (docs/tracking.md, D7): página sem <Tracking>, script de tracking a mais ou faltando, pixel ou
// gtag colado à mão e slug que o Rastro não conhece. O esperado de cada página sai da mesma regra do componente
// (planoDeTracking do kit), lida da linha do catálogo; a checagem compara com o HTML gerado.
import { HOTMART_LAUNCHER, METRICAAS, RASTRO, UMAMI, planoDeTracking } from '@strat/kit';
import { ehPaginaDeErro } from './contexto.js';
import { lerPagina } from './html.js';
import { ESQUELETOS } from './esqueletos.js';
import { resultado } from './resultado.js';

// Ninguém cola pixel, gtag ou GTM à mão: o Rastro injeta e daria evento em dobro (regra dura 2 do CLAUDE.md).
const COLADO_A_MAO = [
  [/connect\.facebook\.net/i, 'pixel da Meta'],
  [/\bfbq\s*\(/, 'pixel da Meta (fbq)'],
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

/** Compara o HTML de uma página com o plano do catálogo. Devolve [{ slug, linha }] do Rastro usado. */
export function checarPaginaTracking(pagina, catalogo, r) {
  const onde = pagina.url;
  const { scripts, noindex } = lerPagina(pagina.html);

  for (const s of scripts) {
    const texto = `${s.attrs.src || ''}\n${s.conteudo}`;
    for (const [re, nome] of COLADO_A_MAO) {
      if (re.test(texto)) r.erro(onde, `${nome} colado à mão em ${descrever(s)}: tracking só pelo <Tracking> do kit`);
    }
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

/** Lê a configuração (CFG) que o script do Rastro entrega para o produto: known, pixel, GA4, Google e consentMode. */
export async function lerRastro(slug, buscar = fetch) {
  const resposta = await buscar(`${RASTRO}?product=${encodeURIComponent(slug)}`, { signal: AbortSignal.timeout(15000) });
  if (!resposta.ok) throw new Error(`o Rastro respondeu ${resposta.status}`);
  const corpo = await resposta.text();
  const json = corpo.match(/\bCFG\s*=\s*(\{[^;]*\})\s*;/)?.[1];
  let cfg;
  try {
    cfg = json && JSON.parse(json);
  } catch {
    cfg = undefined;
  }
  if (typeof cfg?.known !== 'boolean') throw new Error('a resposta do Rastro não traz "known"');
  return cfg;
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

export async function checarTracking(ctx, { semRede = false, buscar = fetch } = {}) {
  const r = resultado();
  const slugs = new Map();
  for (const app of ctx.apps) {
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
  for (const [slug, paginas] of slugs) {
    let cfg;
    try {
      cfg = await lerRastro(slug, buscar);
    } catch (e) {
      r.erro(`Rastro (${slug})`, `não deu para conferir o slug: ${e.message}`);
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
