/* Motor da V3 (conversa em tela cheia) do funil de recuperação (DEV-94 / WEB-91). Texto e regras em funil.js; desenho das lâminas em
 * laminas.js. Fica fora do HTML para a página ter um <h1> só (a checagem de SEO do strat-web/sites lê o HTML cru). */
(function () {
  'use strict';
  var F = window.FUNIL, VERSAO = 'v3', N = F.PERGUNTAS.length, CAMPOS = F.CONTATO.campos;
  var conv = document.getElementById('conversa'), rolagem = document.getElementById('rolagem'), zona = document.getElementById('zona'), rotulo = document.getElementById('rotulo'),
    respostas = document.getElementById('respostas'), barra = document.getElementById('barra'), entrada = document.getElementById('entrada'),
    etapas = document.querySelectorAll('#etapas li'), priv = document.getElementById('priv');
  var AVATAR = '<span class="av" aria-hidden="true"><img src="../comum/strat-wordmark-branco.png" alt=""></span>';
  var reduzido = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  function novo() { return { fase: 'abertura', i: 0, k: 0, r: {}, contato: {}, hist: [], perguntado: false }; }
  var st = F.carregar(VERSAO) || novo();
  if (st.fase === 'fim' || st.fase === 'saida' || st.fase === 'enviando') st = novo();

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function hora() { var d = new Date(); return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0'); }
  // etapa do topo: 0 início · 1 operação (perguntas 1–4) · 2 números (5–6) · 3 combinado (7–8 e resumo) · 4 contato · 5 fim
  function etapa() {
    var f = st.fase, n = f === 'abertura' ? 0 : f === 'pergunta' ? (st.i < 4 ? 1 : st.i < 6 ? 2 : 3) : f === 'resumo' ? 3 : f === 'fim' ? 5 : 4;
    etapas.forEach(function (li, k) { li.className = k < n ? 'feito' : k === n ? 'agora' : ''; });
  }
  function guardar() { F.salvar(VERSAO, st); etapa(); }
  function rolar() { requestAnimationFrame(function () { rolagem.scrollTop = rolagem.scrollHeight; }); }

  function bolha(de, html, h, extra) {
    var d = document.createElement('div');
    d.className = 'linha ' + de;
    d.innerHTML = (de === 'eles' ? AVATAR : '') + '<div class="msg ' + de + (extra ? ' ' + extra : '') + '">' + html + '</div>';
    conv.appendChild(d); rolar();
  }
  function registrar(de, html, extra) { var h = hora(); st.hist.push({ de: de, html: html, h: h, x: extra || '' }); bolha(de, html, h, extra); guardar(); }

  // a StratAI "digita" cada mensagem; o tempo cresce com o tamanho do texto
  var geracao = 0; // muda no "recomeçar": digitação antiga para de escrever
  function falar(lista, depois) {
    limparRespostas();
    var k = 0, g = geracao;
    (function proxima() {
      if (g !== geracao) return;
      if (k >= lista.length) return depois && depois();
      var item = lista[k++], html = typeof item === 'string' ? item : item.html, extra = typeof item === 'string' ? '' : item.extra;
      var txt = html.replace(/<[^>]+>/g, '').slice(0, 120);
      var t = reduzido ? 0 : Math.min(1500, 450 + txt.length * 14);
      var dig = document.createElement('div'); dig.className = 'linha eles'; dig.setAttribute('aria-hidden', 'true'); dig.innerHTML = AVATAR + '<div class="digitando"><i></i><i></i><i></i></div>';
      conv.appendChild(dig); rolar();
      setTimeout(function () { dig.remove(); if (g !== geracao) return; registrar('eles', html, extra); setTimeout(proxima, reduzido ? 0 : 260); }, t);
    })();
  }
  function limparRespostas() { respostas.innerHTML = ''; barra.hidden = true; zona.hidden = true; priv.hidden = true; }
  function abrirZona(texto) { zona.hidden = false; rotulo.textContent = texto || ''; rotulo.hidden = !texto; }
  function oferecer(opcoes, aoEscolher) {
    limparRespostas();
    opcoes.forEach(function (o, idx) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'resp' + (o.lima ? ' lima' : ''); b.textContent = o.t;
      b.addEventListener('click', function () { limparRespostas(); aoEscolher(o, idx); });
      respostas.appendChild(b);
    });
    abrirZona(opcoes.length > 1 ? 'Escolha uma opção' : '');
    rolar();
  }
  function pedirTexto(campo, aoEnviar) {
    limparRespostas(); barra.hidden = false; abrirZona(campo.rotulo);
    priv.innerHTML = F.privacidadeHTML(); priv.hidden = false;
    entrada.type = campo.tipo === 'email' ? 'email' : campo.tipo === 'tel' ? 'tel' : 'text';
    entrada.setAttribute('inputmode', campo.tipo === 'tel' ? 'tel' : campo.tipo === 'email' ? 'email' : 'text');
    entrada.setAttribute('autocomplete', campo.auto);
    entrada.placeholder = campo.placeholder; entrada.value = st.contato[campo.id] || '';
    var cheia = function () { barra.classList.toggle('cheia', !!entrada.value.trim()); };
    entrada.oninput = function () { if (campo.tipo === 'tel') entrada.value = F.mascaraTelefone(entrada.value); cheia(); };
    cheia(); rolar();
    barra.onsubmit = function (e) { e.preventDefault(); var v = entrada.value.trim(); if (!v) return entrada.focus(); aoEnviar(v); };
    setTimeout(function () { entrada.focus({ preventScroll: true }); }, 50);
  }

  // ---------- etapas ----------
  function abertura() {
    st.fase = 'abertura';
    var A = F.ABERTURA;
    var depois = function () { st.perguntado = true; guardar(); oferecer([{ t: 'Bora, quero ver se passo', lima: true }], function (o) {
      registrar('eu', esc(o.t)); F.track('funil_inicio', { versao: VERSAO }); st.fase = 'pergunta'; st.i = 0; st.perguntado = false; guardar(); perguntar();
    }); };
    if (st.perguntado) return depois();
    falar([
      'Oi! Aqui é a StratAI.',
      'Pergunta direta: <b class="l">quanto da sua venda morre</b> entre o Pix gerado e o Pix pago?',
      'A gente vai atrás de quem gerou o Pix, o boleto ou largou o carrinho, e traz essa venda de volta. Sem setup, sem mensalidade: a gente fica com <b class="l">15% só do que recuperar</b>.',
      esc(A.garantia),
      'São 7 perguntas, uns 2 minutos. No fim, o seu perfil entra em análise e a gente responde no seu WhatsApp em até ' + esc(F.CONFIG.prazoResposta) + '. Vamos?'
    ], depois);
  }

  function perguntar() {
    var p = F.PERGUNTAS[st.i];
    var mostrar = function () {
      st.perguntado = true; guardar();
      oferecer(p.opcoes.map(function (o) { return { t: o.t, v: o.v }; }), function (o) { responder(p, o.v); });
    };
    if (st.perguntado) return mostrar();
    var falas = [esc(p.titulo)];
    if (p.apoio) falas.push(esc(p.apoio));
    falar(falas, mostrar);
  }

  function responder(p, v) {
    var o = F.opcao(p.id, v);
    st.r[p.id] = v; st.perguntado = false;
    registrar('eu', esc(o.t));
    F.track('funil_etapa', { versao: VERSAO, step_index: st.i + 1 });
    var seguir = function () {
      if (o.saida) return sair(o.saida);
      if (st.i < N - 1) { st.i++; guardar(); perguntar(); } else { st.fase = 'resumo'; guardar(); resumo(); }
    };
    seguir();
  }

  function resumo() {
    var e = F.estimar(st.r);
    var falas = e.parado != null
      ? ['Fechou. Pelas suas respostas, isso fica parado todo mês:<span class="grande">' + F.dinheiro(e.parado) + '</span>',
         'Se a gente trouxer de volta só 8% a 15% disso, são <b class="l">' + F.dinheiro(e.min) + ' a ' + F.dinheiro(e.max) + ' por mês</b> que hoje não entram. Você fica com 85%.<span class="miuda">' + esc(F.FORMULA) + '</span>']
      : ['Fechou. Você não sabe quanto fica parado por mês, e <b class="l">esse é o problema</b>: quem não mede, não recupera.',
         'A primeira coisa que a gente entrega é esse número, venda por venda.'];
    falar(falas, function () { st.fase = 'lamina1'; st.perguntado = false; guardar(); lamina1(); });
  }

  // As lâminas entram como mensagens largas da StratAI; a pessoa segue tocando no botão.
  function laminaChat(html, botao, depois) {
    var mostrar = function () {
      st.perguntado = true; guardar();
      oferecer([{ t: botao, lima: true }], function (o) { registrar('eu', esc(o.t)); st.perguntado = false; F.track('funil_lamina', { versao: VERSAO, lamina: st.fase }); depois(); });
    };
    if (st.perguntado) return mostrar();
    falar([{ html: html, extra: 'lamina' }], mostrar);
  }
  function lamina1() {
    laminaChat(window.LAMINAS_UI.beneficios({ compacto: true }), F.LAMINAS.beneficios.botao, function () { st.fase = 'lamina2'; guardar(); lamina2(); });
  }
  function lamina2() {
    laminaChat(window.LAMINAS_UI.cases({ raiz: '../', compacto: true }), F.LAMINAS.cases.botao, function () {
      st.fase = 'contato'; guardar(); introContato();
    });
  }
  function introContato() {
    falar([esc(F.CONTATO.titulo), { html: F.avisoHTML(), extra: 'msg-aviso' }], function () { st.fase = 'campo'; st.k = 0; st.perguntado = false; guardar(); pedirCampo(); });
  }

  function pedirCampo() {
    var c = CAMPOS[st.k];
    var abrir = function () {
      st.perguntado = true; guardar();
      pedirTexto(c, function (v) {
        if (c.id === 'email') v = F.corrigirEmail(v);
        if (c.id === 'whatsapp') v = F.mascaraTelefone(v);
        registrar('eu', esc(v)); barra.hidden = true;
        var erro = F.validar(c.id, v);
        if (erro) return falar([esc(erro)], abrir);
        st.contato[c.id] = v; st.perguntado = false;
        if (st.k < CAMPOS.length - 1) { st.k++; guardar(); pedirCampo(); } else { st.fase = 'confirmar'; guardar(); confirmar(); }
      });
    };
    if (st.perguntado) return abrir();
    var texto = c.id === 'whatsapp' && st.contato.nome ? 'Prazer, ' + esc(F.primeiroNome(st.contato.nome)) + '! ' + esc(c.pergunta) : esc(c.pergunta);
    falar([texto], abrir);
  }

  function confirmar() {
    var mostrar = function () {
      st.perguntado = true; guardar();
      oferecer([{ t: 'Está certo, pode enviar', lima: true, ok: true }, { t: 'Corrigir' }], function (o) {
        registrar('eu', esc(o.t)); st.perguntado = false;
        if (o.ok) return enviar();
        st.fase = 'campo'; st.k = 0; guardar();
        falar(['Sem problema, vamos de novo.'], pedirCampo);
      });
    };
    if (st.perguntado) return mostrar();
    var ficha = CAMPOS.map(function (c) { return '<span>' + esc(c.curto) + '</span><b>' + esc(st.contato[c.id]) + '</b>'; }).join('');
    falar(['Confere antes de eu mandar para o time?<div class="ficha">' + ficha + '</div>'], mostrar);
  }

  function enviar() {
    st.fase = 'enviando'; guardar();
    var envio = F.enviarLead(VERSAO, st.r, st.contato);
    falar(['Só um instante, estou entregando o seu perfil para o time de análise…'], function () {
      envio.then(function (res) {
        var A = F.ANALISE, nome = F.primeiroNome(st.contato.nome);
        st.fase = 'fim'; F.apagar(VERSAO); etapa();
        falar([
          '<b class="l">Seu perfil entrou em análise.</b>',
          esc(A.texto(nome)),
          esc(A.prazo(st.contato.whatsapp)),
          'Se for aprovado, é assim:<ol>' + A.passos.map(function (p) { return '<li>' + esc(p) + '</li>'; }).join('') + '</ol>',
          'Protocolo: <b class="l">' + esc(res.codigo) + '</b>'
        ], function () { limparRespostas(); });
      });
    });
  }

  function sair(id) {
    var S = F.SAIDAS[id];
    st.fase = 'saida'; F.track('funil_saida', { versao: VERSAO, motivo: id }); F.apagar(VERSAO);
    falar(['<b class="l">' + esc(S.titulo) + '</b>', esc(S.texto) + '<br><a class="btn btn-fantasma" href="' + esc(S.cta.url) + '">' + esc(S.cta.texto) + '</a>'], limparRespostas);
  }

  function iniciar() {
    conv.innerHTML = '<div class="aviso-topo">Conversa privada. As suas respostas vão só para o time de análise da StratAI.</div>';
    etapa();
    st.hist.forEach(function (m) { bolha(m.de, m.html, m.h, m.x); });
    ({ abertura: abertura, pergunta: perguntar, resumo: resumo, lamina1: lamina1, lamina2: lamina2, contato: introContato, campo: pedirCampo, confirmar: confirmar }[st.fase] || abertura)();
  }
  document.getElementById('reiniciar').addEventListener('click', function () { geracao++; F.apagar(VERSAO); st = novo(); iniciar(); });
  iniciar();
})();
