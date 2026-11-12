// Monta o que as checagens leem: o catálogo e, para cada app com dist/, o domínio (site do astro.config.mjs), as
// páginas HTML geradas e as URLs do sitemap.xml. Roda depois do `pnpm build`.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

// Onde moram os apps (docs/padroes.md): um por domínio em apps/, uma LP por subdomínio em lps/academy/.
const PASTAS_DE_APPS = ['apps', 'lps/academy'];

function arquivosHtml(pasta) {
  const lista = [];
  for (const nome of readdirSync(pasta)) {
    const caminho = join(pasta, nome);
    if (statSync(caminho).isDirectory()) lista.push(...arquivosHtml(caminho));
    else if (nome.endsWith('.html')) lista.push(caminho);
  }
  return lista;
}

/** Caminho público da página: dist/kit/lead/index.html → /kit/lead/; dist/404.html → /404.html. */
export function caminhoDaPagina(dist, arquivo) {
  const rel = relative(dist, arquivo).split(sep).join('/');
  if (rel === 'index.html') return '/';
  if (rel.endsWith('/index.html')) return `/${rel.slice(0, -'index.html'.length)}`;
  return `/${rel}`;
}

/** `site` do astro.config.mjs (o domínio do canonical). */
export function siteDoApp(pastaApp) {
  for (const nome of ['astro.config.mjs', 'astro.config.js', 'astro.config.ts']) {
    const arquivo = join(pastaApp, nome);
    if (!existsSync(arquivo)) continue;
    const site = readFileSync(arquivo, 'utf8').match(/\bsite\s*:\s*['"]([^'"]+)['"]/)?.[1];
    if (site) return site;
  }
  return undefined;
}

export function urlsDoSitemap(xml) {
  return [...String(xml).matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);
}

export function lerCatalogo(raiz = RAIZ) {
  return JSON.parse(readFileSync(join(raiz, 'catalogo/sites.json'), 'utf8'));
}

/**
 * { raiz, catalogo, apps: [{ app, site, dist, sitemap, robots, paginas: [{ arquivo, caminho, url, html }] }] }.
 * `apps` filtra pelas pastas pedidas (ex.: ['apps/stratai']).
 */
export function montarContexto({ raiz = RAIZ, apps: filtro } = {}) {
  const catalogo = lerCatalogo(raiz);
  const apps = [];
  for (const base of PASTAS_DE_APPS) {
    const pastaBase = join(raiz, base);
    if (!existsSync(pastaBase)) continue;
    for (const nome of readdirSync(pastaBase).sort()) {
      const app = `${base}/${nome}`;
      const pasta = join(raiz, app);
      const dist = join(pasta, 'dist');
      if (!statSync(pasta).isDirectory() || !existsSync(dist)) continue;
      if (filtro?.length && !filtro.includes(app)) continue;
      const site = siteDoApp(pasta);
      const ler = (f) => (existsSync(join(dist, f)) ? readFileSync(join(dist, f), 'utf8') : undefined);
      const paginas = arquivosHtml(dist)
        .sort()
        .map((arquivo) => {
          const caminho = caminhoDaPagina(dist, arquivo);
          return { arquivo, caminho, url: site ? new URL(caminho, site).href : caminho, html: readFileSync(arquivo, 'utf8') };
        });
      const sitemap = ler('sitemap.xml');
      apps.push({ app, site, dist, paginas, sitemap: sitemap === undefined ? undefined : urlsDoSitemap(sitemap), robots: ler('robots.txt') });
    }
  }
  return { raiz, catalogo, apps };
}

/** Página de erro (404.html): fica fora do catálogo, do sitemap e do tracking. */
export const ehPaginaDeErro = (pagina) => /^\/(404|500)(\.html|\/)$/.test(pagina.caminho);
