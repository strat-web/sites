// Páginas que ainda não cabem no orçamento do Lighthouse (performance ≥ 90, LCP ≤ 2,5 s) por um motivo escrito
// abaixo, com o item que as tira. Cada uma tem um piso, o número medido no mesmo Lighthouse em celular: abaixo do
// orçamento e acima do piso, a checagem só avisa; abaixo do piso, barra. O limite de 1,5 MB continua valendo. Sai
// daqui no item que acertar o desempenho da página. A home, o /raio-x/ e a política da StratAI saíram no WEB-87,
// em 18/11/2026, depois do servidor com gzip do WEB-88. Hoje só a /v2/ da mentoria (WEB-48).
export const EXCECOES_LIGHTHOUSE = {
  // WEB-48: a /v2/ é o app React antigo da mentoria (pacote pronto do strat-lps, sem código-fonte aqui), noindex.
  // O LCP é o H1 que o React desenha depois de baixar e rodar os 320 KB de JS. Em 18/11, com o gzip do WEB-88 na
  // main, a CI mediu 96 e 2,7 s (CLS 0,001) em três rodadas; reordenar JS, CSS e fontes não mudou nada.
  // A origem no strat-lps mediu 77 e 4,36 s (17/11). O piso fica logo abaixo da medição de hoje.
  'https://mentoria.stratacademy.com.br/v2/': {
    item: 'WEB-48',
    motivo:
      'app React antigo (pacote pronto, noindex): LCP é o H1 desenhado depois do JS. CI de 18/11 com gzip: 96 e 2,7 s; ' +
      'origem 77 e 4,36 s. Alternativa para o Helbert decidir: pré-desenhar o hero no HTML',
    piso: { performance: 95, lcpMs: 2800, cls: 0.1 },
  },
};
