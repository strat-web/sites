// O codec do estado do funil na URL. Fica fora de scripts/funil.ts porque é
// lógica pura — não toca em DOM — e porque assim dá para testar sem navegador.
//
// Formato, legível de propósito:
//   ?etapas=Visitantes:10000,Leads:1200&ticket=1200
//
// Legível importa: o link é colado em WhatsApp e em e-mail, e quem recebe
// consegue ver o que vai abrir antes de clicar.

import type { EntradaEtapa } from './funil';

export interface EstadoFunil {
  etapas: EntradaEtapa[];
  ticket: number;
}

export const MIN_ETAPAS = 2;
export const MAX_ETAPAS = 8;
export const MAX_NOME = 40;

export const limpaNome = (t: unknown) =>
  String(t ?? '').replace(/[\r\n\t]/g, ' ').trim().slice(0, MAX_NOME);

export const inteiro = (v: unknown) => {
  const n = Math.floor(Number(v));
  return Number.isFinite(n) && n >= 0 ? n : 0;
};

/** Apara o que vier de fora: nome vazio, valor negativo, etapa a mais. */
export function normaliza(bruto: EstadoFunil): EstadoFunil {
  return {
    etapas: (bruto.etapas ?? []).slice(0, MAX_ETAPAS).map((e, i) => ({
      nome: limpaNome(e?.nome) || `Etapa ${i + 1}`,
      valor: inteiro(e?.valor),
      nota: e?.nota,
    })),
    ticket: inteiro(bruto?.ticket),
  };
}

export function serializar(estado: EstadoFunil, pathname: string): string {
  const etapas = estado.etapas
    .map((e) => `${encodeURIComponent(e.nome).replace(/%20/g, '+')}:${e.valor}`)
    .join(',');
  const q = new URLSearchParams();
  q.set('etapas', etapas);
  if (estado.ticket > 0) q.set('ticket', String(estado.ticket));
  // URLSearchParams escapa ':' e ',' — devolvidos porque são seguros e legíveis.
  return `${pathname}?${q.toString().replace(/%3A/g, ':').replace(/%2C/g, ',')}`;
}

/** `null` quando não há estado válido na busca — aí vale o padrão do build. */
export function desserializar(busca: string): EstadoFunil | null {
  const q = new URLSearchParams(busca);
  const cru = q.get('etapas');
  if (!cru) return null;

  const etapas: EntradaEtapa[] = [];
  for (const parte of cru.split(',')) {
    const corte = parte.lastIndexOf(':');
    if (corte < 1) continue;
    let nome: string;
    try {
      nome = limpaNome(decodeURIComponent(parte.slice(0, corte).replace(/\+/g, ' ')));
    } catch {
      continue; // percent-encoding quebrado num link mal copiado
    }
    if (nome) etapas.push({ nome, valor: inteiro(parte.slice(corte + 1)) });
  }

  if (etapas.length < MIN_ETAPAS) return null;
  return normaliza({ etapas, ticket: inteiro(q.get('ticket')) });
}
