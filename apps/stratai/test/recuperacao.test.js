// Funil de recuperação de vendas em /recuperacao/ (WEB-91, vindo da DEV-94). O miolo das 4 versões mora em
// src/html/recuperacao/ e os arquivos do funil em public/recuperacao/ (gerados pelo FunilRecuperacao-StratAI/
// scripts/para-o-repo.py). Estes testes garantem que nada de tracking entre colado, que tudo o que as páginas citam
// exista, que cada URL tenha linha no catálogo e que as regras pedidas pelo Jhonathan não voltem atrás.
import { runInNewContext } from 'node:vm';
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

test('fontes pelo próprio site, sem a folha do Google (o LCP no celular oscilava na CI)', () => {
  const casos = ['src/pages/recuperacao/cases/index.astro', 'src/pages/recuperacao/cases/[slug]/index.astro'].map((c) => join(APP, c));
  for (const f of [...arquivosDoFunil(), ...casos]) assert.doesNotMatch(ler(f), /fonts\.(googleapis|gstatic)\.com/, f);
  for (const f of ['space-grotesk-latin.woff2', 'jetbrains-mono-500-latin.woff2', 'OFL-SpaceGrotesk.txt', 'OFL-JetBrainsMono.txt'])
    assert.ok(existsSync(join(APP, 'public/fontes', f)), `public/fontes/${f}`);
  assert.match(ler(join(PUB, 'comum/base.css')), /url\("\/fontes\/space-grotesk-latin\.woff2"\)/);
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

test('cases montam sem carregar o motor de perguntas do funil', () => {
  const app = { innerHTML: '' };
  const contexto = { window: {}, document: { getElementById: () => app } };
  runInNewContext(ler(join(PUB, 'comum/cases.js')), contexto);
  contexto.window.CASES.lista('../');
  assert.match(app.innerHTML, /Só Churrasco/);
  for (const slug of CASES) {
    contexto.window.CASES.pagina(slug, '../../');
    assert.match(app.innerHTML, /cs-foto/);
    assert.match(app.innerHTML, /cases\/midia\//);
    assert.match(app.innerHTML, /v1\//);
  }
});

// Regras com teste (revisão do Helbert no PR #24, itens "para depois"): classificação, estimativa, validação e o que
// fica guardado no navegador. O funil.js roda num contexto isolado, com um localStorage de mentira.
const R = {
  A: { canal: 'plataforma', faturamento: '100a500', conversao: 'menos5', hoje: 'nada', volume: '200a1000', ticket: '500a2000', acordo: 'sim' },
  C: { canal: 'whatsapp', faturamento: 'ate20', conversao: '8mais', hoje: 'ferramenta', volume: 'ate50', ticket: 'ate100', acordo: 'entender' },
  B: { canal: 'loja', faturamento: '20a100', conversao: 'naosei', hoje: 'time', volume: 'naosei', ticket: '100a500', acordo: 'sim' }
};
function carregarFunil() {
  const loja = {};
  const ctx = {
    location: { hostname: 'teste', search: '' },
    localStorage: { getItem: (k) => (k in loja ? loja[k] : null), setItem: (k, v) => { loja[k] = String(v); }, removeItem: (k) => { delete loja[k]; } }
  };
  ctx.window = ctx;
  runInNewContext(ler(join(PUB, 'comum/funil.js')), ctx);
  return { F: ctx.window.FUNIL, loja };
}

test('classificar: A, B e C pelos pontos, e operação pequena é sempre C', () => {
  const { F } = carregarFunil();
  assert.equal(F.classificar(R.A).classe, 'A');
  assert.equal(F.classificar(R.B).classe, 'B');
  assert.equal(F.classificar(R.C).classe, 'C');
  assert.equal(F.classificar(R.A).pontos, F.classificar(R.A).maximo, 'o caminho A soma o máximo');
  assert.equal(F.classificar({ ...R.A, faturamento: 'ate20' }).classe, 'C', 'faturamento até 20 mil');
  assert.equal(F.classificar({ ...R.A, volume: 'ate50', ticket: 'ate100' }).classe, 'C', 'pouco volume e ticket baixo');
  assert.equal(F.classificar({}).classe, 'C', 'sem resposta');
});

test('estimar: vendas paradas × ticket médio × 8% a 15%, e nada de número quando falta faixa', () => {
  const { F } = carregarFunil();
  assert.equal(F.CONFIG.recuperacaoMin, 0.08, 'a página promete 8%');
  assert.equal(F.CONFIG.recuperacaoMax, 0.15, 'a página promete 15%');
  const e = F.estimar(R.A);
  assert.equal(e.parado, e.vendas * e.ticket);
  assert.equal(e.min, e.parado * 0.08);
  assert.equal(e.max, e.parado * 0.15);
  const semVolume = F.estimar(R.B); // "não sei dizer" no volume
  assert.equal(semVolume.parado, null);
  assert.equal(semVolume.min, null);
  assert.equal(F.dinheiro(null), '[X]', 'sem número, a tela mostra [X]');
});

test('validar: nome, WhatsApp com DDD, e-mail e site ou @ da empresa', () => {
  const { F } = carregarFunil();
  assert.equal(F.validar('nome', 'Ana Souza'), '');
  assert.notEqual(F.validar('nome', 'A'), '');
  assert.notEqual(F.validar('nome', 'Ana 2'), '', 'nome com número');
  assert.equal(F.validar('whatsapp', '(47) 99999-8888'), '');
  assert.equal(F.validar('whatsapp', '+55 47 3333-4444'), '', 'fixo com o 55 na frente');
  assert.notEqual(F.validar('whatsapp', '4799'), '');
  assert.equal(F.validar('email', 'ana@empresa.com.br'), '');
  assert.equal(F.validar('email', 'ana@gmail.con'), '', 'o erro comum de domínio é corrigido antes');
  assert.equal(F.corrigirEmail(' Ana@Gmail.con '), 'ana@gmail.com');
  assert.notEqual(F.validar('email', 'ana@empresa'), '');
  assert.equal(F.validar('empresa', '@lojaana'), '');
  assert.notEqual(F.validar('empresa', 'ab'), '');
  assert.equal(F.mascaraTelefone('47999998888'), '(47) 99999-8888');
});

test('o navegador guarda só as respostas: nome, WhatsApp, e-mail e empresa nunca vão para o localStorage', () => {
  const { F, loja } = carregarFunil();
  F.salvar('v1', { tela: 'contato', r: R.A, contato: { nome: 'Ana Souza', whatsapp: '(47) 99999-8888', email: 'ana@empresa.com.br', empresa: '@lojaana' } });
  F.salvar('v3', { fase: 'campo', r: R.A, contato: { nome: 'Ana Souza' }, hist: [{ de: 'eu', html: 'Loja virtual' }, { de: 'eu', html: 'Ana Souza', p: 1 }] });
  const tudo = JSON.stringify(loja);
  for (const dado of ['Ana Souza', '99999-8888', 'ana@empresa', '@lojaana']) assert.ok(!tudo.includes(dado), `vazou: ${dado}`);
  assert.match(tudo, /Loja virtual/, 'a conversa antes do contato continua guardada');
  const v1 = F.carregar('v1');
  // JSON: o objeto vem de outro contexto (vm), e o deepEqual estrito compara o protótipo
  assert.equal(JSON.stringify(v1.r), JSON.stringify(R.A), 'as respostas voltam');
  assert.equal(JSON.stringify(v1.contato), '{}', 'o contato volta vazio');
  // a V3 marca as mensagens da fase de contato (e do fim, que cita o nome) para não irem ao navegador
  const conversa = ler(join(PUB, 'comum/conversa.js'));
  assert.match(conversa, /FASES_CONTATO = \{ contato: 1, campo: 1, confirmar: 1, enviando: 1, fim: 1 \}/);
  for (const f of ['telas.js', 'raiox.js']) assert.doesNotMatch(ler(join(PUB, 'comum', f)), /st\.contato\[e\.target\.name\] = e\.target\.value; guardar\(\)/, `${f}: não salva a cada tecla`);
});

test('títulos montados por JS são <h2>: o <h1> único de cada página fica no HTML', () => {
  for (const f of comum) assert.doesNotMatch(ler(join(PUB, 'comum', f)), /<h1[\s>]/, f);
});

test('o carrossel só anima enquanto está na tela', () => {
  const laminas = ler(join(PUB, 'comum/laminas.js'));
  assert.match(laminas, /new IntersectionObserver\(/);
  assert.doesNotMatch(laminas, /requestAnimationFrame\(orbitar\)/, 'o laço antigo, que rodava para sempre');
});

test('arquivos gerados: cabeçalho "Gerado por" e nenhum comentário interno servido ao navegador', () => {
  const comuns = readdirSync(join(PUB, 'comum')).filter((f) => /\.(js|css)$/.test(f));
  for (const f of comuns) {
    const txt = ler(join(PUB, 'comum', f));
    assert.match(txt.split('\n')[0], /^\/\* Gerado por FunilRecuperacao-StratAI\/scripts\/para-o-repo\.py/, `${f}: cabeçalho`);
    assert.doesNotMatch(txt.slice(txt.indexOf('*/') + 2), /\/\*|(^|[^:'"])\/\/(?![\w.-]+\.\w)/m, `${f}: comentário depois do cabeçalho`);
  }
  for (const f of arquivosDoFunil()) {
    assert.doesNotMatch(ler(f), /vault|C0\d\d\b|CONTATO-\d|plaquinha|DEV-\d|TRACK-\d|pedido do Jhonathan/i, `${f}: referência interna`);
  }
});
