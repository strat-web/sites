// Página 404 de cada app (WEB-75). O Cloudflare Pages serve o 404.html da raiz, com status 404, em qualquer caminho
// que não existe no build; sem ele, o Pages responde 200 com a home e o Google trata como soft 404.
//
// A 404 lista a home e as páginas principais do site. Cada app escreve a lista inteira uma vez (nome e caminho); o
// componente <PaginaNaoEncontrada> mostra só o que já existe no build, então uma página migrada depois aparece sozinha
// na 404, e uma que ainda não foi migrada nunca vira link quebrado. A regra mora aqui para ser testada sem o Astro.

const EXTENSOES = /\.(astro|md|mdx|html)$/;

/**
 * Rota pública de um arquivo de src/pages, como o import.meta.glob devolve:
 * '/src/pages/index.astro' → '/', '/src/pages/raio-x/index.astro' → '/raio-x/', '/src/pages/guias.md' → '/guias/'.
 * Rota dinâmica ([slug]), arquivo que começa com "_" e as páginas de erro (404, 500) devolvem undefined.
 */
export function rotaDoArquivo(arquivo) {
  const m = String(arquivo).match(/(?:^|\/)src\/pages\/(.*)$/);
  const rel = (m ? m[1] : String(arquivo).replace(/^\.?\//, '')).replace(/\\/g, '/');
  if (!EXTENSOES.test(rel)) return undefined;
  const partes = rel.replace(EXTENSOES, '').split('/');
  if (partes.some((p) => p.startsWith('_') || p.includes('['))) return undefined;
  if (partes.at(-1) === 'index') partes.pop();
  if (partes.length === 1 && /^(404|500)$/.test(partes[0])) return undefined;
  return partes.length ? `/${partes.join('/')}/` : '/';
}

/**
 * Filtra os links da 404: `{ nome, caminho }`. Caminho do próprio site começa com "/" (a 404 é servida em qualquer
 * caminho, então endereço relativo quebraria) e só entra se a página existe em `arquivos` (chaves do
 * import.meta.glob de src/pages). Link para outro domínio (https://) entra como está.
 */
export function linksDaPaginaDeErro(links, arquivos) {
  const rotas = new Set(arquivos.map(rotaDoArquivo).filter(Boolean));
  return links.filter(({ nome, caminho }) => {
    if (!nome?.trim()) throw new Error(`[kit] PaginaNaoEncontrada: link sem nome (${caminho})`);
    if (/^https:\/\//.test(caminho)) return true;
    if (!caminho?.startsWith('/') || caminho.startsWith('//')) {
      throw new Error(`[kit] PaginaNaoEncontrada: "${caminho}" tem de começar com "/" (a 404 é servida em qualquer caminho) ou ser https://`);
    }
    return rotas.has(caminho.replace(/[?#].*$/, '').replace(/\/?$/, '/'));
  });
}
