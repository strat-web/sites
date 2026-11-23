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

## stratacademy.com.br no navegador (WEB-46, 2026-11-13)

Desta vez a extensão do Chrome abriu o host. Conferido no Chrome, a 1440 px, com `?utm_source=teste&utm_medium=verificacao`,
na home, num post do blog (`/blog/gerar-video-ia-claude-code/`) e numa ferramenta (`/ferramentas/criador-de-funil-de-vendas/`),
nos três estados do aviso: sem escolha, "aceitar" e "recusar". O código foi lido no HTML servido e nos scripts do build.
Nenhum lead enviado (formulário de produção). No fim, a escolha foi apagada do navegador.

### O que dispara

| Estado | Dispara | Não dispara |
|---|---|---|
| Sem escolha (aviso no rodapé) | Umami `f26d82a8-…` pelo `/u/script.js` → `/u/api/send`; Cloudflare Web Analytics (`/cdn-cgi/rum`, injetado pela Cloudflare, não está no HTML) | pixel, PostHog, Rastro, GA4, Google Ads |
| "Aceitar" (e toda visita depois) | o mesmo de cima + pixel **860500981882285** `PageView` ×1 por página; PostHog (`$pageview`, gravação de sessão, surveys, dead clicks e web vitals, projeto `phc_vUY2V4…`); um POST a `yf-….ecs.us-west-2.on.aws/events`, que sai do script do pixel (parece o Conversions API Gateway ligado ao pixel na Meta; não vem do código do site) | GA4, Google Ads, `/sa` do Rastro |
| "Recusar" | Umami e Cloudflare Web Analytics | pixel, PostHog, Rastro |

Nas ferramentas, com aceite, o pixel também recebe o evento da ferramenta com `fbq('track', …)` e nome próprio
(`ferramenta_aberta` na abertura do criador de funil; `ferramenta_usada`, `whatsapp_*` e `FunilEditado` nas calculadoras).

### De onde vem cada id

Tudo vem de um bloco inline do horus (`window.__stratAnalytics`), igual nas 86 URLs do sitemap: chave do PostHog, pixel
`860500981882285`, `trackingUrl = https://tracking.stratacademy.com.br` e o `product` do Rastro. O `/sa` do Rastro **não**
é carregado; o bloco faz o papel dele. A escolha fica no `localStorage`, chave `strat_consent` (`granted` ou `denied`), a
mesma chave e os mesmos valores que o Rastro em `strict` usa: quem aceitou no horus continua aceito no site novo.

| Páginas | `product` no bloco |
|---|---|
| 67 (home, blog, cursos, eventos, mentoria, newsletter, contato, obrigado…) | `site` |
| 8 da calculadora de funil (`/ferramentas/calculadora-de-funil-de-vendas/` e modelos) | `calculadora-funil` |
| 6 da calculadora de WhatsApp (`/ferramentas/calculadora-de-custo-whatsapp-api/` e modelos) | `calculadora-whatsapp` |
| 5 do criador de funil (`/ferramentas/criador-de-funil-de-vendas/` e modelos) | `criador-funil` |

Os quatro produtos existem no Rastro (`/sa` com `known: true`): `site` em `strict`, os três das ferramentas em `off`.
O consentMode do Rastro não vale hoje, porque o `/sa` não é carregado: quem segura tudo é o aviso do horus.

Formulários (newsletter, contato, live semanal e o da calculadora de funil) mandam o lead para `/api/lead` do próprio
domínio, com Turnstile, e chamam `stratTrack('Lead')`, que só sai com aceite. O `/mentoria/` leva direto a
`pay.hotmart.com` sem launcher e sem o Rastro, então o checkout não ganha `xcod` nem UTMs.

### Conversões não chegam ao Rastro

O `stratTrack` manda o evento ao `/tracker` com `credentials: 'include'`, e o Rastro responde ao preflight com
`Access-Control-Allow-Origin: *`, sem `Access-Control-Allow-Credentials`. O navegador barra essa combinação: na
ferramenta, o `/tracker` apareceu com erro (503 na aba de rede), e o mesmo POST de corpo vazio, rodado na página, deu
"Failed to fetch" com `include` e 200 com `omit`. Ou seja: `ferramenta_*`, `FunilEditado` e `Lead` do site chegam ao
pixel e ao PostHog, mas **não ao Rastro pelo navegador** (nem à CAPI que sai dele). O que o `/api/lead` faz no servidor
não dá para ver de fora. O `/sa` do Rastro, que o kit usa, chama o `/tracker` sem credenciais e não tem esse problema.

### O que muda quando o site sair do horus (WEB-49)

Com o `<Tracking>` do kit e o produto `site` em `strict`, o `/sa?product=site` (lido em 13/11) liga o mesmo pixel
`860500981882285` e o mesmo projeto do PostHog, e passa a ligar **GA4 `G-R84BNVV2HX` e Google Ads `AW-17263684860`**
depois do aceite. O Umami segue com o mesmo id. A migração precisa cuidar de:
- os eventos das ferramentas e o `Lead` dos formulários, que hoje saem do `stratTrack` do horus;
- as 19 URLs das ferramentas, com produto próprio no Rastro (`calculadora-funil`, `calculadora-whatsapp`,
  `criador-funil`, todos em `off`), que não têm linha no catálogo;
- o Cloudflare Web Analytics, que é do projeto do Pages `stratacademy` e não vem junto para o `sites-stratacademy`.
