// A leitura ESCRITA do funil — o que a calculadora não diz só com número.
//
// Roda no build (para o HTML sair pronto) e no navegador (para acompanhar o que
// a pessoa digita). Mesma função nos dois lugares, mesma regra do calcularFunil.
//
// Sobre as faixas de referência: elas saem dos 4 modelos da própria central, e é
// isso que o texto diz. Não são "média do setor" — esse número não existe de
// forma honesta, e inventá-lo seria o tipo de precisão falsa que a página inteira
// evita. O que a faixa responde é: "entre os quatro tipos de negócio que a gente
// modelou, essa passagem costuma ficar entre X% e Y%".

import { calcularFunil, fmtReal, fmtTaxa, type EntradaEtapa } from './funil';

export interface Faixa {
  min: number;
  max: number;
}

export type Posicao = 'acima' | 'dentro' | 'abaixo';

export interface LeituraPassagem {
  /** Etapa de baixo da passagem — é ela que "recebe" a taxa. */
  nome: string;
  de: string;
  taxa: number;
  perda: number;
  faixa: Faixa;
  posicao: Posicao;
  gargalo: boolean;
  /** O que essa taxa quer dizer, em português. */
  significado: string;
  /** O que olhar primeiro. */
  ondeOlhar: string;
}

export interface Diagnostico {
  passagens: LeituraPassagem[];
  resumo: string;
  gargalo: {
    nome: string;
    de: string;
    taxa: number;
    ganhoPorPonto: number;
    texto: string;
  } | null;
  /** Aviso quando os números não fecham (etapa maior que a anterior). */
  inconsistencia: string | null;
}

// ------------------------------------------------------------
// Faixas de referência
// ------------------------------------------------------------
//
// As faixas ENTRAM por parâmetro em vez de serem importadas dos modelos. Não é
// cerimônia: importar MODELOS_FUNIL aqui arrastaria a prosa inteira dos quatro
// modelos para o bundle do navegador — texto que a página já tem no HTML. São
// oito números; quem os calcula é lib/funil-referencia.ts, no build.

/** Mapeia a passagem `i` de um funil de `total` passagens para a profundidade equivalente. */
function faixaPara(i: number, total: number, ref: Faixa[]): Faixa {
  if (ref.length === 0) return { min: 0, max: 100 };
  const alvo = total <= 1 ? 0 : Math.round((i / (total - 1)) * (ref.length - 1));
  return ref[Math.min(Math.max(alvo, 0), ref.length - 1)];
}

function posicionar(taxa: number, f: Faixa): Posicao {
  if (taxa < f.min) return 'abaixo';
  if (taxa > f.max) return 'acima';
  return 'dentro';
}

// ------------------------------------------------------------
// O texto
// ------------------------------------------------------------

/** Terços do funil: topo, meio e fundo pedem perguntas diferentes. */
type Trecho = 'topo' | 'meio' | 'fundo';

function trechoDe(i: number, total: number): Trecho {
  if (total <= 2) return i === 0 ? 'topo' : 'fundo';
  const r = i / (total - 1);
  return r < 0.34 ? 'topo' : r < 0.67 ? 'meio' : 'fundo';
}

const ONDE_OLHAR: Record<Trecho, Record<Posicao, string>> = {
  topo: {
    abaixo:
      'Comece pela origem do tráfego, não pela página. Taxa baixa logo no primeiro degrau quase sempre é gente errada chegando — anúncio amplo demais, palavra-chave genérica, tráfego de curiosidade. Trocar o botão não resolve público errado.',
    dentro:
      'Está no intervalo dos modelos. Se quiser ganhar aqui, o caminho é a clareza da promessa acima da dobra: quem chega precisa entender em cinco segundos o que você faz e para quem.',
    acima:
      'Está acima dos quatro modelos, o que costuma significar tráfego bem qualificado. Cuidado só com o volume: taxa alta em base pequena é fácil de manter e difícil de escalar — ao aumentar o investimento, espere ela cair.',
  },
  meio: {
    abaixo:
      'O meio do funil vaza por atrito ou por falta de contexto. Olhe primeiro o tempo de resposta e o número de campos ou passos entre uma etapa e outra; depois, se a pessoa tem informação suficiente para dar o próximo passo sem precisar perguntar.',
    dentro:
      'Comportamento normal para esta altura do funil. O ganho aqui costuma vir de encurtar o intervalo entre as etapas — quanto mais tempo passa, mais gente esfria.',
    acima:
      'Passagem forte. Vale entender o que está funcionando aqui e tentar repetir nos outros degraus, porque geralmente é um padrão replicável: uma mensagem, um formato de contato, um momento certo.',
  },
  fundo: {
    abaixo:
      'Perda no fundo é a mais cara, porque essa gente já custou tudo o que tinha para custar. Olhe o momento exato do abandono: forma de pagamento ausente, preço que só aparece no fim, proposta que chega sem o escopo ter ficado claro.',
    dentro:
      'Dentro do que os modelos mostram. Aqui o ganho costuma ser de execução: reduzir passos, oferecer o meio de pagamento que o seu público usa, dar uma razão para decidir agora.',
    acima:
      'Fechamento acima dos modelos. Quando o fundo converte muito bem e o total ainda é baixo, o problema está em cima: você está fechando bem com pouca gente, e o caminho é trazer mais gente parecida.',
  },
};

function significadoDe(l: {
  taxa: number;
  perda: number;
  de: string;
  nome: string;
  faixa: Faixa;
  posicao: Posicao;
}): string {
  const cem = Math.round(l.taxa);
  const base =
    `De cada 100 que chegam em ${l.de}, ${cem} seguem para ${l.nome} — ` +
    `os outros ${100 - cem} param aqui.`;
  const contexto =
    l.posicao === 'dentro'
      ? `Está dentro da faixa que os quatro modelos da central mostram nessa altura (${fmtTaxa(l.faixa.min)} a ${fmtTaxa(l.faixa.max)}).`
      : l.posicao === 'abaixo'
        ? `Está abaixo dos quatro modelos, que nessa altura ficam entre ${fmtTaxa(l.faixa.min)} e ${fmtTaxa(l.faixa.max)}.`
        : `Está acima dos quatro modelos, que nessa altura ficam entre ${fmtTaxa(l.faixa.min)} e ${fmtTaxa(l.faixa.max)}.`;
  return `${base} ${contexto}`;
}

// ------------------------------------------------------------
// Diagnóstico
// ------------------------------------------------------------

export function diagnosticar(
  etapas: EntradaEtapa[],
  ticket: number,
  referencia: Faixa[],
): Diagnostico {
  const f = calcularFunil(etapas, ticket);
  const comPassagem = f.etapas.filter((e) => e.taxaPassagem !== null);
  const total = comPassagem.length;

  const passagens: LeituraPassagem[] = comPassagem.map((e, i) => {
    const faixa = faixaPara(i, total, referencia);
    const taxa = e.taxaPassagem ?? 0;
    const posicao = posicionar(taxa, faixa);
    const de = f.etapas[f.etapas.indexOf(e) - 1]?.nome ?? '';
    return {
      nome: e.nome,
      de,
      taxa,
      perda: e.perda ?? 0,
      faixa,
      posicao,
      gargalo: e.gargalo,
      significado: significadoDe({ taxa, perda: e.perda ?? 0, de, nome: e.nome, faixa, posicao }),
      ondeOlhar: ONDE_OLHAR[trechoDe(i, total)][posicao],
    };
  });

  const g = f.gargalo;
  const gargalo = g
    ? {
        nome: g.nome,
        de: f.etapas[f.etapas.indexOf(g) - 1]?.nome ?? '',
        taxa: g.taxaPassagem ?? 0,
        ganhoPorPonto: f.ganhoPorPonto,
        texto:
          ticket > 0
            ? `Subir a passagem de ${g.nome} em um único ponto percentual — de ${fmtTaxa(g.taxaPassagem ?? 0)} para ` +
              `${fmtTaxa((g.taxaPassagem ?? 0) + 1)} — vale ${fmtReal(f.ganhoPorPonto)} a mais por período, ` +
              `mantendo tudo o mais igual. É esse número que decide se a próxima ação vale o esforço: ` +
              `se arrumar isso custa mais que ${fmtReal(f.ganhoPorPonto * 12)} no ano, o retorno não fecha.`
            : `Preencha o ticket médio para ver quanto vale, em reais, cada ponto percentual ganho nesta passagem. ` +
              `Sem esse número o funil diz onde está o problema, mas não se vale a pena resolvê-lo.`,
      }
    : null;

  // Etapa maior que a anterior é erro de contagem, não um funil bom.
  const furada = passagens.find((p) => p.taxa > 100);
  const inconsistencia = furada
    ? `A etapa "${furada.nome}" tem mais gente que "${furada.de}", o que não é possível num funil: ` +
      `toda pessoa numa etapa passou pela anterior. Normalmente é contagem de evento em vez de pessoa, ` +
      `ou períodos diferentes misturados. Corrija antes de confiar no resto da leitura.`
    : null;

  const resumo = gargalo
    ? `O funil converte ${fmtTaxa(f.taxaGeral)} do topo até a venda. A passagem mais fraca é a de ` +
      `${gargalo.nome}, com ${fmtTaxa(gargalo.taxa)} — é lá que está o dinheiro parado, e é por lá que ` +
      `se começa. Mexer numa passagem que já vai bem rende menos que arrumar essa.`
    : `Preencha ao menos duas etapas para a leitura completa.`;

  return { passagens, resumo, gargalo, inconsistencia };
}
