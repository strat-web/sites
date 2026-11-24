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

**Fonte reserva calibrada (20/11/2026).** O título do topo pinta antes de a Clash Grotesk chegar. Com a reserva do
sistema (no Linux do PageSpeed ela é mais larga), o H1 ganhava linhas e empurrava o `.hero-art` na troca (CLS 0,177 no
`div.hero-art`). Home, v1 e v3 declaram a `'Clash Grotesk Reserva'`: Arial Bold local (ou Liberation Sans Bold / Arimo
Bold, que têm as mesmas medidas) com `size-adjust` 95,25% (600) e 94,67% (700) e `ascent`/`descent`/`line-gap` da
Clash (890/250/90 por 1000), medidos com fontTools sobre o texto do H1. Com a Clash carregada, nada muda na tela; a
v4 usa outras famílias e ficou como estava. Medições no PR.

**Reserva do Android (23/11/2026).** No Android, Arial, Liberation e Arimo podem não existir (revisão do Helbert de
23/11 no WEB-48), e a pilha caía na Roboto sem calibrar. Depois da `'Clash Grotesk Reserva'` vem a
`'Clash Grotesk Reserva Android'`: Roboto Bold local com `size-adjust` 101,69% (600) e 101,21% (700), medidos com o
mesmo método (fontTools, média dos títulos da home e da v1), e as métricas da Clash divididas pelo `size-adjust`.
Altura do H1 e topo do `.hero-art` a 360, 375, 390, 412 e 430 px na home, v1 e v3: iguais aos da Clash nos 15 casos;
com a Roboto sem calibrar, a v1 a 412 px (a largura do PageSpeed) perdia uma linha e o topo subia 32 px.

## Fontes locais (WEB-48)

As mesmas famílias e pesos da origem são servidos pelo Pages, sem CSS de fonts.googleapis.com na primeira pintura. Na Mentoria V2, o arquivo Material Symbols foi reduzido aos ícones usados, preservando as ligaturas e variações. Esta mudança reduz bloqueio de renderização e trocas de tamanho do texto sem alterar a tipografia.

## Fontes e variantes no celular

Clash Grotesk Semibold/Bold e Geist mantêm os desenhos e métricas da origem, com subconjuntos Latin locais e preload das três fontes usadas na primeira dobra. Isso evita a troca de tamanho do título e o deslocamento do hero. As variantes V1 e V3 também recebem cópia de 720 px do hero no celular; o recurso original continua no desktop. Fonte do critério de LCP: comentário do Helbert na WEB-48 em 12/11/2026.
