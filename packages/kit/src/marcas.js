// Dados públicos de cada marca, usados no JSON-LD (<JsonLd marca>) e no Open Graph (<Seo>).
// A chave é a mesma do campo `marca` do catalogo/sites.json.
// Fonte de cada dado (regra 4 do CLAUDE.md: nada sem fonte):
// - nome, telefone e endereço: docs/seo-geo.md ("Nome, endereço e telefone iguais em todo lugar");
// - redes, e-mail e imagem: o HTML no ar em 2026-11-11 (stratai.com.br, agencia.stratai.com.br, stratacademy.com.br e
//   metricaas.com.br); o YouTube @stratacademy vem de um link da stratai.com.br.
// - privacidade: a política no ar em 2026-11-11 (link do banner de cookies do <Tracking>).
// - logo (o `logo` do JSON-LD, WEB-77): arquivo baixado em 2026-11-12 do site no ar da marca para o public/ do app, no
//   mesmo caminho da URL abaixo (fonte de cada um no PR do WEB-77 e em docs/decisoes.md). A URL fica no domínio final:
//   o arquivo sai junto das páginas deste repositório. Nunca a imagem de compartilhamento (`imagem`, og.png).
// - resumo (vai no llms.txt, WEB-18): o llms.txt no ar em 2026-11-11 (stratai.com.br, agencia.stratai.com.br e
//   stratacademy.com.br); o do Metricaas, que não tem llms.txt, é a promessa da ficha 02-empresas/metricaas/overview.md
//   do contexto-strat.
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
    resumo:
      'Empresa do Grupo Strat, de Joinville/SC (Brasil). A StratAI mapeia onde a operação de uma empresa perde tempo e dinheiro e constrói os agentes de IA que assumem esse trabalho: no WhatsApp, no CRM e nas rotinas do time.',
    url: 'https://stratai.com.br/',
    imagem: 'https://stratai.com.br/midia/og.png',
    // O ícone do site (stratai.com.br/midia/favicon/favicon-192.png): o logotipo do topo é branco sem fundo e some no
    // fundo branco em que o Google mostra o logo.
    logo: 'https://stratai.com.br/midia/logo/stratai.png',
    telefone: '+55 47 99165-8478',
    endereco: joinville,
    sameAs: ['https://www.instagram.com/strat.ai/', 'https://www.linkedin.com/company/strataibr/'],
  },
  agencia: {
    tipo: 'ProfessionalService',
    nome: 'Agência Strat',
    resumo:
      'Agência de marketing em Joinville/SC (Brasil) que junta tráfego pago, social media, conteúdo e inteligência artificial em um time só, com tudo medido no número que importa para o cliente: cliente novo. Google Partner e membro do programa Meta Business Partner.',
    url: 'https://agenciastrat.com.br/',
    // A imagem ainda mora no endereço antigo; muda para agenciastrat.com.br na migração (WEB-23).
    imagem: 'https://agencia.stratai.com.br/midia/og.png',
    // O logotipo do topo de agencia.stratai.com.br (midia/logo/strat-ag.png), no mesmo caminho.
    logo: 'https://agenciastrat.com.br/midia/logo/strat-ag.png',
    telefone: '+55 48 3199-4338',
    email: 'comercial@stratai.com.br',
    // Muda para agenciastrat.com.br na migração (WEB-23), junto da imagem.
    privacidade: 'https://agencia.stratai.com.br/politica-de-privacidade',
    endereco: joinville,
    sameAs: ['https://www.instagram.com/agencia.strat/'],
  },
  academy: {
    tipo: 'EducationalOrganization',
    nome: 'Strat Academy',
    resumo:
      'Tutoriais e estratégias de automação, inteligência artificial e N8N para escalar operações sem aumentar o time.',
    url: 'https://stratacademy.com.br/',
    imagem: 'https://stratacademy.com.br/og-default.png',
    // stratacademy.com.br não tem arquivo de logo (o topo é texto): o logotipo vem da LP no ar
    // mentoria.stratacademy.com.br (images/strat-logo.webp).
    logo: 'https://stratacademy.com.br/midia/logo/strat-academy.webp',
    sameAs: ['https://www.youtube.com/@stratacademy'],
  },
  metricaas: {
    tipo: 'Organization',
    nome: 'Metricaas',
    resumo:
      'Descubra de onde vem cada cliente do seu WhatsApp: para quem anuncia e atende no WhatsApp, o Metricaas mostra qual anúncio gerou cada conversa, devolve a conversão real para o Meta e organiza os leads num CRM próprio.',
    url: 'https://metricaas.com.br/',
    imagem: 'https://metricaas.com.br/og.png',
    // O ícone do site (metricaas.com.br/images/icon.png): o logo.png do topo tem o nome em branco sem fundo.
    logo: 'https://metricaas.com.br/midia/logo/metricaas.png',
    sameAs: [],
  },
};

export function marca(chave) {
  const m = marcas[chave];
  if (!m) throw new Error(`[kit] marca desconhecida: "${chave}". Use uma de: ${Object.keys(marcas).join(', ')}`);
  return m;
}
