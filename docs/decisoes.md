# Decisões

Uma entrada por decisão, com data e quem decidiu. A mais nova em cima.

## 2026-11-12 · Regra de merge da `main` (Helbert, revisão do PR #9)
O ruleset tem de bater com o `CODEOWNERS` ("o resto do repositório o dev mescla sozinho, com as checagens verdes"):
- `required_approving_review_count: 0`, mantendo `require_code_owner_review: true`: com 1 aprovação obrigatória em todo
  PR, ninguém mesclaria sozinho fora das pastas com dono, porque ninguém aprova o próprio PR;
- `bypass_actors` com o admin da organização em `bypass_mode: pull_request`: o admin mescla PR próprio em pasta com
  dono, sempre por PR, nunca por push direto;
- `/package.json` e `/pnpm-workspace.yaml` passam a ter dono no `CODEOWNERS` (Helbert).

## 2026-11-11 · Como o `<Tracking>` decide o que carrega (Jhonathan, WEB-17; espera o Helbert no PR)
- **Consentimento por URL, pelo catálogo**, enquanto o padrão por perfil (WEB-72) não sai: o componente faz o que o
  campo `consentimento` diz. A decisão do WEB-72 vira valor no catálogo, sem reescrever o componente.
- **GA4 ou tag do Google sem Rastro quebra o build** até o WEB-73 decidir como a Agência mede: melhor do que o kit
  inventar um gtag.
- **O `m.js` vem antes do Rastro** no `<head>` e, com Rastro, vai sem `data-pixel` (o pixel vem do produto no Rastro;
  com os dois, o evento sairia em dobro).
- **A conta da Hotmart entra no catálogo** (`hotmart_conta`, só no perfil venda), como os outros ids públicos.

## 2026-11-11 · `sameAs` só com os perfis da própria marca (Jhonathan, WEB-16; espera o Helbert no PR)
O `seo-geo.md` pedia `sameAs` "das outras marcas e redes". Pela definição do schema.org, `sameAs` diz que a URL é a
**mesma** entidade, então o site da Agência no `sameAs` da StratAI diria ao Google que as duas são uma empresa só.
No kit, o `sameAs` leva só os perfis da própria marca (Instagram, LinkedIn, YouTube), e o vínculo entre as marcas vai
pelo `parentOrganization` "Grupo Strat", igual nas quatro. Se o Helbert preferir o texto antigo, é uma linha em
`packages/kit/src/marcas.js`.

## 2026-11-11 · Nome do projeto do Pages da Academy (Jhonathan, WEB-15)
O nome `stratacademy` no Pages já é o projeto que serve stratacademy.com.br em produção, ligado ao repositório horus.
O app `apps/stratacademy` deste repositório vira o projeto **`sites-stratacademy`**, sem mexer no projeto antigo. Como o
domínio passa para cá fica para o Helbert decidir no WEB-49 (detalhe em `pages.md`, "A questão da stratacademy").

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
