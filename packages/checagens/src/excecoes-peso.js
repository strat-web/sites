// Páginas que ainda não cabem no orçamento do Lighthouse (performance ≥ 90, LCP ≤ 2,5 s) por um motivo escrito
// abaixo, com o item que as tira. Cada uma tem um piso, o número medido no mesmo Lighthouse em celular: abaixo do
// orçamento e acima do piso, a checagem só avisa; abaixo do piso, barra. O limite de 1,5 MB continua valendo. Sai
// daqui no item que acertar o desempenho da página. A home, o /raio-x/ e a política da StratAI saíram no WEB-87,
// em 18/11/2026, depois do servidor com gzip do WEB-88. Hoje a lista está vazia.
export const EXCECOES_LIGHTHOUSE = {};
