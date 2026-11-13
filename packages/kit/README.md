# @strat/kit

Componentes e regras comuns a todos os sites do Grupo Strat.

| Pronto | O quê | Item |
|---|---|---|
| sim | `Layout`, `Seo`, `JsonLd`, `Breadcrumb`, `Faq` e os dados das marcas (`src/marcas.js`) | WEB-16 |
| sim | `Tracking` (perfis venda, lead, conteudo lendo o catálogo; regra em `src/tracking.js`) | WEB-17 |
| sim | Banner de cookies do `Tracking` com o aceite esperando o `m.js` sem prazo (`src/banner-cookies.js`) | WEB-80 |
| sim | `sitemap.xml`, `robots.txt` e `llms.txt` gerados no build (`arquivosDoSite`, em `src/arquivos-do-site.js`) | WEB-18 |
| sim | `_headers` com os cabeçalhos de segurança e o noindex do `*.pages.dev`, pela mesma integração (`src/cabecalhos.js`) | WEB-21 |
| sim | `PaginaNaoEncontrada` (a 404 de cada app; links só para página que existe no build, regra em `src/pagina-de-erro.js`) | WEB-75 |
| sim | `lastmod` de rota dinâmica (`atualizado` no `Layout`), `logo` do JSON-LD com o logotipo, barra no `Breadcrumb` (slug com ponto também) e `llms.txt` só com marca no ar (`no_ar`) | WEB-77 |

Como usar: `docs/padroes.md`, "Página com o kit". Testes: `pnpm --filter @strat/kit test`.
