// Leitura do HTML gerado pelo Astro. O HTML de saída é do próprio kit (atributos entre aspas, sem template), então
// expressões regulares bastam e não precisamos de um parser como dependência.

const decodificar = (t) =>
  String(t)
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&');

const semTags = (t) => decodificar(String(t).replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();

/** Atributos de uma tag de abertura: { nome: valor } (atributo sem valor vira ''). */
export function atributos(tag) {
  const attrs = {};
  const corpo = tag.replace(/^<[a-z0-9-]+/i, '').replace(/\/?>$/, '');
  for (const m of corpo.matchAll(/([^\s=/>]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s>]+)))?/g)) {
    attrs[m[1].toLowerCase()] = decodificar(m[3] ?? m[4] ?? m[5] ?? '');
  }
  return attrs;
}

/** O HTML sem o conteúdo de <script> e <style> (as tags ficam): o que está dentro deles não é marcação. */
export const marcacao = (html) =>
  html.replace(/(<script\b[^>]*>)[\s\S]*?(<\/script>)/gi, '$1$2').replace(/(<style\b[^>]*>)[\s\S]*?(<\/style>)/gi, '$1$2');

/** Todas as tags de abertura de um elemento, com os atributos (fora de <script> e <style>). */
export function tags(html, nome) {
  return [...marcacao(html).matchAll(new RegExp(`<${nome}\\b[^>]*>`, 'gi'))].map((m) => ({ tag: m[0], attrs: atributos(m[0]) }));
}

/** <script>: atributos e conteúdo. */
export function scripts(html) {
  return [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].map((m) => ({
    attrs: atributos(`<script${m[1]}>`),
    conteudo: m[2],
  }));
}

/** Texto de cada ocorrência de um elemento (sem as tags internas). */
export function textos(html, nome) {
  return [...html.matchAll(new RegExp(`<${nome}\\b[^>]*>([\\s\\S]*?)<\\/${nome}>`, 'gi'))].map((m) => semTags(m[1]));
}

/** O que a checagem de SEO e a de links precisam de uma página. */
export function lerPagina(html) {
  const metas = tags(html, 'meta');
  const meta = (nome) => metas.find((t) => (t.attrs.name || '').toLowerCase() === nome)?.attrs.content;
  const robots = (meta('robots') || '').toLowerCase();
  const canonical = tags(html, 'link').find((t) => (t.attrs.rel || '').toLowerCase().split(/\s+/).includes('canonical'));
  return {
    titulos: textos(html, 'title'),
    h1s: textos(html, 'h1'),
    canonical: canonical?.attrs.href,
    noindex: /\b(noindex|none)\b/.test(robots),
    scripts: scripts(html),
    ids: new Set([...marcacao(html).matchAll(/\s(?:id|name)\s*=\s*"([^"]+)"/gi)].map((m) => m[1])),
  };
}

/**
 * Endereços que a página referencia: links, imagens, scripts, folhas de estilo, fontes e mídia.
 * Devolve { tipo, valor } (tipo = a | recurso), na ordem do HTML.
 */
export function enderecos(html) {
  const lista = [];
  for (const { attrs } of tags(html, 'a')) if ('href' in attrs) lista.push({ tipo: 'a', valor: attrs.href });
  for (const { attrs } of tags(html, 'link')) {
    const rel = (attrs.rel || '').toLowerCase();
    if (attrs.href && !/\b(canonical|alternate|preconnect|dns-prefetch)\b/.test(rel)) lista.push({ tipo: 'recurso', valor: attrs.href });
  }
  for (const nome of ['img', 'script', 'source', 'video', 'audio', 'iframe', 'track']) {
    for (const { attrs } of tags(html, nome)) {
      if (attrs.src) lista.push({ tipo: 'recurso', valor: attrs.src });
      if (attrs.poster) lista.push({ tipo: 'recurso', valor: attrs.poster });
      if (attrs.srcset) {
        for (const parte of attrs.srcset.split(',')) {
          const url = parte.trim().split(/\s+/)[0];
          if (url) lista.push({ tipo: 'recurso', valor: url });
        }
      }
    }
  }
  return lista;
}
