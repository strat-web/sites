// checar-posts: valida os posts do blog de um app antes do merge (WEB-19).
// Veio de horus/apps/stratacademy/scripts/checar-posts.mjs, agora igual para os quatro apps.
//
// O build do Astro já reprova frontmatter fora do schema. Aqui fica o que o schema NÃO vê: H1 no corpo, link para
// rota removida, para post que não existe ou que não vai ao ar, post órfão sem link interno, artigo sem H2 e post de
// teste sem noindex. O que é de cada app (rotas removidas, rotas que saem de dados) mora no conteudo.config.json do app.

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { LIMITES } from './schema.js';

export const CONFIG_PADRAO = Object.freeze({
  posts: 'src/content/blog',
  paginas: 'src/pages',
  publico: 'public',
  prefixoBlog: '/blog',
  // Rotas que saíram do ar: linkar para elas custa um salto de 301 à toa.
  rotasMortas: [],
  // Rotas que existem mas não saem de arquivo em src/pages (ex.: folhas geradas de dados).
  rotasExtras: [],
  // Prefixos de rota dinâmica além dos que o [slug].astro já revela.
  prefixosDinamicos: [],
});

const EXTENSOES_POST = /\.(md|mdx)$/;
const KEBAB = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Rota sem barra no fim, sem query e sem âncora: a forma usada para comparar. */
export const normalizarRota = (rota) => rota.split('#')[0].split('?')[0].replace(/\/+$/, '') || '/';

const tiraAspas = (v) => {
  const t = v.trim();
  if (t.length >= 2 && t.startsWith('"') && t.endsWith('"')) return t.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
  if (t.length >= 2 && t.startsWith("'") && t.endsWith("'")) return t.slice(1, -1).replace(/''/g, "'");
  return t.replace(/\s+#.*$/, '');
};

/**
 * Lê o frontmatter YAML de um post: só as chaves de primeiro nível com valor de uma linha ou em bloco (`>` e `|`).
 * Listas e objetos (tags, faq) ficam como `true`, que basta para saber que existem. Devolve também o corpo.
 */
export function lerFrontmatter(md) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/.exec(md);
  if (!m) return { dados: {}, corpo: md, temFrontmatter: false };
  const linhas = m[1].split(/\r?\n/);
  const dados = {};
  for (let i = 0; i < linhas.length; i++) {
    const chave = /^([A-Za-z_][\w-]*):\s?(.*)$/.exec(linhas[i]);
    if (!chave) continue;
    const [, nome, bruto] = chave;
    const valor = bruto.trim();
    if (['', '>', '>-', '|', '|-'].includes(valor)) {
      const bloco = [];
      while (i + 1 < linhas.length && /^\s+\S/.test(linhas[i + 1])) bloco.push(linhas[++i].trim());
      if (valor === '' && bloco.length) dados[nome] = true;
      else if (valor === '') dados[nome] = '';
      else dados[nome] = bloco.join(valor.startsWith('>') ? ' ' : '\n');
      continue;
    }
    const texto = tiraAspas(valor);
    dados[nome] = texto === 'true' ? true : texto === 'false' ? false : texto;
  }
  return { dados, corpo: md.slice(m[0].length), temFrontmatter: true };
}

/**
 * Rotas que o app gera, a partir de src/pages e public/.
 * @returns {{ rotas: Set<string>, prefixosDinamicos: Set<string> }}
 */
export function lerRotas(dirPaginas, dirPublico) {
  const rotas = new Set(['/']);
  const prefixosDinamicos = new Set();
  const varrer = (dir, prefixo) => {
    if (!existsSync(dir)) return;
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      if (item.name.startsWith('_') || item.name.startsWith('.')) continue; // o Astro ignora _arquivo
      if (item.isDirectory()) {
        varrer(join(dir, item.name), `${prefixo}/${item.name}`);
        continue;
      }
      const pagina = /^(.+)\.(astro|md|mdx|html)$/.exec(item.name);
      const endpoint = /^(.+\.[a-z0-9]+)\.(js|ts|mjs|mts)$/.exec(item.name); // ex.: rss.xml.js
      const nome = pagina?.[1] ?? endpoint?.[1];
      if (!nome) continue;
      if (nome.startsWith('[...')) continue; // rota coringa: não dá para validar aqui
      if (nome.startsWith('[')) {
        prefixosDinamicos.add(prefixo || '/');
        continue;
      }
      rotas.add(nome === 'index' ? prefixo || '/' : `${prefixo}/${nome}`);
    }
  };
  varrer(dirPaginas, '');
  const varrerPublico = (dir, prefixo) => {
    if (!existsSync(dir)) return;
    for (const item of readdirSync(dir, { withFileTypes: true })) {
      if (item.isDirectory()) varrerPublico(join(dir, item.name), `${prefixo}/${item.name}`);
      else rotas.add(`${prefixo}/${item.name}`);
    }
  };
  varrerPublico(dirPublico, '');
  return { rotas, prefixosDinamicos };
}

/**
 * Regras do checar-posts, sem disco: recebe os posts e as rotas e devolve erros e avisos.
 * @param {{ posts: { slug: string, conteudo: string }[], rotas?: Iterable<string>, prefixosDinamicos?: Iterable<string>,
 *   rotasMortas?: string[], prefixoBlog?: string }} entrada
 */
export function checarPosts({ posts, rotas = ['/'], prefixosDinamicos = [], rotasMortas = [], prefixoBlog = '/blog' }) {
  const erros = [];
  const avisos = [];
  const reais = new Set([...rotas].map(normalizarRota));
  const dinamicos = new Set([...prefixosDinamicos].map(normalizarRota));
  const mortas = new Set(rotasMortas.map(normalizarRota));
  const blog = normalizarRota(prefixoBlog);

  const lidos = posts.map((p) => ({ ...p, ...lerFrontmatter(p.conteudo) }));
  const porSlug = new Map(lidos.map((p) => [p.slug, p]));

  const rotaDinamica = (rota) => {
    const i = rota.lastIndexOf('/');
    return dinamicos.has(rota.slice(0, i) || '/') && KEBAB.test(rota.slice(i + 1));
  };

  for (const post of lidos) {
    const onde = `${blog.replace(/^\//, '')}/${post.slug}`;
    const { dados } = post;
    const draft = dados.draft === true;
    const teste = dados.teste === true;
    const publica = !draft && !teste;

    if (!post.temFrontmatter) erros.push(`${onde}: sem frontmatter`);

    const titulo = typeof dados.title === 'string' ? dados.title : undefined;
    if (!titulo) erros.push(`${onde}: sem title`);
    else if (titulo.length > LIMITES.titulo) erros.push(`${onde}: title com ${titulo.length} caracteres (máx. ${LIMITES.titulo})`);
    else if (titulo.length > LIMITES.tituloBusca)
      avisos.push(`${onde}: title com ${titulo.length} caracteres; acima de ${LIMITES.tituloBusca} o Google corta o título na busca`);

    const desc = typeof dados.description === 'string' ? dados.description : undefined;
    if (!desc) erros.push(`${onde}: sem description`);
    else if (desc.length < LIMITES.descricaoMin || desc.length > LIMITES.descricaoMax)
      erros.push(`${onde}: description com ${desc.length} caracteres (precisa de ${LIMITES.descricaoMin} a ${LIMITES.descricaoMax})`);

    if (teste && dados.noindex !== true) erros.push(`${onde}: post de teste sem noindex: true`);

    // Fora dos blocos de código: '# algo' dentro de ``` é comentário de shell ou exemplo de markdown, não H1.
    const semCodigo = post.corpo.replace(/```[\s\S]*?```/g, '').replace(/~~~[\s\S]*?~~~/g, '').replace(/`[^`\r\n]*`/g, '');

    const links = [...semCodigo.matchAll(/\]\((\/[^)\s]*)(?:\s+"[^"]*")?\)/g)].map((m) => m[1]);
    for (const l of links) {
      if (l.startsWith('//')) continue; // URL de outro domínio sem protocolo
      const limpo = normalizarRota(l);
      const ultimo = limpo.slice(limpo.lastIndexOf('/') + 1);
      const ehArquivo = ultimo.includes('.');
      const caminho = l.split('#')[0].split('?')[0];

      if (mortas.has(limpo)) {
        erros.push(`${onde}: link para rota removida ${l}`);
        continue;
      }
      if (limpo.startsWith(`${blog}/`) && blog !== '/') {
        const alvo = limpo.slice(blog.length + 1);
        const destino = porSlug.get(alvo);
        if (!destino) erros.push(`${onde}: link para post inexistente ${l}`);
        else if (publica && (destino.dados.draft === true || destino.dados.teste === true))
          erros.push(`${onde}: link para post que não vai ao ar (rascunho ou teste) ${l}`);
      } else if (!reais.has(limpo) && !rotaDinamica(limpo)) {
        avisos.push(`${onde}: link ${l} não bate com nenhuma rota conhecida`);
      }
      if (!ehArquivo && caminho !== '/' && !caminho.endsWith('/'))
        avisos.push(`${onde}: link ${l} sem barra no fim (docs/padroes.md: URL sempre com barra)`);
    }

    if (publica && !links.some((l) => normalizarRota(l).startsWith(`${blog}/`)))
      avisos.push(`${onde}: nenhum link para outro post; o cluster não se forma sozinho`);

    if (!/^##\s/m.test(semCodigo)) avisos.push(`${onde}: sem H2; o artigo fica sem sumário`);
    if (/^#\s/m.test(semCodigo)) erros.push(`${onde}: tem H1 no corpo (o título já vem do frontmatter)`);
  }

  return { verificados: posts.length, erros, avisos };
}

/** Lê o conteudo.config.json do app (opcional) por cima do padrão. */
export function lerConfig(dirApp) {
  const arquivo = join(dirApp, 'conteudo.config.json');
  if (!existsSync(arquivo)) return { ...CONFIG_PADRAO };
  const proprio = JSON.parse(readFileSync(arquivo, 'utf8'));
  const desconhecidas = Object.keys(proprio).filter((k) => !(k in CONFIG_PADRAO) && !k.startsWith('$'));
  if (desconhecidas.length) throw new Error(`conteudo.config.json: chave desconhecida ${desconhecidas.join(', ')}`);
  return { ...CONFIG_PADRAO, ...proprio };
}

/** Lê os posts do app (subpastas incluídas); o slug é o caminho sem a extensão, como no glob do Astro. */
export function lerPosts(dirPosts) {
  if (!existsSync(dirPosts)) return [];
  return readdirSync(dirPosts, { recursive: true, withFileTypes: true })
    .filter((f) => f.isFile() && EXTENSOES_POST.test(f.name) && !f.name.startsWith('_'))
    .map((f) => {
      const completo = join(f.parentPath ?? f.path, f.name);
      const slug = completo.slice(resolve(dirPosts).length + 1).replace(EXTENSOES_POST, '').split('\\').join('/');
      return { slug, conteudo: readFileSync(completo, 'utf8') };
    })
    .sort((a, b) => a.slug.localeCompare(b.slug));
}

/** Roda o checar-posts num app (pasta com src/content/blog e src/pages). */
export function checarApp(dirApp) {
  const raiz = resolve(dirApp);
  const config = lerConfig(raiz);
  const { rotas, prefixosDinamicos } = lerRotas(join(raiz, config.paginas), join(raiz, config.publico));
  for (const r of config.rotasExtras) rotas.add(r);
  for (const p of config.prefixosDinamicos) prefixosDinamicos.add(p);
  const resultado = checarPosts({
    posts: lerPosts(join(raiz, config.posts)),
    rotas,
    prefixosDinamicos,
    rotasMortas: config.rotasMortas,
    prefixoBlog: config.prefixoBlog,
  });
  return { app: basename(raiz), pastaPosts: config.posts, ...resultado };
}

/** Texto do relatório, no formato do script do horus. */
export function relatorio({ app, pastaPosts, verificados, erros, avisos }) {
  const linhas = [`\n${app}: posts verificados: ${verificados}${verificados ? '' : ` (nenhum em ${pastaPosts})`}`];
  if (erros.length) linhas.push(`\nERROS (${erros.length}):`, ...erros.map((e) => `  ✗ ${e}`));
  if (avisos.length) linhas.push(`\navisos (${avisos.length}):`, ...avisos.map((a) => `  ! ${a}`));
  if (!erros.length && !avisos.length) linhas.push('tudo certo.');
  return `${linhas.join('\n')}\n`;
}
