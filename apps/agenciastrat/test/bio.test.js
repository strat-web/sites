// WEB-25: a bio da Agência (bio.stratai.com.br/agencia/) migrada para /bio/ sem mudar texto, layout nem tracking.
// Origem: strat-lps lps/bio-stratai/agencia/index.html com a correção do WEB-82 (strat-lps#89), hashes em bio-origem.json.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const app = new URL('../', import.meta.url);
const ler = (p) => readFileSync(new URL(p, app), 'utf8');
const origem = JSON.parse(ler('test/bio-origem.json'));
const sha = (s) => createHash('sha256').update(s).digest('hex');
const texto = (s) => s.replace(/<script\b[^>]*>[\s\S]*?<\/script>|<!--[\s\S]*?-->/g, '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
const head = ler('src/html/bio.head.html');
const corpo = ler('src/html/bio.corpo.html');
const DIST = 'dist/bio/index.html';
const semDist = !existsSync(fileURLToPath(new URL(DIST, app)));

test('texto visível e mídias iguais aos da origem', () => {
  assert.equal(sha(texto(corpo)), origem.texto, 'texto da bio');
  for (const [arquivo, hash] of Object.entries(origem.midias)) {
    assert.equal(sha(readFileSync(new URL(`public/midia/${arquivo}`, app))), hash, arquivo);
  }
  for (const [, caminho] of (head + corpo).matchAll(/(?:src|href)="(\/(?:midia|fontes)\/[^"]+)"/g)) {
    assert.ok(existsSync(fileURLToPath(new URL(`public${caminho}`, app))), `falta public${caminho}`);
  }
});

test('links escritos no HTML com o mesmo valor que o script monta (nenhum href="#")', () => {
  assert.doesNotMatch(corpo, /href="#"/);
  const whatsapp = corpo.match(/const WHATSAPP = "(\d+)"/)[1];
  const links = Object.fromEntries([...corpo.match(/const LINKS = \{([\s\S]*?)\};/)[1].matchAll(/(\w+):\s*"([^"]+)"/g)].map((m) => [m[1], m[2]]));
  const tags = [...corpo.matchAll(/<a\b[^>]*>/g)].map((m) => m[0]);
  const was = tags.filter((a) => /\bwa\b/.test(a.match(/class="([^"]*)"/)?.[1] ?? ''));
  assert.equal(was.length, 3, 'obrigado, botão e ícone do WhatsApp');
  for (const a of was) {
    const msg = a.match(/data-msg="([^"]+)"/)[1];
    assert.ok(a.includes(`href="https://wa.me/${whatsapp}?text=${encodeURIComponent(msg)}"`), a);
  }
  const ks = tags.filter((a) => /data-k="/.test(a));
  assert.equal(ks.length, 5, 'privacidade, site, Instagram, LinkedIn e endereço');
  for (const a of ks) assert.ok(a.includes(`href="${links[a.match(/data-k="(\w+)"/)[1]]}"`), a);
});

test('o Raio-X segue com a correção do WEB-82: validação no clique e só chaves do strat-marketing', () => {
  assert.match(corpo, /xgo\.addEventListener\("click",e=>\{ const c=checkCap\(true\); if\(!c\.ok\)\{ e\.preventDefault\(\); c\.first\.focus\(\); \} \}\);/);
  assert.match(corpo, /const CAMPOS=\{\n  ig:  "instagram",\n  seg: "segmento",\n  dor: "servicos"/);
  assert.match(corpo, /m\.lead\(\{nome:c\.nm, telefone:"55"\+c\.dig, email:c\.em, campos\}\)/);
});

test('a página não põe tag, pixel, banner nem fonte do Google por conta própria (vêm do kit)', () => {
  const html = head + corpo;
  assert.doesNotMatch(html, /t\.metricaas\.com\.br\/m\.js|connect\.facebook\.net|fbq\(|mtc\.consentir|strat_cookies/);
  assert.doesNotMatch(html, /fonts\.googleapis\.com|fonts\.gstatic\.com/);
  assert.doesNotMatch(html, /src="img\//, 'mídia com caminho relativo');
});

test('build: uma tag do MetricaaS com o pixel atrás do banner, o Umami da Agência e o banner do kit', { skip: semDist }, () => {
  const html = ler(DIST);
  const tags = html.match(/<script[^>]*src="https:\/\/t\.metricaas\.com\.br\/m\.js"[^>]*>/g) || [];
  assert.deepEqual(tags, ['<script defer src="https://t.metricaas.com.br/m.js" data-ws="strat-marketing" data-pixel="1815630929780241" data-pixel-consent="aguardar">']);
  assert.match(html, /<script defer src="\/u\/script\.js" data-website-id="d99a9168-97eb-4681-bef7-7f78ed95f926">/);
  assert.match(html, /strat-cookies/);
  assert.doesNotMatch(html, /tracking\.stratacademy\.com\.br\/sa/, 'sem Rastro');
});

test('build: fora da busca e com o cartão de bio.stratai.com.br/agencia/', { skip: semDist }, () => {
  const html = ler(DIST);
  assert.match(html, /<meta name="robots" content="noindex, nofollow">/);
  assert.match(html, /<link rel="canonical" href="https:\/\/agenciastrat\.com\.br\/bio\/">/);
  assert.match(html, /<title>Agência Strat · Tráfego que vira venda<\/title>/);
  assert.match(html, /<meta property="og:description" content="Faça o Raio-X grátis do seu marketing em 1 minuto\.">/);
  assert.match(html, /<meta property="og:image" content="https:\/\/agenciastrat\.com\.br\/midia\/bio\/avatar\.png">/);
  assert.match(html, /<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">/);
});
