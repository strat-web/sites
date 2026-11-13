// As checagens da CI dos sites (WEB-20). Cada uma recebe o contexto (montarContexto) e devolve { erros, avisos }.
export { montarContexto } from './contexto.js';
export { checarCatalogo, checarLinhas } from './catalogo.js';
export { checarSeo } from './seo.js';
export { checarTracking, slugConhecido } from './tracking.js';
export { checarLinks } from './links.js';
export { checarPeso, bytesDaPagina, julgarMedicao, ORCAMENTO } from './peso.js';
export { EXCECOES_LIGHTHOUSE } from './excecoes-peso.js';
export { ESQUELETOS } from './esqueletos.js';
