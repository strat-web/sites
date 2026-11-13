// @strat/conteudo (WEB-19): schema do blog e checar-posts, iguais nos quatro apps.
// Este ponto de entrada é o que o content.config.mjs do app importa: só o schema, nada de node:fs.
// O checar-posts está em '@strat/conteudo/checar-posts' e no bin `checar-posts`.
export { blogSchema, naListagem, indexavel, LIMITES } from './schema.js';
