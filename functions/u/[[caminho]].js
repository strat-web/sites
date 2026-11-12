// Proxy do Umami no próprio domínio de cada site (Strat Tracking, TRACK-9; docs/tracking.md).
// Pages Function: a pasta functions/ fica na raiz do repositório, que é o diretório raiz dos quatro projetos do
// Pages (docs/pages.md), então vale para todos os apps.
//
//   GET  /u/script.js   → script do Umami (cache de 1 h na borda) + os eventos que o painel conta
//   POST /u/api/send    → repassa ao coletor com o IP do visitante em payload.ip (para cidade e país)
//
// Mesmo contrato das LPs do strat-lps (server.js + umami.js lá): o kit só põe
// <script defer src="/u/script.js" data-website-id="…"> e o resto é daqui.

const COLETOR = 'https://analytics.strat.tec.br';
const LIMITE_CORPO = 64 * 1024;

// Eventos do painel (mesma regra do umami-eventos.js do strat-lps):
// cta ([data-strat-cta]), whatsapp (wa.me), checkout (pay.hotmart.com), form_inicio e cadastro (formulário de lead).
const EVENTOS = `
;(function () {
  if (window.__stratEventos) return;
  window.__stratEventos = 1;
  function envia(nome, dados) {
    try { if (window.umami && window.umami.track) window.umami.track(nome, dados); } catch (e) {}
  }
  var WHATSAPP = /^(https?:)?\\/\\/(wa\\.me|api\\.whatsapp\\.com|web\\.whatsapp\\.com)\\/|^whatsapp:/i;
  var CHECKOUT = /^(https?:)?\\/\\/pay\\.hotmart\\.com\\//i;
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var marcado = t.closest('[data-strat-cta]');
    var link = t.closest('a[href]');
    var id = marcado ? marcado.getAttribute('data-strat-cta') || undefined : undefined;
    var dados = id ? { id: id } : undefined;
    if (marcado) envia('cta', dados);
    var href = link ? link.getAttribute('href') || '' : '';
    if (WHATSAPP.test(href)) envia('whatsapp', dados);
    else if (CHECKOUT.test(href)) envia('checkout', dados);
  }, true);
  function ehLead(f) {
    return !!(f && f.tagName === 'FORM' &&
      (f.hasAttribute('data-strat-leadform') || f.querySelector('input[type=email],input[type=tel]')));
  }
  var iniciados = [];
  document.addEventListener('focusin', function (e) {
    var f = e.target && e.target.form;
    if (ehLead(f) && iniciados.indexOf(f) < 0) { iniciados.push(f); envia('form_inicio'); }
  }, true);
  document.addEventListener('submit', function (e) { if (ehLead(e.target)) envia('cadastro'); }, true);
})();
`;

async function script() {
  const r = await fetch(COLETOR + '/script.js', { cf: { cacheTtl: 3600, cacheEverything: true } });
  if (!r.ok) {
    return new Response('// Umami fora do ar', {
      status: 502,
      headers: { 'Content-Type': 'application/javascript; charset=utf-8', 'Cache-Control': 'no-store' },
    });
  }
  return new Response((await r.text()) + '\n' + EVENTOS, {
    headers: { 'Content-Type': 'application/javascript; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
}

async function enviar(request) {
  const texto = await request.text();
  if (texto.length > LIMITE_CORPO) return new Response(null, { status: 413 });
  let corpo;
  try {
    corpo = JSON.parse(texto);
  } catch {
    return new Response('{}', { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
  // Atrás da Cloudflare, o coletor veria o IP da borda (todo visitante viraria um só). O Umami aceita o IP no
  // próprio evento e usa esse no lugar do cabeçalho (testado em 12/11/2026).
  const ip = request.headers.get('cf-connecting-ip');
  if (ip && corpo && corpo.payload && !corpo.payload.ip) corpo.payload.ip = ip;
  const cabecalhos = {
    'Content-Type': 'application/json',
    'User-Agent': request.headers.get('user-agent') || '',
  };
  for (const k of ['accept-language', 'x-umami-cache']) {
    const v = request.headers.get(k);
    if (v) cabecalhos[k] = v;
  }
  try {
    const r = await fetch(COLETOR + '/api/send', { method: 'POST', headers: cabecalhos, body: JSON.stringify(corpo) });
    return new Response(await r.text(), {
      status: r.status,
      headers: { 'Content-Type': r.headers.get('content-type') || 'application/json', 'Cache-Control': 'no-store' },
    });
  } catch {
    return new Response('{}', { status: 502, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  }
}

export async function onRequest({ request, params }) {
  const caminho = (params.caminho || []).join('/');
  if (caminho === 'script.js' && (request.method === 'GET' || request.method === 'HEAD')) return script();
  if (caminho === 'api/send') {
    if (request.method !== 'POST') return new Response(null, { status: 405, headers: { Allow: 'POST' } });
    return enviar(request);
  }
  return new Response('Não encontrado', { status: 404 });
}
