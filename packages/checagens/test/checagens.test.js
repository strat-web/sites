// Cada regra das checagens com um caso que tem de barrar e um que tem de passar (WEB-20).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { checarCatalogo } from '../src/catalogo.js';
import { checarLinks } from '../src/links.js';
import { bytesDaPagina } from '../src/peso.js';
import { checarSeo } from '../src/seo.js';
import { checarTracking, slugConhecido } from '../src/tracking.js';

const SITE = 'https://stratai.com.br';
const linha = (extra = {}) => ({
  id: 'teste',
  url: `${SITE}/teste/`,
  marca: 'stratai',
  tipo: 'lp',
  app: 'apps/stratai',
  perfil: 'lead',
  rastro_slug: 'stratai',
  metricaas_ws: 'agencia-strat',
  meta_pixel: '1823024821883911',
  consentimento: 'off',
  indexar: false,
  umami_website_id: null,
  ...extra,
});

const TRACKING_OK =
  '<script defer src="https://t.metricaas.com.br/m.js" data-ws="agencia-strat"></script>' +
  '<script defer src="https://tracking.stratacademy.com.br/sa?product=stratai"></script>';

const pagina = ({ titulo = 'Teste', h1 = 'Teste', head = TRACKING_OK, corpo = '', robots = 'noindex, nofollow', caminho = '/teste/' } = {}) => ({
  caminho,
  url: `${SITE}${caminho}`,
  arquivo: `dist${caminho}index.html`,
  html:
    `<!doctype html><html><head><title>${titulo}</title><link rel="canonical" href="${SITE}${caminho}">` +
    `<meta name="robots" content="${robots}">${head}</head><body><h1>${h1}</h1>${corpo}</body></html>`,
});

const ctx = (paginas, { linhas = [linha()], sitemap = [], dist = '/nao-existe' } = {}) => ({
  raiz: '/',
  catalogo: { urls: linhas },
  apps: [{ app: 'apps/stratai', site: SITE, dist, paginas, sitemap, robots: 'User-agent: *' }],
});

const msgs = (r) => r.erros.map((e) => e.msg).join(' | ');
const rastroConhece = (conhecidos) => async (url) => ({
  ok: true,
  text: async () => `var CFG={"known":${conhecidos.includes(new URL(url).searchParams.get('product'))}};`,
});

test('seo: href="#" barra; o mesmo link com destino passa', () => {
  const ruim = checarSeo(ctx([pagina({ corpo: '<a href="#">Fale conosco</a>' })]));
  assert.match(msgs(ruim), /link sem destino: <a href="#">/);
  const bom = checarSeo(ctx([pagina({ corpo: '<a href="https://wa.me/5547991658478">Fale conosco</a>' })]));
  assert.deepEqual(bom.erros, []);
});

test('seo: título e H1 repetidos, canonical e JSON-LD', () => {
  const dupla = checarSeo(ctx([pagina(), pagina({ caminho: '/outra/' })], { linhas: [linha(), linha({ id: 'o', url: `${SITE}/outra/` })] }));
  assert.match(msgs(dupla), /título repetido/);
  assert.match(msgs(dupla), /H1 repetido/);
  const semCanonical = pagina();
  semCanonical.html = semCanonical.html.replace(/<link rel="canonical"[^>]*>/, '');
  assert.match(msgs(checarSeo(ctx([semCanonical]))), /sem <link rel="canonical">/);
  const jsonRuim = checarSeo(ctx([pagina({ head: `${TRACKING_OK}<script type="application/ld+json">{"@type":</script>` })]));
  assert.match(msgs(jsonRuim), /JSON-LD que não é JSON/);
});

test('seo: página indexável fora do sitemap barra; dentro passa', () => {
  const p = pagina({ robots: 'index, follow' });
  assert.match(msgs(checarSeo(ctx([p], { sitemap: [] }))), /fora do sitemap/);
  assert.deepEqual(checarSeo(ctx([p], { sitemap: [p.url] })).erros, []);
});

test('seo: href dentro de <script> não conta como link', () => {
  const r = checarSeo(ctx([pagina({ corpo: `<script>b.innerHTML = '<a href="#">x</a>';</script>` })]));
  assert.deepEqual(r.erros, []);
});

test('tracking: página certa passa e confere o slug no Rastro', async () => {
  const r = await checarTracking(ctx([pagina()]), { buscar: rastroConhece(['stratai']) });
  assert.deepEqual(r.erros, []);
});

test('tracking: página sem <Tracking> barra', async () => {
  const r = await checarTracking(ctx([pagina({ head: '' })]), { semRede: true });
  assert.match(msgs(r), /falta https:\/\/t\.metricaas\.com\.br\/m\.js/);
});

test('tracking: pixel colado à mão e script em dobro barram', async () => {
  const fbq = `${TRACKING_OK}<script>!function(f){f.fbq=function(){}}(window);fbq('init','1');</script>`;
  assert.match(msgs(await checarTracking(ctx([pagina({ head: fbq })]), { semRede: true })), /pixel da Meta \(fbq\) colado à mão/);
  const gtm = `${TRACKING_OK}<script async src="https://www.googletagmanager.com/gtag/js?id=G-X"></script>`;
  assert.match(msgs(await checarTracking(ctx([pagina({ head: gtm })]), { semRede: true })), /gtag ou GTM colado à mão/);
  const dobro = `${TRACKING_OK}<script defer src="https://tracking.stratacademy.com.br/sa?product=stratai"></script>`;
  assert.match(msgs(await checarTracking(ctx([pagina({ head: dobro })]), { semRede: true })), /em dobro/);
});

test('tracking: slug que o Rastro não conhece barra', async () => {
  const r = await checarTracking(ctx([pagina()]), { buscar: rastroConhece([]) });
  assert.match(msgs(r), /não conhece o produto "stratai"/);
});

test('tracking: Umami com id no catálogo exige o script; sem id é só aviso', async () => {
  const comId = ctx([pagina()], { linhas: [linha({ umami_website_id: 'abc' })] });
  assert.match(msgs(await checarTracking(comId, { semRede: true })), /falta \/u\/script\.js/);
  const umami = `${TRACKING_OK}<script defer src="/u/script.js" data-website-id="abc"></script>`;
  const ok = ctx([pagina({ head: umami })], { linhas: [linha({ umami_website_id: 'abc' })] });
  assert.deepEqual((await checarTracking(ok, { semRede: true })).erros, []);
  const semId = await checarTracking(ctx([pagina()]), { semRede: true });
  assert.match(semId.avisos.map((a) => a.msg).join(), /sem umami_website_id/);
});

test('tracking: esqueleto passa sem tracking e barra quando ganha tracking', async () => {
  const esqueleto = pagina({ caminho: '/', head: '' });
  const linhas = [linha({ id: 'stratai', url: `${SITE}/` })];
  assert.deepEqual((await checarTracking(ctx([esqueleto], { linhas }), { semRede: true })).erros, []);
  const migrada = pagina({ caminho: '/' });
  assert.match(msgs(await checarTracking(ctx([migrada], { linhas }), { semRede: true })), /tirar a URL de packages\/checagens\/src\/esqueletos\.js/);
});

test('slugConhecido lê o known do script do Rastro', async () => {
  assert.equal(await slugConhecido('stratai', rastroConhece(['stratai'])), true);
  assert.equal(await slugConhecido('x', rastroConhece([])), false);
});

test('catalogo: página sem linha barra; linha fora do formato barra', () => {
  assert.match(msgs(checarCatalogo(ctx([pagina()], { linhas: [] }))), /página sem linha no catalogo/);
  const r = checarCatalogo(ctx([pagina()], { linhas: [linha({ url: `${SITE}/teste`, perfil: 'venda-x' })] }));
  assert.match(msgs(r), /terminar com barra/);
  assert.match(msgs(r), /perfil "venda-x"/);
  assert.deepEqual(checarCatalogo(ctx([pagina()])).erros, []);
});

function distFalso() {
  const dist = mkdtempSync(join(tmpdir(), 'checagens-'));
  mkdirSync(join(dist, 'existe'), { recursive: true });
  writeFileSync(join(dist, 'existe', 'index.html'), '<h1>ok</h1>');
  writeFileSync(join(dist, 'estilo.css'), 'body{background:url(/fundo.png)}');
  writeFileSync(join(dist, 'fundo.png'), Buffer.alloc(2000));
  return dist;
}

test('links: link interno quebrado e âncora sem id barram; o resto passa', () => {
  const dist = distFalso();
  const corpo =
    '<a href="/existe/">ok</a><a href="/nao-existe/">quebrado</a><a href="#cadê">âncora</a>' +
    '<a href="https://outro.com.br/x/">fora</a><a href="mailto:a@b.c">e-mail</a><script src="/u/script.js"></script>';
  const r = checarLinks(ctx([pagina({ corpo })], { dist }));
  assert.equal(r.erros.length, 2, msgs(r));
  assert.match(msgs(r), /link interno quebrado: "\/nao-existe\/"/);
  assert.match(msgs(r), /âncora "#cadê"/);
});

test('peso: soma o HTML e os recursos locais, inclusive o url() do CSS', () => {
  const dist = distFalso();
  const p = pagina({ head: '<link rel="stylesheet" href="/estilo.css">' });
  const app = { site: SITE, dist };
  const esperado = Buffer.byteLength(p.html) + 'body{background:url(/fundo.png)}'.length + 2000;
  assert.equal(bytesDaPagina(app, p), esperado);
});
