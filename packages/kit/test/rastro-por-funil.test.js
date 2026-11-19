// Rastro por funil do kit (rastro-por-funil.js) num navegador simulado com relógio de mentira: o mesmo texto que o
// <Tracking> põe no <script> inline roda aqui. Regras (WEB-106, iguais às da comunidade até ali): ?f= com chave do
// registro liga o /sa do produto do funil e dispara um CompleteRegistration por sessão; sem ?f= ou com chave fora do
// registro, nada carrega e nenhum evento sai.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { scriptDoPorFunil, RASTRO } from '../src/index.js';

const fonte = readFileSync(new URL('../src/rastro-por-funil.js', import.meta.url), 'utf8');
const FUNIS = { vibecode: 'aula-claude-code', 'bootcamp-0808': 'bootcamp-0808' };

// Página com a query `busca`. `sessao` é o sessionStorage (Map) e sobrevive entre aberturas para simular o refresh.
function abrir(busca, { sessao = new Map(), semStorage = false, funis = FUNIS } = {}) {
  let agora = 0;
  let timers = [];
  const eventos = [];
  const head = { filhos: [], appendChild(el) { this.filhos.push(el); } };
  const window = {
    URLSearchParams,
    location: { search: busca },
    sessionStorage: semStorage
      ? { getItem() { throw new Error('bloqueado'); }, setItem() { throw new Error('bloqueado'); } }
      : { getItem: (k) => (sessao.has(k) ? sessao.get(k) : null), setItem: (k, v) => sessao.set(k, String(v)) },
    setInterval(fn, ms) { const t = { fn, ms, prox: agora + ms, vivo: true }; timers.push(t); return t; },
    clearInterval(t) { t.vivo = false; },
  };
  const document = { head, createElement: (tag) => ({ tag }) };
  vm.runInNewContext(scriptDoPorFunil(fonte, funis), { window, document });
  return {
    window,
    sessao,
    eventos,
    scripts: () => head.filhos.filter((e) => e.tag === 'script').map((e) => ({ src: e.src, defer: e.defer })),
    // O /sa terminou de rodar: o Rastro põe o window.stratTrack.
    rastroCarregou() { window.stratTrack = (nome, dados) => eventos.push([nome, JSON.parse(JSON.stringify(dados))]); },
    passar(ms) {
      const ate = agora + ms;
      for (;;) {
        const t = timers.filter((x) => x.vivo).sort((a, b) => a.prox - b.prox)[0];
        if (!t || t.prox > ate) break;
        agora = t.prox;
        t.prox += t.ms;
        t.fn();
      }
      agora = ate;
      timers = timers.filter((x) => x.vivo);
    },
    timersVivos: () => timers.filter((x) => x.vivo).length,
  };
}

test('?f=vibecode liga o /sa do aula-claude-code e dispara um CompleteRegistration com produto e funil', () => {
  const p = abrir('?f=vibecode&utm_source=teste');
  assert.deepEqual(p.scripts(), [{ src: `${RASTRO}?product=aula-claude-code`, defer: true }]);
  p.passar(450);
  assert.deepEqual(p.eventos, [], 'antes do Rastro rodar, nada sai');
  p.rastroCarregou();
  p.passar(150);
  assert.deepEqual(p.eventos, [['CompleteRegistration', { product: 'aula-claude-code', funil: 'vibecode' }]]);
  assert.equal(p.sessao.get('strat_cr_aula-claude-code'), '1');
  p.passar(10000);
  assert.equal(p.eventos.length, 1, 'uma vez só');
  assert.equal(p.timersVivos(), 0);
});

test('a chave do ?f= vale em maiúsculas e com espaço nas pontas (como a página fazia)', () => {
  const p = abrir('?f=%20Bootcamp-0808%20');
  assert.deepEqual(p.scripts(), [{ src: `${RASTRO}?product=bootcamp-0808`, defer: true }]);
  p.rastroCarregou();
  p.passar(150);
  assert.deepEqual(p.eventos, [['CompleteRegistration', { product: 'bootcamp-0808', funil: 'bootcamp-0808' }]]);
});

test('sem ?f=, ?f= vazio ou chave fora do registro: nenhum Rastro e nenhum evento', () => {
  for (const busca of ['', '?utm_source=teste', '?f=', '?f=imersao', '?f=default', '?f=constructor', '?f=__proto__', '?f=toString', '?f=hasOwnProperty']) {
    const p = abrir(busca);
    p.rastroCarregou();
    p.passar(10000);
    assert.deepEqual(p.scripts(), [], busca);
    assert.deepEqual(p.eventos, [], busca);
    assert.equal(p.timersVivos(), 0, busca);
  }
});

test('refresh na mesma sessão liga o Rastro de novo, mas não conta o CompleteRegistration de novo', () => {
  const sessao = new Map();
  const primeira = abrir('?f=vibecode', { sessao });
  primeira.rastroCarregou();
  primeira.passar(150);
  const segunda = abrir('?f=vibecode', { sessao });
  assert.equal(segunda.scripts().length, 1);
  segunda.rastroCarregou();
  segunda.passar(10000);
  assert.deepEqual(segunda.eventos, []);
  // Outro funil na mesma sessão conta (a guarda é por produto).
  const outro = abrir('?f=bootcamp-0808', { sessao });
  outro.rastroCarregou();
  outro.passar(150);
  assert.equal(outro.eventos.length, 1);
});

test('Rastro bloqueado: desiste depois de ~6 s sem erro e sem evento', () => {
  const p = abrir('?f=vibecode');
  p.passar(6150);
  assert.equal(p.timersVivos(), 0);
  p.rastroCarregou();
  p.passar(1000);
  assert.deepEqual(p.eventos, []);
});

test('sessionStorage bloqueado (aba anônima, política do navegador): o Rastro liga e o evento sai mesmo assim', () => {
  const p = abrir('?f=vibecode', { semStorage: true });
  assert.equal(p.scripts().length, 1);
  p.rastroCarregou();
  p.passar(150);
  assert.deepEqual(p.eventos, [['CompleteRegistration', { product: 'aula-claude-code', funil: 'vibecode' }]]);
});
