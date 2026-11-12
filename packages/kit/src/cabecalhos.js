// _headers de cada app, gerado no build pela integração arquivosDoSite (WEB-21). Um texto só para os quatro apps,
// para os cabeçalhos não divergirem entre os sites. Formato do Cloudflare Pages: regra (caminho ou URL) e, embaixo,
// os cabeçalhos com dois espaços. Quando uma requisição casa com várias regras, o Pages aplica todas.

// Segurança em todas as páginas (docs/seo-geo.md; o auditor de confiança cobra estes cinco).
// - HSTS sem includeSubDomains e sem preload: os domínios têm subdomínios fora deste repositório (n8n, git, hub,
//   tracking...) e o HSTS os prenderia a HTTPS sem a gente controlar.
// - Só frame-ancestors, sem uma CSP inteira: uma CSP de scripts quebraria o Rastro, o MetricaaS e a Hotmart.
//   'self' deixa a própria página se emoldurar e impede que outro site a ponha num iframe.
// - Permissions-Policy desliga câmera, microfone, localização e USB e não fala de pagamento (decisão do Helbert,
//   12/11, PR #11): o upsell e o downsell do bootcamp montam o Checkout Elements da Hotmart num iframe de
//   pay.hotmart.com com allow="payment *", e qualquer payment no cabeçalho arrisca parar o Google Pay e o Apple Pay
//   dentro dele.

export const SEGURANCA = {
  'Strict-Transport-Security': 'max-age=31536000',
  'X-Content-Type-Options': 'nosniff',
  'Content-Security-Policy': "frame-ancestors 'self'",
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), usb=()',
};

// O endereço *.pages.dev não pode concorrer com o domínio no Google. `:project` cobre o endereço de produção do
// projeto (ex.: stratai-ti7.pages.dev); `:version.:project` cobre as prévias de branch e de deploy.
export const PAGES_DEV = ['https://:project.pages.dev/*', 'https://:version.:project.pages.dev/*'];

const bloco = (regra, cabecalhos) => [regra, ...Object.entries(cabecalhos).map(([k, v]) => `  ${k}: ${v}`)].join('\n');

export function montarHeaders() {
  return (
    [
      '# Gerado no build pelo @strat/kit (WEB-21). Não editar à mão: mude packages/kit/src/cabecalhos.js.',
      bloco('/*', SEGURANCA),
      ...PAGES_DEV.map((regra) => bloco(regra, { 'X-Robots-Tag': 'noindex' })),
    ].join('\n\n') + '\n'
  );
}
