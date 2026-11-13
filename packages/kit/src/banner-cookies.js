// Banner de cookies do kit (o mesmo da Agência, laudo de 31/10/2026; docs/tracking.md). O pixel da Meta só liga
// depois do "Aceitar" (mtc.consentir() do m.js). O cadastro do lead e a CAPI do servidor não dependem dele. A escolha
// fica no navegador, na chave strat_cookies, a mesma das páginas antigas do domínio.
//
// Este arquivo vai inteiro, como texto, para dentro do <script is:inline> do <Tracking> (import com ?raw): escreva em
// ES5, sem import nem export. É uma expressão de função; o componente a chama com (window, document, { privacidade,
// mjs }), onde mjs é o src do <script> do m.js. O teste (test/banner-cookies.test.js) roda este mesmo texto num DOM
// simulado.
//
// Aceite sem prazo (WEB-80): o m.js troca o window.mtc inteiro quando roda e não tem fila nem evento próprio. Se ele
// ainda não rodou, o aceite espera o "load" do próprio <script> do m.js (e, por garantia, o DOMContentLoaded e o load
// da página), sem timer e sem limite de tempo. Antes do aceite, nada chama o consentir.
(function (w, d, o) {
  var CHAVE = 'strat_cookies', escolha = null, liberado = false, esperando = false;
  try { escolha = w.localStorage.getItem(CHAVE); } catch (e) {}

  // Chama o consentir uma vez só, quando o m.js já está na página.
  function tenta() {
    if (liberado) return true;
    if (!w.mtc || typeof w.mtc.consentir !== 'function') return false;
    liberado = true;
    w.mtc.consentir();
    return true;
  }

  function liberar() {
    if (tenta() || esperando) return;
    esperando = true;
    var s = o.mjs && d.querySelector('script[src="' + o.mjs + '"]');
    if (s) s.addEventListener('load', tenta);
    if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', tenta);
    w.addEventListener('load', tenta);
  }

  if (escolha === 'sim') return liberar();
  if (escolha === 'nao') return;

  function mostrar() {
    var b = d.createElement('div');
    b.className = 'strat-cookies';
    b.setAttribute('role', 'dialog');
    b.setAttribute('aria-label', 'Cookies');
    b.innerHTML = '<p>Usamos cookies e o Pixel da Meta para medir os nossos anúncios. Você pode aceitar ou recusar. ' +
      '<a href="' + o.privacidade + '">Política de privacidade</a></p>' +
      '<div><button type="button" data-c="nao">Recusar</button> <button type="button" data-c="sim">Aceitar</button></div>';
    b.addEventListener('click', function (e) {
      var c = e.target.closest && e.target.closest('[data-c]');
      if (!c) return;
      try { w.localStorage.setItem(CHAVE, c.dataset.c); } catch (err) {}
      b.remove();
      if (c.dataset.c === 'sim') liberar();
    });
    d.body.appendChild(b);
  }
  if (d.body) mostrar(); else d.addEventListener('DOMContentLoaded', mostrar);
})
