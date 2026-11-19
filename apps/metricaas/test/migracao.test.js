// Migração do metricaas.com.br do strat-lps para o app (WEB-36): o HTML das páginas mora em src/html/ e o kit põe o
// <head> de SEO e o <Tracking>. Estes testes garantem que nada de tracking volte colado à mão, que todo arquivo
// citado exista no app e que os 301 da casa antiga continuem (a política e os termos sem barra estão cadastrados no
// app da Meta e na aprovação da API do Google Ads). Os do dist/ rodam depois do `pnpm build` (CI e `pnpm checar`);
// sem o dist/, ficam como pulados.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP = join(dirname(fileURLToPath(import.meta.url)), '..');
const HTML = join(APP, 'src/html');
const DIST = join(APP, 'dist');
const fragmentos = readdirSync(HTML).filter((f) => f.endsWith('.html'));
const ler = (f) => readFileSync(join(HTML, f), 'utf8');
const PAGINAS = ['home', 'politica-de-privacidade', 'termos-de-uso'];

test('as três páginas migradas têm head e corpo', () => {
  for (const p of PAGINAS) {
    assert.ok(fragmentos.includes(`${p}.head.html`), `${p}.head.html`);
    assert.ok(fragmentos.includes(`${p}.corpo.html`), `${p}.corpo.html`);
  }
});

test('nenhum script de tracking colado no HTML: tudo vem do <Tracking> do kit', () => {
  const proibidos = [/tracking\.stratacademy\.com\.br\/sa/, /t\.metricaas\.com\.br\/m\.js/, /connect\.facebook\.net/, /googletagmanager/, /\bfbq\s*\(/, /\bgtag\s*\(/, /\/u\/script\.js/];
  for (const f of fragmentos) for (const re of proibidos) assert.doesNotMatch(ler(f), re, `${f}: ${re}`);
});

test('as tags que o kit gera não se repetem no head da página', () => {
  const doKit = [/<title>/, /name="description"/, /rel="canonical"/, /property="og:/, /name="twitter:card"/, /name="viewport"/, /charset=/];
  for (const f of fragmentos.filter((f) => f.endsWith('.head.html'))) for (const re of doKit) assert.doesNotMatch(ler(f), re, `${f}: ${re}`);
});

test('nenhum link sem destino (href="#") e o WhatsApp escrito no HTML', () => {
  for (const f of fragmentos) assert.doesNotMatch(ler(f), /href="#"/, f);
  const was = [...ler('home.corpo.html').matchAll(/href="(https:\/\/wa\.me\/[^"]+)"/g)].map((m) => m[1]);
  assert.equal(was.length, 6);
  for (const href of was) assert.match(href, /^https:\/\/wa\.me\/554791658478\?text=/);
});

test('todo arquivo do próprio site citado nas páginas existe em public/', () => {
  for (const f of fragmentos) {
    const html = ler(f);
    const caminhos = [...html.matchAll(/(?:src|href)="\/((?:midia|css)\/[^"?#]+)|url\('\/((?:midia|css)\/[^')?#]+)/g)].map((m) => m[1] ?? m[2]);
    assert.ok(caminhos.length > 0 || !f.startsWith('home'), `${f}: nenhum arquivo citado`);
    for (const c of caminhos) assert.ok(existsSync(join(APP, 'public', c)), `${f}: ${c} não existe em public/`);
  }
});

test('nenhum caminho relativo da casa antiga (images/, legal.css, política e termos sem barra)', () => {
  for (const f of fragmentos) {
    const html = ler(f);
    assert.doesNotMatch(html, /(?:src|href)="images\/|url\('images\//, `${f}: images/`);
    assert.doesNotMatch(html, /href="legal\.css"/, `${f}: legal.css`);
    assert.doesNotMatch(html, /href="\/?(?:politica-de-privacidade|termos-de-uso)(?:\.html)?(?:#[^"]*)?"/, `${f}: link sem barra`);
  }
});

test('_redirects: 301 da política e dos termos sem barra, das imagens e do CSS', () => {
  const regras = readFileSync(join(APP, 'public/_redirects'), 'utf8')
    .split('\n').filter((l) => l.trim() && !l.startsWith('#')).map((l) => l.trim().split(/\s+/));
  const tem = (de, para) => assert.ok(regras.some(([a, b, c]) => a === de && b === para && c === '301'), `${de} → ${para}`);
  tem('/politica-de-privacidade', '/politica-de-privacidade/');
  tem('/politica-de-privacidade.html', '/politica-de-privacidade/');
  tem('/termos-de-uso', '/termos-de-uso/');
  tem('/termos-de-uso.html', '/termos-de-uso/');
  tem('/images/icon.png', '/midia/logo/metricaas.png');
  tem('/images/*', '/midia/:splat');
  tem('/legal.css', '/css/legal.css');
  // a regra do ícone vem antes da genérica (no Pages vale a primeira que casa)
  assert.ok(regras.findIndex(([a]) => a === '/images/icon.png') < regras.findIndex(([a]) => a === '/images/*'));
  for (const [a, b] of regras) assert.notEqual(a, b);
  // todo destino /midia/ do splat existe para as imagens que a casa antiga servia
  for (const img of ['logo.png', 'ctafinal.webp', 'hero-people.webp', 'hero-mobile.webp']) {
    assert.ok(existsSync(join(APP, 'public/midia', img)), img);
  }
});

const pagina = (c) => readFileSync(join(DIST, c, 'index.html'), 'utf8');
const semDist = !existsSync(join(DIST, 'index.html')) && 'sem dist/: rode pnpm build antes';

test('dist: título e cartão de compartilhamento continuam os da página no ar', { skip: semDist }, () => {
  const home = pagina('');
  assert.match(home, /<title>Metricaas — de onde vem cada cliente do seu WhatsApp<\/title>/);
  assert.match(home, /<meta property="og:description" content="Pare de perder a origem dos leads que caem no seu WhatsApp\./);
  assert.match(home, /<meta property="og:image" content="https:\/\/metricaas\.com\.br\/og\.png">/);
  assert.match(home, /<link rel="canonical" href="https:\/\/metricaas\.com\.br\/">/);
  const pol = pagina('politica-de-privacidade');
  assert.match(pol, /<title>Política de Privacidade — Metricaas<\/title>/);
  assert.match(pol, /<link rel="canonical" href="https:\/\/metricaas\.com\.br\/politica-de-privacidade\/">/);
  assert.match(pol, /id="exclusao-de-dados"/);
  const termos = pagina('termos-de-uso');
  assert.match(termos, /<link rel="canonical" href="https:\/\/metricaas\.com\.br\/termos-de-uso\/">/);
});

// Como no ar em 17/11/2026: Rastro metricaas e Umami (proxy /u/) nas três páginas; sem m.js (o site não tem workspace).
test('dist: os scripts de tracking são os mesmos da produção', { skip: semDist }, () => {
  const scripts = (html) => [...html.matchAll(/<script[^>]*\bsrc="([^"]+)"[^>]*>/g)].map((m) => m[0]);
  const esperado = [
    '<script defer src="https://tracking.stratacademy.com.br/sa?product=metricaas">',
    '<script defer src="/u/script.js" data-website-id="0cb0209b-6da9-4492-82a7-615b112f1f31">',
  ];
  for (const c of ['', 'politica-de-privacidade', 'termos-de-uso']) assert.deepEqual(scripts(pagina(c)), esperado, c || 'home');
});
