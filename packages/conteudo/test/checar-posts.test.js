import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checarPosts, lerFrontmatter, normalizarRota, checarApp, relatorio } from '../src/checar-posts.js';

const BIN = join(dirname(fileURLToPath(import.meta.url)), '../bin/checar-posts.js');

const post = (fm, corpo = '## Seção\n\nTexto com [outro post](/blog/outro/).\n') =>
  `---\n${Object.entries(fm).map(([k, v]) => `${k}: ${v}`).join('\n')}\n---\n\n${corpo}`;

const DESC = '"Uma descrição com tamanho suficiente para passar no limite mínimo de cinquenta."';
const ok = { title: '"Título do post"', description: DESC, pubDate: '2026-11-12' };

test('lerFrontmatter: aspas duplas e simples, sem aspas, booleanos, bloco dobrado e listas', () => {
  const { dados, corpo, temFrontmatter } = lerFrontmatter(
    [
      '---',
      'title: "Com \\"aspas\\" dentro"',
      "author: 'D''Ávila'",
      'description: sem aspas # comentário',
      'draft: true',
      'resumo: >-',
      '  linha um',
      '  linha dois',
      'tags:',
      '  - a',
      '---',
      '',
      'corpo',
    ].join('\n'),
  );
  assert.equal(temFrontmatter, true);
  assert.equal(dados.title, 'Com "aspas" dentro');
  assert.equal(dados.author, "D'Ávila");
  assert.equal(dados.description, 'sem aspas');
  assert.equal(dados.draft, true);
  assert.equal(dados.resumo, 'linha um linha dois');
  assert.equal(dados.tags, true);
  assert.equal(corpo.trim(), 'corpo');
  assert.equal(lerFrontmatter('sem frontmatter').temFrontmatter, false);
});

test('normalizarRota tira barra final, query e âncora', () => {
  assert.equal(normalizarRota('/blog/x/?utm=1#topo'), '/blog/x');
  assert.equal(normalizarRota('/'), '/');
  assert.equal(normalizarRota('/#a'), '/');
});

test('post certo, com link para outro post e para rota real, passa sem erro nem aviso', () => {
  const r = checarPosts({
    posts: [
      { slug: 'um', conteudo: post(ok) },
      { slug: 'outro', conteudo: post(ok, '## Seção\n\nVolta para [um](/blog/um/) e [a home](/).\n') },
    ],
  });
  assert.deepEqual(r.erros, []);
  assert.deepEqual(r.avisos, []);
  assert.equal(r.verificados, 2);
});

test('erros: sem title, description curta, H1 no corpo, rota removida, post inexistente', () => {
  const r = checarPosts({
    posts: [
      { slug: 'a', conteudo: post({ description: DESC }) },
      { slug: 'b', conteudo: post({ title: 'B', description: '"curta"' }) },
      { slug: 'c', conteudo: post(ok, '# H1 no corpo\n\n## Seção\n\n[x](/loja/) [y](/blog/nao-existe/)\n') },
    ],
    rotasMortas: ['/loja'],
  });
  assert.ok(r.erros.includes('blog/a: sem title'));
  assert.ok(r.erros.some((e) => e.startsWith('blog/b: description com 5 caracteres')));
  assert.ok(r.erros.includes('blog/c: tem H1 no corpo (o título já vem do frontmatter)'));
  assert.ok(r.erros.includes('blog/c: link para rota removida /loja/'));
  assert.ok(r.erros.includes('blog/c: link para post inexistente /blog/nao-existe/'));
});

test('H1 e link dentro de bloco de código não contam', () => {
  const corpo = '## Seção\n\n```sh\n# comentário de shell\n[x](/loja/)\n```\n\n[um](/blog/um/)\n';
  const r = checarPosts({ posts: [{ slug: 'um', conteudo: post(ok, corpo) }], rotasMortas: ['/loja'] });
  assert.deepEqual(r.erros, []);
});

test('post de teste: exige noindex, não precisa formar cluster e não pode ser linkado por post publicado', () => {
  const corpoTeste = '## Seção\n\nSó [a home](/).\n';
  const semNoindex = checarPosts({ posts: [{ slug: 't', conteudo: post({ ...ok, teste: true }, corpoTeste) }] });
  assert.ok(semNoindex.erros.includes('blog/t: post de teste sem noindex: true'));

  const certo = checarPosts({ posts: [{ slug: 't', conteudo: post({ ...ok, teste: true, noindex: true }, corpoTeste) }] });
  assert.deepEqual(certo.erros, []);
  assert.deepEqual(certo.avisos, []);

  const linkado = checarPosts({
    posts: [
      { slug: 't', conteudo: post({ ...ok, teste: true, noindex: true }, corpoTeste) },
      { slug: 'real', conteudo: post(ok, '## Seção\n\n[t](/blog/t/)\n') },
      { slug: 'rascunho', conteudo: post({ ...ok, draft: true }, '## Seção\n\n[t](/blog/t/)\n') },
    ],
  });
  assert.deepEqual(linkado.erros, ['blog/real: link para post que não vai ao ar (rascunho ou teste) /blog/t/']);
});

test('avisos: title longo para a busca, rota desconhecida, sem barra no fim, sem link para post, sem H2', () => {
  const r = checarPosts({
    posts: [{ slug: 'x', conteudo: post({ ...ok, title: `"${'t'.repeat(70)}"` }, 'Texto com [y](/nao-existe) e [z](/sobre).\n') }],
    rotas: ['/', '/sobre'],
  });
  assert.deepEqual(r.erros, []);
  const texto = r.avisos.join('\n');
  assert.match(texto, /title com 70 caracteres/);
  assert.match(texto, /link \/nao-existe não bate com nenhuma rota conhecida/);
  assert.match(texto, /link \/sobre sem barra no fim/);
  assert.match(texto, /nenhum link para outro post/);
  assert.match(texto, /sem H2/);
});

test('rota dinâmica aceita slug kebab-case; arquivo de public/ conta como rota', () => {
  const r = checarPosts({
    posts: [{ slug: 'x', conteudo: post(ok, '## S\n\n[a](/blog/x/) [m](/modelos/saas/) [M](/modelos/Saas/) [i](/img/capa.webp)\n') }],
    rotas: ['/', '/img/capa.webp'],
    prefixosDinamicos: ['/modelos'],
  });
  assert.deepEqual(r.avisos, ['blog/x: link /modelos/Saas/ não bate com nenhuma rota conhecida']);
});

// App de mentira no disco, para o checarApp e o bin.
function appFalso(arquivos) {
  const dir = mkdtempSync(join(tmpdir(), 'checar-posts-'));
  for (const [caminho, conteudo] of Object.entries(arquivos)) {
    mkdirSync(dirname(join(dir, caminho)), { recursive: true });
    writeFileSync(join(dir, caminho), conteudo);
  }
  return dir;
}

test('checarApp lê src/pages (com [slug], _parcial e endpoint), public/, subpastas do blog e o conteudo.config.json', (t) => {
  const dir = appFalso({
    'src/pages/index.astro': '',
    'src/pages/sobre/index.astro': '',
    'src/pages/contato.astro': '',
    'src/pages/_parcial.astro': '',
    'src/pages/rss.xml.js': '',
    'src/pages/guias/[slug].astro': '',
    'public/img/capa.webp': '',
    'conteudo.config.json': JSON.stringify({ rotasMortas: ['/velha/'], rotasExtras: ['/curso-x/'] }),
    'src/content/blog/um.md': post(ok, '## S\n\n[a](/sobre/) [b](/contato/) [c](/rss.xml) [d](/guias/um-guia/) [e](/img/capa.webp) [f](/curso-x/) [g](/blog/2026/dois/)\n'),
    'src/content/blog/2026/dois.mdx': post(ok, '## S\n\n[um](/blog/um/) e [velha](/velha/) e [p](/_parcial/)\n'),
  });
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  const r = checarApp(dir);
  assert.equal(r.verificados, 2);
  assert.deepEqual(r.erros, ['blog/2026/dois: link para rota removida /velha/']);
  assert.deepEqual(r.avisos, ['blog/2026/dois: link /_parcial/ não bate com nenhuma rota conhecida']);
  assert.match(relatorio(r), /ERROS \(1\)/);
});

test('conteudo.config.json com chave desconhecida quebra, para erro de digitação não passar calado', (t) => {
  const dir = appFalso({ 'conteudo.config.json': JSON.stringify({ rotasMorta: [] }) });
  t.after(() => rmSync(dir, { recursive: true, force: true }));
  assert.throws(() => checarApp(dir), /chave desconhecida rotasMorta/);
});

test('bin: sai 0 com post certo, 1 com erro e 0 sem pasta de posts', (t) => {
  const bom = appFalso({ 'src/pages/index.astro': '', 'src/content/blog/um.md': post({ ...ok, teste: true, noindex: true }, '## S\n\n[home](/)\n') });
  const ruim = appFalso({ 'src/content/blog/um.md': post({ ...ok, teste: true }, '## S\n') });
  const vazio = appFalso({ 'src/pages/index.astro': '' });
  t.after(() => [bom, ruim, vazio].forEach((d) => rmSync(d, { recursive: true, force: true })));

  assert.match(execFileSync(process.execPath, [BIN], { cwd: bom, encoding: 'utf8' }), /posts verificados: 1\ntudo certo/);
  const r = spawnSync(process.execPath, [BIN, '--app', ruim], { encoding: 'utf8' });
  assert.equal(r.status, 1);
  assert.match(r.stdout, /post de teste sem noindex/);
  assert.match(execFileSync(process.execPath, [BIN, '--app', vazio], { encoding: 'utf8' }), /posts verificados: 0 \(nenhum em src\/content\/blog\)/);
});
