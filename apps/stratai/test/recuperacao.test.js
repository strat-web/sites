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

test('cada URL do funil tem linha no catálogo, com noindex, soft no Rastro stratai-recuperacao e MetricaaS agencia-strat', () => {
  const { urls } = JSON.parse(ler(join(APP, '../../catalogo/sites.json')));
  const esperadas = [...VERSOES.map((v) => `https://stratai.com.br/recuperacao/${v}/`), 'https://stratai.com.br/recuperacao/cases/',
    ...CASES.map((c) => `https://stratai.com.br/recuperacao/cases/${c}/`)];
  for (const url of esperadas) {
    const l = urls.find((u) => u.url === url);
    assert.ok(l, `sem linha: ${url}`);
    assert.equal(l.indexar, false, `${url}: noindex enquanto é rascunho`);
    // decisão do Helbert no PR #24 (13/11): página nova de lead nasce em soft, com produto próprio no Rastro (regra do WEB-72)
    assert.equal(l.rastro_slug, 'stratai-recuperacao', url);
    assert.equal(l.consentimento, 'soft', url);
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
  // o mouse não pausa (pedido do Jhonathan); o foco do teclado e o toque pausam (WCAG 2.2.2, revisão do Helbert no PR #24)
  const css = ler(join(PUB, 'comum/laminas.css'));
  assert.doesNotMatch(css, /:hover[^{]*\{[^}]*animation-play-state/, 'o carrossel não pausa com o mouse');
  assert.match(css, /\.carrossel\.pausado \.carrossel-trilho[^{]*\{[^}]*animation-play-state:\s*paused/, 'existe a pausa');
  assert.match(laminas, /role="region" tabindex="0"/, 'o carrossel recebe o foco do teclado');
  assert.match(laminas, /addEventListener\('focusin'/, 'o foco pausa');
  assert.match(laminas, /ultimoPonteiro === 'touch'/, 'o toque pausa e solta');
});

// revisão do Helbert no PR #24 (13/11/2026)
const arquivosDoFunil = () => [...readdirSync(HTML).map((f) => join(HTML, f)), ...comum.map((f) => join(PUB, 'comum', f))];

test('envio do lead: prazo de 15 s, erro com tentar de novo e contato de reserva, nada apagado antes do OK', () => {
  const funil = ler(join(PUB, 'comum/funil.js'));
  assert.match(funil, /ESPERA_LEAD = 15000/, 'mtc.lead() com prazo de 15 s');
  assert.match(funil, /comPrazo\(m\.lead\(pedido\), ESPERA_LEAD\)/);
  assert.match(funil, /Promise\.reject\(/, 'falha rejeita a promessa (nada de protocolo inventado)');
  assert.match(funil, /funil_lead_erro/, 'evento de erro');
  assert.match(funil, /contato@strat\.tec\.br/, 'contato de reserva no erro');
  assert.match(funil, /botao: 'Tentar de novo'/);
  assert.doesNotMatch(funil, /\.catch\(function \(err\) \{[^}]*protocoloLocal/, 'erro não vira protocolo');
  // nas 3 formas, as respostas só são apagadas no caminho de sucesso
  for (const f of ['telas.js', 'raiox.js', 'conversa.js']) {
    const js = ler(join(PUB, 'comum', f));
    assert.match(js, /erroEnvioHTML|ERRO_ENVIO/, `${f}: mostra o erro`);
  }
});

test('nenhum dado pessoal no console (nome, telefone e e-mail do pedido)', () => {
  for (const f of comum) {
    const js = ler(join(PUB, 'comum', f));
    assert.doesNotMatch(js, /console\.\w+\([^;]*\bpedido\b/, `${f}: console com o pedido`);
    assert.doesNotMatch(js, /console\.\w+\([^;]*\bcontato\b/, `${f}: console com o contato`);
  }
});

test('sem data-strat-leadform: o Rastro não pode enviar o formulário por GET com os dados na URL (TRACK-47)', () => {
  for (const f of arquivosDoFunil()) assert.doesNotMatch(ler(f), /data-strat-leadform/, f);
});

test('sem CNPJ nos arquivos do funil (regra da casa)', () => {
  for (const f of arquivosDoFunil()) assert.doesNotMatch(ler(f), /\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}/, f);
});

test('a política de privacidade cita o funil: dados, nota que decide o evento na Meta, base legal e prazo', () => {
  const pol = ler(join(APP, 'src/html/politica-de-privacidade.corpo.html'));
  assert.match(pol, /Dados da análise de recuperação de vendas/);
  assert.match(pol, /site ou o @ do Instagram da empresa/);
  assert.match(pol, /faturamento mensal/);
  assert.match(pol, /vendas ficam paradas/);
  assert.match(pol, /ticket médio/);
  assert.match(pol, /nota interna \(A, B ou C\)/);
  assert.match(pol, /informado à Meta como lead qualificado/);
  assert.match(pol, /<td>Análise de recuperação de vendas<\/td>/, 'finalidade e base legal');
  assert.match(pol, /Análises de recuperação de vendas:<\/strong>/, 'prazo de guarda');
});

const DIST = join(APP, 'dist/recuperacao');
test('dist: as páginas do funil com o Tracking da linha do catálogo (Rastro stratai-recuperacao) e sem data-strat-leadform', { skip: !existsSync(DIST) && 'sem dist/: rode pnpm build antes' }, () => {
  for (const c of [...VERSOES, 'cases', ...CASES.map((s) => `cases/${s}`)]) {
    const html = readFileSync(join(DIST, c, 'index.html'), 'utf8');
    const scripts = [...html.matchAll(/<script[^>]*\bsrc="(https:[^"]+)"[^>]*>/g)].map((m) => m[0]);
    assert.deepEqual(scripts, [
      '<script defer src="https://t.metricaas.com.br/m.js" data-ws="agencia-strat">',
      '<script defer src="https://tracking.stratacademy.com.br/sa?product=stratai-recuperacao">',
    ], c);
    assert.doesNotMatch(html, /data-strat-leadform/, c);
    assert.match(html, /<meta name="robots" content="noindex/, `${c}: noindex enquanto é rascunho`);
  }
});
