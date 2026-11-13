/* Motor da V2 (raio-x ao vivo) do funil de recuperação (DEV-94 / WEB-91). Texto e regras em funil.js; desenho das lâminas em
 * laminas.js. Fica fora do HTML para a página ter um <h1> só (a checagem de SEO do strat-web/sites lê o HTML cru). */
(function () {
  'use strict';
  var F = window.FUNIL, VERSAO = 'v2', N = F.PERGUNTAS.length;
  // no build (Node, scripts/para-o-repo.py) não há página: só as funções puras de HTML ficam disponíveis (window.RAIOX)
  var noNavegador = typeof document !== 'undefined' && !!document.getElementById('app');
  var app = noNavegador ? document.getElementById('app') : null, lado = noNavegador ? document.getElementById('lado') : null,
    mini = noNavegador ? document.getElementById('mini') : null, btnRe = noNavegador ? document.getElementById('reiniciar') : null;
  var SETA = '<svg class="seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  function novo() { return { tela: 'abertura', i: 0, r: {}, contato: {}, log: [] }; }
  var st = (noNavegador && F.carregar(VERSAO)) || novo();
  if (st.tela === 'analise' || st.tela === 'saida') st = novo();
  var ocupado = false;

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function hora(seg) { var d = new Date(); return [d.getHours(), d.getMinutes()].concat(seg ? [d.getSeconds()] : []).map(function (n) { return String(n).padStart(2, '0'); }).join(':'); }
  function guardar() { F.salvar(VERSAO, st); }
  function resp(id) { var o = F.opcao(id, st.r[id]); return o ? o.t : null; }

  function painelHTML() {
    var e = F.estimar(st.r);
    var temValor = e.parado != null;
    var linhas = [
      ['Vendas paradas por mês', e.vendas ? 'cerca de ' + e.vendas.toLocaleString('pt-BR') : (st.r.volume === 'naosei' ? 'não sabe' : null)],
      ['Ticket médio', e.ticket ? 'cerca de ' + F.dinheiro(e.ticket) : null],
      ['Pix pago, a cada 10', resp('conversao')],
      ['Recuperação hoje', resp('hoje')]
    ];
    var parado = temValor ? F.dinheiro(e.parado) : (st.r.volume === 'naosei' ? 'sem número' : '[X]');
    var sub = temValor ? 'Se a gente trouxer de volta 8% a 15%: <b>' + F.dinheiro(e.min) + ' a ' + F.dinheiro(e.max) + ' por mês</b>.'
      : st.r.volume === 'naosei' ? 'Ninguém mede quanto está parado. É a primeira coisa que a gente mede.' : 'Vai enchendo conforme você responde.';
    var log = st.log.slice(-8).map(function (l) { return '<div><span class="ok">✓</span> ' + esc(l) + '</div>'; }).reverse().join('');
    return '<div class="painel">' +
      '<div class="p-cab"><span class="ponto"></span><span class="mono">Raio-X ao vivo</span><span class="mono relogio">' + hora() + '</span></div>' +
      '<div class="p-corpo">' +
        '<div class="linhas">' + linhas.map(function (l) { return '<div class="linha"><span>' + l[0] + '</span><b class="' + (l[1] ? '' : 'vazio') + '">' + esc(l[1] || '[X]') + '</b></div>'; }).join('') + '</div>' +
        '<div class="grande"><span class="mono">Dinheiro parado por mês</span><div class="valor ' + (temValor ? '' : 'vazio') + '">' + parado + '</div><p class="sub">' + sub + '</p></div>' +
        '<div class="divisao"><span class="mono">De cada real recuperado</span><div class="trilha" aria-hidden="true"><i class="voce"></i><i class="nos"></i></div>' +
          '<div class="leg"><span>85% fica com você</span><span class="lima">15% StratAI</span></div></div>' +
        '<div class="risco"><span>Seu risco se não der certo</span><b>R$ 0</b></div>' +
        (log ? '<div class="log" aria-hidden="true">' + log + '</div>' : '') +
        '<p class="formula">' + esc(F.FORMULA) + '</p>' +
      '</div></div>';
  }
  function atualizarPainel() {
    lado.innerHTML = painelHTML();
    var e = F.estimar(st.r);
    var mostra = st.tela === 'pergunta' && st.i > 0;
    mini.hidden = !mostra;
    if (mostra) mini.innerHTML = '<span>Dinheiro parado por mês</span><b>' + (e.parado != null ? F.dinheiro(e.parado) : '[X]') + '</b><span>Seu risco <b>R$ 0</b></span>';
  }
  function montar(html) {
    app.innerHTML = '<div class="fluxo entra">' + html + '</div>';
    atualizarPainel();
    btnRe.hidden = st.tela === 'abertura';
    window.scrollTo(0, 0);
    var h = app.querySelector('h1, h2'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
  }
  function trilho() {
    var s = ''; for (var k = 0; k < N; k++) s += '<i class="' + (k <= st.i ? 'on' : '') + '"></i>';
    return '<div class="passo"><span class="mono">' + String(st.i + 1).padStart(2, '0') + ' / ' + String(N).padStart(2, '0') + '</span><div class="trilho" aria-hidden="true">' + s + '</div></div>';
  }

  // HTML da abertura: o gerador do repositório escreve o mesmo no build (data-pre="abertura"), para a primeira tela
  // pintar antes do JS (LCP no celular); aqui o JS só liga o botão.
  function aberturaHTML() {
    var A = F.ABERTURA;
    return (
      '<span class="mono"><span class="ponto"></span>&nbsp; Raio-X em 2 minutos · 15% só do que voltar</span>' +
      '<h2 class="titulo-abertura">Descubra quanto dinheiro está <span class="lima">parado</span> no Pix que ninguém pagou.</h2>' +
      '<p class="apoio" style="font-size:18px">' + esc(A.texto) + '</p>' +
      '<div class="chips">' + A.pilares.map(function (p) { return '<span class="chip"><b>' + esc(p.valor) + '</b> ' + esc(p.texto) + '</span>'; }).join('') + '</div>' +
      '<p class="garantia">' + esc(A.garantia) + '</p>' +
      '<div class="so-celular">' + painelHTML() + '</div>' +
      '<div class="acao"><button class="btn btn-lima" id="comecar" type="button">Fazer o meu raio-x' + SETA + '</button>' +
      '<p class="letra-miuda">' + esc(A.tempo) + '</p><p class="letra-miuda">' + esc(A.paraQuemNao) + '</p></div>'
    );
  }
  function abertura() {
    if (app.getAttribute('data-pre') === 'abertura') {
      app.removeAttribute('data-pre');
      app.querySelectorAll('.relogio').forEach(function (r) { r.textContent = hora(); });
      atualizarPainel(); btnRe.hidden = true;
    } else {
      montar(aberturaHTML());
    }
    document.getElementById('comecar').addEventListener('click', function () {
      F.track('funil_inicio', { versao: VERSAO }); st.tela = 'pergunta'; st.i = 0; guardar(); render();
    });
  }

  function pergunta() {
    var p = F.PERGUNTAS[st.i];
    var curtas = p.opcoes.every(function (o) { return !o.d && o.t.length < 34; });
    montar(
      trilho() +
      '<h2>' + esc(p.titulo) + '</h2>' + (p.apoio ? '<p class="apoio">' + esc(p.apoio) + '</p>' : '') +
      '<div class="opcoes' + (curtas ? ' duas' : '') + '" role="group" aria-label="' + esc(p.titulo) + '">' +
        p.opcoes.map(function (o) { return '<button type="button" class="op' + (st.r[p.id] === o.v ? ' sel' : '') + '" data-v="' + esc(o.v) + '"><b>' + esc(o.t) + '</b>' + (o.d ? '<small>' + esc(o.d) + '</small>' : '') + '</button>'; }).join('') +
      '</div>' +
      (st.i > 0 ? '<button type="button" class="voltar" id="voltar">← Voltar</button>' : '')
    );
    app.querySelector('.opcoes').addEventListener('click', function (e) { var b = e.target.closest('.op'); if (b) escolher(p, b.dataset.v, b); });
    var v = document.getElementById('voltar'); if (v) v.addEventListener('click', function () { st.i--; guardar(); render(); });
  }

  function escolher(p, v, botao) {
    if (ocupado) return; ocupado = true;
    var o = F.opcao(p.id, v);
    st.r[p.id] = v;
    st.log = (st.log || []).filter(function (l) { return l.indexOf(p.rotulo + ':') !== 0; });
    st.log.push(p.rotulo + ': ' + o.t);
    app.querySelectorAll('.op').forEach(function (b) { b.classList.toggle('sel', b === botao); });
    app.querySelector('.opcoes').classList.add('travado');
    atualizarPainel();
    F.track('funil_etapa', { versao: VERSAO, step_index: st.i + 1 });
    setTimeout(function () {
      ocupado = false;
      if (o.saida) { st.tela = 'saida'; st.saida = o.saida; F.track('funil_saida', { versao: VERSAO, motivo: o.saida }); F.apagar(VERSAO); return render(); }
      if (st.i < N - 1) st.i++; else st.tela = 'resumo';
      guardar(); render();
    }, 420);
  }

  function resumo() {
    var e = F.estimar(st.r);
    montar(
      '<span class="mono"><span class="ponto"></span>&nbsp; Raio-X pronto</span>' +
      (e.parado != null
        ? '<h2>Pelas suas respostas, cerca de <span class="lima">' + F.dinheiro(e.parado) + '</span> ficam parados todo mês.</h2>' +
          '<p class="apoio">Se a gente trouxer de volta só 8% a 15% disso, são ' + F.dinheiro(e.min) + ' a ' + F.dinheiro(e.max) + ' por mês que hoje não entram. ' +
          'Você fica com 85%. A gente fica com 15%. Do que você já fatura, a gente não toca.</p>'
        : '<h2>Você não sabe quanto está parado. <span class="lima">Esse é o problema.</span></h2>' +
          '<p class="apoio">Quem não mede, não recupera. A primeira coisa que a gente entrega é esse número, venda por venda.</p>') +
      '<div class="so-celular">' + painelHTML() + '</div>' +
      '<p class="garantia">' + esc(F.ABERTURA.garantia) + '</p>' +
      '<div class="acao"><button class="btn btn-lima" id="seguir" type="button">Continuar' + SETA + '</button>' +
      '<p class="letra-miuda">A gente confere se a sua operação é aprovada e responde no WhatsApp em até ' + esc(F.CONFIG.prazoResposta) + '.</p></div>' +
      '<button type="button" class="voltar" id="voltar">← Voltar</button>'
    );
    document.getElementById('seguir').addEventListener('click', function () { st.tela = 'lamina1'; guardar(); render(); });
    document.getElementById('voltar').addEventListener('click', function () { st.tela = 'pergunta'; st.i = N - 1; guardar(); render(); });
  }

  function lamina(html, proxima, anterior, botao) {
    montar(html + '<div class="acao"><button class="btn btn-lima" id="seguir" type="button">' + esc(botao) + SETA + '</button></div>' +
      '<button type="button" class="voltar" id="voltar">← Voltar</button>');
    document.getElementById('seguir').addEventListener('click', function () { F.track('funil_lamina', { versao: VERSAO, lamina: st.tela }); st.tela = proxima; guardar(); render(); });
    document.getElementById('voltar').addEventListener('click', function () { st.tela = anterior; guardar(); render(); });
  }
  function lamina1() { lamina(window.LAMINAS_UI.beneficios(), 'lamina2', 'resumo', F.LAMINAS.beneficios.botao); }
  function lamina2() { lamina(window.LAMINAS_UI.cases({ raiz: '../' }), 'contato', 'lamina1', F.LAMINAS.cases.botao); }

  function contato() {
    var C = F.CONTATO;
    montar(
      '<div class="contato fluxo"><span class="mono">Para onde vai a resposta</span><h2>' + esc(C.titulo) + '</h2>' + F.avisoHTML() +
      '<form id="form" novalidate>' +
        C.campos.map(function (c) {
          return '<div class="campo"><label for="c-' + c.id + '">' + esc(c.rotulo) + '</label><input id="c-' + c.id + '" name="' + c.id + '" type="' + c.tipo + '" autocomplete="' + c.auto + '" placeholder="' + esc(c.placeholder) + '"' + (c.tipo === 'tel' ? ' inputmode="tel"' : '') + ' value="' + esc(st.contato[c.id] || '') + '"><span class="erro" id="e-' + c.id + '" hidden></span></div>';
        }).join('') +
        '<button class="btn btn-lima" type="submit" id="enviar">' + esc(C.botao) + SETA + '</button>' + F.privacidadeHTML() +
      '</form><button type="button" class="voltar" id="voltar">← Voltar</button></div>'
    );
    var form = document.getElementById('form');
    form.whatsapp.addEventListener('input', function () { form.whatsapp.value = F.mascaraTelefone(form.whatsapp.value); });
    form.addEventListener('input', function (e) { st.contato[e.target.name] = e.target.value; guardar(); });
    document.getElementById('voltar').addEventListener('click', function () { st.tela = 'lamina2'; guardar(); render(); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var primeiro = null;
      C.campos.forEach(function (c) {
        var el = form[c.id], msg = F.validar(c.id, el.value), er = document.getElementById('e-' + c.id);
        er.textContent = msg; er.hidden = !msg; el.setAttribute('aria-invalid', msg ? 'true' : 'false'); if (msg && !primeiro) primeiro = el;
      });
      if (primeiro) return primeiro.focus();
      form.email.value = F.corrigirEmail(form.email.value);
      C.campos.forEach(function (c) { st.contato[c.id] = form[c.id].value.trim(); });
      var b = document.getElementById('enviar'); b.disabled = true; b.textContent = 'Enviando…';
      var envio = F.enviarLead(VERSAO, st.r, st.contato);
      analise(envio);
    });
  }

  // terminal "conferindo" e depois o status. O envio corre em paralelo; o status só aparece com ele resolvido.
  function analise(envio) {
    st.tela = 'analise'; F.apagar(VERSAO);
    montar('<span class="mono"><span class="ponto"></span>&nbsp; Enviando para o time de análise</span><div class="terminal" id="term" aria-live="polite"></div>');
    var linhas = ['conferindo onde você vende', 'conferindo volume de vendas paradas', 'conferindo ticket médio', 'anexando o seu raio-x', 'entregando ao time de análise'];
    var term = document.getElementById('term'), k = 0;
    var reduzido = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    (function proxima() {
      if (k < linhas.length) {
        term.insertAdjacentHTML('beforeend', '<div>' + hora(true) + '  &gt; ' + linhas[k] + '… <span class="ok">ok</span></div>');
        k++; return setTimeout(proxima, reduzido ? 0 : 420);
      }
      envio.then(function (res) { st.protocolo = res.codigo; final(); });
    })();
  }
  function final() {
    var A = F.ANALISE, nome = F.primeiroNome(st.contato.nome);
    montar(
      '<span class="mono"><span class="ponto"></span>&nbsp; ' + esc(A.rotulo) + '</span><h1>' + esc(A.titulo) + '</h1>' +
      '<p class="apoio" style="font-size:18px">' + esc(A.texto(nome)) + '</p><p class="garantia">' + esc(A.prazo(st.contato.whatsapp)) + '</p>' +
      '<div class="cartao"><span class="mono">Se for aprovado</span><ol class="passos">' + A.passos.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ol></div>' +
      '<div class="so-celular">' + painelHTML() + '</div>' +
      '<p class="protocolo">Protocolo <b>' + esc(st.protocolo) + '</b></p>'
    );
  }
  function saida() {
    var S = F.SAIDAS[st.saida];
    montar('<span class="mono">Resultado</span><h1>' + esc(S.titulo) + '</h1><p class="apoio" style="font-size:18px">' + esc(S.texto) + '</p>' +
      '<div class="acao"><a class="btn btn-fantasma" href="' + esc(S.cta.url) + '">' + esc(S.cta.texto) + SETA + '</a></div>');
  }

  function render() {
    ({ abertura: abertura, pergunta: pergunta, resumo: resumo, lamina1: lamina1, lamina2: lamina2, contato: contato, saida: saida }[st.tela] || abertura)();
  }
  window.RAIOX = { aberturaHTML: aberturaHTML, painelHTML: painelHTML };
  if (!noNavegador) return;
  btnRe.addEventListener('click', function () { F.apagar(VERSAO); st = novo(); render(); });
  setInterval(function () { var r = lado.querySelector('.relogio'); if (r) r.textContent = hora(); }, 15000);
  render();
})();
