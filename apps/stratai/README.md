# apps/stratai · stratai.com.br

Site da StratAI no Cloudflare Pages (projeto `stratai`, prévia em https://stratai-ti7.pages.dev). Migrado do
`strat-lps` (`lps/stratai`) no WEB-32, em 12/11/2026, **sem mudar texto, layout nem tracking** (decisão do Helbert,
12/11/2026).

| Página | Arquivo | Linha do catálogo | Tracking (pelo `<Tracking>` do kit) |
|---|---|---|---|
| `/` | `src/pages/index.astro` + `src/html/home.*.html` | `stratai` | Rastro `stratai` e MetricaaS `agencia-strat` |
| `/raio-x/` | `src/pages/raio-x/index.astro` + `src/html/raio-x.*.html` | `stratai-raio-x` | Rastro `raio-x-ia` e MetricaaS `agencia-strat` |
| `/politica-de-privacidade/` | `src/pages/politica-de-privacidade/index.astro` + `src/html/politica-de-privacidade.*.html` | `stratai-politica-de-privacidade` | nenhum (como no ar) |
| `/kit/`, `/kit/lead/`, `/kit/conteudo/` | páginas de teste do kit (noindex) | `stratai-kit-*` | saem antes de o domínio virar |
| `/recuperacao/v1/` a `/v4/` | `src/pages/recuperacao/v*/index.astro` + `src/html/recuperacao/v*.*.html` | `stratai-recuperacao-v*` | Rastro `stratai` e MetricaaS `agencia-strat` |
| `/recuperacao/cases/` e `/recuperacao/cases/<cliente>/` | `src/pages/recuperacao/cases/` (conteúdo em `public/recuperacao/comum/cases.js`) | `stratai-recuperacao-case*` | Rastro `stratai` e MetricaaS `agencia-strat` |

## Funil de recuperação de vendas (`/recuperacao/`, WEB-91)
Formulário de qualificação do produto de recuperação comissionada (15% só do que for recuperado), construído na
DEV-94 para o tráfego pago. **Rascunho e `noindex`** até os cases terem conteúdo e autorização dos clientes e o produto
low ticket da V4 ser definido (os `[X]` marcam o que falta).
- A fonte é o projeto `FunilRecuperacao-StratAI` (dev_ops do Jhonathan); `scripts/para-o-repo.py` gera
  `public/recuperacao/` e `src/html/recuperacao/`. Mudança de texto ou regra: no `public/recuperacao/comum/funil.js`
  (perguntas, saídas, lâminas, agenda, produto, classificação, envio) e no `cases.js` (cases).
- 4 versões com as mesmas 7 perguntas, as 2 lâminas antes do formulário (o que a gente banca e o carrossel de cases,
  não clicável) e o mesmo fim ("seu perfil entrou em análise"). V4: compra rápida e agenda com o Helbert no fim.
- Lead: `mtc.lead()` uma vez no fim (o m.js vem do `<Tracking>`), só em `stratai.com.br` (o `.pages.dev` não envia).
  A e B vão como `qualificado`, C como `desqualificado`. Eventos `funil_*` e `cta_click`, sem resposta nem dado pessoal.
- V1, V2 e V4 trazem a abertura pronta no HTML (`data-pre="abertura"`), para a primeira tela pintar antes do JS (LCP).

## Como as páginas migradas são montadas
- O HTML de cada página está em `src/html/<página>.head.html` (favicon, cor do tema, fontes, `<style>`) e
  `src/html/<página>.corpo.html` (o `<body>` inteiro, com o script da página). Para mudar texto, é editar ali.
- O `.astro` passa título, descrição e cartão de compartilhamento ao `Layout` do kit, que gera `<title>`, description,
  canonical, robots, Open Graph, JSON-LD da marca e o `<Tracking>` da linha do catálogo. Por isso o HTML não tem
  nenhuma dessas tags (o teste `test/migracao.test.js` barra se voltarem).
- Imagens em `public/midia/` (as mesmas do `strat-lps`); o CSS da política (o mesmo da política da Agência) em
  `public/css/`.

## O que mudou em relação ao strat-lps (e por quê)
| Mudança | Por quê |
|---|---|
| As tags do Rastro e do MetricaaS saíram do fim do `<body>` e entram no `<head>` pelo kit, com o m.js antes do Rastro, os dois com `defer` | regra dura 2 (tracking só pelo `<Tracking>`) e regra dura do lead (m.js primeiro). Mesmos `src` e `data-ws` |
| Os 6 links de WhatsApp da home saem com o `wa.me` escrito no `href` (antes `href="#"`, montado pelo script) | o link vira o mesmo que o script já montava, letra por letra; a checagem `seo` barra `href="#"`. O script continua igual |
| `/politica-de-privacidade` ganhou barra no fim; os links da home e do Raio-X apontam para a forma com barra | padrão de URL do repositório; a forma antiga responde 301 (`public/_redirects`) |
| Na política, `midia/` e `agencia/css/` viraram `/midia/` e `/css/` | com a barra no fim, o caminho relativo deixaria de achar a imagem e o CSS. No ar, o CSS vinha por um 301 para agencia.stratai.com.br |
| `<meta name="robots" content="index, follow">`, `twitter:card` na política e o JSON-LD da StratAI no `<head>` | o kit põe em toda página |
| `/raio-x/v1/` (primeira versão, noindex, só referência) não veio: responde 301 para `/raio-x/` | página não divulgada; sem ela, o 301 evita o 404 |

## Redirecionamentos (`public/_redirects`)
`/politica-de-privacidade` e `/politica-de-privacidade.html` → `/politica-de-privacidade/`; `/agencia` e `/agencia/*`
→ `https://agencia.stratai.com.br/` (o mesmo 301 que o servidor do `strat-lps` fazia desde 31/10/2026);
`/raio-x/v1/*` → `/raio-x/`. Todos 301, com a query junto.

## Desempenho
A home mede abaixo do orçamento do Lighthouse (no ar em 12/11/2026: performance 68, LCP 5,4 s; no build: 80 e 3,9 s).
Como a migração não muda a página, ela está em `packages/checagens/src/excecoes-peso.js`, com o número do ar como piso.
