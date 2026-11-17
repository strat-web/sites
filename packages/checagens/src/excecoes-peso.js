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
  // WEB-48: a CI continua sem compressão até o WEB-88 (#35). No Pages há Brotli. Os pisos abaixo mantêm CLS
  // e bytes como bloqueios e não substituem o critério da Claude (cinco PageSpeed, mediana < 2,5 s).
  // Origem em 17/11, mesmo Lighthouse: home 93/2,86 s, v1 81/5,11 s, v3 86/4,20 s. Depois da migração,
  // CI: 96/2,7 s, 97/2,6 s, 96/2,7 s; todos CLS 0. Os pisos exigem resultado melhor que as variantes antigas.
  'https://claude.stratacademy.com.br/': {
    item: 'WEB-88', motivo: 'CI sem compressão (WEB-88); hero e fontes otimizados no WEB-48. Evidências em docs/auditoria/2026-11/web-48-validacao.md; critério de PageSpeed continua separado',
    piso: { performance: 90, lcpMs: 3000, cls: 0.1 },
  },
  'https://claude.stratacademy.com.br/v1/': {
    item: 'WEB-88', motivo: 'CI sem compressão (WEB-88); origem 81 e LCP 5,11 s em 17/11; após fontes/hero mobile, CI 97 e 2,6 s, CLS 0 (WEB-48)',
    piso: { performance: 90, lcpMs: 3000, cls: 0.1 },
  },
  'https://claude.stratacademy.com.br/v3/': {
    item: 'WEB-88', motivo: 'CI sem compressão (WEB-88); origem 86 e LCP 4,20 s em 17/11; após fontes/hero mobile, CI 96 e 2,7 s, CLS 0 (WEB-48)',
    piso: { performance: 90, lcpMs: 3000, cls: 0.1 },
  },
  'https://mentoria.stratacademy.com.br/v2/': {
    item: 'WEB-48', motivo: 'variante React herdada, noindex: origem 77 e LCP 4,36 s em 17/11; CI depois da migração 82 e 3,8 s. Piso de não regressão, sujeito à revisão do Helbert; reavaliar após compressão do WEB-88',
    piso: { performance: 80, lcpMs: 4300, cls: 0.1 },
  },
  // As confirmações navegam automaticamente para o WhatsApp. O Lighthouse termina na página externa;
  // não atribuir esse resultado à renderização da confirmação. Preservamos o fluxo antigo, com piso e evidência.
  'https://comunidade.stratacademy.com.br/': {
    item: 'WEB-48', motivo: 'confirmação herdada abre o WhatsApp após 1,8 s; Lighthouse segue a navegação externa. Origem local 76/4,38 s; CI oscila de 67/6,0 s a 79/4,2 s. Fluxo/CTA inicial conferidos separadamente (WEB-48)',
    piso: { performance: 65, lcpMs: 7000, cls: 0.1 },
  },
  'https://bootcamp.stratacademy.com.br/0808-v1/grupo/': {
    item: 'WEB-48', motivo: 'confirmação herdada abre o grupo automaticamente; Lighthouse mede o destino externo, como na comunidade. CI de 17/11: 68/5,6 s, CLS 0; CTA e URL do grupo preservados e conferidos separadamente (WEB-48)',
    piso: { performance: 65, lcpMs: 7000, cls: 0.1 },
  },

};
