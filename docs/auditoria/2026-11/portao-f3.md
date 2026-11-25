# Portão F3 · piloto agenciastrat.com.br (WEB-31)

O piloto prova o caminho antes de mexer nos sites com SEO. A virada da Agência foi feita pelo Helbert em 24/11/2026
(WEB-26, WEB-28 e WEB-29, docs no PR #77). Esta página é o checklist do portão, com a evidência de cada linha.

## Checklist

| # | O quê | Situação | Evidência |
|---|---|---|---|
| 1 | 301 de todas as rotas antigas, com caminho e query | ok (25/11) | tabela abaixo, por `curl` |
| 2 | `stratai.com.br/agencia/*` num salto só | ok neste PR (25/11) | `apps/stratai/public/_redirects`, testado no `wrangler pages dev`; em produção depois do merge |
| 3 | Domínio liberado no MetricaaS (`strat-marketing`) e no pixel 1815630929780241 | ok (24/11) | WEB-28: `client_domains` com agenciastrat.com.br e agenciastrat.pages.dev; o pixel não tem lista de permissão |
| 4 | Sitemap lido no Search Console | ok (24/11) | WEB-27: `https://agenciastrat.com.br/sitemap.xml` em `sc-domain:agenciastrat.com.br`, Processado, 3 páginas |
| 5 | Lead de teste no domínio novo: formulário → MetricaaS → agenda → WhatsApp | **pendente** | precisa do ok do Jhonathan, do aviso ao comercial antes e do lead apagado no fim (`docs/decisoes.md`) |
| 6 | Eventos no pixel (PageView e Lead) | **pendente** | sai junto do lead de teste (linha 5) |

## Rotas testadas (25/11/2026)

Cada rota foi pedida com `?utm_source=teste&utm_medium=verificacao&fbclid=web31` (na tabela, `?Q`). "Primeiro
salto" é a resposta da rota antiga; "chega em" é o fim da cadeia.

| Rota antiga | Primeiro salto | Chega em | Saltos |
|---|---|---|---|
| `https://agencia.stratai.com.br/?Q` | 301 → `https://agenciastrat.com.br/?Q` | 200 `https://agenciastrat.com.br/?Q` | 1 |
| `https://agencia.stratai.com.br/advogados/?Q` | 301 → `https://agenciastrat.com.br/advogados/?Q` | 200 `https://agenciastrat.com.br/advogados/?Q` | 1 |
| `https://agencia.stratai.com.br/advogados?Q` | 301 → `https://agenciastrat.com.br/advogados?Q` | 200 `https://agenciastrat.com.br/advogados/?Q` | 2 |
| `https://agencia.stratai.com.br/advogados/v2/?Q` | 301 → `https://agenciastrat.com.br/advogados/v2/?Q` | 200 `https://agenciastrat.com.br/advogados/v2/?Q` | 1 |
| `https://agencia.stratai.com.br/politica-de-privacidade?Q` | 301 → `https://agenciastrat.com.br/politica-de-privacidade?Q` | 200 `https://agenciastrat.com.br/politica-de-privacidade/?Q` | 2 |
| `https://agencia.stratai.com.br/politica-de-privacidade.html?Q` | 301 → `https://agenciastrat.com.br/politica-de-privacidade.html?Q` | 200 `https://agenciastrat.com.br/politica-de-privacidade/?Q` | 2 |
| `https://agencia.stratai.com.br/index.html?Q` | 301 → `https://agenciastrat.com.br/index.html?Q` | 200 `https://agenciastrat.com.br/?Q` | 2 |
| `https://agencia.stratai.com.br/robots.txt?Q` | 301 → `https://agenciastrat.com.br/robots.txt?Q` | 200 | 1 |
| `https://agencia.stratai.com.br/sitemap.xml?Q` | 301 → `https://agenciastrat.com.br/sitemap.xml?Q` | 200 | 1 |
| `https://agencia.stratai.com.br/llms.txt?Q` | 301 → `https://agenciastrat.com.br/llms.txt?Q` | 200 | 1 |
| `http://agencia.stratai.com.br/advogados/?Q` | 301 → `https://agenciastrat.com.br/advogados/?Q` | 200 | 1 |
| `https://www.agenciastrat.com.br/advogados/?Q` | 301 → `https://agenciastrat.com.br/advogados/?Q` | 200 | 1 |
| `http://agenciastrat.com.br/?Q` | 301 → `https://agenciastrat.com.br/?Q` | 200 | 1 |
| `https://bio.stratai.com.br/agencia/?Q` | 301 → `https://agenciastrat.com.br/bio/?Q` | 200 `https://agenciastrat.com.br/bio/?Q` | 1 |
| `https://bio.stratai.com.br/agencia?Q` | 301 → `https://agenciastrat.com.br/bio/?Q` | 200 `https://agenciastrat.com.br/bio/?Q` | 1 |
| `https://stratai.com.br/agencia?Q` | 301 → `https://agencia.stratai.com.br/?Q` | 200 `https://agenciastrat.com.br/?Q` | 2 (1 depois deste PR) |
| `https://stratai.com.br/agencia/?Q` | 301 → `https://agencia.stratai.com.br/?Q` | 200 `https://agenciastrat.com.br/?Q` | 2 (1 depois deste PR) |
| `https://stratai.com.br/agencia/advogados/?Q` | 301 → `https://agencia.stratai.com.br/advogados/?Q` | 200 `https://agenciastrat.com.br/advogados/?Q` | 2 (1 depois deste PR) |

Páginas no domínio novo, sem salto: `/`, `/advogados/`, `/advogados/v2/`, `/politica-de-privacidade/` e `/bio/` em 200.

- As três rotas do sitemap antigo (`/`, `/advogados/` e `/politica-de-privacidade`) chegam à rota certa com a query.
- Os segundos saltos de `agencia.stratai.com.br` são da barra final e das formas `.html`, que o próprio app resolve
  (`apps/agenciastrat/public/_redirects`). Ficam: são formas que nenhum link publica.
- `stratai.com.br/agencia/*` apontava para o host antigo (o 301 que o `strat-lps` fazia desde 31/10, levado ao
  `apps/stratai` no WEB-32). Neste PR passa a ir direto para `agenciastrat.com.br`. No `wrangler pages dev` do build:
  `/agencia`, `/agencia/` e `/agencia/advogados/?utm_source=teste&fbclid=x` → 301 para o mesmo caminho em
  `https://agenciastrat.com.br`, com a query.

## Fora do portão

| Rota | Situação |
|---|---|
| `agencia.stratai.com.br/lp-express/` (e `/lp-express/cases.html`) | 200 pelo `strat-lps`, fora da Redirect Rule por decisão do Helbert (24/11). Migra no WEB-114. `stratai.com.br/agencia/lp-express/*` segue para lá até a migração (exceção no `_redirects`, antes da regra geral) |
| `agenciastrat.com.br/kit/*` | páginas de teste do kit com `noindex, nofollow`, fora do sitemap |
