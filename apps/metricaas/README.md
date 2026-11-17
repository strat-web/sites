# apps/metricaas · metricaas.com.br

Site do Metricaas no Cloudflare Pages (projeto `metricaas`, prévia em https://metricaas.pages.dev). Migrado do
`strat-lps` (`lps/metricaas`, branch `master`, commit 05ca028) no WEB-36, em 17/11/2026, **sem mudar texto, layout nem
tracking**, no mesmo molde da StratAI (WEB-32). O produto (`app.` e `go.metricaas.com.br`) continua no Easypanel e a
documentação (`docs.metricaas.com.br`) no Mintlify: nada disso mora aqui.

| Página | Arquivo | Linha do catálogo | Tracking (pelo `<Tracking>` do kit) |
|---|---|---|---|
| `/` | `src/pages/index.astro` + `src/html/home.*.html` | `metricaas` | Rastro `metricaas` (consentMode `off`) e Umami |
| `/politica-de-privacidade/` | `src/pages/politica-de-privacidade/index.astro` + `src/html/politica-de-privacidade.*.html` | `metricaas-politica-de-privacidade` | Rastro `metricaas` e Umami (como no ar) |
| `/termos-de-uso/` | `src/pages/termos-de-uso/index.astro` + `src/html/termos-de-uso.*.html` | `metricaas-termos-de-uso` | Rastro `metricaas` e Umami (como no ar) |

Sem `m.js` do MetricaaS e sem formulário: o site do produto não mede os próprios leads pelo MetricaaS (o contato é o
WhatsApp). Ligar isso é outro item.

## Como as páginas migradas são montadas
- O HTML de cada página está em `src/html/<página>.head.html` (favicon, cor do tema, fonte, `<style>` ou o CSS das
  páginas legais) e `src/html/<página>.corpo.html` (o `<body>` inteiro). Para mudar texto, é editar ali.
- O `.astro` passa título, descrição e cartão de compartilhamento ao `Layout` do kit, que gera `<title>`, description,
  canonical, robots, Open Graph, JSON-LD da marca e o `<Tracking>` da linha do catálogo. Por isso o HTML não tem
  nenhuma dessas tags (o teste `test/migracao.test.js` barra se voltarem).
- Imagens em `public/midia/` (as mesmas do `strat-lps`), a imagem de compartilhamento em `public/og.png` (o mesmo
  endereço de antes, que o `marcas.js` do kit já usa) e o CSS das páginas legais em `public/css/legal.css`.

## O que mudou em relação ao strat-lps (e por quê)
| Mudança | Por quê |
|---|---|
| A tag do Rastro saiu do fim do `<body>` e entra no `<head>` pelo kit, com `defer`; o Umami, que o servidor do `strat-lps` injetava, também vem do kit | regra dura 2 (tracking só pelo `<Tracking>`). Mesmo `src` (`/sa?product=metricaas`) e mesmo website do Umami |
| `/politica-de-privacidade` e `/termos-de-uso` ganharam barra no fim; os links internos apontam para a forma com barra | padrão de URL do repositório; a forma antiga (e a `.html`) responde 301 (`public/_redirects`). A política sem barra está cadastrada no app da Meta (Tech Provider) e na aprovação da API do Google Ads: o 301 mantém a âncora (`#exclusao-de-dados`) |
| `images/` virou `/midia/` e `legal.css` virou `/css/legal.css`, com caminho absoluto | padrão de pastas do repositório; com a barra no fim, o caminho relativo deixaria de achar o arquivo. `/images/*` e `/legal.css` respondem 301 |
| O favicon (`images/icon.png`) é o mesmo arquivo do logotipo do JSON-LD (`/midia/logo/metricaas.png`, WEB-77) e passa a vir de lá | um arquivo só; `/images/icon.png` responde 301 para ele |
| O logotipo do topo e do rodapé da home era `href="#"` e virou `href="/"` | a checagem `seo` barra `href="#"`; o destino é o mesmo (o início) |
| O link "política" da resposta sobre o Google Ads (`politica-de-privacidade.html`) aponta para `/politica-de-privacidade/` | mesma página, sem passar pelo 301 |
| `<meta name="robots" content="index, follow">`, `og:locale`, `og:site_name` e o JSON-LD do Metricaas no `<head>` | o kit põe em toda página |
| `robots.txt` e `sitemap.xml` saem do kit, não do arquivo da pasta antiga | o kit é a única fonte (`docs/padroes.md`); o sitemap passa a listar as URLs com barra |

O texto citado na seção 10 da política ("Endereço permanente desta seção": `https://metricaas.com.br/politica-de-privacidade#exclusao-de-dados`)
não mudou: a regra é não mexer no texto na migração, e esse endereço continua funcionando pelo 301.

## Redirecionamentos (`public/_redirects`)
`/politica-de-privacidade` e `.html` → `/politica-de-privacidade/`; `/termos-de-uso` e `.html` → `/termos-de-uso/`;
`/images/icon.png` → `/midia/logo/metricaas.png`; `/images/*` → `/midia/:splat`; `/legal.css` → `/css/legal.css`.
Todos 301, com a query junto.

## Desempenho
A home e a política medem abaixo do orçamento do Lighthouse já no ar (17/11/2026, 3 medições no Lighthouse da CI:
home com performance 75 a 90 e LCP 3,0 a 4,6 s; política com 88 a 89 e LCP 2,8 a 2,9 s). Como a migração não muda a
página, as duas estão em `packages/checagens/src/excecoes-peso.js`, com o pior número do ar como piso. No build, a
home mediu 91 e 2,9 s, a política 96 e 1,7 s e os termos 99 e 1,7 s.
