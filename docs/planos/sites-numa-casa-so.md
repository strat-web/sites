# Os sites da Strat numa casa só

> **Origem:** export do Drive em 2026-11-12 do plano aprovado pelo Helbert em 2026-11-04 (versão 1; decisões D1 a
> D12 em `docs/decisoes.md`, entrada de 2026-11-04). A versão original
> fica com o time.
>
> **O que foi tirado e por quê:** este repositório é público. Ficaram só as decisões, as fases e as páginas. Saíram
> o retrato da infraestrutura interna (contas, serviços, servidores, hospedagem dos apps internos), as quedas do
> servidor, quem tem qual acesso (equipes, membros, tokens, propriedades do Search Console) e as fontes internas da
> conferência. Onde o plano já virou regra deste repositório, o texto aponta para o doc que vale.

Cinco domínios, uma organização no GitHub, uma conta da Cloudflare, um projeto do Infisical para os sites e um padrão
de tracking e SEO que o time segue sem depender da cabine do Helbert.

## Desenho

- Site e LP saem do servidor de aplicações e vão para o **Cloudflare Pages**, a partir do monorepo `strat-web/sites`.
  O que tem banco, fila, sessão ou processo contínuo fica onde está.
- Um catálogo único (`catalogo/sites.json`) alimenta a CI, o motor de LP e a documentação: cada URL com marca, perfil
  de tracking, ids públicos, Search Console e dono.
- Deploy pela integração Git do Pages, com preview por PR e as checagens da CI antes do merge. Segredo nunca entra no
  repositório (`CLAUDE.md`, regra dura 1).

| Domínio | Marca | Perfil (`tracking.md`) |
|---|---|---|
| agenciastrat.com.br | Agência Strat: tráfego, social, conteúdo, LPs de captação | lead |
| stratai.com.br | StratAI: implementação de IA, automação, software | lead |
| stratacademy.com.br | Strat Academy: site, blog, cursos, mentorias, eventos | venda (LPs) e conteudo (site e blog) |
| metricaas.com.br | MetricaaS: site do produto | lead |

O domínio dos apps internos fica fora deste plano e nunca é indexado.

## Páginas por domínio

### agenciastrat.com.br (`apps/agenciastrat`)
- `/` site (vem de agencia.stratai.com.br), `/advogados/` e as próximas LPs de nicho, `/bio/`, `/blog/` de marketing,
  política de privacidade.
- Migração: 301 de cada caminho de agencia.stratai.com.br. O domínio novo entra na lista de permissão do pixel e do
  MetricaaS antes da virada; as campanhas trocam a URL depois do 301 no ar (D6).

### stratai.com.br (`apps/stratai`)
- `/`, `/raio-x/`, as páginas de serviço, segmento e caso do plano de Joinville (`stratai-buscas-joinville.md`), os
  `/guias/` de compra, `/sobre/`; bio.stratai.com.br vira `/bio/` com 301.
- O gerador de páginas que o plano de Joinville propunha vira o kit Astro do monorepo.

### stratacademy.com.br (`apps/stratacademy` e `lps/academy/<lp>`)
- `/` e `/blog/` (Astro, hoje no horus) e as LPs de campanha nos subdomínios claude., skills., mentoria., bootcamp.,
  vibecode. e comunidade., um projeto do Pages por subdomínio.
- Sai do horus por último, com as URLs idênticas e o tracking do site conferido antes e depois (D8).

### metricaas.com.br (`apps/metricaas`)
- `/` (acesso antecipado) e um `/blog/` novo. Docs e app do produto seguem fora deste repositório.
- O robots do domínio passa a liberar os robôs de IA.

### Fora dos sites
LP de cliente continua no repositório e na hospedagem do cliente, mas nasce do `modelo-lp` e segue o mesmo checklist.

## Estrutura do repositório

```text
strat-web/sites                 # monorepo, pnpm + Astro
├── apps/                       # agenciastrat, stratai, stratacademy, metricaas
├── lps/academy/                # claude, skills, mentoria, bootcamp, vibecode, comunidade
├── packages/kit/               # Layout, Seo, JsonLd, Faq, Breadcrumb, Tracking, llms.txt, sitemap
├── packages/conteudo/          # schema do blog + checar-posts
├── catalogo/sites.json         # fonte única de URLs e tags
├── docs/                       # o manual do time
└── .github/                    # checagens da CI e CODEOWNERS

strat-web/rastro                # o Rastro, na organização nova
strat-web/modelo-lp             # o modelo de LP de cliente
```

As checagens da CI e a regra de merge valem como estão em `docs/padroes.md`.

## Tracking, SEO e blog

- Três perfis de tracking (`venda`, `lead`, `conteudo`), com os ids no catálogo e nunca no HTML (D7, `tracking.md`).
  O consentimento por página é a decisão do WEB-72 (`docs/decisoes.md`, 11/11).
- SEO e GEO em toda página: título e H1 únicos, canonical com barra, JSON-LD da marca, BreadcrumbList, FAQPage quando
  há FAQ, `llms.txt` e sitemap gerados, robots que libera os robôs de IA, cabeçalhos de segurança (`seo-geo.md`).
- Uma propriedade do Search Console por domínio (`search-console.md`), mais o Bing Webmaster importado do Search
  Console.
- Blog nos quatro sites com o mesmo schema e o mesmo `checar-posts`, imagens no R2 da marca (`assets.<domínio>`) e
  voz por site: Helbert na Academy, StratAI e MetricaaS; Gabriel na Agência (D9).
- O motor de LP e o blog saem da cabine para a oficina: primeiro no plugin `lab`, depois num plugin do setor.

## Fases

A ordem vai do que não tem legado para o que tem. A Agência é o piloto porque o domínio é novo e não tem SEO a perder.

| Fase | O que entra | Portão |
|---|---|---|
| F0 · Decisões e fundação (semana 1) | organização no GitHub, conta da Cloudflare, projeto dos sites no Infisical, decisões registradas | as 12 decisões respondidas; zona do agenciastrat ativa |
| F1 · Auditoria do que está no ar (semanas 1 e 2) | tags que disparam de verdade, dedup, consentimento, robots, sitemap; catálogo corrigido | relatório por domínio com os achados priorizados; cada achado vira item (`docs/auditoria/2026-11/`) |
| F2 · Monorepo, kit e CI (semanas 2 e 3) | o kit, o catálogo como fonte, o schema do blog, as 6 checagens e a regra de merge, o manual em `docs/` | uma página de teste passa nas checagens e no `/lp-revisar` |
| F3 · Piloto: agenciastrat.com.br (semanas 3 e 4) | site, `/advogados/` e `/bio/` no Pages; domínio no pixel, no MetricaaS e no Search Console; 301 de cada caminho | lead de teste de ponta a ponta (formulário, MetricaaS, agenda, WhatsApp) e 301 conferido rota a rota |
| F4 · stratai.com.br e metricaas.com.br (semanas 4 a 6) | StratAI no Pages, com o plano de Joinville por cima; site do MetricaaS no Pages; bio.stratai vira `/bio/` com 301 | leads da home iguais aos da semana anterior; Rastro e MetricaaS disparando |
| F5 · Motor de LP e blog para o time (semanas 5 a 8) | skills e agentes de LP na oficina; blog com perfil por site | um dev roda um diagnóstico completo sem a cabine |
| F6 · Academy: LPs de campanha e site (semanas 6 a 8) | LPs no Pages, uma por subdomínio, fora de lançamento; site e blog saem do horus com as URLs idênticas | compra de teste na Hotmart gera 1 Purchase; o Search Console não mostra queda de páginas indexadas |
| F7 · Desligar o legado (semanas 8 a 10) | serviço antigo das LPs desligado; repositórios duplicados arquivados; Rastro e `modelo-lp` na organização nova; zona `strat.tec.br` migrada (D5); rotina semanal de saúde dos sites | duas semanas de 301 sem erro no catálogo antes de desligar |

Cronograma de 10 semanas a partir de 2026-11-09:

| Fase | Responsável | Semanas |
|---|---|---|
| F0 | Helbert, Gabriel | 1 |
| F1 | Helbert | 1 e 2 |
| F2 | João | 2 e 3 |
| F3 | Jhonathan | 3 e 4 |
| F4 | João | 4 a 6 |
| F5 | Helbert | 5 a 8 |
| F6 | Helbert e devs | 6 a 8 |
| F7 | Helbert | 8 a 10 |

Mudança de 12/11 (`docs/decisoes.md`): a migração da StratAI (WEB-32) foi antecipada para logo depois da pilha do kit,
e a estrutura nova da StratAI entra página a página pelo mapa `docs/planos/stratai-estrutura.md`.

## Decisões (aprovadas em 2026-11-04)

| # | Decisão | Escolha |
|---|---|---|
| D1 | Nome da organização | `strat-web` |
| D2 | Repositório público ou plano Team | público: os sites já são públicos, segredo não entra, e o plano grátis ganha regra de merge e varredura de segredo |
| D3 | Monorepo ou um repositório por marca | monorepo `sites`, com o CODEOWNERS separando quem revisa o quê |
| D4 | Astro para todos os sites | Astro; LP de campanha pode ser HTML estático dentro do kit |
| D5 | Zona `strat.tec.br` | migra para a conta principal por último (F7), numa janela combinada |
| D6 | Agência sai de agencia.stratai.com.br | 301 permanente por caminho; as campanhas trocam a URL depois do 301 no ar |
| D7 | Padrão de tracking | três perfis: venda, lead, conteudo |
| D8 | Quando a Academy sai do horus | por último (F6), fora de lançamento |
| D9 | Voz do blog da Agência | Gabriel |
| D10 | Metas de performance | performance 90 ou mais no celular, LCP até 2,5 s, CLS até 0,1, até 1,5 MB: viram barra na CI |
| D11 | Marketing no repositório | escrita em conteúdo e LP; o resto pede revisão de dev (regra prática de 12/11 em `docs/decisoes.md`) |
| D12 | Publicação | o time publica pelo GitHub (PR e Cloudflare Pages), sem acesso direto ao painel |
