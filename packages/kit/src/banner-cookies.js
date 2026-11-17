// Banner de cookies do kit (o mesmo da Agência, laudo de 31/10/2026; docs/tracking.md), só em página sem Rastro, com o
// pixel pelo m.js do MetricaaS (data-pixel). A escolha fica no navegador, na chave strat_cookies, a mesma das páginas
// antigas do domínio, e vale nos dois modos. O cadastro do lead e a CAPI do servidor não dependem dele.
//
// Dois modos (o.modo, o `consentimento` da linha do catálogo):
// - "banner": o pixel só liga depois do "Aceitar" (o m.js vai com data-pixel-consent="aguardar" e o aceite chama o
//   mtc.consentir()). "Recusar" deixa o pixel desligado.
// - "soft" (WEB-84): o pixel mede desde a abertura (o m.js vai sem data-pixel-consent) e o aviso mostra "Recusar" e
//   "Ok". "Recusar" corta o pixel na hora (fbq consent revoke) e nas próximas visitas (recusa guardada).
//
// Este arquivo vai inteiro, como texto, para dentro do <script is:inline> do <Tracking> (import com ?raw): escreva em
// ES5, sem import nem export. É uma expressão de função; o componente a chama com (window, document, { privacidade,
// mjs, modo }), onde mjs é o src do <script> do m.js. O teste (test/banner-cookies.test.js) roda este mesmo texto num
// DOM simulado. O <script> inline vem logo depois do <script defer> do m.js, então roda antes dele.
//
// Aceite sem prazo (WEB-80): o m.js troca o window.mtc inteiro quando roda e não tem fila nem evento próprio. Se ele
// ainda não rodou, o aceite espera o "load" do próprio <script> do m.js (e, por garantia, o DOMContentLoaded e o load
// da página), sem timer e sem limite de tempo. Antes do aceite, nada chama o consentir.
//
// Recusa no soft: o m.js não tem função para revogar. O pixel mora no mf.js, que o m.js carrega quando há data-pixel:
// ele cria o fbq e, com data-pixel-consent="aguardar" (lido do <script> do m.js, guardado em mtc._i.cons), chama
// fbq('consent', 'revoke') antes do init e do PageView. Então a recusa segura o pixel nas três fases: o m.js ainda não
// rodou (o atributo no <script>), rodou mas o mf.js ainda não (mtc._i.cons) e o fbq já existe (revoke na hora).
// O próprio clique no "Recusar" não pode ir para a Meta: o pixel mede sozinho clique em botão (SubscribedButtonClick,
// evento automático, ouvido no document). Por isso o soft revoga num ouvinte de clique na fase de captura do window,
// que roda antes de qualquer ouvinte do document (visto na prévia do WEB-84 em 17/11/2026).
(function (w, d, o) {
  var CHAVE = 'strat_cookies', SOFT = o.modo === 'soft', escolha = null, liberado = false, esperando = false;
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

  // Soft: corta o pixel, em qualquer fase do m.js (ver o topo).
  function segurar() {
    var s = o.mjs && d.querySelector('script[src="' + o.mjs + '"]');
    if (s) s.setAttribute('data-pixel-consent', 'aguardar');
    if (w.mtc && w.mtc._i) w.mtc._i.cons = 'aguardar';
    if (typeof w.fbq === 'function') w.fbq('consent', 'revoke');
  }

  if (SOFT) {
    if (escolha === 'nao') return segurar();
    if (escolha === 'sim') return;
  } else {
    if (escolha === 'sim') return liberar();
    if (escolha === 'nao') return;
  }

  function mostrar() {
    var b = d.createElement('div');
    b.className = 'strat-cookies';
    b.setAttribute('role', 'dialog');
    b.setAttribute('aria-label', 'Cookies');
    b.innerHTML = (SOFT
      ? '<p>Usamos cookies e o Pixel da Meta para medir os nossos anúncios. Se preferir, recuse. '
      : '<p>Usamos cookies e o Pixel da Meta para medir os nossos anúncios. Você pode aceitar ou recusar. ') +
      '<a href="' + o.privacidade + '">Política de privacidade</a></p>' +
      '<div><button type="button" data-c="nao">Recusar</button> <button type="button" data-c="sim">' +
      (SOFT ? 'Ok' : 'Aceitar') + '</button></div>';
    function antes(e) {
      var c = e.target && e.target.closest && e.target.closest('[data-c="nao"]');
      if (c && b.contains(c)) segurar();
    }
    if (SOFT) w.addEventListener('click', antes, true);
    b.addEventListener('click', function (e) {
      var c = e.target.closest && e.target.closest('[data-c]');
      if (!c) return;
      try { w.localStorage.setItem(CHAVE, c.dataset.c); } catch (err) {}
      if (SOFT) w.removeEventListener('click', antes, true);
      b.remove();
      if (c.dataset.c === 'sim' && !SOFT) liberar();
      if (c.dataset.c === 'nao' && SOFT) segurar();
    });
    d.body.appendChild(b);
  }
  if (d.body) mostrar(); else d.addEventListener('DOMContentLoaded', mostrar);
})
