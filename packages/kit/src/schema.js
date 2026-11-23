// Funções puras que montam URL canônica e JSON-LD. Os componentes .astro só chamam estas funções,
// para que a regra fique testável sem navegador (`pnpm --filter @strat/kit test`).
import { grupo, marca } from './marcas.js';

// Extensões de arquivo de verdade: só elas ficam sem a barra no fim. Ponto no meio do slug não faz arquivo
// (`/blog/gpt-4.1/` é página, WEB-77). Extensão nova servida pelo site entra aqui, com teste.
const EXTENSOES_DE_ARQUIVO = new Set([
  'xml', 'txt', 'json', 'html', 'htm', 'rss', 'atom', 'webmanifest', 'ics', 'csv', 'pdf', 'zip',
  'png', 'jpg', 'jpeg', 'gif', 'webp', 'avif', 'svg', 'ico', 'mp4', 'webm', 'mp3', 'js', 'mjs', 'css', 'woff', 'woff2',
]);

/** true quando o último trecho do caminho é um arquivo (`/feed.xml`), false para página (`/blog/gpt-4.1`). */
export function ehArquivo(caminho) {
  const ultimo = String(caminho).split(/[?#]/)[0].split('/').pop();
  const ponto = ultimo.lastIndexOf('.');
  return ponto > 0 && EXTENSOES_DE_ARQUIVO.has(ultimo.slice(ponto + 1).toLowerCase());
}

// URL canônica: domínio do `site` do app (nunca pages.dev), sem query nem âncora, com barra no fim
// (docs/padroes.md). Arquivo com extensão conhecida (/feed.xml) fica sem barra; slug com ponto (/gpt-4.1) ganha a barra.
// Caminho absoluto de outro domínio (ou //outro.com) é erro de build: o canonical nunca aponta para fora do site.
export function urlCanonica(site, caminho = '/') {
  if (!site) throw new Error('[kit] defina `site` no astro.config.mjs do app: o canonical depende dele');
  const base = new URL(site);
  if (base.hostname.endsWith('.pages.dev')) {
    throw new Error(`[kit] o \`site\` do app não pode ser pages.dev (${base.hostname}): use o domínio final`);
  }
  const u = new URL(caminho, base);
  if (u.origin !== base.origin) {
    throw new Error(`[kit] canonical fora do site: "${caminho}" não é de ${base.origin}`);
  }
  u.search = '';
  u.hash = '';
  if (!u.pathname.endsWith('/') && !ehArquivo(u.pathname)) u.pathname += '/';
  return u.href;
}

// Caminho do link interno na forma canônica (com a barra no fim, mesmo slug com ponto): o href do <Breadcrumb>.
export function caminhoCanonico(site, caminho = '/') {
  return new URL(urlCanonica(site, caminho)).pathname;
}

// Data do dia (AAAA-MM-DD) de um Date ou texto de data; o `lastmod` do sitemap e o `article:modified_time` usam este
// formato. Data inválida quebra o build, para não sair um lastmod errado.
export function dataDoDia(valor) {
  const d = valor instanceof Date ? valor : new Date(String(valor));
  if (valor == null || valor === '' || Number.isNaN(d.getTime())) throw new Error(`[kit] data inválida: "${valor}" (use AAAA-MM-DD)`);
  // Texto que já começa com a data vale como está (sem fuso que mude o dia); Date sai pelo dia em UTC, que é como o
  // Astro lê `2026-11-12` do frontmatter.
  const texto = typeof valor === 'string' && valor.match(/^\d{4}-\d{2}-\d{2}/)?.[0];
  return texto || d.toISOString().slice(0, 10);
}

// Organization/ProfessionalService da marca, filha do Grupo Strat.
export function schemaMarca(chave) {
  const m = marca(chave);
  const dados = {
    '@context': 'https://schema.org',
    '@type': m.tipo,
    '@id': `${m.url}#organizacao`,
    name: m.nome,
    url: m.url,
    parentOrganization: grupo,
  };
  // logo = o logotipo da marca (arquivo no public/ do app, WEB-77); image = a imagem de compartilhamento.
  if (m.logo) dados.logo = m.logo;
  if (m.imagem) dados.image = m.imagem;
  if (m.telefone) dados.telephone = m.telefone;
  if (m.email) dados.email = m.email;
  if (m.endereco) dados.address = m.endereco;
  if (m.sameAs?.length) dados.sameAs = m.sameAs;
  return dados;
}

// itens: [{ nome, caminho }] do início até a página atual.
export function schemaBreadcrumb(itens, site) {
  if (!itens?.length) throw new Error('[kit] Breadcrumb sem itens');
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: itens.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.nome,
      item: urlCanonica(site, it.caminho),
    })),
  };
}

// perguntas: [{ pergunta, resposta }] em texto puro: o mesmo texto vai para a página e para o JSON-LD.
export function schemaFaq(perguntas) {
  if (!perguntas?.length) throw new Error('[kit] Faq sem perguntas');
  for (const p of perguntas) {
    if (!p.pergunta?.trim() || !p.resposta?.trim()) throw new Error('[kit] Faq: toda pergunta precisa de pergunta e resposta');
  }
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: perguntas.map((p) => ({
      '@type': 'Question',
      name: p.pergunta,
      acceptedAnswer: { '@type': 'Answer', text: p.resposta },
    })),
  };
}

// JSON para dentro de <script>: escapa "<" para um texto com "</script>" não fechar a tag.
export function jsonSeguro(dados) {
  return JSON.stringify(dados).replace(/</g, '\\u003c');
}
