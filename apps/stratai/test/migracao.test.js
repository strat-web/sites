// Migração do stratai.com.br do strat-lps para o app (WEB-32): o HTML das páginas mora em src/html/ e o kit põe o
// <head> de SEO e o <Tracking>. Estes testes garantem que nada de tracking volte colado à mão, que todo arquivo
// citado exista no app e que os 301 da casa antiga continuem. Os do dist/ rodam depois do `pnpm build` (CI e
// `pnpm checar`); sem o dist/, ficam como pulados.
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

test('as três páginas migradas têm head e corpo', () => {
  for (const p of ['home', 'raio-x', 'politica-de-privacidade']) {
    assert.ok(fragmentos.includes(`${p}.head.html`), `${p}.head.html`);
    assert.ok(fragmentos.includes(`${p}.corpo.html`), `${p}.corpo.html`);
  }
});

test('nenhum script de tracking colado no HTML: tudo vem do <Tracking> do kit', () => {
  const proibidos = [/tracking\.stratacademy\.com\.br\/sa/, /t\.metricaas\.com\.br\/m\.js/, /connect\.facebook\.net/, /googletagmanager/, /\bfbq\s*\(/, /\bgtag\s*\(/];
  for (const f of fragmentos) for (const re of proibidos) assert.doesNotMatch(ler(f), re, `${f}: ${re}`);
});

test('as tags que o kit gera não se repetem no head da página', () => {
  const doKit = [/<title>/, /name="description"/, /rel="canonical"/, /property="og:/, /name="twitter:card"/, /name="viewport"/, /charset=/];
  for (const f of fragmentos.filter((f) => f.endsWith('.head.html'))) for (const re of doKit) assert.doesNotMatch(ler(f), re, `${f}: ${re}`);
});

test('nenhum link sem destino (href="#"): o WhatsApp sai escrito no HTML com o mesmo texto do script', () => {
  for (const f of fragmentos) assert.doesNotMatch(ler(f), /href="#"/, f);
  const home = ler('home.corpo.html');
  const was = [...home.matchAll(/href="(https:\/\/wa\.me\/[^"]+)" data-wa="([^"]*)"/g)];
  assert.equal(was.length, 6);
  for (const [, href, texto] of was) {
    // a mesma conta do script da página: waLink(a.dataset.wa + ' [ref: LP-AI-v6]')
    assert.equal(href, 'https://wa.me/5547991658478?text=' + encodeURIComponent(texto + ' [ref: LP-AI-v6]'));
  }
});

test('todo arquivo do próprio site citado nas páginas existe em public/', () => {
  for (const f of fragmentos) {
    const html = ler(f);
    const caminhos = [...html.matchAll(/(?:src|href|data-thumb)="\/?((?:midia|css)\/[^"?#]+)/g)].map((m) => m[1]);
    for (const c of caminhos) assert.ok(existsSync(join(APP, 'public', c)), `${f}: ${c} não existe em public/`);
  }
});

test('a política só é citada com barra no fim', () => {
  for (const f of fragmentos) assert.doesNotMatch(ler(f), /href="\/politica-de-privacidade"/, f);
});

test('_redirects: 301 da política sem barra, da Agência e da primeira versão do Raio-X', () => {
  const regras = readFileSync(join(APP, 'public/_redirects'), 'utf8')
    .split('\n').filter((l) => l.trim() && !l.startsWith('#')).map((l) => l.trim().split(/\s+/));
  const tem = (de, para) => assert.ok(regras.some(([a, b, c]) => a === de && b === para && c === '301'), `${de} → ${para}`);
  tem('/politica-de-privacidade', '/politica-de-privacidade/');
  tem('/politica-de-privacidade.html', '/politica-de-privacidade/');
  tem('/agencia', 'https://agencia.stratai.com.br/');
  tem('/agencia/*', 'https://agencia.stratai.com.br/:splat');
  tem('/raio-x/v1/*', '/raio-x/');
  // nenhuma regra pode apontar para a própria origem (laço)
  for (const [a, b] of regras) assert.notEqual(a, b);
});

const pagina = (c) => readFileSync(join(DIST, c, 'index.html'), 'utf8');
const semDist = !existsSync(join(DIST, 'index.html')) && 'sem dist/: rode pnpm build antes';

test('dist: o cartão de compartilhamento continua o da página no ar', { skip: semDist }, () => {
  const home = pagina('');
  assert.match(home, /<meta property="og:description" content="Mapeamos onde a sua operação perde tempo e construímos os agentes de IA que assumem esse trabalho\. Faça o diagnóstico grátis em 3 minutos\.">/);
  assert.match(home, /<meta property="og:title" content="StratAI · Agentes de IA para a sua empresa">/);
  const raio = pagina('raio-x');
  assert.match(raio, /<title>Raio-X de IA · Quanto a sua empresa perde por mês sem IA\? · StratAI<\/title>/);
  assert.match(raio, /<meta property="og:title" content="Raio-X de IA · Quanto a sua empresa perde por mês sem IA\?">/);
  assert.match(raio, /<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">/);
  const pol = pagina('politica-de-privacidade');
  assert.match(pol, /<link rel="canonical" href="https:\/\/stratai\.com\.br\/politica-de-privacidade\/">/);
  assert.match(pol, /<meta property="og:type" content="article">/);
});

// Umami pelo proxy /u/ (TRACK-9) na home e no /raio-x/, como no ar desde 12/11; a política segue sem tracking nenhum.
test('dist: os scripts de tracking são os mesmos da produção (src e data-ws)', { skip: semDist }, () => {
  const scripts = (html) => [...html.matchAll(/<script[^>]*\bsrc="([^"]+)"[^>]*>/g)].map((m) => m[0]);
  const home = scripts(pagina(''));
  assert.deepEqual(home, [
    '<script defer src="https://t.metricaas.com.br/m.js" data-ws="agencia-strat">',
    '<script defer src="https://tracking.stratacademy.com.br/sa?product=stratai">',
    '<script defer src="/u/script.js" data-website-id="d6394916-40aa-45da-b80e-7285ec5bcb45">',
  ]);
  assert.deepEqual(scripts(pagina('raio-x')), [
    '<script defer src="https://t.metricaas.com.br/m.js" data-ws="agencia-strat">',
    '<script defer src="https://tracking.stratacademy.com.br/sa?product=raio-x-ia">',
    '<script defer src="/u/script.js" data-website-id="d6394916-40aa-45da-b80e-7285ec5bcb45">',
  ]);
  assert.deepEqual(scripts(pagina('politica-de-privacidade')), []);
});
