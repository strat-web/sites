# StratAI no topo das buscas de IA em Joinville

> **Origem:** export do Drive em 2026-11-12 do plano aprovado pelo Helbert em 2026-11-04 (versão 2). Versão
> original, de acesso restrito ao time: https://claude.ai/artifact/Bh1FtvSLSJnYaxK5Cb6dKt.
>
> **O que foi tirado e por quê:** este repositório é público. Ficaram só as decisões, as fases e as páginas. Saíram
> a conferência do servidor antigo das LPs (código e operação do servidor), os telefones e os contratos,
> o nome dos clientes dos casos, os concorrentes, os itens internos que não são do site (CNAE, pauta societária) e as
> fontes internas da conferência. A lista de 14 itens do plano virou os itens do `WEB` citados abaixo.
>
> **O que mudou depois (12/11, `docs/decisoes.md`):** a StratAI migra primeiro para `apps/stratai` (WEB-32) e a
> estrutura nova entra página a página, com 301 quando a URL mudar. Este plano só define título e H1 da home; os das
> 15 páginas novas ficam no mapa `docs/planos/stratai-estrutura.md`, que o Helbert aprova no PR. Até lá, os lotes B
> e C e os guias esperam. O gerador de páginas que o plano propunha (D6) virou o kit do monorepo.

## Objetivo

Aparecer para "agência de IA Joinville" e "agente de IA WhatsApp Joinville" na busca orgânica, no pacote do Maps (top
3 para "agência de IA" a partir do bairro Boa Vista) e na resposta do ChatGPT, do Gemini e do Perplexity para "quais
as melhores empresas de IA em Joinville?". A home segue como página de conversão; cada busca-alvo ganha uma página
com assunto próprio, e o resto do site aponta para ela.

## Páginas

### Hoje: 3 páginas indexáveis

| URL | Estado |
|---|---|
| `/` | home, ajustar (WEB-33) |
| `/raio-x/` | diagnóstico e laudo, no ar |
| `/politica-de-privacidade` | no ar |
| `/agencia/` | 301 para o site da Agência |

`robots.txt`, `sitemap.xml` e `llms.txt` existem e passam a ser gerados pelo kit.

### Depois: 18 páginas indexáveis

| Grupo | URL | Item | Observação |
|---|---|---|---|
| Lote A · local e âncoras | `/agencia-de-ia-joinville/` | WEB-34 | |
| Lote A · local e âncoras | `/agente-de-ia-whatsapp/` | WEB-34 | |
| Lote A · local e âncoras | `/casos/<caso-do-restaurante>/` | WEB-34 | caso do restaurante de Joinville |
| Lote A · local e âncoras | `/sobre/` | WEB-34 | ficha que Google e IA leem |
| Lote B · módulos e método | `/agente-sdr-ia/`, `/automacao-com-ia/` | WEB-59 | |
| Lote B · módulos e método | `/sistemas-sob-medida/`, `/metodo-das-alavancas/` | WEB-59 | |
| Lote C · segmentos e casos | `/ia-para-restaurantes/`, `/ia-para-imobiliarias/` | WEB-60 | |
| Lote C · segmentos e casos | `/ia-para-ecommerce/`, `/ia-para-clinicas/` | WEB-60 | clínicas sem número |
| Lote C · segmentos e casos | `/casos/`, `/casos/<caso-da-imobiliaria>/`, `/casos/<caso-do-ecommerce>/` | WEB-60 | |
| Guias de compra | `/guias/quanto-custa-agente-de-ia/` e mais 3 | WEB-61 | |
| Mantidas | `/`, `/raio-x/`, `/politica-de-privacidade` | | |

Os slugs de caso ficam como marcador. O nome do cliente só entra com a autorização dele; sem autorização até o lote
ir ao ar, o caso sai anônimo (decisão de 12/11).

### Título e H1

| Página | Título | H1 e kicker |
|---|---|---|
| Home `/` | "Agentes de IA no WhatsApp em Joinville \| StratAI" (antes: "StratAI · Agentes de IA para a sua empresa") | H1 sem mudança; kicker passa a "StratAI · agência de IA em Joinville/SC para pequenas e médias empresas" |

Os títulos e H1 das páginas novas estão no mapa `docs/planos/stratai-estrutura.md`.

## De onde vem a resposta

Google, Maps e as IAs montam a lista a partir das mesmas fontes. Cada fase cobre uma delas.

| Fonte | Fases | O que entra |
|---|---|---|
| Site com página por assunto | F0, F1, F2, F4 | título com a busca, JSON-LD, `/sobre/` factual, `llms.txt` atualizado |
| Google Perfil da Empresa | F3 | nome real, categoria certa, avaliações que citam "agente de IA" |
| Imprensa regional | F5 | pauta do caso do restaurante (com autorização do cliente para imprensa), Imersão em Joinville |
| Ecossistema e diretórios | F5 | eventos e associações de Joinville e diretórios de empresas, com o mesmo nome, endereço e telefone |

## Fases

A ordem segue dependência: medir antes de mexer, base técnica antes das páginas, páginas antes de pedir link e
matéria. Fora do site (perfil do Google, imprensa, diretórios) o trabalho é humano e não passa por este repositório.

| Fase | O que entra | Portão |
|---|---|---|
| F0 · Linha de base | diagnóstico completo do stratai.com.br (Nota Strat, PageSpeed 3 vezes no celular, tracking em execução); projeto no OpenSEO (rank tracker, grade do Maps, visibilidade em IA, com custo estimado antes); leads da home por semana no MetricaaS | a linha de base registrada antes de mexer na home |
| F1 · Correções na home (WEB-33) | título e descrição; kicker com "agência de IA em Joinville/SC"; `wa.me` escrito no HTML dos links de WhatsApp; JSON-LD ProfessionalService e FAQPage com o texto idêntico ao FAQ visível; alt na primeira ocorrência de cada logo e `aria-hidden` nas cópias do carrossel; cards de módulo e de caso linkando para as páginas novas quando existirem | teste de resultados avançados do Google sem erro e `/lp-revisar` aprovado |
| F2 · Páginas em 3 lotes (WEB-34, WEB-59, WEB-60) | cada página com título e H1 do mapa, conteúdo próprio, 3 a 5 perguntas com FAQPage, BreadcrumbList, 2 links internos e CTA para o diagnóstico; menu (Serviços, Segmentos, Casos, Método, Sobre, Diagnóstico) e rodapé do kit | um PR por lote, preview aprovado pelo Helbert antes do merge |
| F3 · Google Perfil da Empresa | nome "StratAI" sem palavra-chave inventada, categoria certa, descrição, um serviço por módulo, fotos, avaliações e um post por semana | a URL do perfil entra no `sameAs` do JSON-LD |
| F4 · Guias de compra (WEB-61) | 4 guias no stratai: quanto custa um agente de IA no WhatsApp (fatores, sem faixa inventada), quanto tempo leva, API oficial ou não oficial, LGPD e agente de IA; os outros temas vão para o blog da Academy, com link para a página de serviço da StratAI | cada número conferido contra a fonte antes de publicar |
| F5 · Imprensa, ecossistema e diretórios | kit de imprensa, pauta do caso do restaurante, eventos e diretórios | pauta pública só com autorização do cliente |
| F6 · Medição contínua | OpenSEO toda semana, Search Console (a partir de 11/11), Rastro e GA4 da StratAI com a origem orgânica e do perfil; relatórios no dia 45 e no dia 90 | se os leads da home caírem mais de 20% em 2 semanas depois da F1, volta o título antigo e se investiga |

Cronograma de 13 semanas, a semana 1 começando em 2026-11-09 (o dia 90 cai na semana de 2027-02-01):

| Frente | Responsável | Semanas |
|---|---|---|
| F0 · Linha de base | Helbert, João | 1 e 2 |
| F1 · Home | João | 1 e 2 |
| F2 · Lote A | João | 2 a 4 |
| F2 · Lote B | Jhonathan | 4 a 6 |
| F2 · Lote C | Jhonathan | 6 a 9 |
| F3 · Perfil do Google | Gabriel | 1 a 13 |
| F4 · Guias de compra | Helbert | 7 a 12 |
| F5 · Imprensa e ecossistema | Gabriel | 1 a 10 |
| F6 · Medição e relatórios | Helbert | 1 a 13 (relatórios nas semanas 7 e 13) |

As datas dos lotes B e C e dos guias mudam com a decisão de 12/11: esperam a aprovação do mapa.

## Metas em 90 dias

| Indicador | Meta | Onde se mede |
|---|---|---|
| Avaliações no Google Maps | 20 ou mais, nota acima de 4,8 | Perfil da Empresa |
| Top 3 do Maps para "agência de IA Joinville" | sim | OpenSEO, grade local |
| Página 1 para "agência de IA Joinville" | sim | OpenSEO, rank tracker |
| Páginas indexáveis no stratai.com.br | 18 | Search Console |
| Citada por ChatGPT, Gemini ou Perplexity | em pelo menos 2 das 3 | OpenSEO, visibilidade em IA |
| Leads da home por semana | não cair | MetricaaS |

## Decisões do plano (aprovadas em 2026-11-04)

A numeração é deste plano; não confundir com D1 a D12 de `sites-numa-casa-so.md`.

| # | Decisão | Escolha |
|---|---|---|
| D1 | Telefone de cada marca | o da StratAI em site, Maps, LinkedIn e diretórios; o da Agência só na Agência; nenhum outro número em página pública |
| D2 | Agência no mesmo perfil do Maps ou num próprio | um perfil só (StratAI) por agora; reavaliar no dia 45 |
| D3 | Onde fica o conteúdo de implementação | sem segundo blog: os 4 guias de compra ficam no stratai como páginas; o resto vai para o blog da Academy, sempre com link para a página da StratAI |
| D4 | Pautas que podem ser públicas | começar pelo caso do restaurante, com autorização do cliente para imprensa (a da página não cobre matéria) |
| D5 | Google Ads para "agência de IA Joinville" | desligado, como decidido em 09/10; reavaliar no relatório do dia 45 |
| D6 | Gerador de páginas ou HTML à mão | gerador; no monorepo, virou o kit (`packages/kit`) |
| D7 | Gasto com dados de SEO no OpenSEO | rank tracker, grade local e visibilidade em IA, com custo estimado antes e teto mensal definido pelo Helbert |
| D8 | Compressão no servidor antigo das LPs | compressão e cache num PR separado no servidor antigo, porque vale para todas as LPs que ainda estão lá |

## Regras

1. Número só dos casos, com a fonte no PR (`CLAUDE.md`, regra dura 4). Segmento sem caso fica sem número.
2. Rastro, pixel e tag do Google intocados; página nova no mesmo domínio já está coberta.
3. Nada de Google Ads até D5 mudar.
4. Página nova não copia bloco da home: conteúdo repetido não ranqueia.
5. Nome no Maps sem palavra-chave inventada.
6. Mensagem a cliente pedindo avaliação ou autorização só com o ok do Helbert (destinatário e texto).
7. A conversão da home manda: se os leads caírem depois da F1, volta antes de investigar.
