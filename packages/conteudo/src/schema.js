// Schema (Zod) da content collection do blog, o mesmo nos quatro apps (WEB-19).
// Veio de horus/packages/config/src/content.ts. Como lá, `z` e `image` são INJETADOS pelo app (de `astro/zod` e do
// contexto do schema): o pacote não importa módulo virtual do Astro nem embute o autor de nenhuma marca.
// Os nomes dos campos ficam em inglês, iguais aos do horus, para os posts migrarem sem mexer no frontmatter.

/** Limites que o schema e o checar-posts usam (docs/blog.md). */
export const LIMITES = Object.freeze({
  titulo: 120, // H1 do post
  tituloBusca: 65, // acima disso o Google corta o <title> (docs/seo-geo.md); o checar-posts avisa
  descricaoMin: 50,
  descricaoMax: 160,
});

/**
 * Schema do frontmatter de um post.
 * @param {any} z o `z` de `astro/zod` (zod 4, o do Astro do app)
 * @param {(() => any) | undefined} image o `image` do contexto do schema; sem ele, a capa só aceita URL
 * @param {{ autorPadrao?: string, defaultAuthor?: string }} [opcoes] autor quando o post não diz (config da marca)
 */
export function blogSchema(z, image, opcoes = {}) {
  if (!z?.object) throw new Error('blogSchema: passe o z de astro/zod como primeiro argumento');
  const autorPadrao = opcoes.autorPadrao ?? opcoes.defaultAuthor ?? 'Equipe';
  // Imagem local (image(), passa pelo astro:assets) ou URL absoluta no R2 da marca
  // (https://assets.<domínio>/blog/<slug>/..., docs/padroes.md).
  const urlImagem = z.url({ protocol: /^https?$/ });
  const capa = typeof image === 'function' ? z.union([image(), urlImagem]) : urlImagem;

  return z
    .object({
      title: z.string().min(1).max(LIMITES.titulo),
      description: z.string().min(LIMITES.descricaoMin).max(LIMITES.descricaoMax),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      author: z.string().default(autorPadrao),
      tags: z.array(z.string()).default([]),
      cover: capa.optional(),
      faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
      draft: z.boolean().default(false),
      // Fora do índice: a página pode existir, com noindex, e não entra no sitemap.
      noindex: z.boolean().default(false),
      // Post de teste do pacote: nunca entra em listagem, feed, sitemap nem llms.txt; exige noindex.
      teste: z.boolean().default(false),
    })
    .refine((d) => !d.teste || d.noindex, {
      message: 'post de teste precisa de noindex: true',
      path: ['noindex'],
    });
}

/** Entra na listagem do blog, no feed e nas rotas de produção: não é rascunho nem teste. */
export const naListagem = (dados) => !dados.draft && !dados.teste;

/** Entra no sitemap e no llms.txt: está na listagem e não pede noindex. */
export const indexavel = (dados) => naListagem(dados) && !dados.noindex;
