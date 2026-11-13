# Domínios, DNS e hospedagem

Conferido em 2026-11-04 (Cloudflare, Easypanel, Search Console). Atualize a cada migração.

Em 2026-11-11 (WEB-15) nasceram os projetos do Pages `agenciastrat`, `stratai`, `metricaas` e `sites-stratacademy`,
ligados a este repositório e só com o endereço `.pages.dev` (ver `pages.md`). Nenhum domínio mudou.

## Regra
- Sem servidor próprio (site, LP, blog) → **Cloudflare Pages**, a partir deste repositório.
- Com banco, fila, sessão ou processo contínuo → **Easypanel** (VPS própria; o endereço fica no mapa interno, fora deste repositório).
- Todas as zonas na conta da Cloudflare "Strat Academy" (`6258e000cf06b29a9f3fa797f8592171`), menos `strat.tec.br`,
  que está noutra conta até o WEB-56.

## Zonas

| Zona | Conta | Situação | O Jhonathan mexe com o token? |
|---|---|---|---|
| agenciastrat.com.br | Strat Academy | **pendente**: nameservers ainda no registro.br (WEB-1) | sim |
| stratai.com.br | Strat Academy | ativa | sim |
| metricaas.com.br | Strat Academy | ativa | sim |
| stratacademy.com.br | Strat Academy | ativa | não (entra no WEB-47) |
| strat.tec.br | outra conta | ativa | não |

## Por domínio

| URL | O que é | Hoje | Alvo | Item |
|---|---|---|---|---|
| agenciastrat.com.br | site da Agência, /advogados, /bio, /blog | não publicado | Pages `agenciastrat` (existe desde 11/11, agenciastrat.pages.dev) | WEB-23 a 31 |
| agencia.stratai.com.br | site da Agência (antigo) | Easypanel `strat-lps` | 301 para agenciastrat.com.br | WEB-29 |
| stratai.com.br | site da StratAI, /raio-x, /politica-de-privacidade/, /recuperacao/ (funil e cases, rascunho, WEB-91) | Easypanel `strat-lps` | Pages `stratai` (existe desde 11/11, stratai-ti7.pages.dev). As três páginas e os 301 da casa antiga (`/politica-de-privacidade` sem barra, `/agencia/*` para agencia.stratai.com.br, `/raio-x/v1/`) já estão no app desde o WEB-32; o DNS só vira com o "pode virar" do Helbert | WEB-32 |
| bio.stratai.com.br | bio da StratAI e da Agência | Easypanel `strat-lps` | 301 para /bio de cada marca | WEB-25, WEB-35 |
| metricaas.com.br | site do MetricaaS | Easypanel `strat-lps` (com proxy) | Pages `metricaas` (existe desde 11/11, metricaas.pages.dev) | WEB-36 |
| app., go.metricaas.com.br | o produto | Easypanel `whatsapp/metricaas-app` | fica | — |
| docs.metricaas.com.br | documentação | Mintlify | fica | — |
| stratacademy.com.br | site e blog | Pages `stratacademy` (repositório horus) | Pages `sites-stratacademy`, deste repositório (existe desde 11/11; o nome `stratacademy` é o do horus, ver `pages.md`) | WEB-49 |
| claude., skills., mentoria., bootcamp., vibecode., comunidade.stratacademy.com.br | LPs de campanha | Easypanel `strat-lps` | um projeto do Pages por subdomínio | WEB-48 |
| tracking., wa.stratacademy.com.br | Rastro | Pages `rastro-stratacademy` | fica (repositório vai para a strat-web, WEB-55) | — |
| hub., links., lists., form., git.stratacademy.com.br | apps | Easypanel | fica | — |
| chat., class., crm.stratacademy.com.br | apps em Lovable (185.158.133.1) | Lovable | fica | — |
| membros.stratacademy.com.br | área de membros | MemberClass | fica | — |
| *.strat.tec.br | apps internos (Plane, Infisical, Easypanel, Horus, entregas, propostas) | Easypanel | fica, sempre noindex | WEB-56 |

## Serviços do Easypanel ligados a site (para desligar no fim)
- `aplicativos/strat-lps`: 13 domínios, build nixpacks na VPS. Desliga no WEB-53, depois de 2 semanas de 301 sem erro.
- `aplicativos/stratacademy-site`: builda o horus sem domínio próprio; duplicado do Pages. Desliga no WEB-52.
