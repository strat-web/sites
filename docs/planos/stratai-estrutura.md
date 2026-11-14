# StratAI: mapa de URLs proposto

- **Estado:** proposta para o Helbert aprovar neste PR (pedido dele em 12/11/2026, 13h45), revista depois da revisão
  dele no PR #14 (12/11/2026, 16h14): consentimento por página (seção 3, "Consentimento e Rastro"), URLs sem item
  fora da tabela (seção 7) e a busca de cada página (seção 4). O WEB-32 foi mesclado em 12/11/2026 (PR #16), mas o
  domínio ainda serve pelo strat-lps: nada aqui está no ar.
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

No `catalogo/sites.json` estão `/`, `/raio-x/`, `/bio/` (esta como alvo do WEB-35) e, desde o WEB-32 (PR #16), a
política (`stratai-politica-de-privacidade`).

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
   **Número no título ou no H1** (as 180 reservas, os 480 leads e os 85% da tabela da seção 3) só vai ao ar com a fonte
   anexada no PR do lote (print do painel, relatório do MetricaaS ou do cliente, com data e período). Sem fonte no PR,
   o título e o H1 saem sem o número, e a URL não muda.
6. **Texto na voz da StratAI**, pelo design system da marca, aprovado pelo Helbert. Página nova não copia bloco da
   home.
7. **Tracking e consentimento pelo kit.** Página nova entra no catálogo no mesmo PR, com o slug do Rastro e o
   consentimento da tabela "Consentimento e Rastro das páginas novas" (seção 3), que é **decisão do Helbert**. Hoje
   toda a StratAI usa os produtos `stratai` (home e `/bio/`) e `raio-x-ia` (`/raio-x/`) do Rastro, os dois em `off`
   (exceção herdada do WEB-72). Página nova com o Rastro `stratai` não pode nascer em `soft`: a checagem `tracking`
   exige que o catálogo bata com o `consentMode` do produto, e mudar o produto mudaria a home, o que o WEB-32 proíbe.
   Por isso cada página nova ou ganha **produto novo no Rastro**, já no modo certo (`soft` para `lead`, `strict` para
   `banner`), ou entra como **exceção `off`** com o Rastro `stratai`, registrada em `docs/decisoes.md`. As páginas
   migradas pelo WEB-32 ficam como estão.
8. **O menu só mostra o que está no ar.** Link para página que ainda não existe não entra (a checagem `links` barra).

## 3. Mapa de URLs

Títulos até cerca de 60 caracteres, com a marca no fim (exceção marcada na linha). Os títulos e H1 das páginas novas
são proposta: o plano de Joinville v2 só definiu o título da home. Só entra na tabela URL que tem item no Plane;
`/crm/`, `/blog/` e `/ecossistema-de-ia-joinville/` estão na seção 7 até o item ser aberto.

### Páginas que já existem

| URL atual | URL nova | Tipo | Item | 301 de | Título | H1 | Palavra-chave principal | Fase/lote |
|---|---|---|---|---|---|---|---|---|
| `/` | `/` | home | WEB-32 (migra igual), WEB-33 (título, descrição e kicker) | | Agentes de IA no WhatsApp em Joinville \| StratAI (aprovado no plano de 04/11/2026) | Agentes de IA que atendem a sua empresa. Sem contratar mais gente. (sem mudança) | agente de IA no WhatsApp em Joinville | WEB-32, depois F1 (WEB-33) |
| `/raio-x/` | `/raio-x/` | diagnóstico | WEB-32 | `/raio-x` (já existe) | Raio-X de IA · Quanto a sua empresa perde por mês sem IA? · StratAI (sem mudança; 67 caracteres, acima dos ~60: **exceção**, mantida pelo WEB-32) | Quanto a sua empresa perde por mês sem IA? (sem mudança) | diagnóstico de IA para empresas | WEB-32 |
| `/politica-de-privacidade` | `/politica-de-privacidade/` (se a decisão 6 for aprovada) | legal | WEB-32 | `/politica-de-privacidade` e `.html` (regra já no `_redirects` da `main`, ainda não no ar; depende da decisão 6) | Política de privacidade · StratAI (sem mudança) | Política de privacidade (sem mudança) | nenhuma (página legal) | WEB-32 |
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
| nenhuma | `/sobre/` | institucional | WEB-34 | | Sobre a StratAI: agência de IA de Joinville/SC | StratAI: a empresa de agentes de IA do Grupo Strat, em Joinville/SC (proposta) | StratAI (marca) | Lote A |
| nenhuma | `/agente-sdr-ia/` | produto | WEB-59 | | Agente SDR com IA: atende e qualifica o lead · StratAI | Um SDR com IA que atende o lead do anúncio na hora e marca a reunião | agente SDR com IA | Lote B |
| nenhuma | `/automacao-com-ia/` | serviço | WEB-59 | | Automação com IA para a rotina da empresa · StratAI | Automação com IA para o trabalho repetitivo do seu time | automação com IA para empresas | Lote B |
| nenhuma | `/sistemas-sob-medida/` | personalizado | WEB-59 | | Sistemas sob medida com IA para a sua empresa · StratAI | Painéis e sistemas sob medida, ligados às ferramentas que você já usa | sistema sob medida com IA | Lote B |
| nenhuma | `/metodo-das-alavancas/` | serviço | WEB-59 | | Método das Alavancas: por onde começar com IA · StratAI | Método das Alavancas: como escolhemos onde a IA entra primeiro | como implementar IA na empresa | Lote B |
| nenhuma | `/ia-para-restaurantes/` | segmento | WEB-60 | | IA para restaurantes: reservas no WhatsApp · StratAI | IA para restaurantes: reservas e pedidos atendidos no WhatsApp | IA para restaurantes | Lote C |
| nenhuma | `/ia-para-imobiliarias/` | segmento | WEB-60 | | IA para imobiliárias: lead atendido na hora · StratAI | IA para imobiliárias: nenhum lead do anúncio esperando resposta | IA para imobiliárias | Lote C |
| nenhuma | `/ia-para-ecommerce/` | segmento | WEB-60 | | IA para e-commerce: suporte que resolve sozinho · StratAI | IA para e-commerce: entrega, pagamento e troca respondidos na hora | IA para e-commerce | Lote C |
| nenhuma | `/ia-para-clinicas/` | segmento | WEB-60 | | IA para clínicas: agendamento no WhatsApp · StratAI | IA para clínicas: agenda e confirmação de consulta pelo WhatsApp | IA para clínicas | Lote C (sem número) |
| nenhuma | `/casos/imobiliaria-leads-fora-do-horario/` | caso | WEB-60 | | Caso: 480 leads atendidos fora do horário · StratAI | Imobiliária: 480 leads do anúncio atendidos fora do horário comercial | caso de agente de IA em imobiliária (prova; ver seção 4) | Lote C |
| nenhuma | `/casos/ecommerce-suporte-com-ia/` | caso | WEB-60 | | Caso: 85% do suporte resolvido pela IA · StratAI | E-commerce: 85% dos atendimentos de suporte resolvidos por agentes de IA | suporte com IA no e-commerce | Lote C |
| nenhuma | `/guias/` | guias (índice) | WEB-61 | | Guias para contratar IA na sua empresa · StratAI | Guias para quem vai contratar IA | como contratar IA para empresa | Guias (F4) |
| nenhuma | `/guias/quanto-custa-agente-de-ia/` | guia | WEB-61 | | Quanto custa um agente de IA no WhatsApp · StratAI | Quanto custa um agente de IA no WhatsApp (e o que muda o preço) | quanto custa agente de IA | Guias (F4) |
| nenhuma | `/guias/prazo-agente-de-ia/` | guia | WEB-61 | | Quanto tempo leva para ter um agente de IA · StratAI | Quanto tempo leva para colocar um agente de IA no ar | prazo para implementar agente de IA | Guias (F4) |
| nenhuma | `/guias/api-oficial-whatsapp/` | guia | WEB-61 | | API oficial do WhatsApp ou não oficial? · StratAI | API oficial do WhatsApp ou não oficial: o que muda para a sua empresa | API oficial do WhatsApp | Guias (F4) |
| nenhuma | `/guias/lgpd-agente-de-ia/` | guia | WEB-61 | | LGPD e agente de IA: o que a empresa precisa · StratAI | LGPD e agente de IA: o que a sua empresa precisa cuidar | LGPD e agente de IA | Guias (F4) |

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

### Consentimento e Rastro das páginas novas (decisão do Helbert)

Para cada página nova, as duas saídas do princípio 7. **Quem escolhe é o Helbert, linha a linha**; o PR de cada lote
grava a escolha no catálogo e, se for exceção, em `docs/decisoes.md`. Os slugs novos são proposta: o produto é
criado no Rastro (dash do Horus, central de controle → cadastros) antes do PR do lote, com o mesmo pixel, GA4 e
workspace do MetricaaS (`agencia-strat`) da home.

| Página | Perfil | Saída 1: produto novo no Rastro | Saída 2: exceção | Depende de |
|---|---|---|---|---|
| `/parcerias/` (WEB-74) | `lead` | `stratai-parcerias` em `soft` | `off` com o Rastro `stratai`, como está no #22 | a decisão já pedida no WEB-74 |
| `/agencia-de-ia-joinville/`, `/agente-de-ia-whatsapp/` (Lote A) | `lead` | `stratai-paginas` em `soft` | `off` com o Rastro `stratai` | |
| `/agente-sdr-ia/`, `/automacao-com-ia/`, `/sistemas-sob-medida/`, `/metodo-das-alavancas/` (Lote B) | `lead` | `stratai-paginas` em `soft` | `off` com o Rastro `stratai` | |
| `/ia-para-restaurantes/`, `/ia-para-imobiliarias/`, `/ia-para-ecommerce/`, `/ia-para-clinicas/` (Lote C) | `lead` | `stratai-paginas` em `soft` | `off` com o Rastro `stratai` | |
| `/sobre/`, `/casos/` e os 3 casos (Lotes A e C) | `conteudo` (proposta: não têm formulário, só links para a home e o WhatsApp) | `stratai-conteudo` em `strict` (`banner` no catálogo) | | #17 (WEB-81) mesclado |
| `/guias/` e os 4 guias (WEB-61) | `conteudo` | `stratai-conteudo` em `strict` (`banner` no catálogo) | | #17 (WEB-81) mesclado |

- **Um produto para todas as páginas `lead` novas**, e não um por página: o pixel, o GA4 e o MetricaaS são os mesmos,
  e a página de origem já vai em cada evento. Se o Helbert preferir separar, o slug passa a ser por lote
  (`stratai-lote-a`, `stratai-lote-b`, `stratai-lote-c`).
- **O que muda para quem visita:** com a saída 1, a página nova mostra o aviso do `soft` e a home não; com a saída 2,
  o domínio fica igual de ponta a ponta, mas a lista de exceções `off` cresce.
- **Páginas `conteudo` em `banner`:** o kit só aceita Rastro com `banner` depois do #17 (WEB-81). Sem ele mesclado,
  os passos 3, 5 e 6 da seção 6 não abrem PR das páginas `conteudo`.

## 4. Onde as buscas encostam

Uma busca principal por página; as outras páginas do grupo não a usam no título nem no H1 e linkam para ela com
essa busca como texto do link. **As duas separações abaixo foram validadas pelo Jhonathan em 13/11/2026** e esperam
a aprovação do Helbert neste PR (sem dado de volume: a escolha vem do plano de Joinville e da intenção de cada busca;
os números entram quando o OpenSEO do WEB-62 tiver a primeira leitura da StratAI).

### Home × `/agente-de-ia-whatsapp/` × `/agencia-de-ia-joinville/`

As três só se diferenciavam por "Joinville". Validado (Jhonathan, 13/11/2026): separar por **intenção**, não pela
cidade.

| Página | Busca principal | Intenção | Link para as outras |
|---|---|---|---|
| `/` | StratAI (marca) + "agentes de IA no WhatsApp em Joinville" | quem procura a empresa ou uma empresa local que faça isso; é a página de conversão | card do módulo WhatsApp → `/agente-de-ia-whatsapp/` ("agente de IA para WhatsApp"); rodapé → `/agencia-de-ia-joinville/` |
| `/agente-de-ia-whatsapp/` | "agente de IA para WhatsApp" e "atendimento automático no WhatsApp com IA", **sem cidade** | quem quer entender e contratar o produto (o que faz, integrações, API oficial, prazo) | CTA → `/#diagnostico`; "em Joinville" só no texto, com link → `/agencia-de-ia-joinville/`; → `/guias/api-oficial-whatsapp/` e `/guias/quanto-custa-agente-de-ia/` |
| `/agencia-de-ia-joinville/` | "agência de IA Joinville" | quem procura fornecedor local de IA (qualquer serviço, não só WhatsApp) | → `/` (marca), `/agente-de-ia-whatsapp/`, `/casos/`, `/sobre/` |

- A página do produto não leva "Joinville" no título, no H1 nem na descrição, e a home não usa "agente de IA para
  WhatsApp" sem a cidade. Assim só a home disputa a busca local de WhatsApp (título aprovado em 04/11/2026) e só a
  página do produto disputa a busca nacional.
- Alternativa descartada: a home trocar o título no WEB-33 para "StratAI · Agentes de IA para empresas em Joinville"
  e deixar toda a busca "WhatsApp" para a página do produto. Mexeria num título já aprovado.

### Caso da imobiliária × `/agente-sdr-ia/` × `/ia-para-imobiliarias/`

| Página | Busca principal | Intenção | Link para as outras |
|---|---|---|---|
| `/agente-sdr-ia/` | "agente SDR com IA" | produto, para qualquer segmento; o título e o H1 não citam segmento | → os casos como prova (imobiliária e restaurante); → `/ia-para-imobiliarias/` no bloco "por segmento" |
| `/ia-para-imobiliarias/` | "IA para imobiliárias" (e "agente SDR para imobiliária" como busca secundária, só no texto) | o dono de imobiliária que procura solução para o setor | → `/agente-sdr-ia/` ("agente SDR com IA"); → o caso ("caso de imobiliária") |
| `/casos/imobiliaria-leads-fora-do-horario/` | "caso de agente de IA em imobiliária" | prova: quem já está comparando e quer resultado | → `/ia-para-imobiliarias/` e `/agente-sdr-ia/`, com essas buscas como texto do link; → `/casos/` no breadcrumb |

- Validado (Jhonathan, 13/11/2026): o caso deixa a busca "agente SDR para imobiliária" (estava na tabela da
  seção 3) para o segmento, e o título dele fica no resultado, sem "SDR" nem "IA para imobiliárias".

### Outras que encostam (sem mudança)

| Busca | Página | Como fica separada |
|---|---|---|
| agente SDR com IA | `/agente-sdr-ia/` | produto de vendas; o caso da imobiliária linka para ela |
| IA para restaurantes | `/ia-para-restaurantes/` | o caso do restaurante fica com a busca de prova ("reservas de restaurante") e linka para o segmento |
| suporte com IA no e-commerce | `/casos/ecommerce-suporte-com-ia/` | o segmento `/ia-para-ecommerce/` fica com "IA para e-commerce" |
| "agente de IA" genérico | nenhuma página nova | a reunião citou `/agente-de-ia/`; a home já disputa "agentes de IA para empresas", e uma página genérica dividiria a busca com ela (seção 7, item 1) |

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
| Guias | `/guias/` | (o menu diz "Guias" enquanto `/blog/` não existir; se o item do blog for aberto, vira "Blog", com os guias dentro) |
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
| 1 | WEB-32 (mesclado em 12/11, PR #16) e WEB-74 | `/`, `/raio-x/`, `/politica-de-privacidade/`, `/agencia/` (301), `/parcerias/` | o #22 ajustado; a virada do DNS sai com os dois |
| 2 | WEB-33 e WEB-35 | título e kicker da home; `/bio/` com 301 | o passo 1 |
| 3 | WEB-34 (Lote A) | `/agencia-de-ia-joinville/`, `/agente-de-ia-whatsapp/`, caso do restaurante, `/casos/`, `/sobre/`; menu e rodapé novos | este mapa aprovado, o consentimento de cada linha decidido e, para `/sobre/`, `/casos/` e o caso (`conteudo`, em `banner`), o #17 (WEB-81) |
| 4 | WEB-59 (Lote B) | `/agente-sdr-ia/`, `/automacao-com-ia/`, `/sistemas-sob-medida/`, `/metodo-das-alavancas/` | este mapa aprovado |
| 5 | WEB-60 (Lote C) | 4 segmentos e 2 casos | este mapa aprovado, a autorização (ou não) de cada cliente e, para os 2 casos (`banner`), o #17 (WEB-81) |
| 6 | WEB-61 (Guias) | `/guias/` e 4 guias | este mapa aprovado e o #17 (WEB-81) mesclado: as páginas `conteudo` nascem em `banner` |
| 7 | itens novos, se abertos | `/blog/`, `/ecossistema-de-ia-joinville/` (`conteudo`, em `banner`) e `/crm/` | as decisões 2, 3 e 7 da seção 7 e, para as de `conteudo`, o #17 (WEB-81) mesclado |

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
6. **Política com barra:** ainda é decisão. O WEB-32 (mesclado em 12/11) já leva o canonical para
   `/politica-de-privacidade/` e o 301 da forma sem barra no `_redirects`, mas nada disso está no ar: o domínio
   ainda serve pelo strat-lps. Aprovar, ou manter sem barra (aí o 301 e o canonical voltam antes da virada do DNS).
7. **`/ecossistema-de-ia-joinville/`:** abrir item ou deixar de fora.

### URLs sem item (fora do mapa até o item ser aberto)

Saíram da tabela da seção 3 porque nenhum item do Plane as cobre. Entram no mapa, com a linha abaixo como ponto de
partida, quando o item for aberto (decisões 2, 3 e 7). Até lá não entram no menu, no rodapé nem no catálogo.

| URL | Tipo | Título (proposta) | H1 (proposta) | Palavra-chave principal | Consentimento |
|---|---|---|---|---|---|
| `/crm/` | produto | CRM com IA ligado ao WhatsApp · StratAI | Um CRM em que o agente de IA registra cada conversa e cada venda | CRM com IA para WhatsApp | `lead`: as mesmas saídas das páginas `lead` novas |
| `/blog/` | conteúdo | Blog da StratAI: IA aplicada à pequena e média empresa | IA aplicada à pequena e média empresa, na prática | nenhuma (índice do blog) | `banner`, depois do #17 (WEB-81) |
| `/ecossistema-de-ia-joinville/` | referência | Ecossistema de IA em Joinville: eventos e grupos · StratAI | Eventos, grupos e associações de IA em Joinville | inteligência artificial em Joinville | `banner`, depois do #17 (WEB-81) |

`/ecossistema-de-ia-joinville/` é a página de referência prevista na F4 do plano de Joinville (eventos, grupos e
associações de IA da cidade), que pode receber link de volta.
