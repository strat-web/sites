# Decisões

Uma entrada por decisão, com data e quem decidiu. A mais nova em cima.

## 2026-11-12 · `lastmod` do sitemap com o histórico buscado no build (Helbert, revisão do PR #7)
O build do Pages clona raso, e sem histórico o `lastmod` não sai. Decisão: buscar o histórico no build com
`git fetch --unshallow`, e seguir sem data se a busca falhar (o `|| true` da revisão). A busca roda dentro da
integração do kit (`completarHistorico`, `packages/kit/src/arquivos-do-site.js`), para valer em qualquer comando de
build; se falhar, o `sitemap.xml` sai sem `lastmod` e o build avisa, em vez de pôr a mesma data em todas as páginas.

## 2026-11-11 · Cabeçalhos de segurança do kit (Jhonathan, WEB-21; espera o Helbert no PR)
- **HSTS sem `includeSubDomains` e sem `preload`**: stratai, stratacademy e metricaas têm subdomínios que não são
  deste repositório (`n8n`, `git`, `hub`, `tracking`, `t.`); o HSTS os prenderia a HTTPS por um ano sem a gente
  controlar. Subir para `includeSubDomains` é decisão à parte, depois de conferir cada subdomínio.
- **CSP só com `frame-ancestors 'self'`**: uma CSP de scripts teria de listar Rastro, MetricaaS, Meta, Google,
  Hotmart e PostHog, e quebraria a medição no primeiro script novo.
- **Pagamento fora da Permissions-Policy** (decisão do Helbert, 12/11, revisão do PR #11 e comentário no WEB-69):
  o `payment=()` partia de que o checkout da Hotmart é link, mas o upsell e o downsell do bootcamp usam o Checkout
  Elements, que monta um iframe de `pay.hotmart.com` (e `pci-pay.hotmart.com` para o cartão) com
  `allow="payment *"`. O cabeçalho ficou `camera=(), microphone=(), geolocation=(), usb=()`, sem `payment`. Substitui a
  lista `payment=(self "https://pay.hotmart.com" "https://pci-pay.hotmart.com")` do repasse de 11/11.
- **Um `_headers` só para os quatro apps**, gerado pela integração do kit; `public/_headers` no app quebra o build.

## 2026-11-11 · `sameAs` só com os perfis da própria marca (Jhonathan, WEB-16; espera o Helbert no PR)
O `seo-geo.md` pedia `sameAs` "das outras marcas e redes". Pela definição do schema.org, `sameAs` diz que a URL é a
**mesma** entidade, então o site da Agência no `sameAs` da StratAI diria ao Google que as duas são uma empresa só.
No kit, o `sameAs` leva só os perfis da própria marca (Instagram, LinkedIn, YouTube), e o vínculo entre as marcas vai
pelo `parentOrganization` "Grupo Strat", igual nas quatro. Se o Helbert preferir o texto antigo, é uma linha em
`packages/kit/src/marcas.js`.

## 2026-11-11 · Nome do projeto do Pages da Academy (Jhonathan, WEB-15)
O nome `stratacademy` no Pages já é o projeto que serve stratacademy.com.br em produção, ligado ao repositório horus.
O app `apps/stratacademy` deste repositório vira o projeto **`sites-stratacademy`**, sem mexer no projeto antigo. Como o
domínio passa para cá fica para o Helbert decidir no WEB-49 (detalhe em `pages.md`, "A questão da stratacademy").

## 2026-11-11 · Como o catálogo guarda o que a página carrega (Jhonathan, no WEB-13; aprovação do Helbert no PR)
- Os ids de cada linha de `catalogo/sites.json` são os que a página **deve** carregar, porque o `<Tracking>` lê dali.
  O que a página carrega hoje e é diferente vai em `diferenca_hoje`, com o item que corrige. Assim o catálogo bate
  com a auditoria linha a linha sem virar retrato de um erro.
- Migração sem mudar tracking (WEB-23, WEB-32) leva o que está no ar: a Agência fica sem GA4 e sem tag do Google
  até alguém decidir ligar (T3).
- Na LP claude., o `ga4` guarda a tag que carrega (G-3RYFFP7EF5, do produto `quaia` no Rastro); ela entrega na
  propriedade G-R84BNVV2HX, a mesma das outras LPs (T2).
- Campos novos: `umami_website_id`, `consentimento`, `dono` e `diferenca_hoje`.

## 2026-11-04 · Organização dos sites (Helbert)
Plano: https://claude.ai/artifact/7YroEqx8kQtjt7NQKMxZc8. Todas as recomendações aprovadas.

| # | Decisão |
|---|---|
| D1 | Organização nova no GitHub: `strat-web` |
| D2 | Repositório público, para ganhar regra de merge e varredura de segredo no plano grátis (nasceu privado em 04/11; vira público depois da revisão do conteúdo) |
| D3 | Monorepo `sites`, com o CODEOWNERS separando quem revisa o quê |
| D4 | Astro para os quatro sites; LP de campanha pode ser HTML estático dentro do kit |
| D5 | Zona `strat.tec.br` migra para a conta principal da Cloudflare por último, numa janela combinada |
| D6 | A Agência sai de `agencia.stratai.com.br` para `agenciastrat.com.br` com 301 por caminho; campanhas trocam a URL depois |
| D7 | Três perfis de tracking: venda, lead, conteudo (ver `tracking.md`) |
| D8 | O site da Academy sai do horus por último, fora de lançamento, com as URLs idênticas |
| D9 | Voz do blog da Agência: Gabriel |
| D10 | Metas de performance: 90 ou mais no celular, LCP até 2,5 s, CLS até 0,1, até 1,5 MB |
| D11 | Marketing entra com escrita em conteúdo e LP; o resto pede revisão de dev |
| D12 | Na Cloudflare, só Helbert e Gabriel são membros; o time usa token restrito |

Também em 2026-11-04: o projeto do Infisical `strat-web` (antigo, de segredos) passa a ser o dos sites; a migração
é tocada pelo Helbert e pelo Jhonathan, acompanhada no Plane, projeto `WEB` (P09 · Sites e LPs).
