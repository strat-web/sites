# lps/academy

LPs de campanha da Academy, uma por subdomínio e um projeto do Pages por LP: `claude`, `skills`, `mentoria`,
`bootcamp`, `vibecode` e `comunidade`. Cada LP entra como pasta própria (`lps/academy/<lp>/`) no item de migração
(WEB-48) e usa o kit para tracking e SEO. Vazio no WEB-15.

| LP | Pasta | Projeto do Pages | Origem no `strat-lps` |
|---|---|---|---|
| claude. | `claude/` (`@strat/claude`) | `academy-claude` | `lps/quaia` (principal, v1, v3, v4) |
| skills. | `skills/` (`@strat/skills`) | `academy-skills` | `lps/lp-500` (principal e /b/) |
| mentoria. | `mentoria/` (`@strat/mentoria`) | `academy-mentoria` | `lps/mentoria` (principal e v2, o app React antigo) |
| bootcamp. | `bootcamp/` (`@strat/bootcamp`) | `academy-bootcamp` | `lps/bootcamp` (24 rotas, incluindo /0808-*, grupo e upsell/downsell) |
| vibecode. | `vibecode/` (`@strat/vibecode`) | `academy-vibecode` | `lps/vibecode` (principal e v1, a original arquivada) |
| comunidade. | `comunidade/` (`@strat/comunidade`) | `academy-comunidade` | `lps/comunidade` (pós-cadastro de todos os funis, `?f=`) |

Cada pasta entra pelo PR da própria LP: o WEB-48 foi dividido por LP a pedido do Helbert (revisão do #47, 17/11/2026).
