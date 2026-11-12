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
- **Com Rastro**, quem segura o pixel é o `consentMode` do produto, não a página. O catálogo tem de dizer o mesmo
  que o produto: `off` = `off`, `soft` = `soft`, `banner` = `strict`. Diferente disso o build quebra, e a checagem
  `tracking` da CI barra: ela lê o `/sa?product=<slug>` de cada URL e compara consentimento, pixel, GA4 e Google Ads
  com a linha do catálogo.
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
   `consentMode` do `/sa?product=<slug>` tem de ser o mesmo do catálogo (`banner` = `strict`).

Referência completa do Rastro: `strat-web/rastro` (hoje `Strat-Ai-Horus-OS/rastro-stratacademy`), `docs/TRACKING-ARCHITECTURE.md`.
