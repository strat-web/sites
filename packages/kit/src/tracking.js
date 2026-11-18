// Regras do componente <Tracking> (docs/tracking.md, decisão D7). Função pura: recebe o catálogo e a URL da página
// e devolve o que o <head> carrega. O componente .astro só desenha o resultado, para a regra ficar testável sem
// navegador (`pnpm --filter @strat/kit test`).
//
// Os ids nunca vêm da página: saem da linha do catalogo/sites.json com a mesma URL. O perfil que a página declara tem
// de bater com o do catálogo. O consentimento segue o campo `consentimento` da linha (regra do WEB-72: o catálogo
// decide página a página; o padrão por perfil muda os valores do catálogo, não esta função).
import { urlCanonica } from './schema.js';

export const PERFIS = ['venda', 'lead', 'conteudo'];
export const RASTRO = 'https://tracking.stratacademy.com.br/sa';
export const METRICAAS = 'https://t.metricaas.com.br/m.js';
export const HOTMART_LAUNCHER = '//launcher.hotmart.com/launcher.js';
// Umami pelo proxy do próprio domínio (plano do Strat Tracking): sem cookie, antes do aceite, nos três perfis.
// O script padrão do Umami manda os eventos para a mesma pasta de onde veio, então basta o src.
export const UMAMI = '/u/script.js';
// id do <script> inline do Rastro por funil: é por ele que a checagem tracking da CI acha o script do kit.
export const ID_POR_FUNIL = 'strat-rastro-por-funil';

// Com Rastro, o consentimento do catálogo tem de ser o consentMode do produto no Rastro (regra do WEB-72, WEB-81):
// banner = strict (o Rastro mostra o aviso dele e só liga pixel, GA4, Google Ads e PostHog depois do "aceitar"),
// soft = soft e off = off. Outro valor com Rastro quebra o build; a checagem tracking da CI compara com o /sa.
export const CONSENT_MODE_DO_RASTRO = Object.freeze({ banner: 'strict', soft: 'soft', off: 'off' });

/** consentMode que o produto no Rastro tem de ter para o `consentimento` do catálogo, ou null se não há par. */
export function consentModeEsperado(consentimento) {
  return Object.hasOwn(CONSENT_MODE_DO_RASTRO, consentimento) ? CONSENT_MODE_DO_RASTRO[consentimento] : null;
}

const erro = (url, msg) => new Error(`[kit] Tracking em ${url}: ${msg}`);

// Linha do catálogo para a URL da página (canônica: domínio do `site`, sem query, com barra).
export function linhaDoCatalogo(catalogo, url) {
  const alvo = urlCanonica(url, url);
  const linha = catalogo.urls.find((u) => u.url === alvo);
  if (!linha) throw erro(alvo, 'a URL não tem linha no catalogo/sites.json (regra 3 do CLAUDE.md)');
  return linha;
}

// O que a página carrega. Devolve { linha, scripts, hotmart, banner, consentMode, avisos }:
// - scripts: lista de { src, attrs } na ordem do <head>, todos `defer` (o m.js nunca atrasado: regra dura do lead);
// - hotmart: id da conta para o launcher (só no perfil venda), ou null;
// - banner: true quando a página mostra o banner de cookies do kit (sem Rastro, pixel pelo m.js, consentimento
//   `banner`). Com Rastro é sempre false: quem pede o aceite é o aviso do próprio Rastro (strict);
// - consentMode: o que o produto no Rastro tem de ter (strict, soft ou off), ou null sem Rastro;
// - porFunil: { chave do ?f=: slug do produto } nas linhas `por-funil`, ou null (o componente escreve o script
//   rastro-por-funil.js com ele);
// - avisos: o que o build deve mostrar sem quebrar.
export function planoDeTracking({ catalogo, url, perfil }) {
  const linha = linhaDoCatalogo(catalogo, url);
  const onde = linha.url;
  if (!PERFIS.includes(perfil)) throw erro(onde, `perfil "${perfil}" não existe. Use um de: ${PERFIS.join(', ')}`);
  if (perfil !== linha.perfil) {
    throw erro(onde, `a página declara perfil "${perfil}", mas o catálogo diz "${linha.perfil}". Acerte um dos dois no mesmo PR`);
  }

  const plano = { linha, scripts: [], hotmart: null, banner: false, consentMode: null, porFunil: null, avisos: [] };
  if (linha.consentimento === 'sem-tracking') return plano;
  // por-funil (T5, WEB-106): a página é de vários funis e o Rastro pertence ao funil do ?f=. O registro `funis` da
  // linha diz o produto de cada chave; o script rastro-por-funil.js liga o /sa dele no navegador. Sem ?f= ou com
  // chave fora do registro, nada. O Umami pertence ao host e entra sempre (o servidor do strat-lps já injetava).
  if (linha.consentimento === 'por-funil') {
    plano.porFunil = Object.fromEntries(Object.entries(funisDaLinha(linha)).map(([chave, f]) => [chave, f.rastro_slug]));
    if (linha.umami_website_id) plano.scripts.push({ src: UMAMI, attrs: { 'data-website-id': linha.umami_website_id } });
    return plano;
  }
  if (linha.funis != null) throw erro(onde, `"funis" só vale com consentimento "por-funil" (a linha diz "${linha.consentimento}")`);

  const rastro = linha.rastro_slug;
  const ws = linha.metricaas_ws;

  if (perfil === 'venda') {
    if (!rastro) throw erro(onde, 'perfil venda precisa de rastro_slug no catálogo (o Rastro reescreve o checkout)');
    if (!linha.hotmart_conta) throw erro(onde, 'perfil venda precisa de hotmart_conta no catálogo (launcher da Hotmart)');
    plano.hotmart = linha.hotmart_conta;
  }
  if (perfil === 'lead' && !rastro && !ws) {
    throw erro(onde, 'perfil lead precisa de metricaas_ws ou rastro_slug no catálogo');
  }
  // Com Rastro, quem liga o pixel é o produto no Rastro, e a página não tem como segurá-lo. O catálogo diz qual
  // consentMode o produto tem de ter (banner = strict, soft = soft, off = off); o build não lê a rede, então a
  // checagem tracking da CI confere o /sa do produto (packages/checagens). Com banner, o banner de cookies do kit
  // NÃO entra: o Rastro em strict já mostra o aviso dele (chave strat_consent) e segura pixel, GA4 e Google Ads até o
  // "aceitar"; dois avisos na mesma página pediriam o aceite duas vezes, com duas chaves diferentes.
  if (rastro) {
    plano.consentMode = consentModeEsperado(linha.consentimento);
    if (!plano.consentMode) {
      throw erro(
        onde,
        `consentimento "${linha.consentimento}" com Rastro não tem consentMode equivalente. ` +
          `Use ${Object.entries(CONSENT_MODE_DO_RASTRO).map(([c, m]) => `"${c}" (${m})`).join(', ')}`,
      );
    }
    // Venda com banner ainda não fecha: o launcher da Hotmart sai escrito no HTML (Tracking.astro) e carrega na
    // abertura, antes do "aceitar". O Rastro em strict só carrega a Hotmart depois do aceite e pula o launcher dele
    // quando já existe window.hot, então nada segura o nosso. Até o WEB-85 levar o launcher para depois do aceite,
    // a combinação quebra o build (a checagem tracking da CI barra o mesmo, porque chama esta função).
    if (perfil === 'venda' && linha.consentimento === 'banner') {
      throw erro(
        onde,
        'perfil venda com consentimento "banner" e Rastro: o launcher da Hotmart sai no HTML e carrega antes do ' +
          '"aceitar" (o Rastro em strict não segura o launcher da página). Ainda sem regra (WEB-85): use "soft" ou ' +
          '"off" no catálogo, igual ao consentMode do produto',
      );
    }
  }

  // Sem Rastro, quem liga o pixel é o m.js (data-pixel). GA4 e tag do Google sem Rastro ainda não têm regra
  // (WEB-73): melhor quebrar o build do que colar gtag à mão.
  if (!rastro) {
    if (linha.meta_pixel && !ws) throw erro(onde, 'meta_pixel sem Rastro e sem MetricaaS: ninguém carregaria o pixel');
    if (linha.ga4 || linha.google_tag) {
      throw erro(onde, 'GA4 ou tag do Google sem Rastro ainda não tem regra no kit (WEB-73). Use o Rastro ou tire o id');
    }
  }

  // m.js primeiro: ele põe o código no texto do WhatsApp e não pode chegar depois de ninguém (regra dura do lead).
  if (ws) {
    const attrs = { 'data-ws': ws };
    // Com Rastro, o pixel vem do produto no Rastro: data-pixel aqui daria evento em dobro.
    if (!rastro && linha.meta_pixel) {
      attrs['data-pixel'] = linha.meta_pixel;
      if (linha.consentimento === 'banner') {
        attrs['data-pixel-consent'] = 'aguardar';
        plano.banner = true;
      }
    }
    plano.scripts.push({ src: METRICAAS, attrs });
  }

  if (rastro) {
    plano.scripts.push({ src: `${RASTRO}?product=${encodeURIComponent(rastro)}`, attrs: {} });
  }

  if (linha.umami_website_id) {
    plano.scripts.push({ src: UMAMI, attrs: { 'data-website-id': linha.umami_website_id } });
  }

  return plano;
}

// Chave do ?f=: minúsculas, números e hífen (o script do navegador põe o ?f= em minúsculas antes de procurar).
const CHAVE_DE_FUNIL = /^[a-z0-9][a-z0-9-]*$/;

/**
 * Registro `funis` de uma linha `por-funil`, conferido: { chave: { rastro_slug, consentimento, meta_pixel, ga4,
 * google_tag } }. Cada funil é como uma linha com Rastro: o consentimento tem par no Rastro (banner = strict, soft,
 * off) e os ids são os que o produto injeta (a checagem tracking da CI compara com o /sa). A linha em si não tem
 * rastro_slug: o produto é sempre o do funil.
 */
export function funisDaLinha(linha) {
  const onde = linha.url;
  if (linha.rastro_slug) {
    throw erro(onde, 'por-funil não leva rastro_slug na linha: o produto do Rastro vem do funil do ?f= (campo "funis")');
  }
  const funis = linha.funis;
  if (!funis || typeof funis !== 'object' || Array.isArray(funis) || !Object.keys(funis).length) {
    throw erro(onde, 'por-funil precisa do registro "funis" no catálogo ({ "<chave do ?f=>": { "rastro_slug", "consentimento", ... } })');
  }
  for (const [chave, f] of Object.entries(funis)) {
    if (!CHAVE_DE_FUNIL.test(chave)) throw erro(onde, `funil "${chave}": a chave do ?f= usa só minúsculas, números e hífen`);
    if (!f || typeof f.rastro_slug !== 'string' || !f.rastro_slug) throw erro(onde, `funil "${chave}" sem rastro_slug`);
    if (!consentModeEsperado(f.consentimento)) {
      throw erro(
        onde,
        `funil "${chave}": consentimento "${f.consentimento}" não tem consentMode no Rastro. ` +
          `Use ${Object.entries(CONSENT_MODE_DO_RASTRO).map(([c, m]) => `"${c}" (${m})`).join(', ')}`,
      );
    }
  }
  return funis;
}

// Texto do <script> inline do Rastro por funil (packages/kit/src/rastro-por-funil.js, lido como texto): a expressão de
// função chamada com window, document e { rastro, funis }, como no banner. `<` nos dados vira <.
export function scriptDoPorFunil(fonte, funis) {
  const codigo = fonte.replace(/^[ \t]*\/\/.*\r?\n/gm, '').trim();
  const opcoes = JSON.stringify({ rastro: RASTRO, funis }).replace(/</g, '\\u003c');
  return `${codigo}(window, document, ${opcoes});`;
}

// Texto do <script> inline do banner de cookies (packages/kit/src/banner-cookies.js, lido como texto): a expressão de
// função chamada com window, document e { privacidade, mjs }. Comentário de linha inteira não vai para o HTML; `<`
// nos dados vira \u003c para não fechar o <script>. O aceite espera o <script> do m.js (src METRICAAS), sem prazo (WEB-80).
export function scriptDoBanner(fonte, privacidade) {
  // \r?\n: no Windows (core.autocrlf) o arquivo chega com CRLF, e o . não casa com \r.
  const codigo = fonte.replace(/^[ \t]*\/\/.*\r?\n/gm, '').trim();
  const opcoes = JSON.stringify({ privacidade, mjs: METRICAAS }).replace(/</g, '\\u003c');
  return `${codigo}(window, document, ${opcoes});`;
}
