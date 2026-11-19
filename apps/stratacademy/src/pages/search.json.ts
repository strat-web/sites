import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { naListagem } from '@strat/conteudo';

// Índice de busca estático: título, descrição, tags, autor e trecho do corpo.
// Consumido client-side por /buscar — funciona em dev e em produção, sem backend.
export const GET: APIRoute = async () => {
  const posts = (await getCollection('blog', ({ data }) => naListagem(data))).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );

  const index = posts.map((p) => ({
    id: p.id,
    title: p.data.title,
    description: p.data.description,
    author: p.data.author,
    tags: p.data.tags,
    date: p.data.pubDate.toISOString(),
    body: (p.body ?? '')
      .replace(/[#>*`_\[\]()!-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 800),
  }));

  return new Response(JSON.stringify(index), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
};
