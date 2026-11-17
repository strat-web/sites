// Slug de tag/categoria: minúsculo, sem acentos, espaços -> hífen. "Negócios" -> "negocios".
export function slugifyTag(tag: string): string {
  return tag
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
