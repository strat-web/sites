// Checagem "catalogo": URL nova sem linha em catalogo/sites.json (regra 3 do CLAUDE.md) e linha fora do formato.
import { ehArquivo } from '@strat/kit';
import { ehPaginaDeErro } from './contexto.js';
import { resultado } from './resultado.js';

const ENUMS = {
  marca: ['agencia', 'stratai', 'academy', 'metricaas'],
  tipo: ['site', 'lp', 'bio', 'blog', 'ferramenta'],
  perfil: ['venda', 'lead', 'conteudo'],
  consentimento: ['banner', 'off', 'soft', 'sem-tracking', 'por-funil'],
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
    // no_ar (WEB-77): o llms.txt de cada site só lista as outras marcas que já respondem. Obrigatório na linha tipo site.
    if (linha.tipo === 'site' && linha.no_ar === undefined) r.erro(onde, 'falta o campo "no_ar" (obrigatório em tipo site)');
    if (linha.no_ar !== undefined && typeof linha.no_ar !== 'boolean') r.erro(onde, 'no_ar tem de ser true ou false');
    if (linha.url) {
      let u;
      try {
        u = new URL(linha.url);
      } catch {
        r.erro(onde, `url "${linha.url}" não é uma URL`);
      }
      if (u) {
        if (u.protocol !== 'https:') r.erro(onde, 'url tem de ser https');
        if (u.search || u.hash) r.erro(onde, 'url sem query nem âncora');
        // Mesma regra do canonical do kit: só arquivo de verdade fica sem barra; slug com ponto (/gpt-4.1) precisa dela.
        if (!u.pathname.endsWith('/') && !ehArquivo(u.pathname)) r.erro(onde, 'url tem de terminar com barra (docs/padroes.md)');
      }
      if (urls.has(linha.url)) r.erro(onde, `url repetida (também em ${urls.get(linha.url)})`);
      urls.set(linha.url, linha.id);
    }
    if (linha.id) {
      if (ids.has(linha.id)) r.erro(onde, 'id repetido');
      ids.set(linha.id, true);
    }
  }
  checarMesmoProduto(catalogo, r);
  return r;
}

// O /sa do Rastro é um por produto: duas linhas com o mesmo rastro_slug recebem o mesmo pixel, GA4, tag do Google e
// consentMode, então os campos têm de bater entre elas. Pega offline o que a checagem tracking só pega com rede e com
// a página já usando o <Tracking> (WEB-83: a linha academy sem GA4 e Ads, a academy-kit-conteudo com, as duas `site`).
// Linha sem-tracking ou por-funil não carrega o Rastro pelo kit e fica de fora.
const DO_PRODUTO = ['meta_pixel', 'ga4', 'google_tag', 'consentimento'];

function checarMesmoProduto(catalogo, r) {
  const primeira = new Map();
  for (const linha of catalogo.urls || []) {
    if (!linha.rastro_slug || ['sem-tracking', 'por-funil'].includes(linha.consentimento)) continue;
    const outra = primeira.get(linha.rastro_slug);
    if (!outra) {
      primeira.set(linha.rastro_slug, linha);
      continue;
    }
    for (const campo of DO_PRODUTO) {
      const a = linha[campo] ?? null;
      const b = outra[campo] ?? null;
      if (a !== b) {
        r.erro(
          `catalogo/sites.json, linha ${linha.id}`,
          `${campo} "${a ?? ''}", mas a linha ${outra.id}, do mesmo produto "${linha.rastro_slug}" no Rastro, tem "${b ?? ''}": ` +
            'o /sa é um só por produto, então uma das duas está errada',
        );
      }
    }
  }
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
