import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { SITE } from '../consts';
import { absUrl } from '@horus/seo';
import {
  FERRAMENTAS_NO_AR, PASSOS_FUNIL, ETAPAS_FUNIL, MODELOS_FUNIL,
  FAQ_FUNIL, rotaFerramenta,
  MODELOS_CONSTRUTOR, CATEGORIAS_CONSTRUTOR, PASSOS_CONSTRUTOR,
  EXPORTACOES_CONSTRUTOR, FAQ_CONSTRUTOR,
} from '../data/ferramentas';
import { NODE_TYPES } from '@strat-ai-horus-os/funil-nucleo';
import { calcularFunil, fmtNum, fmtReal, fmtTaxa } from '../lib/funil';
import { naListagem } from '@strat/conteudo';

// llms-full.txt: dump completo do conteúdo (corpo dos posts) para LLMs.
// Complementa o /llms.txt (que é só o índice). Boa prática emergente de GEO.
export const GET: APIRoute = async () => {
  const posts = (await getCollection('blog', ({ data }) => naListagem(data))).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf()
  );
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const blocks = posts.map((p) => {
    const meta = [
      `# ${p.data.title}`,
      `URL: ${absUrl(`/blog/${p.id}/`)}`,
      `Autor: ${p.data.author}`,
      `Publicado: ${fmt(p.data.pubDate)}${p.data.updatedDate ? ` · Atualizado: ${fmt(p.data.updatedDate)}` : ''}`,
      `Tags: ${p.data.tags.join(', ')}`,
      '',
      p.body?.trim() ?? '',
    ].join('\n');
    return meta;
  });

  // O texto integral da central. É este bloco que responde à pergunta de quem
  // busca — e resposta com o texto inteiro é o que faz o assistente citar a fonte,
  // em vez de parafrasear um resumo de terceiro.
  const BASE_FUNIL = '/ferramentas/calculadora-de-funil-de-vendas';

  // Cada ferramenta tem o SEU texto integral. Iterar a lista e despejar sempre o
  // conteúdo da calculadora era o que acontecia quando só existia uma — e daria
  // a uma ferramenta o passo a passo da outra.
  const textoDoCriador = (f: (typeof FERRAMENTAS_NO_AR)[number]) =>
    [
      `# ${f.tarefa}`,
      `URL: ${absUrl(`${rotaFerramenta(f.slug)}/`)}`,
      'Tipo: ferramenta online gratuita, sem cadastro',
      `Termo de busca: ${f.termoDeBusca}`,
      '',
      f.resumo,
      '',
      '## Os elementos que existem no editor',
      '',
      ...CATEGORIAS_CONSTRUTOR.map((c) => `### ${c.nome}\n${c.desc}\nExemplos: ${c.exemplo}`),
      '',
      '## Como desenhar um funil de vendas — passo a passo',
      '',
      ...PASSOS_CONSTRUTOR.map((s) => `### Passo ${s.n}. ${s.titulo}\n${s.texto}`),
      '',
      '## O que dá para fazer com o funil pronto',
      '',
      ...EXPORTACOES_CONSTRUTOR.map((e) => `### ${e.titulo} (${e.formato})\n${e.desc}`),
      '',
      '## Perguntas frequentes',
      '',
      ...FAQ_CONSTRUTOR.map((q) => `### ${q.q}\n${q.a}`),
    ].join('\n');

  const textoDaCalculadora = (f: (typeof FERRAMENTAS_NO_AR)[number]) =>
    [
      `# ${f.tarefa}`,
      `URL: ${absUrl(`${rotaFerramenta(f.slug)}/`)}`,
      `Tipo: ferramenta online gratuita, sem cadastro`,
      `Termo de busca: ${f.termoDeBusca}`,
      '',
      f.resumo,
      '',
      '## As cinco etapas padrão de um funil de vendas',
      '',
      ...ETAPAS_FUNIL.map((e) => `### ${e.nome}\n${e.descricao}\nComo medir: ${e.comoMedir}`),
      '',
      '## Como montar um funil de vendas — passo a passo',
      '',
      ...PASSOS_FUNIL.map((s) => `### Passo ${s.n}. ${s.titulo}\n${s.texto}`),
      '',
      '## Perguntas frequentes',
      '',
      ...FAQ_FUNIL.map((q) => `### ${q.q}\n${q.a}`),
    ].join('\n');

  const ferramentas = FERRAMENTAS_NO_AR.map((f) =>
    f.slug === 'criador-de-funil-de-vendas' ? textoDoCriador(f) : textoDaCalculadora(f),
  );

  // Os modelos do criador: o funil inteiro em texto, etapa por etapa. É o que
  // permite a um assistente responder "como é um funil de lançamento" com o
  // nosso desenho, e não com um resumo de terceiro.
  const modelosDoCriador = MODELOS_CONSTRUTOR.map((m) =>
    [
      `# ${m.nome}`,
      `URL: ${absUrl(`/ferramentas/criador-de-funil-de-vendas/modelos/${m.slug}/`)}`,
      'Tipo: modelo pronto de funil, gratuito e editável no navegador',
      `Termo de busca: ${m.termoDeBusca}`,
      '',
      m.resumo,
      '',
      '## Para quem é',
      m.publico,
      `Tempo de montagem: ${m.tempoDeMontagem}.`,
      '',
      '## Quando usar este modelo',
      m.quandoUsar,
      '',
      '## O que observar',
      m.oQueObservar,
      '',
      '## As etapas, na ordem',
      ...m.documento.nodes.map((n, i) => {
        const tipo = NODE_TYPES[n.data.type]?.label ?? n.data.type;
        const desc = n.data.description ? ` — ${n.data.description}` : '';
        return `${i + 1}. ${n.data.label} (${tipo})${desc}`;
      }),
      '',
      '## Perguntas sobre este funil',
      '',
      ...m.perguntas.map((p) => `### ${p.pergunta}\n${p.resposta}`),
    ].join('\n'),
  );

  const modelos = MODELOS_FUNIL.map((m) => {
    const c = calcularFunil(m.etapas, m.ticket);
    return [
      `# ${m.titulo}`,
      `URL: ${absUrl(`${BASE_FUNIL}/modelos/${m.slug}/`)}`,
      `Tipo: modelo pronto de funil, gratuito e editável`,
      '',
      m.resumo,
      '',
      '## Para quem é',
      m.paraQuem,
      '',
      '## Quando usar este modelo',
      m.quandoUsar,
      '',
      '## O que observar ao medir',
      m.oQueObservar,
      '',
      '## As etapas, com números de referência',
      ...c.etapas.map(
        (e) =>
          `- ${e.nome}: ${fmtNum(e.valor)}` +
          (e.taxaPassagem === null
            ? ' (topo do funil)'
            : ` — ${fmtTaxa(e.taxaPassagem)} da etapa anterior, ${fmtTaxa(e.taxaAcumulada)} do topo` +
              (e.gargalo ? ' [GARGALO]' : '')) +
          `. ${e.nota}`,
      ),
      '',
      `Ticket médio de referência: ${fmtReal(m.ticket)}. ` +
        `Conversão geral: ${fmtTaxa(c.taxaGeral)}. ` +
        `Receita do funil: ${fmtReal(c.receita)}. ` +
        `Cada ponto percentual a mais na passagem de ${c.gargalo?.nome} vale ${fmtReal(c.ganhoPorPonto)}.`,
      '',
      '## O gargalo típico deste funil',
      m.gargaloTipico,
    ].join('\n');
  });

  const out = [
    `# ${SITE.name} — Conteúdo completo`,
    '',
    `> ${SITE.description}`,
    '',
    '---',
    '',
    [...ferramentas, ...modelosDoCriador, ...modelos, ...blocks].join('\n\n---\n\n'),
    '',
  ].join('\n');

  return new Response(out, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
