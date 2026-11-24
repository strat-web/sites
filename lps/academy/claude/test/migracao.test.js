// Migração da LP claude.stratacademy.com.br do strat-lps (lps/quaia) para o Pages (WEB-48): o HTML de cada versão mora
// em src/html/ e o kit põe o <head> de SEO e o <Tracking> perfil venda. Estes testes garantem que nada de tracking volte
// colado à mão, que as tags do kit não se repitam e que todo arquivo citado exista em public/, no caminho que o
// navegador vai pedir (as versões usam caminho relativo à própria pasta: /, /v1/, /v3/, /v4/).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP = join(dirname(fileURLToPath(import.meta.url)), '..');
const HTML = join(APP, 'src/html');
const PAGINAS = { home: '/', v1: '/v1/', v3: '/v3/', v4: '/v4/' };
const fragmentos = readdirSync(HTML).filter((f) => f.endsWith('.html'));
const ler = (f) => readFileSync(join(HTML, f), 'utf8');

test('as quatro versões têm head e corpo', () => {
  for (const p of Object.keys(PAGINAS)) {
    assert.ok(fragmentos.includes(`${p}.head.html`), `${p}.head.html`);
    assert.ok(fragmentos.includes(`${p}.corpo.html`), `${p}.corpo.html`);
  }
});

test('nenhum script de tracking ou da Hotmart colado no HTML: tudo vem do <Tracking> do kit', () => {
  const proibidos = [/tracking\.stratacademy\.com\.br\/sa/, /launcher\.hotmart\.com/, /hotmart_launcher_script/, /connect\.facebook\.net/, /googletagmanager/, /\bfbq\s*\(/, /\bgtag\s*\(/];
  for (const f of fragmentos) for (const re of proibidos) assert.doesNotMatch(ler(f), re, `${f}: ${re}`);
});

test('as tags que o kit gera não se repetem no head da página', () => {
  const doKit = [/<title>/, /name="description"/, /rel="canonical"/, /property="og:/, /name="twitter:card"/, /name="viewport"/, /charset=/, /name="robots"/];
  for (const f of fragmentos.filter((f) => f.endsWith('.head.html'))) for (const re of doKit) assert.doesNotMatch(ler(f), re, `${f}: ${re}`);
});

test('nenhum link sem destino (href="#")', () => {
  for (const f of fragmentos) assert.doesNotMatch(ler(f), /href="#"/, f);
});

test('o checkout continua na Hotmart, no mesmo produto', () => {
  for (const p of Object.keys(PAGINAS)) assert.match(ler(`${p}.corpo.html`), /https:\/\/pay\.hotmart\.com\/D104661280B/, p);
});

test('todo arquivo do próprio site citado nas páginas existe em public/', () => {
  for (const [p, base] of Object.entries(PAGINAS)) {
    const html = ler(`${p}.head.html`) + ler(`${p}.corpo.html`);
    const refs = [
      ...[...html.matchAll(/(?:src|href|data-thumb|poster)="([^"]+)"/g)].map((m) => m[1]),
      ...[...html.matchAll(/url\(['"]?([^'")]+)/g)].map((m) => m[1]),
    ];
    for (const r of refs) {
      if (/^(https?:|mailto:|tel:|data:|#|\/\/|%23)/.test(r) || !r.trim()) continue;
      const caminho = posix.normalize(r.startsWith('/') ? r : posix.join(base, r)).split(/[?#]/)[0];
      assert.ok(existsSync(join(APP, 'public', caminho)), `${p}: ${r} → public${caminho} não existe`);
    }
  }
});

test('a Clash Grotesk tem reserva com as métricas dela na home, na v1 e na v3 (sem salto do título; WEB-48)', () => {
  // O título pinta antes de a Clash chegar. Com a reserva do sistema (mais larga no Linux do PageSpeed), o H1 ganha
  // linhas e empurra o .hero-art quando a fonte troca (CLS 0,177). A reserva calibrada ocupa o mesmo espaço.
  for (const p of ['home', 'v1', 'v3']) {
    const head = ler(`${p}.head.html`);
    assert.match(head, /--font-display:\s*'Clash Grotesk', 'Clash Grotesk Reserva', 'Clash Grotesk Reserva Android',/, `${p}: pilha da fonte`);
    const faces = head.match(/@font-face\{font-family:'Clash Grotesk Reserva';[^}]+\}/g) || [];
    assert.equal(faces.length, 2, `${p}: reserva 600 e 700`);
    for (const f of faces) assert.match(f, /size-adjust:[\d.]+%;ascent-override:[\d.]+%;descent-override:[\d.]+%;line-gap-override:[\d.]+%/, `${p}: métricas`);
    // Android: Arial, Liberation e Arimo podem não existir; a segunda reserva é a Roboto Bold calibrada (revisão do
    // Helbert de 23/11 no WEB-48).
    const android = head.match(/@font-face\{font-family:'Clash Grotesk Reserva Android';[^}]+\}/g) || [];
    assert.equal(android.length, 2, `${p}: reserva Android 600 e 700`);
    for (const f of android) {
      assert.match(f, /src:local\('Roboto Bold'\),local\('Roboto-Bold'\);/, `${p}: Roboto local`);
      assert.match(f, /size-adjust:[\d.]+%;ascent-override:[\d.]+%;descent-override:[\d.]+%;line-gap-override:[\d.]+%/, `${p}: métricas Android`);
    }
  }
});
