#!/usr/bin/env node
// Scaffolder de post: cria src/content/blog/<slug>.md com frontmatter válido.
// Uso:
//   npm run new-post -- "Título do post"
//   npm run new-post -- "Título" --tags n8n,automacao --author "Ana Tech" --desc "..." --draft
import { writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const BLOG_DIR = join(root, 'src/content/blog');

// ---- parse de argumentos ----
const argv = process.argv.slice(2);
const flags = { tags: [], author: 'Equipe Strat', desc: '', draft: false };
const titleParts = [];
for (let i = 0; i < argv.length; i++) {
  const a = argv[i];
  if (a === '--draft') flags.draft = true;
  else if (a === '--tags') flags.tags = (argv[++i] || '').split(',').map((t) => t.trim()).filter(Boolean);
  else if (a === '--author') flags.author = argv[++i] || flags.author;
  else if (a === '--desc') flags.desc = argv[++i] || '';
  else titleParts.push(a);
}
const title = titleParts.join(' ').trim();

function slugify(s) {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function fail(msg) {
  console.error(`\n✗ ${msg}\n`);
  process.exit(1);
}

if (!title) {
  fail(
    'Informe um título.\n  Ex.: npm run new-post -- "N8N para iniciantes" --tags n8n,automacao'
  );
}
if (title.length > 70) {
  fail(`Título tem ${title.length} caracteres; o limite do schema é 70. Encurte-o.`);
}

const slug = slugify(title);
if (!slug) fail('Não consegui gerar um slug a partir desse título.');

const file = join(BLOG_DIR, `${slug}.md`);
if (existsSync(file)) fail(`Já existe um post em src/content/blog/${slug}.md`);

// descrição: precisa ter 50–160 chars (schema). Gera um placeholder válido se vazio.
let desc = flags.desc.trim();
if (!desc) {
  desc = `Resumo do artigo "${title}" em uma frase clara e densa — edite antes de publicar.`;
}
if (desc.length < 50) desc = (desc + ' — edite esta descrição antes de publicar.').slice(0, 160);
if (desc.length > 160) desc = desc.slice(0, 157).trimEnd() + '...';

const today = new Date().toISOString().slice(0, 10);
const esc = (s) => s.replace(/'/g, '’');
const tagsLine = flags.tags.length ? `[${flags.tags.map((t) => `'${t}'`).join(', ')}]` : '[]';

const content = `---
title: '${esc(title)}'
description: '${esc(desc)}'
pubDate: ${today}
author: '${esc(flags.author)}'
tags: ${tagsLine}
# updatedDate: ${today}
# cover: ./caminho-da-capa.jpg
# faq:
#   - q: 'Pergunta frequente?'
#     a: 'Resposta objetiva.'
draft: ${flags.draft}
---

## Resposta rápida

<!-- Responda a pergunta principal já no primeiro parágrafo (answer-first). -->

## Por que isso importa

<!-- Contexto e densidade de informação. Use H2/H3 descritivos: viram âncoras. -->

## Próximos passos

- <!-- ação prática -->
- <!-- link interno para outro post do mesmo tema (clusters/GEO) -->
`;

mkdirSync(BLOG_DIR, { recursive: true });
writeFileSync(file, content, 'utf8');

console.log(`\n✓ Post criado: src/content/blog/${slug}.md`);
console.log(`  URL:        /blog/${slug}/`);
console.log(`  draft:      ${flags.draft}${flags.draft ? '  (não aparece na listagem até virar false)' : ''}`);
console.log(`\nAbra o arquivo, escreva o conteúdo e rode  npm run dev  para ver.\n`);
