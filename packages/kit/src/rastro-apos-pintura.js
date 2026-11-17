// O Rastro pode iniciar pixel/GA/PostHog antes do primeiro quadro e prender a composição do hero (WEB-104).
// Só as páginas de venda usam este carregador. MetricaaS e o launcher continuam com sua ordem atual.
export const ATR_RASTRO_APOS_PINTURA = 'data-strat-rastro-apos-pintura';

const CARREGADOR = String.raw`(function carregarRastroAposPintura(w, d) {
  var origem = d.currentScript;
  var src = origem.getAttribute('data-strat-rastro-apos-pintura');
  var carregado = false;
  var observador;
  function carregar() {
    if (carregado) return;
    carregado = true;
    if (observador) observador.disconnect();
    var script = d.createElement('script');
    script.src = src;
    script.defer = true;
    script.async = false;
    d.head.appendChild(script);
  }
  function agendar() {
    // rAF sinaliza a chance de pintar, mas pode vir antes do FCP se as fontes ainda estiverem chegando.
    // Quando a API existe, esperar a pintura observada, em vez de supor que dois quadros já a produziram.
    if (d.visibilityState === 'hidden') { carregar(); return; }
    var paints = w.performance && w.performance.getEntriesByType ? w.performance.getEntriesByType('paint') : [];
    if (paints.some(function (p) { return p.name === 'first-contentful-paint'; })) { carregar(); return; }
    if (typeof w.PerformanceObserver === 'function' && w.PerformanceObserver.supportedEntryTypes && w.PerformanceObserver.supportedEntryTypes.indexOf('paint') !== -1) {
      try {
        observador = new w.PerformanceObserver(function (lista) {
        if (lista.getEntries().some(function (p) { return p.name === 'first-contentful-paint'; })) carregar();
      });
      observador.observe({ type: 'paint', buffered: true });
        d.addEventListener('visibilitychange', function () { if (d.visibilityState === 'hidden') carregar(); }, { once: true });
        return;
      } catch (e) {
        if (observador) observador.disconnect();
        observador = null;
      }
    }
    if (typeof w.requestAnimationFrame === 'function') {
      w.requestAnimationFrame(function () { w.requestAnimationFrame(carregar); });
    } else carregar();
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', agendar, { once: true });
  else agendar();
})(window, document);`;

// A checagem compara o carregador completo, para que um atributo com script vazio não dê falso verde.
export function scriptDoRastroAposPintura() {
  return CARREGADOR;
}
