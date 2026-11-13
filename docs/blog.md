# Blog

O blog dos quatro sites usa o mesmo formato de post e a mesma checagem, do pacote `packages/conteudo`
(`@strat/conteudo`, WEB-19). O schema e o `checar-posts` vieram do horus (`packages/config/src/content.ts` e
`apps/stratacademy/scripts/checar-posts.mjs`); os nomes dos campos ficaram iguais aos de lá para os posts da Academy
migrarem sem mexer no frontmatter.

## Onde fica cada coisa
| O quê | Onde |
|---|---|
| Posts do app | `apps/<app>/src/content/blog/<slug>.md` (ou `.mdx`; subpasta vira parte do slug) |
| Collection do app | `apps/<app>/src/content.config.mjs`: `blogSchema(z, image, { autorPadrao })` |
| Schema | `packages/conteudo/src/schema.js` |
| Checagem | `packages/conteudo/src/checar-posts.js` e o bin `checar-posts` |
| O que é de um app só | `apps/<app>/conteudo.config.json` (opcional) |

## Frontmatter
```yaml
---
title: "Agente de IA no WhatsApp: o que medir no primeiro mês"
description: "O que olhar nos primeiros 30 dias de um agente de IA no WhatsApp: atendimento, qualificação e agenda."
pubDate: 2026-11-12
updatedDate: 2026-11-20      # opcional
author: "Equipe StratAI"     # opcional; sem ele vale o autorPadrao do app
tags: ["whatsapp", "agentes"]
cover: "https://assets.stratai.com.br/blog/agente-whatsapp/capa.webp"   # ou imagem local
faq:                         # opcional; texto idêntico ao visível (docs/seo-geo.md)
  - q: "Funciona com o WhatsApp que eu já uso?"
    a: "Sim, ..."
draft: false                 # rascunho: não vai ao ar
noindex: false               # vai ao ar fora do índice e do sitemap
teste: false                 # post de teste: nunca vai ao ar; exige noindex: true
---
```

| Campo | Regra |
|---|---|
| `title` | obrigatório, até 120 caracteres (é o H1). Acima de 65, o checar-posts avisa: o Google corta o `<title>` |
| `description` | obrigatório, de 50 a 160 caracteres |
| `pubDate`, `updatedDate` | data (`AAAA-MM-DD`) |
| `cover` | imagem local (passa pelo `astro:assets`) ou URL `http(s)` no R2 da marca; acima de 200 KB vai para o R2 (`docs/padroes.md`) |
| `teste` | `true` exige `noindex: true` (o build quebra sem) |

Na rota do blog, na listagem, no feed, no sitemap e no `llms.txt`, filtre pelos helpers do pacote:
`naListagem(post.data)` tira rascunho e teste; `indexavel(post.data)` tira também o `noindex`.

```js
import { getCollection } from 'astro:content';
import { naListagem } from '@strat/conteudo';
const posts = await getCollection('blog', ({ data }) => naListagem(data));
```

## A checagem
O build do Astro já reprova frontmatter fora do schema. O `checar-posts` pega o que o schema não vê:

| Barra (erro) | Avisa |
|---|---|
| sem `title` ou `description`, ou fora do tamanho | `title` acima de 65 caracteres |
| H1 no corpo (o título vem do frontmatter) | sem H2 (o artigo fica sem sumário) |
| link para rota removida (`rotasMortas`) | link interno que não bate com nenhuma rota do app |
| link para post que não existe | link interno sem barra no fim |
| post publicado linkando rascunho ou teste | post publicado sem link para outro post |
| `teste: true` sem `noindex: true` | |

Código e trecho entre crases não contam (um `# comentário` de shell não é H1). Rotas conhecidas: o que existe em
`src/pages` (`.astro`, `.md`, `.mdx`, endpoint como `rss.xml.js`; `[slug].astro` aceita qualquer slug kebab-case
naquele prefixo), os arquivos de `public/` e as `rotasExtras`.

Rodar:
- um app: `pnpm --filter @strat/stratai checar:posts`;
- todos: `pnpm checar:posts`;
- na CI: o `test` de cada app chama o `checar-posts`, então ele roda no `pnpm test` junto com os testes dos pacotes.

Sai com código 1 quando há erro; aviso não barra.

## conteudo.config.json (opcional)
```json
{
  "rotasMortas": ["/loja/"],
  "rotasExtras": ["/curso-claude-code/"],
  "prefixosDinamicos": ["/ferramentas/calculadora-de-funil-de-vendas/modelos"]
}
```
Também aceita `posts`, `paginas`, `publico` e `prefixoBlog` (padrões: `src/content/blog`, `src/pages`, `public`,
`/blog`). Chave com erro de digitação quebra a checagem. A `stratacademy` já traz as rotas que saíram do ar na virada
do horus. Quando o blog da Academy migrar, as rotas que saem de dados lá (`/curso-*` e os modelos das ferramentas)
entram em `rotasExtras` junto com as páginas.

## Post de teste
`apps/stratai` e `apps/stratacademy` têm `src/content/blog/post-de-teste-do-pacote-conteudo.md`, com `teste: true` e
`noindex: true`. Ele não tem rota (não há página de blog ainda), por isso não tem linha no catálogo nem entra no
sitemap. Serve para provar que o schema e a checagem valem nos dois apps; sai no PR do primeiro post de verdade.
