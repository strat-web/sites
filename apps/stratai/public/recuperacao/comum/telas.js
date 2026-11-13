/* Motor de telas (V1 e V4). Uma pergunta por tela → 2 lâminas → formulário → fim.
 *   TELAS.iniciar({ versao: 'v1' })                    fim = "seu perfil entrou em análise"
 *   TELAS.iniciar({ versao: 'v4', fimComAgenda: true }) fim = análise + compra rápida + agenda com o Helbert
 * Texto e regras: funil.js. Desenho das lâminas: laminas.js.
 */
(function () {
  'use strict';
  var SETA_A = '<svg class="seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  function escA(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  // HTML da abertura, sem depender da página: o gerador do repositório (scripts/para-o-repo.py) escreve este mesmo
  // HTML no build (data-pre="abertura"), para a primeira tela pintar antes do JS (LCP). O título é <h2>: a V1 e a V4
  // têm a mesma abertura, e o <h1> único de cada página fica no HTML da página.
  function aberturaHTML(F) {
    var A = F.ABERTURA;
    return '<div class="abertura tela">' +
      '<span class="mono"><span class="ponto"></span>&nbsp; ' + escA(A.rotulo) + '</span>' +
      '<h2 class="titulo-abertura">' + escA(A.titulo).replace('morre', '<span class="lima">morre</span>') + '</h2>' +
      '<p class="texto">' + escA(A.texto) + '</p>' +
      '<div class="pilares">' + A.pilares.map(function (p) { return '<div class="pilar"><b>' + escA(p.valor) + '</b><span>' + escA(p.texto) + '</span></div>'; }).join('') + '</div>' +
      '<p class="garantia">' + escA(A.garantia) + '</p>' +
      '<div class="acao"><button class="btn btn-lima" id="comecar" type="button">' + escA(A.cta) + SETA_A + '</button>' +
      '<p class="letra-miuda">' + escA(A.tempo) + '</p><p class="nao-e">' + escA(A.paraQuemNao) + '</p></div>' +
    '</div>';
  }

  function iniciar(OPC) {
    var F = window.FUNIL, UI = window.LAMINAS_UI, VERSAO = OPC.versao;
    var app = document.getElementById('app'), barra = document.getElementById('barra'), contador = document.getElementById('contador'), btnRe = document.getElementById('reiniciar');
    var SETA = '<svg class="seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
    var N = F.PERGUNTAS.length, LETRAS = 'ABCDE';
    var TOTAL = N + 3; // perguntas + 2 lâminas + formulário
    function novo() { return { tela: 'abertura', i: 0, r: {}, contato: {} }; }
    var st = F.carregar(VERSAO) || novo();
    if (st.tela === 'analise' || st.tela === 'saida') st = novo();
    var ocupado = false;

    function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    function guardar() { F.salvar(VERSAO, st); }
    function feito() {
      return { abertura: 0, pergunta: st.i, lamina1: N, lamina2: N + 1, contato: N + 2, analise: TOTAL }[st.tela] || 0;
    }
    function progresso() {
      barra.style.width = Math.round(feito() / TOTAL * 100) + '%';
      contador.textContent = st.tela === 'pergunta' ? String(st.i + 1).padStart(2, '0') + ' / ' + String(N).padStart(2, '0')
        : (st.tela === 'lamina1' || st.tela === 'lamina2') ? 'Antes de enviar' : st.tela === 'contato' ? 'Último passo' : '';
      btnRe.hidden = st.tela === 'abertura';
    }
    function montar(html) {
      app.innerHTML = '<section class="tela entra">' + html + '</section>';
      progresso();
      window.scrollTo(0, 0);
      var h = app.querySelector('h1, h2'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    }
    function ir(tela) { st.tela = tela; guardar(); render(); }

    function abertura() {
      if (app.getAttribute('data-pre') === 'abertura') {
        // a abertura já veio pronta no HTML: não redesenha (a primeira pintura conta para o LCP), só liga o botão
        app.removeAttribute('data-pre'); progresso();
      } else {
        montar(aberturaHTML(F));
      }
      document.getElementById('comecar').addEventListener('click', function () {
        F.track('funil_inicio', { versao: VERSAO }); st.i = 0; ir('pergunta');
      });
    }

    function pergunta() {
      var p = F.PERGUNTAS[st.i];
      montar(
        '<div class="pergunta tela">' +
          '<span class="mono">' + esc(p.rotulo) + '</span>' +
          '<h2>' + esc(p.titulo) + '</h2>' +
          (p.apoio ? '<p class="apoio">' + esc(p.apoio) + '</p>' : '') +
          '<div class="opcoes" role="group" aria-label="' + esc(p.titulo) + '">' +
            p.opcoes.map(function (o, k) {
              return '<button type="button" class="op' + (st.r[p.id] === o.v ? ' sel' : '') + '" data-v="' + esc(o.v) + '">' +
                '<span class="k" aria-hidden="true">' + LETRAS[k] + '</span><span><b>' + esc(o.t) + '</b>' + (o.d ? '<small>' + esc(o.d) + '</small>' : '') + '</span></button>';
            }).join('') +
          '</div>' +
          (st.i > 0 ? '<button type="button" class="voltar" id="voltar">← Voltar</button>' : '') +
        '</div>'
      );
      app.querySelector('.opcoes').addEventListener('click', function (e) { var b = e.target.closest('.op'); if (b) escolher(p, b.dataset.v, b); });
      var v = document.getElementById('voltar'); if (v) v.addEventListener('click', function () { st.i--; guardar(); render(); });
    }

    function escolher(p, v, botao) {
      if (ocupado) return; ocupado = true;
      var o = F.opcao(p.id, v);
      st.r[p.id] = v;
      app.querySelectorAll('.op').forEach(function (b) { b.classList.toggle('sel', b === botao); });
      app.querySelector('.opcoes').classList.add('travado');
      F.track('funil_etapa', { versao: VERSAO, step_index: st.i + 1 });
      setTimeout(function () {
        ocupado = false;
        if (o.saida) { st.tela = 'saida'; st.saida = o.saida; F.track('funil_saida', { versao: VERSAO, motivo: o.saida }); F.apagar(VERSAO); return render(); }
        if (st.i < N - 1) { st.i++; guardar(); render(); } else ir('lamina1');
      }, 380);
    }

    function lamina(html, proxima, anterior, botao) {
      montar(html +
        '<div class="acao"><button class="btn btn-lima" id="seguir" type="button">' + esc(botao) + SETA + '</button></div>' +
        '<button type="button" class="voltar" id="voltar">← Voltar</button>');
      document.getElementById('seguir').addEventListener('click', function () { F.track('funil_lamina', { versao: VERSAO, lamina: st.tela }); ir(proxima); });
      document.getElementById('voltar').addEventListener('click', anterior);
    }
    function lamina1() { lamina(UI.beneficios(), 'lamina2', function () { st.i = N - 1; ir('pergunta'); }, F.LAMINAS.beneficios.botao); }
    function lamina2() { lamina(UI.cases({ raiz: '../', largo: true }), 'contato', function () { ir('lamina1'); }, F.LAMINAS.cases.botao); }

    function contato() {
      var C = F.CONTATO;
      montar(
        '<div class="contato tela">' +
          '<span class="mono">Para onde vai a resposta</span>' +
          '<h2>' + esc(C.titulo) + '</h2>' + F.avisoHTML() +
          '<form id="form" novalidate>' +
            C.campos.map(function (c) {
              return '<div class="campo"><label for="c-' + c.id + '">' + esc(c.rotulo) + '</label>' +
                '<input id="c-' + c.id + '" name="' + c.id + '" type="' + c.tipo + '" autocomplete="' + c.auto + '" placeholder="' + esc(c.placeholder) + '"' +
                (c.tipo === 'tel' ? ' inputmode="tel"' : '') + ' value="' + esc(st.contato[c.id] || '') + '">' +
                '<span class="erro" id="e-' + c.id + '" hidden></span></div>';
            }).join('') +
            '<button class="btn btn-lima" type="submit" id="enviar">' + esc(C.botao) + SETA + '</button>' +
            F.privacidadeHTML() +
          '</form>' +
          '<button type="button" class="voltar" id="voltar">← Voltar</button>' +
        '</div>'
      );
      var form = document.getElementById('form');
      form.whatsapp.addEventListener('input', function () { form.whatsapp.value = F.mascaraTelefone(form.whatsapp.value); });
      form.addEventListener('input', function (e) { st.contato[e.target.name] = e.target.value; guardar(); });
      document.getElementById('voltar').addEventListener('click', function () { ir('lamina2'); });
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var primeiro = null;
        C.campos.forEach(function (c) {
          var el = form[c.id], msg = F.validar(c.id, el.value), er = document.getElementById('e-' + c.id);
          er.textContent = msg; er.hidden = !msg; el.setAttribute('aria-invalid', msg ? 'true' : 'false');
          if (msg && !primeiro) primeiro = el;
        });
        if (primeiro) return primeiro.focus();
        form.email.value = F.corrigirEmail(form.email.value);
        C.campos.forEach(function (c) { st.contato[c.id] = form[c.id].value.trim(); });
        var b = document.getElementById('enviar'); b.disabled = true; b.textContent = 'Enviando…';
        F.enviarLead(VERSAO, st.r, st.contato).then(function (res) {
          st.protocolo = res.codigo; st.tela = 'analise'; render(); F.apagar(VERSAO);
        });
      });
    }

    function analise() {
      var A = F.ANALISE, nome = F.primeiroNome(st.contato.nome);
      var html =
        '<div class="fim tela">' +
          '<span class="mono status"><span class="ponto"></span>' + esc(A.rotulo) + '</span>' +
          '<h1>' + esc(A.titulo) + '</h1>' +
          '<p style="font-size:18px;color:var(--ink-2)">' + esc(A.texto(nome)) + '</p>' +
          '<p class="garantia">' + esc(A.prazo(st.contato.whatsapp)) + '</p>';
      if (OPC.fimComAgenda) {
        html += '<p class="protocolo">Protocolo <b>' + esc(st.protocolo) + '</b></p>' +
          (F.PRODUTO_LOW.ativo ? '<span class="mono separador">Enquanto a análise roda</span>' + UI.compraRapida() : '') +
          '<span class="mono separador">Quer adiantar a conversa?</span>' + UI.agenda({ protocolo: st.protocolo }) +
          '<div class="cartao"><span class="mono">Se for aprovado</span><ol class="passos">' + A.passos.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ol></div>';
      } else {
        html += '<div class="cartao"><span class="mono">Se for aprovado</span><ol class="passos">' + A.passos.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ol></div>' +
          '<p class="protocolo">Protocolo <b>' + esc(st.protocolo) + '</b></p>';
      }
      montar(html + '</div>');
    }

    function saida() {
      var S = F.SAIDAS[st.saida];
      montar(
        '<div class="fim tela">' +
          '<span class="mono">Resultado</span><h1>' + esc(S.titulo) + '</h1>' +
          '<p style="font-size:18px;color:var(--ink-2)">' + esc(S.texto) + '</p>' +
          '<div class="acao"><a class="btn btn-fantasma" href="' + esc(S.cta.url) + '">' + esc(S.cta.texto) + SETA + '</a></div>' +
        '</div>'
      );
    }

    function render() {
      ({ abertura: abertura, pergunta: pergunta, lamina1: lamina1, lamina2: lamina2, contato: contato, analise: analise, saida: saida }[st.tela] || abertura)();
    }

    btnRe.addEventListener('click', function () { F.apagar(VERSAO); st = novo(); render(); });
    document.addEventListener('keydown', function (e) {
      if (st.tela !== 'pergunta' || e.metaKey || e.ctrlKey || e.altKey) return;
      var k = e.key.toUpperCase(), idx = '12345'.indexOf(k); if (idx < 0) idx = LETRAS.indexOf(k);
      var bts = app.querySelectorAll('.op'); if (idx >= 0 && bts[idx]) bts[idx].click();
    });
    render();
  }
  window.TELAS = { iniciar: iniciar, aberturaHTML: aberturaHTML };
})();
