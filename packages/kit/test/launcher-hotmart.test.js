// Launcher da Hotmart do <Tracking> (scriptDoLauncher) num DOM simulado: o mesmo texto que vai no <script> inline roda
// aqui, e o Rastro chega quando o teste manda (em venda, depois do primeiro quadro, pelo carregador do WEB-104). Regra do WEB-85: em venda + banner (Rastro em strict), nada da
// Hotmart carrega antes do "aceitar"; em soft e off, carrega na abertura.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { scriptDoLauncher, RASTRO } from '../src/index.js';

const CONTA = '6f2c2394-9d1b-3999-9a14-087cfe3fd764';
const LAUNCHER = '//launcher.hotmart.com/launcher.js';

function alvo(obj = {}) {
  const ouvintes = {};
  obj.addEventListener = (tipo, fn) => (ouvintes[tipo] ||= []).push(fn);
  obj.disparar = (tipo, ev = {}) => (ouvintes[tipo] || []).slice().forEach((fn) => fn(ev));
  return obj;
}

// Página no meio do parse do <head>: o Rastro ainda não rodou. `escolha` é o que está guardado em strat_consent
// (granted, denied ou nada).
function pagina({ escolha = null, semStorage = false } = {}) {
  const inseridos = [];
  const chamadasDoRastro = [];
  const cabeca = { insertBefore: (el) => inseridos.push(el.src) };
  const document = alvo({
    createElement: () => ({}),
    getElementsByTagName: () => [{ parentNode: cabeca }],
  });
  const window = alvo({
    localStorage: {
      getItem: (k) => {
        if (semStorage) throw new Error('SecurityError');
        return k === 'strat_consent' ? escolha : null;
      },
    },
  });
  window.window = window;
  window.document = document;
  const ctx = vm.createContext(window);
  return {
    window, inseridos, chamadasDoRastro,
    rodar(aposAceite) { vm.runInContext(scriptDoLauncher(CONTA, { aposAceite }), ctx); },
    // Um <script> qualquer da página termina de carregar: o "load" chega ao document na fase de captura.
    carregaScript() { document.disparar('load', { target: { tagName: 'SCRIPT' } }); },
    // O Rastro roda: cria o window.stratConsent como o de verdade (o grant guarda granted e chama o loadMarketing, que
    // pula o launcher quando já existe window.hot), e o <script> dele dispara "load". Com `aposPintura` (venda, WEB-104)
    // o DOMContentLoaded já passou quando ele chega; sem, ele roda antes do DOMContentLoaded (defer).
    chegaRastro({ aposPintura = false } = {}) {
      if (aposPintura) document.disparar('DOMContentLoaded');
      window.stratConsent = {
        grant() { chamadasDoRastro.push(window.hot ? 'grant (hot já existe: não duplica)' : 'grant (carregaria a Hotmart do Rastro)'); },
        deny() { chamadasDoRastro.push('deny'); },
      };
      if (!aposPintura) document.disparar('DOMContentLoaded');
      this.carregaScript();
    },
    // O "aceitar" do aviso do Rastro: no.onclick = function(){ window.stratConsent.grant() }.
    aceitar() { window.stratConsent.grant(); },
    recusar() { window.stratConsent.deny(); },
    contaDaHotmart: () => JSON.parse(JSON.stringify((window.hot?.q || []).map((a) => [...a]))),
  };
}

test('soft e off: o launcher carrega na abertura, com a conta do catálogo (como antes do WEB-85)', () => {
  const p = pagina();
  p.rodar(false);
  assert.deepEqual(p.inseridos, [LAUNCHER]);
  assert.deepEqual(p.contaDaHotmart(), [['account', CONTA]]);
});

test('banner sem escolha: nada da Hotmart antes do aceite; o "aceitar" carrega o launcher antes do Rastro', () => {
  const p = pagina();
  p.rodar(true);
  assert.deepEqual(p.inseridos, [], 'nada no parse');
  assert.equal(p.window.hot, undefined);
  p.chegaRastro();
  assert.deepEqual(p.inseridos, [], 'nada com o Rastro na página');
  p.aceitar();
  assert.deepEqual(p.inseridos, [LAUNCHER], 'uma vez, depois do aceite');
  assert.deepEqual(p.contaDaHotmart(), [['account', CONTA]]);
  assert.deepEqual(p.chamadasDoRastro, ['grant (hot já existe: não duplica)'], 'o Rastro roda o grant dele depois');
});

test('banner: o DOMContentLoaded e o load do Rastro embrulham o grant uma vez só', () => {
  const p = pagina();
  p.rodar(true);
  p.chegaRastro();
  p.window.document.disparar('DOMContentLoaded');
  p.aceitar();
  p.aceitar();
  assert.deepEqual(p.inseridos, [LAUNCHER]);
  assert.equal(p.chamadasDoRastro.length, 2, 'o grant original roda a cada chamada');
});

test('venda + banner (carregador do WEB-104): o Rastro entra depois do DOMContentLoaded e o "aceitar" carrega o launcher do kit', () => {
  const p = pagina();
  p.rodar(true);
  p.window.document.disparar('DOMContentLoaded');
  p.carregaScript();
  assert.equal(p.window.stratConsent, undefined, 'o DOMContentLoaded e outro <script> passaram sem o Rastro');
  p.chegaRastro({ aposPintura: true });
  assert.deepEqual(p.inseridos, [], 'nada antes do aceite');
  p.aceitar();
  assert.deepEqual(p.inseridos, [LAUNCHER], 'o grant foi embrulhado no load do <script> inserido pelo carregador');
  assert.deepEqual(p.contaDaHotmart(), [['account', CONTA]], 'a conta do catálogo, não a do produto no Rastro');
  assert.deepEqual(p.chamadasDoRastro, ['grant (hot já existe: não duplica)']);
});

test('banner com aceite guardado: o launcher carrega no parse, antes do Rastro', () => {
  const p = pagina({ escolha: 'granted' });
  p.rodar(true);
  assert.deepEqual(p.inseridos, [LAUNCHER]);
  p.chegaRastro();
  assert.deepEqual(p.inseridos, [LAUNCHER], 'não duplica');
});

test('banner com recusa (guardada ou no clique): a Hotmart nunca carrega', () => {
  const guardada = pagina({ escolha: 'denied' });
  guardada.rodar(true);
  guardada.chegaRastro();
  assert.deepEqual(guardada.inseridos, []);
  const clique = pagina();
  clique.rodar(true);
  clique.chegaRastro();
  clique.recusar();
  assert.deepEqual(clique.inseridos, []);
  assert.equal(clique.window.hot, undefined);
});

test('banner com o Rastro bloqueado ou sem localStorage: sem aviso, sem aceite e sem Hotmart', () => {
  const bloqueado = pagina();
  bloqueado.rodar(true);
  bloqueado.window.document.disparar('DOMContentLoaded');
  assert.deepEqual(bloqueado.inseridos, []);
  const semStorage = pagina({ semStorage: true });
  semStorage.rodar(true);
  semStorage.chegaRastro();
  assert.deepEqual(semStorage.inseridos, []);
  semStorage.aceitar();
  assert.deepEqual(semStorage.inseridos, [LAUNCHER], 'o clique no aceitar ainda carrega');
});

test('o texto do launcher: a URL e a conta escritas no HTML (verificação da Hotmart) nos dois modos', () => {
  for (const aposAceite of [false, true]) {
    const s = scriptDoLauncher(CONTA, { aposAceite });
    assert.ok(s.includes(`'${LAUNCHER}','hot'`), String(aposAceite));
    assert.ok(s.includes(`hot('account','${CONTA}')`), String(aposAceite));
  }
  assert.match(scriptDoLauncher(CONTA, { aposAceite: true }), /strat_consent/);
  // A checagem tracking barra inline com o endereço do Rastro fora do kit (WEB-106): o launcher não o escreve.
  assert.ok(!scriptDoLauncher(CONTA, { aposAceite: true }).includes(new URL(RASTRO).host));
  assert.doesNotMatch(scriptDoLauncher(CONTA), /strat_consent/);
});
