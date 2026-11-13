# Cloudflare Pages (um projeto por app)

Cada app do monorepo é um projeto do Pages ligado a este repositório pelo GitHub (WEB-15). O Pages builda só o app que
mudou, pelo "caminho de build observado" (build watch paths), e comenta no PR o link de preview `*.pages.dev` de cada
app. Conta "Strat Academy" (`6258e000cf06b29a9f3fa797f8592171`); mexer só com o token restrito `pages-strat-web`
(Infisical `strat-web` `/cloudflare`, WEB-4).

## Os quatro projetos (criados em 11/11/2026, WEB-15)

| Projeto | Endereço `.pages.dev` | Comando de build | Saída | Caminho observado (inclui) | Domínio entra no |
|---|---|---|---|---|---|
| `agenciastrat` | https://agenciastrat.pages.dev | `pnpm --filter @strat/agenciastrat build` | `apps/agenciastrat/dist` | `apps/agenciastrat/*`, `packages/*`, `catalogo/*`, `functions/*`, `pnpm-lock.yaml` | WEB-26 |
| `stratai` | https://stratai-ti7.pages.dev | `pnpm --filter @strat/stratai build` | `apps/stratai/dist` | `apps/stratai/*`, `packages/*`, `catalogo/*`, `functions/*`, `pnpm-lock.yaml` | WEB-32 |
| `metricaas` | https://metricaas.pages.dev | `pnpm --filter @strat/metricaas build` | `apps/metricaas/dist` | `apps/metricaas/*`, `packages/*`, `catalogo/*`, `functions/*`, `pnpm-lock.yaml` | WEB-36 |
| `sites-stratacademy` | https://sites-stratacademy.pages.dev | `pnpm --filter @strat/stratacademy build` | `apps/stratacademy/dist` | `apps/stratacademy/*`, `packages/*`, `catalogo/*`, `functions/*`, `pnpm-lock.yaml` | WEB-49 |

Nos quatro, `docs/*` fica fora do caminho observado. Mudou `packages/kit` ou `catalogo/`, os quatro buildam (é o que se
quer: ajuste no kit vale para todos).

**Por que `stratai-ti7`:** o endereço `*.pages.dev` vale para todas as contas da Cloudflare, e `stratai.pages.dev` já
era de outra conta. A Cloudflare acrescentou o sufixo sozinha; o nome do projeto continua `stratai`. Não importa
para o site: o endereço público será `stratai.com.br` (WEB-32).

## Ajustes comuns
| Campo | Valor |
|---|---|
| Repositório / branch de produção | `strat-web/sites` / `main` |
| Diretório raiz | `/` (a raiz do repositório, por causa do workspace) |
| Variáveis (produção e preview) | `NODE_VERSION=22.23.4`, `PNPM_VERSION=9.15.9` |
| Preview | ligado para todos os branches e PRs, com comentário no PR |
| Domínio próprio | nenhum ainda: cada um entra no item de migração do site |

## O que é "produção" aqui
A branch `main` publica a versão principal de cada projeto no endereço `.pages.dev` da tabela. **Nenhum domínio de
verdade aponta para estes projetos ainda.** Enquanto o F2 não termina, os quatro apps são esqueleto (uma página com
`noindex`), de propósito: o conteúdo entra nos itens de migração (WEB-23, WEB-32, WEB-36, WEB-49) e só então o domínio
vira, com o "pode virar" do Helbert nos que estão no ar. Ver `dominios.md`.

O endereço `.pages.dev` de produção e o das prévias saem com `X-Robots-Tag: noindex` pelo `_headers` que o kit gera
(WEB-21); a Cloudflare já põe esse cabeçalho sozinha só nas prévias de branch.

## A questão da stratacademy
Já existe na conta o projeto **`stratacademy`**: é o que serve stratacademy.com.br **em produção hoje**, ligado ao
repositório `Strat-Ai-Horus-OS/horus` (build `pnpm --filter stratacademy build`, caminho `apps/stratacademy/*`,
`packages/*`, `functions/*`). Nome de projeto é único na conta, então o app deste repositório não podia nascer com esse
nome sem mexer no site da Academy no ar.

Decisão de 11/11/2026 (Jhonathan, no WEB-15): o app daqui vira o projeto **`sites-stratacademy`**. O `stratacademy` do
horus **não foi tocado** e continua servindo o domínio até o WEB-49. Fica para o Helbert decidir, no WEB-49, um destes
caminhos:
1. ligar stratacademy.com.br e www ao `sites-stratacademy` e desligar o `stratacademy` antigo (sem excluir, regra 8); ou
2. renomear: o nome `stratacademy` só fica livre se o projeto antigo for excluído, o que pede o Helbert.

## Prévias temporárias do WEB-15
Antes de saber que a conta já tinha a ligação com o GitHub da `strat-web`, o WEB-15 criou quatro projetos por upload
direto, só para ver o esqueleto: `web-15-agenciastrat-preview`, `web-15-stratai-preview`,
`web-15-stratacademy-preview` e `web-15-metricaas-preview`. Não servem mais: os projetos de cima fazem o preview por PR.
Projeto criado por upload direto nunca pode ser ligado ao GitHub depois, por isso eles não viraram os definitivos.
Ficam até o Helbert dizer se desliga.

## Functions (`functions/` na raiz)
O Pages procura a pasta `functions/` no diretório raiz do projeto, que aqui é `/` nos quatro. Então
`functions/u/[[caminho]].js` (proxy do Umami, `tracking.md`) vale para todos os apps e LPs. `functions/*` está no caminho observado dos
quatro projetos desde 12/11/2026:
mudou a Function, os quatro buildam (como `packages/*` e `catalogo/*`).

## Armadilhas
- **Sem `404.html` na raiz da saída**, o Pages trata o projeto como aplicação de página única e responde 200 com a
  home em qualquer caminho. Todo app tem `src/pages/404.astro` (WEB-75, `padroes.md`, "Página 404").
- **wrangler 4.160+:** `wrangler pages project create` tenta delegar para o Workers e falha num monorepo
  ("workspace root unsupported"), sem criar nada. Para upload direto, use `--force`.
- **Projeto ligado ao GitHub** não sai pelo `wrangler`: crie pela API (`POST /accounts/<id>/pages/projects` com
  `source.type=github`, `owner=strat-web`, `repo_name=sites`), com o token `pages-strat-web`. Funciona porque a conta
  já tem o app da Cloudflare instalado na org `strat-web`.

## LPs da Academy
Um projeto por LP e por subdomínio, criado no WEB-48 (`lps/academy/<lp>/`), com o mesmo desenho: comando
`pnpm --filter @strat/<lp> build`, saída `lps/academy/<lp>/dist`, observando `lps/academy/<lp>/*`, `packages/*` e `catalogo/*`.
