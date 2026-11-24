// O documento do modelo, em JSON estático.
//
// O editor baixa este arquivo quando alguém abre a folha com `?modelo=<slug>`.
// Assim o modelo não vai embutido no JavaScript da página: quem só lê a folha
// não paga o peso dos três funis.
import type { APIRoute } from 'astro';
import { MODELOS_CONSTRUTOR } from '../../../../data/ferramentas';

export function getStaticPaths() {
  return MODELOS_CONSTRUTOR.map((modelo) => ({ params: { slug: modelo.slug }, props: { modelo } }));
}

export const GET: APIRoute = ({ props }) => {
  const { modelo } = props as { modelo: (typeof MODELOS_CONSTRUTOR)[number] };
  return new Response(JSON.stringify(modelo.documento), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
