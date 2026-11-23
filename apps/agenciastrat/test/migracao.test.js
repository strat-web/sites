import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
const app = new URL('../', import.meta.url);
const ler = (p) => readFileSync(new URL(p, app), 'utf8');
const origem = JSON.parse(ler('test/origem.json'));
const sha = (s) => createHash('sha256').update(s).digest('hex');
const texto = (s) => s.replace(/<script\b[^>]*>[\s\S]*?<\/script>|<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

test('texto visível e mídias da origem 05ca028 permanecem idênticos', () => {
  for (const [nome, hash] of Object.entries(origem.textos)) {
    assert.equal(sha(texto(ler(`src/html/${nome}.corpo.html`))), hash, nome);
  }
  for (const [arquivo, hash] of Object.entries(origem.midias)) {
    assert.equal(sha(readFileSync(new URL(`public/midia/${arquivo}`, app))), hash, arquivo);
  }
});

test('vídeos pesados da home saem do R2, não do app (decisão do Helbert, 19/11)', () => {
  const body = ler('src/html/home.corpo.html');
  for (const arquivo of Object.keys(origem.r2).filter((k) => !k.startsWith('_'))) {
    assert.ok(!existsSync(new URL(`public/midia/${arquivo}`, app)), `${arquivo} não pode ir no app`);
    assert.ok(body.includes(`src="https://assets.agenciastrat.com.br/midia/${arquivo}"`), `${arquivo} vem do R2`);
  }
});

test('formulário conserva chaves corrigidas e consentimento só tem um responsável', () => {
  const js = ler('public/js/agencia.js');
  for (const campo of ['instagram', 'empresa', 'segmento', 'faturamento', 'verba', 'servicos']) assert.ok(js.includes(`'${campo}'`) || js.includes(`${campo}:`));
  assert.match(js, /addEventListener\('click', \(e\) => \{ if \(!pronto\(\)\) e.preventDefault\(\)/);
  assert.doesNotMatch(js, /strat_cookies|\.consentir\(/);
  const body = ler('src/html/home.corpo.html');
  assert.doesNotMatch(body, /data-strat-leadform|t\.metricaas\.com\.br\/m\.js|connect\.facebook\.net/);
  assert.ok(body.includes('href="/politica-de-privacidade/"'));
});

test('build tem uma tag do MetricaaS na home e só Umami na política', { skip: !existsSync(fileURLToPath(new URL('dist/index.html', app))) }, () => {
  const home = ler('dist/index.html');
  assert.equal((home.match(/src="https:\/\/t\.metricaas\.com\.br\/m\.js"/g) || []).length, 1);
  assert.equal((home.match(/data-website-id="d99a9168-97eb-4681-bef7-7f78ed95f926"/g) || []).length, 1);
  assert.match(home, /data-pixel-consent="aguardar"/);
  const politica = ler('dist/politica-de-privacidade/index.html');
  assert.doesNotMatch(politica, /t\.metricaas\.com\.br\/m\.js|data-pixel=|tracking\.stratacademy/);
  assert.equal((politica.match(/data-website-id="d99a9168-97eb-4681-bef7-7f78ed95f926"/g) || []).length, 1);
});
