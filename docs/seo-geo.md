# SEO e GEO

GEO é aparecer nas respostas de ChatGPT, Gemini e Perplexity. Elas montam a resposta a partir do que o Google e o
Bing indexam, de páginas com fatos claros e de quem cita a empresa. O kit cuida da parte técnica; o texto cuida do resto.

## Toda página indexável
- **Título** de 10 a 65 caracteres, com a busca principal e a marca (`Agente de IA no WhatsApp para empresas · StratAI`).
- **Descrição** de 50 a 160 caracteres.
- **Um H1**, com a busca principal. Título e H1 únicos no site (a CI barra repetido).
- **Canonical** para a própria URL, com barra no fim e no domínio final (nunca `pages.dev`).
- **Open Graph** com imagem absoluta.
- **JSON-LD:** `Organization` ou `ProfessionalService` da marca (com `parentOrganization` "Grupo Strat", que liga as
  marcas entre si, `sameAs` só com os perfis da própria marca e `logo` com o logotipo, não a imagem de compartilhamento), `BreadcrumbList`, `FAQPage` quando houver FAQ (texto
  idêntico ao visível), `Article` no blog.
  Post de blog segue o schema e o `checar-posts` de `docs/blog.md` (tamanho de título e descrição, H2, links internos).
- **O kit faz tudo isso sozinho** (WEB-16): `<Layout>` põe título, descrição, canonical, robots, Open Graph e o JSON-LD
  da marca; `<Breadcrumb>` e `<Faq>` montam o visível e o JSON-LD da mesma lista. Os dados de cada marca (nome,
  telefone, endereço, redes) moram em `packages/kit/src/marcas.js`, com a fonte. Exemplo em `padroes.md`.
- **Conteúdo próprio:** não copiar bloco de outra página. Página que repete a home não ranqueia.
- **Dois links internos** no mínimo e um CTA para o diagnóstico ou o contato da marca.
- **Fatos verificáveis:** endereço, CNPJ, sócios, cases com número real. É o que as IAs citam.

## Todo site
- `robots.txt` que libera os robôs de IA (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot,
  Claude-User, PerplexityBot, Perplexity-User, Google-Extended, Applebot-Extended, Bingbot) e aponta o sitemap.
- `sitemap.xml` gerado no build, só com páginas indexáveis, com `lastmod` real.
- `llms.txt` com o resumo da marca, o contato e as páginas principais, e só as outras marcas que já estão no ar.
- **Os três o kit gera sozinho no build** (WEB-18), a partir do catálogo e de `packages/kit/src/marcas.js`. Como
  funciona e as regras: `padroes.md`, "sitemap.xml, robots.txt e llms.txt".
- Página 404 de verdade: caminho que não existe responde 404 com a página da marca, nunca 200 com a home (soft 404).
  O kit faz com o `<PaginaNaoEncontrada>` (WEB-75); como usar: `padroes.md`, "Página 404".
- Cabeçalhos de segurança no `_headers` e `X-Robots-Tag: noindex` em `*.pages.dev`: o kit também gera esse arquivo
  no build (WEB-21). Quais cabeçalhos e por quê: `padroes.md`, "Cabeçalhos: `_headers`".
- Propriedade no Search Console e no Bing Webmaster (`docs/search-console.md`).

## Nome, endereço e telefone iguais em todo lugar
| Marca | Nome | Telefone (WhatsApp) | Endereço |
|---|---|---|---|
| StratAI | StratAI | 47991658478 | Rua Aubé, 777, Boa Vista, Joinville/SC, 89205-000 |
| Agência Strat | Agência Strat | 4831994338 | Rua Aubé, 777, Boa Vista, Joinville/SC, 89205-000 |

O telefone dos contratos não vai em página pública nem neste repositório (fica no cadastro interno).

## Medir
- Search Console: páginas indexadas, consultas e posição (7 dias depois de publicar, conferir a página indexada).
- OpenSEO (https://open-seo.stratacademy-ai.workers.dev): posição das buscas-alvo, grade local do Maps e menções nas IAs.
