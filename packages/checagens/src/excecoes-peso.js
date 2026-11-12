// Páginas migradas que ainda não cabem no orçamento do Lighthouse (performance ≥ 90, LCP ≤ 2,5 s) e que a migração
// não pode mexer (WEB-32: "sem mudar texto, layout nem tracking"). Cada uma tem um piso, o número da página no ar
// medido no mesmo Lighthouse em celular no dia da migração: abaixo do orçamento e acima do piso, a checagem só avisa;
// abaixo do piso, barra. O limite de 1,5 MB continua valendo. Sai daqui no item que acertar o desempenho da página.
export const EXCECOES_LIGHTHOUSE = {
  'https://stratai.com.br/': {
    item: 'WEB-32',
    motivo:
      'home migrada sem mudança (WEB-32); no ar em 12/11/2026 mediu performance 68 e LCP 5,4 s. A fonte do Google ' +
      'bloqueia a renderização (cerca de 0,9 s) e o HTML tem 246 KB, com 117 KB de CSS no <head>',
    piso: { performance: 68, lcpMs: 5400, cls: 0.1 },
  },
};
