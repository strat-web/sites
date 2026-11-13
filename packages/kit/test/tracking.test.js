import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { planoDeTracking, linhaDoCatalogo, PERFIS, CONSENT_MODE_DO_RASTRO, consentModeEsperado } from '../src/index.js';

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
  assert.equal(linhaDoCatalogo(catalogo, 'https://stratai.com.br/raio-x?utm_source=teste#x').id, 'stratai-raio-x');
  assert.throws(() => linhaDoCatalogo(catalogo, 'https://stratai.com.br/nao-existe/'), /sem linha|não tem linha/);
});

test('perfil precisa existir e bater com o catálogo', () => {
  assert.deepEqual(PERFIS, ['venda', 'lead', 'conteudo']);
  assert.throws(() => plano('https://stratai.com.br/', 'conteudo'), /catálogo diz "lead"/);
  assert.throws(() => plano('https://stratai.com.br/', 'captura'), /não existe/);
});

test('venda: Rastro do produto e launcher da Hotmart, sem MetricaaS', () => {
  const p = plano('https://stratacademy.com.br/kit/venda/', 'venda');
  assert.deepEqual(srcs(p), ['https://tracking.stratacademy.com.br/sa?product=mentoria', '/u/script.js']);
  assert.equal(p.hotmart, '6f2c2394-9d1b-3999-9a14-087cfe3fd764');
  assert.equal(p.banner, false);
  assert.throws(() => falso({ perfil: 'venda', hotmart_conta: 'h' }), /rastro_slug/);
  assert.throws(() => falso({ perfil: 'venda', rastro_slug: 'r' }), /hotmart_conta/);
});

test('lead com Rastro: m.js primeiro e sem data-pixel (o pixel vem do Rastro)', () => {
  // Linha real: a home da StratAI (as páginas de teste /kit/ saíram antes da virada do domínio, WEB-32).
  const p = plano('https://stratai.com.br/', 'lead');
  assert.deepEqual(srcs(p), ['https://t.metricaas.com.br/m.js', 'https://tracking.stratacademy.com.br/sa?product=stratai', '/u/script.js']);
  // Umami do Strat Tracking: o website do host stratai.com.br (TRACK-8)
  assert.deepEqual(p.scripts[2].attrs, { 'data-website-id': 'd6394916-40aa-45da-b80e-7285ec5bcb45' });
  assert.deepEqual(p.scripts[0].attrs, { 'data-ws': 'agencia-strat' });
  assert.equal(p.hotmart, null);
});

test('lead sem Rastro e com banner: m.js liga o pixel e segura até o aceite', () => {
  const p = plano('https://agenciastrat.com.br/kit/lead/', 'lead');
  assert.deepEqual(srcs(p), ['https://t.metricaas.com.br/m.js', '/u/script.js']);
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
  // Os mesmos ids da home da StratAI, com o perfil lead e com o perfil conteudo.
  const ids = {
    rastro_slug: 'stratai', metricaas_ws: 'agencia-strat', meta_pixel: '1823024821883911', ga4: 'G-3VJ019EH58',
    google_tag: 'GT-M6J6NZQW', umami_website_id: 'd6394916-40aa-45da-b80e-7285ec5bcb45',
  };
  const site = falso({ ...ids, perfil: 'lead' });
  const p = falso({ ...ids, perfil: 'conteudo' });
  assert.deepEqual(p.scripts, site.scripts);
  assert.equal(p.hotmart, null);
});

test('Rastro com banner monta: o produto tem de estar em strict e o banner do kit não entra (WEB-81)', () => {
  // Linha real: a home da Academy (banner) com o produto "site" do Rastro, em strict desde 11/11.
  const home = plano('https://stratacademy.com.br/', 'conteudo');
  assert.deepEqual(srcs(home), ['https://tracking.stratacademy.com.br/sa?product=site', '/u/script.js']);
  assert.equal(home.consentMode, 'strict');
  assert.equal(home.banner, false);
  // Página de teste com a mesma configuração (noindex).
  const teste = plano('https://stratacademy.com.br/kit/conteudo/', 'conteudo');
  assert.deepEqual(teste.scripts, home.scripts);
  assert.equal(teste.consentMode, 'strict');
  // Lead com Rastro, MetricaaS e banner: m.js sem data-pixel nem data-pixel-consent, e sem o banner do kit.
  const lead = falso({ rastro_slug: 'stratai', metricaas_ws: 'w', meta_pixel: '1', consentimento: 'banner' });
  assert.deepEqual(lead.scripts[0], { src: 'https://t.metricaas.com.br/m.js', attrs: { 'data-ws': 'w' } });
  assert.equal(lead.banner, false);
  assert.equal(lead.consentMode, 'strict');
});

test('venda com banner e Rastro quebra o build: o launcher da Hotmart sairia antes do aceite (WEB-85)', () => {
  const venda = { perfil: 'venda', rastro_slug: 'mentoria', hotmart_conta: 'h' };
  assert.throws(() => falso({ ...venda, consentimento: 'banner' }), /perfil venda com consentimento "banner" e Rastro.*WEB-85/);
  // soft e off montam com o launcher (em soft e off o Rastro não pede aceite antes de carregar nada).
  for (const consentimento of ['soft', 'off']) {
    const p = falso({ ...venda, consentimento });
    assert.equal(p.hotmart, 'h', consentimento);
    assert.equal(p.banner, false, consentimento);
  }
  // Lead e conteúdo com Rastro e banner continuam montando: não há launcher.
  assert.equal(falso({ perfil: 'conteudo', rastro_slug: 'site', consentimento: 'banner' }).hotmart, null);
  // Nenhuma linha do catálogo de hoje está em venda + banner.
  assert.deepEqual(catalogo.urls.filter((l) => l.perfil === 'venda' && l.consentimento === 'banner').map((l) => l.id), []);
});

test('consentimento × consentMode do Rastro: banner = strict, soft = soft, off = off; o resto não tem par', () => {
  assert.deepEqual({ ...CONSENT_MODE_DO_RASTRO }, { banner: 'strict', soft: 'soft', off: 'off' });
  assert.equal(consentModeEsperado('banner'), 'strict');
  for (const v of ['sem-tracking', 'por-funil', 'strict', 'toString', undefined]) assert.equal(consentModeEsperado(v), null, String(v));
  for (const [consentimento, consentMode] of Object.entries(CONSENT_MODE_DO_RASTRO)) {
    const p = falso({ rastro_slug: 'stratai', consentimento });
    assert.deepEqual(srcs(p), ['https://tracking.stratacademy.com.br/sa?product=stratai']);
    assert.equal(p.consentMode, consentMode);
    assert.equal(p.banner, false);
  }
  // Valor fora da regra com Rastro quebra o build (a checagem catalogo também barra o valor).
  assert.throws(() => falso({ rastro_slug: 'stratai', consentimento: 'strict' }), /não tem consentMode equivalente/);
  // Sem Rastro não há consentMode a conferir.
  assert.equal(plano('https://agenciastrat.com.br/kit/lead/', 'lead').consentMode, null);
});

test('sem-tracking e por-funil não carregam nada; Umami entra pelo proxy /u/ quando o id existe', () => {
  assert.deepEqual(plano('https://comunidade.stratacademy.com.br/', 'conteudo').scripts, []);
  assert.deepEqual(falso({ metricaas_ws: 'w', consentimento: 'sem-tracking' }).scripts, []);
  const u = falso({ metricaas_ws: 'w', umami_website_id: 'abc-123' });
  assert.deepEqual(u.scripts.at(-1), { src: '/u/script.js', attrs: { 'data-website-id': 'abc-123' } });
});

test('toda linha do catálogo gera um plano sem erro', () => {
  for (const l of catalogo.urls) assert.doesNotThrow(() => plano(l.url, l.perfil), l.id);
});
