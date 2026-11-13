# Auditoria 2026-11 · relatório do portão F1 (WEB-14)

Portão F2 (WEB-22, 12/11): a página de teste do kit nas 6 checagens e no checklist de publicar está em
[portao-f2.md](portao-f2.md).

Junta a auditoria automática ([WEB-10](#auditoria-automática--2026-11-04-web-10), abaixo), a conferência no navegador
([WEB-11](#conferência-no-navegador--2026-11-11-web-11), abaixo) e a correção do catálogo ([WEB-13](https://plane.strat.tec.br/grupo-strat/browse/WEB-13/)). Cada achado tem
um destino: um item que já existia, o checklist da migração (`docs/checklist-publicar.md`) ou um item novo em Triagem.

## Resumo por domínio

| Domínio | Como está | O que fica para depois |
|---|---|---|
| **Agência** (agencia.stratai.com.br → agenciastrat.com.br) | Pixel 1815630929780241 ×1 e MetricaaS `strat-marketing` na hora; home e bio com banner, /advogados sem. Nada duplica. Sem GA4 nem tag do Google. | CAPI do LeadQualificado parada desde 10/11 ([WEB-70](https://plane.strat.tec.br/grupo-strat/browse/WEB-70/)); campos do formulário fora do lead ([WEB-71](https://plane.strat.tec.br/grupo-strat/browse/WEB-71/)); GA4 da Agência ([WEB-73](https://plane.strat.tec.br/grupo-strat/browse/WEB-73/)); migração [WEB-23](https://plane.strat.tec.br/grupo-strat/browse/WEB-23/), [WEB-24](https://plane.strat.tec.br/grupo-strat/browse/WEB-24/), [WEB-25](https://plane.strat.tec.br/grupo-strat/browse/WEB-25/) |
| **StratAI** (stratai.com.br) | Pixel, GA4 G-3VJ019EH58, GT-M6J6NZQW, Rastro (`stratai`, `raio-x-ia`) e MetricaaS `agencia-strat`, sem banner. Nada duplica. LCP de 8 s no celular na home. | WhatsApp montado por script ([WEB-33](https://plane.strat.tec.br/grupo-strat/browse/WEB-33/)); bio no workspace errado ([WEB-35](https://plane.strat.tec.br/grupo-strat/browse/WEB-35/)); velocidade e cabeçalhos na migração ([WEB-32](https://plane.strat.tec.br/grupo-strat/browse/WEB-32/), [WEB-21](https://plane.strat.tec.br/grupo-strat/browse/WEB-21/)) |
| **MetricaaS** (metricaas.com.br) | Pixel, GA4 G-7L9LL2FN6C e Rastro `metricaas`, sem banner. Nada duplica. LCP de 6,7 s. Sem MetricaaS no próprio site (registrado, sem item: decisão do Helbert). | Robôs de IA bloqueados ([WEB-37](https://plane.strat.tec.br/grupo-strat/browse/WEB-37/)); velocidade na migração ([WEB-36](https://plane.strat.tec.br/grupo-strat/browse/WEB-36/)) |
| **Strat Academy** (stratacademy.com.br e LPs) | LPs pelo Rastro (pixel, GA4 G-R84BNVV2HX, AW-17263684860), sem banner, menos a vibecode (soft). Site com PostHog + pixel depois do aceite, sem GA4. LCP de 18 s na claude. e 9,5 s na skills. | LCP da claude. ([WEB-63](https://plane.strat.tec.br/grupo-strat/browse/WEB-63/)); 4 hosts sem conferência no navegador ([WEB-46](https://plane.strat.tec.br/grupo-strat/browse/WEB-46/), [WEB-48](https://plane.strat.tec.br/grupo-strat/browse/WEB-48/)); migração ([WEB-48](https://plane.strat.tec.br/grupo-strat/browse/WEB-48/), [WEB-49](https://plane.strat.tec.br/grupo-strat/browse/WEB-49/)) |
| **Todos** | Umami em nenhuma URL; consentimento diferente por página. | Umami no kit ([WEB-17](https://plane.strat.tec.br/grupo-strat/browse/WEB-17/)); padrão de consentimento ([WEB-72](https://plane.strat.tec.br/grupo-strat/browse/WEB-72/)) |

## Cada achado e o seu destino

| # | Achado | Fonte | Destino |
|---|---|---|---|
| 1 | Sites do `strat-lps` sem compressão e sem `Cache-Control` | WEB-10 | migração para o Pages (resolve a entrega) |
| 2 | LCP alto no celular: claude. 18,3 s | WEB-10 | [WEB-63](https://plane.strat.tec.br/grupo-strat/browse/WEB-63/) (já existia) |
| 3 | LCP alto: skills. 9,5 s, stratai 8,0 s, metricaas 6,7 s | WEB-10 | checklist de publicar, D1 (90 no celular, LCP até 2,5 s), em [WEB-48](https://plane.strat.tec.br/grupo-strat/browse/WEB-48/), [WEB-32](https://plane.strat.tec.br/grupo-strat/browse/WEB-32/), [WEB-36](https://plane.strat.tec.br/grupo-strat/browse/WEB-36/) |
| 4 | Links do WhatsApp da StratAI com `href="#"` montados por script | WEB-10 | [WEB-33](https://plane.strat.tec.br/grupo-strat/browse/WEB-33/) (já existia) |
| 5 | Cabeçalhos de segurança ausentes no `strat-lps` | WEB-10 | [WEB-21](https://plane.strat.tec.br/grupo-strat/browse/WEB-21/) (já existia) |
| 6 | WhatsApp da vibecode sem mensagem pronta | WEB-10 | checklist de publicar, B2, em [WEB-48](https://plane.strat.tec.br/grupo-strat/browse/WEB-48/) |
| 7 | Motor de LP sem navegador não vê pixel, formulário e WhatsApp injetados por script | WEB-10 | [WEB-41](https://plane.strat.tec.br/grupo-strat/browse/WEB-41/) (teste do diagnóstico, F5) |
| 8 | T2: claude. carrega a tag G-3RYFFP7EF5, que entrega em G-R84BNVV2HX | WEB-11 | resolvido no catálogo ([WEB-13](https://plane.strat.tec.br/grupo-strat/browse/WEB-13/)) |
| 9 | T3: Agência sem GA4 e sem tag do Google | WEB-11 | catálogo ([WEB-13](https://plane.strat.tec.br/grupo-strat/browse/WEB-13/)) + decisão [WEB-73](https://plane.strat.tec.br/grupo-strat/browse/WEB-73/) (novo) |
| 10 | T4: bio da StratAI no MetricaaS `strat-marketing` | WEB-11 | [WEB-35](https://plane.strat.tec.br/grupo-strat/browse/WEB-35/) (já existia) + `diferenca_hoje` no catálogo |
| 11 | Umami em nenhuma URL | WEB-11 | [WEB-17](https://plane.strat.tec.br/grupo-strat/browse/WEB-17/) (já existia) + campo `umami_website_id` no catálogo |
| 12 | Formulário da Agência não leva empresa, segmento, faturamento, verba e serviços ao lead | WEB-11 | [WEB-71](https://plane.strat.tec.br/grupo-strat/browse/WEB-71/) (novo) |
| 13 | CAPI do LeadQualificado da Agência sem evento de servidor desde 10/11 10h56 | WEB-11 | [WEB-70](https://plane.strat.tec.br/grupo-strat/browse/WEB-70/) (novo) |
| 14 | Consentimento diferente por página (banner, off, soft) | WEB-11 | [WEB-72](https://plane.strat.tec.br/grupo-strat/browse/WEB-72/) (novo, decisão do Helbert) |
| 15 | Site da Academy com pixel + PostHog, sem GA4; catálogo vazio | WEB-11 | catálogo ([WEB-13](https://plane.strat.tec.br/grupo-strat/browse/WEB-13/)) + [WEB-46](https://plane.strat.tec.br/grupo-strat/browse/WEB-46/) (já existia) |
| 16 | stratacademy.com.br, skills., bootcamp. e comunidade. não vistos no navegador (extensão bloqueia) | WEB-11 | [WEB-46](https://plane.strat.tec.br/grupo-strat/browse/WEB-46/) e [WEB-48](https://plane.strat.tec.br/grupo-strat/browse/WEB-48/) (já existiam) |
| 17 | Site do MetricaaS não mede os próprios leads pelo MetricaaS | WEB-11 | sem item (registrado; decisão do Helbert) |
| 18 | T5: Rastro na comunidade (página sem nenhuma tag, de propósito pelo catálogo) | Helbert, 10/11 | pergunta no PR do [WEB-13](https://plane.strat.tec.br/grupo-strat/browse/WEB-13/) |

Itens novos: [WEB-70](https://plane.strat.tec.br/grupo-strat/browse/WEB-70/), [WEB-71](https://plane.strat.tec.br/grupo-strat/browse/WEB-71/), [WEB-72](https://plane.strat.tec.br/grupo-strat/browse/WEB-72/) e [WEB-73](https://plane.strat.tec.br/grupo-strat/browse/WEB-73/), todos em Triagem com o rótulo `tracking`.

## Auditoria automática · 2026-11-04 (WEB-10)

Motor de LP da cabine (`lote.mjs`): Nota Strat rápida, PageSpeed no celular 1×, sinais do HTML (sem navegador).
Brutos: [saude-catalogo.json](saude-catalogo.json) e [saude-extras.json](saude-extras.json).
A conferência no navegador, que vê o que o JavaScript injeta, é o WEB-11.

| URL | Nota | Perf. celular | LCP (lab) | Principal | Leitura |
|---|---|---|---|---|---|
| https://claude.stratacademy.com.br/ | 76 | 61 | 18,3 s | conteúdo principal demora a aparecer | **real**: o pior LCP do grupo |
| https://skills.stratacademy.com.br/ | 78 | 67 | 9,5 s | conteúdo principal demora a aparecer | **real** |
| https://stratai.com.br/ | 71 | 68 | 8,0 s | sem botão de WhatsApp | **real**: os links são `href="#"` montados por script (WEB-33); LCP alto também |
| https://metricaas.com.br/ | 81 | 68 | 6,7 s | conteúdo principal demora a aparecer | **real** |
| https://stratai.com.br/agencia/ (301) | 77 | 68 | 4,7 s | sem pixel | falso alarme: o pixel vem pela tag do MetricaaS; a URL é só redirecionamento |
| https://agencia.stratai.com.br/ | 79 | 73 | 4,1 s | sem pixel | falso alarme (mesmo motivo); conferir no WEB-11 |
| https://agencia.stratai.com.br/advogados/ | 67 | 98 | 1,7 s | sem WhatsApp, telefone ou formulário | provável falso alarme: formulário e agenda vêm do MetricaaS; conferir no WEB-11 |
| https://stratai.com.br/raio-x/ | 74 | 85 | 2,0 s | sem WhatsApp ou formulário | provável falso alarme: o diagnóstico é montado por script |
| https://bio.stratai.com.br/ | 74 | 93 | 1,7 s | noindex | de propósito (bio não indexa) |
| https://stratacademy.com.br/ | 77 | 100 | 1,5 s | sem WhatsApp ou formulário | site de conteúdo; ok |
| https://vibecode.stratacademy.com.br/ | 79 | 79 | 1,9 s | WhatsApp sem mensagem pronta | **real**, pequeno |
| https://bootcamp.stratacademy.com.br/ | 88 | 89 | 1,9 s | sem cabeçalhos de segurança | **real** (WEB-21) |
| https://mentoria.stratacademy.com.br/ | 89 | 90 | 2,9 s | sem cabeçalhos de segurança | **real** (WEB-21) |
| https://comunidade.stratacademy.com.br/ | 57 | 85 | 3,3 s | sem contato | página pós-cadastro, noindex de propósito |

### O que sai daqui
- **Velocidade:** todo site servido pelo `strat-lps` sai sem compressão (gzip ou brotli) e sem `Cache-Control`
  (conferido com curl em 04/11). A migração para o Pages resolve a entrega; o LCP de 18 s do claude.stratacademy pede
  investigação própria (item novo).
- **Cabeçalhos de segurança:** faltam em todas as páginas do `strat-lps`. Resolvido no kit (WEB-21).
- **Catálogo:** os dois alertas "críticos" do motor eram do catálogo antigo da cabine (esperava MetricaaS
  `strat-marketing` na StratAI e Rastro na Agência). O `catalogo/sites.json` daqui já está certo.
- **Motor de LP:** a checagem sem navegador não vê pixel, formulário e WhatsApp injetados por script (MetricaaS, Rastro).
  Ajuste no motor quando ele for para a oficina (F5).

## Conferência no navegador · 2026-11-11 (WEB-11)

Um arquivo por domínio, com a tabela por URL (o que dispara, o que falta, o que duplica) e o lead de teste:
[agenciastrat.md](agenciastrat.md) · [stratai.md](stratai.md) · [metricaas.md](metricaas.md) · [stratacademy.md](stratacademy.md).

| Achado | Onde | Vai para |
|---|---|---|
| **Nada dispara em dobro**: pixel `PageView` ×1 em todas as URLs medidas | todas | — |
| T3: Agência sem GA4 G-6S4YX29WBH e sem tag GT-TX2632G5 em nenhuma página (só pixel e MetricaaS) | agencia., bio.stratai.com.br/agencia/ | WEB-13 (catálogo) e WEB-23 (migração) |
| T4: bio da StratAI carrega o MetricaaS `strat-marketing` em vez de `agencia-strat` | bio.stratai.com.br/ | WEB-35 e WEB-13 |
| T2: a LP claude. carrega a tag G-3RYFFP7EF5 (GA4 do produto `quaia` no Rastro), que entrega os hits em G-R84BNVV2HX | claude. | WEB-13 |
| Umami não existe em nenhuma URL | todas | WEB-17 (kit) |
| Formulário da Agência não leva empresa, segmento, faturamento, verba e serviços aos campos do lead no MetricaaS | agencia./ | WEB-23 |
| Site da Academy mede com pixel 860500981882285 + PostHog (sem GA4); catálogo com `null` | stratacademy.com.br | WEB-13 e WEB-46 |
| Consentimento: Agência (home e bio) pede aceite antes do pixel; /advogados, StratAI, MetricaaS e LPs da Academy não pedem (Rastro `off`); vibecode em `soft` | vários | decisão do Helbert |
| Hosts não vistos no navegador (extensão bloqueia): stratacademy.com.br, skills., bootcamp., comunidade. | Academy | refazer no WEB-46 / WEB-48 |
