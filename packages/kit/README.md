# @strat/kit

Componentes e regras comuns a todos os sites do Grupo Strat.

| Pronto | O quê | Item |
|---|---|---|
| sim | `Layout`, `Seo`, `JsonLd`, `Breadcrumb`, `Faq` e os dados das marcas (`src/marcas.js`) | WEB-16 |
| não | `Tracking` (perfis venda, lead, conteudo lendo o catálogo) | WEB-17 |
| sim | `sitemap.xml`, `robots.txt` e `llms.txt` gerados no build (`arquivosDoSite`, em `src/arquivos-do-site.js`) | WEB-18 |
| sim | `_headers` com os cabeçalhos de segurança e o noindex do `*.pages.dev`, pela mesma integração (`src/cabecalhos.js`) | WEB-21 |

Como usar: `docs/padroes.md`, "Página com o kit". Testes: `pnpm --filter @strat/kit test`.
