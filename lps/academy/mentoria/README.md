# lps/academy/mentoria · mentoria.stratacademy.com.br

LP da **Mentoria Strat AI** (produto `mentoria` no Rastro, checkout Hotmart `S99990328Q`), no Cloudflare Pages
(projeto `academy-mentoria`, prévia em https://academy-mentoria.pages.dev). Migrada do `strat-lps` (`lps/mentoria`,
branch `master`, 05ca028) no WEB-48, em 17/11/2026, **sem mudar texto, layout nem tracking**, no padrão do WEB-32 e da
`lps/academy/claude`.

| Página | Arquivos | Linha do catálogo | Indexa |
|---|---|---|---|
| `/` (V1, a principal) | `src/pages/index.astro` + `src/html/home.*.html` | `academy-mentoria` | sim |
| `/v2/` (a página antiga, React/Vite) | `src/pages/v2/index.astro` + `src/html/v2.*.html` + `public/v2/assets/` | `academy-mentoria-v2` | não |

As duas com `perfil="venda"`: o `<Tracking>` do kit põe o `/sa?product=mentoria` do Rastro (pixel, GA4 e Google Ads vêm
do produto), o launcher da Hotmart (conta da Academy) e o Umami do host. Consentimento `off`, exceção herdada
(`docs/decisoes.md`, 11/11/2026). Planos: Start `?off=e7rrc4yj`, Aceleração `?off=jycwjai3`, Premium `?off=zpzw0xqq`.

## Como as páginas são montadas
- V1: `src/html/home.head.html` (fontes, `<style>`, cor do tema) e `src/html/home.corpo.html` (o `<body>` inteiro, com
  os scripts e o JSON-LD da página, `Service` e `FAQPage`). O `.astro` passa título, descrição e cartão ao `Layout`.
- V2: o app React compilado (`helbertparanhos/lp-mentoria-v2`, `base: '/v2/'`) mora em `public/v2/assets/` como veio;
  `src/html/v2.head.html` traz as fontes, o JS e o CSS do app e `src/html/v2.corpo.html` o `<div id="root">`. O app
  usa os logos e a foto da raiz (`/logos/`, `/images/helbert.webp`), os mesmos da V1.
- Mídia e JS em `public/`, nos mesmos caminhos do `strat-lps`. Não vieram o `v2/logos/` (duplicado, o app usa
  `/logos/`), o `v2/tracking.js` (nenhuma página carrega) e o `robots.txt`/`sitemap.xml` à mão.

## O que mudou em relação ao strat-lps (e por quê)
| Mudança | Por quê |
|---|---|
| O `/sa` do Rastro (fim do `<body>`) e o launcher da Hotmart (`<head>` da V1) saíram do HTML e entram pelo `<Tracking>` | regra dura 2 (tracking só pelo kit) |
| V2 ganha o launcher da Hotmart (no ar ela só tinha o `/sa`) | o perfil `venda` do kit põe o launcher em toda página de venda; o Rastro detecta o launcher e não duplica |
| V1, rodapé: "Política de Privacidade" ia para `#`; agora vai para https://stratacademy.com.br/politica-de-privacidade/; "Termos de Uso" (`#`) saiu | link sem destino (a checagem `seo` barra); a Academy não tem página de termos |
| V2: `<html class="dark">` e as classes do `<body>` entram por um script de uma linha antes do 1º desenho | o `Layout` do kit não recebe classe no `<html>` nem no `<body>`; o tema escuro do app depende delas |
| V2: H1 provisório dentro do `#root`, o mesmo H1 do app com as mesmas classes (decisão do Jhonathan em 17/11) | o HTML estático do app não tinha `<h1>` (a checagem `seo` pede um); o React troca tudo o que está no `#root` quando carrega, então ele só aparece enquanto o JS não chega |
| V2: saiu o ícone `/vite.svg` | o arquivo não existia (404 no ar) |
| V2: descrição da página = a da V1; noindex | no ar ela não tinha description; é variante de teste do mesmo produto |
| V1: canonical e og:url com barra no fim; og:image segue a `images/claude-logo.webp` | padrão de URL do repositório |
| Página 404 da Academy | no ar, caminho que não existe caía na LP da quaia |
| `robots.txt`, `sitemap.xml` e `llms.txt` gerados pelo kit | os da pasta antiga eram à mão (WEB-18) |

## Fontes locais (WEB-48)

As mesmas famílias e pesos da origem são servidos pelo Pages, sem CSS de fonts.googleapis.com na primeira pintura. Na Mentoria V2, o arquivo Material Symbols foi reduzido aos ícones usados, preservando as ligaturas e variações. Esta mudança reduz bloqueio de renderização e trocas de tamanho do texto sem alterar a tipografia.

## Rotas jurídicas da V2

`/v2/termos/` e `/v2/privacidade/` agora têm entrada estática e linha no catálogo (conteudo, noindex), usando o conteúdo já existente no Router do app. Os links do rodapé apontam para essas rotas; `/termos` e `/privacidade` redirecionam com 301. Os vídeos da seção de depoimentos usam `loading="lazy"` para não disputar rede com o primeiro quadro.

Três ilustrações remotas dos cards já retornam erro na origem. O app preserva a URL original e usa a marca oficial (`/logos/Logo.svg`) como fallback caso o download falhe; nenhum retrato ou depoimento foi substituído.
