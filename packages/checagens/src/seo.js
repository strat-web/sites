// Checagem "seo" (docs/padroes.md): título ou H1 repetido, sem canonical, href="#", JSON-LD inválido e página
// indexável fora do sitemap. Também confere que o sitemap não lista página com noindex ou que não existe.
// A página de erro (404.html) não tem canonical próprio nem linha no catálogo: dela só se exige noindex, um <title>,
// um <h1> e ficar fora do sitemap (WEB-75). App sem 404.html barra: sem ela, o Cloudflare Pages responde 200 com a
// home em todo caminho que não existe, e o Google trata como soft 404.
import { ehPaginaDeErro } from './contexto.js';
import { lerPagina, tags } from './html.js';
import { resultado } from './resultado.js';

// Link que não leva a lugar nenhum: o robô não segue e o MetricaaS não atribui (docs/tracking.md).
const LINK_MORTO = /^(#|javascript:.*)?$/i;

export function checarPaginaSeo(pagina, r) {
  const onde = pagina.url;
  const p = lerPagina(pagina.html);

  const titulo = p.titulos[0];
  if (p.titulos.length !== 1 || !titulo) r.erro(onde, `precisa de exatamente um <title> com texto (tem ${p.titulos.length})`);
  if (p.h1s.length !== 1 || !p.h1s[0]) r.erro(onde, `precisa de exatamente um <h1> com texto (tem ${p.h1s.length})`);

  if (!p.canonical) r.erro(onde, 'sem <link rel="canonical">');
  else if (p.canonical !== pagina.url) r.erro(onde, `canonical "${p.canonical}" diferente da URL da página (${pagina.url})`);

  for (const { attrs } of tags(pagina.html, 'a')) {
    if ('href' in attrs && LINK_MORTO.test(attrs.href.trim())) {
      r.erro(onde, `link sem destino: <a href="${attrs.href}">. Use o endereço de verdade (wa.me, âncora com id ou página)`);
    }
  }

  for (const s of p.scripts.filter((s) => (s.attrs.type || '').toLowerCase() === 'application/ld+json')) {
    let dados;
    try {
      dados = JSON.parse(s.conteudo);
    } catch (e) {
      r.erro(onde, `JSON-LD que não é JSON: ${e.message}`);
      continue;
    }
    for (const item of Array.isArray(dados) ? dados : [dados]) {
      if (!/schema\.org/.test(JSON.stringify(item?.['@context'] ?? ''))) r.erro(onde, 'JSON-LD sem "@context": "https://schema.org"');
      if (!item?.['@type'] && !item?.['@graph']) r.erro(onde, 'JSON-LD sem "@type"');
    }
  }
  return { titulo, h1: p.h1s[0], noindex: p.noindex };
}

/** Página de erro: noindex, exatamente um <title> e um <h1>. Título e H1 dela não contam como repetidos. */
export function checarPaginaDeErroSeo(pagina, r) {
  const p = lerPagina(pagina.html);
  if (!p.noindex) r.erro(pagina.url, 'página de erro sem noindex: use o <PaginaNaoEncontrada> do kit');
  if (p.titulos.length !== 1 || !p.titulos[0]) r.erro(pagina.url, `precisa de exatamente um <title> com texto (tem ${p.titulos.length})`);
  if (p.h1s.length !== 1 || !p.h1s[0]) r.erro(pagina.url, `precisa de exatamente um <h1> com texto (tem ${p.h1s.length})`);
  for (const { attrs } of tags(pagina.html, 'a')) {
    if ('href' in attrs && LINK_MORTO.test(attrs.href.trim())) r.erro(pagina.url, `link sem destino: <a href="${attrs.href}">`);
  }
}

export function checarSeo(ctx) {
  const r = resultado();
  for (const app of ctx.apps) {
    const titulos = new Map();
    const h1s = new Map();
    const indexaveis = new Set();
    const existentes = new Set();
    for (const pagina of app.paginas) {
      if (ehPaginaDeErro(pagina)) {
        checarPaginaDeErroSeo(pagina, r);
        continue;
      }
      existentes.add(pagina.url);
      const { titulo, h1, noindex } = checarPaginaSeo(pagina, r);
      if (titulo) {
        if (titulos.has(titulo)) r.erro(pagina.url, `título repetido com ${titulos.get(titulo)}: "${titulo}"`);
        else titulos.set(titulo, pagina.url);
      }
      if (h1) {
        if (h1s.has(h1)) r.erro(pagina.url, `H1 repetido com ${h1s.get(h1)}: "${h1}"`);
        else h1s.set(h1, pagina.url);
      }
      if (!noindex) indexaveis.add(pagina.url);
    }

    if (!app.paginas.some((p) => p.caminho === '/404.html')) {
      r.erro(app.app, 'dist/ sem 404.html: sem ela, o Pages responde 200 com a home em caminho que não existe (soft 404). Crie src/pages/404.astro com o <PaginaNaoEncontrada> do kit');
    }
    if (!app.sitemap) {
      r.erro(app.app, 'dist/ sem sitemap.xml (o kit gera no build: arquivosDoSite no astro.config.mjs)');
      continue;
    }
    if (!app.robots) r.erro(app.app, 'dist/ sem robots.txt (o kit gera no build: arquivosDoSite no astro.config.mjs)');
    const noSitemap = new Set(app.sitemap);
    for (const url of indexaveis) if (!noSitemap.has(url)) r.erro(url, 'página indexável fora do sitemap.xml (falta `indexar: true` no catálogo?)');
    for (const url of noSitemap) {
      if (ehPaginaDeErro({ caminho: new URL(url).pathname })) r.erro(url, 'página de erro no sitemap.xml: a 404 nunca entra');
      else if (!existentes.has(url)) r.erro(url, 'está no sitemap.xml, mas a página não existe no build');
      else if (!indexaveis.has(url)) r.erro(url, 'está no sitemap.xml, mas a página tem noindex');
    }
  }
  return r;
}
