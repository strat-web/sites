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

// O que a página carrega. Devolve { linha, scripts, hotmart, hotmartAposAceite, banner, consentMode, avisos }:
// - scripts: lista de { src, attrs } na ordem do <head>, todos `defer` (o m.js nunca atrasado: regra dura do lead);
// - hotmart: id da conta para o launcher (só no perfil venda), ou null;
// - hotmartAposAceite: true quando o launcher só pode carregar depois do "aceitar" do Rastro (venda com `banner`, o
//   produto em strict; WEB-85). O texto do launcher sai de scriptDoLauncher;
// - banner: true quando a página mostra o banner de cookies do kit (sem Rastro, pixel pelo m.js, consentimento
//   `banner`). Com Rastro é sempre false: quem pede o aceite é o aviso do próprio Rastro (strict);
// - consentMode: o que o produto no Rastro tem de ter (strict, soft ou off), ou null sem Rastro;
// - avisos: o que o build deve mostrar sem quebrar.
export function planoDeTracking({ catalogo, url, perfil }) {
  const linha = linhaDoCatalogo(catalogo, url);
  const onde = linha.url;
  if (!PERFIS.includes(perfil)) throw erro(onde, `perfil "${perfil}" não existe. Use um de: ${PERFIS.join(', ')}`);
  if (perfil !== linha.perfil) {
    throw erro(onde, `a página declara perfil "${perfil}", mas o catálogo diz "${linha.perfil}". Acerte um dos dois no mesmo PR`);
  }

  const plano = { linha, scripts: [], hotmart: null, hotmartAposAceite: false, banner: false, consentMode: null, avisos: [] };
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
    // Venda com banner (WEB-85): o launcher da Hotmart continua escrito no HTML (o "verificar instalação" da Hotmart
    // lê o HTML estático), mas só carrega com o aceite do Rastro: strat_consent = granted já guardado, ou o "aceitar"
    // do aviso do Rastro (scriptDoLauncher). Em soft e off o Rastro não segura nada, e o launcher carrega na abertura.
    if (perfil === 'venda' && linha.consentimento === 'banner') plano.hotmartAposAceite = true;
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
  // \r?\n: no Windows (core.autocrlf) o arquivo chega com CRLF, e o . não casa com \r.
  const codigo = fonte.replace(/^[ \t]*\/\/.*\r?\n/gm, '').trim();
  const opcoes = JSON.stringify({ privacidade, mjs: METRICAAS }).replace(/</g, '\\u003c');
  return `${codigo}(window, document, ${opcoes});`;
}

// Texto do <script id="hotmart_launcher_script"> do perfil venda: o snippet padrão da Hotmart com a conta do catálogo.
// Com `aposAceite` (venda + banner, WEB-85), o mesmo snippet fica dentro de uma função que só roda com o aceite do
// Rastro em strict, que guarda a escolha no localStorage, chave strat_consent:
// - aceite guardado (granted): carrega na hora, no parse do <head>, antes do Rastro (que então não duplica: ele pula o
//   launcher dele quando já existe window.hot);
// - sem aceite: embrulha o window.stratConsent.grant do Rastro (o "aceitar" do aviso chama window.stratConsent.grant()
//   no clique) para carregar o launcher antes de o Rastro rodar o loadMarketing. O Rastro é defer: o
//   window.stratConsent já existe no DOMContentLoaded; o load do <script> do Rastro é a garantia.
// Sem aceite, nada da Hotmart carrega. O teste (test/launcher-hotmart.test.js) roda este texto num DOM simulado.
export function scriptDoLauncher(conta, { aposAceite = false } = {}) {
  const snippet =
    `(function(l,a,u,n,c,h,e,r){l['HotmartLauncherObject']=c;l[c]=l[c]||function(){\n` +
    `(l[c].q=l[c].q||[]).push(arguments)},l[c].l=1*new Date();h=a.createElement(u),\n` +
    `e=a.getElementsByTagName(u)[0];h.async=1;h.src=n;e.parentNode.insertBefore(h,e)\n` +
    `})(window,document,'script','${HOTMART_LAUNCHER}','hot');\n` +
    `hot('account',${JSON.stringify(conta).replace(/"/g, "'").replace(/</g, '\\u003c')});`;
  if (!aposAceite) return `\n${snippet}\n`;
  return `
(function(w,d){
var feito=false;
function carregar(){if(feito||w.hot)return;feito=true;
${snippet}
}
var aceito=false;try{aceito=w.localStorage.getItem('strat_consent')==='granted'}catch(e){}
if(aceito)return carregar();
function ligar(){var c=w.stratConsent;if(!c||c.__hotmart||typeof c.grant!=='function')return;var g=c.grant;
c.grant=function(){carregar();return g.apply(this,arguments)};c.__hotmart=true}
d.addEventListener('DOMContentLoaded',ligar);
var s=d.querySelector('script[src^="${RASTRO}"]');if(s)s.addEventListener('load',ligar);
})(window,document);
`;
}
