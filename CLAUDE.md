# strat-web/sites — regras do repositório

Repositório dos sites, LPs e blogs do Grupo Strat. Vale para gente e para o Claude. Em dúvida, siga o que está aqui
e em `docs/`; se o caso não estiver previsto, pergunte no item do Plane antes de inventar um padrão.

## Como trabalhar
- **Toda entrega começa num item do Plane** (projeto `WEB`) e segue a skill `/lab:entrega-web`: pegar o item,
  branch, fazer, verificar, PR, documentar, atualizar o item. Sem item, não tem PR.
- **Branch:** `web-<N>-<slug>` (ex.: `web-23-agencia-site`), sempre a partir da `main` atualizada.
- **Commit:** Conventional Commits em português, com o item no fim: `feat(agenciastrat): migra o site da Agência (WEB-23)`.
- **PR:** um por item, pelo modelo `.github/pull_request_template.md`, aberto pela conta de serviço `strat-aibr`.
  Quem abre não mescla. A `main` só recebe PR com as checagens verdes e uma aprovação.
- **Item no Plane:** Fazendo ao começar; Aprovação com o link do PR e do preview e "como conferir"; nunca Concluído
  (só o Helbert conclui). O que aparecer fora do escopo vira item novo em Triagem, não entra no PR.

## Regras duras
1. **Segredo nunca entra no repositório.** Chave mora no Infisical `strat-web` e entra por `infisical run`.
   Id público (pixel, GA4, tag do Google, slug do Rastro, workspace do MetricaaS) mora no `catalogo/sites.json`,
   nunca solto no HTML.
2. **Tracking só pelo componente do kit** (`<Tracking perfil="...">`). Nada de pixel, gtag ou GTM colado à mão:
   o Rastro já injeta e daria evento em dobro. Ver `docs/tracking.md`.
3. **Nenhuma página sem linha no catálogo.** URL nova = linha nova em `catalogo/sites.json` no mesmo PR.
4. **Número só de fonte real.** Resultado de cliente, preço, prazo e depoimento só com a fonte escrita no PR.
   Sem fonte, a página sai sem o número.
5. **URL publicada não muda sem 301.** Mudou caminho ou domínio, o PR traz a regra de redirecionamento e a tabela de rotas testadas.
6. **Hospedagem:** site e LP vão para o Cloudflare Pages. Nada de build de site no Easypanel.
7. **DNS e Cloudflare:** só com o token `pages-strat-web` (Infisical `strat-web` `/cloudflare`), só nas zonas que ele
   alcança, e só o registro que o item pede. Nunca apagar registro que você não criou.
8. **Excluir nada fora do repositório** (projeto do Pages, bucket, registro, item do Plane). No máximo desligar ou
   cancelar, com o motivo no item.
9. **Dado de cliente e de lead não entra** em print, log, PR ou doc. Lead de teste usa dado fictício.

## Documentar sempre
Toda entrega atualiza, no mesmo PR, o que mudou de verdade:
- `catalogo/sites.json` (URL, perfil, ids, hospedagem, indexar);
- `docs/dominios.md` (onde cada coisa mora);
- `docs/decisoes.md` (decisão nova, com data e quem decidiu);
- `CHANGELOG.md` (uma linha por PR, em "Não lançado").

Fora do repositório, a skill `/lab:entrega-web` cuida do cartão da sessão no **strat-dev** (`/base:encerrar`), da
proposta ao **contexto-strat** quando surgir processo ou fato da empresa, e do comentário no item do Plane.

## Mapa rápido
- `apps/<site>/` — um app Astro por domínio (montado no F2, item WEB-15).
- `lps/academy/<lp>/` — LPs de campanha da Academy, uma por subdomínio.
- `packages/kit/` — Layout, Seo, JsonLd, Breadcrumb, Faq, Tracking, sitemap, robots, llms.txt.
- `packages/conteudo/` — schema do blog e `checar-posts`.
- `catalogo/sites.json` — fonte única de URLs, ids e tags.
- `docs/` — o manual.
