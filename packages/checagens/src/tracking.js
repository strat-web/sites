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

/** Compara o HTML de uma página com o plano do catálogo. Devolve os slugs do Rastro usados. */
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
  return linha.rastro_slug && linha.consentimento !== 'sem-tracking' ? [linha.rastro_slug] : [];
}

/** O Rastro responde known:true para slug cadastrado (web_products); slug desconhecido cai no pixel da Strat sem erro. */
export async function slugConhecido(slug, buscar = fetch) {
  const resposta = await buscar(`${RASTRO}?product=${encodeURIComponent(slug)}`, { signal: AbortSignal.timeout(15000) });
  if (!resposta.ok) throw new Error(`o Rastro respondeu ${resposta.status}`);
  const corpo = await resposta.text();
  const known = corpo.match(/"known"\s*:\s*(true|false)/)?.[1];
  if (!known) throw new Error('a resposta do Rastro não traz "known"');
  return known === 'true';
}

export async function checarTracking(ctx, { semRede = false, buscar = fetch } = {}) {
  const r = resultado();
  const slugs = new Map();
  for (const app of ctx.apps) {
    for (const pagina of app.paginas) {
      if (ehPaginaDeErro(pagina)) continue;
      for (const slug of checarPaginaTracking(pagina, ctx.catalogo, r)) {
        if (!slugs.has(slug)) slugs.set(slug, []);
        slugs.get(slug).push(pagina.url);
      }
    }
  }
  if (semRede) {
    if (slugs.size) r.aviso('Rastro', `slugs não conferidos (--sem-rede): ${[...slugs.keys()].join(', ')}`);
    return r;
  }
  for (const [slug, paginas] of slugs) {
    try {
      if (!(await slugConhecido(slug, buscar))) {
        r.erro(paginas.join(', '), `o Rastro não conhece o produto "${slug}" (known: false): cadastre em web_products antes de publicar`);
      }
    } catch (e) {
      r.erro(`Rastro (${slug})`, `não deu para conferir o slug: ${e.message}`);
    }
  }
  return r;
}
