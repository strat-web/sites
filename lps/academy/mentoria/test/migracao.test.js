// Migração da LP mentoria.stratacademy.com.br do strat-lps (lps/mentoria) para o Pages (WEB-48): o HTML de cada versão
// mora em src/html/ e o kit põe o <head> de SEO e o <Tracking> perfil venda. Estes testes garantem que nada de tracking
// volte colado à mão, que as tags do kit não se repitam e que todo arquivo citado (no HTML e no JS do app da V2) exista
// em public/.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP = join(dirname(fileURLToPath(import.meta.url)), '..');
const HTML = join(APP, 'src/html');
const PAGINAS = { home: '/', v2: '/v2/' };
const fragmentos = readdirSync(HTML).filter((f) => f.endsWith('.html'));
const ler = (f) => readFileSync(join(HTML, f), 'utf8');
const existe = (caminho) => existsSync(join(APP, 'public', caminho));

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

test('o checkout continua na Hotmart, no mesmo produto e nos 3 planos', () => {
  const js = readdirSync(join(APP, 'public/v2/assets')).filter((f) => f.endsWith('.js')).map((f) => readFileSync(join(APP, 'public/v2/assets', f), 'utf8')).join('');
  for (const [p, texto] of [['home', ler('home.corpo.html')], ['v2', js]]) {
    for (const off of ['e7rrc4yj', 'jycwjai3', 'zpzw0xqq']) assert.match(texto, new RegExp(`pay\\.hotmart\\.com/S99990328Q\\?off=${off}`), `${p}: ${off}`);
  }
});

test('a V2 mantém o tema escuro e as classes do <body> do original', () => {
  assert.match(ler('v2.head.html'), /^<script>document\.documentElement\.classList\.add\('dark'\)<\/script>/);
  assert.match(ler('v2.corpo.html'), /^<script>document\.body\.className='bg-background text-on-surface antialiased overflow-x-hidden'<\/script>/);
});

test('todo arquivo do próprio site citado nas páginas e no JS da V2 existe em public/', () => {
  for (const [p, base] of Object.entries(PAGINAS)) {
    const html = ler(`${p}.head.html`) + ler(`${p}.corpo.html`);
    const refs = [
      ...[...html.matchAll(/(?:src|href|data-thumb|poster)="([^"]+)"/g)].map((m) => m[1]),
      ...[...html.matchAll(/url\(['"]?([^'")]+)/g)].map((m) => m[1]),
    ];
    for (const r of refs) {
      if (/^(https?:|mailto:|tel:|data:|#|\/\/|%23)/.test(r) || !r.trim()) continue;
      const caminho = posix.normalize(r.startsWith('/') ? r : posix.join(base, r)).split(/[?#]/)[0];
      assert.ok(existe(caminho), `${p}: ${r} → public${caminho} não existe`);
    }
  }
  for (const f of readdirSync(join(APP, 'public/v2/assets')).filter((f) => f.endsWith('.js'))) {
    const js = readFileSync(join(APP, 'public/v2/assets', f), 'utf8');
    for (const [, r] of js.matchAll(/"(\/(?:v2\/)?(?:logos|images|js|assets)\/[^"]+)"/g)) assert.ok(existe(r), `JS da V2: ${r} não existe`);
  }
});

test('a V2 tem o H1 provisório dentro do #root, igual ao H1 que o app desenha', () => {
  assert.match(ler('v2.corpo.html'), /<div id="root"><h1 [^>]*>Substitua Departamentos Inteiros por <br [^>]*><span class="text-gradient">Agentes de IA e Sistemas Autônomos<\/span><\/h1><\/div>/);
});
