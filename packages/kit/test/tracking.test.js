import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { planoDeTracking, linhaDoCatalogo, PERFIS } from '../src/index.js';

const catalogo = JSON.parse(readFileSync(new URL('../../../catalogo/sites.json', import.meta.url), 'utf8'));
const plano = (url, perfil) => planoDeTracking({ catalogo, url, perfil });
const srcs = (p) => p.scripts.map((s) => s.src);

// Catálogo de mentira para os casos que o catálogo real não tem.
const linha = (extra) => ({
  id: 'x', url: 'https://exemplo.com.br/', marca: 'stratai', perfil: 'lead', rastro_slug: null, hotmart_conta: null,
  metricaas_ws: null, meta_pixel: null, ga4: null, google_tag: null, umami_website_id: null, consentimento: 'off', ...extra,
});
const falso = (extra, perfil = extra.perfil ?? 'lead') =>
  planoDeTracking({ catalogo: { urls: [linha(extra)] }, url: 'https://exemplo.com.br/', perfil });

test('a URL acha a linha do catálogo pela forma canônica (sem query, com barra)', () => {
  assert.equal(linhaDoCatalogo(catalogo, 'https://stratai.com.br/kit/lead?utm_source=teste#x').id, 'stratai-kit-lead');
  assert.throws(() => linhaDoCatalogo(catalogo, 'https://stratai.com.br/nao-existe/'), /sem linha|não tem linha/);
});

test('perfil precisa existir e bater com o catálogo', () => {
  assert.deepEqual(PERFIS, ['venda', 'lead', 'conteudo']);
  assert.throws(() => plano('https://stratai.com.br/kit/lead/', 'conteudo'), /catálogo diz "lead"/);
  assert.throws(() => plano('https://stratai.com.br/kit/lead/', 'captura'), /não existe/);
});

test('venda: Rastro do produto e launcher da Hotmart, sem MetricaaS', () => {
  const p = plano('https://stratacademy.com.br/kit/venda/', 'venda');
  assert.deepEqual(srcs(p), ['https://tracking.stratacademy.com.br/sa?product=mentoria']);
  assert.equal(p.hotmart, '6f2c2394-9d1b-3999-9a14-087cfe3fd764');
  assert.equal(p.banner, false);
  assert.throws(() => falso({ perfil: 'venda', hotmart_conta: 'h' }), /rastro_slug/);
  assert.throws(() => falso({ perfil: 'venda', rastro_slug: 'r' }), /hotmart_conta/);
});

test('lead com Rastro: m.js primeiro e sem data-pixel (o pixel vem do Rastro)', () => {
  const p = plano('https://stratai.com.br/kit/lead/', 'lead');
  assert.deepEqual(srcs(p), ['https://t.metricaas.com.br/m.js', 'https://tracking.stratacademy.com.br/sa?product=stratai']);
  assert.deepEqual(p.scripts[0].attrs, { 'data-ws': 'agencia-strat' });
  assert.equal(p.hotmart, null);
});

test('lead sem Rastro e com banner: m.js liga o pixel e segura até o aceite', () => {
  const p = plano('https://agenciastrat.com.br/kit/lead/', 'lead');
  assert.deepEqual(srcs(p), ['https://t.metricaas.com.br/m.js']);
  assert.deepEqual(p.scripts[0].attrs, {
    'data-ws': 'strat-marketing', 'data-pixel': '1815630929780241', 'data-pixel-consent': 'aguardar',
  });
  assert.equal(p.banner, true);
  // consentimento off: pixel na hora, sem banner
  const off = plano('https://agenciastrat.com.br/advogados/', 'lead');
  assert.equal(off.banner, false);
  assert.equal(off.scripts[0].attrs['data-pixel-consent'], undefined);
});

test('lead precisa de MetricaaS ou Rastro; GA4 sem Rastro quebra (WEB-73)', () => {
  assert.throws(() => falso({}), /metricaas_ws ou rastro_slug/);
  assert.throws(() => falso({ metricaas_ws: 'w', ga4: 'G-1' }), /WEB-73/);
  assert.throws(() => falso({ perfil: 'conteudo', meta_pixel: '1' }), /ninguém carregaria o pixel/);
});

test('conteudo: o mesmo do site da marca, sem Hotmart', () => {
  const site = plano('https://stratai.com.br/', 'lead');
  const p = plano('https://stratai.com.br/kit/conteudo/', 'conteudo');
  assert.deepEqual(p.scripts, site.scripts);
  assert.equal(p.hotmart, null);
});

test('Rastro com banner quebra o build: a página não segura o pixel do Rastro (WEB-72)', () => {
  // Linha real: o site da Academy pede aceite hoje, mas o produto "site" no Rastro está em consentMode off.
  assert.throws(() => plano('https://stratacademy.com.br/', 'conteudo'), /consentimento "banner" com Rastro.*produto "site"/);
  assert.throws(() => falso({ rastro_slug: 'stratai', consentimento: 'banner' }), /WEB-72/);
  // off e soft com Rastro seguem montando: quem decide é o consentMode do produto, conferido pela CI.
  for (const consentimento of ['off', 'soft']) {
    const p = falso({ rastro_slug: 'stratai', consentimento });
    assert.deepEqual(srcs(p), ['https://tracking.stratacademy.com.br/sa?product=stratai']);
    assert.equal(p.banner, false);
  }
});

test('sem-tracking não carrega nada; Umami entra pelo proxy /u/ quando o id existe', () => {
  assert.deepEqual(plano('https://comunidade.stratacademy.com.br/', 'conteudo').scripts, []);
  const u = falso({ metricaas_ws: 'w', umami_website_id: 'abc-123' });
  assert.deepEqual(u.scripts.at(-1), { src: '/u/script.js', attrs: { 'data-website-id': 'abc-123' } });
});

// Linhas que o kit recusa de propósito até o WEB-72 (Rastro com banner). Linha nova nessa situação tem de entrar aqui.
const ESPERAM_WEB72 = ['academy'];

test('toda linha do catálogo gera um plano sem erro, menos as que esperam o WEB-72', () => {
  for (const l of catalogo.urls) {
    if (ESPERAM_WEB72.includes(l.id)) assert.throws(() => plano(l.url, l.perfil), /WEB-72/, l.id);
    else assert.doesNotThrow(() => plano(l.url, l.perfil), l.id);
  }
});
