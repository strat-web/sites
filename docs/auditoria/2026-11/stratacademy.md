# Strat Academy · conferência no navegador (WEB-11)

Data: 2026-11-11. Mesmo método do [agenciastrat.md](agenciastrat.md).

**Limite desta rodada:** a extensão do Chrome usada na conferência recusa abrir `stratacademy.com.br`,
`skills.`, `bootcamp.` e `comunidade.` ("Navigation to this domain is not allowed"). Nesses quatro, a coluna
"Dispara" vem do HTML servido (curl) e da configuração que o Rastro devolve no `/sa`; o que o JavaScript dispara de
fato não foi visto. Refazer no navegador quando a extensão liberar esses hosts.

## Tabela por URL

| URL | Dispara | Rastro (`/sa`) | Banner | Falta | Duplica |
|---|---|---|---|---|---|
| claude.stratacademy.com.br/ (navegador) | pixel 2790080268035647 `PageView` ×1; gtag carregado com **G-3RYFFP7EF5** e AW-17263684860; hits do GA4 com `tid=G-R84BNVV2HX` (`page_view`); Google Ads `viewthroughconversion/17263684860`; `/tracker` ×2; launcher da Hotmart | `quaia`, `known: true`, `consentMode: off`, GA4 do produto = G-3RYFFP7EF5 | não | Umami | nada |
| mentoria.stratacademy.com.br/ (navegador) | pixel 860500981882285 `PageView` ×1; GA4 G-R84BNVV2HX `page_view`; AW-17263684860 (view-through); `/tracker` ×2 | `mentoria`, `known: true`, `off` | não | Umami | nada |
| vibecode.stratacademy.com.br/ (navegador) | pixel 860500981882285 `PageView` ×1 **antes da escolha**; GA4 G-R84BNVV2HX `page_view`; AW-17263684860; `/tracker` ×1 | `aula-claude-code`, `known: true`, `consentMode: soft` | aviso "recusar / ok" (soft: mede até recusar) | Umami | nada |
| skills.stratacademy.com.br/ (HTML + `/sa`) | script do Rastro `lp-500-skills`; pelo `/sa`: pixel 860500981882285, G-R84BNVV2HX, AW-17263684860 | `lp-500-skills`, `known: true`, `off` | — | Umami; conferência no navegador | — |
| bootcamp.stratacademy.com.br/ (HTML + `/sa`) | script do Rastro `bootcamp`; pelo `/sa`: pixel 860500981882285, G-R84BNVV2HX, AW-17263684860 | `bootcamp`, `known: true`, `off` | — | Umami; conferência no navegador | — |
| comunidade.stratacademy.com.br/ (HTML) | nenhuma tag, nenhum script; `noindex, nofollow` | — | — | nada (sem tracking de propósito, como diz o catálogo) | — |
| stratacademy.com.br/ (HTML) | bloco próprio `__stratAnalytics` do horus: PostHog + pixel **860500981882285**, só depois do consentimento (`strat_consent`); conversões vão ao Rastro com o produto `site` | `site`, `known: true`, `off` (o `/sa` não é carregado: o bloco é inline) | (pelo código, pede consentimento) | GA4 e tag do Google: o catálogo está com `null` em tudo | — |

## Leitura
- **T2 confirmado com nuance:** a LP claude. carrega a tag **G-3RYFFP7EF5** (é o GA4 cadastrado no produto `quaia` do
  Rastro), mas os hits saem com `tid=G-R84BNVV2HX`. A G-3RYFFP7EF5 é uma tag do Google que entrega para o GA4 da
  Academy. Os dados chegam no G-R84BNVV2HX como nas outras LPs; a diferença é só de cadastro. Decidir no WEB-13 se
  o catálogo passa a guardar a tag (G-3RYFFP7EF5) ou se o produto `quaia` volta a usar o G-R84BNVV2HX direto.
- **Site da Academy:** pixel 860500981882285 e PostHog, sem GA4. O catálogo está com `null` em pixel, GA4 e tag:
  preencher no WEB-13 e conferir no navegador no WEB-46 (antes de tirar do horus).
- **Consentimento diferente por produto:** `aula-claude-code` está em `soft` (pixel dispara antes da escolha, aviso
  "recusar / ok"); as outras LPs estão em `off` (sem aviso). Isso é configuração do Rastro por produto.
- Lead de teste na vibecode **não enviado**: o formulário recusa DDD 00 e manda a aula pelo WhatsApp do número
  informado; só dá para testar com um número de teste de verdade.
