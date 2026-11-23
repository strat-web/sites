// Migração da comunidade.stratacademy.com.br do strat-lps (lps/comunidade) para o Pages (WEB-48). A página é de todos
// os funis: o Rastro entra só pelo <Tracking> do kit, com o produto do funil do ?f= (registro "funis" do catálogo,
// WEB-106), e nunca como tag fixa nem pelo script da página. Estes testes garantem que isso não mude, que as tags do kit
// não se repitam e que todo arquivo citado exista em public/.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, posix } from 'node:path';
import { fileURLToPath } from 'node:url';

const catalogo = JSON.parse(readFileSync(new URL('../../../../catalogo/sites.json', import.meta.url), 'utf8'));

const APP = join(dirname(fileURLToPath(import.meta.url)), '..');
const ler = (f) => readFileSync(join(APP, 'src/html', f), 'utf8');
const head = ler('home.head.html');
const corpo = ler('home.corpo.html');

test('nenhuma tag de tracking fixa nem Rastro montado pela página: o Rastro só entra pelo <Tracking>', () => {
  // O preconnect ao host do Rastro fica (estava no ar e adianta a conexão de quem chega com ?f=); o /sa e o stratTrack, não.
  const proibidos = [/tracking\.stratacademy\.com\.br\/sa/, /stratTrack/, /launcher\.hotmart\.com/, /connect\.facebook\.net/, /googletagmanager/, /\bfbq\s*\(/, /\bgtag\s*\(/];
  for (const re of proibidos) assert.doesNotMatch(head + corpo, re, String(re));
});

test('registro FUNIS da página (copy e grupo) com as mesmas chaves do registro "funis" do catálogo (produto do Rastro)', () => {
  const funis = corpo.match(/var FUNIS = \{([\s\S]*?)\n {2}\};/)[1];
  const chaves = [...funis.matchAll(/^ {4}'([a-z0-9-]+)': \{/gm)].map((m) => m[1]);
  assert.ok(chaves.includes('default'), 'o fallback continua na página');
  assert.doesNotMatch(funis, /produto:/, 'o produto do Rastro mora no catálogo');
  const linha = catalogo.urls.find((l) => l.id === 'academy-comunidade');
  assert.equal(linha.consentimento, 'por-funil');
  assert.deepEqual(chaves.filter((c) => c !== 'default').sort(), Object.keys(linha.funis).sort());
  assert.equal(linha.funis.vibecode.rastro_slug, 'aula-claude-code');
  assert.equal(linha.funis['bootcamp-0808'].rastro_slug, 'bootcamp-0808');
  assert.equal(Object.hasOwn(linha.funis, 'default'), false, 'sem ?f= não há produto');
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
