# lps/academy/claude · claude.stratacademy.com.br

LP do **Curso Claude Code para Negócios** (produto `quaia` no Rastro e na Hotmart), no Cloudflare Pages (projeto
`academy-claude`, prévia em https://academy-claude.pages.dev). Migrada do `strat-lps` (`lps/quaia`, branch `master`,
05ca028) no WEB-48, em 17/11/2026, **sem mudar texto, layout nem tracking**, no mesmo padrão do WEB-32 (`apps/stratai`).

| Página | Arquivos | Linha do catálogo | Indexa |
|---|---|---|---|
| `/` (V2, a principal) | `src/pages/index.astro` + `src/html/home.*.html` | `academy-claude` | sim (única no sitemap) |
| `/v1/` (QUAIA, a original) | `src/pages/v1/index.astro` + `src/html/v1.*.html` | `academy-claude-v1` | não |
| `/v3/` (estrutura longa, tema claro) | `src/pages/v3/index.astro` + `src/html/v3.*.html` | `academy-claude-v3` | não |
| `/v4/` (tema escuro) | `src/pages/v4/index.astro` + `src/html/v4.*.html` | `academy-claude-v4` | não |

Todas com `perfil="venda"`: o `<Tracking>` do kit põe o `/sa?product=quaia` do Rastro (pixel 2790080268035647, GA4 e
Google Ads vêm do produto), o launcher da Hotmart (conta da Academy) e o Umami do host. Consentimento `off`, exceção
herdada (`docs/decisoes.md`, 11/11/2026). O checkout segue no mesmo produto da Hotmart (`D104661280B`).

## Como as páginas são montadas
- O HTML de cada versão está em `src/html/<versão>.head.html` (fontes, `<style>`, preloads, cor do tema) e
  `src/html/<versão>.corpo.html` (o `<body>` inteiro, com os scripts da página). Para mudar texto, é editar ali.
- O `.astro` passa título, descrição e cartão de compartilhamento ao `Layout` do kit, que gera `<title>`, description,
  canonical, robots, Open Graph, JSON-LD da marca e o `<Tracking>`. Por isso o HTML não tem nenhuma dessas tags (o
  teste `test/migracao.test.js` barra se voltarem, e também tracking colado e arquivo citado que não existe).
- Mídia, fontes e JS em `public/`, nos mesmos caminhos do `strat-lps` (`images/`, `fonts/`, `js/`, `v1/…`, `v3/…`,
  `v4/…`). Só vieram os arquivos que as páginas citam (os outros da pasta antiga não eram usados).

## O que mudou em relação ao strat-lps (e por quê)
| Mudança | Por quê |
|---|---|
| O `/sa` do Rastro (fim do `<body>`) e o launcher da Hotmart (`<head>`) saíram do HTML e entram pelo `<Tracking>`, no `<head>`, com os mesmos `src` e a mesma conta | regra dura 2 (tracking só pelo kit) |
| Rodapé: "Política de Privacidade" ia para `#`; agora vai para https://stratacademy.com.br/politica-de-privacidade/ | link sem destino (a checagem `seo` barra) e checklist A5 (política linkada) |
| Rodapé: "Termos de Uso" (`#`) saiu | a Academy não tem página de termos; o link não levava a lugar nenhum |
| `images/senior.webp` (2048 px, 1 MB) e `images/empreendedor.webp` (2048 px, 615 KB) em 1080 px (49 e 51 KB, qualidade 80) | o mesmo tamanho da `marketing.webp`; a página caiu de 1,9 MB para 396 KB (teto de 1,5 MB, `docs/padroes.md`). As fotos aparecem a no máximo ~520 px de largura |
| `/v1/`, `/v3/` e `/v4/` com noindex | no ar, ficavam fora do sitemap ("variantes são cópias da oferta e não entram"), mas sem noindex; a v3 e a v4 tinham canonical próprio |
| v3 e v4: canonical com barra no fim (`/v3/`) e og:url do kit | padrão de URL do repositório; `/v3` sem barra responde 308 para `/v3/` com a query |
| Página 404 da Academy | no ar, caminho que não existe respondia o 404 genérico do servidor |
| `robots.txt`, `sitemap.xml` e `llms.txt` gerados pelo kit | os da pasta antiga eram à mão (`WEB-18`) |

## Desempenho
Critério do Helbert para esta LP (WEB-63, 12/11/2026): LCP abaixo de 2,5 s na mediana de 5 rodadas do PageSpeed no
celular, medido no preview do Pages, com o atraso do `div.hero-art` isolado e `content-encoding` e `cache-control`
conferidos. Medições no PR do WEB-48.

## Fontes locais (WEB-48)

As mesmas famílias e pesos da origem são servidos pelo Pages, sem CSS de fonts.googleapis.com na primeira pintura. Na Mentoria V2, o arquivo Material Symbols foi reduzido aos ícones usados, preservando as ligaturas e variações. Esta mudança reduz bloqueio de renderização e trocas de tamanho do texto sem alterar a tipografia.
