# Tracking

Toda página mede pelo componente `<Tracking perfil="...">` do kit, que lê os ids do `catalogo/sites.json`.
Ninguém cola pixel, gtag ou GTM à mão.

## Os três perfis (decisão D7)

| Perfil | Para quê | O componente injeta | Onde |
|---|---|---|---|
| `venda` | página que vende pela Hotmart | snippet do Rastro `https://tracking.stratacademy.com.br/sa?product=<slug>` (com `defer`), launcher da Hotmart no `<head>`; o Rastro reescreve o checkout com `xcod` e UTMs | LPs da Academy |
| `lead` | página que gera contato (formulário, WhatsApp, agenda) | MetricaaS `m.js` do workspace da marca; Rastro também quando a marca tem produto no Rastro | Agência, StratAI, MetricaaS |
| `conteudo` | blog e institucional | o mesmo do site da marca, sem evento de lead | todos os blogs |

**Regra dura do perfil `lead`:** o `m.js` do MetricaaS carrega **na hora** (`defer` ou `async` no `<head>`), nunca
atrasado para depois do `load`, do `requestIdleCallback` ou do 1º toque. Ele põe o código no texto do WhatsApp no
instante do clique; atrasado, quem toca no botão do topo de cara abre o WhatsApp sem o código e o lead vira orgânico
(caso FTV, 2 de 7 leads do Google Ads perdidos entre 24/10 e 06/11/2026). Se o PageSpeed pedir atrasar tag, atrase só
o Rastro. Padrão do carregador: `Strat-Ai-Operacional/modelo-lp`, `docs/tracking.md` ("Regra dura").

## O componente `<Tracking>` (WEB-17)
A página só declara o perfil; o resto vem da linha do catálogo com a mesma URL canônica.

```astro
<Layout marca="stratai" perfil="lead" titulo="..." descricao="...">
```

O `Layout` põe o `<Tracking perfil>` no `<head>`. Sem `perfil`, a página sai sem tracking (placeholder, teste do kit).
A regra mora em `packages/kit/src/tracking.js` e tem teste (`pnpm --filter @strat/kit test`).

| A linha do catálogo tem | O `<head>` recebe |
|---|---|
| `metricaas_ws` | `m.js` com `data-ws`, `defer`, **antes** de tudo (regra dura do lead); a checagem `tracking` da CI barra o `m.js` sem `defer`, com `async`, com `type`, fora do `<head>` ou depois de outro script |
| `metricaas_ws` + `meta_pixel`, sem `rastro_slug` | o `m.js` também liga o pixel (`data-pixel`); com `consentimento: banner`, `data-pixel-consent="aguardar"` e o banner de cookies do kit; com `soft`, o `m.js` sem `data-pixel-consent` e o banner do kit em modo soft (WEB-84) |
| `rastro_slug` | `/sa?product=<slug>` com `defer`; pixel, GA4 e Google Ads vêm do produto no Rastro, então o `m.js` vai **sem** `data-pixel`. O produto tem de estar no `consentMode` do catálogo: `banner` = `strict`, `soft` = `soft`, `off` = `off` |
| perfil `venda` | também o launcher da Hotmart com `hot('account', <hotmart_conta>)` escrito no HTML. Ele carrega na abertura, então `venda` com `consentimento: banner` quebra o build (até o WEB-85) |
| `umami_website_id` | `/u/script.js` com `data-website-id`, pelo proxy `/u/` do próprio domínio (o proxy é do Strat Tracking) |
| `consentimento: sem-tracking` | nada |
| `consentimento: por-funil` | pelo kit, só o Umami do host, quando cadastrado (o servidor do strat-lps já injetava). O Rastro **não** passa pelo kit: o script da própria página lê o `?f=` no registro `FUNIS` e liga o produto do funil, com o consentimento dele; sem `?f=`, nenhum Rastro nem pixel. Hoje só a comunidade da Academy (T5), migrada assim no WEB-48, igual ao que está no ar. Levar o por-funil para o `<Tracking>` fica para o WEB-106 |

**Consentimento:** o campo `consentimento` de cada URL é a regra da página, e o componente obedece (regra do
WEB-72, decisão do Helbert de 11/11/2026). É o que a página deve fazer, não um retrato de como ela pede aceite hoje:
- `banner`: nada de pixel, GA4 nem Google Ads antes do aceite. Com Rastro, o produto no Rastro em `strict`.
- `soft`: mede desde a abertura, com aviso, e para quando a pessoa recusa. Com Rastro, o produto em `soft`.
- `off`: mede sem aviso. Só como exceção registrada em `docs/decisoes.md`. Com Rastro, o produto em `off`.
- `sem-tracking`: a página não carrega tracking.
- `por-funil`: a página escolhe o produto do Rastro pelo `?f=`, com o consentimento dele, pelo próprio script (não pelo kit); sem `?f=`, nenhum Rastro nem pixel. O Umami do host é independente e vem do kit.

Página nova nasce em `soft` no perfil `venda` ou `lead` e em `banner` no perfil `conteudo`. Mudar o padrão muda o
valor no catálogo, não o componente. Com Rastro, quem segura o pixel é o produto no Rastro, e a página não troca: por
isso o `consentMode` do produto tem de ser o par do catálogo (`banner` = `strict`), e a checagem `tracking` da CI
compara os dois (o que ela já confere hoje está na seção "Consentimento", abaixo). Os valores aceitos são os de `packages/checagens/src/catalogo.js`; valor fora da lista barra a
checagem `catalogo`. O texto é o mesmo da descrição do campo em `catalogo/sites.json`.

**Banner do kit** (só sem Rastro, com o pixel pelo `m.js`, em `banner` ou `soft`): o texto e a chave `strat_cookies`
são os da Agência (laudo de 31/10/2026). Valores: `sim` (Aceitar do banner), `nao` (Recusar, nos dois modos) e `ok`
(Ok do soft). O "Ok" do soft **não é aceite**: numa página em `banner` ele conta como sem escolha e o banner aparece de
novo; a recusa vale nos dois modos, e o `sim` também tira o aviso do soft (revisão do Helbert no #37, 18/11/2026).
Em `banner`, "Aceitar" chama `mtc.consentir()` e o pixel liga; "Recusar" não manda nada à Meta. O cadastro do lead e a
CAPI do MetricaaS não dependem do banner. O link da política vem de `privacidade` em `packages/kit/src/marcas.js`.
O aceite não tem prazo (WEB-80): o `m.js` não tem fila nem evento próprio e troca o `window.mtc` inteiro quando roda,
então, se ele ainda não rodou (rede lenta, celular), o aceite (o clique ou o `sim` guardado) espera o `load` do próprio
`<script>` do `m.js` e o `load` da página, sem timer, e chama o `consentir` uma vez só. Antes do aceite, nada chama o
`consentir`. O script mora em `packages/kit/src/banner-cookies.js` (ES5, lido como texto pelo `<Tracking>`) e o
teste roda o mesmo texto num DOM simulado com o `m.js` chegando depois de 8 s (`test/banner-cookies.test.js`).

**Soft sem Rastro** (WEB-84): o `m.js` vai com `data-pixel` e sem `data-pixel-consent`, então o pixel mede desde a
abertura, e o banner do kit mostra "Se preferir, recuse" com "Recusar" e "Ok". O MetricaaS não tem modo soft nem
função de revogar (o `m.js` só tem o `consentir`; lido em 17/11/2026), então o kit corta o pixel pelo próprio fbq que o
`mf.js` do MetricaaS cria, nas três fases do carregamento:

| Quando a pessoa recusa | O que o banner faz | Efeito |
|---|---|---|
| antes de o `m.js` rodar (inclui a recusa guardada, na próxima visita) | põe `data-pixel-consent="aguardar"` no `<script>` do `m.js` (o banner roda inline logo depois dele) | o `mf.js` chama `fbq('consent', 'revoke')` antes do `init` e do `PageView` |
| depois do `m.js` e antes do `mf.js` | `mtc._i.cons = "aguardar"` (o valor que o `mf.js` lê) | o mesmo |
| com o pixel já ligado | `fbq('consent', 'revoke')` | nenhum evento novo do pixel no navegador |

O próprio clique no "Recusar" também não vai: o pixel mede sozinho o clique em botão (evento automático
`SubscribedButtonClick`, ouvido no `document`), então o banner revoga num ouvinte de clique na fase de captura do
`window`, que roda antes dele. Na prévia do PR, antes disso, o clique no "Recusar" saía como `SubscribedButtonClick`; em
`127.0.0.1` o pixel não manda eventos automáticos, por isso o teste local não pegou.

"Ok" só guarda a escolha. O cadastro do lead e a CAPI do MetricaaS seguem como em `banner`. A checagem `tracking`
aceita o `fbq` desse script porque compara o texto inteiro com o que o kit gera para a linha (`bannerDoKit`); qualquer
outro `fbq` inline continua barrando como pixel colado à mão, e a página sem o banner que o catálogo pede também barra.
Conferido em 17/11/2026 na `agenciastrat/kit/soft/` servida do `dist`: na abertura `fbevents.js` e o `PageView`
(`/tr`); depois do "Recusar", um evento disparado à mão não sai; recarregando, sem aviso, com `aguardar` e nenhum `/tr`.

**Rastro com `banner`** (WEB-81): o produto no Rastro tem de estar em `strict`, e o banner do kit **não** entra. O
Rastro em `strict` (e em `soft`) já mostra o aviso dele no rodapé ("recusar" e "aceitar") e guarda a escolha no
`localStorage`, na chave `strat_consent` (`granted` ou `denied`). Em `strict`, pixel, GA4, Google Ads, PostHog e o
launcher da Hotmart só ligam depois do "aceitar"; em `soft`, ligam na abertura e param no "recusar"; em `off`, não há
aviso. Lido no `/sa?product=site` em 12/11/2026. Os dois avisos juntos pediriam o aceite duas vezes, com chaves
diferentes (`strat_cookies` e `strat_consent`), e o "Aceitar" do kit chama o `mtc.consentir()`, que nessa página não
segura nada (o `m.js` vai sem `data-pixel`). Por isso o kit só desenha o banner dele sem Rastro.

**Venda com `banner`** (revisão do WEB-81, até o WEB-85): não monta. O launcher da Hotmart do kit vai escrito no HTML
(o "verificar instalação" da Hotmart lê o HTML estático) e carrega na abertura. O Rastro em `strict` só carrega a
Hotmart dele depois do "aceitar" e pula o próprio launcher quando já existe `window.hot`, então nada seguraria o da
página: o checkout carregaria antes do aceite. O kit quebra o build nessa combinação, e a checagem `tracking` barra
também qualquer script da Hotmart (`hotmart.com`: launcher, checkout, widget) numa página com `banner`, venha de onde
vier. Hoje nenhuma linha do catálogo está em `venda` + `banner`; as LPs de venda são exceção em `off`. O WEB-85 decide
como segurar o launcher até o aceite.

**O build quebra quando:** a URL não tem linha no catálogo; o perfil da página difere do catálogo; `venda` sem
`rastro_slug` ou sem `hotmart_conta`; `lead` sem `metricaas_ws` e sem `rastro_slug`; pixel sem Rastro e sem MetricaaS;
GA4 ou tag do Google sem Rastro (ainda sem regra: WEB-73); Rastro com um `consentimento` que não tem par no Rastro
(só `banner`, `soft` e `off` têm); `venda` com `banner` (até o WEB-85). O build não lê a rede: quem confere se o
produto está mesmo no `consentMode` do catálogo é a checagem `tracking` da CI, que lê o `/sa?product=<slug>` e barra
`banner` com o produto fora de `strict`, `soft` fora de `soft`, `off` fora de `off` e o `/sa` que não manda
`consentMode` (sem o campo não dá para conferir o par; não vale como verde) (`packages/checagens/src/tracking.js`,
com teste).

**Conteúdo:** carrega o mesmo da marca e não tem formulário de lead (`data-strat-leadform`) na página.

**Páginas de teste** (noindex, só no preview; saem antes de o domínio virar), cada uma com a lista do que deve
disparar: `agenciastrat/kit/lead/` (lead sem Rastro, banner), `agenciastrat/kit/soft/` (lead sem Rastro, soft;
WEB-84), `stratacademy/kit/venda/` (produto `mentoria`,
launcher da Hotmart) e `stratacademy/kit/conteudo/` (Rastro com `banner`: produto `site` em `strict`, o aviso é o do
Rastro; WEB-81). A página do portão F2, `agenciastrat/kit/portao/` (conteúdo sem Rastro, banner; WEB-22), junta o kit
inteiro, e a linha dela no catálogo leva `"teste": true`, como toda página de teste nova. As da StratAI (`/kit/lead/`,
lead com Rastro e MetricaaS, e `/kit/conteudo/`) saíram antes de o domínio virar (WEB-32): o lead com Rastro e
MetricaaS se confere na home e no `/raio-x/` da StratAI.

## Ids por marca (conferir no catálogo; aqui é referência)

| Marca | Meta pixel | GA4 | Tag do Google | Rastro | MetricaaS |
|---|---|---|---|---|---|
| Agência Strat | 1815630929780241 | não usa (o G-6S4YX29WBH e o GT-TX2632G5 antigos não carregam: T3, WEB-11) | não usa | não usa | `strat-marketing` |
| StratAI | 1823024821883911 | G-3VJ019EH58 | GT-M6J6NZQW | `stratai`, `raio-x-ia` | `agencia-strat` (workspace "Strat Ai - Implementação"; o nome é antigo) |
| Strat Academy | 860500981882285 (quaia: 2790080268035647) | G-R84BNVV2HX (a LP claude. carrega a tag G-3RYFFP7EF5 do produto `quaia`, que entrega nessa mesma propriedade) | AW-17263684860 | um slug por LP; o site usa `site` | — |
| MetricaaS | 461294776843663 | G-7L9LL2FN6C | — | `metricaas` | — |

No Rastro, pixel, GA4 e Google Ads vêm do produto (tabela `web_products`), não do HTML. Por isso o componente só
precisa do slug.
Como o `/sa` é um só por produto, toda linha do catálogo com o mesmo `rastro_slug` leva o mesmo pixel, GA4, tag do
Google e consentimento; a checagem `catalogo` barra a diferença sem precisar de rede (WEB-83). O site da Academy
(produto `site`, em `strict`) recebe GA4 G-R84BNVV2HX e Ads AW-17263684860 depois do aceite: a linha `academy` já
pede os dois (WEB-46), e a checagem `tracking` passou com a home usando o `<Tracking>` contra o `/sa` de 17/11 (WEB-83).

## Umami (Strat Tracking, TRACK-8 e TRACK-9, 12/11/2026)

Contador de navegação do painel https://track.strat.tec.br: visita, página, origem, UTM, aparelho e cidade, sem cookie
e antes do aceite. Não manda nada à Meta nem ao Google (isso segue no Rastro e no MetricaaS).

| Peça | Onde |
|---|---|
| Website no Umami, um por host | `umami_website_id` de cada URL do catálogo (o mesmo id para todas as URLs do host) |
| Tag | o `<Tracking>` põe `<script defer src="/u/script.js" data-website-id>` quando o id existe (nada com `sem-tracking`; `por-funil` conserva o Umami do host) |
| Proxy `/u/` | `functions/u/[[caminho]].js` na raiz do repositório (Pages Function dos quatro projetos): `/u/script.js` é o script do Umami com cache de 1 h + os eventos; `/u/api/send` repassa ao coletor `analytics.strat.tec.br` com o IP do visitante em `payload.ip` |
| Eventos | `cta` (`data-strat-cta`, com o id), `whatsapp` (link `wa.me`), `checkout` (link `pay.hotmart.com`), `form_inicio` e `cadastro` (formulário com `data-strat-leadform`, e-mail ou telefone): a mesma regra do `umami-eventos.js` do `strat-lps` |

As LPs que ainda estão no `strat-lps` já medem com o mesmo website e os mesmos eventos (o `server.js` de lá põe a tag;
`umami.json`). Na migração, nada muda no Umami: o id do host é o mesmo. Domínio novo: criar o website no Umami (pede o
Strat Tracking) e pôr o id nas linhas do host.

Teste: abrir a página com `?utm_source=teste&utm_medium=verificacao` num Chrome normal e ver o `POST /u/api/send` com
200 e corpo `{"cache":…}`. Corpo `{"beep":"boop"}` é o filtro de robôs do Umami (navegador automatizado, como o
HeadlessChrome): a visita não conta.

## Consentimento (WEB-72, decisão do Helbert de 11/11)
O campo `consentimento` de cada linha do `catalogo/sites.json` decide, página a página, o que mede antes do aceite.
O kit garante que o catálogo bate com o Rastro.

| Perfil da página nova | Nasce em |
|---|---|
| `venda` ou `lead` | `soft` |
| `conteudo` | `banner` |

- **`off` só como exceção** registrada em `docs/decisoes.md`, com data e quem decidiu. As exceções herdadas (a
  migração não muda tracking) estão lá, na entrada de 11/11: /advogados da Agência, StratAI (home, `/raio-x/`,
  `/bio/`), metricaas.com.br e as LPs de venda da Academy (claude., skills., mentoria., bootcamp.).
- **Com Rastro**, quem segura o pixel é o `consentMode` do produto, não a página. A regra: o catálogo diz o mesmo
  que o produto, `off` = `off`, `soft` = `soft`, `banner` = `strict`.
- **O que o código faz (WEB-81):** a checagem `tracking` da CI lê o `/sa?product=<slug>` de cada página dos apps e
  barra quando consentimento, pixel, GA4 ou Google Ads diferem da linha do catálogo. O consentimento segue o par
  (`banner` = `strict`, `soft` = `soft`, `off` = `off`), e o `/sa` sem `consentMode` barra. O kit monta Rastro com
  `banner` sem o banner de cookies dele (o aviso é o do Rastro), menos no perfil `venda`, que quebra o build até o
  WEB-85 (o launcher da Hotmart carregaria antes do aceite).
- **Sem Rastro** (hoje só a Agência), `banner` e `soft` são o banner de cookies do kit (modo `banner` ou `soft`,
  WEB-84), e o pixel vem pelo `m.js` do MetricaaS. O clique no WhatsApp não vira `Contact` no navegador (o `Contact`
  no clique é do Rastro; ver "Antes de publicar").
- Outros valores do campo: `por-funil` (a própria página liga o Rastro do funil pelo `?f=`, fora do kit; hoje só a comunidade da Academy)
  e `sem-tracking`.

O que cada modo faz (conferido na auditoria de 2026-11, `docs/auditoria/2026-11/`):

| Modo | Exemplo hoje | Antes do aceite | Depois do aceite |
|---|---|---|---|
| `off` | StratAI, MetricaaS, LPs de venda da Academy | sem aviso: pixel, GA4, Google Ads e o Rastro (`/tracker`) disparam na abertura | igual (não há escolha) |
| `soft` | vibecode | pixel, GA4, Google Ads e Rastro disparam na abertura, com o aviso "recusar / ok" | quem recusa deixa de ser medido pelas tags do produto; quem aceita segue medido |
| `soft` sem Rastro | `agenciastrat/kit/soft/` (teste) | o pixel dispara na abertura (`m.js` sem `data-pixel-consent`), com o aviso do kit "Recusar / Ok" | "Recusar" corta o pixel do navegador na hora e nas próximas visitas (`strat_cookies=nao`); "Ok" segue medido e grava `strat_cookies=ok`, que não vale como "Aceitar" nas páginas em `banner` (WEB-84) |
| `banner` com Rastro (`strict` no produto) | home da Academy (produto `site`) | o pixel não dispara | o pixel liga; o aceite fica no `localStorage`, chave `strat_consent` (a mesma do horus, conferido no WEB-46), então quem já aceitou lá continua aceito. GA4 e Google Ads seguem o produto no Rastro: conferir no teste com e sem aceite |
| `banner` sem Rastro | home e bio da Agência | o pixel não dispara (`data-pixel-consent="aguardar"`) | "Aceitar" chama `mtc.consentir()` e o pixel do navegador liga; "Recusar" deixa o pixel desligado. GA4: a Agência não usa (WEB-73) |

MetricaaS em qualquer modo: na página que tem `metricaas_ws`, o `m.js` carrega na hora (regra dura do lead) e o
cadastro do lead no MetricaaS não depende do aceite.

## Evento da página no pixel do kit (WEB-24)
Página sem Rastro que liga o pixel pelo `m.js` (`data-pixel`, hoje só a Agência) pode contar um passo dela com
`fbq('track', ...)` ou `fbq('trackCustom', ...)` num `<script>` da própria página. A lista é fechada, a dos dois
eventos que o /advogados original usa: `ViewContent` (capa) e `FirstInteraction` (primeira resposta). Nunca `Lead` nem
`LeadQualificado`: esses saem da tag do MetricaaS com o mesmo `event_id` da CAPI, e repetir daria evento em dobro.

A checagem `tracking` garante isso no código (`EVENTOS_DA_PAGINA` e `EVENTOS_DA_TAG` em
`packages/checagens/src/tracking.js`, com teste):
- evento escrito no `fbq` fora da lista (`Lead`, `LeadQualificado` ou qualquer outro) barra;
- evento por variável (`fbq('track', metaEvent)`, como o `track()` do /advogados) só passa se o script não tiver a
  string `'Lead'` nem `'LeadQualificado'` em lugar nenhum;
- `fbq('init')`, o `fbevents.js` e `fbq` em página com Rastro continuam barrando.

## Marcação na página
- Todo botão: `data-strat-cta="<seção>-<destino>"` (ex.: `hero-diagnostico`, `rodape-whatsapp`). Vira `CTAClick`.
- Todo formulário de lead: `data-strat-leadform`. Vira `Lead`, com CAPI e o webhook do funil.
- Toda seção: `data-mtc-section="<id>"` (MetricaaS).
- WhatsApp sempre como `<a href="https://wa.me/55<ddd><número>?text=...">` escrito no HTML (o MetricaaS não atribui
  `window.open`, e robô não lê link montado por JavaScript). UTM em link do `wa.me` não serve: o WhatsApp ignora.

## Antes de publicar uma página nova
1. Slug cadastrado no Rastro (`/sa?product=<slug>` responde `known: true`). Slug desconhecido cai no pixel da Strat sem erro.
2. Domínio na lista de "Domínios autorizados" do MetricaaS e na lista de permissão do pixel (Gerenciador de Eventos).
3. Teste com `?utm_source=teste&utm_medium=verificacao`: `PageView`; `Contact` no clique do WhatsApp **só em página
   com Rastro** (quem dispara é o detector de WhatsApp do Rastro); `Lead` no formulário com o mesmo `event_id` no
   navegador e na CAPI; evento no MetricaaS. Sem Rastro (hoje a Agência, pixel pelo `m.js`), o clique no WhatsApp não
   manda `Contact` ao pixel do navegador: o `m.js` só envia o `wa_click` ao `/e` do MetricaaS (código no texto e
   atribuição), e o `mf.js` só dispara `PageView` e os eventos que o servidor devolve no formulário (`/f`) e no
   agendamento (`/ag`). Conferido no código público do `m.js` e do `mf.js` em 18/11/2026 (WEB-86). Se o servidor do
   MetricaaS manda `Contact` pela CAPI a partir do `wa_click` ainda está em aberto no WEB-86 (dataset da Agência). No celular emulado (4G lento),
   tocar no WhatsApp do topo logo que ele aparece: o código do MetricaaS tem de estar no texto.
4. Com e sem aceitar cookies, conferindo o modo da linha do catálogo (seção "Consentimento"). Com Rastro, o
   `consentMode` do `/sa?product=<slug>` tem de ser o par do catálogo (`banner` = `strict`, `soft` = `soft`,
   `off` = `off`); `venda` com `banner` ainda não monta (WEB-85).

Referência completa do Rastro: `strat-web/rastro` (hoje `Strat-Ai-Horus-OS/rastro-stratacademy`), `docs/TRACKING-ARCHITECTURE.md`.

## Rastro depois do primeiro quadro nas páginas de venda (WEB-104)

No perfil `venda`, o kit escreve um carregador inline com `data-strat-rastro-apos-pintura` em vez de iniciar o `/sa` durante o parse. Depois de DOMContentLoaded, ele aguarda o FCP observado por PerformanceObserver antes de criar o script externo. Sem Paint Timing, usa dois requestAnimationFrame como fallback. Só dois callbacks não garantiam pintura: no teste com fontes carregando, o /sa iniciava aos 191 ms e o FCP vinha aos 252 ms. Isso dá ao navegador uma oportunidade de pintar o primeiro quadro sem a cadeia do Rastro (pixel, GA4 e PostHog), que segurava o desenho do hero da LP Claude.

O produto, consentimento, ids e eventos continuam sendo os do Rastro. O MetricaaS permanece no head, com defer e antes de todo script; o launcher da Hotmart e o Umami mantêm seu comportamento. Os perfis lead e conteudo continuam carregando o Rastro diretamente.

Uma aba aberta oculta, ou um navegador sem requestAnimationFrame, carrega depois de DOMContentLoaded sem esperar quadros; isso preserva a visita em segundo plano. Uma saída antes do carregamento pode deixar de contar PageView, limite explícito a ser aceito na revisão do Helbert. Não há atraso por interação nem temporizador arbitrário.

A checagem tracking valida a URL do produto, o código inteiro do carregador e o tipo executável do script; atributo sem código ou script inerte barra o PR. Testes cobrem documento pronto/em parse, dois quadros, aba oculta, fallback e instalação única.

Na validação da WEB-48, FCP de texto ainda podia anteceder a imagem do hero. O carregador também aguarda `document.fonts.ready` e decodifica as imagens com preload de alta prioridade (respeitando media) e os `img[fetchpriority=high]`. Depois dá dois quadros para pintar esses recursos. Erros de imagem/fontes não interrompem o carregamento; abas ocultas não esperam esses recursos. O risco de saída/compra antes do Rastro continua explícito e precisa do aceite do Helbert.

## Cobertura da checagem de tracking (WEB-92)

A checagem ignora scripts dentro de comentários HTML, `noscript` e `template` (inclusive aninhado),
preservando os índices para conferir a ordem no head. Esses scripts não satisfazem o catálogo; `nomodule`
também barra nos scripts esperados. Um `</head>` em comentário não encerra o head para a checagem.

Qualquer `m.js` de um host `*.metricaas.com.br`, inclusive em subpasta ou com query, conta como tracking:
um segundo carregador barra. Pixels em `src` de `img` e `iframe` fora do `noscript`, `window['fbq'](...)`
e `window.gtag?.(...)` também barram. A leitura dos arquivos `.js` do build mantém a abordagem existente.

O filtro `--app` aceita `apps/stratai/`, `./apps/stratai` e separadores `\`; sem valor, sai com código 2 e orientação.
Os testes de rede cobrem nova tentativa após 408, 429, timeout e resposta 200 sem `known`, com contagem das
chamadas. Essas regras de tentativa já existiam; a WEB-92 acrescenta cobertura.
