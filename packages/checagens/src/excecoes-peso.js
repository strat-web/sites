// Páginas que ainda não cabem no orçamento do Lighthouse (performance ≥ 90, LCP ≤ 2,5 s) por um motivo escrito
// abaixo, com o item que as tira. Cada uma tem um piso, o número medido no mesmo Lighthouse em celular: abaixo do
// orçamento e acima do piso, a checagem só avisa; abaixo do piso, barra. O limite de 1,5 MB continua valendo. Sai
// daqui no item que acertar o desempenho da página. A home da StratAI (WEB-32) saiu no WEB-87, em 17/11/2026.
export const EXCECOES_LIGHTHOUSE = {
  'https://stratai.com.br/politica-de-privacidade/': {
    item: 'WEB-88',
    motivo:
      'falso vermelho da CI: o servidor local das checagens não comprime (WEB-88). Em 12/11/2026 a página mediu ' +
      'performance 100 e LCP 1,5 s no preview do Pages e 99 e 1,5 s no ar; a CI mediu 93 e 2,6 s',
    piso: { performance: 88, lcpMs: 3000, cls: 0.1 },
  },
  'https://stratai.com.br/raio-x/': {
    item: 'WEB-88',
    motivo:
      'falso vermelho da CI: o servidor local das checagens não comprime (WEB-88). Em 12/11/2026 a página mediu ' +
      'LCP 1,7 s no preview do Pages (performance 85 a 90) e 2,0 s no ar (93 a 97); a CI mediu 90 e 2,9 s',
    piso: { performance: 85, lcpMs: 3300, cls: 0.1 },
  },
};
