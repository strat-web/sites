// Dados públicos de cada marca, usados no JSON-LD (<JsonLd marca>) e no Open Graph (<Seo>).
// A chave é a mesma do campo `marca` do catalogo/sites.json.
// Fonte de cada dado (regra 4 do CLAUDE.md: nada sem fonte):
// - nome, telefone e endereço: docs/seo-geo.md ("Nome, endereço e telefone iguais em todo lugar");
// - redes, e-mail e imagem: o HTML no ar em 2026-11-11 (stratai.com.br, agencia.stratai.com.br, stratacademy.com.br e
//   metricaas.com.br); o YouTube @stratacademy vem de um link da stratai.com.br.
// Rede nova entra aqui com a fonte no PR. Telefone dos contratos não entra (docs/seo-geo.md).

export const grupo = { '@type': 'Organization', name: 'Grupo Strat' };

const joinville = {
  '@type': 'PostalAddress',
  streetAddress: 'Rua Aubé, 777, Boa Vista',
  addressLocality: 'Joinville',
  addressRegion: 'SC',
  postalCode: '89205-000',
  addressCountry: 'BR',
};

export const marcas = {
  stratai: {
    tipo: 'ProfessionalService',
    nome: 'StratAI',
    url: 'https://stratai.com.br/',
    imagem: 'https://stratai.com.br/midia/og.png',
    telefone: '+55 47 99165-8478',
    endereco: joinville,
    sameAs: ['https://www.instagram.com/strat.ai/', 'https://www.linkedin.com/company/strataibr/'],
  },
  agencia: {
    tipo: 'ProfessionalService',
    nome: 'Agência Strat',
    url: 'https://agenciastrat.com.br/',
    // A imagem ainda mora no endereço antigo; muda para agenciastrat.com.br na migração (WEB-23).
    imagem: 'https://agencia.stratai.com.br/midia/og.png',
    telefone: '+55 48 3199-4338',
    email: 'comercial@stratai.com.br',
    endereco: joinville,
    sameAs: ['https://www.instagram.com/agencia.strat/'],
  },
  academy: {
    tipo: 'EducationalOrganization',
    nome: 'Strat Academy',
    url: 'https://stratacademy.com.br/',
    imagem: 'https://stratacademy.com.br/og-default.png',
    sameAs: ['https://www.youtube.com/@stratacademy'],
  },
  metricaas: {
    tipo: 'Organization',
    nome: 'Metricaas',
    url: 'https://metricaas.com.br/',
    imagem: 'https://metricaas.com.br/og.png',
    sameAs: [],
  },
};

export function marca(chave) {
  const m = marcas[chave];
  if (!m) throw new Error(`[kit] marca desconhecida: "${chave}". Use uma de: ${Object.keys(marcas).join(', ')}`);
  return m;
}
