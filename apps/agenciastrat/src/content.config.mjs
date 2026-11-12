import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { blogSchema } from '@strat/conteudo';

// Blog com o schema do pacote (WEB-19, docs/blog.md). O autor padrão é a config da marca, que fica no app.
const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) => blogSchema(z, image, { autorPadrao: 'Equipe Agência Strat' }),
});

export const collections = { blog };
