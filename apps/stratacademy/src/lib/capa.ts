// URL da foto de capa de um post, venha o `cover` como imagem local (astro:assets)
// ou como URL absoluta do R2 do site. Sem `cover`, undefined e o card desenha a capa geométrica.
export function fotoDaCapa(cover: string | { src: string } | undefined): string | undefined {
  if (!cover) return undefined;
  return typeof cover === 'string' ? cover : cover.src;
}
