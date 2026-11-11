// Kit dos sites. Componentes: import Layout from '@strat/kit/Layout.astro' (Seo, JsonLd, Breadcrumb, Faq e Tracking idem).
// Aqui ficam os dados das marcas e as funções que montam o canonical e o JSON-LD.
export { grupo, marcas, marca } from './marcas.js';
export { urlCanonica, schemaMarca, schemaBreadcrumb, schemaFaq, jsonSeguro } from './schema.js';
export { PERFIS, planoDeTracking, linhaDoCatalogo } from './tracking.js';
