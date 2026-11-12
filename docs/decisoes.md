# Decisões

Uma entrada por decisão, com data e quem decidiu. A mais nova em cima.

## 2026-11-12 · Regras de fluxo dos PRs (Helbert, sessão de 12/11 pela cabine; trazida pelo Jhonathan)
- **No máximo 6 PRs abertos** ao mesmo tempo no `strat-web/sites`. PR novo só abre quando ficarem menos de 6; até lá,
  o trabalho fica pronto numa branch, com o corpo do PR escrito.
- **Pilha de no máximo 2 níveis:** um PR pode depender de outro PR aberto, mas esse outro não pode depender de um terceiro.
- **Janelas de revisão do Helbert:** 9h e 17h (horário de Brasília).
- **D11 na prática:** PR que só mexe em `apps/<app>` (sem `packages/` e sem `catalogo/`), com as 6 checagens verdes e
  o `/lab:lp-revisar` aprovado, o dev mescla sem o Helbert. Todo o resto espera a revisão dele, mesmo fora das pastas
  do `CODEOWNERS` (o ruleset da `main` só obriga a parte do `CODEOWNERS`; o resto é combinado).
- **Rebase que exige mudança de código** volta para o Helbert, com novo pedido de revisão.
- **Lead de teste em produção:** nome "Teste Strat WEB-<n>", e-mail e telefone fictícios do time, aviso no grupo do
  comercial antes do envio e o lead apagado do MetricaaS no fim (regra dura 9).

## 2026-11-12 · O PR sai pela conta própria do dev (Helbert, sessão de 12/11 pela cabine; trazida pelo Jhonathan)
O PR é aberto pela conta do GitHub de quem fez o trabalho (o `gh` logado na máquina do dev), não mais pela conta de
serviço `strat-aibr`. Commit, push e PR pela mesma conta. `CLAUDE.md`, `docs/padroes.md` e `docs/comecar.md` foram
corrigidos junto com esta entrada; a skill `/lab:entrega-web` é corrigida no repositório dela.

## 2026-11-12 · Casos com nome do cliente só com autorização (Helbert, sessão de 12/11 pela cabine; trazida pelo Jhonathan)
Vale para as páginas de caso da StratAI (WEB-34 e WEB-60). O Helbert confirma a autorização com cada cliente. Sem
autorização até o lote ir ao ar, o caso sai anônimo, descrito pelo segmento e pela cidade (ex.: "restaurante de
Joinville"), sem o nome na URL, no título, no texto nem na imagem. O número do caso continua valendo (regra dura 4).

## 2026-11-12 · Texto de página nova da StratAI (Helbert, sessão de 12/11 pela cabine; trazida pelo Jhonathan)
O texto de cada página nova da StratAI é aprovado pelo Helbert e escrito na voz da StratAI, a do design system da
marca.

## 2026-11-12 · Estrutura nova da StratAI, página a página (Helbert, sessão de 12/11 pela cabine; trazida pelo Jhonathan)
Vale para WEB-33, WEB-34, WEB-59, WEB-60 e WEB-61.
- A estrutura nova do stratai.com.br entra depois da migração, uma página por vez, com 301 sempre que uma URL
  publicada mudar (regra dura 5).
- O mapa fica em `docs/planos/stratai-estrutura.md` (PR à parte): cada URL nova, o item que a cobre, o 301 quando
  houver, o título e o H1. O Jhonathan propõe, o Helbert aprova no PR.
- Até o mapa ser aprovado, os lotes B e C (WEB-59, WEB-60) e os guias (WEB-61) esperam.
- O plano de Joinville (`docs/planos/stratai-buscas-joinville.md`) só traz título e H1 da home; os das 15 páginas
  novas entram no mapa.

## 2026-11-12 · WEB-32 antecipado (Helbert, sessão de 12/11 pela cabine; trazida pelo Jhonathan)
A migração do stratai.com.br (home, `/raio-x/` e política) para `apps/stratai` vem logo depois da pilha do kit (PRs
#5 a #11), antes das outras migrações. Migra sem mudar texto, layout nem tracking.

## 2026-11-12 · Página de parcerias da StratAI (Helbert, sessão de 12/11 pela cabine; trazida pelo Jhonathan; WEB-74)
- A prévia está aprovada como está. Endereço final: `stratai.com.br/parcerias/`.
- Vai ao ar só com a indicação de clientes; as ferramentas parceiras entram depois.
- Publica junto com o WEB-32 antecipado. O cadastro de indicação cai no MetricaaS da StratAI (workspace
  `agencia-strat`) e quem responde é o Helbert.
- As condições da parceria (percentual, dia e prazo de pagamento) nunca entram no repositório nem no Plane.

## 2026-11-12 · Formulário da home da Agência: corrigir no site no ar (Helbert, sessão de 12/11 pela cabine; trazida pelo Jhonathan; WEB-71)
A correção do formulário (empresa, segmento, faturamento, verba e serviços indo para os campos do lead no MetricaaS)
é feita já no repositório que serve o site no ar (`strat-lps`). O WEB-23 copia a versão corrigida e continua sem
mudar texto nem tracking.

## 2026-11-12 · Domínio da Academy na virada do WEB-49: opção (a) (Helbert, sessão de 12/11 pela cabine; trazida pelo Jhonathan)
Na virada, o domínio stratacademy.com.br sai do projeto `stratacademy` do Pages (o do horus) e passa para o projeto
`sites-stratacademy` deste repositório. A troca volta atrás em minutos, devolvendo o domínio ao projeto antigo.

## 2026-11-11 · Consentimento do kit: o catálogo decide, o Rastro tem de bater (Helbert, 11/11 pela cabine, no WEB-72; trazida pelo Jhonathan)
- **O catálogo decide o consentimento página a página** (campo `consentimento` de `catalogo/sites.json`), e o kit
  garante que o catálogo bate com o Rastro.
- **Página nova nasce** em `soft` se o perfil for `venda` ou `lead`, e em `banner` se for `conteudo`.
- **`off` só como exceção registrada aqui**, com data e quem decidiu (mesma regra do `modelo-lp`).
- **Exceções herdadas** (a migração não muda tracking, então seguem em `off`): `agenciastrat.com.br/advogados/`
  (decisão de 02/11), StratAI (home, `/raio-x/` e `/bio/`), metricaas.com.br e as LPs de venda da Academy (claude.,
  skills., mentoria. e bootcamp.). A vibecode segue em `soft`; a home e a bio da Agência seguem em `banner`.
- **Catálogo diferente do Rastro vira erro:** com `rastro_slug`, o `consentimento` do catálogo tem de ser o
  `consentMode` do produto (`banner` no catálogo = `strict` no Rastro). O build quebra quando não bate, e a checagem
  `tracking` da CI compara o `/sa?product=` de cada URL com o catálogo, inclusive pixel, GA4 e Google Ads. O código
  entra no PR do WEB-17 (#8).
- **Produto `site` do Rastro em `strict`:** a home da Academy migrada (WEB-49) se comporta como hoje, com o pixel só
  depois do aceite. O cookie é o mesmo `strat_consent` do horus, então quem já aceitou continua aceito. A troca foi
  feita pelo Helbert e conferida em 11/11 às 23h01 (`/sa?product=site` em `strict`; pixel, GA4 e Ads iguais).
- O que cada modo faz com pixel, GA4, MetricaaS e Rastro: `tracking.md`, seção "Consentimento".

## 2026-11-11 · Como o catálogo guarda o que a página carrega (Jhonathan, no WEB-13; aprovação do Helbert no PR)
- Os ids de cada linha de `catalogo/sites.json` são os que a página **deve** carregar, porque o `<Tracking>` lê dali.
  O que a página carrega hoje e é diferente vai em `diferenca_hoje`, com o item que corrige. Assim o catálogo bate
  com a auditoria linha a linha sem virar retrato de um erro.
- Migração sem mudar tracking (WEB-23, WEB-32) leva o que está no ar: a Agência fica sem GA4 e sem tag do Google
  até alguém decidir ligar (T3).
- Na LP claude., o `ga4` guarda a tag que carrega (G-3RYFFP7EF5, do produto `quaia` no Rastro); ela entrega na
  propriedade G-R84BNVV2HX, a mesma das outras LPs (T2).
- Campos novos: `umami_website_id`, `consentimento`, `dono` e `diferenca_hoje`.

## 2026-11-04 · Organização dos sites (Helbert)
Plano: https://claude.ai/artifact/7YroEqx8kQtjt7NQKMxZc8. Todas as recomendações aprovadas.

| # | Decisão |
|---|---|
| D1 | Organização nova no GitHub: `strat-web` |
| D2 | Repositório público, para ganhar regra de merge e varredura de segredo no plano grátis (nasceu privado em 04/11; vira público depois da revisão do conteúdo) |
| D3 | Monorepo `sites`, com o CODEOWNERS separando quem revisa o quê |
| D4 | Astro para os quatro sites; LP de campanha pode ser HTML estático dentro do kit |
| D5 | Zona `strat.tec.br` migra para a conta principal da Cloudflare por último, numa janela combinada |
| D6 | A Agência sai de `agencia.stratai.com.br` para `agenciastrat.com.br` com 301 por caminho; campanhas trocam a URL depois |
| D7 | Três perfis de tracking: venda, lead, conteudo (ver `tracking.md`) |
| D8 | O site da Academy sai do horus por último, fora de lançamento, com as URLs idênticas |
| D9 | Voz do blog da Agência: Gabriel |
| D10 | Metas de performance: 90 ou mais no celular, LCP até 2,5 s, CLS até 0,1, até 1,5 MB |
| D11 | Marketing entra com escrita em conteúdo e LP; o resto pede revisão de dev |
| D12 | Na Cloudflare, só Helbert e Gabriel são membros; o time usa token restrito |

Também em 2026-11-04: o projeto do Infisical `strat-web` (antigo, de segredos) passa a ser o dos sites; a migração
é tocada pelo Helbert e pelo Jhonathan, acompanhada no Plane, projeto `WEB` (P09 · Sites e LPs).
