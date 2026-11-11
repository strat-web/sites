// Checagem "catalogo": URL nova sem linha em catalogo/sites.json (regra 3 do CLAUDE.md) e linha fora do formato.
import { ehPaginaDeErro } from './contexto.js';
import { resultado } from './resultado.js';

const ENUMS = {
  marca: ['agencia', 'stratai', 'academy', 'metricaas'],
  tipo: ['site', 'lp', 'bio', 'blog', 'ferramenta'],
  perfil: ['venda', 'lead', 'conteudo'],
  consentimento: ['banner', 'off', 'soft', 'sem-tracking'],
};
const OBRIGATORIOS = ['id', 'url', 'marca', 'tipo', 'app', 'perfil', 'consentimento', 'indexar'];

/** Formato de cada linha: campos obrigatórios, valores permitidos, URL com barra, id e URL únicos. */
export function checarLinhas(catalogo) {
  const r = resultado();
  const ids = new Map();
  const urls = new Map();
  for (const [i, linha] of (catalogo.urls || []).entries()) {
    const onde = `catalogo/sites.json, linha ${linha.id ?? `#${i + 1}`}`;
    for (const campo of OBRIGATORIOS) {
      if (linha[campo] === undefined || linha[campo] === null || linha[campo] === '') r.erro(onde, `falta o campo "${campo}"`);
    }
    for (const [campo, valores] of Object.entries(ENUMS)) {
      if (linha[campo] != null && !valores.includes(linha[campo])) {
        r.erro(onde, `${campo} "${linha[campo]}" não é um de: ${valores.join(', ')}`);
      }
    }
    if (linha.indexar != null && typeof linha.indexar !== 'boolean') r.erro(onde, 'indexar tem de ser true ou false');
    if (linha.url) {
      let u;
      try {
        u = new URL(linha.url);
      } catch {
        r.erro(onde, `url "${linha.url}" não é uma URL`);
      }
      if (u) {
        const ultimo = u.pathname.split('/').pop();
        if (u.protocol !== 'https:') r.erro(onde, 'url tem de ser https');
        if (u.search || u.hash) r.erro(onde, 'url sem query nem âncora');
        if (!u.pathname.endsWith('/') && !ultimo.includes('.')) r.erro(onde, 'url tem de terminar com barra (docs/padroes.md)');
      }
      if (urls.has(linha.url)) r.erro(onde, `url repetida (também em ${urls.get(linha.url)})`);
      urls.set(linha.url, linha.id);
    }
    if (linha.id) {
      if (ids.has(linha.id)) r.erro(onde, 'id repetido');
      ids.set(linha.id, true);
    }
  }
  return r;
}

/** Toda página gerada tem linha no catálogo, com o app certo. */
export function checarCatalogo(ctx) {
  const r = checarLinhas(ctx.catalogo);
  const porUrl = new Map((ctx.catalogo.urls || []).map((l) => [l.url, l]));
  for (const app of ctx.apps) {
    if (!app.site) {
      r.erro(app.app, 'astro.config.mjs sem `site`: sem domínio não dá para ligar a página ao catálogo');
      continue;
    }
    for (const pagina of app.paginas) {
      if (ehPaginaDeErro(pagina)) continue;
      const linha = porUrl.get(pagina.url);
      if (!linha) {
        r.erro(pagina.url, `página sem linha no catalogo/sites.json (regra 3 do CLAUDE.md); arquivo ${app.app}/src/pages${pagina.caminho}`);
      } else if (linha.app !== app.app) {
        r.erro(pagina.url, `o catálogo diz app "${linha.app}", mas a página sai de "${app.app}"`);
      }
    }
  }
  return r;
}
