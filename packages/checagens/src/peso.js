// Checagem "peso" (docs/padroes.md, D1 do docs/checklist-publicar.md): até 1,5 MB por página e, no Lighthouse em
// celular (configuração padrão: Moto G Power, 4G lento simulado), performance ≥ 90, LCP ≤ 2,5 s e CLS ≤ 0,1.
//
// Os bytes contam o HTML e o que ele carrega do próprio build (CSS, JS, imagem, fonte, inclusive url() do CSS).
// O Lighthouse abre a página de verdade a partir do dist/ servido localmente, com os scripts do <Tracking> bloqueados
// (Rastro, MetricaaS, launcher da Hotmart e Umami): eles são obrigatórios em toda página, não mudam por PR e variam a
// cada medição (a página de venda oscilou entre 89 e 93 só por eles, 11/11/2026). Qualquer outro script de terceiro
// que a página puser continua medido. O custo do tracking e o número de manchete ficam com o PageSpeed em produção.
//
// Página que sai sozinha para outro domínio (a confirmação da comunidade e o grupo do bootcamp abrem o WhatsApp depois
// de 1,8 s) faria o Lighthouse medir o destino: em 18/11/2026 a comunidade deu 79 e LCP 4,3 s com o
// chat.whatsapp.com como página final, e 100 e 1,4 s medindo só ela. Por isso a navegação da aba principal para outra
// origem recebe 204 (o navegador fica na página) e o log diz para onde ela tentou sair (WEB-48).
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { pipeline } from 'node:stream';
import { createGzip } from 'node:zlib';
import { extname, join, normalize } from 'node:path';
import { ehPaginaDeErro } from './contexto.js';
import { enderecos } from './html.js';
import { resultado } from './resultado.js';
import { EXCECOES_LIGHTHOUSE } from './excecoes-peso.js';

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

const COMPRESSIVEIS = new Set(['.html', '.css', '.js', '.mjs', '.json', '.svg', '.txt', '.xml']);

function aceitaGzip(cabecalho = '') {
  const codificacoes = cabecalho.toLowerCase().split(',').map((parte) => {
    const [nome, ...parametros] = parte.trim().split(';');
    const q = parametros.find((p) => p.trim().startsWith('q='));
    return { nome, qualidade: q ? Number(q.trim().slice(2)) : 1 };
  });
  return (codificacoes.find((c) => c.nome === 'gzip') ?? codificacoes.find((c) => c.nome === '*'))?.qualidade > 0;
}

/** Servidor estático do dist/ com gzip negociado, aproximando a transferência do Pages. */
export function servirDist(dist) {
  const servidor = createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (p.endsWith('/')) p += 'index.html';
    const f = join(dist, normalize(p));
    if (!f.startsWith(dist) || !ehArquivo(f)) {
      res.writeHead(404).end();
      return;
    }
    const extensao = extname(f).toLowerCase();
    const compressivel = COMPRESSIVEIS.has(extensao);
    const comprimir = compressivel && aceitaGzip(req.headers['accept-encoding']);
    const cabecalhos = { 'content-type': TIPOS[extensao] || 'application/octet-stream' };
    if (compressivel) cabecalhos.vary = 'Accept-Encoding';
    if (comprimir) cabecalhos['content-encoding'] = 'gzip';
    res.writeHead(200, cabecalhos);
    if (req.method === 'HEAD') {
      res.end();
      return;
    }
    // Imagens, fontes e vídeos já comprimidos seguem intactos; o orçamento de bytes continua sem compressão.
    const fluxos = [createReadStream(f), ...(comprimir ? [createGzip()] : []), res];
    pipeline(...fluxos, (erro) => { if (erro) res.destroy(erro); });
  });
  return new Promise((ok) => servidor.listen(0, '127.0.0.1', () => ok({ servidor, porta: servidor.address().port })));
}

/**
 * A navegação da aba principal para outra origem não é a página: no Lighthouse ela recebe 204 e o navegador fica
 * onde está (ver o topo do arquivo). Subrecurso de outro domínio e navegação dentro da página continuam normais.
 */
export function ehSaidaExterna(urlDaPagina, urlDoPedido, navegacaoPrincipal) {
  if (!navegacaoPrincipal) return false;
  try {
    return new URL(urlDoPedido).origin !== new URL(urlDaPagina).origin;
  } catch {
    return false;
  }
}

// A interceptação só liga quando a página sai sozinha: com ela, todo pedido passa pelo puppeteer, e o Lighthouse, que
// estima o LCP pelo tempo de rede de cada origem, infla as imagens de fora (em 19/11 a home do MetricaaS, com quatro
// miniaturas do YouTube, foi de 99 e 2,0 s para 91 e 3,5 s na CI). A página que não sai é medida como antes do WEB-48.
async function medirComLighthouse(url, navegador, { interceptar = false } = {}) {
  const { default: lighthouse } = await import('lighthouse');
  const aba = await navegador.newPage();
  const saidas = new Set();
  try {
    if (interceptar) {
      await aba.setRequestInterception(true);
      aba.on('request', (pedido) => {
        if (pedido.isInterceptResolutionHandled()) return;
        const principal = pedido.isNavigationRequest() && pedido.frame() === aba.mainFrame();
        if (ehSaidaExterna(url, pedido.url(), principal)) {
          saidas.add(new URL(pedido.url()).host);
          pedido.respond({ status: 204, body: '' });
        } else pedido.continue();
      });
    }
    const { lhr } = await lighthouse(url, {
      onlyCategories: ['performance'],
      blockedUrlPatterns: BLOQUEADOS_NO_LIGHTHOUSE,
      logLevel: 'error',
      output: 'json',
    }, undefined, aba);
    if (lhr.runtimeError) throw new Error(lhr.runtimeError.message);
    return {
      performance: Math.round((lhr.categories.performance.score ?? 0) * 100),
      lcpMs: Math.round(lhr.audits['largest-contentful-paint']?.numericValue ?? Infinity),
      cls: Number((lhr.audits['cumulative-layout-shift']?.numericValue ?? Infinity).toFixed(3)),
      saidas: [...saidas],
      saiu: !interceptar && ehSaidaExterna(url, lhr.finalDisplayedUrl || lhr.finalUrl || url, true),
    };
  } finally {
    await aba.close();
  }
}

/** Mede sem interceptar; se a página saiu para outro domínio (ou o Lighthouse quebrou na saída), mede de novo com a
 * saída presa na página. */
async function medirPagina(url, navegador) {
  let m;
  try {
    m = await medirComLighthouse(url, navegador);
  } catch {
    m = { saiu: true };
  }
  return m.saiu ? medirComLighthouse(url, navegador, { interceptar: true }) : m;
}

const dentro = (m, o) => m.performance >= o.performance && m.lcpMs <= o.lcpMs && m.cls <= o.cls;
const passa = (m) => dentro(m, ORCAMENTO);

/**
 * Julga uma medição do Lighthouse: 'ok' dentro do orçamento; 'aviso' para página de excecoes-peso.js abaixo do
 * orçamento mas acima do piso dela (o número da página no ar); 'erro' no resto.
 */
export function julgarMedicao(url, m, excecoes = EXCECOES_LIGHTHOUSE) {
  if (passa(m)) return 'ok';
  const exc = excecoes[url];
  return exc && dentro(m, exc.piso) ? 'aviso' : 'erro';
}

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
  const { default: puppeteer } = await import('puppeteer-core');
  const chrome = await launch({ chromeFlags: ['--headless=new', '--no-sandbox', '--disable-gpu'] });
  let navegador;
  try {
    navegador = await puppeteer.connect({ browserURL: `http://127.0.0.1:${chrome.port}` });
    for (const app of ctx.apps) {
      const { servidor, porta } = await servirDist(app.dist);
      try {
        for (const pagina of app.paginas) {
          if (ehPaginaDeErro(pagina)) continue;
          const url = `http://127.0.0.1:${porta}${pagina.caminho}`;
          let m;
          try {
            m = await medirPagina(url, navegador);
            if (julgarMedicao(pagina.url, m) !== 'ok') m = await medirPagina(url, navegador); // uma segunda medição antes de barrar
          } catch (e) {
            r.erro(pagina.url, `o Lighthouse não conseguiu medir: ${e.message}`);
            continue;
          }
          const saida = m.saidas.length ? ` (a página sai para ${m.saidas.join(', ')}: medida sem o destino)` : '';
          const texto = `performance ${m.performance}, LCP ${(m.lcpMs / 1000).toFixed(1)} s, CLS ${m.cls}${saida}`;
          const juizo = julgarMedicao(pagina.url, m);
          const exc = EXCECOES_LIGHTHOUSE[pagina.url];
          if (juizo === 'ok') log(`${pagina.url}: ${texto}`);
          else if (juizo === 'aviso') r.aviso(pagina.url, `${texto}: abaixo do orçamento, acima do piso da exceção (${exc.motivo})`);
          else if (exc) r.erro(pagina.url, `${texto}: pior que o piso da exceção em excecoes-peso.js (performance ≥ ${exc.piso.performance}, LCP ≤ ${(exc.piso.lcpMs / 1000).toFixed(1)} s)`);
          else r.erro(pagina.url, `${texto}: o orçamento é performance ≥ 90, LCP ≤ 2,5 s e CLS ≤ 0,1 (celular)`);
        }
      } finally {
        servidor.close();
      }
    }
  } finally {
    await navegador?.disconnect();
    await chrome.kill();
  }
  return r;
}
