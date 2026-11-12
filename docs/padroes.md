# Padrões

## Estrutura (alvo do F2)

```
apps/
  agenciastrat/      site da Agência + /advogados + /bio + /blog
  stratai/           site da StratAI + /raio-x + serviços + /guias + /bio
  stratacademy/      site + /blog da Academy
  metricaas/         site do produto + /blog
lps/
  academy/<lp>/      claude, skills, mentoria, bootcamp, vibecode, comunidade (um projeto do Pages por subdomínio)
packages/
  kit/               Layout, Seo, JsonLd, Breadcrumb, Faq, Tracking, sitemap, robots, llms.txt
  conteudo/          schema do blog (Zod) e checar-posts (docs/blog.md)
catalogo/sites.json  fonte única de URLs, ids e tags
docs/                o manual
```

- Astro com saída estática. LP de campanha pode ser HTML estático dentro de `lps/`, desde que use o kit (tracking e SEO).
- pnpm workspaces. Cada app tem o seu projeto no Cloudflare Pages, com "caminho de build observado" no próprio app
  e em `packages/`, para só buildar o que mudou.
- URL sempre com barra no fim (`/agencia-de-ia-joinville/`). Canonical, sitemap e link interno na mesma forma.
- Imagem de blog e de LP vai para o R2 da marca (`assets.<domínio>`), nunca para o repositório quando passar de 200 KB.

## Nomes
- App: o nome do domínio sem `.com.br` (`agenciastrat`, `stratai`).
- Página: caminho em português, minúsculo, com hífen (`/agente-de-ia-whatsapp/`).
- Componente do kit: PascalCase em português ou o termo do mercado (`Seo`, `JsonLd`, `Faq`, `Tracking`).

## Rito de entrega (o que a `/lab:entrega-web` faz)
1. **Pegar o item:** o próximo item seu no `WEB`, na ordem dos módulos (F0 → F7). Ler a descrição inteira e o "Pronto quando".
2. **Começar:** item em Fazendo, comentário "começando" com o plano em 3 linhas. Branch `web-<N>-<slug>` da `main`.
3. **Fazer:** só o escopo do item. Fora do escopo vira item novo em Triagem.
4. **Verificar:** build, as checagens da CI rodando local (`pnpm checar`), o checklist de publicar quando for página
   (`docs/checklist-publicar.md`), o preview do Pages a 390 e 1440 px.
5. **Documentar:** catálogo, `docs/dominios.md`, `docs/decisoes.md` e `CHANGELOG.md` no mesmo PR.
6. **PR:** pelo modelo, aberto pela `strat-aibr`, com o link do item, do preview e "como conferir".
7. **Fechar a volta:** item em Aprovação com o link do PR e do preview; comentário com o que foi feito, o que ficou
   de fora e o que precisa do Helbert. Cartão da sessão no strat-dev (`/base:encerrar cartao`).
8. **Ajuste:** se o Helbert mover para Em ajuste, o motivo está no comentário. Corrige no mesmo PR e volta para Aprovação.

## Commit e PR
- Conventional Commits em português: `feat`, `fix`, `docs`, `chore`, `refactor`, `perf`, `ci`. Escopo = app ou pacote.
  O item vai no fim: `fix(stratai): links do WhatsApp com wa.me no HTML (WEB-33)`.
- Título do PR igual ao commit principal.
- Um PR por item. PR grande (mais de ~600 linhas fora de conteúdo) é sinal de que o item precisava ser dividido.

## Checagens da CI (WEB-20)
| Checagem | Barra quando |
|---|---|
| build | algum app não compila |
| seo | título ou H1 repetido, sem canonical, `href="#"`, JSON-LD inválido, página indexável fora do sitemap |
| tracking | página sem `<Tracking>`, slug que o Rastro não conhece, pixel ou gtag colado à mão |
| links | link interno quebrado |
| peso | página acima do orçamento (performance ≥ 90, LCP ≤ 2,5 s, CLS ≤ 0,1, até 1,5 MB) |
| catalogo | URL nova sem linha em `catalogo/sites.json` |
