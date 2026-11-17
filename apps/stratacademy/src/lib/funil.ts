// Matemática do funil. Fica separada da página de propósito: é a mesma conta que
// o passo a passo em texto descreve, que o build renderiza no HTML e que o script
// da ferramenta vai refazer no navegador.

export interface EntradaEtapa {
  nome: string;
  valor: number;
  nota?: string;
}

export interface EtapaCalculada extends EntradaEtapa {
  /** Taxa desta etapa em relação à anterior, em %. `null` na primeira. */
  taxaPassagem: number | null;
  /** Taxa desta etapa em relação ao topo do funil, em %. */
  taxaAcumulada: number;
  /** Quantas pessoas se perderam da etapa anterior para esta. `null` na primeira. */
  perda: number | null;
  /** Largura da barra no desenho, 0–100, proporcional ao topo. */
  largura: number;
  /** `true` na passagem com a pior taxa — o gargalo. */
  gargalo: boolean;
}

export interface FunilCalculado {
  etapas: EtapaCalculada[];
  /** Taxa do topo até a última etapa, em %. */
  taxaGeral: number;
  /** A etapa que recebe o gargalo (a de baixo da pior passagem). */
  gargalo: EtapaCalculada | null;
  /** clientes × ticket. */
  receita: number;
  /** Receita a mais por mês se a taxa do gargalo subir 1 ponto percentual. */
  ganhoPorPonto: number;
}

const pct = (parte: number, todo: number) => (todo > 0 ? (parte / todo) * 100 : 0);

/** Uma casa decimal, com vírgula — e sem deixar 20 virar "20,0" na tela. */
export const fmtTaxa = (n: number) =>
  `${n.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;

export const fmtNum = (n: number) => n.toLocaleString('pt-BR');

export const fmtReal = (n: number) =>
  n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

/**
 * Roda os passos 3 a 6 do passo a passo: taxa por passagem, taxa acumulada,
 * gargalo e quanto vale um ponto percentual nele.
 */
export function calcularFunil(entradas: EntradaEtapa[], ticket = 0): FunilCalculado {
  const topo = entradas[0]?.valor ?? 0;

  const etapas: EtapaCalculada[] = entradas.map((e, i) => {
    const anterior = i > 0 ? entradas[i - 1].valor : null;
    return {
      ...e,
      taxaPassagem: anterior === null ? null : pct(e.valor, anterior),
      taxaAcumulada: pct(e.valor, topo),
      perda: anterior === null ? null : anterior - e.valor,
      // Piso de 12% para a barra não sumir quando a etapa final é muito pequena.
      largura: Math.max(pct(e.valor, topo), 12),
      gargalo: false,
    };
  });

  // O gargalo é a menor taxa de passagem — nunca a primeira etapa, que não tem.
  const comPassagem = etapas.filter((e) => e.taxaPassagem !== null);
  const gargalo =
    comPassagem.length > 0
      ? comPassagem.reduce((pior, e) => (e.taxaPassagem! < pior.taxaPassagem! ? e : pior))
      : null;
  if (gargalo) gargalo.gargalo = true;

  const clientes = entradas.at(-1)?.valor ?? 0;
  const receita = clientes * ticket;

  // Um ponto a mais na taxa do gargalo, propagado pelas taxas seguintes.
  let ganhoPorPonto = 0;
  if (gargalo && gargalo.taxaPassagem !== null) {
    const i = etapas.indexOf(gargalo);
    const anterior = entradas[i - 1].valor;
    const novoValor = anterior * ((gargalo.taxaPassagem + 1) / 100);
    // As etapas abaixo do gargalo mantêm as taxas que já têm.
    const restante = etapas
      .slice(i + 1)
      .reduce((acc, e) => acc * ((e.taxaPassagem ?? 0) / 100), 1);
    ganhoPorPonto = (novoValor * restante - clientes) * ticket;
  }

  return {
    etapas,
    taxaGeral: pct(clientes, topo),
    gargalo,
    receita,
    ganhoPorPonto,
  };
}
