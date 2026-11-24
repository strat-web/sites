import type { APIRoute } from 'astro';
import { generateOpenGraphImage } from 'astro-og-canvas';
import { ogOptions } from '@horus/seo';
import { SITE } from '../consts';

// Imagem OG padrão (1200x630) para páginas sem capa própria (home, /sobre etc.).
// Gerada no build com a mesma identidade das OGs por-post.
export const GET: APIRoute = async () => {
  const png = await generateOpenGraphImage(ogOptions(SITE.name, SITE.description));
  return new Response(new Uint8Array(png), {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
