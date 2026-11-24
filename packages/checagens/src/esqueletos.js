// Páginas-esqueleto do WEB-15: a home de cada app ainda é um marcador (noindex, sem tracking) e a página real segue
// na hospedagem antiga até o item de migração. A linha do catálogo descreve a página real, então sem esta lista a
// checagem de tracking acusaria "página sem <Tracking>" em todo esqueleto.
// Já saíram: stratai.com.br/ (WEB-32), metricaas.com.br/ (WEB-36), agenciastrat.com.br/ (WEB-23) e
// stratacademy.com.br/ (WEB-49). A lista fica vazia, pronta para o próximo app que nascer como esqueleto.
//
// Regras (checagem tracking): a URL listada tem de estar com noindex e sem script de tracking. Quando a migração
// põe o <Tracking> na página, a checagem quebra pedindo para tirar a URL daqui, no mesmo PR da migração.
export const ESQUELETOS = {
};
