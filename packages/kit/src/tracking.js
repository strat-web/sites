// Regras do componente <Tracking> (docs/tracking.md, decisão D7). Função pura: recebe o catálogo e a URL da página
// e devolve o que o <head> carrega. O componente .astro só desenha o resultado, para a regra ficar testável sem
// navegador (`pnpm --filter @strat/kit test`).
//
// Os ids nunca vêm da página: saem da linha do catalogo/sites.json com a mesma URL. O perfil que a página declara tem
// de bater com o do catálogo. O consentimento segue o campo `consentimento` da linha (o padrão por perfil é o WEB-72;
// quando ele sair, mudam os valores do catálogo, não esta função).
import { urlCanonica } from './schema.js';

export const PERFIS = ['venda', 'lead', 'conteudo'];
export const RASTRO = 'https://tracking.stratacademy.com.br/sa';
export const METRICAAS = 'https://t.metricaas.com.br/m.js';
export const HOTMART_LAUNCHER = '//launcher.hotmart.com/launcher.js';
// Umami pelo proxy do próprio domínio (plano do Strat Tracking): sem cookie, antes do aceite, nos três perfis.
// O script padrão do Umami manda os eventos para a mesma pasta de onde veio, então basta o src.
export const UMAMI = '/u/script.js';

const erro = (url, msg) => new Error(`[kit] Tracking em ${url}: ${msg}`);

// Linha do catálogo para a URL da página (canônica: domínio do `site`, sem query, com barra).
export function linhaDoCatalogo(catalogo, url) {
  const alvo = urlCanonica(url, url);
  const linha = catalogo.urls.find((u) => u.url === alvo);
  if (!linha) throw erro(alvo, 'a URL não tem linha no catalogo/sites.json (regra 3 do CLAUDE.md)');
  return linha;
}

// O que a página carrega. Devolve { linha, scripts, hotmart, banner, avisos }:
// - scripts: lista de { src, attrs } na ordem do <head>, todos `defer` (o m.js nunca atrasado: regra dura do lead);
// - hotmart: id da conta para o launcher (só no perfil venda), ou null;
// - banner: true quando a página mostra o banner de cookies do kit (pixel pelo m.js, consentimento `banner`);
// - avisos: o que o build deve mostrar sem quebrar.
export function planoDeTracking({ catalogo, url, perfil }) {
  const linha = linhaDoCatalogo(catalogo, url);
  const onde = linha.url;
  if (!PERFIS.includes(perfil)) throw erro(onde, `perfil "${perfil}" não existe. Use um de: ${PERFIS.join(', ')}`);
  if (perfil !== linha.perfil) {
    throw erro(onde, `a página declara perfil "${perfil}", mas o catálogo diz "${linha.perfil}". Acerte um dos dois no mesmo PR`);
  }

  const plano = { linha, scripts: [], hotmart: null, banner: false, avisos: [] };
  // por-funil: a própria página liga o Rastro do funil pelo ?f= (registro FUNIS); o kit não carrega nada por ela
  // até a migração dessas páginas (WEB-48).
  if (linha.consentimento === 'sem-tracking' || linha.consentimento === 'por-funil') return plano;

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
  // Com Rastro, quem liga o pixel é o produto no Rastro (consentMode off, soft ou strict), e a página não tem como
  // segurá-lo. Só avisar deixaria o pixel disparar antes do aceite (ex.: produto "site" em off no WEB-49): quebra o
  // build até o padrão por perfil sair (WEB-72). A CI compara o /sa do produto com o catálogo (packages/checagens).
  if (rastro && linha.consentimento === 'banner') {
    throw erro(
      onde,
      `consentimento "banner" com Rastro: a página não segura o pixel, quem segura é o produto "${rastro}" no Rastro. ` +
        'Até o WEB-72 definir o padrão, use "off" ou "soft" no catálogo, igual ao consentMode do produto',
    );
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

// Texto do <script> inline do banner de cookies (packages/kit/src/banner-cookies.js, lido como texto): a expressão de
// função chamada com window, document e { privacidade, mjs }. Comentário de linha inteira não vai para o HTML; `<`
// nos dados vira \u003c para não fechar o <script>. O aceite espera o <script> do m.js (src METRICAAS), sem prazo (WEB-80).
export function scriptDoBanner(fonte, privacidade) {
  const codigo = fonte.replace(/^[ \t]*\/\/.*\n/gm, '').trim();
  const opcoes = JSON.stringify({ privacidade, mjs: METRICAAS }).replace(/</g, '\\u003c');
  return `${codigo}(window, document, ${opcoes});`;
}
