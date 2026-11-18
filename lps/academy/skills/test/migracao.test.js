// Migração da LP skills.stratacademy.com.br do strat-lps (lps/lp-500) para o Pages (WEB-48): o HTML de cada versão mora
// em src/html/ e o kit põe o <head> de SEO e o <Tracking> perfil venda. Estes testes garantem que nada de tracking volte
// colado à mão, que as tags do kit não se repitam e que todo arquivo citado exista em public/, no caminho que o
// navegador vai pedir (as versões usam caminho relativo à própria pasta: / e /b/).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP = join(dirname(fileURLToPath(import.meta.url)), '..');
const HTML = join(APP, 'src/html');
const PAGINAS = { home: '/', b: '/b/' };
const fragmentos = readdirSync(HTML).filter((f) => f.endsWith('.html'));
const ler = (f) => readFileSync(join(HTML, f), 'utf8');

test('as duas versões têm head e corpo', () => {
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
  for (const p of Object.keys(PAGINAS)) assert.match(ler(`${p}.corpo.html`), /https:\/\/pay\.hotmart\.com\/R106245534R/, p);
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

test('rodapé da principal: os popups continuam, agora com destino (política da Academy e âncora no próprio link)', () => {
  const c = ler('home.corpo.html');
  assert.match(c, /<a href="https:\/\/stratacademy\.com\.br\/politica-de-privacidade\/" onclick="showPopup\('privacy'\); return false;">/);
  assert.match(c, /<a id="termos-de-uso" href="#termos-de-uso" onclick="showPopup\('terms'\); return false;">/);
  assert.match(c, /<a id="suporte" href="#suporte" onclick="openSuporte\(\); return false;">/);
  assert.doesNotMatch(c, /class="pricing-full-cta" href="#"|href="#" class="pricing-full-cta"/);
});
