# lps/academy/vibecode · vibecode.stratacademy.com.br

LP da **aula gratuita de Claude Code + 15 skills** (produto `aula-claude-code` no Rastro, captação de lead, **sem
checkout**), no Cloudflare Pages (projeto `academy-vibecode`, prévia em https://academy-vibecode.pages.dev). Migrada do
`strat-lps` (`lps/vibecode`, branch `master`, 05ca028) no WEB-48, em 17/11/2026, **sem mudar texto nem layout**, no
padrão do WEB-32 e da `lps/academy/claude`. Não confundir com `imersao-claude-code` (a Imersão paga do Gabriel).

| Página | Arquivos | Linha do catálogo | Indexa |
|---|---|---|---|
| `/` (V2, a principal) | `src/pages/index.astro` + `src/html/home.*.html` | `academy-vibecode` | sim |
| `/v1/` (a original, arquivada) | `src/pages/v1/index.astro` + `src/html/v1.*.html` | `academy-vibecode-v1` | não |

As duas com `perfil="lead"`: o `<Tracking>` do kit põe o `/sa?product=aula-claude-code` do Rastro (pixel, CAPI, GA4,
Google Ads e PostHog vêm do produto) e o Umami do host, **sem** o launcher da Hotmart (a página não vende). Consentimento
`soft` (o aviso recusar/ok do Rastro).

## O caminho do lead (igual ao do ar)
- V2: todo CTA abre o popup. Etapa 1, WhatsApp verificado no ZAP Gateway (`aplicativos-gateway-v2…`, chave pública do
  widget); etapa 2, nome e e-mail; no envio, `stratTrack('Lead')` no Rastro **e** POST ao webhook do n8n
  (`n8nwebhook.strat.tec.br/webhook/31d85ee0-…`, o mesmo da V1); depois, `comunidade.stratacademy.com.br/?f=vibecode`
  com as UTMs na URL. Configuração no bloco `CONFIG` do script do corpo. Detalhes no README do `strat-lps`.
- V1: e-mail no hero → popup de WhatsApp → POST ao mesmo webhook do n8n → `links.stratacademy.com.br/comunidade`.
- **Não testar o envio** no preview nem local: cada envio é um lead de verdade no n8n e no Rastro.
- O ZAP Gateway só responde às origens de `stratacademy.com.br` e subdomínios: no `*.pages.dev` e no local a verificação
  do WhatsApp volta 403 e cai no caso "gateway fora do ar" (não trava, segue com `whatsapp_status: "error"`). Na virada
  do DNS para o subdomínio de sempre, volta a verificar.

## O que mudou em relação ao strat-lps (e por quê)
| Mudança | Por quê |
|---|---|
| Catálogo: `academy-vibecode` de `perfil: venda` para `lead` e `hotmart_conta` vazio | a página não vende e no ar não tem o launcher da Hotmart; com `venda` o kit poria o launcher. `lead` com Rastro é o que o kit desenha para captação (docs/tracking.md) |
| V2: o `/sa` do Rastro saiu do HTML e entra pelo `<Tracking>` | regra dura 2 (tracking só pelo kit) |
| V1: saiu o GTM `GTM-N3K4THGD` (script e `<noscript>`) e entra o `<Tracking>` (Rastro `aula-claude-code`) | regra dura 2 (ninguém cola GTM); o mesmo caminho da V2 da mentoria. A V1 está arquivada e não dispara `Lead` no Rastro (no ar também não disparava pelo Rastro) |
| V1: a classe do `<body>` do original entra por um script de uma linha | o `Layout` do kit não recebe classe no `<body>` |
| V1: canonical para a própria `/v1/` (no ar apontava para a V2); segue noindex | o kit gera o canonical da própria página, como nas variantes da claude |
| Título, description, canonical, Open Graph e robots vêm do `Layout`, com os mesmos textos | padrão do kit |
| Página 404 da Academy; `robots.txt`, `sitemap.xml` e `llms.txt` gerados pelo kit | padrão do kit (WEB-75, WEB-18) |

Não vieram `v1/assets/css/style.css` e `v1/assets/js/main.js` (nenhuma página carrega).
