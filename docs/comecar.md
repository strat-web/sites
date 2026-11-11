# Começar

Para quem vai trabalhar nos sites. Leva meia hora no primeiro dia.

## 1. Acessos

| O quê | Onde | Como conferir |
|---|---|---|
| GitHub, org `strat-web` | https://github.com/strat-web | `gh api orgs/strat-web/memberships/<seu-login>` responde `active` |
| PR pela conta de serviço | `GITHUB_TOKEN` do seu `os-<nome>` `/mcp-global` = PAT `claude-<nome>` da `strat-aibr` | `gh api user` dentro do `infisical run` responde `strat-aibr` |
| Infisical `strat-web` (member) | https://secrets.strat.tec.br | `infisical secrets --projectId=baffbac0-3e1a-47fb-b381-63326d430e39 --env=dev --path=/pagespeed` lista `PSI_API_KEY` |
| Cloudflare (token, sem conta) | Infisical `strat-web` `/cloudflare` | `infisical run ... -- npx wrangler pages project list` |
| Plane, projeto `WEB` | https://plane.strat.tec.br | seus itens aparecem em "Meus itens" |
| Search Console, usuário Total | propriedades de cada domínio | o domínio aparece em https://search.google.com/search-console |
| MetricaaS | workspaces `strat-marketing` (Agência) e `agencia-strat` (Strat AI) | você abre os dois no app |
| OpenSEO | https://open-seo.stratacademy-ai.workers.dev (convite do Helbert) | entra com o seu e-mail |

O rito completo de conferência é `/lab:entrega-web acessos`. O que faltar vira item com o rótulo `helbert` no Plane;
siga para o próximo item enquanto isso.

## 2. Ferramentas na máquina
- Node 22.23.4 ou mais novo (`.nvmrc`), pnpm 9.15.9 (`corepack enable`), Git, GitHub CLI (`gh`), Infisical CLI, Wrangler (pelo `npx`).
- Claude Code com os plugins da oficina `base`, `dev` e `lab` (o app Oficina instala).
- Chrome com Meta Pixel Helper e Tag Assistant, para conferir tracking.

## 3. Primeiro dia
1. Clonar: `gh repo clone strat-web/sites`.
2. Ler `CLAUDE.md`, `docs/padroes.md` e `docs/tracking.md`.
3. Rodar `/lab:entrega-web` no Claude Code, dentro da pasta do repositório: ele mostra seus itens do WEB na ordem dos módulos.

## 4. Onde pedir ajuda
No próprio item do Plane, como comentário. Se travar por acesso, rótulo `helbert` e estado Aguardando, com o que falta no comentário.
