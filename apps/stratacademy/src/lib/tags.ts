import { getCollection, type CollectionEntry } from 'astro:content';
import { NAV } from '../consts';
import { slugifyTag } from '@horus/seo';
import { naListagem } from '@strat/conteudo';

// slugifyTag agora vem do pacote compartilhado; re-exportado para os importadores do app.
export { slugifyTag };

export interface Category {
  slug: string;
  label: string;
  posts: CollectionEntry<'blog'>[];
}

// Siglas que devem aparecer em caixa-alta (sobrepõem o label derivado da tag).
const ACRONYMS: Record<string, string> = {
  ia: 'IA',
  geo: 'GEO',
  seo: 'SEO',
  n8n: 'N8N',
  api: 'API',
  llm: 'LLM',
};

// Constrói o índice de categorias a partir das tags dos posts +
// das categorias curadas no menu (NAV) — assim links do menu nunca dão 404.
export async function getCategories(): Promise<Category[]> {
  const posts = (await getCollection('blog', ({ data }) => naListagem(data))).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );

  const labelBySlug = new Map<string, string>();
  // 1) Categorias curadas no menu primeiro: garantem rótulos bonitos (Automação, Negócios...).
  for (const item of NAV) {
    const match = item.href.match(/\/categoria\/([^/]+)/);
    if (match) labelBySlug.set(match[1], item.label);
  }
  // 2) Tags dos posts, se ainda não houver rótulo.
  for (const post of posts) {
    for (const tag of post.data.tags) {
      const slug = slugifyTag(tag);
      if (!labelBySlug.has(slug)) labelBySlug.set(slug, tag);
    }
  }
  // 3) Siglas conhecidas têm prioridade de caixa.
  for (const slug of labelBySlug.keys()) {
    if (ACRONYMS[slug]) labelBySlug.set(slug, ACRONYMS[slug]);
  }

  return [...labelBySlug.entries()]
    .map(([slug, label]) => ({
      slug,
      label,
      posts: posts.filter((p) => p.data.tags.some((t) => slugifyTag(t) === slug)),
    }))
    .sort((a, b) => b.posts.length - a.posts.length || a.label.localeCompare(b.label));
}
