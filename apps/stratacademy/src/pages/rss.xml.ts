import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { SITE } from '../consts';
import { withBase } from '@horus/seo';
import { naListagem } from '@strat/conteudo';

export async function GET(context) {
  const posts = await getCollection('blog', ({ data }) => naListagem(data));
  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site,
    items: posts
      .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf())
      .map((p) => ({
        title: p.data.title,
        description: p.data.description,
        pubDate: p.data.pubDate,
        link: withBase(`/blog/${p.id}/`),
      })),
  });
}
