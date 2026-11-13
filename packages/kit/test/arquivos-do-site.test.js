// Testes do gerador de sitemap.xml, robots.txt e llms.txt (WEB-18). Rodar: pnpm --filter @strat/kit test
import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  completarHistorico,
  dataDoUltimoCommit,
  entradaDaPagina,
  lastmodDaPagina,
  lerHtml,
  montarLlms,
  montarRobots,
  montarSitemap,
  ROBOS_DE_IA,
  separarIndexaveis,
} from '../src/arquivos-do-site.js';

const catalogo = {
  urls: [
    { url: 'https://stratai.com.br/', marca: 'stratai', tipo: 'site', indexar: true },
    { url: 'https://stratai.com.br/raio-x/', marca: 'stratai', tipo: 'lp', indexar: true },
    { url: 'https://stratai.com.br/bio/', marca: 'stratai', tipo: 'bio', indexar: false },
    { url: 'https://agenciastrat.com.br/', marca: 'agencia', tipo: 'site', indexar: true, no_ar: true },
    { url: 'https://metricaas.com.br/', marca: 'metricaas', tipo: 'site', indexar: true, no_ar: false },
  ],
  marcas: {
    stratai: {
      nome: 'StratAI',
      resumo: 'Agentes de IA.',
      telefone: '+55 47 0000-0000',
      endereco: { streetAddress: 'Rua Aubé, 777, Boa Vista', addressLocality: 'Joinville', addressRegion: 'SC', postalCode: '89205-000' },
      sameAs: ['https://www.instagram.com/strat.ai/'],
    },
    agencia: { nome: 'Agência Strat', resumo: 'Marketing.' },
    metricaas: { nome: 'Metricaas', resumo: 'Atribuição.' },
  },
};

test('lerHtml acha noindex, título e descrição em qualquer ordem de atributo', () => {
  const r = lerHtml(`<head><meta content="noindex, nofollow" name="robots"><title>A &amp; B · StratAI</title>
    <meta name='description' content='Desc &quot;x&quot;'></head>`);
  assert.deepEqual(r, { noindex: true, titulo: 'A & B · StratAI', descricao: 'Desc "x"' });
  assert.equal(lerHtml('<meta name="robots" content="index, follow">').noindex, false);
  assert.equal(lerHtml('<meta name="robots" content="none">').noindex, true);
  assert.equal(lerHtml('<title>x</title>').noindex, false);
  assert.equal(lerHtml('<title>x</title>').atualizado, undefined);
});

test('lerHtml lê a data que a página declara no article:modified_time (WEB-77)', () => {
  assert.equal(lerHtml('<meta content="2026-11-09" property="article:modified_time">').atualizado, '2026-11-09');
  assert.equal(lerHtml(`<meta property='article:modified_time' content='2026-11-09T10:00:00Z'>`).atualizado, '2026-11-09');
  // name= não conta: é property, como o Open Graph.
  assert.equal(lerHtml('<meta name="article:modified_time" content="2026-11-09">').atualizado, undefined);
  assert.throws(() => lerHtml('<meta property="article:modified_time" content="ontem">'), /data inválida/);
});

// Rotas como o Astro entrega no astro:routes:resolved (trailingSlash: always), já separadas pela integração.
const rotas = {
  fixas: new Map([
    ['/', 'src/pages/index.astro'],
    ['/blog/', 'src/pages/blog/index.astro'],
    ['/blog/destaque/', 'src/pages/blog/destaque.astro'],
  ]),
  dinamicas: [
    { regex: /^\/blog\/([^/]+?)\/$/, entrada: 'src/pages/blog/[slug].astro' },
    { regex: /^\/guias(?:\/(.*?))?\/$/, entrada: 'src/pages/guias/[...caminho].astro' },
  ],
};

test('rota dinâmica também acha o arquivo de origem; a fixa vem antes (WEB-77)', () => {
  assert.equal(entradaDaPagina('/', rotas), 'src/pages/index.astro');
  assert.equal(entradaDaPagina('blog/', rotas), 'src/pages/blog/index.astro');
  assert.equal(entradaDaPagina('/blog/destaque/', rotas), 'src/pages/blog/destaque.astro');
  assert.equal(entradaDaPagina('/blog/agente-de-ia/', rotas), 'src/pages/blog/[slug].astro');
  assert.equal(entradaDaPagina('blog/gpt-4.1/', rotas), 'src/pages/blog/[slug].astro');
  assert.equal(entradaDaPagina('/guias/whatsapp/agente/', rotas), 'src/pages/guias/[...caminho].astro');
  assert.equal(entradaDaPagina('/sem-rota/', rotas), undefined);
  // Expressão do Astro sem a barra (trailingSlash: never ou ignore) também serve.
  const semBarra = { fixas: new Map(), dinamicas: [{ regex: /^\/blog\/([^/]+?)$/, entrada: 'src/pages/blog/[slug].astro' }] };
  assert.equal(entradaDaPagina('/blog/x/', semBarra), 'src/pages/blog/[slug].astro');
});

test('lastmod: a data que a página declara vale; sem ela, o commit do arquivo da rota, fixa ou dinâmica (WEB-77)', () => {
  const commits = { 'apps/stratai/src/pages/blog/[slug].astro': '2026-11-01', 'apps/stratai/src/pages/index.astro': '2026-11-10' };
  const dataDoCommit = (arquivo) => commits[arquivo];
  // Post (rota dinâmica): a data do conteúdo, não a do molde, para cada post ter a sua.
  assert.equal(lastmodDaPagina({ atualizado: '2026-11-09', entrada: 'apps/stratai/src/pages/blog/[slug].astro' }, dataDoCommit), '2026-11-09');
  // Rota dinâmica sem data declarada: o último commit do arquivo da rota (antes ficava sem lastmod).
  assert.equal(lastmodDaPagina({ entrada: 'apps/stratai/src/pages/blog/[slug].astro' }, dataDoCommit), '2026-11-01');
  assert.equal(lastmodDaPagina({ entrada: 'apps/stratai/src/pages/index.astro' }, dataDoCommit), '2026-11-10');
  assert.equal(lastmodDaPagina({}, dataDoCommit), undefined);
});

test('só entra página com indexar: true no catálogo e sem noindex no HTML', () => {
  const { indexaveis, avisos } = separarIndexaveis(
    [
      { url: 'https://stratai.com.br/raio-x/', noindex: false },
      { url: 'https://stratai.com.br/', noindex: false, lastmod: '2026-11-10' },
      { url: 'https://stratai.com.br/bio/', noindex: true },
      { url: 'https://stratai.com.br/sem-linha/', noindex: false },
    ],
    catalogo,
  );
  assert.deepEqual(indexaveis.map((p) => p.url), ['https://stratai.com.br/', 'https://stratai.com.br/raio-x/']);
  assert.equal(avisos.length, 1);
  assert.match(avisos[0], /sem-linha.*regra 3/);
});

test('página com indexar: true mas noindex no HTML fica fora e avisa', () => {
  const { indexaveis, avisos } = separarIndexaveis([{ url: 'https://stratai.com.br/', noindex: true }], catalogo);
  assert.equal(indexaveis.length, 0);
  assert.match(avisos[0], /noindex/);
});

test('sitemap: loc escapado, lastmod só quando existe', () => {
  const xml = montarSitemap([
    { url: 'https://stratai.com.br/', lastmod: '2026-11-10' },
    { url: 'https://stratai.com.br/a&b/' },
  ]);
  assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>/);
  assert.match(xml, /<loc>https:\/\/stratai.com.br\/<\/loc>\n    <lastmod>2026-11-10<\/lastmod>/);
  assert.match(xml, /<loc>https:\/\/stratai.com.br\/a&amp;b\/<\/loc>\n  <\/url>/);
});

test('robots libera todos os robôs de IA e aponta o sitemap do domínio final', () => {
  const txt = montarRobots('https://stratai.com.br/');
  for (const r of ROBOS_DE_IA) assert.match(txt, new RegExp(`User-agent: ${r}\\nAllow: /`));
  assert.match(txt, /Sitemap: https:\/\/stratai.com.br\/sitemap.xml\n$/);
  assert.doesNotMatch(txt, /Disallow/);
});

test('llms.txt traz a marca, as páginas e as outras marcas do grupo que estão no ar', () => {
  const txt = montarLlms({
    marca: 'stratai',
    site: 'https://stratai.com.br/',
    indexaveis: [{ url: 'https://stratai.com.br/', titulo: 'StratAI', descricao: 'Agentes.' }],
    catalogo,
  });
  assert.match(txt, /^# StratAI\n\n> Agentes de IA\.\n\nSite: https:\/\/stratai.com.br\/\nContato: WhatsApp \+55 47 0000-0000\n/);
  assert.match(txt, /Endereço: Rua Aubé, 777, Boa Vista, Joinville\/SC, 89205-000\nRedes: https:\/\/www.instagram.com\/strat.ai\/\n/);
  assert.match(txt, /## Páginas\n\n- \[StratAI\]\(https:\/\/stratai.com.br\/\): Agentes\./);
  assert.match(txt, /## Outras marcas do Grupo Strat\n\n- \[Agência Strat\]\(https:\/\/agenciastrat.com.br\/\)\n$/);
});

test('llms.txt não lista domínio que ainda não está no ar (no_ar: false ou sem o campo) (WEB-77)', () => {
  const foraDoAr = {
    ...catalogo,
    urls: catalogo.urls.map((u) => (u.marca === 'agencia' ? { ...u, no_ar: false } : u)),
  };
  const txt = montarLlms({ marca: 'stratai', site: 'https://stratai.com.br/', indexaveis: [], catalogo: foraDoAr });
  assert.doesNotMatch(txt, /agenciastrat\.com\.br|metricaas\.com\.br/);
  assert.doesNotMatch(txt, /## Outras marcas/);

  const semCampo = { ...catalogo, urls: catalogo.urls.map(({ no_ar, ...u }) => u) };
  assert.doesNotMatch(montarLlms({ marca: 'stratai', site: 'https://stratai.com.br/', indexaveis: [], catalogo: semCampo }), /Outras marcas/);
});

test('llms.txt lista só a raiz de cada outra marca, não a página interna com tipo site (WEB-77)', () => {
  const comPolitica = {
    ...catalogo,
    urls: [...catalogo.urls, { url: 'https://agenciastrat.com.br/politica-de-privacidade/', marca: 'agencia', tipo: 'site', indexar: true, no_ar: true }],
  };
  const txt = montarLlms({ marca: 'stratai', site: 'https://stratai.com.br/', indexaveis: [], catalogo: comPolitica });
  assert.match(txt, /## Outras marcas do Grupo Strat\n\n- \[Agência Strat\]\(https:\/\/agenciastrat.com.br\/\)\n$/);
  assert.doesNotMatch(txt, /politica-de-privacidade/);
});

test('catálogo real: o llms.txt da StratAI não lista agenciastrat.com.br enquanto o DNS não vira (WEB-23)', async () => {
  const { lerCatalogo } = await import('../src/arquivos-do-site.js');
  const real = lerCatalogo();
  const txt = montarLlms({ marca: 'stratai', site: 'https://stratai.com.br/', indexaveis: [], catalogo: real });
  const agencia = real.urls.find((u) => u.id === 'agenciastrat');
  assert.equal(agencia.no_ar, false);
  assert.doesNotMatch(txt, /agenciastrat\.com\.br/);
  assert.match(txt, /- \[Strat Academy\]\(https:\/\/stratacademy.com.br\/\)/);
  // a política da StratAI também é tipo site no catálogo, mas não vira "outra marca" no llms.txt da Academy
  const daAcademy = montarLlms({ marca: 'academy', site: 'https://stratacademy.com.br/', indexaveis: [], catalogo: real });
  assert.match(daAcademy, /- \[StratAI\]\(https:\/\/stratai.com.br\/\)/);
  assert.doesNotMatch(daAcademy, /politica-de-privacidade/);
});

test('os dados reais das 4 marcas têm o que o llms.txt precisa', async () => {
  const { marcas } = await import('../src/marcas.js');
  for (const chave of ['stratai', 'agencia', 'academy', 'metricaas']) {
    assert.ok(marcas[chave]?.nome && marcas[chave]?.resumo, `${chave} sem nome ou resumo`);
  }
});

test('llms.txt sem página indexável diz isso, e marca fora do catálogo quebra o build', () => {
  const txt = montarLlms({ marca: 'agencia', site: 'https://agenciastrat.com.br/', indexaveis: [], catalogo });
  assert.match(txt, /Nenhuma página publicada neste endereço ainda\./);
  assert.doesNotMatch(txt, /Contato|Endereço|Redes/);
  assert.throws(() => montarLlms({ marca: 'x', site: 'https://x/', indexaveis: [], catalogo }), /marcas.js/);
});

// git de mentira: guarda os comandos e responde como um clone raso que vira completo depois do fetch.
function gitFalso({ raso = true, fetchFalha = false } = {}) {
  const chamadas = [];
  const git = (...args) => {
    chamadas.push(args.join(' '));
    if (args[0] === 'rev-parse') return raso ? 'true' : 'false';
    if (args[0] === 'fetch') {
      if (fetchFalha) throw new Error('sem rede');
      raso = false;
      return '';
    }
    if (args[0] === 'log') return '2026-11-10';
    return '';
  };
  return { git, chamadas };
}

test('clone raso: o build busca o histórico antes de ler o lastmod (Pages clona raso)', () => {
  const { git, chamadas } = gitFalso();
  assert.equal(completarHistorico('.', git), 'completado');
  assert.ok(chamadas.includes('fetch --unshallow --quiet'));
  assert.equal(dataDoUltimoCommit('apps/stratai/src/pages/index.astro', '.', git), '2026-11-10');
});

test('clone completo não busca nada; fetch que falha deixa o lastmod em branco', () => {
  const completo = gitFalso({ raso: false });
  assert.equal(completarHistorico('.', completo.git), 'completo');
  assert.ok(!completo.chamadas.some((c) => c.startsWith('fetch')));

  const semRede = gitFalso({ fetchFalha: true });
  assert.equal(completarHistorico('.', semRede.git), 'raso');
  assert.equal(dataDoUltimoCommit('apps/stratai/src/pages/index.astro', '.', semRede.git), undefined);
});
