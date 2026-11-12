# SEO e GEO

GEO é aparecer nas respostas de ChatGPT, Gemini e Perplexity. Elas montam a resposta a partir do que o Google e o
Bing indexam, de páginas com fatos claros e de quem cita a empresa. O kit cuida da parte técnica; o texto cuida do resto.

## Toda página indexável
- **Título** de 10 a 65 caracteres, com a busca principal e a marca (`Agente de IA no WhatsApp para empresas · StratAI`).
- **Descrição** de 50 a 160 caracteres.
- **Um H1**, com a busca principal. Título e H1 únicos no site (a CI barra repetido).
- **Canonical** para a própria URL, com barra no fim e no domínio final (nunca `pages.dev`).
- **Open Graph** com imagem absoluta.
- **JSON-LD:** `Organization` ou `ProfessionalService` da marca (com `parentOrganization` "Grupo Strat" e `sameAs` das
  outras marcas e redes), `BreadcrumbList`, `FAQPage` quando houver FAQ (texto idêntico ao visível), `Article` no blog.
- **Conteúdo próprio:** não copiar bloco de outra página. Página que repete a home não ranqueia.
- **Dois links internos** no mínimo e um CTA para o diagnóstico ou o contato da marca.
- **Fatos verificáveis:** endereço, CNPJ, sócios, cases com número real. É o que as IAs citam.

## Todo site
- `robots.txt` que libera os robôs de IA (GPTBot, ChatGPT-User, ClaudeBot, PerplexityBot, Google-Extended, Bingbot) e aponta o sitemap.
- `sitemap.xml` gerado no build, só com páginas indexáveis, com `lastmod` real.
- `llms.txt` com o resumo da marca, os serviços e as páginas principais.
- Cabeçalhos de segurança no `_headers` e `X-Robots-Tag: noindex` em `*.pages.dev`.
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
