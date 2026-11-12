# StratAI · conferência no navegador (WEB-11)

Data: 2026-11-11. Mesmo método do [agenciastrat.md](agenciastrat.md). O Rastro dessas páginas está com
`consentMode: off` (lido no `/sa`), por isso nenhuma tem banner e tudo dispara na abertura.

## Tabela por URL

| URL | Dispara | Rastro (`/sa`) | MetricaaS | Banner | Falta | Duplica |
|---|---|---|---|---|---|---|
| stratai.com.br/ | pixel 1823024821883911 `PageView` ×1; GA4 G-3VJ019EH58 `page_view` ×1; tag GT-M6J6NZQW; `/tracker` ×1 | `stratai`, `known: true` | `agencia-strat`, `defer` | não | Umami | nada |
| stratai.com.br/raio-x/ | pixel 1823024821883911 `PageView`; GA4 G-3VJ019EH58 `page_view` + `scroll`; GT-M6J6NZQW; `/tracker` | `raio-x-ia`, `known: true` | `agencia-strat`, `defer` | não | Umami | nada |
| bio.stratai.com.br/ (alvo: stratai.com.br/bio/) | pixel 1823024821883911 `PageView`; GA4 G-3VJ019EH58 `page_view`; GT-M6J6NZQW; `/tracker` | `stratai`, `known: true` | **`strat-marketing`** (T4) | não | Umami | nada |
| stratai.com.br/bio/ | 404 (ainda não migrada, WEB-35) | — | — | — | — | — |

- **T4 confirmado:** a bio da StratAI carrega o `m.js` do workspace `strat-marketing` (o da Agência). As outras
  páginas da StratAI usam `agencia-strat` ("Strat Ai - Implementação"). Corrigir na migração da bio (WEB-35) e no
  catálogo (WEB-13).
- Home: 6 links `wa.me` depois do JavaScript (o HTML cru tinha `href="#"`, achado do WEB-10/WEB-33), 20 `data-strat-cta`, 11 `data-mtc-section`.
- `/raio-x/` não tem formulário nem `wa.me` no HTML: o diagnóstico é um app em script e o lead vai pelo Rastro ao n8n.
  Lead de teste não enviado aqui: o fim do diagnóstico aciona o SDR do WhatsApp, que está em mudança no WEB-68.
