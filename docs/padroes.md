# Padrões

## Estrutura (alvo do F2)

```
apps/
  agenciastrat/      site da Agência + /advogados + /bio + /blog
  stratai/           site da StratAI + /raio-x + serviços + /guias + /bio
  stratacademy/      site + /blog da Academy
  metricaas/         site do produto + /blog
lps/
  academy/<lp>/      claude, skills, mentoria, bootcamp, vibecode, comunidade (um projeto do Pages por subdomínio)
packages/
  kit/               Layout, Seo, JsonLd, Breadcrumb, Faq, Tracking, sitemap, robots, llms.txt, _headers
  conteudo/          schema do blog (Zod) e checar-posts (docs/blog.md)
  checagens/         as checagens da CI (seo, tracking, links, peso, catalogo) sobre o dist/ de cada app
catalogo/sites.json  fonte única de URLs, ids e tags
docs/                o manual
```

- Astro com saída estática. LP de campanha pode ser HTML estático dentro de `lps/`, desde que use o kit (tracking e SEO).
- pnpm workspaces. Cada app tem o seu projeto no Cloudflare Pages, com "caminho de build observado" no próprio app
  e em `packages/`, para só buildar o que mudou.
- URL sempre com barra no fim (`/agencia-de-ia-joinville/`). Canonical, sitemap e link interno na mesma forma.
- Imagem de blog e de LP vai para o R2 da marca (`assets.<domínio>`), nunca para o repositório quando passar de 200 KB.

## Página com o kit (WEB-16)
Toda página começa pelo `Layout`. Ele põe no `<head>` o título, a descrição, o canonical (domínio do `site` do
`astro.config.mjs`, com barra, nunca `pages.dev`; `caminho` ou item do `Breadcrumb` com URL de outro domínio, e
`site` em `pages.dev`, quebram o build), o robots, o Open Graph e o JSON-LD da marca. `Breadcrumb` e `Faq`
mostram o conteúdo e geram o JSON-LD da mesma lista, então o texto estruturado nunca diverge do visível.

```astro
---
import Layout from '@strat/kit/Layout.astro';
import Breadcrumb from '@strat/kit/Breadcrumb.astro';
import Faq from '@strat/kit/Faq.astro';

const perguntas = [
  { pergunta: 'Funciona com o WhatsApp que eu já uso?', resposta: 'Sim, ...' },
];
---
<Layout
  marca="stratai"
  titulo="Agente de IA no WhatsApp para empresas · StratAI"
  descricao="O agente de IA atende, qualifica e agenda pelo WhatsApp da sua empresa, ligado ao seu CRM."
>
  <Breadcrumb itens={[{ nome: 'Início', caminho: '/' }, { nome: 'Agente de IA no WhatsApp', caminho: '/agente-de-ia-whatsapp/' }]} />
  <h1>Agente de IA no WhatsApp</h1>
  ...
  <Faq perguntas={perguntas} />
</Layout>
```

| Componente | Props | Gera |
|---|---|---|
| `Layout` | `marca`, `titulo`, `descricao`, `imagem?`, `indexar?` (padrão `true`), `tipo?` (`website` ou `article`), `perfil?` (`venda`, `lead` ou `conteudo`); slots: padrão (`<body>`) e `head` | `<html lang="pt-BR">`, `Seo`, `JsonLd` da marca e, com `perfil`, o `Tracking` |
| `Tracking` | `perfil`, `caminho?` | os scripts do perfil com os ids da linha do catálogo (ver `docs/tracking.md`) |
| `Seo` | as mesmas do `Layout` e `caminho?` | title, description, canonical, robots, `og:*`, `twitter:card` |
| `JsonLd` | `marca?` e/ou `dados?` (objeto ou lista já montada, ex.: `Article`) | `<script type="application/ld+json">` com `<` escapado |
| `Breadcrumb` | `itens` (`{ nome, caminho }`, do início à página atual) | trilha visível + `BreadcrumbList` |
| `Faq` | `perguntas` (`{ pergunta, resposta }`, texto puro), `titulo?` | `<details>` visíveis + `FAQPage` |
| `PaginaNaoEncontrada` | `marca`, `titulo`, `descricao`, `h1`, `links?` (`{ nome, caminho }`), `inicio?`, `whatsapp?`; slot: o texto | a 404 do app: `Layout` com noindex e sem tracking, o texto e a lista de links (ver "Página 404") |

- `marca` é a chave do catálogo: `agencia`, `stratai`, `academy`, `metricaas`. Marca nova ou rede nova entra em
  `packages/kit/src/marcas.js`, com a fonte no PR.
- Sem `imagem`, o Open Graph usa a imagem da marca. Caminho relativo vira absoluto pelo `site`.
- Página fora do índice (bio, obrigado, teste): `indexar={false}`.
- As regras ficam em `packages/kit/src/schema.js`, testadas com `pnpm --filter @strat/kit test`.
- Página de teste com tudo junto: `apps/stratai/src/pages/kit/index.astro` (`/kit/`, noindex).
- Página com tracking: `perfil` no `Layout` e a linha da URL no catálogo com o mesmo perfil, senão o build quebra.
  Páginas de teste de cada perfil: `/kit/lead/`, `/kit/conteudo/` e `/kit/venda/` (WEB-17).

## Página 404 (WEB-75)
Todo app tem `src/pages/404.astro`, e o build gera o `dist/404.html`. O Cloudflare Pages serve esse arquivo, com
status 404, em todo caminho que não existe. Sem ele, o Pages trata o projeto como aplicação de página única e responde
200 com a home, e o Google conta como soft 404. A checagem `seo` barra app sem `404.html`.

```astro
---
import PaginaNaoEncontrada from '@strat/kit/PaginaNaoEncontrada.astro';
---
<PaginaNaoEncontrada marca="stratai" titulo="Página não encontrada · StratAI" descricao="..." h1="Esta página não existe"
  inicio="Voltar para o início" whatsapp="Falar com a gente no WhatsApp"
  links={[{ nome: 'Fazer meu diagnóstico', caminho: '/raio-x/' }]}>
  <p>Texto curto na voz da marca.</p>
</PaginaNaoEncontrada>
```

- Sempre noindex e sem tracking; fica fora do catálogo, do sitemap e do `llms.txt`. O título e o H1 dela não contam
  como repetidos.
- `links` traz as páginas principais do site, escritas uma vez. Link do próprio site só aparece quando a página já
  existe no build (o componente lê `src/pages`): a página migrada depois entra na 404 sozinha e a que ainda não foi
  migrada nunca vira link quebrado. Link para outro domínio (`https://`) entra como está.
- A 404 é servida em qualquer caminho, então endereço relativo (`raio-x/`) quebra o build: use `/raio-x/` ou a URL
  completa. A checagem `links` confere os links dela a partir da raiz.
- `whatsapp` põe o link `wa.me` com o telefone da marca em `packages/kit/src/marcas.js`.
- Conferir no preview: `curl -s -o /dev/null -w '%{http_code}' <preview>/nao-existe/` responde `404`, e a página é a
  da marca.

## sitemap.xml, robots.txt e llms.txt (WEB-18)
Ninguém escreve esses três à mão: a integração `arquivosDoSite` do kit, ligada no `astro.config.mjs` de cada app,
grava os três na saída do build.

```js
import { arquivosDoSite } from '@strat/kit';
export default defineConfig({ site: 'https://stratai.com.br', integrations: [arquivosDoSite({ app: 'apps/stratai' })] });
```

| Arquivo | O que sai | De onde vem |
|---|---|---|
| `sitemap.xml` | só as páginas indexáveis, com `lastmod` | página com `indexar: true` no `catalogo/sites.json` **e** sem noindex no HTML; `lastmod` = data do último commit do arquivo da página |
| `robots.txt` | `Allow: /` para todos e para cada robô de IA, e a linha `Sitemap:` | lista `ROBOS_DE_IA` em `packages/kit/src/arquivos-do-site.js` |
| `llms.txt` | nome, resumo, contato, endereço e redes da marca, as páginas indexáveis (título e descrição do HTML) e as outras marcas do grupo | `packages/kit/src/marcas.js` (campo `resumo`) e o catálogo |

- Página no catálogo com `indexar: true` mas com noindex no HTML fica fora e o build avisa. Página gerada sem linha no
  catálogo também fica fora, com aviso (regra 3).
- `public/robots.txt`, `public/sitemap.xml` ou `public/llms.txt` no app quebram o build: o kit é a única fonte.
- O Pages clona raso (um commit só). Antes de ler as datas, o build roda `git fetch --unshallow` (o repositório é
  público). Se o fetch falhar, o `lastmod` sai em branco e o build avisa, em vez de levar a mesma data para todas as páginas.
- Bloquear página no robots impediria o robô de ler o noindex: página fora do índice usa `indexar={false}` no `Layout`.
- Sem nenhuma página indexável, o `sitemap.xml` sai sem `<url>`, e o validador do sitemaps.org recusa sitemap vazio.
  É o caso dos quatro apps enquanto só têm o esqueleto (noindex); passa a validar com a primeira página real.

## Cabeçalhos: `_headers` (WEB-21)
A mesma integração `arquivosDoSite` grava o `_headers` do Cloudflare Pages em cada app. O texto mora em
`packages/kit/src/cabecalhos.js` e é igual nos quatro apps; `public/_headers` no app quebra o build.

| Regra | Cabeçalho | Por quê |
|---|---|---|
| `/*` | `Strict-Transport-Security: max-age=31536000` | HTTPS sempre. **Sem `includeSubDomains` e sem `preload`**: os domínios têm subdomínios fora deste repositório (`n8n`, `git`, `hub`, `tracking`...) |
| `/*` | `X-Content-Type-Options: nosniff` | o navegador não adivinha o tipo do arquivo |
| `/*` | `Content-Security-Policy: frame-ancestors 'self'` | outro site não põe a página num iframe. Só isso: uma CSP de scripts quebraria o Rastro, o MetricaaS e a Hotmart |
| `/*` | `Referrer-Policy: strict-origin-when-cross-origin` | o outro site recebe só o domínio, nunca o caminho com a query |
| `/*` | `Permissions-Policy: camera=(), microphone=(), geolocation=(), usb=()` | desliga câmera, microfone, localização e USB. Sem `payment`: o Checkout Elements da Hotmart (upsell e downsell do bootcamp) pede pagamento num iframe |
| `https://:project.pages.dev/*` e `https://:version.:project.pages.dev/*` | `X-Robots-Tag: noindex` | o endereço `.pages.dev` (produção e prévias) não concorre com o domínio no Google |

- Página que precisa de outra regra (ex.: ser emoldurada por um parceiro) pede item próprio: o cabeçalho muda no kit,
  com o motivo, e vale para todos.
- Conferir: `curl -sI <url> | grep -iE 'strict-transport|nosniff|frame-ancestors|referrer|permissions|x-robots'`. No
  domínio, sem `x-robots-tag`; no `.pages.dev`, com `noindex`.

## Nomes
- App: o nome do domínio sem `.com.br` (`agenciastrat`, `stratai`).
- Página: caminho em português, minúsculo, com hífen (`/agente-de-ia-whatsapp/`).
- Componente do kit: PascalCase em português ou o termo do mercado (`Seo`, `JsonLd`, `Faq`, `Tracking`).

## Rito de entrega (o que a `/lab:entrega-web` faz)
1. **Pegar o item:** o próximo item seu no `WEB`, na ordem dos módulos (F0 → F7). Ler a descrição inteira e o "Pronto quando".
2. **Começar:** item em Fazendo, comentário "começando" com o plano em 3 linhas. Branch `web-<N>-<slug>` da `main`.
3. **Fazer:** só o escopo do item. Fora do escopo vira item novo em Triagem.
4. **Verificar:** build, as checagens da CI rodando local (`pnpm checar`), o checklist de publicar quando for página
   (`docs/checklist-publicar.md`), o preview do Pages a 390 e 1440 px.
5. **Documentar:** catálogo, `docs/dominios.md`, `docs/decisoes.md` e `CHANGELOG.md` no mesmo PR.
6. **PR:** pelo modelo, aberto pela `strat-aibr`, com o link do item, do preview e "como conferir".
7. **Fechar a volta:** item em Aprovação com o link do PR e do preview; comentário com o que foi feito, o que ficou
   de fora e o que precisa do Helbert. Cartão da sessão no strat-dev (`/base:encerrar cartao`).
8. **Ajuste:** se o Helbert mover para Em ajuste, o motivo está no comentário. Corrige no mesmo PR e volta para Aprovação.

## Commit e PR
- Conventional Commits em português: `feat`, `fix`, `docs`, `chore`, `refactor`, `perf`, `ci`. Escopo = app ou pacote.
  O item vai no fim: `fix(stratai): links do WhatsApp com wa.me no HTML (WEB-33)`.
- Título do PR igual ao commit principal.
- Um PR por item. PR grande (mais de ~600 linhas fora de conteúdo) é sinal de que o item precisava ser dividido.

## Checagens da CI (WEB-20)
Rodam em todo PR (`.github/workflows/checagens.yml`), cada uma num job com o próprio nome, e são as que o ruleset
da `main` exige. A regra mora em `packages/checagens/` e lê o `dist/` de cada app depois do build.

| Checagem | Barra quando |
|---|---|
| build | algum app não compila ou algum teste dos pacotes falha (`pnpm build` e `pnpm test`) |
| seo | `<title>` ou `<h1>` faltando, repetido na página ou repetido no site; sem canonical ou canonical diferente da URL; `<a href="#">` (ou vazio, ou `javascript:`); JSON-LD que não é JSON ou sem `@context`/`@type`; página indexável fora do `sitemap.xml`; sitemap com página que tem noindex ou não existe; app sem `sitemap.xml`, `robots.txt` ou `404.html`; 404 sem noindex, sem um `<title>` e um `<h1>`, ou no sitemap |
| tracking | script do `<Tracking>` faltando ou diferente do que a linha do catálogo pede (`data-ws`, `data-pixel`, `data-website-id`); script de tracking a mais ou em dobro; pixel da Meta, gtag, GTM ou pixel do TikTok colado à mão; slug que o Rastro não conhece (`/sa?product=<slug>` com `known: false`); produto do Rastro que injeta pixel, GA4 ou tag do Google diferente da linha do catálogo, ou com `consentMode` diferente do `consentimento` |
| links | link interno quebrado (caminho, relativo ou URL do próprio domínio sem arquivo no build); âncora `#id` sem o id na página; endereço relativo na 404 (ela é servida em qualquer caminho) |
| peso | página acima de 1,5 MB (HTML + CSS, JS, imagem e fonte do build); no Lighthouse em celular, performance abaixo de 90, LCP acima de 2,5 s ou CLS acima de 0,1 |
| catalogo | página do build sem linha em `catalogo/sites.json` ou com `app` diferente; linha sem campo obrigatório, com valor fora da lista, URL sem barra, id ou URL repetidos |

Na máquina: `pnpm checar` roda tudo (o Lighthouse precisa do Chrome instalado, ~1 min); `pnpm checar:rapido` pula
o Lighthouse. Uma checagem ou um app: `node packages/checagens/src/cli.js seo links --app apps/stratai`.
`--sem-rede` não pergunta ao Rastro (só para trabalhar desconectado; na CI ele pergunta sempre).

O que não barra (aparece como aviso no log e na anotação do PR):
- página com tracking sem `umami_website_id` no catálogo: os ids vêm do Strat Tracking e ainda não existem. Quando
  existirem, o `<Tracking>` carrega o `/u/script.js` e a checagem passa a exigir o script;
- link interno sem barra no fim que cai numa página que existe (passa por redirecionamento).

Exceções escritas no código, com o item que as tira:
- `packages/checagens/src/esqueletos.js`: a home de cada app é um esqueleto do WEB-15 (noindex, sem tracking) até
  o item de migração. A checagem exige noindex e nenhum tracking nessas URLs e quebra quando a página real ganha o
  `<Tracking>`, pedindo para tirar a URL da lista no mesmo PR;
- `/u/` não é conferido como link: o proxy do Umami é do Strat Tracking, fora do build.

O peso é medido no `dist/` servido na própria máquina da CI. No Lighthouse, os scripts do `<Tracking>` (Rastro,
MetricaaS, launcher da Hotmart, Umami) ficam bloqueados: são obrigatórios, não mudam por PR e variam a cada medição
(a página de venda oscilou entre 89 e 93 só por eles). Qualquer outro script de terceiro continua medido. Se a
primeira medição não passa, ele mede de novo antes de barrar. O número que vale para o site no ar
continua sendo o PageSpeed em produção (`docs/checklist-publicar.md`, D1).

## Regra de merge na main (WEB-20)
O ruleset está escrito em `.github/rulesets/main.json` e o Helbert aplica (Settings → Rules → Rulesets → Import,
ou `gh api -X POST repos/strat-web/sites/rulesets --input .github/rulesets/main.json`): só admin do repositório
aplica. Ele pede:
- PR para tudo que entra na `main` (nada de push direto), sem apagar a branch e sem force push;
- nenhuma aprovação obrigatória em geral, mas a do dono do caminho no `CODEOWNERS` quando o PR toca nele
  (`packages/`, `catalogo/`, `.github/`, `docs/decisoes.md`, `/package.json` e `/pnpm-workspace.yaml` → Helbert);
  aprovação antiga cai quando chega commit novo;
- as 6 checagens verdes (`build`, `seo`, `tracking`, `links`, `peso`, `catalogo`). O preview do Cloudflare Pages não
  é obrigatório: ele só builda o app que mudou.

Fora das pastas com dono, o dev mescla o próprio PR sozinho com as checagens verdes. O admin da organização pode
mesclar o próprio PR em pasta com dono (`bypass_mode: pull_request`), mas sempre por PR, nunca por push direto
(decisão do Helbert, 12/11, PR #9). Depois do merge, o Helbert aplica o ruleset pela API e confere no primeiro PR que
mexer em `packages/`: a aprovação do dono tem de ser pedida mesmo com 0 aprovações obrigatórias.
