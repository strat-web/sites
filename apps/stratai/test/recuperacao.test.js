// Funil de recuperação de vendas em /recuperacao/ (WEB-91, vindo da DEV-94). O miolo das 4 versões mora em
// src/html/recuperacao/ e os arquivos do funil em public/recuperacao/ (gerados pelo FunilRecuperacao-StratAI/
// scripts/para-o-repo.py). Estes testes garantem que nada de tracking entre colado, que tudo o que as páginas citam
// exista, que cada URL tenha linha no catálogo e que as regras pedidas pelo Jhonathan não voltem atrás.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP = join(dirname(fileURLToPath(import.meta.url)), '..');
const HTML = join(APP, 'src/html/recuperacao');
const PUB = join(APP, 'public/recuperacao');
const ler = (p) => readFileSync(p, 'utf8');
const VERSOES = ['v1', 'v2', 'v3', 'v4'];
const CASES = ['schatz', 'so-churrasco', 'guizeline', 'vida-probioticos', 'contato'];
const comum = readdirSync(join(PUB, 'comum')).filter((f) => f.endsWith('.js'));

test('as 4 versões têm head e corpo, e o corpo tem um <h1> só', () => {
  for (const v of VERSOES) {
    assert.ok(existsSync(join(HTML, `${v}.head.html`)), `${v}.head.html`);
    const corpo = ler(join(HTML, `${v}.corpo.html`));
    assert.equal((corpo.match(/<h1[\s>]/g) || []).length, 1, `${v}: um <h1>`);
  }
});

test('nenhum script de tracking colado: o m.js, o Rastro e o pixel vêm do <Tracking> do kit', () => {
  const proibidos = [/tracking\.stratacademy\.com\.br\/sa/, /t\.metricaas\.com\.br\/m\.js/, /connect\.facebook\.net/, /googletagmanager/, /\bfbq\s*\(/, /\bgtag\s*\(/];
  const arquivos = [...readdirSync(HTML).map((f) => join(HTML, f)), ...comum.map((f) => join(PUB, 'comum', f))];
  for (const f of arquivos) for (const re of proibidos) assert.doesNotMatch(ler(f), re, `${f}: ${re}`);
});

test('as tags que o kit gera não se repetem no head das versões', () => {
  const doKit = [/<title>/, /name="description"/, /rel="canonical"/, /property="og:/, /name="viewport"/, /charset=/, /name="robots"/];
  for (const v of VERSOES) for (const re of doKit) assert.doesNotMatch(ler(join(HTML, `${v}.head.html`)), re, `${v}: ${re}`);
});

test('todo arquivo do funil citado nas páginas existe em public/', () => {
  for (const f of readdirSync(HTML)) {
    const caminhos = [...ler(join(HTML, f)).matchAll(/(?:src|href)="\/(recuperacao\/[^"?#]+)"/g)].map((m) => m[1]);
    assert.ok(caminhos.length > 0, `${f} cita arquivos do funil`);
    for (const c of caminhos) assert.ok(existsSync(join(APP, 'public', c)), `${f}: ${c}`);
  }
  // fotos e logos dos cases citados no cases.js
  const cases = ler(join(PUB, 'comum/cases.js'));
  for (const [, arq] of cases.matchAll(/(?:logo|foto): '([^']+\.(?:jpg|png))'/g)) assert.ok(existsSync(join(PUB, 'cases/midia', arq)), arq);
});

test('cada URL do funil tem linha no catálogo, com noindex, Rastro stratai e MetricaaS agencia-strat', () => {
  const { urls } = JSON.parse(ler(join(APP, '../../catalogo/sites.json')));
  const esperadas = [...VERSOES.map((v) => `https://stratai.com.br/recuperacao/${v}/`), 'https://stratai.com.br/recuperacao/cases/',
    ...CASES.map((c) => `https://stratai.com.br/recuperacao/cases/${c}/`)];
  for (const url of esperadas) {
    const l = urls.find((u) => u.url === url);
    assert.ok(l, `sem linha: ${url}`);
    assert.equal(l.indexar, false, `${url}: noindex enquanto é rascunho`);
    assert.equal(l.rastro_slug, 'stratai', url);
    assert.equal(l.metricaas_ws, 'agencia-strat', url);
  }
  const rota = ler(join(APP, 'src/pages/recuperacao/cases/[slug]/index.astro'));
  for (const c of CASES) assert.match(rota, new RegExp(`slug: '${c}'`), `rota do case ${c}`);
});

test('regras do funil pedidas pelo Jhonathan (12/11/2026)', () => {
  const funil = ler(join(PUB, 'comum/funil.js'));
  assert.doesNotMatch(funil, /id: 'acesso'/, 'a pergunta do acesso ao checkout (webhook) saiu');
  assert.doesNotMatch(funil, /reacao:/, 'sem reações embaixo das opções');
  assert.match(funil, /não garante o avanço para a implementação/, 'aviso em vermelho no contato');
  assert.match(funil, /politica-de-privacidade\//, 'link da política no formulário');
  const laminas = ler(join(PUB, 'comum/laminas.js'));
  const slide = laminas.slice(laminas.indexOf('function slide('), laminas.indexOf('function cases('));
  assert.doesNotMatch(slide, /<a\s/, 'os cards do carrossel não são clicáveis');
  assert.doesNotMatch(ler(join(PUB, 'comum/laminas.css')), /animation-play-state:\s*paused/, 'o carrossel não pausa com o mouse');
});
