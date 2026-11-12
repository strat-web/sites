# @strat/conteudo

Schema do blog (Zod, content collections do Astro) e `checar-posts`, iguais nos quatro apps (WEB-19).
Manual: `docs/blog.md`.

| Exporta | De onde | Para quê |
|---|---|---|
| `blogSchema(z, image, { autorPadrao })` | `@strat/conteudo` | schema da collection `blog` no `src/content.config.mjs` do app |
| `naListagem(dados)`, `indexavel(dados)` | `@strat/conteudo` | filtrar rascunho, teste e noindex na rota, no feed e no sitemap |
| `LIMITES` | `@strat/conteudo` | tamanhos de título e descrição |
| `checarApp`, `checarPosts`, `relatorio` | `@strat/conteudo/checar-posts` | a checagem, para outra ferramenta usar |
| bin `checar-posts [--app <pasta>]` | `node_modules/.bin` do app | script `checar:posts` (e `test`) de cada app |

Testes: `pnpm --filter @strat/conteudo test` (`node --test`). O `astro` é só dependência de desenvolvimento, para o
teste usar o mesmo `z` (`astro/zod`) que os apps injetam.
