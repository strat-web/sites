// Páginas-esqueleto do WEB-15: a home de cada app ainda é um marcador (noindex, sem tracking) e a página real segue
// na hospedagem antiga até o item de migração. A linha do catálogo descreve a página real, então sem esta lista a
// checagem de tracking acusaria "página sem <Tracking>" em todo esqueleto.
//
// Regras (checagem tracking): a URL listada tem de estar com noindex e sem script de tracking. Quando a migração
// põe o <Tracking> na página, a checagem quebra pedindo para tirar a URL daqui, no mesmo PR da migração.
export const ESQUELETOS = {
  'https://agenciastrat.com.br/': 'WEB-23',
  'https://metricaas.com.br/': 'WEB-36',
  'https://stratacademy.com.br/': 'WEB-49',
};
