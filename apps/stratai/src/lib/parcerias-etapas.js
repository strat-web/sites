// O que fazer quando o formulário de 3 etapas da /parcerias/ (WEB-74) recebe "submit". Função pura, roda no navegador
// (components/parcerias/Formulario.astro) e nos testes (test/parcerias.test.js).
//
// O Enter num campo dispara o submit do formulário em qualquer etapa (o botão de envio oculto é o padrão do form).
// Antes, o handler validava só a etapa atual e enviava o lead da etapa 1 pulando as etapas 2 e 3 (revisão do PR #22).
// Agora: fora da última etapa, o Enter valida e avança; na última, todas as etapas são validadas antes de enviar.

/**
 * @param {number} atual etapa visível (0, 1, 2…)
 * @param {number} total número de etapas
 * @param {(i: number) => boolean} valida valida a etapa i (pode marcar os campos inválidos)
 * @returns {{ acao: 'avancar' | 'ficar' | 'voltar' | 'enviar', etapa: number }}
 *   avancar: ir para `etapa`; ficar: a etapa atual tem erro; voltar: a primeira etapa com erro é `etapa`;
 *   enviar: todas as etapas válidas.
 */
export function decidirEnvio(atual, total, valida) {
  if (atual < total - 1) return valida(atual) ? { acao: 'avancar', etapa: atual + 1 } : { acao: 'ficar', etapa: atual };
  for (let i = 0; i < total; i++) {
    if (!valida(i)) return i === atual ? { acao: 'ficar', etapa: i } : { acao: 'voltar', etapa: i };
  }
  return { acao: 'enviar', etapa: atual };
}
