// O Rastro pode iniciar pixel/GA/PostHog antes do primeiro quadro e prender a composição do hero (WEB-104).
// Só as páginas de venda usam este carregador. MetricaaS e o launcher continuam com sua ordem atual.
export const ATR_RASTRO_APOS_PINTURA = 'data-strat-rastro-apos-pintura';

const CARREGADOR = String.raw`(function carregarRastroAposPintura(w, d) {
  var origem = d.currentScript;
  var src = origem.getAttribute('data-strat-rastro-apos-pintura');
  var carregado = false;
  function carregar() {
    if (carregado) return;
    carregado = true;
    var script = d.createElement('script');
    script.src = src;
    script.defer = true;
    script.async = false;
    d.head.appendChild(script);
  }
  function agendar() {
    // Uma aba aberta em segundo plano não recebe rAF. Preservar a visita nesse caso; quando visível,
    // dois callbacks garantem uma oportunidade de pintar antes de iniciar a cadeia de terceiros.
    if (d.visibilityState === 'hidden' || typeof w.requestAnimationFrame !== 'function') carregar();
    else w.requestAnimationFrame(function () { w.requestAnimationFrame(carregar); });
  }
  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', agendar, { once: true });
  else agendar();
})(window, document);`;

// A checagem compara o carregador completo, para que um atributo com script vazio não dê falso verde.
export function scriptDoRastroAposPintura() {
  return CARREGADOR;
}
