/* Desenho das lâminas do funil (DEV-94). O TEXTO mora em funil.js (LAMINAS, AGENDA, PRODUTO_LOW) e os
 * cases em cases.js; aqui só vira HTML. Cada versão põe o botão de seguir do seu jeito.
 *   LAMINAS_UI.beneficios({ compacto })     lâmina 1: o que a gente banca
 *   LAMINAS_UI.cases({ raiz, compacto })    lâmina 2: cases (cartões abrem em outra aba)
 *   LAMINAS_UI.compraRapida()               V4: cartão do produto low ticket
 *   LAMINAS_UI.agenda({ protocolo })        V4: call com o Helbert
 */
(function () {
  'use strict';
  var F = window.FUNIL;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function falta(s) { return /\[[^\]]+\]/.test(String(s || '')); }
  function txt(s) { return esc(s).replace(/(\[[^\]]+\])/g, '<span class="falta">$1</span>'); }
  var CHECK = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  var SETA = '<svg class="seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

  function beneficios(o) {
    var L = F.LAMINAS.beneficios;
    return '<div class="lam' + (o && o.compacto ? ' compacto' : '') + '">' +
      '<span class="mono">' + esc(L.rotulo) + '</span>' +
      '<h2>' + esc(L.titulo) + '</h2>' +
      '<p class="lam-destaque">' + esc(L.destaque) + '</p>' +
      '<ul class="lam-itens">' + L.itens.map(function (i) {
        return '<li><span class="lam-ok">' + CHECK + '</span><div><b>' + esc(i.titulo) +
          (i.valor ? ' <span class="lam-preco">' + (i.de ? '<s>' + esc(i.de) + '</s> ' : '') + '<span class="lima">' + esc(i.valor) + '</span></span>' : '') +
          '</b><p>' + esc(i.texto) + '</p></div></li>';
      }).join('') + '</ul>' +
      '<p class="lam-rodape">' + esc(L.rodape) + '</p>' +
    '</div>';
  }

  // Lâmina 2: carrossel de cards em pé (9:16) em loop, que passa sozinho na tela. As métricas do cliente são o
  // destaque. NADA é clicável aqui (pedido do Jhonathan, 12/11): o lead vê os números e segue até o formulário,
  // sem sair da página. Para o loop não ter emenda, a lista vai duas vezes (a cópia fica escondida do leitor de
  // tela). Passar o mouse NÃO pausa (pedido do Jhonathan); o foco do teclado e o toque pausam (WCAG 2.2.2, nível A,
  // revisão do Helbert no PR #24, 13/11/2026). Ver "pausa do carrossel" no fim do arquivo.
  function slide(c, raiz, dup) {
    var outros = (c.numeros || []).slice(1, 3);
    return '<div class="case-slide"' + (dup ? ' aria-hidden="true"' : '') + '>' +
      '<div class="case-slide-capa">' +
        '<img class="case-slide-foto" src="' + raiz + 'cases/midia/' + esc(c.foto) + '" alt="" loading="lazy" decoding="async">' +
        '<div class="case-slide-topo">' +
          '<span class="case-logo"' + (c.logoFundo ? ' style="background:' + esc(c.logoFundo) + '"' : '') + '><img src="' + raiz + 'cases/midia/' + esc(c.logo) + '" alt=""></span>' +
          '<span><b>' + esc(c.cliente) + '</b><small>' + txt(c.segmento) + ' · ' + txt(c.cidade) + '</small></span>' +
        '</div>' +
      '</div>' +
      '<div class="case-slide-metricas">' +
        '<span class="mono case-slide-rot"><span class="ponto"></span>&nbsp; Resultado</span>' +
        '<div class="m-principal"><b>' + esc(c.principal.valor) + '</b><span>' + esc(c.principal.rotulo) + '</span></div>' +
        outros.map(function (n) { return '<div class="m-outro"><b>' + esc(n.valor) + '</b><span>' + esc(n.rotulo) + '</span></div>'; }).join('') +
      '</div>' +
    '</div>';
  }
  function cases(o) {
    var L = F.LAMINAS.cases, raiz = (o && o.raiz) || '../', lista = window.CASES.LISTA;
    var um = lista.map(function (c) { return slide(c, raiz, false); }).join('');
    var dois = lista.map(function (c) { return slide(c, raiz, true); }).join('');
    return '<div class="lam' + (o && o.compacto ? ' compacto' : '') + '">' +
      '<span class="mono">' + esc(L.rotulo) + '</span>' +
      '<h2>' + esc(L.titulo) + '</h2>' +
      '<p class="lam-texto">' + esc(L.texto) + '</p>' +
      '<div class="carrossel' + (o && o.largo ? ' largo' : '') + '" role="region" tabindex="0" aria-label="Cases da StratAI. Para pausar, toque ou deixe o foco aqui.">' +
        '<div class="carrossel-trilho" style="--itens:' + lista.length + '">' + um + dois + '</div>' +
      '</div>' +
      '<p class="letra-miuda">' + esc(L.nota) + '</p>' +
    '</div>';
  }

  function compraRapida() {
    var P = F.PRODUTO_LOW;
    if (!P.ativo) return '';
    var pronto = !!P.checkoutUrl;
    return '<section class="compra" aria-label="' + esc(P.selo) + '">' +
      '<div class="compra-capa">' + (P.imagem ? '<img src="' + esc(P.imagem) + '" alt="' + esc(P.nome) + '">' : '<span class="mono">Capa do produto</span>') + '</div>' +
      '<div class="compra-corpo">' +
        '<span class="mono"><span class="ponto"></span>&nbsp; ' + esc(P.selo) + '</span>' +
        '<h3>' + txt(P.nome) + '</h3>' +
        '<p class="compra-desc">' + txt(P.descricao) + '</p>' +
        '<ul class="compra-itens">' + P.itens.map(function (i) { return '<li><span class="lam-ok">' + CHECK + '</span>' + txt(i) + '</li>'; }).join('') + '</ul>' +
        '<div class="compra-preco">' + (P.precoDe ? '<s>' + esc(P.precoDe) + '</s>' : '') + '<b>' + txt(P.preco) + '</b><small>' + txt(P.parcelas) + '</small></div>' +
        (pronto
          ? '<a class="btn btn-lima" href="' + esc(P.checkoutUrl) + '" target="_blank" rel="noopener" data-cta="compra">' + esc(P.botao) + SETA + '</a>'
          : '<button class="btn btn-lima" type="button" disabled title="Falta o link do checkout">' + esc(P.botao) + SETA + '</button>') +
        '<p class="compra-selos"><span>' + esc(P.pagamento) + '</span><span>' + txt(P.garantia) + '</span><span>Compra segura</span></p>' +
      '</div>' +
    '</section>';
  }

  function agenda(o) {
    var A = F.AGENDA, pronto = !!A.url;
    return '<section class="agenda" aria-label="Agendar uma call">' +
      '<div class="agenda-quem">' +
        '<span class="agenda-foto">' + (A.foto ? '<img src="' + esc(A.foto) + '" alt="">' : esc(A.iniciais)) + '</span>' +
        '<span><b>' + esc(A.nome) + '</b><small>' + esc(A.cargo) + '</small></span>' +
        '<span class="agenda-on mono"><span class="ponto"></span>&nbsp; Agenda aberta</span>' +
      '</div>' +
      '<h3>' + esc(A.titulo) + '</h3>' +
      '<p class="agenda-texto">' + esc(A.texto) + '</p>' +
      '<div class="agenda-meta">' +
        '<span><b>' + esc(A.duracao) + '</b><small>duração</small></span>' +
        '<span><b>' + esc(A.formato) + '</b><small>pelo navegador</small></span>' +
        '<span><b>R$ 0</b><small>sem custo</small></span>' +
      '</div>' +
      '<div class="agenda-pauta"><span class="mono">O que a gente olha na call</span><ol>' + A.pauta.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ol></div>' +
      (A.pedeCodigo && o && o.protocolo ? '<p class="agenda-codigo">No campo <b>Código</b> da agenda, cole: <code>' + esc(o.protocolo) + '</code> <button type="button" class="copiar" data-copiar="' + esc(o.protocolo) + '">Copiar</button></p>' : '') +
      (pronto
        ? '<a class="btn btn-lima" href="' + esc(A.url) + '" target="_blank" rel="noopener" data-cta="agenda">' + esc(A.botao) + SETA + '</a>'
        : '<button class="btn btn-lima" type="button" disabled>' + esc(A.botao) + SETA + '</button>') +
      '<p class="letra-miuda">Abre a agenda do ' + esc(A.nome.split(' ')[0]) + ' em outra aba: você escolhe o dia e a hora e recebe o convite no e-mail.</p>' +
    '</section>';
  }

  // Órbita (pedido do Jhonathan, 12/11): enquanto o trilho anda, cada card se posiciona numa curva. O do centro
  // fica no alto e reto; os das pontas descem, giram para fora, diminuem e apagam um pouco. Não pausa com o mouse.
  var reduzido = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function orbitar() {
    var cs = document.querySelectorAll('.carrossel');
    for (var i = 0; i < cs.length; i++) {
      var box = cs[i].getBoundingClientRect(), meio = box.left + box.width / 2, raio = Math.max(box.width / 2, 520); // tela estreita: curva mais suave
      var queda = parseFloat(getComputedStyle(cs[i]).getPropertyValue('--orbita-queda')) || 96;
      var slides = cs[i].querySelectorAll('.case-slide');
      for (var k = 0; k < slides.length; k++) {
        var r = slides[k].getBoundingClientRect();
        var d = Math.max(-1.6, Math.min(1.6, (r.left + r.width / 2 - meio) / raio)); // -1 borda esquerda · 0 centro · 1 borda direita
        var y = queda * d * d * 0.75, giro = d * 9, escala = 1 - 0.09 * Math.min(1, d * d), luz = 1 - 0.38 * Math.min(1, Math.abs(d));
        slides[k].style.transform = 'translateY(' + y.toFixed(1) + 'px) rotate(' + giro.toFixed(2) + 'deg) scale(' + escala.toFixed(3) + ')';
        slides[k].style.opacity = luz.toFixed(3);
      }
    }
    requestAnimationFrame(orbitar);
  }
  if (!reduzido) requestAnimationFrame(orbitar);

  // cliques de compra e agenda viram evento (sem dado pessoal) e o botão "Copiar" funciona em qualquer página
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('[data-cta]');
    if (a) F.track('cta_click', { tipo: a.getAttribute('data-cta') });
    var c = e.target.closest && e.target.closest('[data-copiar]');
    if (c) { try { navigator.clipboard.writeText(c.getAttribute('data-copiar')); c.textContent = 'Copiado'; } catch (err) {} }
  });

  // pausa do carrossel (WCAG 2.2.2): para enquanto tem o foco do teclado; um toque pausa e outro toque solta.
  // O último pointerdown diz quem foi: rolar a página não dispara click, e clicar ou passar o mouse não pausa.
  // O foco só pausa quando veio do teclado (uma tecla zera o tipo do ponteiro).
  function carrosselDe(el) { return el && el.closest ? el.closest('.carrossel') : null; }
  var ultimoPonteiro = '';
  document.addEventListener('pointerdown', function (e) { ultimoPonteiro = e.pointerType || 'mouse'; }, true);
  document.addEventListener('keydown', function () { ultimoPonteiro = ''; }, true);
  document.addEventListener('click', function (e) {
    var c = carrosselDe(e.target);
    if (c && ultimoPonteiro === 'touch') c.classList.toggle('pausado');
  });
  document.addEventListener('focusin', function (e) { var c = carrosselDe(e.target); if (c && ultimoPonteiro === '') c.classList.add('pausado'); });
  document.addEventListener('focusout', function (e) {
    var c = carrosselDe(e.target);
    if (c && !c.contains(e.relatedTarget)) c.classList.remove('pausado');
  });

  window.LAMINAS_UI = { beneficios: beneficios, cases: cases, compraRapida: compraRapida, agenda: agenda, falta: falta };
})();
