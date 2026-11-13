// Monta o que as checagens leem: o catálogo e, para cada app com dist/, o domínio (site do astro.config.mjs), as
// páginas HTML geradas, os .js do build e as URLs do sitemap.xml. Roda depois do `pnpm build`. App sem dist/ não
// some em silêncio: fica em `semDist` e barra (checarApps), senão as checagens passariam sem olhar para ele (WEB-76).
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { resultado } from './resultado.js';

export const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');

// Onde moram os apps (docs/padroes.md): um por domínio em apps/, uma LP por subdomínio em lps/academy/.
const PASTAS_DE_APPS = ['apps', 'lps/academy'];

function arquivosCom(pasta, extensoes) {
  const lista = [];
  for (const nome of readdirSync(pasta)) {
    const caminho = join(pasta, nome);
    if (statSync(caminho).isDirectory()) lista.push(...arquivosCom(caminho, extensoes));
    else if (extensoes.some((e) => nome.endsWith(e))) lista.push(caminho);
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
 * { raiz, catalogo, apps, semDist }.
 * apps: [{ app, site, dist, sitemap, robots, paginas: [{ arquivo, caminho, url, html }], js: [{ arquivo, caminho, conteudo }] }].
 * semDist: os apps (pasta com package.json) que deviam ter sido lidos e não têm dist/; com o filtro, também a pasta
 * pedida que não é app. `apps` filtra pelas pastas pedidas (ex.: ['apps/stratai']).
 */
export function montarContexto({ raiz = RAIZ, apps: filtro } = {}) {
  const catalogo = lerCatalogo(raiz);
  const apps = [];
  const semDist = [];
  const vistos = new Set();
  for (const base of PASTAS_DE_APPS) {
    const pastaBase = join(raiz, base);
    if (!existsSync(pastaBase)) continue;
    for (const nome of readdirSync(pastaBase).sort()) {
      const app = `${base}/${nome}`;
      const pasta = join(raiz, app);
      const dist = join(pasta, 'dist');
      if (!statSync(pasta).isDirectory() || !existsSync(join(pasta, 'package.json'))) continue;
      if (filtro?.length && !filtro.includes(app)) continue;
      vistos.add(app);
      if (!existsSync(dist)) {
        semDist.push(app);
        continue;
      }
      const site = siteDoApp(pasta);
      const ler = (f) => (existsSync(join(dist, f)) ? readFileSync(join(dist, f), 'utf8') : undefined);
      const paginas = arquivosCom(dist, ['.html'])
        .sort()
        .map((arquivo) => {
          const caminho = caminhoDaPagina(dist, arquivo);
          return { arquivo, caminho, url: site ? new URL(caminho, site).href : caminho, html: readFileSync(arquivo, 'utf8') };
        });
      const js = arquivosCom(dist, ['.js', '.mjs'])
        .sort()
        .map((arquivo) => ({ arquivo, caminho: caminhoDaPagina(dist, arquivo), conteudo: readFileSync(arquivo, 'utf8') }));
      const sitemap = ler('sitemap.xml');
      apps.push({ app, site, dist, paginas, js, sitemap: sitemap === undefined ? undefined : urlsDoSitemap(sitemap), robots: ler('robots.txt') });
    }
  }
  for (const pedido of filtro || []) if (!vistos.has(pedido)) semDist.push(pedido);
  return { raiz, catalogo, apps, semDist };
}

/**
 * App sem dist/ barra (WEB-76): na CI, o build empacota o dist/ de cada app e as checagens rodam sobre ele; um app que
 * ficou de fora do pacote passaria verde sem ser olhado. Na máquina, `pnpm build` antes, ou `--app` para olhar só um.
 */
export function checarApps(ctx) {
  const r = resultado();
  for (const app of ctx.semDist || []) {
    const ehApp = PASTAS_DE_APPS.some((b) => app.startsWith(`${b}/`)) && existsSync(join(ctx.raiz, app, 'package.json'));
    if (ehApp) r.erro(app, 'app sem dist/: as checagens não olhariam para ele. Rode `pnpm build` (na CI, confira o pacote do dist/ no job build)');
    else r.erro(app, `não é um app (pasta com package.json em ${PASTAS_DE_APPS.join(' ou ')}/)`);
  }
  return r;
}

/** Página de erro (404.html): fica fora do catálogo, do sitemap e do tracking. */
export const ehPaginaDeErro = (pagina) => /^\/(404|500)(\.html|\/)$/.test(pagina.caminho);
