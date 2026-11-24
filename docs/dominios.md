# Domínios, DNS e hospedagem

Conferido em 2026-11-04 (Cloudflare, Easypanel, Search Console). Atualize a cada migração.

Em 2026-11-11 (WEB-15) nasceram os projetos do Pages `agenciastrat`, `stratai`, `metricaas` e `sites-stratacademy`,
ligados a este repositório e só com o endereço `.pages.dev` (ver `pages.md`). Nenhum domínio mudou.

## Regra
- Sem servidor próprio (site, LP, blog) → **Cloudflare Pages**, a partir deste repositório.
- Com banco, fila, sessão ou processo contínuo → **Easypanel** (VPS própria; o endereço fica no mapa interno, fora deste repositório).
- Todas as zonas na conta da Cloudflare "Strat Academy" (`6258e000cf06b29a9f3fa797f8592171`), menos `strat.tec.br`,
  que está noutra conta até o WEB-56.

## Assets (R2)
Um bucket por marca, servido no subdomínio `assets.` da própria marca (domínio personalizado do R2, TLS mínimo 1.2,
`r2.dev` desligado). O `Cache-Control` imutável vai gravado em cada arquivo no upload, não numa regra da zona
(mesmo padrão do bucket da Academy). Subir: `scripts/subir-asset.mjs` (`padroes.md`). Nada se apaga nem se
sobrescreve: chave nova para conteúdo novo.

| Domínio | Bucket | Desde | Item |
|---|---|---|---|
| assets.agenciastrat.com.br | `assets-agenciastrat` | 2026-11-17 | WEB-44 |
| assets.stratai.com.br | `assets-stratai` | 2026-11-17 | WEB-44 |
| assets.metricaas.com.br | `assets-metricaas` | 2026-11-17 | WEB-44 |
| assets.stratacademy.com.br | `strat-web-media` (nome antigo, de antes da padronização; CORS de `PUT` para o painel do Horus) | 2026-07-14 | — |

Imagem de teste em cada um: `teste/web-44.png` (o logo da marca), conferida em 2026-11-17 com 200 e
`Cache-Control: public, max-age=31536000, immutable`. A borda responde `cf-cache-status: DYNAMIC` nos quatro (o
da Academy também): o navegador guarda por um ano, a borda não. As regras de cache das zonas não são legíveis com o
token `pages-strat-web`; investigação no item de Triagem aberto pelo WEB-44.

## Zonas

| Zona | Conta | Situação | O Jhonathan mexe com o token? |
|---|---|---|---|
| agenciastrat.com.br | Strat Academy | ativa desde 2026-11-04 (nameservers da Cloudflare no registro.br, WEB-1; conferido pela API em 2026-11-13). Site no ar pelo Pages `agenciastrat` desde 2026-11-24 (WEB-26) | sim |
| stratai.com.br | Strat Academy | ativa | sim |
| metricaas.com.br | Strat Academy | ativa | sim |
| stratacademy.com.br | Strat Academy | ativa | sim, só o CNAME que o item de migração pedir; `n8n`, `git`, `lists` e `hub` não (WEB-47, conferido em 12/11/2026) |
| strat.tec.br | outra conta | ativa | não |

## Por domínio

| URL | O que é | Hoje | Alvo | Item |
|---|---|---|---|---|
| agenciastrat.com.br | site da Agência, /advogados (v1) e /advogados/v2/ (no app desde o WEB-24), /bio/ (no app desde o WEB-25; vem de bio.stratai.com.br/agencia/, em 301 para cá desde 24/11/2026 por regra na zona stratai.com.br), /blog | Pages `agenciastrat` desde 24/11/2026 (raiz e www em CNAME com proxy para agenciastrat.pages.dev; o www em 301 para a raiz pela regra da zona, com a query) | Pages `agenciastrat` (existe desde 11/11, agenciastrat.pages.dev) | WEB-23 a 31 |
| agencia.stratai.com.br | site da Agência (antigo) | 301 para agenciastrat.com.br desde 24/11/2026: Redirect Rule na zona stratai.com.br (caminho e query preservados) com o registro no proxy. `/lp-express/` e `/.well-known/` ficam fora da regra e seguem no Easypanel `strat-lps` (a LP express não foi migrada) | 301 para agenciastrat.com.br; a `/lp-express/` decide no item que a migrar | WEB-29 |
| stratai.com.br | site da StratAI, /raio-x, /politica-de-privacidade/, /recuperacao/ (funil e cases, rascunho, WEB-91), /parcerias/ (WEB-74, página nova), /bio/ (WEB-35, vem de bio.stratai.com.br) | Pages `stratai` desde 17/11/2026 (virada do WEB-32) | Pages `stratai` (existe desde 11/11, stratai-ti7.pages.dev). As três páginas e os 301 da casa antiga (`/politica-de-privacidade` sem barra, `/agencia/*` para agencia.stratai.com.br, `/raio-x/v1/`) estão no app desde o WEB-32; virou em 17/11 com o "pode virar" do Helbert, e as três respondem 200 pelo Pages (conferido em 23/11) | WEB-32 |
| bio.stratai.com.br | bio da StratAI (`/`) e da Agência (`/agencia/`) | Easypanel `strat-lps`, registro só DNS (sem proxy) para a VPS. A bio da StratAI já está no app em stratai.com.br/bio/ (WEB-35) | 301 para /bio de cada marca, por regra na zona stratai.com.br com o registro no proxy: `/` e o resto → https://stratai.com.br/bio/ com a query (WEB-35, pelo Helbert, o token `pages-strat-web` não cria regra); `/agencia/*` → https://agenciastrat.com.br/bio/ com a query desde 24/11/2026 (WEB-25), regra própria na mesma zona | WEB-25, WEB-35 |
| metricaas.com.br, www.metricaas.com.br | site do MetricaaS, /politica-de-privacidade/, /termos-de-uso/ | Pages `metricaas` desde 20/11/2026 (raiz e www em CNAME com proxy para metricaas.pages.dev; o www segue em 301 pela regra da zona) | Pages `metricaas` (existe desde 11/11, metricaas.pages.dev). As três páginas e os 301 da casa antiga (`/politica-de-privacidade` e `/termos-de-uso` sem barra, `/images/*`, `/legal.css`) já estão no app desde o WEB-36; virou em 20/11 com o "pode virar" do Helbert de 19/11; a URL antiga da política (sem barra) responde 301 e os robôs da Meta e do Google chegam ao 200 | WEB-36 |
| app., go.metricaas.com.br | o produto | Easypanel `whatsapp/metricaas-app` | fica | — |
| docs.metricaas.com.br | documentação | Mintlify | fica | — |
| stratacademy.com.br | site e blog | Pages `sites-stratacademy` desde 24/11/2026 (raiz e www em CNAME com proxy para sites-stratacademy.pages.dev; o www em 301 pela regra da zona). O projeto `stratacademy` do horus ficou sem domínio e não foi excluído (regra 8): para voltar, religar os dois domínios nele e apontar os CNAMEs para stratacademy.pages.dev | Pages `sites-stratacademy`, deste repositório; virou em 24/11 com o "pode virar" do Helbert, depois da conferência do D8 no WEB-49 (89 URLs, redirecionamentos e tracking antes e depois do aceite) | WEB-49 |
| claude., skills., mentoria., bootcamp., vibecode., comunidade.stratacademy.com.br | LPs de campanha | Pages, um projeto por subdomínio, desde 20/11/2026 (registro CNAME com proxy para `<projeto>.pages.dev`, www no mesmo projeto e em 301 pela regra da zona); a claude virou em 23/11/2026, com a ressalva do Helbert sobre o LCP e o CLS no Android (#71) | um projeto do Pages por subdomínio: `academy-claude` (academy-claude.pages.dev, `lps/academy/claude`), `academy-comunidade` (academy-comunidade.pages.dev, `lps/academy/comunidade`) , `academy-mentoria` (academy-mentoria.pages.dev, `lps/academy/mentoria`) `academy-vibecode` (academy-vibecode.pages.dev, `lps/academy/vibecode`), `academy-skills` (academy-skills.pages.dev, `lps/academy/skills`) e `academy-bootcamp` (academy-bootcamp.pages.dev, `lps/academy/bootcamp`) existem desde 17/11. Viradas em 20/11, uma por vez, com o "pode virar" do Helbert de 19/11: comunidade, skills, vibecode, mentoria e bootcamp; a claude em 23/11, com o "pode virar com ressalva" do mesmo dia, depois do #71 | WEB-48 |
| tracking., wa.stratacademy.com.br | Rastro | Pages `rastro-stratacademy` | fica (repositório vai para a strat-web, WEB-55) | — |
| hub., links., lists., form., git.stratacademy.com.br | apps | Easypanel | fica | — |
| chat., class., crm.stratacademy.com.br | apps em Lovable (185.158.133.1) | Lovable | fica | — |
| membros.stratacademy.com.br | área de membros | MemberClass | fica | — |
| *.strat.tec.br | apps internos (Plane, Infisical, Easypanel, Horus, entregas, propostas) | Easypanel | fica, sempre noindex | WEB-56 |

## Serviços do Easypanel ligados a site (para desligar no fim)
- `aplicativos/strat-lps`: 13 domínios, build nixpacks na VPS. Desliga no WEB-53, depois de 2 semanas de 301 sem erro.
- `aplicativos/stratacademy-site`: builda o horus sem domínio próprio; duplicado do Pages. Desliga no WEB-52.

## Migração da Agência (WEB-23)

Home e política copiadas do strat-lps `05ca028` para `apps/agenciastrat`, com o kit e a mesma medição; produção segue em agencia.stratai.com.br até a virada. A política no app usa `/politica-de-privacidade/`, com 301 das formas sem barra e `.html`. Os três vídeos da home (cerca de 4,8 MB) ficam no R2 `assets-agenciastrat`, em `https://assets.agenciastrat.com.br/midia/criativos/`, por decisão do Helbert em 19/11/2026 (subidos em 20/11 pelo `scripts/subir-asset.mjs`, SHA-256 igual ao da origem). As páginas de teste `/kit/` continuam no app. O domínio ligou no Pages em 24/11/2026 (WEB-26) e agencia.stratai.com.br passou a dar 301 por caminho no mesmo dia (WEB-29), com o domínio já liberado no MetricaaS `strat-marketing` (WEB-28).
