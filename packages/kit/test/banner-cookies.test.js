// Banner de cookies do kit (banner-cookies.js) num DOM simulado com relógio de mentira: o mesmo texto que o <Tracking>
// põe no <script> inline roda aqui, e o m.js chega na hora que o teste manda. Regra: o pixel (mtc.consentir) só liga
// depois do "Aceitar" e liga mesmo com o m.js atrasado mais de 8 s (WEB-80).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { scriptDoBanner, METRICAAS } from '../src/index.js';

const fonte = readFileSync(new URL('../src/banner-cookies.js', import.meta.url), 'utf8');
const PRIVACIDADE = 'https://agenciastrat.com.br/privacidade/';

// Alvo de eventos mínimo (addEventListener e disparo).
function alvo(obj = {}) {
  const ouvintes = {};
  obj.addEventListener = (tipo, fn) => (ouvintes[tipo] ||= []).push(fn);
  obj.disparar = (tipo, ev = {}) => (ouvintes[tipo] || []).slice().forEach((fn) => fn(ev));
  obj.ouvintes = (tipo) => (ouvintes[tipo] || []).length;
  return obj;
}

// Página no meio do parse do <head>: o <script defer> do m.js já está no DOM, mas ainda não rodou (é o que acontece
// quando o script inline do banner roda). `escolha` é o que está guardado em strat_cookies.
function pagina({ escolha = null, semStorage = false } = {}) {
  let agora = 0;
  const timers = [];
  const guardado = new Map(escolha ? [['strat_cookies', escolha]] : []);
  const consentimentos = [];
  const mjs = alvo({ src: METRICAAS });
  const body = { filhos: [], appendChild(el) { this.filhos.push(el); el.pai = this; } };
  const document = alvo({
    readyState: 'loading',
    body: null,
    querySelector: (sel) => (sel === `script[src="${METRICAAS}"]` ? mjs : null),
    createElement: () => {
      const el = alvo({ attrs: {} });
      el.setAttribute = (k, v) => { el.attrs[k] = v; };
      el.remove = () => { el.pai.filhos.splice(el.pai.filhos.indexOf(el), 1); el.pai = null; };
      return el;
    },
  });
  const localStorage = {
    getItem: (k) => { if (semStorage) throw new Error('SecurityError'); return guardado.get(k) ?? null; },
    setItem: (k, v) => { if (semStorage) throw new Error('SecurityError'); guardado.set(k, String(v)); },
  };
  const window = alvo({
    localStorage,
    Date: { now: () => agora },
    setTimeout: (fn, ms) => timers.push({ fn, quando: agora + ms }),
    setInterval: () => { throw new Error('o banner não pode usar setInterval'); },
  });
  window.window = window;
  window.document = document;
  const ctx = vm.createContext(window);

  return {
    window, document, guardado, consentimentos, timers,
    rodarBanner() { vm.runInContext(scriptDoBanner(fonte, PRIVACIDADE), ctx); },
    // Passa o tempo do relógio de mentira, rodando os timers que vencerem (é como o código antigo esperava 8 s).
    avancar(ms) {
      const fim = agora + ms;
      for (;;) {
        timers.sort((a, b) => a.quando - b.quando);
        if (!timers.length || timers[0].quando > fim) break;
        const t = timers.shift();
        agora = t.quando;
        t.fn();
      }
      agora = fim;
    },
    // Fim do parse do HTML: body existe e o DOMContentLoaded dispara (sem o m.js, que segue atrasado).
    fimDoParse() { document.body = body; document.readyState = 'interactive'; document.disparar('DOMContentLoaded'); },
    // O m.js roda (troca o window.mtc inteiro, como o de verdade) e o <script> dispara "load"; depois, o load da página.
    chegaMjs() {
      window.mtc = { consentir: () => consentimentos.push(agora), track() {}, lead() {} };
      mjs.disparar('load');
      document.readyState = 'complete';
      window.disparar('load');
    },
    banner: () => body.filhos.find((el) => el.className === 'strat-cookies'),
    clicar(valor) {
      const b = this.banner();
      const botao = { dataset: { c: valor } };
      b.disparar('click', { target: { closest: (sel) => (sel === '[data-c]' ? botao : null) } });
    },
  };
}

test('o script inline é a expressão do arquivo chamada com window, document e as opções, sem comentário de linha', () => {
  const s = scriptDoBanner(fonte, 'https://x.com.br/<privacidade>/');
  assert.match(s, /^\(function \(w, d, o\) \{/);
  assert.match(s, /\}\)\(window, document, \{"privacidade":"https:\/\/x\.com\.br\/\\u003cprivacidade>\/","mjs":"https:\/\/t\.metricaas\.com\.br\/m\.js"\}\);$/);
  assert.doesNotMatch(s, /^\s*\/\//m);
  assert.doesNotMatch(s, /setTimeout|setInterval/);
});

test('aceite guardado e m.js atrasado mais de 8 s: o pixel liga quando o m.js chega, uma vez só', () => {
  const p = pagina({ escolha: 'sim' });
  p.rodarBanner();
  p.fimDoParse();
  p.avancar(9000);
  assert.deepEqual(p.consentimentos, [], 'nada antes do m.js');
  assert.equal(p.timers.length, 0, 'sem timer esperando o m.js');
  p.avancar(3000);
  p.chegaMjs();
  assert.deepEqual(p.consentimentos, [12000]);
  assert.equal(p.banner(), undefined, 'com escolha guardada, o banner não aparece');
});

test('"Aceitar" antes do m.js, que chega 9 s depois: o pixel liga quando ele chega, uma vez só', () => {
  const p = pagina();
  p.rodarBanner();
  p.fimDoParse();
  assert.ok(p.banner(), 'banner na tela');
  assert.match(p.banner().innerHTML, /href="https:\/\/agenciastrat\.com\.br\/privacidade\/"/);
  p.clicar('sim');
  assert.equal(p.guardado.get('strat_cookies'), 'sim');
  assert.equal(p.banner(), undefined, 'o banner sai');
  p.avancar(9000);
  assert.deepEqual(p.consentimentos, []);
  p.chegaMjs();
  p.window.disparar('load');
  assert.deepEqual(p.consentimentos, [9000]);
});

test('sem escolha, o m.js carregado não liga o pixel; só o "Aceitar" liga, na hora', () => {
  const p = pagina();
  p.rodarBanner();
  p.fimDoParse();
  p.avancar(2000);
  p.chegaMjs();
  p.avancar(60000);
  assert.deepEqual(p.consentimentos, [], 'nada antes do aceite');
  p.clicar('sim');
  assert.deepEqual(p.consentimentos, [62000]);
});

test('"Recusar" guarda nao e o pixel nunca liga, nem com o m.js na página', () => {
  const p = pagina();
  p.rodarBanner();
  p.fimDoParse();
  p.clicar('nao');
  assert.equal(p.guardado.get('strat_cookies'), 'nao');
  p.avancar(9000);
  p.chegaMjs();
  assert.deepEqual(p.consentimentos, []);
  assert.equal(p.banner(), undefined);
});

test('recusa guardada: sem banner e sem pixel', () => {
  const p = pagina({ escolha: 'nao' });
  p.rodarBanner();
  p.fimDoParse();
  p.chegaMjs();
  assert.equal(p.banner(), undefined);
  assert.deepEqual(p.consentimentos, []);
  assert.equal(p.document.ouvintes('DOMContentLoaded'), 0);
});

test('sem localStorage (aba anônima ou bloqueado): o banner aparece e o "Aceitar" ainda liga o pixel', () => {
  const p = pagina({ semStorage: true });
  p.rodarBanner();
  p.fimDoParse();
  p.clicar('sim');
  p.avancar(10000);
  p.chegaMjs();
  assert.deepEqual(p.consentimentos, [10000]);
});

test('m.js bloqueado (nunca chega): nada liga e nada fica rodando', () => {
  const p = pagina({ escolha: 'sim' });
  p.rodarBanner();
  p.fimDoParse();
  p.avancar(120000);
  p.window.disparar('load');
  assert.deepEqual(p.consentimentos, []);
  assert.equal(p.timers.length, 0);
});
