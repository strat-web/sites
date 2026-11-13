# @strat/checagens

As checagens obrigatórias da CI dos sites (WEB-20): `seo`, `tracking`, `links`, `peso` e `catalogo`, sobre o `dist/`
de cada app. A `build` é o próprio `pnpm build` mais `pnpm test`. O que cada uma barra, como rodar na máquina e as
exceções: `docs/padroes.md`, "Checagens da CI".

```bash
pnpm checar                                              # build, testes e as 5 checagens (Lighthouse precisa do Chrome)
pnpm checar:rapido                                       # sem o Lighthouse
node packages/checagens/src/cli.js seo --app apps/stratai
pnpm --filter @strat/checagens test                      # testes das regras
```

| Arquivo | O quê |
|---|---|
| `src/contexto.js` | lê o catálogo e, de cada app com `dist/`, o domínio, as páginas, os `.js` do build e o sitemap; app sem `dist/` barra (`checarApps`) |
| `src/seo.js`, `src/tracking.js`, `src/links.js`, `src/peso.js`, `src/catalogo.js` | uma checagem cada, função que devolve `{ erros, avisos }` |
| `src/esqueletos.js` | as homes-esqueleto do WEB-15, com o item que migra cada uma |
| `src/cli.js` | roda as checagens e sai com 1 se alguma barrar (anotação no PR quando roda no GitHub Actions) |

A regra de tracking usa a mesma função do componente (`planoDeTracking` do kit): o que a página deve carregar sai
da linha do catálogo, nunca de uma lista própria.
