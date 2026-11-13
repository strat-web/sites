# Agência Strat · conferência no navegador (WEB-11)

Data: 2026-11-11. Chrome com a extensão do Claude, armazenamento do site limpo antes de cada medida, URL com
`?utm_source=teste&utm_medium=verificacao`. Leitura das requisições pela `performance.getEntriesByType('resource')`:
pixel = `facebook.com/tr` (id e evento), GA4 = `/g/collect` (`tid` e evento).
Hoje o conteúdo está em `agencia.stratai.com.br` (strat-lps); `agenciastrat.com.br` ainda não responde (WEB-26).

## Tabela por URL

| URL | Antes do aceite | Depois do aceite | Banner | MetricaaS | Falta | Duplica |
|---|---|---|---|---|---|---|
| agencia.stratai.com.br/ | `fbevents.js` carrega, nenhum `/tr`; MetricaaS `m.js` + `mf.js` + `/e` | pixel 1815630929780241 `PageView` ×1 | Recusar / Aceitar | `strat-marketing`, `defer`, na hora | **GA4 G-6S4YX29WBH e tag GT-TX2632G5 não existem na página** (T3); Umami | nada |
| agencia.stratai.com.br/advogados/ | pixel 1815630929780241 `PageView` ×1 e `ViewContent` ×1; MetricaaS `/e` | igual | não tem (`consentimentoPixel: false` desde 02/11, de propósito) | `strat-marketing`, `async`, `data-pixel` | GA4 e GT (T3); Umami | nada |
| bio.stratai.com.br/agencia/ (alvo: agenciastrat.com.br/bio/) | nenhum `/tr`; MetricaaS `/e` ×3 | pixel 1815630929780241 `PageView` ×1 | Recusar / Aceitar | `strat-marketing`, `pixelConsent=aguardar` | GA4 e GT (T3); Umami | nada |
| stratai.com.br/agencia/ | 301 → agencia.stratai.com.br/ (curl) | — | — | — | — | — |

Marcação na home: 5 links `wa.me`, 13 `data-strat-cta`, 15 `data-mtc-section`, 1 formulário (`#leadForm`, sem
`data-strat-leadform`: o lead vai pelo `mtc.lead()` da tag). bio: `noindex,follow`, 3 `wa.me`, 1 formulário.

## Lead de teste (home, 11/11 11h17)

Dado fictício (nome "Teste Webonze", telefone DDD 00, e-mail `example.com`), UTMs `teste / verificacao / web-11`,
cookies aceitos.

| Conferência | Resultado |
|---|---|
| Pixel no navegador | `Lead` e `LeadQualificado`, os dois com `eid` = `<uuid>:lead` e `<uuid>:leadqualificado` (mesmo uuid) |
| MetricaaS | `/f` (fetch) aceito; lead criado no `strat-marketing`, etapa Qualificado, origem "Formulário · link", UTMs gravadas certas |
| CAPI | a ficha mostra "Conversão LeadQualificado a caminho da Meta (pixel do site)"; ver "Dedup" abaixo |
| WhatsApp depois do envio | abre `api.whatsapp.com` para 554831994338 com o código do MetricaaS no texto (aba fechada sem enviar) |
| Limpeza | lead de teste excluído do MetricaaS no fim da conferência |

**Achado:** os campos do formulário (empresa, Instagram, segmento, faturamento, verba, serviços) não aparecem nos
"Campos da empresa" do lead, que existem no workspace (EMPRESA, SEGMENTO, FATURAMENTO, VERBA EM ANÚNCIOS, SERVIÇOS
DE INTERESSE). O time recebe só nome, telefone e e-mail. A jornada também registra "Enviou um formulário" duas vezes
(uma tentativa recusada pela validação do nome e o envio aceito).

> **Revisto em 12/11/2026 (WEB-71, revisão do Helbert no strat-lps#86):** a primeira parte do achado não vale. Os 6
> campos (`instagram`, `faturamento`, `empresa`, `segmento`, `verba`, `servicos`) já chegavam ao banco em
> `lead_custom_values`; só não apareciam na ficha que esta conferência leu. O que o WEB-71 corrige é o envio contado
> duas vezes: a validação passou para o clique do botão, e a tentativa recusada não vira `submit`.

**Dedup:** o navegador manda o `event_id` (`eid`); o MetricaaS com `data-pixel` usa o mesmo id na CAPI (padrão da
tag). A contagem do dataset na Meta ainda não mostrava o evento uma hora depois (atraso normal das estatísticas):
conferir em Gerenciador de Eventos › 1815630929780241 › LeadQualificado › "Desduplicado".

## /advogados/
Sem formulário nem `wa.me` no HTML: a agenda é do MetricaaS e marca reunião de verdade na agenda do Gabriel. O teste
de ponta a ponta dessa página é o do WEB-68 (marcação pela página e pelo WhatsApp). Não enviado aqui.
