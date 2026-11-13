// Cada regra das checagens com um caso que tem de barrar e um que tem de passar (WEB-20).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { checarCatalogo } from '../src/catalogo.js';
import { RAIZ, checarApps, montarContexto } from '../src/contexto.js';
import { checarLinks } from '../src/links.js';
import { bytesDaPagina, julgarMedicao } from '../src/peso.js';
import { checarSeo } from '../src/seo.js';
import { checarTracking, diferencasDoRastro, lerRastro, slugConhecido } from '../src/tracking.js';
import { EXCECOES_LIGHTHOUSE } from '../src/excecoes-peso.js';

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

// 404.html como o <PaginaNaoEncontrada> do kit gera (WEB-75): noindex, sem canonical próprio, fora do catálogo.
const pagina404 = ({ corpo = '', robots = 'noindex, nofollow', h1 = 'Esta página não existe' } = {}) => ({
  caminho: '/404.html',
  url: `${SITE}/404.html`,
  arquivo: 'dist/404.html',
  html:
    `<!doctype html><html><head><title>Página não encontrada · StratAI</title><link rel="canonical" href="${SITE}/404/">` +
    `<meta name="robots" content="${robots}"></head><body><h1>${h1}</h1>${corpo}</body></html>`,
});

// Todo app tem a 404 (a checagem seo barra sem ela); `erro: null` monta o app sem.
const ctx = (paginas, { linhas = [linha()], sitemap = [], dist = '/nao-existe', erro = pagina404() } = {}) => ({
  raiz: '/',
  catalogo: { urls: linhas },
  apps: [{ app: 'apps/stratai', site: SITE, dist, paginas: erro ? [...paginas, erro] : paginas, sitemap, robots: 'User-agent: *' }],
});

const msgs = (r) => r.erros.map((e) => e.msg).join(' | ');
const rastroConhece = (conhecidos) => async (url) => ({
  ok: true,
  // O /sa de verdade manda o consentMode de todo produto conhecido; sem ele a checagem barra (WEB-81).
  text: async () => `var CFG={"known":${conhecidos.includes(new URL(url).searchParams.get('product'))},"consentMode":"off"};`,
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
  // metricaas.com.br/ segue esqueleto até o WEB-36 (packages/checagens/src/esqueletos.js).
  const MET = 'https://metricaas.com.br/';
  const comUrl = (p) => ({ ...p, url: MET });
  const linhas = [linha({ id: 'metricaas', url: MET })];
  const esqueleto = comUrl(pagina({ caminho: '/', head: '' }));
  assert.deepEqual((await checarTracking(ctx([esqueleto], { linhas }), { semRede: true })).erros, []);
  const migrada = comUrl(pagina({ caminho: '/' }));
  assert.match(msgs(await checarTracking(ctx([migrada], { linhas }), { semRede: true })), /tirar a URL de packages\/checagens\/src\/esqueletos\.js/);
});

test('tracking: a home da StratAI saiu dos esqueletos (WEB-32) e passa com o Tracking do catálogo', async () => {
  const linhas = [linha({ id: 'stratai', url: `${SITE}/` })];
  const home = pagina({ caminho: '/' });
  assert.deepEqual((await checarTracking(ctx([home], { linhas }), { semRede: true })).erros, []);
  const semTracking = pagina({ caminho: '/', head: '' });
  assert.match(msgs(await checarTracking(ctx([semTracking], { linhas }), { semRede: true })), /falta https:\/\/t\.metricaas\.com\.br\/m\.js/);
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

test('catalogo: slug com ponto precisa da barra, arquivo não; linha tipo site sem no_ar barra (WEB-77)', () => {
  const slug = checarCatalogo(ctx([], { linhas: [linha({ url: `${SITE}/blog/gpt-4.1` })] }));
  assert.match(msgs(slug), /terminar com barra/);
  assert.deepEqual(checarCatalogo(ctx([], { linhas: [linha({ url: `${SITE}/blog/gpt-4.1/` })] })).erros, []);
  assert.deepEqual(checarCatalogo(ctx([], { linhas: [linha({ url: `${SITE}/feed.xml` })] })).erros, []);

  const site = (extra) => linha({ id: 'site', url: `${SITE}/`, tipo: 'site', ...extra });
  assert.match(msgs(checarCatalogo(ctx([], { linhas: [site({})] }))), /falta o campo "no_ar"/);
  assert.match(msgs(checarCatalogo(ctx([], { linhas: [site({ no_ar: 'sim' })] }))), /no_ar tem de ser true ou false/);
  assert.deepEqual(checarCatalogo(ctx([], { linhas: [site({ no_ar: false })] })).erros, []);
  // Fora de tipo site o campo é opcional.
  assert.deepEqual(checarCatalogo(ctx([], { linhas: [linha()] })).erros, []);
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

// Rastro de mentira com a configuração inteira do produto (o /sa de verdade manda todos estes campos).
const rastroCom = (cfg) => async () => ({
  ok: true,
  text: async () => `(function(){var CFG=${JSON.stringify({ slug: 'stratai', known: true, ...cfg })};})();`,
});
const STRATAI = { metaPixelId: '1823024821883911', ga4Id: '', googleTagId: '', googleAdsId: '', consentMode: 'off' };

test('tracking: o /sa do Rastro igual ao catálogo passa', async () => {
  const r = await checarTracking(ctx([pagina()]), { buscar: rastroCom(STRATAI) });
  assert.deepEqual(r.erros, []);
});

test('tracking: Rastro com consentMode, pixel, GA4 ou tag do Google diferente do catálogo barra', async () => {
  const r = await checarTracking(ctx([pagina()]), {
    buscar: rastroCom({ ...STRATAI, consentMode: 'soft', metaPixelId: '999', ga4Id: 'G-OUTRO', googleAdsId: 'AW-1' }),
  });
  const m = msgs(r);
  assert.match(m, /consentMode "soft", o catálogo diz "off"/);
  assert.match(m, /pixel da Meta: o Rastro injeta "999", o catálogo pede "1823024821883911"/);
  assert.match(m, /GA4: o Rastro injeta "G-OUTRO"/);
  assert.match(m, /tag do Google: o Rastro injeta "AW-1", o catálogo pede ""/);
});

test('diferencasDoRastro: tag do Google aceita o googleTagId ou o googleAdsId, e só compara o que o Rastro manda', () => {
  const l = linha({ ga4: 'G-R84BNVV2HX', google_tag: 'AW-17263684860', meta_pixel: '860500981882285' });
  const mentoria = { metaPixelId: '860500981882285', ga4Id: 'G-R84BNVV2HX', googleTagId: '', googleAdsId: 'AW-17263684860', consentMode: 'off' };
  assert.deepEqual(diferencasDoRastro(mentoria, l), []);
  assert.deepEqual(diferencasDoRastro({ known: true, consentMode: 'off' }, l), []);
  assert.equal(diferencasDoRastro({ ...mentoria, googleTagId: 'GT-X' }, l).length, 1);
});

test('diferencasDoRastro: banner = strict, soft = soft, off = off; o resto barra (WEB-81)', () => {
  const ok = [['banner', 'strict'], ['soft', 'soft'], ['off', 'off']];
  for (const [consentimento, consentMode] of ok) {
    assert.deepEqual(diferencasDoRastro({ ...STRATAI, consentMode }, linha({ consentimento })), [], `${consentimento} × ${consentMode}`);
  }
  const ruins = [
    ['banner', 'soft'], ['banner', 'off'], ['banner', 'banner'],
    ['soft', 'strict'], ['soft', 'off'],
    ['off', 'strict'], ['off', 'soft'],
    ['sem-tracking', 'off'], ['por-funil', 'strict'],
    ['off', 'outro'],
  ];
  for (const [consentimento, consentMode] of ruins) {
    const difs = diferencasDoRastro({ ...STRATAI, consentMode }, linha({ consentimento }));
    assert.equal(difs.length, 1, `${consentimento} × ${consentMode}`);
    assert.match(difs[0], /^consentimento: /);
  }
  assert.match(diferencasDoRastro({ ...STRATAI, consentMode: 'soft' }, linha({ consentimento: 'banner' }))[0], /pede "strict"/);
});

test('tracking: página com Rastro e banner passa com o produto em strict e barra com o produto em soft (WEB-81)', async () => {
  const linhas = [linha({ consentimento: 'banner' })];
  const head = TRACKING_OK; // sem data-pixel e sem banner do kit: o aviso é o do Rastro
  const strict = await checarTracking(ctx([pagina({ head })], { linhas }), { buscar: rastroCom({ ...STRATAI, consentMode: 'strict' }) });
  assert.deepEqual(strict.erros, []);
  const soft = await checarTracking(ctx([pagina({ head })], { linhas }), { buscar: rastroCom({ ...STRATAI, consentMode: 'soft' }) });
  assert.match(msgs(soft), /consentMode "soft", o catálogo diz "banner" \(pede "strict" no Rastro\)/);
  // m.js com data-pixel-consent numa página com Rastro: o kit não pede, então barra (pixel em dobro e aviso em dobro)
  const dobro = await checarTracking(
    ctx([pagina({ head: TRACKING_OK.replace('data-ws="agencia-strat"', 'data-ws="agencia-strat" data-pixel-consent="aguardar"') })], { linhas }),
    { buscar: rastroCom({ ...STRATAI, consentMode: 'strict' }) },
  );
  assert.match(msgs(dobro), /data-pixel-consent="aguardar", mas o catálogo pede ""/);
});

test('diferencasDoRastro: sem consentMode no /sa barra, em vez de passar calado (WEB-81)', () => {
  for (const consentimento of ['banner', 'soft', 'off']) {
    for (const cfg of [{ ...STRATAI, consentMode: undefined }, { ...STRATAI, consentMode: '' }, { ...STRATAI, consentMode: null }]) {
      const difs = diferencasDoRastro(cfg, linha({ consentimento }));
      assert.equal(difs.length, 1, `${consentimento} × ${JSON.stringify(cfg.consentMode)}`);
      assert.match(difs[0], /o Rastro não mandou consentMode/);
    }
  }
  const { consentMode, ...semCampo } = STRATAI;
  assert.match(diferencasDoRastro(semCampo, linha({ consentimento: 'banner' }))[0], /não dá para conferir o "banner" do catálogo/);
});

test('tracking: página com Rastro e banner barra quando o /sa não manda consentMode (WEB-81)', async () => {
  const { consentMode, ...semCampo } = STRATAI;
  const r = await checarTracking(ctx([pagina()], { linhas: [linha({ consentimento: 'banner' })] }), { buscar: rastroCom(semCampo) });
  assert.match(msgs(r), /produto "stratai" no Rastro × catálogo, consentimento: o Rastro não mandou consentMode/);
});

test('tracking: venda com banner barra, e script da Hotmart em página com banner barra (WEB-81, até o WEB-85)', async () => {
  const LAUNCHER = `<script id="hotmart_launcher_script">(function(l,a,u,n,c){})(window,document,'script','//launcher.hotmart.com/launcher.js','hot');hot('account','h');</script>`;
  const venda = linha({ perfil: 'venda', metricaas_ws: null, rastro_slug: 'stratai', hotmart_conta: 'h', consentimento: 'banner' });
  const sa = '<script defer src="https://tracking.stratacademy.com.br/sa?product=stratai"></script>';
  const r = await checarTracking(ctx([pagina({ head: sa + LAUNCHER })], { linhas: [venda] }), { semRede: true });
  assert.match(msgs(r), /perfil venda com consentimento "banner" e Rastro/);
  assert.match(msgs(r), /script da Hotmart em página com consentimento "banner": <script id="hotmart_launcher_script"> inline/);
  // Widget de checkout colado à mão numa página de conteúdo com banner: também carrega antes do aceite.
  const widget = '<script src="https://static.hotmart.com/checkout/widget.min.js"></script>';
  const conteudo = linha({ perfil: 'conteudo', metricaas_ws: null, meta_pixel: null, consentimento: 'banner' });
  const w = await checarTracking(ctx([pagina({ head: sa, corpo: widget })], { linhas: [conteudo] }), { semRede: true });
  assert.match(msgs(w), /script da Hotmart em página com consentimento "banner": https:\/\/static\.hotmart\.com\/checkout\/widget\.min\.js carrega antes do "aceitar"/);
  // Venda em off com o launcher do kit passa (o Rastro em off não pede aceite).
  const off = await checarTracking(ctx([pagina({ head: sa + LAUNCHER })], { linhas: [{ ...venda, consentimento: 'off' }] }), { semRede: true });
  assert.deepEqual(off.erros, []);
});

test('peso: exceção do Lighthouse avisa acima do piso e barra abaixo dele (WEB-32)', () => {
  const exc = { 'https://x.com.br/': { item: 'WEB-0', motivo: 'teste', piso: { performance: 68, lcpMs: 5400, cls: 0.1 } } };
  assert.equal(julgarMedicao('https://x.com.br/', { performance: 95, lcpMs: 1200, cls: 0 }, exc), 'ok');
  assert.equal(julgarMedicao('https://x.com.br/', { performance: 80, lcpMs: 3900, cls: 0 }, exc), 'aviso');
  assert.equal(julgarMedicao('https://x.com.br/', { performance: 60, lcpMs: 3900, cls: 0 }, exc), 'erro');
  assert.equal(julgarMedicao('https://x.com.br/', { performance: 80, lcpMs: 6000, cls: 0 }, exc), 'erro');
  assert.equal(julgarMedicao('https://y.com.br/', { performance: 80, lcpMs: 3900, cls: 0 }, exc), 'erro');
  // exceções reais hoje: a home da StratAI (WEB-87) e duas páginas com falso vermelho da CI (WEB-88)
  assert.deepEqual(Object.keys(EXCECOES_LIGHTHOUSE), [
    'https://stratai.com.br/',
    'https://stratai.com.br/politica-de-privacidade/',
    'https://stratai.com.br/raio-x/',
  ]);
});

// WEB-76: checagem de tracking sem falso verde.
const MJS = 'https://t.metricaas.com.br/m.js';
const RASTRO_SA = '<script defer src="https://tracking.stratacademy.com.br/sa?product=stratai"></script>';
const comMjs = (tag, antes = '', depois = '') => `${antes}${tag}${RASTRO_SA}${depois}`;
const erroDoMjs = async (head, corpo = '') => msgs(await checarTracking(ctx([pagina({ head, corpo })]), { semRede: true }));

test('tracking: m.js sem defer, com async ou com type barra', async () => {
  assert.match(await erroDoMjs(comMjs(`<script src="${MJS}" data-ws="agencia-strat"></script>`)), /m\.js sem defer/);
  assert.match(await erroDoMjs(comMjs(`<script defer async src="${MJS}" data-ws="agencia-strat"></script>`)), /m\.js com async/);
  assert.match(await erroDoMjs(comMjs(`<script defer type="module" src="${MJS}" data-ws="agencia-strat"></script>`)), /m\.js com type="module"/);
  // type que o navegador não executa (gerenciador de consentimento): o script está lá e não roda.
  assert.match(await erroDoMjs(comMjs(`<script defer type="text/plain" src="${MJS}" data-ws="agencia-strat"></script>`)), /m\.js com type="text\/plain"/);
  assert.deepEqual((await checarTracking(ctx([pagina({ head: comMjs(`<script defer type="text/javascript" src="${MJS}" data-ws="agencia-strat"></script>`) })]), { semRede: true })).erros, []);
});

test('tracking: m.js depois de outro script ou fora do <head> barra; JSON-LD antes passa', async () => {
  const mjs = `<script defer src="${MJS}" data-ws="agencia-strat"></script>`;
  assert.match(await erroDoMjs(`${RASTRO_SA}${mjs}`), /m\.js depois de https:\/\/tracking\.stratacademy\.com\.br\/sa\?product=stratai/);
  assert.match(await erroDoMjs(comMjs(mjs, '<script>window.x = 1;</script>')), /m\.js depois de <script id=""> inline/);
  assert.match(await erroDoMjs(RASTRO_SA, mjs), /m\.js fora do <head>/);
  const jsonLd = '<script type="application/ld+json">{"@context":"https://schema.org","@type":"WebPage"}</script>';
  assert.deepEqual((await checarTracking(ctx([pagina({ head: comMjs(mjs, jsonLd) })]), { semRede: true })).erros, []);
});

test('tracking: Rastro com type que não executa barra', async () => {
  const head = `<script defer src="${MJS}" data-ws="agencia-strat"></script><script defer type="text/plain" src="https://tracking.stratacademy.com.br/sa?product=stratai"></script>`;
  assert.match(await erroDoMjs(head), /sa\?product=stratai com type="text\/plain"/);
});

test('tracking: pixel ou GTM em <noscript> barra', async () => {
  const pixel = '<noscript><img height="1" width="1" src="https://www.facebook.com/tr?id=1823024821883911&ev=PageView&noscript=1"></noscript>';
  assert.match(await erroDoMjs(TRACKING_OK, pixel), /pixel da Meta \(imagem facebook\.com\/tr\) colado à mão em <noscript>/);
  const gtm = '<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-XXXX"></iframe></noscript>';
  assert.match(await erroDoMjs(TRACKING_OK, gtm), /gtag ou GTM colado à mão em <noscript>/);
  const social = '<noscript><a href="https://www.facebook.com/stratai">Facebook</a></noscript>';
  assert.deepEqual((await checarTracking(ctx([pagina({ corpo: social })]), { semRede: true })).erros, []);
});

test('tracking: pixel dentro de um .js do build barra; .js limpo passa', async () => {
  const comJs = (conteudo) => {
    const c = ctx([pagina()]);
    c.apps[0].js = [{ arquivo: '/raiz/apps/stratai/dist/js/pixel.js', caminho: '/js/pixel.js', conteudo }];
    return c;
  };
  const fbq = "!function(f){f.fbq=function(){}}(window);fbq('init','1823024821883911');";
  assert.match(msgs(await checarTracking(comJs(fbq), { semRede: true })), /pixel da Meta \(fbq\) colado à mão em \/js\/pixel\.js \(\.js do build\)/);
  const gtag = "var s=document.createElement('script');s.src='https://www.googletagmanager.com/gtag/js?id=G-X';";
  assert.match(msgs(await checarTracking(comJs(gtag), { semRede: true })), /gtag ou GTM colado à mão em \/js\/pixel\.js/);
  assert.deepEqual((await checarTracking(comJs("document.querySelector('form').addEventListener('submit',()=>{});"), { semRede: true })).erros, []);
});

function raizFalsa() {
  const raiz = mkdtempSync(join(tmpdir(), 'checagens-raiz-'));
  const arquivo = (caminho, conteudo) => {
    mkdirSync(dirname(join(raiz, caminho)), { recursive: true });
    writeFileSync(join(raiz, caminho), conteudo);
  };
  arquivo('catalogo/sites.json', '{"urls":[]}');
  arquivo('apps/com-dist/package.json', '{}');
  arquivo('apps/com-dist/dist/index.html', '<h1>ok</h1>');
  arquivo('apps/com-dist/dist/_astro/pagina.js', 'console.log(1)');
  arquivo('apps/sem-dist/package.json', '{}');
  arquivo('lps/academy/README.md', 'pasta de LPs, sem app ainda');
  return raiz;
}

test('apps: app sem dist/ barra em vez de ser pulado; pasta que não é app fica de fora', () => {
  const raiz = raizFalsa();
  const todos = montarContexto({ raiz });
  assert.deepEqual(todos.apps.map((a) => a.app), ['apps/com-dist']);
  assert.deepEqual(todos.apps[0].js.map((j) => j.caminho), ['/_astro/pagina.js']);
  assert.deepEqual(todos.semDist, ['apps/sem-dist']);
  assert.match(msgs(checarApps(todos)), /app sem dist\//);
  assert.equal(checarApps(todos).erros[0].onde, 'apps/sem-dist');
  // --app só do que tem dist/: passa; --app de pasta que não existe: barra.
  assert.deepEqual(checarApps(montarContexto({ raiz, apps: ['apps/com-dist'] })).erros, []);
  assert.match(msgs(checarApps(montarContexto({ raiz, apps: ['apps/nao-existe'] }))), /não é um app/);
});

// Rastro de mentira que responde, na ordem, cada item da lista (erro = cai a rede; número = status HTTP; objeto = CFG).
function rastroEmSequencia(respostas) {
  const chamadas = [];
  const buscar = async (url) => {
    chamadas.push(new URL(url).searchParams.get('product'));
    const r = respostas.length > 1 ? respostas.shift() : respostas[0];
    if (r instanceof Error) throw r;
    if (typeof r === 'number') return { ok: false, status: r, text: async () => '' };
    return { ok: true, status: 200, text: async () => `var CFG=${JSON.stringify(r)};` };
  };
  return { buscar, chamadas };
}
const semEspera = async () => {};

test('Rastro: oscilação (rede caiu, 503) ganha nova tentativa e passa', async () => {
  const { buscar, chamadas } = rastroEmSequencia([new TypeError('fetch failed'), 503, { known: true }]);
  assert.equal((await lerRastro('stratai', buscar, { esperar: semEspera })).known, true);
  assert.equal(chamadas.length, 3);
  const r = await checarTracking(ctx([pagina()]), { buscar: rastroEmSequencia([502, { known: true, consentMode: 'off' }]).buscar, esperar: semEspera });
  assert.deepEqual(r.erros, []);
});

test('Rastro: fora do ar depois das tentativas barra, e o próximo slug não espera de novo', async () => {
  const { buscar, chamadas } = rastroEmSequencia([503]);
  const linhas = [linha(), linha({ id: 'o', url: `${SITE}/outra/`, rastro_slug: 'raio-x-ia' })];
  const paginas = [pagina(), pagina({ caminho: '/outra/', titulo: 'Outra', h1: 'Outra', head: TRACKING_OK.replace('product=stratai', 'product=raio-x-ia') })];
  const r = await checarTracking(ctx(paginas, { linhas }), { buscar, esperar: semEspera });
  assert.match(msgs(r), /Rastro respondeu 503 \(3 tentativas\): o Rastro parece fora do ar/);
  assert.deepEqual(chamadas, ['stratai', 'stratai', 'stratai', 'raio-x-ia']);
  assert.equal(r.erros.length, 2);
});

test('Rastro: 404 não muda na segunda vez, então barra sem nova tentativa', async () => {
  const { buscar, chamadas } = rastroEmSequencia([404]);
  await assert.rejects(lerRastro('stratai', buscar, { esperar: semEspera }), /respondeu 404/);
  assert.equal(chamadas.length, 1);
});

test('workflow: grupo de concorrência por número do PR, não por nome de branch', () => {
  const yml = readFileSync(join(RAIZ, '.github/workflows/checagens.yml'), 'utf8');
  const grupo = yml.match(/concurrency:\s*\n\s*group:\s*(.+)/)?.[1] ?? '';
  assert.match(grupo, /github\.event\.pull_request\.number/);
  assert.doesNotMatch(grupo, /head_ref/);
  assert.match(yml, /cancel-in-progress:\s*\$\{\{\s*github\.event_name == 'pull_request'\s*\}\}/);
});

test('seo: app sem 404.html barra; com a 404 do kit passa', () => {
  assert.match(msgs(checarSeo(ctx([pagina()], { erro: null }))), /sem 404\.html/);
  assert.deepEqual(checarSeo(ctx([pagina()])).erros, []);
});

test('seo: 404 sem noindex, sem H1 ou no sitemap barra; canonical e título dela não contam', () => {
  assert.match(msgs(checarSeo(ctx([pagina()], { erro: pagina404({ robots: 'index, follow' }) }))), /página de erro sem noindex/);
  assert.match(msgs(checarSeo(ctx([pagina()], { erro: pagina404({ h1: '' }) }))), /exatamente um <h1>/);
  assert.match(msgs(checarSeo(ctx([pagina()], { sitemap: [`${SITE}/404/`] }))), /página de erro no sitemap/);
  assert.match(msgs(checarSeo(ctx([pagina()], { erro: pagina404({ corpo: '<a href="#">x</a>' }) }))), /link sem destino/);
});

test('links: a 404 é conferida a partir da raiz; endereço relativo e link quebrado nela barram', () => {
  const dist = distFalso();
  const corpo = '<a href="/existe/">ok</a><a href="https://stratai.com.br/existe/">ok</a><a href="https://wa.me/5547991658478">fora</a>';
  assert.deepEqual(checarLinks(ctx([], { dist, erro: pagina404({ corpo }) })).erros, []);
  const ruim = checarLinks(ctx([], { dist, erro: pagina404({ corpo: '<a href="existe/">relativo</a><a href="/raio-x/">quebrado</a>' }) }));
  assert.equal(ruim.erros.length, 2, msgs(ruim));
  assert.match(msgs(ruim), /endereço relativo "existe\/" na página de erro/);
  assert.match(msgs(ruim), /link interno quebrado: "\/raio-x\/"/);
});

test('catalogo e tracking: a 404 fica fora do catálogo e do tracking', async () => {
  assert.deepEqual(checarCatalogo(ctx([pagina()])).erros, []);
  assert.deepEqual((await checarTracking(ctx([pagina()]), { semRede: true })).erros, []);
});
