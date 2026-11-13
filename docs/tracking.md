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
| `metricaas_ws` + `meta_pixel`, sem `rastro_slug` | o `m.js` também liga o pixel (`data-pixel`); com `consentimento: banner`, `data-pixel-consent="aguardar"` e o banner de cookies do kit |
| `rastro_slug` | `/sa?product=<slug>` com `defer`; pixel, GA4 e Google Ads vêm do produto no Rastro, então o `m.js` vai **sem** `data-pixel`. O produto tem de estar no `consentMode` do catálogo: `banner` = `strict`, `soft` = `soft`, `off` = `off` |
| perfil `venda` | também o launcher da Hotmart com `hot('account', <hotmart_conta>)` escrito no HTML. Ele carrega na abertura, então `venda` com `consentimento: banner` quebra o build (até o WEB-85) |
| `umami_website_id` | `/u/script.js` com `data-website-id`, pelo proxy `/u/` do próprio domínio (o proxy é do Strat Tracking) |
| `consentimento: sem-tracking` | nada |
| `consentimento: por-funil` | nada pelo kit: a própria página liga o Rastro do funil pelo `?f=` (registro `FUNIS`, com o consentimento do produto); sem `?f=`, nada. Hoje só a comunidade da Academy (T5); entra no kit na migração (WEB-48) |

**Consentimento:** o campo `consentimento` de cada URL é a regra da página, e o componente obedece (regra do
WEB-72, decisão do Helbert de 11/11/2026). É o que a página deve fazer, não um retrato de como ela pede aceite hoje:
- `banner`: nada de pixel, GA4 nem Google Ads antes do aceite. Com Rastro, o produto no Rastro em `strict`.
- `soft`: mede desde a abertura, com aviso, e para quando a pessoa recusa. Com Rastro, o produto em `soft`.
- `off`: mede sem aviso. Só como exceção registrada em `docs/decisoes.md`. Com Rastro, o produto em `off`.
- `sem-tracking`: a página não carrega tracking.
- `por-funil`: a página escolhe o produto do Rastro pelo `?f=`, com o consentimento dele; sem `?f=`, nada.

Página nova nasce em `soft` no perfil `venda` ou `lead` e em `banner` no perfil `conteudo`. Mudar o padrão muda o
valor no catálogo, não o componente. Com Rastro, quem segura o pixel é o produto no Rastro, e a página não troca: por
isso o `consentMode` do produto tem de ser o par do catálogo (`banner` = `strict`), e a checagem `tracking` da CI
compara os dois (o que ela já confere hoje está na seção "Consentimento", abaixo). Os valores aceitos são os de `packages/checagens/src/catalogo.js`; valor fora da lista barra a
checagem `catalogo`. O texto é o mesmo da descrição do campo em `catalogo/sites.json`.

**Banner do kit** (só sem Rastro e com `banner`): o texto e a chave `strat_cookies` são os da Agência (laudo de
31/10/2026). "Aceitar" chama `mtc.consentir()` e o pixel liga; "Recusar" não manda nada à Meta. O cadastro do lead e a
CAPI do MetricaaS não dependem do banner. O link da política vem de `privacidade` em `packages/kit/src/marcas.js`.

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
disparar: `agenciastrat/kit/lead/` (lead sem Rastro, banner), `stratai/kit/lead/` (lead com Rastro e MetricaaS),
`stratai/kit/conteudo/`, `stratacademy/kit/venda/` (produto `mentoria`, launcher da Hotmart) e
`stratacademy/kit/conteudo/` (Rastro com `banner`: produto `site` em `strict`, o aviso é o do Rastro; WEB-81). A página do
portão F2, `agenciastrat/kit/portao/` (conteúdo sem Rastro, banner; WEB-22), junta o kit inteiro, e a linha dela no
catálogo leva `"teste": true`, como toda página de teste nova.

## Ids por marca (conferir no catálogo; aqui é referência)

| Marca | Meta pixel | GA4 | Tag do Google | Rastro | MetricaaS |
|---|---|---|---|---|---|
| Agência Strat | 1815630929780241 | não usa (o G-6S4YX29WBH e o GT-TX2632G5 antigos não carregam: T3, WEB-11) | não usa | não usa | `strat-marketing` |
| StratAI | 1823024821883911 | G-3VJ019EH58 | GT-M6J6NZQW | `stratai`, `raio-x-ia` | `agencia-strat` (workspace "Strat Ai - Implementação"; o nome é antigo) |
| Strat Academy | 860500981882285 (quaia: 2790080268035647) | G-R84BNVV2HX (a LP claude. carrega a tag G-3RYFFP7EF5 do produto `quaia`, que entrega nessa mesma propriedade) | AW-17263684860 | um slug por LP; o site usa `site` | — |
| MetricaaS | 461294776843663 | G-7L9LL2FN6C | — | `metricaas` | — |

No Rastro, pixel, GA4 e Google Ads vêm do produto (tabela `web_products`), não do HTML. Por isso o componente só
precisa do slug.

## Umami (Strat Tracking, TRACK-8 e TRACK-9, 12/11/2026)

Contador de navegação do painel https://track.strat.tec.br: visita, página, origem, UTM, aparelho e cidade, sem cookie
e antes do aceite. Não manda nada à Meta nem ao Google (isso segue no Rastro e no MetricaaS).

| Peça | Onde |
|---|---|
| Website no Umami, um por host | `umami_website_id` de cada URL do catálogo (o mesmo id para todas as URLs do host) |
| Tag | o `<Tracking>` põe `<script defer src="/u/script.js" data-website-id>` quando o id existe (nada com `sem-tracking` ou `por-funil`) |
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
- **Sem Rastro** (hoje só a Agência), `banner` é o banner de cookies do kit, e o pixel vem pelo `m.js` do MetricaaS.
- Outros valores do campo: `por-funil` (a página liga o Rastro do funil pelo `?f=`, hoje só a comunidade da Academy)
  e `sem-tracking`.

O que cada modo faz (conferido na auditoria de 2026-11, `docs/auditoria/2026-11/`):

| Modo | Exemplo hoje | Antes do aceite | Depois do aceite |
|---|---|---|---|
| `off` | StratAI, MetricaaS, LPs de venda da Academy | sem aviso: pixel, GA4, Google Ads e o Rastro (`/tracker`) disparam na abertura | igual (não há escolha) |
| `soft` | vibecode | pixel, GA4, Google Ads e Rastro disparam na abertura, com o aviso "recusar / ok" | quem recusa deixa de ser medido pelas tags do produto; quem aceita segue medido |
| `banner` com Rastro (`strict` no produto) | home da Academy (produto `site`) | o pixel não dispara | o pixel liga; o aceite fica no cookie `strat_consent` (o mesmo do horus), então quem já aceitou lá continua aceito. GA4 e Google Ads seguem o produto no Rastro: conferir no teste com e sem aceite |
| `banner` sem Rastro | home e bio da Agência | o pixel não dispara (`data-pixel-consent="aguardar"`) | "Aceitar" chama `mtc.consentir()` e o pixel do navegador liga; "Recusar" deixa o pixel desligado. GA4: a Agência não usa (WEB-73) |

MetricaaS em qualquer modo: na página que tem `metricaas_ws`, o `m.js` carrega na hora (regra dura do lead) e o
cadastro do lead no MetricaaS não depende do aceite.

## Marcação na página
- Todo botão: `data-strat-cta="<seção>-<destino>"` (ex.: `hero-diagnostico`, `rodape-whatsapp`). Vira `CTAClick`.
- Todo formulário de lead: `data-strat-leadform`. Vira `Lead`, com CAPI e o webhook do funil.
- Toda seção: `data-mtc-section="<id>"` (MetricaaS).
- WhatsApp sempre como `<a href="https://wa.me/55<ddd><número>?text=...">` escrito no HTML (o MetricaaS não atribui
  `window.open`, e robô não lê link montado por JavaScript). UTM em link do `wa.me` não serve: o WhatsApp ignora.

## Antes de publicar uma página nova
1. Slug cadastrado no Rastro (`/sa?product=<slug>` responde `known: true`). Slug desconhecido cai no pixel da Strat sem erro.
2. Domínio na lista de "Domínios autorizados" do MetricaaS e na lista de permissão do pixel (Gerenciador de Eventos).
3. Teste com `?utm_source=teste&utm_medium=verificacao`: `PageView`; `Contact` no clique do WhatsApp; `Lead` no
   formulário com o mesmo `event_id` no navegador e na CAPI; evento no MetricaaS. No celular emulado (4G lento),
   tocar no WhatsApp do topo logo que ele aparece: o código do MetricaaS tem de estar no texto.
4. Com e sem aceitar cookies, conferindo o modo da linha do catálogo (seção "Consentimento"). Com Rastro, o
   `consentMode` do `/sa?product=<slug>` tem de ser o par do catálogo (`banner` = `strict`, `soft` = `soft`,
   `off` = `off`); `venda` com `banner` ainda não monta (WEB-85).

Referência completa do Rastro: `strat-web/rastro` (hoje `Strat-Ai-Horus-OS/rastro-stratacademy`), `docs/TRACKING-ARCHITECTURE.md`.
