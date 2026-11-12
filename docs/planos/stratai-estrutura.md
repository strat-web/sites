# StratAI: mapa de URLs proposto

- **Estado:** proposta para o Helbert aprovar neste PR (pedido dele em 12/11/2026, 13h45). Nada aqui está no ar.
- **Itens:** WEB-32, WEB-33, WEB-34, WEB-35, WEB-59, WEB-60, WEB-61 e WEB-74 (projeto `WEB` no Plane).
- **Fontes:** plano "StratAI no topo das buscas de IA em Joinville" (v2, aprovado em 04/11/2026: as 15 páginas
  novas e os lotes), plano "Os sites da Strat numa casa só" (04/11/2026: `/bio/`, `/guias/` e blog por site),
  reunião do time de 12/11/2026 às 11h29 (estrutura com Produtos, Cases, Personalizado, Serviços, Parcerias, home e
  blog, cada produto com página própria "para pegar SEO"), decisões do Helbert de 12/11/2026 e o site no ar,
  conferido com curl em 12/11/2026.
- **Até aprovar:** os lotes B e C (WEB-59, WEB-60) e os guias (WEB-61) esperam. Depois de aprovado, cada item usa a
  linha dele na tabela da seção 3 como fonte de URL, título e H1.

## 1. O que existe hoje em stratai.com.br

Conferido em 12/11/2026. O sitemap tem 3 URLs, todas com `lastmod` de 08/10/2026.

| URL | Resposta | Título hoje | No sitemap |
|---|---|---|---|
| `/` | 200 | StratAI · Agentes de IA para a sua empresa | sim |
| `/raio-x/` | 200 (`/raio-x` dá 301 para a forma com barra) | Raio-X de IA · Quanto a sua empresa perde por mês sem IA? · StratAI | sim |
| `/politica-de-privacidade` | 200 com e sem barra; o canonical é **sem** barra | Política de privacidade · StratAI | sim, sem barra |
| `/agencia/` | 301 para `https://agencia.stratai.com.br/` | | não |
| `bio.stratai.com.br/` | 200, fora deste domínio | Strat.ai · Agentes de IA para a sua empresa | não |
| `/robots.txt`, `/sitemap.xml`, `/llms.txt` | 200 | | |
| `/sobre/`, `/bio/`, `/casos/`, `/parcerias/`, `/blog/`, `/crm/`, `/agente-de-ia/` | 404 | | |

No `catalogo/sites.json` estão `/`, `/raio-x/` e `/bio/` (esta como alvo do WEB-35). A política ainda não tem linha:
entra no PR do WEB-32 (achado registrado no item em 11/11/2026).

A home não tem menu de páginas: o topo leva a `#topo`, à Agência, ao WhatsApp e a `#diagnostico`. As seções têm âncora
(`#hero`, `#um-dia`, `#calculadora`, `#casos`, `#diagnostico`, `#solucoes`, `#integracoes`, `#metodo`, `#socios`,
`#objecoes`, `#final`).

## 2. Princípios

1. **URL com barra no fim.** Canonical, sitemap, link interno e JSON-LD sempre na forma `/caminho/` (regra de
   `docs/padroes.md`). Caminho em português, minúsculo, com hífen, no máximo dois níveis (`/casos/<caso>/`).
2. **URL que muda ganha 301, com a query preservada.** A regra vai em `apps/stratai/public/_redirects` (ou em regra
   da Cloudflare, quando o host muda) no mesmo PR, e a tabela de rotas testadas mostra `?utm_source=teste` chegando
   ao destino. URL que nunca foi publicada em stratai.com.br não precisa de 301.
3. **Âncoras da home não mudam.** Anúncios e mensagens podem apontar para `/#diagnostico` e outras seções; a migração
   e as correções mantêm os mesmos ids.
4. **Uma intenção de busca por página.** Cada página tem uma palavra-chave principal que nenhuma outra disputa.
   Título e H1 são únicos no site (a CI barra repetido). A seção 4 mostra onde as buscas encostam e como ficam
   separadas.
5. **Caso sem nome de cliente enquanto não houver autorização.** O Helbert confirma com cada cliente; sem autorização
   até o lote ir ao ar, o caso sai anônimo ("restaurante de Joinville"). O slug do caso nunca leva o nome do cliente:
   assim a URL não muda (e não pede 301) quando a autorização chega ou é retirada. Número só dos casos, com a fonte
   no PR; segmento sem caso fica sem número.
6. **Texto na voz da StratAI**, pelo design system da marca, aprovado pelo Helbert. Página nova não copia bloco da
   home.
7. **Tracking e consentimento pelo kit.** Página nova entra no catálogo no mesmo PR e segue a regra do WEB-72
   (perfil `lead` nasce em `soft`); as páginas migradas pelo WEB-32 ficam como estão hoje.
8. **O menu só mostra o que está no ar.** Link para página que ainda não existe não entra (a checagem `links` barra).

## 3. Mapa de URLs

Títulos até cerca de 60 caracteres, com a marca no fim. Os títulos e H1 das páginas novas são proposta: o plano de
Joinville v2 só definiu o título da home. "Item novo a abrir" quer dizer que nenhum item do Plane cobre a página hoje.

### Páginas que já existem

| URL atual | URL nova | Tipo | Item | 301 de | Título | H1 | Palavra-chave principal | Fase/lote |
|---|---|---|---|---|---|---|---|---|
| `/` | `/` | home | WEB-32 (migra igual), WEB-33 (título, descrição e kicker) | | Agentes de IA no WhatsApp em Joinville \| StratAI (aprovado no plano de 04/11/2026) | Agentes de IA que atendem a sua empresa. Sem contratar mais gente. (sem mudança) | agente de IA no WhatsApp em Joinville | WEB-32, depois F1 (WEB-33) |
| `/raio-x/` | `/raio-x/` | diagnóstico | WEB-32 | `/raio-x` (já existe) | Raio-X de IA · Quanto a sua empresa perde por mês sem IA? · StratAI (sem mudança) | Quanto a sua empresa perde por mês sem IA? (sem mudança) | diagnóstico de IA para empresas | WEB-32 |
| `/politica-de-privacidade` | `/politica-de-privacidade/` | legal | WEB-32 | `/politica-de-privacidade` | Política de privacidade · StratAI (sem mudança) | Política de privacidade (sem mudança) | nenhuma (página legal) | WEB-32 |
| `/agencia/` | sai como redirecionamento | redirecionamento | WEB-32 (mantém); WEB-29 (troca o destino) | | | | | WEB-32 |
| `bio.stratai.com.br/` | `/bio/` (noindex) | bio | WEB-35 | `bio.stratai.com.br/*` | o de hoje, sem mudança | o de hoje, sem mudança | nenhuma (fora do índice) | depois do WEB-32 |

- `/agencia/` e `/agencia/*` passam a ir direto para `https://agenciastrat.com.br/` quando o WEB-29 virar a Agência,
  para não fazer dois saltos (stratai → agencia.stratai → agenciastrat).
- `bio.stratai.com.br/agencia/` vai para `https://agenciastrat.com.br/bio/` (WEB-25), não para a bio da StratAI.

### Páginas novas

| URL atual | URL nova | Tipo | Item | 301 de | Título | H1 | Palavra-chave principal | Fase/lote |
|---|---|---|---|---|---|---|---|---|
| nenhuma | `/parcerias/` | parcerias | WEB-74 | nenhum (a prévia ficou fora deste domínio) | Parceria e indicação · StratAI | Indique empresas. Receba comissão todo mês. | programa de indicação de clientes de IA | junto do WEB-32 |
| nenhuma | `/agencia-de-ia-joinville/` | local | WEB-34 | | Agência de IA em Joinville · StratAI | A agência de IA de Joinville que coloca agentes para trabalhar na sua empresa | agência de IA Joinville | Lote A |
| nenhuma | `/agente-de-ia-whatsapp/` | produto | WEB-34 | | Agente de IA no WhatsApp para empresas · StratAI | Um agente de IA no WhatsApp que atende na hora, até fora do horário | agente de IA para WhatsApp | Lote A |
| nenhuma | `/casos/restaurante-reservas-no-whatsapp/` | caso | WEB-34 | | Caso: 180 reservas por mês pelo WhatsApp · StratAI | Restaurante de Joinville: 180 reservas por mês feitas por um agente de IA | agente de IA para reservas de restaurante | Lote A |
| nenhuma | `/casos/` | casos (índice) | WEB-60 (proposta: antecipar para o WEB-34) | | Casos de IA em empresas reais · StratAI | Casos da StratAI: o número que cada agente moveu | casos de uso de IA em empresas | Lote A (proposta) |
| nenhuma | `/sobre/` | institucional | WEB-34 | | Sobre a StratAI: agência de IA de Joinville/SC | Quem é a StratAI | StratAI (marca) | Lote A |
| nenhuma | `/agente-sdr-ia/` | produto | WEB-59 | | Agente SDR com IA: atende e qualifica o lead · StratAI | Um SDR com IA que atende o lead do anúncio na hora e marca a reunião | agente SDR com IA | Lote B |
| nenhuma | `/automacao-com-ia/` | serviço | WEB-59 | | Automação com IA para a rotina da empresa · StratAI | Automação com IA para o trabalho repetitivo do seu time | automação com IA para empresas | Lote B |
| nenhuma | `/sistemas-sob-medida/` | personalizado | WEB-59 | | Sistemas sob medida com IA para a sua empresa · StratAI | Painéis e sistemas sob medida, ligados às ferramentas que você já usa | sistema sob medida com IA | Lote B |
| nenhuma | `/metodo-das-alavancas/` | serviço | WEB-59 | | Método das Alavancas: por onde começar com IA · StratAI | Método das Alavancas: como escolhemos onde a IA entra primeiro | como implementar IA na empresa | Lote B |
| nenhuma | `/ia-para-restaurantes/` | segmento | WEB-60 | | IA para restaurantes: reservas no WhatsApp · StratAI | IA para restaurantes: reservas e pedidos atendidos no WhatsApp | IA para restaurantes | Lote C |
| nenhuma | `/ia-para-imobiliarias/` | segmento | WEB-60 | | IA para imobiliárias: lead atendido na hora · StratAI | IA para imobiliárias: nenhum lead do anúncio esperando resposta | IA para imobiliárias | Lote C |
| nenhuma | `/ia-para-ecommerce/` | segmento | WEB-60 | | IA para e-commerce: suporte que resolve sozinho · StratAI | IA para e-commerce: entrega, pagamento e troca respondidos na hora | IA para e-commerce | Lote C |
| nenhuma | `/ia-para-clinicas/` | segmento | WEB-60 | | IA para clínicas: agendamento no WhatsApp · StratAI | IA para clínicas: agenda e confirmação de consulta pelo WhatsApp | IA para clínicas | Lote C (sem número) |
| nenhuma | `/casos/imobiliaria-leads-fora-do-horario/` | caso | WEB-60 | | Caso: 480 leads atendidos fora do horário · StratAI | Imobiliária: 480 leads do anúncio atendidos fora do horário comercial | agente SDR para imobiliária | Lote C |
| nenhuma | `/casos/ecommerce-suporte-com-ia/` | caso | WEB-60 | | Caso: 85% do suporte resolvido pela IA · StratAI | E-commerce: 85% dos atendimentos de suporte resolvidos por agentes de IA | suporte com IA no e-commerce | Lote C |
| nenhuma | `/guias/` | guias (índice) | WEB-61 | | Guias para contratar IA na sua empresa · StratAI | Guias para quem vai contratar IA | como contratar IA para empresa | Guias (F4) |
| nenhuma | `/guias/quanto-custa-agente-de-ia/` | guia | WEB-61 | | Quanto custa um agente de IA no WhatsApp · StratAI | Quanto custa um agente de IA no WhatsApp (e o que muda o preço) | quanto custa agente de IA | Guias (F4) |
| nenhuma | `/guias/prazo-agente-de-ia/` | guia | WEB-61 | | Quanto tempo leva para ter um agente de IA · StratAI | Quanto tempo leva para colocar um agente de IA no ar | prazo para implementar agente de IA | Guias (F4) |
| nenhuma | `/guias/api-oficial-whatsapp/` | guia | WEB-61 | | API oficial do WhatsApp ou não oficial? · StratAI | API oficial do WhatsApp ou não oficial: o que muda para a sua empresa | API oficial do WhatsApp | Guias (F4) |
| nenhuma | `/guias/lgpd-agente-de-ia/` | guia | WEB-61 | | LGPD e agente de IA: o que a empresa precisa · StratAI | LGPD e agente de IA: o que a sua empresa precisa cuidar | LGPD e agente de IA | Guias (F4) |
| nenhuma | `/crm/` | produto | item novo a abrir | | CRM com IA ligado ao WhatsApp · StratAI | Um CRM em que o agente de IA registra cada conversa e cada venda | CRM com IA para WhatsApp | depois da decisão (seção 7) |
| nenhuma | `/blog/` | conteúdo | item novo a abrir | | Blog da StratAI: IA aplicada à pequena e média empresa | Blog da StratAI | nenhuma (índice do blog) | depois da decisão (seção 7) |
| nenhuma | `/ecossistema-de-ia-joinville/` | referência | item novo a abrir | | Ecossistema de IA em Joinville: eventos e grupos · StratAI | O ecossistema de IA de Joinville | inteligência artificial em Joinville | Guias (F4), se aprovado |

Observações por linha:

- **`/parcerias/`:** título e H1 da prévia aprovada pelo Helbert em 12/11/2026, sem mudar o conteúdo. Vai ao ar só com
  a indicação; o bloco de ferramentas parceiras com desconto entra depois, na mesma URL. Página por parceiro, se um
  dia existir, fica em `/parcerias/<parceiro>/`. Condições da parceria não entram na página nem neste repositório.
- **Casos:** o WEB-34 e o WEB-60 descrevem slugs com o nome do cliente; a proposta troca por slugs sem nome (princípio
  5). Com autorização, o nome entra no texto, no título e no H1, e a URL fica a mesma. O caso da imobiliária não é
  de Joinville: o título e o H1 não citam cidade.
- **`/casos/` no Lote A:** o caso do restaurante sai no Lote A, e o `BreadcrumbList` dele aponta para `/casos/`. Sem
  o índice, o caminho do breadcrumb ficaria quebrado até o Lote C. Proposta: o índice nasce no WEB-34 com um caso e
  cresce no WEB-60.
- **`/sobre/`:** fatos que Google e IA leem (endereço, CNPJ, sócios, as marcas do Grupo Strat com link para cada
  uma). É a "página de marca do grupo" sugerida no plano dos sites.
- **Guias:** URLs do WEB-61. O índice `/guias/` entra no mesmo item, pelo mesmo motivo do breadcrumb. Texto pelo
  setor de blog (perfil stratai), sem faixa de preço inventada; o prazo de 4 a 6 semanas tem fonte no `llms.txt`
  atual.
- **`/ecossistema-de-ia-joinville/`:** página de referência prevista na F4 do plano de Joinville (eventos, grupos e
  associações de IA da cidade), que pode receber link de volta. Nenhum item cobre hoje.

## 4. Onde as buscas encostam

| Busca | Página que disputa | Como fica separada |
|---|---|---|
| agente de IA no WhatsApp em Joinville | `/` | Home: local + WhatsApp, como no título aprovado em 04/11/2026 |
| agência de IA Joinville | `/agencia-de-ia-joinville/` | A home não usa "agência" no título; o kicker cita, mas o assunto da página é o local |
| agente de IA para WhatsApp (sem cidade) | `/agente-de-ia-whatsapp/` | Página nacional do produto; a home e a local linkam para ela |
| agente SDR com IA | `/agente-sdr-ia/` | Produto de vendas; o caso da imobiliária linka para ela |
| IA para restaurantes | `/ia-para-restaurantes/` | O caso do restaurante fica com a busca de prova ("reservas de restaurante") e linka para o segmento |
| suporte com IA no e-commerce | `/casos/ecommerce-suporte-com-ia/` | O segmento `/ia-para-ecommerce/` fica com "IA para e-commerce" |
| "agente de IA" genérico | nenhuma página nova | A reunião citou `/agente-de-ia/`; a home já disputa "agentes de IA para empresas", e uma página genérica dividiria a busca com ela (seção 7, item 1) |

## 5. Navegação proposta

### Menu (topo)

Na ordem da reunião de 12/11/2026, com cada link aparecendo só quando a página estiver no ar:

| Menu | Leva a | Submenu |
|---|---|---|
| Produtos | (sem página própria) | Agente de IA no WhatsApp `/agente-de-ia-whatsapp/` · Agente SDR com IA `/agente-sdr-ia/` · CRM `/crm/` (se aprovado) |
| Personalizado | `/sistemas-sob-medida/` | |
| Serviços | (sem página própria) | Automação com IA `/automacao-com-ia/` · Método das Alavancas `/metodo-das-alavancas/` · Raio-X de IA `/raio-x/` |
| Cases | `/casos/` | Por segmento: restaurantes, imobiliárias, e-commerce, clínicas |
| Parcerias | `/parcerias/` | |
| Blog | `/guias/` até haver `/blog/` | |
| botão "Fazer diagnóstico" | `/#diagnostico` | |
| Agência | `https://agenciastrat.com.br/` (hoje `agencia.stratai.com.br`) | |

Produtos e Serviços não ganham página de índice: a reunião pediu uma página por produto, na raiz, e um índice
repetiria o conteúdo da home. No celular, o mesmo menu em lista que abre por grupo.

### Rodapé

| Coluna | Links |
|---|---|
| Produtos | Agente de IA no WhatsApp · Agente SDR com IA · CRM (se aprovado) · Sistemas sob medida |
| Por segmento | Restaurantes · Imobiliárias · E-commerce · Clínicas |
| StratAI | Sobre · Agência de IA em Joinville · Casos · Método das Alavancas · Parcerias · Política de privacidade |
| Conteúdo | Guias · Blog (se aprovado) · Ecossistema de IA em Joinville (se aprovado) · Raio-X de IA |
| Grupo Strat | Agência Strat · Strat Academy · MetricaaS |

Abaixo das colunas: nome, endereço, telefone e CNPJ iguais aos de `docs/seo-geo.md`, e as redes da StratAI.
`/agencia-de-ia-joinville/` fica no rodapé e na `/sobre/`, não no menu: é página de busca local, não de navegação.

## 6. Ordem

| Passo | Item | URLs | Depende de |
|---|---|---|---|
| 1 | WEB-32 e WEB-74, juntos | `/`, `/raio-x/`, `/politica-de-privacidade/`, `/agencia/` (301), `/parcerias/` | a pilha do kit mesclada |
| 2 | WEB-33 e WEB-35 | título e kicker da home; `/bio/` com 301 | o passo 1 |
| 3 | WEB-34 (Lote A) | `/agencia-de-ia-joinville/`, `/agente-de-ia-whatsapp/`, caso do restaurante, `/casos/`, `/sobre/`; menu e rodapé novos | este mapa aprovado |
| 4 | WEB-59 (Lote B) | `/agente-sdr-ia/`, `/automacao-com-ia/`, `/sistemas-sob-medida/`, `/metodo-das-alavancas/` | este mapa aprovado |
| 5 | WEB-60 (Lote C) | 4 segmentos e 2 casos | este mapa aprovado e a autorização (ou não) de cada cliente |
| 6 | WEB-61 (Guias) | `/guias/` e 4 guias | este mapa aprovado |
| 7 | itens novos | `/crm/`, `/blog/`, `/ecossistema-de-ia-joinville/` | as decisões abaixo |

Cada passo atualiza `catalogo/sites.json`, `sitemap.xml` e `llms.txt` no mesmo PR.

## 7. Para o Helbert decidir

1. **Produto "agente de IA":** a reunião citou `/agente-de-ia/`. Proposta: não criar a página genérica e usar
   `/agente-de-ia-whatsapp/` (WEB-34), porque a home já disputa a busca genérica. Aprovar ou pedir as duas.
2. **`/crm/`:** é produto da StratAI (página aqui, item novo) ou o CRM do MetricaaS, que tem site próprio (aí o menu
   leva a metricaas.com.br e a página não existe)?
3. **Blog:** `/blog/` no stratai (plano dos sites e reunião) ou só `/guias/` com o resto no blog da Academy (D3 do
   plano de Joinville)? Proposta: `/guias/` agora; `/blog/` como item novo depois do schema do blog (WEB-19).
4. **Casos:** slug sem o nome do cliente (`/casos/restaurante-reservas-no-whatsapp/`) e `/casos/` antecipado para o
   Lote A. Aprovar.
5. **Menu na home:** a home não tem menu hoje. Proposta: o menu novo entra na home no PR do Lote A, com print antes e
   depois e os leads da home acompanhados na semana seguinte (se caírem, volta).
6. **Política com barra:** o WEB-32 passa o canonical para `/politica-de-privacidade/`, com 301 da forma sem barra.
   Aprovar ou manter sem barra.
7. **`/ecossistema-de-ia-joinville/`:** abrir item ou deixar de fora.
