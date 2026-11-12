# Portão F2 · página de teste do kit (WEB-22)

Data: 2026-11-12. O kit só está pronto quando uma página feita com ele passa em tudo: as 6 checagens da CI e os
itens A a E de `docs/checklist-publicar.md`.

**A página:** `apps/agenciastrat/src/pages/kit/portao/index.astro`, URL canônica
`https://agenciastrat.com.br/kit/portao/` (noindex; no ar só no preview do Pages `agenciastrat`, sai antes de o
domínio virar, no WEB-23).

| Peça do kit | Como entra na página |
|---|---|
| `Layout` | casca da página, `marca="agencia"`, `perfil="conteudo"`, `indexar={false}` |
| `Seo` | pelo `Layout`: título, descrição, canonical, robots, Open Graph, cartão do X |
| `JsonLd` | pelo `Layout` (a marca, `ProfessionalService`) e direto, no slot `head`, com a `WebPage` da página |
| `Breadcrumb` | Início › Portão F2, com `BreadcrumbList` |
| `Faq` | 3 perguntas, com `FAQPage` |
| `Tracking` | pelo `Layout`, com os ids da linha `agenciastrat-kit-portao` do catálogo |

**A linha do catálogo:** `agenciastrat-kit-portao`, `tipo: ferramenta`, `perfil: conteudo`, `consentimento: banner`,
`indexar: false`, `item: WEB-22` e o campo novo `"teste": true` (definido em `campos` do `catalogo/sites.json`).
Perfil `conteudo` com `banner` porque é o que o WEB-72 manda para página nova de conteúdo (decisão do Helbert de
11/11); sem Rastro, o banner é o do kit e o pixel vem pelo `m.js` do MetricaaS (`docs/tracking.md`).

**Como foi conferido:** build dos 4 apps; `pnpm test`; `node packages/checagens/src/cli.js` com o Lighthouse e com o
Rastro; o `dist/` servido na própria máquina (`python3 -m http.server`) e aberto no Chrome com
`?utm_source=teste&utm_medium=verificacao`, armazenamento do site limpo antes de cada medida; medidas a 390 e 1440 px
com o Chrome emulando o aparelho (CDP). O que só o preview mostra fica no corpo do PR, com o link.

## As 6 checagens da CI

| Checagem | Resultado na máquina (12/11) |
|---|---|
| build | ok: `pnpm build` (4 apps; a agenciastrat com 4 páginas) e `pnpm test` (kit 29 testes, checagens 17, 0 falhas) |
| seo | ok: um `<title>` e um `<h1>` únicos, canonical igual à URL, 4 blocos JSON-LD válidos, fora do sitemap por ser noindex |
| tracking | ok: o `m.js` com `data-ws`, `data-pixel` e `data-pixel-consent` bate com a linha; nada colado à mão (aviso esperado: sem `umami_website_id`) |
| links | ok: `/` e o selo existem no build; nenhum `href="#"` |
| peso | ok: 11 KB; Lighthouse no celular: performance 100, LCP 1,4 s, CLS 0 |
| catalogo | ok: a página tem linha, com `app: apps/agenciastrat`, campos obrigatórios e valores da lista |

A execução na CI sai no PR (link no corpo do PR).

## Checklist de publicar, A a E

### A · Conteúdo e preview
| # | Resultado | Evidência |
|---|---|---|
| A1 | ok | `grep -ciE 'lorem\|localhost\|pages\.dev\|\[X\]\|<<'` no HTML gerado: 0. Links da página: `/`, `wa.me`, a política da Agência |
| A2 | ok | `<meta name="robots" content="noindex, nofollow">` e canonical `https://agenciastrat.com.br/kit/portao/` (nunca `pages.dev`). No `.pages.dev`, também `X-Robots-Tag: noindex` pelo `_headers`. A página é de teste: não vai para produção, então o "produção sem noindex" não se aplica a ela |
| A3 | não se aplica | página de teste, sem oferta, preço, número ou promessa; o texto descreve o próprio teste e é revisado no PR |
| A4 | ok | uma imagem (`selo.svg`, desenhada para o teste, sem pessoa): `alt="Selo verde de aprovado com o texto Portão F2"` |
| A5 | ok | link "Política de privacidade" no rodapé e no banner de cookies, para `https://agencia.stratai.com.br/politica-de-privacidade` (responde 200 em 12/11). Muda para o domínio novo no WEB-23 (`marcas.js`) |
| A6 | não se aplica | página de teste, não é nicho regulado nem destino de anúncio |

### B · Conversão
| # | Resultado | Evidência |
|---|---|---|
| B1 | ok | a 390 × 844 px, o botão "Falar com a Agência no WhatsApp" fica entre 505 e 559 px do topo, acima do banner de cookies |
| B2 | ok | `<a href="https://wa.me/554831994338?text=...">` escrito no HTML gerado (não montado por script) |
| B3 | ok | o botão tem `data-strat-cta="hero-whatsapp"`. Formulário: não se aplica (perfil `conteudo` não tem formulário de lead, `docs/tracking.md`) |
| B4 | ok | a 390 px, `document.documentElement.scrollWidth` = 390 (sem rolagem lateral); corpo com 16 px. A primeira versão tinha 401 px por causa de um `<code>` longo, corrigido com `overflow-wrap: anywhere` |

### C · Tracking
| # | Resultado | Evidência |
|---|---|---|
| C1 | ok | só o `<Tracking>` do kit (pelo `Layout`); a checagem `tracking` passa e não acha pixel, gtag, GTM nem TikTok à mão |
| C2 | não se aplica | a linha não usa Rastro (`rastro_slug: null`); a Agência não tem produto no Rastro |
| C3 | não se aplica | página de teste, só no preview. `agenciastrat.com.br` entra na lista do MetricaaS e do pixel na virada do domínio (WEB-23, WEB-26) |
| C4 | ok | na abertura: `m.js`, `mf.js` e `/e` do MetricaaS (204), `fbevents.js` e nenhum `facebook.com/tr`. Depois de "Aceitar": `signals/config/1815630929780241` e um `PageView` do pixel 1815630929780241 com `dl` levando as UTMs de teste. Clique no WhatsApp: `/e` do MetricaaS (204) e o código do MetricaaS no texto do `wa.me` (navegação bloqueada no teste, nada enviado). `Lead`: não se aplica (sem formulário) |
| C5 | não se aplica | o `event_id` igual no navegador e na CAPI é do `Lead`, e a página de conteúdo não tem formulário. O caso com lead é o da home da Agência (WEB-11, `agenciastrat.md`) |
| C6 | ok | sem escolha: banner com Recusar e Aceitar, nenhum `/tr`. "Recusar": `strat_cookies=nao`, banner some, nenhum `/tr`. "Aceitar": `strat_cookies=sim`, `PageView` ×1. Bate com a política de `banner` (`docs/tracking.md`). O MetricaaS mede nos dois casos, como manda a regra do lead |

### D · Técnico
| # | Resultado | Evidência |
|---|---|---|
| D1 | ok | Lighthouse no celular (checagem `peso`): performance 100, LCP 1,4 s, CLS 0; página com 11 KB. O PageSpeed no preview está no corpo do PR |
| D2 | ok | a única imagem é a da primeira dobra: sem `loading="lazy"`, com `fetchpriority="high"`, `width="320"` e `height="120"` |
| D3 | ok | `robots.txt`, `sitemap.xml` e `llms.txt` gerados pelo kit (a página fica fora do sitemap e do llms.txt por ser noindex; no `agenciastrat.pages.dev` os três respondem 200 em 12/11). Um `<title>`, uma descrição, um `<h1>`, `lang="pt-BR"`, `og:image`, 4 blocos JSON-LD (marca, `WebPage`, `BreadcrumbList`, `FAQPage`) validados pela checagem `seo` |
| D4 | não se aplica | o domínio ainda não serve este repositório; no `.pages.dev` o HTTPS é o do Cloudflare. www ↔ raiz com 301 entra na virada (WEB-26) |
| D5 | ok | `_headers` gerado no build; `curl -sI https://agenciastrat.pages.dev/kit/lead/` (mesmo `_headers`) em 12/11: HSTS, `nosniff`, `frame-ancestors 'self'`, `Referrer-Policy`, `Permissions-Policy` e `X-Robots-Tag: noindex`. Na própria página, no preview: corpo do PR |
| D6 | não se aplica | URL nova, sem rota antiga |

### E · Depois de publicar
| # | Resultado | Evidência |
|---|---|---|
| E1 | ok | linha `agenciastrat-kit-portao` com a URL, `perfil`, ids, `indexar: false` e `"teste": true` |
| E2 | não se aplica | página noindex, fora do sitemap |
| E3 | não se aplica | página noindex: o certo é ela **não** ser indexada |
| E4 | não se aplica | o diagnóstico de LP do plugin ainda não existe (F5, WEB-41) e a página é de teste |

## Resultado

O kit passa no portão F2: as 6 checagens verdes e, de A a E, nenhum item falhou. Os itens que não se aplicam são os
que dependem do domínio no ar (C3, D4, E2, E3), de formulário de lead (C5), de Rastro (C2) ou do plugin de LP (E4);
cada um tem o item que o cobre na página real.
