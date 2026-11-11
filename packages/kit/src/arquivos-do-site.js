// sitemap.xml, robots.txt e llms.txt de cada app, gerados no fim do build a partir do catálogo (WEB-18), e o
// _headers do Cloudflare Pages com os cabeçalhos de segurança e o noindex do *.pages.dev (WEB-21).
//
// Uso no astro.config.mjs do app:
//   import { arquivosDoSite } from '@strat/kit';
//   integrations: [arquivosDoSite({ app: 'apps/stratai' })]
//
// Regra de "página indexável": a URL tem linha no catalogo/sites.json com `indexar: true` E o HTML gerado não
// traz `noindex` no <meta name="robots">. As duas coisas precisam concordar; na dúvida, fica fora do sitemap.

import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { marcas as MARCAS } from './marcas.js';
import { montarHeaders } from './cabecalhos.js';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '../../..');
const ARQUIVOS = ['sitemap.xml', 'robots.txt', 'llms.txt', '_headers'];

// Robôs que leem e citam a página nas respostas de IA (docs/seo-geo.md). Três papéis: *Bot rastreia,
// *-SearchBot monta o índice do assistente, *-User busca a página na hora porque alguém perguntou.
export const ROBOS_DE_IA = [
  'GPTBot',
  'OAI-SearchBot',
  'ChatGPT-User',
  'ClaudeBot',
  'Claude-SearchBot',
  'Claude-User',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'Applebot-Extended',
  'Bingbot',
];

// URLs do catalogo/sites.json; nome, resumo e contato de cada marca vêm do src/marcas.js (WEB-16).
export function lerCatalogo(raiz = RAIZ) {
  const sites = JSON.parse(readFileSync(resolve(raiz, 'catalogo/sites.json'), 'utf8'));
  return { urls: sites.urls, marcas: MARCAS };
}

const enderecoEmTexto = (e) =>
  e && [e.streetAddress, `${e.addressLocality}/${e.addressRegion}`, e.postalCode].filter(Boolean).join(', ');

const escaparXml = (t) =>
  String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

const decodificarHtml = (t) =>
  t
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .trim();

/** Lê do HTML gerado o que interessa: noindex, título e descrição. */
export function lerHtml(html) {
  const metas = [...html.matchAll(/<meta\b[^>]*>/gi)].map((m) => m[0]);
  const attr = (tag, nome) => tag.match(new RegExp(`\\b${nome}\\s*=\\s*("([^"]*)"|'([^']*)')`, 'i'))?.slice(2).find((v) => v !== undefined);
  const meta = (nome) => {
    const tag = metas.find((t) => (attr(t, 'name') || '').toLowerCase() === nome);
    return tag ? attr(tag, 'content') : undefined;
  };
  const robots = (meta('robots') || '').toLowerCase();
  const titulo = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1];
  const descricao = meta('description');
  return {
    noindex: /\b(noindex|none)\b/.test(robots),
    titulo: titulo ? decodificarHtml(titulo) : undefined,
    descricao: descricao ? decodificarHtml(descricao) : undefined,
  };
}

/** Data (AAAA-MM-DD) do último commit que tocou o arquivo; undefined se não houver histórico confiável. */
export function dataDoUltimoCommit(arquivo, raiz = RAIZ) {
  try {
    const git = (...args) => execFileSync('git', args, { cwd: raiz, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    // Clone raso (comum em CI) devolve a data do único commit para todo arquivo: melhor não ter lastmod do que mentir.
    if (git('rev-parse', '--is-shallow-repository') === 'true') return undefined;
    return git('log', '-1', '--format=%cs', '--', arquivo) || undefined;
  } catch {
    return undefined;
  }
}

/**
 * Decide quais páginas geradas entram no sitemap e no llms.txt.
 * paginas: [{ url, noindex, titulo, descricao, lastmod }]
 * Devolve { indexaveis, avisos }.
 */
export function separarIndexaveis(paginas, catalogo) {
  const porUrl = new Map(catalogo.urls.map((u) => [u.url, u]));
  const indexaveis = [];
  const avisos = [];
  for (const p of paginas) {
    const linha = porUrl.get(p.url);
    if (!linha) {
      avisos.push(`${p.url} não tem linha no catalogo/sites.json (regra 3): fica fora do sitemap e do llms.txt.`);
      continue;
    }
    if (linha.indexar !== true) continue;
    if (p.noindex) {
      avisos.push(`${p.url} está com indexar: true no catálogo, mas a página tem noindex: fica fora do sitemap.`);
      continue;
    }
    indexaveis.push({ ...p, linha });
  }
  indexaveis.sort((a, b) => a.url.localeCompare(b.url));
  return { indexaveis, avisos };
}

export function montarSitemap(indexaveis) {
  const urls = indexaveis
    .map((p) => `  <url>\n    <loc>${escaparXml(p.url)}</loc>${p.lastmod ? `\n    <lastmod>${p.lastmod}</lastmod>` : ''}\n  </url>`)
    .join('\n');
  return (
    '<?xml version="1.0" encoding="UTF-8"?>\n' +
    '<!-- Gerado no build pelo @strat/kit (WEB-18) a partir do catalogo/sites.json. Não editar à mão. -->\n' +
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    (urls ? urls + '\n' : '') +
    '</urlset>\n'
  );
}

export function montarRobots(site) {
  const linhas = [
    '# Gerado no build pelo @strat/kit (WEB-18). Não editar à mão.',
    '# Robôs de busca e de IA liberados de propósito (docs/seo-geo.md). Página que não deve aparecer leva noindex',
    '# no HTML; bloquear aqui impediria o robô de ver o noindex.',
    'User-agent: *',
    'Allow: /',
    '',
    ...ROBOS_DE_IA.flatMap((r) => [`User-agent: ${r}`, 'Allow: /']),
    '',
    `Sitemap: ${new URL('/sitemap.xml', site).href}`,
    '',
  ];
  return linhas.join('\n');
}

export function montarLlms({ marca, site, indexaveis, catalogo }) {
  const m = catalogo.marcas[marca];
  if (!m) throw new Error(`packages/kit/src/marcas.js não tem a marca "${marca}".`);
  if (!m.resumo) throw new Error(`packages/kit/src/marcas.js: a marca "${marca}" está sem resumo (vai no llms.txt).`);
  const linhas = [`# ${m.nome}`, '', `> ${m.resumo}`, '', `Site: ${site}`];
  const contato = [m.telefone && `WhatsApp ${m.telefone}`, m.email].filter(Boolean);
  if (contato.length) linhas.push(`Contato: ${contato.join(' · ')}`);
  if (m.endereco) linhas.push(`Endereço: ${enderecoEmTexto(m.endereco)}`);
  if (m.sameAs?.length) linhas.push(`Redes: ${m.sameAs.join(' · ')}`);
  linhas.push('Idioma: português (Brasil)', '', '## Páginas', '');
  if (indexaveis.length) {
    for (const p of indexaveis) {
      const titulo = p.titulo || p.url;
      linhas.push(`- [${titulo}](${p.url})${p.descricao ? `: ${p.descricao}` : ''}`);
    }
  } else {
    linhas.push('Nenhuma página publicada neste endereço ainda.');
  }
  const outras = catalogo.urls.filter((u) => u.tipo === 'site' && u.indexar === true && u.marca !== marca);
  if (outras.length) {
    linhas.push('', '## Outras marcas do Grupo Strat', '');
    for (const u of outras) {
      const nome = catalogo.marcas[u.marca]?.nome || u.marca;
      linhas.push(`- [${nome}](${u.url})`);
    }
  }
  return linhas.join('\n') + '\n';
}

function caminhoDoHtml(dir, pathname) {
  const p = pathname.replace(/^\//, '');
  const candidatos = p === '' ? ['index.html'] : [`${p.replace(/\/?$/, '/')}index.html`, `${p.replace(/\/$/, '')}.html`];
  return candidatos.map((c) => resolve(dir, c)).find((c) => existsSync(c));
}

/** Integração do Astro. `app` é a pasta do app no monorepo, igual ao campo `app` do catálogo. */
export function arquivosDoSite({ app }) {
  if (!app) throw new Error('arquivosDoSite: informe { app: "apps/<nome>" }.');
  let site;
  let pastaPublica;
  const entradaPorCaminho = new Map();

  return {
    name: '@strat/kit:arquivos-do-site',
    hooks: {
      'astro:config:done': ({ config }) => {
        if (!config.site) throw new Error(`${app}: defina "site" no astro.config (domínio final, com https).`);
        site = config.site.replace(/\/?$/, '/');
        pastaPublica = fileURLToPath(config.publicDir);
      },
      'astro:routes:resolved': ({ routes }) => {
        for (const r of routes) if (r.pathname && r.entrypoint) entradaPorCaminho.set(r.pathname.replace(/\/?$/, '/'), r.entrypoint);
      },
      'astro:build:done': ({ dir, pages, logger }) => {
        const saida = fileURLToPath(dir);
        const manuais = ARQUIVOS.filter((a) => existsSync(resolve(pastaPublica, a)));
        if (manuais.length) {
          throw new Error(`${app}: ${manuais.map((a) => `public/${a}`).join(', ')} feito à mão. O kit gera esse arquivo (WEB-18 e WEB-21): apague o manual.`);
        }
        const catalogo = lerCatalogo();
        const linhaDaHome = catalogo.urls.find((u) => u.app === app && u.url === site);
        const marca = linhaDaHome?.marca || catalogo.urls.find((u) => u.app === app)?.marca;
        if (!marca) throw new Error(`${app}: nenhuma linha do catalogo/sites.json aponta para este app.`);

        const paginas = [];
        for (const { pathname } of pages) {
          const html = caminhoDoHtml(saida, pathname);
          if (!html) continue;
          const url = new URL(pathname.replace(/^\//, ''), site).href;
          const entrada = entradaPorCaminho.get(new URL(url).pathname);
          const appDir = resolve(RAIZ, app);
          const lastmod = entrada ? dataDoUltimoCommit(relative(RAIZ, resolve(appDir, entrada))) : undefined;
          paginas.push({ url, lastmod, ...lerHtml(readFileSync(html, 'utf8')) });
        }
        // 404 não é página do site para robô nenhum.
        const { indexaveis, avisos } = separarIndexaveis(paginas.filter((p) => !/\/404\/?$/.test(p.url)), catalogo);
        avisos.forEach((a) => logger.warn(a));

        writeFileSync(resolve(saida, 'sitemap.xml'), montarSitemap(indexaveis));
        writeFileSync(resolve(saida, 'robots.txt'), montarRobots(site));
        writeFileSync(resolve(saida, 'llms.txt'), montarLlms({ marca, site, indexaveis, catalogo }));
        writeFileSync(resolve(saida, '_headers'), montarHeaders());
        logger.info(`sitemap.xml (${indexaveis.length} de ${paginas.length} páginas), robots.txt, llms.txt e _headers gerados.`);
      },
    },
  };
}
