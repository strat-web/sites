// Checagem "peso" (docs/padroes.md, D1 do docs/checklist-publicar.md): até 1,5 MB por página e, no Lighthouse em
// celular (configuração padrão: Moto G Power, 4G lento simulado), performance ≥ 90, LCP ≤ 2,5 s e CLS ≤ 0,1.
//
// Os bytes contam o HTML e o que ele carrega do próprio build (CSS, JS, imagem, fonte, inclusive url() do CSS).
// O Lighthouse abre a página de verdade a partir do dist/ servido localmente, com os scripts do <Tracking> bloqueados
// (Rastro, MetricaaS, launcher da Hotmart e Umami): eles são obrigatórios em toda página, não mudam por PR e variam a
// cada medição (a página de venda oscilou entre 89 e 93 só por eles, 11/11/2026). Qualquer outro script de terceiro
// que a página puser continua medido. O custo do tracking e o número de manchete ficam com o PageSpeed em produção.
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize } from 'node:path';
import { ehPaginaDeErro } from './contexto.js';
import { enderecos } from './html.js';
import { resultado } from './resultado.js';

export const ORCAMENTO = { bytes: 1_500_000, performance: 90, lcpMs: 2500, cls: 0.1 };

// Scripts do <Tracking> do kit, bloqueados só no Lighthouse da CI (ver o topo do arquivo).
export const BLOQUEADOS_NO_LIGHTHOUSE = ['*tracking.stratacademy.com.br/*', '*t.metricaas.com.br/*', '*launcher.hotmart.com/*', '*/u/script.js*'];

const ehArquivo = (f) => existsSync(f) && statSync(f).isFile();

function arquivoLocal(dist, base, endereco) {
  if (/^(data:|blob:|#)/i.test(endereco)) return undefined;
  let u;
  try {
    u = new URL(endereco, base);
  } catch {
    return undefined;
  }
  if (u.host !== base.host) return undefined;
  let p = decodeURIComponent(u.pathname);
  if (p.endsWith('/')) p += 'index.html';
  const f = join(dist, normalize(p));
  return f.startsWith(dist) && ehArquivo(f) ? f : undefined;
}

/** Bytes da página: HTML + recursos locais (únicos), seguindo url() dos CSS locais. */
export function bytesDaPagina(app, pagina) {
  const base = new URL(pagina.caminho, app.site || 'https://localhost');
  const vistos = new Set();
  let total = Buffer.byteLength(pagina.html);
  const fila = enderecos(pagina.html)
    .filter((e) => e.tipo === 'recurso')
    .map((e) => ({ valor: e.valor, base }));
  while (fila.length) {
    const { valor, base: b } = fila.shift();
    const f = arquivoLocal(app.dist, b, valor);
    if (!f || vistos.has(f)) continue;
    vistos.add(f);
    total += statSync(f).size;
    if (f.endsWith('.css')) {
      const css = readFileSync(f, 'utf8');
      const baseCss = new URL(f.slice(app.dist.length).split('\\').join('/'), b);
      for (const m of css.matchAll(/url\(\s*['"]?([^'")]+)['"]?\s*\)/g)) fila.push({ valor: m[1], base: baseCss });
    }
  }
  return total;
}

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.mjs': 'text/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
};

/** Servidor estático do dist/ (como o Pages: pasta → index.html). */
export function servirDist(dist) {
  const servidor = createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const f = join(dist, normalize(p));
    if (!f.startsWith(dist) || !ehArquivo(f)) {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, { 'content-type': TIPOS[extname(f).toLowerCase()] || 'application/octet-stream' });
    createReadStream(f).pipe(res);
  });
  return new Promise((ok) => servidor.listen(0, '127.0.0.1', () => ok({ servidor, porta: servidor.address().port })));
}

async function medirComLighthouse(url, porta) {
  const { default: lighthouse } = await import('lighthouse');
  const { lhr } = await lighthouse(url, {
    port: porta,
    onlyCategories: ['performance'],
    blockedUrlPatterns: BLOQUEADOS_NO_LIGHTHOUSE,
    logLevel: 'error',
    output: 'json',
  });
  if (lhr.runtimeError) throw new Error(lhr.runtimeError.message);
  return {
    performance: Math.round((lhr.categories.performance.score ?? 0) * 100),
    lcpMs: Math.round(lhr.audits['largest-contentful-paint']?.numericValue ?? Infinity),
    cls: Number((lhr.audits['cumulative-layout-shift']?.numericValue ?? Infinity).toFixed(3)),
  };
}

const passa = (m) => m.performance >= ORCAMENTO.performance && m.lcpMs <= ORCAMENTO.lcpMs && m.cls <= ORCAMENTO.cls;

export async function checarPeso(ctx, { semLighthouse = false, log = () => {} } = {}) {
  const r = resultado();
  for (const app of ctx.apps) {
    for (const pagina of app.paginas) {
      if (ehPaginaDeErro(pagina)) continue;
      const bytes = bytesDaPagina(app, pagina);
      const kb = Math.round(bytes / 1000);
      if (bytes > ORCAMENTO.bytes) r.erro(pagina.url, `${kb} KB: acima de 1,5 MB (HTML + recursos do build)`);
      else log(`${pagina.url}: ${kb} KB`);
    }
  }
  if (semLighthouse) {
    r.aviso('Lighthouse', 'não rodou (--sem-lighthouse): performance, LCP e CLS não conferidos');
    return r;
  }

  const { launch } = await import('chrome-launcher');
  const chrome = await launch({ chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'] });
  try {
    for (const app of ctx.apps) {
      const { servidor, porta } = await servirDist(app.dist);
      try {
        for (const pagina of app.paginas) {
          if (ehPaginaDeErro(pagina)) continue;
          const url = `http://127.0.0.1:${porta}${pagina.caminho}`;
          let m;
          try {
            m = await medirComLighthouse(url, chrome.port);
            if (!passa(m)) m = await medirComLighthouse(url, chrome.port); // uma segunda medição antes de barrar
          } catch (e) {
            r.erro(pagina.url, `o Lighthouse não conseguiu medir: ${e.message}`);
            continue;
          }
          const texto = `performance ${m.performance}, LCP ${(m.lcpMs / 1000).toFixed(1)} s, CLS ${m.cls}`;
          if (passa(m)) log(`${pagina.url}: ${texto}`);
          else r.erro(pagina.url, `${texto}: o orçamento é performance ≥ 90, LCP ≤ 2,5 s e CLS ≤ 0,1 (celular)`);
        }
      } finally {
        servidor.close();
      }
    }
  } finally {
    await chrome.kill();
  }
  return r;
}
