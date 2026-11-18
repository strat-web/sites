import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { request } from 'node:http';
import { gunzipSync } from 'node:zlib';
import { servirDist } from '../src/peso.js';

function ler(porta, caminho, encoding, method = 'GET') {
  return new Promise((resolve, reject) => {
    const req = request({ hostname: '127.0.0.1', port: porta, path: caminho, method,
      headers: encoding === undefined ? {} : { 'accept-encoding': encoding } }, (res) => {
      const partes = [];
      res.on('data', (p) => partes.push(p));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(partes) }));
      res.on('error', reject);
    });
    req.on('error', reject);
    req.end();
  });
}

test('servidor negocia gzip sem mudar o conteúdo nem comprimir imagens', async (t) => {
  const dist = mkdtempSync(join(tmpdir(), 'web88-'));
  const html = '<h1>Conteúdo de teste</h1>'.repeat(1000);
  const imagem = Buffer.from([0, 1, 2, 255]);
  writeFileSync(join(dist, 'index.html'), html);
  writeFileSync(join(dist, 'imagem.webp'), imagem);
  const { servidor, porta } = await servirDist(dist);
  t.after(async () => {
    await new Promise((resolve) => servidor.close(resolve));
    rmSync(dist, { recursive: true });
  });
  for (const encoding of ['gzip', 'br, gzip', '*;q=0.5']) {
    const r = await ler(porta, '/', encoding);
    assert.equal(r.status, 200);
    assert.equal(r.headers['content-encoding'], 'gzip');
    assert.equal(r.headers.vary, 'Accept-Encoding');
    assert.equal(gunzipSync(r.body).toString(), html);
    assert.ok(r.body.length < Buffer.byteLength(html) / 2);
  }
  for (const encoding of [undefined, 'br', 'gzip;q=0', '*;q=1, gzip;q=0']) {
    const r = await ler(porta, '/', encoding);
    assert.equal(r.headers['content-encoding'], undefined);
    assert.equal(r.body.toString(), html);
    assert.equal(r.headers.vary, 'Accept-Encoding');
  }
  const r = await ler(porta, '/imagem.webp', 'gzip');
  assert.equal(r.headers['content-encoding'], undefined);
  assert.deepEqual(r.body, imagem);
  assert.equal((await ler(porta, '/ausente', 'gzip')).status, 404);
  const head = await ler(porta, '/', 'gzip', 'HEAD');
  assert.equal(head.headers['content-encoding'], 'gzip');
  assert.equal(head.body.length, 0);
});
