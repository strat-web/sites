// Kit dos sites. Componentes: import Layout from '@strat/kit/Layout.astro' (Seo, JsonLd, Breadcrumb, Faq e Tracking idem).
// Aqui ficam os dados das marcas e as funções que montam o canonical e o JSON-LD.
export { grupo, marcas, marca } from './marcas.js';
export { urlCanonica, schemaMarca, schemaBreadcrumb, schemaFaq, jsonSeguro } from './schema.js';
export {
  PERFIS, planoDeTracking, linhaDoCatalogo, RASTRO, METRICAAS, UMAMI, HOTMART_LAUNCHER, CONSENT_MODE_DO_RASTRO, consentModeEsperado,
} from './tracking.js';
// Integração do Astro que grava sitemap.xml, robots.txt e llms.txt no fim do build (WEB-18).
export { arquivosDoSite } from './arquivos-do-site.js';
// Cabeçalhos de segurança e noindex do *.pages.dev, gravados em _headers pela mesma integração (WEB-21).
export { SEGURANCA, PAGES_DEV, montarHeaders } from './cabecalhos.js';
