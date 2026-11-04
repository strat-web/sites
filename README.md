# strat-web/sites

Os sites, LPs e blogs do Grupo Strat, num repositório só. Cada site é um app Astro que sai como página estática no
Cloudflare Pages. O kit compartilhado garante que toda página nasce com o mesmo SEO, GEO e tracking.

| Domínio | Marca | App | Hoje (até a migração) |
|---|---|---|---|
| agenciastrat.com.br | Agência Strat: tráfego, social, conteúdo, LPs de captação | `apps/agenciastrat` | agencia.stratai.com.br, no `strat-lps` (Easypanel) |
| stratai.com.br | StratAI: implementação de IA, automação, software | `apps/stratai` | `strat-lps` (Easypanel) |
| stratacademy.com.br | Strat Academy: site, blog, cursos, mentorias | `apps/stratacademy` e `lps/academy/*` | site no `horus` (Pages); LPs no `strat-lps` |
| metricaas.com.br | MetricaaS: site do produto (o app fica em `Strat-Ai-Metricaas/metricaas`) | `apps/metricaas` | `strat-lps` (Easypanel) |

O mapa completo, com o que fica no Easypanel e o que vem para o Pages, está em [docs/dominios.md](docs/dominios.md).

## Por onde começar

1. [docs/comecar.md](docs/comecar.md): acessos, ferramentas e o primeiro dia.
2. [CLAUDE.md](CLAUDE.md): as regras que valem para quem trabalha aqui (gente ou Claude).
3. A skill `/lab:entrega-web` (plugin `lab` da oficina): o rito de cada entrega, do item do Plane ao PR documentado.

## Onde estão as regras

| Assunto | Arquivo |
|---|---|
| Estrutura, nomes, branch, commit, PR, checagens | [docs/padroes.md](docs/padroes.md) |
| Tracking (Rastro, MetricaaS, pixel, GA4) | [docs/tracking.md](docs/tracking.md) |
| SEO e GEO (respostas de IA) | [docs/seo-geo.md](docs/seo-geo.md) |
| Antes de publicar | [docs/checklist-publicar.md](docs/checklist-publicar.md) |
| Domínios, DNS e hospedagem | [docs/dominios.md](docs/dominios.md) |
| Chaves (Infisical `strat-web`) | [docs/infisical.md](docs/infisical.md) |
| Search Console e Bing | [docs/search-console.md](docs/search-console.md) |
| Decisões | [docs/decisoes.md](docs/decisoes.md) |
| Catálogo de URLs (fonte única de ids e tags) | [catalogo/sites.json](catalogo/sites.json) |

## Onde o trabalho é acompanhado

Plane, projeto **P09 · Sites e LPs** (`WEB`): https://plane.strat.tec.br/grupo-strat/projects/81e460d5-3870-4624-856e-353a812d9757/issues/

Um item por entrega, um PR por item. Só o Helbert move item para Concluído.
