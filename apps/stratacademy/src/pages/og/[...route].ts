import { getCollection } from 'astro:content';
import { OGImageRoute } from 'astro-og-canvas';
import { ogOptions } from '@horus/seo';
import { FERRAMENTAS_NO_AR, MODELOS_FUNIL, MODELOS_CONSTRUTOR, MODELOS_WHATSAPP } from '../../data/ferramentas';
import { calcularMes } from '@strat-ai-horus-os/whatsapp-nucleo';
import { fmtMoeda } from '../../lib/whatsapp';
import { resumirModelo } from '@strat-ai-horus-os/funil-nucleo';
import { calcularFunil, fmtNum, fmtTaxa } from '../../lib/funil';
import { naListagem } from '@strat/conteudo';

const posts = await getCollection('blog', ({ data }) => naListagem(data));

// Toda entrada vira {title, legenda} aqui, e não no getImageOptions. Assim o
// subtítulo dos posts continua sendo "por <autor>", como sempre foi — os posts
// também têm `description`, e ler esse campo mudaria a OG de todos eles.
type Og = { title: string; legenda: string };

const doBlog: Record<string, Og> = Object.fromEntries(
  posts.map((p) => [p.id, { title: p.data.title, legenda: p.data.author ? `por ${p.data.author}` : '' }]),
);

const daFerramenta: Record<string, Og> = Object.fromEntries(
  FERRAMENTAS_NO_AR.map((f) => [
    `ferramenta-${f.slug}`,
    { title: f.tarefa, legenda: 'Ferramenta gratuita · sem cadastro · Strat Academy' },
  ]),
);

// LIMITAÇÃO CONHECIDA — a imagem dos modelos NÃO desenha as barras do funil.
// `astro-og-canvas` compõe apenas título, descrição, gradiente, borda e fonte;
// não expõe API de desenho. Barras exigiriam um canvas em build-time
// (node-canvas / satori / resvg), que é dependência nova — vetada no pedido.
// O contorno: os números que as barras mostrariam vão para a legenda — topo,
// fim, conversão geral e o gargalo com a taxa. Perde-se a forma, não o dado.
const doModelo: Record<string, Og> = Object.fromEntries(
  MODELOS_FUNIL.map((m) => {
    const c = calcularFunil(m.etapas, m.ticket);
    const topo = c.etapas[0];
    const fim = c.etapas.at(-1)!;
    return [
      `funil-${m.slug}`,
      {
        title: m.titulo,
        legenda:
          `${fmtNum(topo.valor)} ${topo.nome.toLowerCase()} → ${fmtNum(fim.valor)} ${fim.nome.toLowerCase()}` +
          ` · ${fmtTaxa(c.taxaGeral)} de conversão` +
          (c.gargalo ? ` · gargalo em ${c.gargalo.nome} (${fmtTaxa(c.gargalo.taxaPassagem ?? 0)})` : ''),
      },
    ];
  }),
);

// Os modelos do criador: a legenda diz o tamanho do funil, que é o que a
// imagem não consegue desenhar.
const doModeloDoCriador: Record<string, Og> = Object.fromEntries(
  MODELOS_CONSTRUTOR.map((m) => {
    const r = resumirModelo(m);
    return [
      `criador-${m.slug}`,
      {
        title: m.nome,
        legenda: `${r.etapas} etapas · ${r.conexoes} passagens · modelo pronto e editável · Strat Academy`,
      },
    ];
  }),
);

// Os cenários de WhatsApp: a legenda leva a conta, que é o que a busca procura.
const doCenarioWhatsapp: Record<string, Og> = Object.fromEntries(
  MODELOS_WHATSAPP.map((m) => {
    const r = calcularMes(m.simulacao);
    return [
      `whatsapp-${m.slug}`,
      {
        title: m.titulo,
        legenda: `${fmtNum(r.mensagensEnviadas)} mensagens/mês · ${fmtMoeda(r.meta, 'BRL')} de Meta · tabela de out/2026 · Strat Academy`,
      },
    ];
  }),
);

const pages: Record<string, Og> = {
  ...doBlog,
  ...daFerramenta,
  ...doModelo,
  ...doModeloDoCriador,
  ...doCenarioWhatsapp,
  ferramentas: {
    title: 'Ferramentas gratuitas para o seu negócio',
    legenda: 'Resolvem a tarefa na hora. Sem cadastro e sem limite de uso.',
  },
};

export const { getStaticPaths, GET } = await OGImageRoute({
  param: 'route',
  pages,
  getImageOptions: (_id, page: Og) => ogOptions(page.title, page.legenda),
});
