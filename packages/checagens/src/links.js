// Checagem "links": link interno quebrado. Interno = caminho que começa com "/", caminho relativo ou URL absoluta
// no domínio do próprio app. Âncora (#id) tem de achar o id na página. Link para outro domínio fica de fora.
import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { ehPaginaDeErro } from './contexto.js';
import { enderecos, lerPagina } from './html.js';
import { resultado } from './resultado.js';

// Caminhos servidos por fora do build: o proxy /u/ do Umami é do Strat Tracking (docs/tracking.md).
const DE_FORA_DO_BUILD = [/^\/u\//];

const ehArquivo = (f) => existsSync(f) && statSync(f).isFile();

/** Resolve um caminho público para o arquivo no dist/. Devolve { ok, semBarra }. */
export function resolverNoDist(dist, caminho) {
  let p;
  try {
    p = decodeURI(caminho);
  } catch {
    p = caminho;
  }
  if (p.endsWith('/')) return { ok: ehArquivo(join(dist, p, 'index.html')) };
  if (ehArquivo(join(dist, p))) return { ok: true };
  if (ehArquivo(join(dist, p, 'index.html'))) return { ok: false, semBarra: true };
  return { ok: false };
}

export function checarLinks(ctx) {
  const r = resultado();
  for (const app of ctx.apps) {
    const host = app.site && new URL(app.site).host;
    for (const pagina of app.paginas) {
      if (ehPaginaDeErro(pagina)) continue;
      const { ids } = lerPagina(pagina.html);
      const base = new URL(pagina.caminho, app.site || 'https://localhost');
      const vistos = new Set();
      for (const { valor } of enderecos(pagina.html)) {
        const bruto = valor.trim();
        if (!bruto || bruto === '#' || vistos.has(bruto)) continue; // href="#" é da checagem seo
        vistos.add(bruto);
        if (bruto.startsWith('#')) {
          const id = decodeURIComponent(bruto.slice(1));
          if (!ids.has(id)) r.erro(pagina.url, `âncora "${bruto}" sem elemento com id="${id}" na página`);
          continue;
        }
        if (/^[a-z][a-z0-9+.-]*:/i.test(bruto) && !/^https?:/i.test(bruto)) continue; // mailto:, tel:, data:
        if (bruto.startsWith('//')) continue;
        let u;
        try {
          u = new URL(bruto, base);
        } catch {
          r.erro(pagina.url, `endereço inválido: "${bruto}"`);
          continue;
        }
        if (u.host !== base.host || (host && u.host !== host)) continue; // outro domínio
        if (DE_FORA_DO_BUILD.some((re) => re.test(u.pathname))) continue;
        const { ok, semBarra } = resolverNoDist(app.dist, u.pathname);
        if (ok) {
          if (u.hash && u.pathname === base.pathname && !ids.has(decodeURIComponent(u.hash.slice(1)))) {
            r.erro(pagina.url, `âncora "${u.hash}" sem elemento com esse id na página`);
          }
          continue;
        }
        if (semBarra) r.aviso(pagina.url, `"${bruto}" sem barra no fim: a página existe em ${u.pathname}/ (o link passa por um redirecionamento)`);
        else r.erro(pagina.url, `link interno quebrado: "${bruto}" (não existe ${u.pathname} no build de ${app.app})`);
      }
    }
  }
  return r;
}
