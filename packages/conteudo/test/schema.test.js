import { test } from 'node:test';
import assert from 'node:assert/strict';
import { z } from 'astro/zod';
import { blogSchema, naListagem, indexavel, LIMITES } from '../src/index.js';

// O image() de verdade vem do contexto do schema do Astro; aqui basta um objeto com src.
const image = () => z.object({ src: z.string() });

const base = {
  title: 'Como medir o retorno de um agente de IA no WhatsApp',
  description: 'O que olhar nos primeiros 30 dias de um agente de IA no WhatsApp: atendimento, qualificação e agenda.',
  pubDate: '2026-11-12',
};

test('post válido ganha os padrões: autor da marca, tags vazias, draft, noindex e teste falsos', () => {
  const r = blogSchema(z, image, { autorPadrao: 'Equipe StratAI' }).parse(base);
  assert.equal(r.author, 'Equipe StratAI');
  assert.deepEqual(r.tags, []);
  assert.equal(r.draft, false);
  assert.equal(r.noindex, false);
  assert.equal(r.teste, false);
  assert.ok(r.pubDate instanceof Date);
  assert.equal(r.pubDate.toISOString().slice(0, 10), '2026-11-12');
});

test('aceita defaultAuthor, o nome da opção no horus, e cai em "Equipe" sem opção', () => {
  assert.equal(blogSchema(z, image, { defaultAuthor: 'Equipe Strat' }).parse(base).author, 'Equipe Strat');
  assert.equal(blogSchema(z, image).parse(base).author, 'Equipe');
});

test('description fora de 50 a 160 caracteres e title acima de 120 reprovam', () => {
  const s = blogSchema(z, image);
  assert.equal(s.safeParse({ ...base, description: 'curta demais' }).success, false);
  assert.equal(s.safeParse({ ...base, description: 'x'.repeat(LIMITES.descricaoMax + 1) }).success, false);
  assert.equal(s.safeParse({ ...base, title: 'x'.repeat(LIMITES.titulo + 1) }).success, false);
  assert.equal(s.safeParse({ ...base, title: '' }).success, false);
  assert.equal(s.safeParse({ ...base, pubDate: 'não é data' }).success, false);
});

test('capa: imagem local pelo image() ou URL https; outro protocolo reprova', () => {
  const s = blogSchema(z, image);
  assert.equal(s.safeParse({ ...base, cover: { src: '/capa.webp' } }).success, true);
  assert.equal(s.safeParse({ ...base, cover: 'https://assets.stratai.com.br/blog/x/capa.webp' }).success, true);
  assert.equal(s.safeParse({ ...base, cover: 'javascript:alert(1)' }).success, false);
  assert.equal(s.safeParse({ ...base, cover: 'capa.webp' }).success, false);
  // sem image(), a capa só aceita URL
  assert.equal(blogSchema(z, undefined).safeParse({ ...base, cover: 'https://assets.stratai.com.br/c.webp' }).success, true);
});

test('faq: lista de { q, a }', () => {
  const s = blogSchema(z, image);
  assert.equal(s.safeParse({ ...base, faq: [{ q: 'Pergunta?', a: 'Resposta.' }] }).success, true);
  assert.equal(s.safeParse({ ...base, faq: [{ pergunta: 'x' }] }).success, false);
});

test('post de teste sem noindex reprova, com o erro no campo noindex', () => {
  const s = blogSchema(z, image);
  const r = s.safeParse({ ...base, teste: true });
  assert.equal(r.success, false);
  assert.deepEqual(r.error.issues[0].path, ['noindex']);
  assert.match(r.error.issues[0].message, /teste/);
  assert.equal(s.safeParse({ ...base, teste: true, noindex: true }).success, true);
});

test('sem o z do astro/zod o schema avisa em vez de quebrar mais adiante', () => {
  assert.throws(() => blogSchema(undefined, image), /astro\/zod/);
});

test('naListagem e indexavel: rascunho e teste ficam fora; noindex fica fora só do índice', () => {
  const d = (x) => ({ draft: false, teste: false, noindex: false, ...x });
  assert.equal(naListagem(d({})), true);
  assert.equal(indexavel(d({})), true);
  assert.equal(naListagem(d({ draft: true })), false);
  assert.equal(naListagem(d({ teste: true, noindex: true })), false);
  assert.equal(indexavel(d({ teste: true, noindex: true })), false);
  assert.equal(naListagem(d({ noindex: true })), true);
  assert.equal(indexavel(d({ noindex: true })), false);
});
