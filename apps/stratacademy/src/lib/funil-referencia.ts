// As faixas de referência do diagnóstico, derivadas dos 4 modelos da central.
//
// Vive separado do funil-diagnostico.ts porque este arquivo importa os modelos
// inteiros — o que é barato no build e caro no navegador. O resultado são oito
// números, que a página serializa junto do estado inicial. Assim a fonte de
// verdade continua sendo MODELOS_FUNIL, sem custo de bundle.

import { calcularFunil } from './funil';
import type { Faixa } from './funil-diagnostico';
import { MODELOS_FUNIL } from '../data/ferramentas';

export const REFERENCIA_MODELOS: Faixa[] = (() => {
  const porPosicao: number[][] = [];
  for (const m of MODELOS_FUNIL) {
    const c = calcularFunil(m.etapas, m.ticket);
    c.etapas.forEach((e, i) => {
      if (e.taxaPassagem === null) return;
      (porPosicao[i - 1] ??= []).push(e.taxaPassagem);
    });
  }
  return porPosicao.map((taxas) => ({
    // Uma casa basta: o texto arredonda de qualquer forma, e número comprido
    // aqui só engorda o JSON que vai no HTML.
    min: Math.round(Math.min(...taxas) * 10) / 10,
    max: Math.round(Math.max(...taxas) * 10) / 10,
  }));
})();
