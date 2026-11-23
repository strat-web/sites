import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import {
  urlCanonica,
  caminhoCanonico,
  ehArquivo,
  dataDoDia,
  schemaMarca,
  schemaBreadcrumb,
  schemaFaq,
  jsonSeguro,
  marcas,
} from '../src/index.js';

const RAIZ = fileURLToPath(new URL('../../../', import.meta.url));

const site = 'https://stratai.com.br';

test('canonical: barra no fim, sem query nem âncora, só no domínio do site', () => {
  assert.equal(urlCanonica(site, '/agente-de-ia-whatsapp'), 'https://stratai.com.br/agente-de-ia-whatsapp/');
  assert.equal(urlCanonica(site, '/guias/?utm_source=x#topo'), 'https://stratai.com.br/guias/');
  assert.equal(urlCanonica(site, '/'), 'https://stratai.com.br/');
  assert.equal(urlCanonica(site, '/feed.xml'), 'https://stratai.com.br/feed.xml');
  assert.equal(urlCanonica(new URL(site), 'https://stratai.com.br/x'), 'https://stratai.com.br/x/');
  assert.throws(() => urlCanonica(new URL(site), 'https://stratai-ti7.pages.dev/x/'), /fora do site/);
  assert.throws(() => urlCanonica(site, 'https://agenciastrat.com.br/'), /fora do site/);
  assert.throws(() => urlCanonica(site, '//outro.com/x/'), /fora do site/);
  assert.throws(() => urlCanonica(site, 'http://stratai.com.br/x/'), /fora do site/);
  assert.throws(() => urlCanonica('https://stratai-ti7.pages.dev', '/'), /pages\.dev/);
  assert.throws(() => urlCanonica(undefined, '/'), /site/);
});

test('slug com ponto ganha a barra; só arquivo de verdade fica sem ela (WEB-77)', () => {
  assert.equal(urlCanonica(site, '/blog/gpt-4.1'), 'https://stratai.com.br/blog/gpt-4.1/');
  assert.equal(urlCanonica(site, '/blog/gpt-4.1/'), 'https://stratai.com.br/blog/gpt-4.1/');
  assert.equal(urlCanonica(site, '/guias/node.js-ou-python'), 'https://stratai.com.br/guias/node.js-ou-python/');
  assert.equal(urlCanonica(site, '/llms.txt'), 'https://stratai.com.br/llms.txt');
  assert.equal(urlCanonica(site, '/midia/logo/stratai.png'), 'https://stratai.com.br/midia/logo/stratai.png');
  assert.equal(ehArquivo('/sitemap.xml'), true);
  assert.equal(ehArquivo('/rss.XML'), true);
  assert.equal(ehArquivo('/blog/gpt-4.1'), false);
  assert.equal(ehArquivo('/.well-known'), false);
  assert.equal(ehArquivo('/'), false);
});

test('caminho canônico: o href interno sai com a barra, sem domínio, query nem âncora', () => {
  assert.equal(caminhoCanonico(site, '/guias'), '/guias/');
  assert.equal(caminhoCanonico(site, '/blog/gpt-4.1'), '/blog/gpt-4.1/');
  assert.equal(caminhoCanonico(site, '/guias/?utm_source=x#topo'), '/guias/');
  assert.equal(caminhoCanonico(site, '/'), '/');
  assert.throws(() => caminhoCanonico(site, 'https://agenciastrat.com.br/x'), /fora do site/);
});

test('data do dia: AAAA-MM-DD de texto ou Date; data inválida quebra o build', () => {
  assert.equal(dataDoDia('2026-11-12'), '2026-11-12');
  assert.equal(dataDoDia('2026-11-12T23:30:00-03:00'), '2026-11-12');
  assert.equal(dataDoDia(new Date('2026-11-10')), '2026-11-10');
  assert.throws(() => dataDoDia('ontem'), /data inválida/);
  assert.throws(() => dataDoDia(''), /data inválida/);
});

test('logo do JSON-LD: o logotipo da marca, no domínio dela e no public/ do app, nunca o og.png (WEB-77)', () => {
  const catalogo = JSON.parse(readFileSync(`${RAIZ}catalogo/sites.json`, 'utf8'));
  for (const chave of Object.keys(marcas)) {
    const s = schemaMarca(chave);
    assert.ok(s.logo, `${chave} sem logo`);
    assert.notEqual(s.logo, s.image, `${chave}: logo igual à imagem de compartilhamento`);
    assert.doesNotMatch(s.logo, /og(-default)?\.png$/, `${chave}: logo apontando para o og`);
    const u = new URL(s.logo);
    assert.equal(u.origin, new URL(s.url).origin, `${chave}: logo fora do domínio da marca`);
    assert.match(u.pathname, /\.(png|webp|svg|jpg)$/);
    // O arquivo mora no public/ do app do site da marca, no mesmo caminho da URL.
    const app = catalogo.urls.find((l) => l.marca === chave && l.tipo === 'site')?.app;
    assert.ok(app, `${chave} sem linha tipo site no catálogo`);
    assert.ok(existsSync(`${RAIZ}${app}/public${u.pathname}`), `${app}/public${u.pathname} não existe`);
  }
});

test('marca: toda marca tem nome, url com barra e imagem absoluta, e é filha do Grupo Strat', () => {
  for (const chave of Object.keys(marcas)) {
    const s = schemaMarca(chave);
    assert.ok(s.name);
    assert.match(s.url, /^https:\/\/[^/]+\/$/);
    assert.match(s.image, /^https:\/\//);
    assert.deepEqual(s.parentOrganization, { '@type': 'Organization', name: 'Grupo Strat' });
  }
  assert.equal(schemaMarca('stratai')['@type'], 'ProfessionalService');
  assert.equal(schemaMarca('agencia').address.addressLocality, 'Joinville');
  assert.throws(() => schemaMarca('strat'), /marca desconhecida/);
});

test('breadcrumb: posições em ordem e URLs absolutas com barra, inclusive slug com ponto', () => {
  const b = schemaBreadcrumb(
    [{ nome: 'Início', caminho: '/' }, { nome: 'Guias', caminho: '/guias' }, { nome: 'GPT-4.1', caminho: '/guias/gpt-4.1' }],
    site,
  );
  assert.deepEqual(b.itemListElement.map((i) => [i.position, i.item]), [
    [1, 'https://stratai.com.br/'],
    [2, 'https://stratai.com.br/guias/'],
    [3, 'https://stratai.com.br/guias/gpt-4.1/'],
  ]);
  assert.throws(() => schemaBreadcrumb([], site));
});

test('faq: texto igual ao recebido e pergunta vazia barra', () => {
  const f = schemaFaq([{ pergunta: 'Quanto custa?', resposta: 'Depende do escopo.' }]);
  assert.equal(f.mainEntity[0].name, 'Quanto custa?');
  assert.equal(f.mainEntity[0].acceptedAnswer.text, 'Depende do escopo.');
  assert.throws(() => schemaFaq([{ pergunta: 'Sem resposta', resposta: ' ' }]));
});

test('json seguro: "</script>" no texto não fecha a tag', () => {
  const s = jsonSeguro({ t: '</script><script>alert(1)</script>' });
  assert.ok(!s.includes('</script>'));
  assert.deepEqual(JSON.parse(s), { t: '</script><script>alert(1)</script>' });
});
