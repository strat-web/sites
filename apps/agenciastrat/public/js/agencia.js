(() => {
  'use strict';
  const WHATSAPP = '554831994338'; // (48) 3199-4338
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const waLink = (t) => 'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(t);
  $$('[data-wa]').forEach((a) => { a.href = waLink(a.dataset.wa); a.target = '_blank'; a.rel = 'noopener'; });

  const header = $('.site-header');
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 4);
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // aparecer ao rolar
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .15, rootMargin: '0px 0px -40px' });
  $$('.rv-in').forEach((el) => io.observe(el));
  setTimeout(() => document.body.classList.add('ready'), 2200);

  // ---------- topo: título palavra por palavra ----------
  // envolve cada palavra (fora da .rot e da .box) em <span class="w"><span>…</span></span>
  $$('#h1 [data-words]').forEach((v) => {
    let i = 0;
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach((part) => {
            if (!part) return;
            if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
            const w = document.createElement('span'); w.className = 'w'; const s = document.createElement('span'); s.style.setProperty('--i', i++); s.textContent = part; w.appendChild(s); frag.appendChild(w);
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !n.classList.contains('rot')) {
          if (n.classList.contains('box')) { const w = document.createElement('span'); w.className = 'w'; n.replaceWith(w); const s = document.createElement('span'); s.style.setProperty('--i', i++); s.appendChild(n); w.appendChild(s); }
          else walk(n);
        }
      });
    };
    walk(v);
  });

  // ---------- topo: leque segue o mouse ----------
  (() => {
    const fan = $('#fan'), hero = $('#hero'); if (!fan || reduce) return;
    const cards = $$('.fc', fan);
    hero.addEventListener('pointermove', (e) => {
      if (!window.matchMedia('(min-width: 960px)').matches) return;
      const dx = (e.clientX / window.innerWidth - .5) * 40, dy = (e.clientY / window.innerHeight - .5) * 24;
      cards.forEach((c) => { c.style.setProperty('--px', dx.toFixed(1)); c.style.setProperty('--py', dy.toFixed(1)); });
    });
    hero.addEventListener('pointerleave', () => cards.forEach((c) => { c.style.setProperty('--px', 0); c.style.setProperty('--py', 0); }));
  })();

  // ---------- topo: tocar/passar o mouse num cartão do leque traz ele pra frente ----------
  (() => {
    const fan = $('#fan'); if (!fan) return;
    const cards = $$('.fc', fan);
    const setFront = (c) => { cards.forEach((x) => x.classList.toggle('front', x === c)); fan.classList.toggle('act', !!c); };
    let pauseUntil = 0;
    cards.forEach((c) => {
      c.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') setFront(c); });
      c.addEventListener('click', () => { setFront(c); pauseUntil = Date.now() + 8000; });
    });
    fan.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') setTimeout(() => { if (!fan.querySelector('.fc:hover')) setFront(null); }, 90); });
    // sem mouse (celular): os cartões vêm pra frente um de cada vez, sozinhos
    if (reduce || window.matchMedia('(hover: hover)').matches) return;
    const order = [2, 3, 4, 1, 0]; let k = 0, seen = false;
    new IntersectionObserver((es) => { seen = es[0].isIntersecting; }, { threshold: .4 }).observe(fan);
    setInterval(() => { if (!seen || Date.now() < pauseUntil || !document.body.classList.contains('ready')) return; setFront(cards[order[k++ % order.length]]); }, 2600);
  })();

  // ---------- criativos: carrossel no computador, stories no celular ----------
  (() => {
    const box = $('#reels'); if (!box) return;
    const items = $$('.reel', box), n = items.length, mq = window.matchMedia('(max-width: 860px)');
    const videoOf = (k) => items[k].querySelector('video');
    // som: um vídeo com som por vez
    $$('.snd', box).forEach((b) => {
      b.addEventListener('pointerdown', (e) => e.stopPropagation());
      b.addEventListener('pointerup', (e) => e.stopPropagation());
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        const v = b.parentElement.querySelector('video'), turnOn = v.muted;
        $$('video', box).forEach((x) => { x.muted = true; });
        $$('.snd', box).forEach((x) => { x.setAttribute('aria-pressed', 'false'); x.setAttribute('aria-label', 'Ligar o som'); x.querySelector('use').setAttribute('href', '#i-mute'); });
        if (turnOn) { v.muted = false; b.setAttribute('aria-pressed', 'true'); b.setAttribute('aria-label', 'Desligar o som'); b.querySelector('use').setAttribute('href', '#i-vol'); if (v.paused) v.play().catch(() => {}); }
      });
    });
    // computador: setas + vídeo toca quando aparece
    const prev = $('#reelsPrev'), next = $('#reelsNext');
    const step = () => box.clientWidth + 18;
    const arrows = () => { prev.disabled = box.scrollLeft < 4; next.disabled = box.scrollLeft + box.clientWidth >= box.scrollWidth - 4; };
    prev.addEventListener('click', () => box.scrollBy({ left: -step() }));
    next.addEventListener('click', () => box.scrollBy({ left: step() }));
    box.addEventListener('scroll', arrows, { passive: true }); window.addEventListener('resize', arrows); arrows();
    const vio = new IntersectionObserver((es) => es.forEach((e) => { if (on || reduce) return; const v = e.target; if (e.isIntersecting && e.intersectionRatio > .6) v.play().catch(() => {}); else v.pause(); }), { threshold: [0, .6, 1] });
    $$('video', box).forEach((v) => vio.observe(v));

    // celular: stories
    let i = 0, on = false, seen = false, held = false, holdT = 0, start = null, elapsed = 0, last = 0;
    const IMG_MS = 5000;
    const bars = document.createElement('div'); bars.className = 'sbars'; bars.setAttribute('aria-hidden', 'true');
    bars.innerHTML = items.map(() => '<i><b></b></i>').join('');
    const segs = [...bars.children];
    const hint = document.createElement('p'); hint.className = 'stories-hint';
    hint.textContent = 'Toque ou arraste pro lado pra avançar e voltar. Segure pra pausar.';
    const paint = () => {
      items.forEach((r, k) => { r.classList.toggle('is-on', k === i); r.classList.toggle('is-next', k === (i + 1) % n); r.classList.toggle('is-prev', k === (i - 1 + n) % n && k !== (i + 1) % n); });
      segs.forEach((g, k) => { g.classList.toggle('done', k < i); g.firstChild.style.width = k < i ? '100%' : '0'; });
    };
    const go = (d) => {
      const v = videoOf(i); if (v) { v.pause(); v.currentTime = 0; }
      i = (i + d + n) % n; elapsed = 0; paint();
    };
    const tick = (now) => {
      requestAnimationFrame(tick);
      const dt = last ? now - last : 0; last = now;
      if (!on) return;
      const running = seen && !held && !document.hidden && !reduce;
      const v = videoOf(i); let p;
      if (v) {
        if (running && v.paused && !v.ended) v.play().catch(() => {});
        if (!running && !v.paused) v.pause();
        if (v.ended) { go(1); return; }
        p = v.duration ? v.currentTime / v.duration : 0;
      } else {
        if (running) elapsed += dt;
        p = elapsed / IMG_MS; if (p >= 1) { go(1); return; }
      }
      segs[i].firstChild.style.width = (Math.min(1, p) * 100).toFixed(2) + '%';
    };
    requestAnimationFrame(tick);
    // arrastar: o card acompanha o dedo; soltou longe o bastante, passa
    const nearby = () => [items[i], items[(i + 1) % n], items[(i - 1 + n) % n]];
    const clearDrag = () => { box.classList.remove('dragging'); nearby().forEach((r) => { r.style.transform = ''; r.style.opacity = ''; }); };
    const drag = (dx) => {
      const [cur, nx, pv] = nearby(), t = Math.min(1, Math.abs(dx) / box.clientWidth);
      cur.style.transform = `translateX(${dx}px) rotate(${dx / 30}deg)`; cur.style.opacity = 1 - t * .35;
      nx.style.transform = ''; nx.style.opacity = ''; pv.style.transform = ''; pv.style.opacity = '';
      if (dx < 0) { nx.style.transform = `translateX(${9 * (1 - t)}%) scale(${.9 + .1 * t})`; nx.style.opacity = .45 + .55 * t; }
      else { pv.style.transform = `translateX(${-45 * (1 - t)}%) scale(${.86 + .14 * t}) rotate(${-4 * (1 - t)}deg)`; pv.style.opacity = t; }
    };
    const down = (e) => { if (!on) return; start = { x: e.clientX, dx: 0, moving: false, id: e.pointerId }; holdT = setTimeout(() => { held = true; }, 260); };
    const move = (e) => {
      if (!on || !start) return;
      start.dx = e.clientX - start.x;
      if (!start.moving && Math.abs(start.dx) > 8) {
        start.moving = true; clearTimeout(holdT); held = true; box.classList.add('dragging');
        try { box.setPointerCapture(start.id); } catch (_) {}
      }
      if (start.moving) drag(start.dx);
    };
    const up = (e) => {
      if (!on || !start) return; clearTimeout(holdT);
      const { dx, moving } = start; start = null;
      if (moving) { held = false; clearDrag(); if (Math.abs(dx) > Math.min(70, box.clientWidth * .22)) go(dx < 0 ? 1 : -1); return; }
      if (held) { held = false; return; }
      const r = box.getBoundingClientRect(); go(e.clientX - r.left < r.width * .35 ? -1 : 1);
    };
    const cancel = () => { clearTimeout(holdT); if (start && start.moving) clearDrag(); start = null; held = false; };
    box.addEventListener('pointerdown', down); box.addEventListener('pointermove', move); box.addEventListener('pointerup', up); box.addEventListener('pointercancel', cancel); box.addEventListener('pointerleave', (e) => { if (!(start && start.moving)) cancel(e); });
    box.addEventListener('contextmenu', (e) => { if (on) e.preventDefault(); });
    new IntersectionObserver((es) => { seen = es[0].isIntersecting; }, { threshold: .5 }).observe(box);
    const enable = () => {
      if (on) return; on = true;
      $$('video', box).forEach((v) => { v.pause(); v.loop = false; v.currentTime = 0; });
      box.classList.add('stories'); box.scrollLeft = 0; box.appendChild(bars); box.after(hint); i = 0; elapsed = 0; paint();
    };
    const disable = () => {
      if (!on) return; on = false; cancel(); clearDrag();
      box.classList.remove('stories'); bars.remove(); hint.remove();
      items.forEach((r) => r.classList.remove('is-on', 'is-next', 'is-prev'));
      $$('video', box).forEach((v) => { v.loop = true; v.pause(); }); arrows();
    };
    const sync = () => (mq.matches ? enable() : disable());
    mq.addEventListener('change', sync); sync();
  })();

  // ---------- faixa de resultados: duplica pra rolar sem emenda ----------
  (() => { const t = $('#ticker'); if (t) t.insertAdjacentHTML('beforeend', '<span aria-hidden="true" style="display:contents">' + t.innerHTML + '</span>'); })();

  // ---------- contador ----------
  $$('[data-count]').forEach((el) => {
    const end = +el.dataset.count, pre = el.dataset.pre || '', suf = el.dataset.suf || ''; el.textContent = pre + '0' + suf;
    const o = new IntersectionObserver((es) => {
      if (!es[0].isIntersecting) return; o.disconnect();
      if (reduce) { el.textContent = pre + end.toLocaleString('pt-BR') + suf; return; }
      const t0 = performance.now(), dur = 1400;
      const tick = (now) => { const t = Math.min(1, (now - t0) / dur), k = 1 - Math.pow(1 - t, 3); el.textContent = pre + Math.round(end * k).toLocaleString('pt-BR') + suf; if (t < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    }, { threshold: .6 });
    o.observe(el);
  });

  // ---------- qual é o seu problema ----------
  (() => {
    const btns = $$('#probs .prob'), ans = $('#answer'), panes = $$('#answer .pane');
    const COLORS = ['var(--red)', 'var(--blue)', 'var(--purple)', 'var(--lime)'];
    const set = (i) => { btns.forEach((b) => b.classList.toggle('on', +b.dataset.p === i)); panes.forEach((p, k) => p.classList.toggle('on', k === i)); ans.style.setProperty('--c', COLORS[i]); };
    btns.forEach((b) => b.addEventListener('click', () => { set(+b.dataset.p); if (window.matchMedia('(max-width: 1000px)').matches) ans.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }));
    // botão da resposta já marca a frente no formulário
    $$('#answer [data-goal]').forEach((a) => a.addEventListener('click', () => { const c = $('input[name=servico][value="' + a.dataset.goal + '"]'); if (c) c.checked = true; }));
  })();

  // ---------- linha do tempo: barra preenche ----------
  (() => { const tl = $('#tl'); if (!tl) return; const o = new IntersectionObserver((es) => { if (es[0].isIntersecting) { tl.classList.add('in'); o.disconnect(); } }, { threshold: .3 }); o.observe(tl); })();

  // ---------- manifesto ----------
  (() => { const m = $('#manifesto .wrap'); if (!m) return; const o = new IntersectionObserver((es) => { if (es[0].isIntersecting) { m.classList.add('in'); o.disconnect(); } }, { threshold: .35 }); o.observe(m); })();

  // ---------- formulário em 3 passos ----------
  const form = $('#leadForm');
  const tel = $('#fWhats');
  tel.addEventListener('input', () => { let d = tel.value.replace(/\D/g, ''); if (d.length > 11 && d.startsWith('55')) d = d.slice(2); d = d.slice(0, 11); tel.value = d.length > 6 ? '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length - 4) + '-' + d.slice(-4) : d.length > 2 ? '(' + d.slice(0, 2) + ') ' + d.slice(2) : d; });
  const FIX = { 'gmial.com': 'gmail.com', 'gmai.com': 'gmail.com', 'gmail.co': 'gmail.com', 'gmail.con': 'gmail.com', 'hotmial.com': 'hotmail.com', 'hotmai.com': 'hotmail.com', 'outlok.com': 'outlook.com' };
  const rules = {
    nome: (v) => /^[A-Za-zÀ-ÿ' .-]{2,}$/.test(v) ? '' : 'Escreva o seu nome (só letras).',
    whats: (v) => { const d = v.replace(/\D/g, ''); if (/^(\d)\1+$/.test(d)) return 'Esse número não parece real.'; if (d.length < 10) return 'Coloca com DDD.'; return ''; },
    email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Confira o e-mail.',
    empresa: (v) => v ? '' : 'Preencha esse campo.',
    segmento: (v) => v ? '' : 'Escolha uma opção.',
    faturamento: (v) => v ? '' : 'Escolha uma opção.',
    verba: (v) => v ? '' : 'Escolha uma opção.'
  };
  const STEP_FIELDS = [[], ['empresa', 'segmento', 'faturamento', 'verba'], ['nome', 'whats', 'email']];
  let cur = 0;
  const steps = $$('#steps i'), fsteps = $$('.fstep', form);
  const show = (i) => { cur = i; fsteps.forEach((s) => s.classList.toggle('on', +s.dataset.s === i)); steps.forEach((b, k) => b.classList.toggle('on', k <= i)); };
  const validate = (i) => {
    let firstBad = null;
    if (i === 0) { const any = $$('input[name=servico]:checked', form).length > 0; const err = $('.fstep[data-s="0"] .err'); err.hidden = any; if (!any) firstBad = $('input[name=servico]', form); }
    STEP_FIELDS[i].forEach((k) => {
      const el = form[k]; const msg = rules[k](el.value.trim()); const err = el.parentElement.querySelector('.err');
      err.textContent = msg; err.hidden = !msg; el.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (msg && !firstBad) firstBad = el;
    });
    if (firstBad) { firstBad.focus(); return false; } return true;
  };
  $$('[data-next]', form).forEach((b) => b.addEventListener('click', () => { if (validate(cur)) show(cur + 1); }));
  $$('[data-back]', form).forEach((b) => b.addEventListener('click', () => show(cur - 1)));
  // Valida os 3 passos e volta para o primeiro que falhar (antes, corrige o domínio do e-mail digitado errado).
  const pronto = () => {
    const em = form.email; const parts = em.value.trim().toLowerCase().split('@'); if (parts[1] && FIX[parts[1]]) em.value = parts[0] + '@' + FIX[parts[1]];
    if (!validate(0)) { show(0); return false; } if (!validate(1)) { show(1); return false; } return validate(2);
  };
  // A tag do MetricaaS conta todo evento "submit" como "Enviou um formulário" na jornada do lead. Validando no clique
  // do botão (o Enter num campo vira clique nesse mesmo botão), a tentativa recusada nem chega a ser "submit": a
  // jornada registra um envio só, o que passou na validação (WEB-71).
  $('button[type=submit]', form).addEventListener('click', (e) => { if (!pronto()) e.preventDefault(); });
  // Chaves dos campos personalizados do workspace strat-marketing ("Campos da empresa" na ficha do lead). O MetricaaS
  // grava pela CHAVE do campo (não pelo rótulo) e descarta, sem erro, a chave que não existe no workspace. As 6 chaves
  // abaixo são as que existem lá (conferidas pelo Helbert em 12/11; o lead de 11/11 já chegou com elas em
  // lead_custom_values). Campo do formulário → chave:
  const CAMPOS = {
    insta: 'instagram',
    empresa: 'empresa',
    segmento: 'segmento',
    faturamento: 'faturamento',
    verba: 'verba',
    servicos: 'servicos' // opções marcadas no passo 1, separadas por vírgula
  };
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!pronto()) return;
    const d = Object.fromEntries(['nome', 'whats', 'email', 'empresa', 'insta', 'segmento', 'faturamento', 'verba'].map((k) => [k, form[k].value.trim()]));
    d.servicos = $$('input[name=servico]:checked', form).map((c) => c.value);
    // Lead no MetricaaS (workspace strat-marketing): cria o lead e manda Lead pela CAPI (o pixel do navegador, com o
    // mesmo event_id, só sai depois do "Aceitar"). Campo que não existe no workspace é descartado pelo MetricaaS.
    // Sem await: o WhatsApp abaixo precisa abrir dentro do clique; o envio segue sozinho (keepalive, reenvio no 202).
    try {
      const dig = d.whats.replace(/\D/g, '');
      const tel = dig.length >= 10 && dig.length <= 11 ? '55' + dig : dig;
      const valores = Object.assign({}, d, { servicos: d.servicos.join(', ') });
      const campos = {};
      Object.keys(CAMPOS).forEach((k) => { if (valores[k]) campos[CAMPOS[k]] = valores[k]; });
      const enviar = (m) => m.lead({ nome: d.nome, telefone: tel, email: d.email, campos, resultado: 'qualificado' })
        .catch((err) => console.warn('[agencia] lead não enviado', err));
      waitMtc(8000).then(enviar).catch(() => console.warn('[agencia] tag do MetricaaS não carregou: lead não enviado'));
    } catch (err) {}
    // Obrigado + WhatsApp com o mesmo número e frase dos outros botões. O clique programático sai de dentro
    // do envio (gesto do usuário), então o navegador permite a nova aba e o MetricaaS vê o clique.
    $('#thanksNome').textContent = d.nome.split(/\s+/)[0];
    $('#formFields').hidden = true;
    const thanks = $('#thanks'); thanks.hidden = false; thanks.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    $('#thanksWa').click();
  });


  // ---------- MetricaaS: espera a tag (defer) ----------
  function waitMtc(ms) {
    return new Promise((ok, falha) => {
      const t0 = Date.now();
      (function tenta() {
        if (window.mtc && window.mtc.lead) return ok(window.mtc);
        if (Date.now() - t0 > ms) return falha({ erro: 'tag-nao-carregou' });
        setTimeout(tenta, 150);
      })();
    });
  }


})();
