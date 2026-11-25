# apps/stratai · stratai.com.br

Site da StratAI no Cloudflare Pages (projeto `stratai`, prévia em https://stratai-ti7.pages.dev). Migrado do
`strat-lps` (`lps/stratai`) no WEB-32, em 12/11/2026, **sem mudar texto, layout nem tracking** (decisão do Helbert,
12/11/2026).

| Página | Arquivo | Linha do catálogo | Tracking (pelo `<Tracking>` do kit) |
|---|---|---|---|
| `/` | `src/pages/index.astro` + `src/html/home.*.html` | `stratai` | Rastro `stratai` e MetricaaS `agencia-strat` |
| `/raio-x/` | `src/pages/raio-x/index.astro` + `src/html/raio-x.*.html` | `stratai-raio-x` | Rastro `raio-x-ia` e MetricaaS `agencia-strat` |
| `/politica-de-privacidade/` | `src/pages/politica-de-privacidade/index.astro` + `src/html/politica-de-privacidade.*.html` | `stratai-politica-de-privacidade` | nenhum (como no ar) |
| `/recuperacao/v1/` a `/v4/` | `src/pages/recuperacao/v*/index.astro` + `src/html/recuperacao/v*.*.html` | `stratai-recuperacao-v*` | Rastro `stratai-recuperacao` (soft) e MetricaaS `agencia-strat` |
| `/agencia-de-ia-joinville/` | `src/pages/agencia-de-ia-joinville/index.astro` + `src/layouts/Pagina.astro` | `stratai-agencia-de-ia-joinville` | Rastro `stratai-paginas` (soft) e MetricaaS `agencia-strat` (WEB-34) |
| `/agente-de-ia-whatsapp/` | `src/pages/agente-de-ia-whatsapp/index.astro` + `Pagina.astro` | `stratai-agente-de-ia-whatsapp` | Rastro `stratai-paginas` (soft) e MetricaaS `agencia-strat` (WEB-34) |
| `/casos/` | `src/pages/casos/index.astro` + `Pagina.astro` | `stratai-casos` | Rastro `stratai-conteudo` (banner/strict) e MetricaaS `agencia-strat` (WEB-34) |
| `/casos/restaurante-reservas-no-whatsapp/` | `src/pages/casos/restaurante-reservas-no-whatsapp/index.astro` + `Pagina.astro` | `stratai-caso-restaurante` | Rastro `stratai-conteudo` (banner/strict) e MetricaaS `agencia-strat` (WEB-34) |
| `/sobre/` | `src/pages/sobre/index.astro` + `Pagina.astro` | `stratai-sobre` | Rastro `stratai-conteudo` (banner/strict) e MetricaaS `agencia-strat` (WEB-34) |
| `/agente-sdr-ia/` | `src/pages/agente-sdr-ia/index.astro` + `Pagina.astro` | `stratai-agente-sdr-ia` | Rastro `stratai-paginas` (soft) e MetricaaS `agencia-strat` (WEB-59) |
| `/automacao-com-ia/` | `src/pages/automacao-com-ia/index.astro` + `Pagina.astro` | `stratai-automacao-com-ia` | Rastro `stratai-paginas` (soft) e MetricaaS `agencia-strat` (WEB-59) |
| `/sistemas-sob-medida/` | `src/pages/sistemas-sob-medida/index.astro` + `Pagina.astro` | `stratai-sistemas-sob-medida` | Rastro `stratai-paginas` (soft) e MetricaaS `agencia-strat` (WEB-59) |
| `/metodo-das-alavancas/` | `src/pages/metodo-das-alavancas/index.astro` + `Pagina.astro` | `stratai-metodo-das-alavancas` | Rastro `stratai-paginas` (soft) e MetricaaS `agencia-strat` (WEB-59) |
| `/ia-para-restaurantes/` | `src/pages/ia-para-restaurantes/index.astro` + `Pagina.astro` | `stratai-ia-para-restaurantes` | Rastro `stratai-paginas` (soft) e MetricaaS `agencia-strat` (WEB-60) |
| `/ia-para-imobiliarias/` | `src/pages/ia-para-imobiliarias/index.astro` + `Pagina.astro` | `stratai-ia-para-imobiliarias` | Rastro `stratai-paginas` (soft) e MetricaaS `agencia-strat` (WEB-60) |
| `/ia-para-ecommerce/` | `src/pages/ia-para-ecommerce/index.astro` + `Pagina.astro` | `stratai-ia-para-ecommerce` | Rastro `stratai-paginas` (soft) e MetricaaS `agencia-strat` (WEB-60) |
| `/ia-para-clinicas/` | `src/pages/ia-para-clinicas/index.astro` + `Pagina.astro` | `stratai-ia-para-clinicas` | Rastro `stratai-paginas` (soft) e MetricaaS `agencia-strat` (WEB-60) |
| `/casos/imobiliaria-leads-fora-do-horario/` | `src/pages/casos/imobiliaria-leads-fora-do-horario/index.astro` + `Pagina.astro` | `stratai-caso-imobiliaria` | Rastro `stratai-conteudo` (banner/strict) e MetricaaS `agencia-strat` (WEB-60) |
| `/casos/ecommerce-suporte-com-ia/` | `src/pages/casos/ecommerce-suporte-com-ia/index.astro` + `Pagina.astro` | `stratai-caso-ecommerce` | Rastro `stratai-conteudo` (banner/strict) e MetricaaS `agencia-strat` (WEB-60) |
| `/guias/` | `src/pages/guias/index.astro` + `Pagina.astro`, lista em `src/data/guias.js` | `stratai-guias` | Rastro `stratai-conteudo` (banner/strict) e MetricaaS `agencia-strat` (WEB-61) |
| `/guias/quanto-custa-agente-de-ia/`, `/guias/prazo-agente-de-ia/`, `/guias/api-oficial-whatsapp/`, `/guias/lgpd-agente-de-ia/` | `src/pages/guias/<guia>/index.astro` + `src/layouts/Guia.astro` | `stratai-guia-quanto-custa`, `stratai-guia-prazo`, `stratai-guia-api-oficial`, `stratai-guia-lgpd` | Rastro `stratai-conteudo` (banner/strict) e MetricaaS `agencia-strat` (WEB-61) |
| `/recuperacao/cases/` e `/recuperacao/cases/<cliente>/` | `src/pages/recuperacao/cases/` (conteúdo em `public/recuperacao/comum/cases.js`) | `stratai-recuperacao-case*` | Rastro `stratai-recuperacao` (soft) e MetricaaS `agencia-strat` |
| `/parcerias/` | `src/pages/parcerias/index.astro`, `src/layouts/Parcerias.astro`, `src/components/parcerias/`, textos em `src/data/parcerias.json` | `stratai-parcerias` | Rastro `stratai-parcerias` (soft) e MetricaaS `agencia-strat`; o cadastro vai pelo `mtc.lead()` (WEB-74) |

## Funil de recuperação de vendas (`/recuperacao/`, WEB-91)
Formulário de qualificação do produto de recuperação comissionada (15% só do que for recuperado), construído na
DEV-94 para o tráfego pago. **Rascunho e `noindex`** até os cases terem o conteúdo validado e o produto low ticket da V4 ser validado com o Helbert (os `[X]` marcam o que falta). Os cinco cases já foram autorizados pelo Helbert em 13/11; isso não substitui a validação do conteúdo.
- A fonte é o projeto `FunilRecuperacao-StratAI` (dev_ops do Jhonathan); `scripts/para-o-repo.py` gera
  `public/recuperacao/` e `src/html/recuperacao/`. Mudança de texto ou regra: em `FunilRecuperacao-StratAI/site/comum/funil.js`
  (perguntas, saídas, lâminas, agenda, produto, classificação, envio) e `site/comum/cases.js` (cases); depois regenerar. Não editar somente a cópia em `public/`.
- 4 versões com as mesmas 7 perguntas, as 2 lâminas antes do formulário (o que a gente banca e o carrossel de cases,
  não clicável) e o mesmo fim ("seu perfil entrou em análise"). V4: compra rápida e agenda com o Helbert no fim.
- Lead: `mtc.lead()` uma vez no fim (o m.js vem do `<Tracking>`), só em `stratai.com.br` (o `.pages.dev` não envia).
  A e B vão como `qualificado`, C como `desqualificado`. Eventos `funil_*` e `cta_click`, sem resposta nem dado pessoal.
  O envio tem prazo (tag 8 s + `mtc.lead()` 15 s); na falha, a página avisa, oferece "Tentar de novo" e o contato
  `contato@strat.tec.br` e não apaga nada (`funil_lead_erro`). Na prévia, `?simular=erro` mostra essa tela.
- Consentimento `soft` com o produto `stratai-recuperacao` no Rastro (regra do WEB-72, decisão do Helbert no #24).
  A política de privacidade tem a seção do funil (dados, nota A/B/C que decide o evento na Meta, base legal e prazo).
- Agenda: usa o link oficial existente do Helbert, https://calendar.app.google/fTLUDRk5TeRrkY9TA (ficha `03-time/helbert.md` e `04-areas/comercial.md` do contexto da Strat). Low ticket/checkout da V4 depende de validação com ele.
- Fontes Space Grotesk e JetBrains Mono servidas pelo próprio site (`public/fontes/`, com licenças OFL), sem Google Fonts. As páginas de case não carregam o motor de perguntas do funil.
- V1, V2 e V4 trazem a abertura pronta no HTML (`data-pre="abertura"`), para a primeira tela pintar antes do JS (LCP).

## Como as páginas migradas são montadas
- O HTML de cada página está em `src/html/<página>.head.html` (favicon, cor do tema, fontes, `<style>`) e
  `src/html/<página>.corpo.html` (o `<body>` inteiro, com o script da página). Para mudar texto, é editar ali.
- O `.astro` passa título, descrição e cartão de compartilhamento ao `Layout` do kit, que gera `<title>`, description,
  canonical, robots, Open Graph, JSON-LD da marca e o `<Tracking>` da linha do catálogo. Por isso o HTML não tem
  nenhuma dessas tags (o teste `test/migracao.test.js` barra se voltarem).
- Imagens em `public/midia/` (as mesmas do `strat-lps`); o CSS da política (o mesmo da política da Agência) em
  `public/css/`.

## O que mudou em relação ao strat-lps (e por quê)
| Mudança | Por quê |
|---|---|
| As tags do Rastro e do MetricaaS saíram do fim do `<body>` e entram no `<head>` pelo kit, com o m.js antes do Rastro, os dois com `defer` | regra dura 2 (tracking só pelo `<Tracking>`) e regra dura do lead (m.js primeiro). Mesmos `src` e `data-ws` |
| Os 6 links de WhatsApp da home saem com o `wa.me` escrito no `href` (antes `href="#"`, montado pelo script) | o link vira o mesmo que o script já montava, letra por letra; a checagem `seo` barra `href="#"`. O script continua igual |
| `/politica-de-privacidade` ganhou barra no fim; os links da home e do Raio-X apontam para a forma com barra | padrão de URL do repositório; a forma antiga responde 301 (`public/_redirects`) |
| Na política, `midia/` e `agencia/css/` viraram `/midia/` e `/css/` | com a barra no fim, o caminho relativo deixaria de achar a imagem e o CSS. No ar, o CSS vinha por um 301 para agencia.stratai.com.br |
| `<meta name="robots" content="index, follow">`, `twitter:card` na política e o JSON-LD da StratAI no `<head>` | o kit põe em toda página |
| `/raio-x/v1/` (primeira versão, noindex, só referência) não veio: responde 301 para `/raio-x/` | página não divulgada; sem ela, o 301 evita o 404 |

As páginas de teste do kit (`/kit/`, `/kit/lead/` e `/kit/conteudo/`, noindex, WEB-16 e WEB-17) saíram em 13/11/2026,
antes de o domínio virar para cá (WEB-32). As de teste do `<Tracking>` que ficam estão na Agência e na Academy
(`docs/tracking.md`); o código das que saíram está no histórico do git.

## Páginas novas da estrutura (WEB-34 em diante)
As páginas do mapa (`docs/planos/stratai-estrutura.md`) usam a casca `src/layouts/Pagina.astro`: o Layout do kit, o
menu e o rodapé da seção 5 do mapa (só com links para páginas que já existem; cada lote acrescenta as suas em `MENU`
e `RODAPE`), a trilha (`<Breadcrumb>` do kit) e o visual da home. Cada página tem FAQ pelo `<Faq>` do kit (FAQPage
igual ao visível), 2 ou mais links internos e o CTA "Fazer meu diagnóstico" para `/#diagnostico`. Números só dos
casos, com a fonte no comentário do topo de cada página (regra dura 4). Casos sem o nome do cliente até a
autorização (`docs/decisoes.md`, 12/11).

Lote A (WEB-34, 25/11/2026) também mexeu na home, pela decisão 5 da seção 7 do mapa (Helbert, 19/11): o menu do topo
(Agente no WhatsApp, Raio-X de IA, Casos, Parcerias e Sobre; em lista no celular e abaixo de 1180 px), o link do card
de atendimento para `/agente-de-ia-whatsapp/`, o "Ler o caso completo" no caso do restaurante, as páginas novas no
rodapé e a Agência apontando para `agenciastrat.com.br`. Texto, layout e tracking do resto da home não mudaram. Regra
da decisão: uma semana de leads da home acompanhada depois do merge; se caírem, o menu volta.

Lote B (WEB-59, 25/11/2026): `/agente-sdr-ia/`, `/automacao-com-ia/`, `/sistemas-sob-medida/` e `/metodo-das-alavancas/`,
todas `lead` com o Rastro `stratai-paginas` em `soft`. O menu da casca passou a seguir a seção 5 do mapa: Produtos
(Agente de IA no WhatsApp, Agente SDR com IA) e Serviços (Automação com IA, Método das Alavancas, Raio-X de IA) como
submenu (`<details class="sub">` dentro do `MENU`, campo `itens`), Personalizado levando a `/sistemas-sob-medida/`, e
Casos, Parcerias e Sobre. Até 1023 px o menu abre em lista pelo botão "Menu"; a partir de 1024 px o script inline
da casca (o do Lote A, que abre o `<details>` do menu no computador) deixa o menu em linha e fecha um submenu quando
outro abre ou ao clicar fora. O menu da home (WEB-34) não mudou. O rodapé da casca ganhou
Agente SDR com IA, Sistemas sob medida e Automação com IA em Produtos e Método das Alavancas em StratAI.
Lote C (WEB-60, 25/11/2026): os quatro segmentos (`/ia-para-restaurantes/`, `/ia-para-imobiliarias/`,
`/ia-para-ecommerce/` e `/ia-para-clinicas/`, perfil `lead`) e os casos da imobiliária e do e-commerce (perfil
`conteudo`), anônimos como o do restaurante; o da imobiliária não cita cidade (seção 3 do mapa). Clínicas sem número:
não há caso de clínica, e a página diz isso. `/casos/` passou a ter os três casos, os links por segmento e FAQ; a
casca ganhou a coluna "Por segmento" no rodapé (o menu do topo não mudou). Na home, só o "Ler o caso completo" nos
casos da imobiliária e do e-commerce, como o do restaurante no Lote A. Links que esperam página: os segmentos e o caso
da imobiliária ganham o link para `/agente-sdr-ia/` quando o Lote B (WEB-59) entrar; a checagem `links` barra link
para página que não existe.
## Guias de compra (WEB-61, 25/11/2026)
`/guias/` e quatro guias (mapa, seção 3), na casca `src/layouts/Guia.astro`, que monta sobre a `Pagina.astro`: trilha
Início › Guias › guia, JSON-LD `Article` (autor e editora: a StratAI; `citation` com as fontes), data de publicação e
de atualização (o `atualizado` vira o `article:modified_time` e o `lastmod` do sitemap), a lista "Fontes" com a data
de consulta de cada uma, o FAQ do kit, os outros guias (de `src/data/guias.js`) e o CTA para `/#diagnostico`.
- **Fato de fora só com fonte oficial:** regras e preços da Meta pela documentação da WhatsApp Business Platform e
  pela Central de Ajuda do WhatsApp; LGPD pelo texto da Lei 13.709/2018 no planalto.gov.br e pela ANPD. Cada link
  vai na lista `fontes` da página, e o comentário do topo diz de onde veio cada fato.
- **Sem faixa de preço** (regra dura 4): o guia de custo explica do que o preço depende; nenhum valor da tabela da
  Meta é copiado. O prazo de 4 a 6 semanas e o método semana a semana vêm da home.
- **LGPD sem parecer jurídico:** o guia diz isso no topo e não promete conformidade.
- **Guia novo:** página em `src/pages/guias/<slug>/`, item em `src/data/guias.js`, linha no catálogo (perfil
  `conteudo`, `stratai-conteudo`, `banner`) e as fontes conferidas na data do PR. Ao revisar um guia, atualizar
  `atualizado` e a data de consulta das fontes que foram conferidas de novo.
- O texto não saiu de um perfil "stratai" do setor de blog: esse perfil ainda não existe (depende do WEB-43). A voz é
  a da StratAI no Saber (`marca_obter strat-ai`, versão 0.3.0).
- A `Pagina.astro` ganhou Guias no menu e no rodapé e o prop `atualizado`. Com Guias, o menu em linha só cabe a
  partir de 1100 px (medido em 25/11 no Chrome sem janela: em 1024 ele quebra em duas linhas); abaixo disso fica o
  botão "Menu".

## Depois da migração: home do plano de Joinville (WEB-33, 25/11/2026)
A F1 de `docs/planos/stratai-buscas-joinville.md`, a primeira mudança de texto da home depois do WEB-32:

| Mudança | Antes | Depois |
|---|---|---|
| Título | StratAI · Agentes de IA para a sua empresa | Agentes de IA no WhatsApp em Joinville \| StratAI (aprovado no plano de 04/11/2026) |
| Descrição | A StratAI mapeia onde a sua empresa perde tempo… | Agência de IA em Joinville/SC. A StratAI mapeia onde a sua empresa perde tempo… (155 caracteres) |
| Kicker do topo | StratAI · implementação de IA para pequenas e médias empresas | StratAI · agência de IA em Joinville/SC para pequenas e médias empresas (texto do plano) |
| Cartão de compartilhamento (`og:title` e `og:description`) | o da página no ar | **igual**: o plano só mexe no título da busca |
| JSON-LD | só o `ProfessionalService` da StratAI (kit, com endereço e telefone de Joinville) | + `FAQPage` com as 11 perguntas visíveis (as 5 conversas e as 6 de "Outras perguntas"), lidas do próprio `home.corpo.html` no build por `src/lib/faq-home.js`: o texto é sempre o da página |
| Logos dos casos | `alt=""` nas 9 imagens, a faixa do topo com `aria-hidden` | a faixa do topo (1ª ocorrência) mostra o nome no `alt`; as 6 cópias, ao lado do nome escrito, seguem decorativas com `aria-hidden` |

Os links de WhatsApp com `wa.me` no HTML já vinham do WEB-32. Os cards de módulo e de caso ganham link quando as
páginas novas existirem (WEB-34 em diante). Regra do plano: se os leads da home caírem mais de 20% em 2 semanas, volta
o título antigo antes de investigar.

## Redirecionamentos (`public/_redirects`)
`/politica-de-privacidade` e `/politica-de-privacidade.html` → `/politica-de-privacidade/`; `/agencia` e `/agencia/*`
→ `https://agencia.stratai.com.br/` (o mesmo 301 que o servidor do `strat-lps` fazia desde 31/10/2026);
`/raio-x/v1/*` → `/raio-x/`. Todos 301, com a query junto.

## Desempenho
A home passa no orçamento do Lighthouse sem exceção desde o WEB-87 (17/11/2026). Medição no build servido com gzip,
Lighthouse em celular, 3 vezes cada, tracking bloqueado como na CI:

| | Performance | FCP | LCP |
|---|---|---|---|
| Antes (fonte do Google, logo PNG de 70 KB) | 87 a 90 | 2,8 a 2,9 s | 3,0 s |
| Depois | 99 | 1,2 s | 2,2 s |

O que mudou, sem mudar texto, layout nem tracking:
- **Fontes do próprio app.** A folha do Google Fonts saiu (bloqueava a renderização por ~0,9 s); a Space Grotesk e a
  JetBrains Mono vêm de `public/fontes/` (os mesmos arquivos variáveis, subset latin, que o Google servia: um arquivo
  cobre todos os pesos), com `font-display: swap` e preload só da Space Grotesk. O mesmo vale para o `/raio-x/` e a
  política: nenhuma página do app chama mais o Google Fonts (no mesmo build, `/raio-x/` 100 e LCP 1,7 s; política 100
  e LCP 1,5 s).
- **Logo do Só Churrasco em WebP** (`so-churrasco-logo.webp`, 15 KB no lugar do PNG de 70 KB, mesma aparência): ele
  está no topo da página e entrava na conta do LCP.
- **Miniatura do botão "próximo caso" com `loading="lazy"`**: fica longe do topo e baixava junto com a página.

O CSS da home (117 KB, ~20 KB com gzip) continua inteiro no `<head>`: em arquivo à parte, o LCP piorou de 2,2 s para
2,4 s (mais uma ida e volta antes da primeira pintura). Separar CSS crítico do resto não foi preciso para caber no
orçamento e arriscaria o visual das animações do topo.

## /parcerias/ (WEB-74)
Programa de parceria e indicação, da prévia aprovada pelo Helbert em 12/11/2026 (texto, ordem e visual), só com a
indicação: o bloco de ferramentas parceiras com desconto entra quando a lista chegar.
- **Textos:** `src/data/parcerias.json` (perfis, oferta, passos, dúvidas e as opções do cadastro). Sem condição
  comercial (percentual, valor, dia de pagamento, prazo de resposta) no texto nem no repositório: elas ficam para a
  conversa de alinhamento. O teste `test/parcerias.test.js` barra percentual, `R$`, dia ou prazo no texto da página.
- **Cadastro:** 3 etapas; no envio, `mtc.lead({ nome, telefone, email, campos })` do MetricaaS (`agencia-strat`),
  montado por `src/lib/parcerias-lead.js`. `campos.tipo_cadastro = parceria` separa o parceiro do lead de cliente;
  as respostas vão como `instagram_ou_linkedin`, `atuacao`, `contatos`, `segmentos`, `tem_indicacao`, `experiencia`,
  `inicio` e `detalhes`. Chave que o workspace não tem é descartada sem erro: as chaves precisam existir em
  Configurações → Campos personalizados do `agencia-strat` (criadas em 13/11/2026, rótulo "Parceria: …"). A tela de
  recebido só aparece quando o MetricaaS confirma.
- **Sem Lead na Meta:** o envio leva `meta: false` (MetricaaS, PR 697, tag v11): o parceiro não vira Lead no pixel
  nem na CAPI. O fluxo "Parceiro do site vai para o funil Parceiros" do `agencia-strat` (lead criado, origem
  formulário, `tipo_cadastro = parceria`) move o lead para o funil Parceiros, cujas etapas não têm evento.
- **Consentimento:** `soft`, com o produto próprio `stratai-parcerias` no Rastro (WEB-72: página nova de lead).
- O rodapé ganhou o link da política de privacidade (o cadastro coleta dados pessoais; checklist A5).
