// WEB-24: /advogados (v1) e /advogados/v2/ migrados do strat-lps sem mudar texto, telas nem tracking.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const app = new URL('../', import.meta.url);
const ler = (p) => readFileSync(new URL(p, app), 'utf8');
const origem = JSON.parse(ler('test/advogados-origem.json'));
const sha = (s) => createHash('sha256').update(s).digest('hex');
const texto = (s) => s.replace(/<script\b[^>]*>[\s\S]*?<\/script>|<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const scripts = (s) => (s.match(/<script\b[^>]*>[\s\S]*?<\/script>/g) || []).join('\n');
const PAGINAS = { advogados: 'dist/advogados/index.html', 'advogados-v2': 'dist/advogados/v2/index.html' };

// A única mudança no HTML e no script das telas (WEB-24): a capa vem desenhada no <main> e o renderCover só a redesenha
// quando a pessoa volta para ela. Desfeita, a página tem de ser a da origem.
const CAPA_NO_HTML = /(<main id="app" aria-live="polite") data-capa-no-html>[\s\S]*?(<\/main>)/;
const PATCH_CAPA = /var capa = ('<section class="screen )([\s\S]*?<\/section>';)\n    \/\/ WEB-24:[^\n]*\n    \/\/ [^\n]*\n    if \(!app\.hasAttribute\('data-capa-no-html'\)\) app\.innerHTML = capa;\n    app\.removeAttribute\('data-capa-no-html'\);/;
const original = (corpo) => corpo.replace(CAPA_NO_HTML, '$1>$2').replace(PATCH_CAPA, 'app.innerHTML = $1$2');

test('texto, script das telas e mídias iguais aos da origem 05ca028 (fora a capa no HTML)', () => {
  for (const nome of Object.keys(PAGINAS)) {
    const corpo = ler(`src/html/${nome}.corpo.html`);
    assert.match(corpo, CAPA_NO_HTML, `${nome}: capa no <main>`);
    assert.match(corpo, PATCH_CAPA, `${nome}: renderCover com a capa no HTML`);
    assert.equal(sha(texto(original(corpo))), origem.textos[nome], `texto de ${nome}`);
    assert.equal(sha(scripts(original(corpo))), origem.scripts[nome], `script de ${nome}`);
    // Um H1 na marcação (o da capa); os das outras telas ficam nas strings do script.
    const marcacao = corpo.replace(/<script\b[^>]*>[\s\S]*?<\/script>/g, '');
    assert.equal((marcacao.match(/<h1\b/g) || []).length, 1, `${nome}: um H1`);
  }
  for (const [arquivo, hash] of Object.entries(origem.midias)) {
    assert.equal(sha(readFileSync(new URL(`public/midia/${arquivo}`, app))), hash, arquivo);
  }
});

test('a página não injeta mais a tag nem pixel por conta própria', () => {
  for (const nome of Object.keys(PAGINAS)) {
    const html = ler(`src/html/${nome}.head.html`) + ler(`src/html/${nome}.corpo.html`);
    assert.doesNotMatch(html, /t\.metricaas\.com\.br\/m\.js|connect\.facebook\.net|createElement\('script'\)/, nome);
    assert.doesNotMatch(html, /\.\.\/\.\.\/midia\//, `${nome}: mídia com caminho relativo`);
    assert.match(html, /consentimentoPixel: false,/, `${nome}: banner antigo da página desligado`);
    assert.match(html, /agendaNaPagina: true,/, `${nome}: agenda na página`);
    assert.match(html, /metricaasWorkspace: 'strat-marketing'/, nome);
    // Fontes do app no lugar da folha do Google, que bloqueava a renderização (como no WEB-87).
    assert.doesNotMatch(html, /fonts\.googleapis\.com|fonts\.gstatic\.com/, `${nome}: Google Fonts`);
    for (const [, arquivo] of html.matchAll(/url\("\/fontes\/([^"]+)"\)/g)) {
      assert.ok(existsSync(fileURLToPath(new URL(`public/fontes/${arquivo}`, app))), `${nome}: falta public/fontes/${arquivo}`);
    }
  }
});

test('build: uma tag do MetricaaS com o pixel, sem esperar aceite, e Umami', { skip: !existsSync(fileURLToPath(new URL(PAGINAS.advogados, app))) }, () => {
  for (const [nome, arquivo] of Object.entries(PAGINAS)) {
    const html = ler(arquivo);
    const tags = html.match(/<script[^>]*src="https:\/\/t\.metricaas\.com\.br\/m\.js"[^>]*>/g) || [];
    assert.equal(tags.length, 1, `${nome}: uma tag`);
    assert.match(tags[0], /data-ws="strat-marketing"/);
    assert.match(tags[0], /data-pixel="1815630929780241"/);
    assert.doesNotMatch(tags[0], /data-pixel-consent/, `${nome}: consentimento off (decisão de 02/11)`);
    assert.equal((html.match(/data-website-id="d99a9168-97eb-4681-bef7-7f78ed95f926"/g) || []).length, 1);
  }
  assert.match(ler(PAGINAS.advogados), /<meta name="robots" content="index, follow">/);
  assert.match(ler(PAGINAS['advogados-v2']), /<meta name="robots" content="noindex, nofollow">/);
});

test('build: a capa no HTML é a mesma que o script desenha (v1: ícone, título e 4 pontos; v2: foto e botão)', { skip: !existsSync(fileURLToPath(new URL(PAGINAS.advogados, app))) }, () => {
  const v1 = ler(PAGINAS.advogados);
  assert.match(v1, /<main id="app" aria-live="polite" data-capa-no-html><section class="screen cover"><h1><span aria-hidden="true">⚖️<\/span> <strong>Advogados:<\/strong>/);
  const capaV1 = v1.match(/<main id="app"[^>]*>([\s\S]*?)<\/main>/)[1];
  assert.equal((capaV1.match(/<li><span aria-hidden="true">/g) || []).length, 4);
  const v2 = ler(PAGINAS['advogados-v2']);
  assert.match(v2, /data-capa-no-html><section class="screen capa">/);
  assert.match(v2, /<button type="button" class="cta" id="comecar">/);
  assert.match(v2, /<img src="\/midia\/time\/time-agencia-800\.webp"[^>]*fetchpriority="high"/);
});
