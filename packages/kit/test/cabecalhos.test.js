import { test } from 'node:test';
import assert from 'node:assert/strict';
import { montarHeaders, SEGURANCA } from '../src/index.js';

// Lê o _headers como o Pages: regra sem recuo, cabeçalhos com dois espaços embaixo.
function ler(texto) {
  const regras = new Map();
  let atual;
  for (const linha of texto.split('\n')) {
    if (!linha.trim() || linha.startsWith('#')) continue;
    if (!linha.startsWith(' ')) { atual = linha; regras.set(atual, {}); continue; }
    const [k, ...v] = linha.trim().split(':');
    regras.get(atual)[k] = v.join(':').trim();
  }
  return regras;
}

test('_headers: os cinco cabeçalhos de segurança em todas as páginas', () => {
  const r = ler(montarHeaders());
  assert.deepEqual(r.get('/*'), SEGURANCA);
  for (const k of ['Strict-Transport-Security', 'X-Content-Type-Options', 'Content-Security-Policy', 'Referrer-Policy', 'Permissions-Policy']) {
    assert.ok(r.get('/*')[k], k);
  }
});

test('_headers: HSTS sem includeSubDomains e CSP só com frame-ancestors', () => {
  assert.doesNotMatch(SEGURANCA['Strict-Transport-Security'], /includeSubDomains|preload/);
  assert.equal(SEGURANCA['Content-Security-Policy'], "frame-ancestors 'self'");
});

test('_headers: noindex no pages.dev de produção e nas prévias, nunca no domínio', () => {
  const r = ler(montarHeaders());
  assert.equal(r.get('https://:project.pages.dev/*')['X-Robots-Tag'], 'noindex');
  assert.equal(r.get('https://:version.:project.pages.dev/*')['X-Robots-Tag'], 'noindex');
  assert.equal(r.get('/*')['X-Robots-Tag'], undefined);
});
