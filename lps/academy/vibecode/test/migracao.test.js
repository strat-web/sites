// Migração da LP vibecode.stratacademy.com.br do strat-lps (lps/vibecode) para o Pages (WEB-48): captação de lead, sem
// checkout. O HTML de cada versão mora em src/html/ e o kit põe o <head> de SEO e o <Tracking> perfil lead (Rastro
// aula-claude-code). Estes testes garantem que nada de tracking volte colado à mão (o GTM da V1 saiu), que a página não
// ganhe a Hotmart, que o caminho do lead continue o mesmo e que todo arquivo citado exista em public/.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP = join(dirname(fileURLToPath(import.meta.url)), '..');
const HTML = join(APP, 'src/html');
const PAGINAS = { home: '/', v1: '/v1/' };
const fragmentos = readdirSync(HTML).filter((f) => f.endsWith('.html'));
const ler = (f) => readFileSync(join(HTML, f), 'utf8');
const N8N = 'https://n8nwebhook.strat.tec.br/webhook/31d85ee0-7459-41c5-be29-6c423d8affd6';

test('as duas versões têm head e corpo', () => {
  for (const p of Object.keys(PAGINAS)) {
    assert.ok(fragmentos.includes(`${p}.head.html`), `${p}.head.html`);
    assert.ok(fragmentos.includes(`${p}.corpo.html`), `${p}.corpo.html`);
  }
});

test('nenhum script de tracking colado no HTML (nem o GTM da V1) e nenhuma Hotmart: tudo vem do <Tracking> do kit', () => {
  const proibidos = [/<script[^>]+tracking\.stratacademy\.com\.br\/sa/, /googletagmanager/, /GTM-/, /hotmart/i, /connect\.facebook\.net/, /\bfbq\s*\(/, /\bgtag\s*\(/];
  for (const f of fragmentos) for (const re of proibidos) assert.doesNotMatch(ler(f), re, `${f}: ${re}`);
});

test('as tags que o kit gera não se repetem no head da página', () => {
  const doKit = [/<title>/, /name="description"/, /rel="canonical"/, /property="og:/, /name="twitter:card"/, /name="viewport"/, /charset=/, /name="robots"/];
  for (const f of fragmentos.filter((f) => f.endsWith('.head.html'))) for (const re of doKit) assert.doesNotMatch(ler(f), re, `${f}: ${re}`);
});

test('nenhum link sem destino (href="#")', () => {
  for (const f of fragmentos) assert.doesNotMatch(ler(f), /href="#"/, f);
});

test('o lead segue o mesmo caminho: webhook do n8n nas duas, Lead no Rastro e comunidade?f=vibecode na V2', () => {
  for (const p of Object.keys(PAGINAS)) assert.ok(ler(`${p}.corpo.html`).includes(N8N), `${p}: webhook do n8n`);
  const v2 = ler('home.corpo.html');
  assert.match(v2, /stratTrack\(\s*'Lead'/);
  assert.match(v2, /comunidade\.stratacademy\.com\.br\/\?f=vibecode/);
});

test('a V1 mantém a classe do <body> do original', () => {
  assert.match(ler('v1.corpo.html'), /^<script>document\.body\.className='bg-\[#0d0d0d\] text-white font-saira antialiased'<\/script>/);
});

test('todo arquivo do próprio site citado nas páginas existe em public/', () => {
  for (const [p, base] of Object.entries(PAGINAS)) {
    const html = ler(`${p}.head.html`) + ler(`${p}.corpo.html`);
    const refs = [
      ...[...html.matchAll(/(?:src|href|data-thumb|poster)="([^"]+)"/g)].map((m) => m[1]),
      ...[...html.matchAll(/url\(['"]?([^'")]+)/g)].map((m) => m[1]),
    ];
    for (const r of refs) {
      // trecho montado no script (ex.: a foto do perfil do WhatsApp, '+p.pictureUrl+') não é arquivo do site
      if (/^(https?:|mailto:|tel:|data:|#|\/\/|%23)/.test(r) || r.includes('+') || !r.trim()) continue;
      const caminho = posix.normalize(r.startsWith('/') ? r : posix.join(base, r)).split(/[?#]/)[0];
      assert.ok(existsSync(join(APP, 'public', caminho)), `${p}: ${r} → public${caminho} não existe`);
    }
  }
});
