import { test } from 'node:test';
import assert from 'node:assert/strict';
import { urlCanonica, schemaMarca, schemaBreadcrumb, schemaFaq, jsonSeguro, marcas } from '../src/index.js';

const site = 'https://stratai.com.br';

test('canonical: barra no fim, sem query nem âncora, no domínio do site', () => {
  assert.equal(urlCanonica(site, '/agente-de-ia-whatsapp'), 'https://stratai.com.br/agente-de-ia-whatsapp/');
  assert.equal(urlCanonica(site, '/guias/?utm_source=x#topo'), 'https://stratai.com.br/guias/');
  assert.equal(urlCanonica(site, '/'), 'https://stratai.com.br/');
  assert.equal(urlCanonica(site, '/feed.xml'), 'https://stratai.com.br/feed.xml');
  assert.equal(urlCanonica(new URL(site), 'https://stratai-ti7.pages.dev/x/'), 'https://stratai-ti7.pages.dev/x/');
  assert.throws(() => urlCanonica(undefined, '/'), /site/);
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

test('breadcrumb: posições em ordem e URLs absolutas com barra', () => {
  const b = schemaBreadcrumb([{ nome: 'Início', caminho: '/' }, { nome: 'Guias', caminho: '/guias' }], site);
  assert.deepEqual(b.itemListElement.map((i) => [i.position, i.item]), [
    [1, 'https://stratai.com.br/'],
    [2, 'https://stratai.com.br/guias/'],
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
