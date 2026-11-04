# Tracking

Toda página mede pelo componente `<Tracking perfil="...">` do kit, que lê os ids do `catalogo/sites.json`.
Ninguém cola pixel, gtag ou GTM à mão.

## Os três perfis (decisão D7)

| Perfil | Para quê | O componente injeta | Onde |
|---|---|---|---|
| `venda` | página que vende pela Hotmart | snippet do Rastro `https://tracking.stratacademy.com.br/sa?product=<slug>` (com `defer`), launcher da Hotmart no `<head>`; o Rastro reescreve o checkout com `xcod` e UTMs | LPs da Academy |
| `lead` | página que gera contato (formulário, WhatsApp, agenda) | MetricaaS `m.js` do workspace da marca; Rastro também quando a marca tem produto no Rastro | Agência, StratAI, MetricaaS |
| `conteudo` | blog e institucional | o mesmo do site da marca, sem evento de lead | todos os blogs |

## Ids por marca (conferir no catálogo; aqui é referência)

| Marca | Meta pixel | GA4 | Tag do Google | Rastro | MetricaaS |
|---|---|---|---|---|---|
| Agência Strat | 1815630929780241 | G-6S4YX29WBH | GT-TX2632G5 | não usa | `strat-marketing` |
| StratAI | 1823024821883911 | G-3VJ019EH58 | GT-M6J6NZQW | `stratai`, `raio-x-ia` | `agencia-strat` (workspace "Strat Ai - Implementação"; o nome é antigo) |
| Strat Academy | 860500981882285 (quaia: 2790080268035647) | G-R84BNVV2HX | AW-17263684860 | um slug por LP | — |
| MetricaaS | 461294776843663 | G-7L9LL2FN6C | — | `metricaas` | — |

No Rastro, pixel, GA4 e Google Ads vêm do produto (tabela `web_products`), não do HTML. Por isso o componente só
precisa do slug.

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
   formulário com o mesmo `event_id` no navegador e na CAPI; evento no MetricaaS.
4. Com e sem aceitar cookies (o consentimento do Rastro pode ser `off`, `soft` ou `strict` por produto).

Referência completa do Rastro: `strat-web/rastro` (hoje `Strat-Ai-Horus-OS/rastro-stratacademy`), `docs/TRACKING-ARCHITECTURE.md`.
