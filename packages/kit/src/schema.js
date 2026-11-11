// Funções puras que montam URL canônica e JSON-LD. Os componentes .astro só chamam estas funções,
// para que a regra fique testável sem navegador (`pnpm --filter @strat/kit test`).
import { grupo, marca } from './marcas.js';

// URL canônica: domínio do `site` do app (nunca pages.dev), sem query nem âncora, com barra no fim
// (docs/padroes.md). Arquivo com extensão (/feed.xml) fica sem barra.
export function urlCanonica(site, caminho = '/') {
  if (!site) throw new Error('[kit] defina `site` no astro.config.mjs do app: o canonical depende dele');
  const u = new URL(caminho, site);
  u.search = '';
  u.hash = '';
  const ultimo = u.pathname.split('/').pop();
  if (!u.pathname.endsWith('/') && !ultimo.includes('.')) u.pathname += '/';
  return u.href;
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
  if (m.imagem) {
    dados.image = m.imagem;
    dados.logo = m.imagem;
  }
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
