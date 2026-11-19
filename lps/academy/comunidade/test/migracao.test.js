// Migração da comunidade.stratacademy.com.br do strat-lps (lps/comunidade) para o Pages (WEB-48). A página é de todos
// os funis: o Rastro entra só pelo registro FUNIS (?f=), com o produto do funil, e nunca como tag fixa. Estes testes
// garantem que isso não mude, que as tags do kit não se repitam e que todo arquivo citado exista em public/.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP = join(dirname(fileURLToPath(import.meta.url)), '..');
const ler = (f) => readFileSync(join(APP, 'src/html', f), 'utf8');
const head = ler('home.head.html');
const corpo = ler('home.corpo.html');

test('nenhuma tag de tracking fixa: o Rastro só entra pelo funil do ?f=', () => {
  const proibidos = [/<script[^>]+src="[^"]*tracking\.stratacademy\.com\.br/, /launcher\.hotmart\.com/, /connect\.facebook\.net/, /googletagmanager/, /\bfbq\s*\(/, /\bgtag\s*\(/];
  for (const re of proibidos) assert.doesNotMatch(head + corpo, re, String(re));
});

test('registro FUNIS: sem funil não há produto; cada funil leva o produto dele no Rastro', () => {
  const funis = corpo.match(/var FUNIS = \{([\s\S]*?)\n {2}\};/)[1];
  const produto = (chave) => funis.match(new RegExp(`'${chave}': \\{[\\s\\S]*?produto: '([^']*)'`))[1];
  assert.equal(produto('default'), '');
  assert.equal(produto('vibecode'), 'aula-claude-code');
  assert.equal(produto('bootcamp-0808'), 'bootcamp-0808');
  assert.match(corpo, /if\(cfg\.produto\)\{/);
  assert.match(corpo, /'https:\/\/tracking\.stratacademy\.com\.br\/sa\?product='\+encodeURIComponent\(cfg\.produto\)/);
});

test('as tags que o kit gera não se repetem no head da página', () => {
  const doKit = [/<title>/, /name="description"/, /rel="canonical"/, /property="og:/, /name="twitter:card"/, /name="viewport"/, /charset=/, /name="robots"/];
  for (const re of doKit) assert.doesNotMatch(head, re, String(re));
});

test('todo arquivo do próprio site citado na página existe em public/', () => {
  const html = head + corpo;
  const refs = [...html.matchAll(/(?:src|href)\s*[=:]\s*["']([^"']+)/g), ...html.matchAll(/qr:\s*'([^']+)'/g)].map((m) => m[1]);
  for (const r of refs) {
    if (/^(https?:|mailto:|tel:|data:|#|\/\/)/.test(r) || !r.trim()) continue;
    const caminho = posix.normalize(r.startsWith('/') ? r : posix.join('/', r)).split(/[?#]/)[0];
    assert.ok(existsSync(join(APP, 'public', caminho)), `${r} → public${caminho} não existe`);
  }
});

test('nenhum link sem destino: o botão do grupo já sai com o grupo padrão (o script troca pelo do funil)', () => {
  assert.doesNotMatch(head + corpo, /href="#"/);
  assert.match(corpo, /id="btn-grupo" href="https:\/\/chat\.whatsapp\.com\//);
});
