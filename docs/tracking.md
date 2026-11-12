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
| `metricaas_ws` | `m.js` com `data-ws`, `defer`, **antes** de tudo (regra dura do lead) |
| `metricaas_ws` + `meta_pixel`, sem `rastro_slug` | o `m.js` também liga o pixel (`data-pixel`); com `consentimento: banner`, `data-pixel-consent="aguardar"` e o banner de cookies do kit |
| `rastro_slug` | `/sa?product=<slug>` com `defer`; pixel, GA4 e Google Ads vêm do produto no Rastro, então o `m.js` vai **sem** `data-pixel`. O produto tem de estar no `consentMode` do catálogo: `banner` = `strict`, `soft` = `soft`, `off` = `off` |
| perfil `venda` | também o launcher da Hotmart com `hot('account', <hotmart_conta>)` escrito no HTML |
| `umami_website_id` | `/u/script.js` com `data-website-id`, pelo proxy `/u/` do próprio domínio (o proxy é do Strat Tracking) |
| `consentimento: sem-tracking` | nada |
| `consentimento: por-funil` | nada pelo kit: a própria página liga o Rastro do funil pelo `?f=` (registro `FUNIS`, com o consentimento do produto); sem `?f=`, nada. Hoje só a comunidade da Academy (T5); entra no kit na migração (WEB-48) |

**Consentimento:** o componente segue o campo `consentimento` de cada URL (o que a página faz hoje). O padrão por
perfil é decisão do Helbert no WEB-72; quando sair, muda o valor no catálogo, não o componente. Com Rastro, quem segura
o pixel é o produto no Rastro (`off`, `soft`, `strict`); a página não troca.

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

**O build quebra quando:** a URL não tem linha no catálogo; o perfil da página difere do catálogo; `venda` sem
`rastro_slug` ou sem `hotmart_conta`; `lead` sem `metricaas_ws` e sem `rastro_slug`; pixel sem Rastro e sem MetricaaS;
GA4 ou tag do Google sem Rastro (ainda sem regra: WEB-73); Rastro com um `consentimento` que não tem par no Rastro
(só `banner`, `soft` e `off` têm). O build não lê a rede: quem confere se o produto está mesmo no `consentMode` do
catálogo é a checagem `tracking` da CI, que lê o `/sa?product=<slug>` e barra `banner` com o produto fora de `strict`,
`soft` fora de `soft` e `off` fora de `off` (`packages/checagens/src/tracking.js`, com teste).

**Conteúdo:** carrega o mesmo da marca e não tem formulário de lead (`data-strat-leadform`) na página.

**Páginas de teste** (noindex, só no preview; saem antes de o domínio virar), cada uma com a lista do que deve
disparar: `agenciastrat/kit/lead/` (lead sem Rastro, banner), `stratai/kit/lead/` (lead com Rastro e MetricaaS),
`stratai/kit/conteudo/`, `stratacademy/kit/venda/` (produto `mentoria`, launcher da Hotmart) e
`stratacademy/kit/conteudo/` (Rastro com `banner`: produto `site` em `strict`, o aviso é o do Rastro; WEB-81).

## Ids por marca (conferir no catálogo; aqui é referência)

| Marca | Meta pixel | GA4 | Tag do Google | Rastro | MetricaaS |
|---|---|---|---|---|---|
| Agência Strat | 1815630929780241 | não usa (o G-6S4YX29WBH e o GT-TX2632G5 antigos não carregam: T3, WEB-11) | não usa | não usa | `strat-marketing` |
| StratAI | 1823024821883911 | G-3VJ019EH58 | GT-M6J6NZQW | `stratai`, `raio-x-ia` | `agencia-strat` (workspace "Strat Ai - Implementação"; o nome é antigo) |
| Strat Academy | 860500981882285 (quaia: 2790080268035647) | G-R84BNVV2HX (a LP claude. carrega a tag G-3RYFFP7EF5 do produto `quaia`, que entrega nessa mesma propriedade) | AW-17263684860 | um slug por LP; o site usa `site` | — |
| MetricaaS | 461294776843663 | G-7L9LL2FN6C | — | `metricaas` | — |

No Rastro, pixel, GA4 e Google Ads vêm do produto (tabela `web_products`), não do HTML. Por isso o componente só
precisa do slug.

Umami: ainda não existe em nenhuma URL (WEB-11). O catálogo já tem o campo `umami_website_id`; o kit carrega pelo
proxy `/u/` quando o id existir (WEB-17).

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
4. Com e sem aceitar cookies (o consentimento do Rastro pode ser `off`, `soft` ou `strict` por produto).

Referência completa do Rastro: `strat-web/rastro` (hoje `Strat-Ai-Horus-OS/rastro-stratacademy`), `docs/TRACKING-ARCHITECTURE.md`.
