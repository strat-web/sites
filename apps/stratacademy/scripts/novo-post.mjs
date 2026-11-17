/**
 * Cria um post novo do blog com o frontmatter correto e um esqueleto editorial.
 *
 * É o "motor manual" descrito em docs/PROJETO-gerador-de-conteudo.md: antes de
 * automatizar, o processo precisa estar estável rodando na mão.
 *
 * Uso:
 *   pnpm --filter stratacademy post:novo -- --titulo "Como fazer X com N8N" --tags n8n,automacao
 *
 * Opções:
 *   --titulo     (obrigatório)
 *   --tags       lista separada por vírgula; a 1ª é a categoria  (padrão: ia)
 *   --slug       (padrão: derivado do título)
 *   --autor      (padrão: Helbert Paranhos)
 *   --descricao  (padrão: rascunho para você completar)
 *   --data       AAAA-MM-DD  (padrão: hoje)
 *   --rascunho   cria com draft: true
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const POSTS = join(AQUI, '../src/content/blog');

// ---------- argumentos ----------
const args = process.argv.slice(2);
const opt = (nome, padrao) => {
  const i = args.indexOf(`--${nome}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : padrao;
};
const flag = (nome) => args.includes(`--${nome}`);

const titulo = opt('titulo');
if (!titulo) {
  console.error('Falta --titulo.\nEx.: pnpm --filter stratacademy post:novo -- --titulo "Como fazer X" --tags n8n');
  process.exit(1);
}

const slugify = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const slug = opt('slug', slugify(titulo));
const tags = opt('tags', 'ia').split(',').map((t) => t.trim()).filter(Boolean);
const autor = opt('autor', 'Helbert Paranhos');
const data = opt('data', new Date().toISOString().slice(0, 10));
const descricao = opt('descricao', '');
const rascunho = flag('rascunho');

// ---------- checagens antes de escrever ----------
const existentes = (await readdir(POSTS)).filter((f) => f.endsWith('.md'));
const avisos = [];

if (existentes.includes(`${slug}.md`)) {
  console.error(`Já existe um post com o slug "${slug}". Escolha outro com --slug.`);
  process.exit(1);
}
if (titulo.length > 120) avisos.push(`título tem ${titulo.length} chars — o schema corta em 120`);
if (descricao && (descricao.length < 50 || descricao.length > 160))
  avisos.push(`description tem ${descricao.length} chars — o schema exige entre 50 e 160`);

// ---------- sugestões de link interno ----------
// O valor do cluster está nos links entre posts. O script já entrega a lista pronta.
const relacionados = [];
for (const f of existentes) {
  const md = await readFile(join(POSTS, f), 'utf8');
  const t = /^title:\s*["'](.+?)["']/m.exec(md)?.[1];
  const tg = /^tags:\s*\[(.*?)\]/m.exec(md)?.[1] ?? '';
  const compartilha = tags.some((x) => tg.toLowerCase().includes(x.toLowerCase()));
  if (compartilha && t) relacionados.push({ slug: f.replace(/\.md$/, ''), titulo: t });
}

const FOLHAS = {
  'claude-code': '/curso-claude-code',
  n8n: '/curso-n8n',
  cursor: '/curso-cursor',
  lovable: '/curso-lovable',
};
const folha = tags.map((t) => FOLHAS[t.toLowerCase()]).find(Boolean);

// ---------- o arquivo ----------
const fm = [
  '---',
  `title: "${titulo.replace(/"/g, '\\"')}"`,
  `description: "${(descricao || 'RASCUNHO — escreva entre 50 e 160 caracteres, com a palavra-chave.').replace(/"/g, '\\"')}"`,
  `pubDate: ${data}`,
  `author: "${autor}"`,
  `tags: [${tags.map((t) => `'${t}'`).join(', ')}]`,
  'faq:',
  '  - q: "Pergunta que o leitor realmente faz?"',
  '    a: "Resposta direta em 2 ou 3 frases. Vira rich result no Google."',
  `draft: ${rascunho}`,
  '---',
].join('\n');

const corpo = `
Abra pela resposta prática. O leitor chegou aqui com um problema — resolva nas
primeiras linhas e só depois explique o porquê. É o padrão *answer-first* da casa.

## O que é

Contexto curto. Sem introdução histórica de três parágrafos.

## Como fazer na prática

Passo a passo real, com o comando ou a tela que a pessoa vai ver.

## Onde isso costuma quebrar

O que ninguém avisa. Essa seção é a que faz o post ser lembrado.

## Quando não usar

Honestidade sobre o limite da ferramenta. Vale mais que mais um elogio.
${folha ? `
> Quer aprender isso com acompanhamento? A trilha completa está em
> [${tags[0]}](${folha}) — dentro do [Strat Academy 2.0](/assinatura).
` : ''}${relacionados.length ? `
### Leia também
${relacionados.slice(0, 3).map((r) => `- [${r.titulo}](/blog/${r.slug}/)`).join('\n')}
` : ''}
## Conclusão

Feche com o próximo passo concreto, não com um resumo do que já foi dito.
`;

await writeFile(join(POSTS, `${slug}.md`), fm + '\n' + corpo, 'utf8');

// ---------- relatório ----------
console.log(`\n✓ criado  src/content/blog/${slug}.md\n`);
if (avisos.length) {
  console.log('avisos:');
  for (const a of avisos) console.log('  ! ' + a);
  console.log();
}
if (folha) console.log(`link de produto sugerido: ${folha}`);
if (relacionados.length) {
  console.log(`posts relacionados (${relacionados.length}) já inseridos no rascunho:`);
  for (const r of relacionados.slice(0, 3)) console.log(`  - /blog/${r.slug}/`);
} else {
  console.log('nenhum post relacionado com essas tags — este vai abrir um cluster novo.');
}
console.log(`
próximos passos:
  1. escreva o conteúdo
  2. pnpm --filter stratacademy post:checar     (valida tudo)
  3. pnpm --filter stratacademy build           (o schema reprova o que estiver errado)
  4. commit + PR
`);
