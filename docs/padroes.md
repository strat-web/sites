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
  conteudo/          schema do blog (Zod) e checar-posts
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
| `Layout` | `marca`, `titulo`, `descricao`, `imagem?`, `indexar?` (padrão `true`), `tipo?` (`website` ou `article`); slots: padrão (`<body>`) e `head` | `<html lang="pt-BR">`, `Seo` e `JsonLd` da marca |
| `Seo` | as mesmas do `Layout` e `caminho?` | title, description, canonical, robots, `og:*`, `twitter:card` |
| `JsonLd` | `marca?` e/ou `dados?` (objeto ou lista já montada, ex.: `Article`) | `<script type="application/ld+json">` com `<` escapado |
| `Breadcrumb` | `itens` (`{ nome, caminho }`, do início à página atual) | trilha visível + `BreadcrumbList` |
| `Faq` | `perguntas` (`{ pergunta, resposta }`, texto puro), `titulo?` | `<details>` visíveis + `FAQPage` |

- `marca` é a chave do catálogo: `agencia`, `stratai`, `academy`, `metricaas`. Marca nova ou rede nova entra em
  `packages/kit/src/marcas.js`, com a fonte no PR.
- Sem `imagem`, o Open Graph usa a imagem da marca. Caminho relativo vira absoluto pelo `site`.
- Página fora do índice (bio, obrigado, teste): `indexar={false}`.
- As regras ficam em `packages/kit/src/schema.js`, testadas com `pnpm --filter @strat/kit test`.
- Página de teste com tudo junto: `apps/stratai/src/pages/kit/index.astro` (`/kit/`, noindex).

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
| `/*` | `Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(self "https://pay.hotmart.com" "https://pci-pay.hotmart.com"), usb=()` | desliga câmera, microfone, localização e USB. Pagamento só na própria página e no iframe do Checkout Elements da Hotmart (upsell e downsell do bootcamp) |
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
| Checagem | Barra quando |
|---|---|
| build | algum app não compila |
| seo | título ou H1 repetido, sem canonical, `href="#"`, JSON-LD inválido, página indexável fora do sitemap |
| tracking | página sem `<Tracking>`, slug que o Rastro não conhece, pixel ou gtag colado à mão |
| links | link interno quebrado |
| peso | página acima do orçamento (performance ≥ 90, LCP ≤ 2,5 s, CLS ≤ 0,1, até 1,5 MB) |
| catalogo | URL nova sem linha em `catalogo/sites.json` |
