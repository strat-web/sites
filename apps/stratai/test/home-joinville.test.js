// WEB-33: correções da home do plano de Joinville (F1). Lê o HTML-fonte e, com o dist/, a página pronta.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { perguntasDaHome, textoVisivel } from '../src/lib/faq-home.js';

const APP = join(dirname(fileURLToPath(import.meta.url)), '..');
const corpo = readFileSync(join(APP, 'src/html/home.corpo.html'), 'utf8');
const DIST = join(APP, 'dist');
const semDist = !existsSync(join(DIST, 'index.html')) && 'sem dist/: rode pnpm build antes';

test('faq-home: as 5 conversas e as 6 do "Outras perguntas", sem hora nem dica', () => {
  const p = perguntasDaHome(corpo);
  assert.equal(p.length, 11);
  assert.equal(p[0].pergunta, 'E se o cliente perceber que é robô?');
  assert.equal(p[5].pergunta, 'Quanto custa?');
  assert.equal(p[10].pergunta, 'Pra quem não é?');
  for (const { pergunta, resposta } of p) {
    assert.ok(pergunta && resposta);
    assert.doesNotMatch(pergunta + resposta, /toque pra ver|\d{2}:\d{2}|[<>]/);
  }
  // a resposta do "Pra quem não é?" para no texto: o botão de CTA que vem depois não entra
  assert.doesNotMatch(p[10].resposta, /Ver se o meu caso serve/);
});

test('faq-home: texto visível sem tags e com as entidades decodificadas', () => {
  assert.equal(textoVisivel('<p>na <a href="/x/">política</a> &amp; ok&quot; .</p>'), 'na política & ok".');
});

test('home: kicker com Joinville e alt só na 1ª ocorrência de cada logo', () => {
  assert.match(corpo, /<p class="kicker rise"><b>StratAI<\/b> · agência de IA em Joinville\/SC para pequenas e médias empresas<\/p>/);
  for (const alt of ['Logo do Só Churrasco', 'Logo da Guizeline', 'Logo da Vida Probióticos']) {
    assert.equal(corpo.split(`alt="${alt}"`).length - 1, 1, alt);
  }
  const copias = corpo.match(/<img src="midia\/web\/clientes\/[a-z-]+-logo\.[a-z]+"[^>]*>/g);
  assert.equal(copias.length, 9);
  assert.equal(copias.filter((c) => c.includes('alt="" aria-hidden="true"')).length, 6);
});

test('dist: título e descrição de Joinville, cartão como antes e FAQPage igual ao visível', { skip: semDist }, () => {
  const home = readFileSync(join(DIST, 'index.html'), 'utf8');
  assert.match(home, /<title>Agentes de IA no WhatsApp em Joinville \| StratAI<\/title>/);
  assert.match(home, /<meta name="description" content="Agência de IA em Joinville\/SC\. [^"]{20,}">/);
  assert.match(home, /<meta property="og:title" content="StratAI · Agentes de IA para a sua empresa">/);

  const blocos = [...home.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
  const tipos = blocos.map((b) => b['@type']);
  assert.ok(tipos.includes('ProfessionalService'), tipos.join());
  const faq = blocos.find((b) => b['@type'] === 'FAQPage');
  assert.ok(faq, 'sem FAQPage');
  const visiveis = perguntasDaHome(corpo);
  assert.deepEqual(
    faq.mainEntity.map((q) => [q.name, q.acceptedAnswer.text]),
    visiveis.map((p) => [p.pergunta, p.resposta]),
  );
  // e cada resposta está, de fato, no texto da página pronta
  const texto = textoVisivel(home);
  for (const p of visiveis) assert.ok(texto.includes(p.resposta), p.pergunta);
});
