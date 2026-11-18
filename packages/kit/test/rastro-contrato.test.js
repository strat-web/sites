// Contrato do launcher da Hotmart (venda + banner, WEB-85) com o Rastro: o window.stratConsent é interno do Rastro, e o
// scriptDoLauncher depende de quatro pontos dele (ver o comentário CONTRATO COM O RASTRO em src/tracking.js). Pedido do
// Helbert na revisão do #38 (18/11/2026).
//
// TRECHOS abaixo são cópia literal do script do Rastro no ar (tracking.stratacademy.com.br/sa?product=site, lido em
// 18/11/2026). Dois testes os usam:
// - offline: o launcher roda com o código de verdade do Rastro (os trechos), não com um Rastro de mentira;
// - ao vivo: baixa o script do Rastro e confere que cada trecho continua lá (espaços à parte). Se o Rastro mudar, este
//   teste fica vermelho: confira o launcher, atualize os trechos e a data. Sem rede, ele é pulado (não é falso verde:
//   o pulo aparece na saída do node --test).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { scriptDoLauncher, RASTRO } from '../src/index.js';

const CONTA = '6f2c2394-9d1b-3999-9a14-087cfe3fd764';
const LAUNCHER = '//launcher.hotmart.com/launcher.js';

const TRECHOS = {
  // 3. a chave e o valor do aceite guardado (o launcher lê strat_consent === 'granted' na próxima visita)
  chave: "var CK='strat_consent'",
  // 1 e 3. objeto comum com grant e deny; o grant guarda granted e chama o loadMarketing
  objeto:
    "window.stratConsent={status:st,\n" +
    "    grant:function(){try{localStorage.setItem(CK,'granted')}catch(e){}loadMarketing();hideBanner()},\n" +
    "    deny:function(){try{localStorage.setItem(CK,'denied')}catch(e){}stopMarketing();hideBanner()}};",
  // 2. o clique busca window.stratConsent.grant na hora (por isso o grant embrulhado pelo launcher vale)
  clique: 'no.onclick=function(){window.stratConsent.deny()};yes.onclick=function(){window.stratConsent.grant()};',
  // 4. o Rastro não duplica o launcher quando o kit já criou o window.hot
  semDuplicar: 'function loadHotmart(){if(window.__hotInit||window.hot||!CFG.salesPage)return;',
};

const normal = (s) => s.replace(/\s+/g, ' ').trim();

// Página com o <script defer> do Rastro no DOM: o launcher roda no parse do <head>; o Rastro roda depois, com os trechos
// de verdade, e monta o aviso com os dois botões.
function pagina({ escolha = null } = {}) {
  const inseridos = [];
  const marketing = [];
  const guardado = new Map(escolha ? [['strat_consent', escolha]] : []);
  const ouvintes = {};
  const alvo = (o) => {
    o.addEventListener = (tipo, fn) => (ouvintes[tipo] ||= []).push(fn);
    return o;
  };
  const rastro = { src: `${RASTRO}?product=site`, addEventListener: () => {} };
  const cabeca = { insertBefore: (el) => inseridos.push(el.src) };
  const document = alvo({
    createElement: () => ({}),
    getElementsByTagName: () => [{ parentNode: cabeca }],
    querySelector: (sel) => (sel === `script[src^="${RASTRO}"]` ? rastro : null),
  });
  const window = {
    localStorage: { getItem: (k) => guardado.get(k) ?? null, setItem: (k, v) => guardado.set(k, String(v)) },
  };
  window.window = window;
  window.document = document;
  const ctx = vm.createContext(window);
  const botoes = { no: {}, yes: {} };
  return {
    window, inseridos, marketing, guardado, botoes,
    rodarLauncher() { vm.runInContext(scriptDoLauncher(CONTA, { aposAceite: true }), ctx); },
    // O Rastro roda: os trechos copiados, com o resto do script (st, loadMarketing, hideBanner) reduzido ao mínimo.
    // O loadMarketing chama o loadHotmart, que só registra se carregaria um segundo launcher.
    chegaRastro() {
      Object.assign(ctx, botoes, {
        CFG: { salesPage: true },
        st: () => guardado.get('strat_consent') || 'unset',
        hideBanner: () => {},
        stopMarketing: () => marketing.push('stopMarketing'),
      });
      vm.runInContext(
        `${TRECHOS.chave};\n${TRECHOS.semDuplicar}window.__marketing.push('Hotmart do Rastro')}\n` +
          `function loadMarketing(){window.__marketing.push('loadMarketing');loadHotmart()}\n` +
          `${TRECHOS.objeto}\n${TRECHOS.clique}`,
        Object.assign(ctx, { __marketing: marketing }),
      );
      (ouvintes.DOMContentLoaded || []).forEach((fn) => fn({}));
    },
  };
}

test('contrato com o Rastro (trechos de 18/11): o "aceitar" carrega o launcher do kit antes do loadMarketing, sem duplicar', () => {
  const p = pagina();
  p.rodarLauncher();
  p.chegaRastro();
  assert.deepEqual(p.inseridos, [], 'nada da Hotmart antes do aceite');
  p.botoes.yes.onclick();
  assert.deepEqual(p.inseridos, [LAUNCHER], 'o grant embrulhado carregou o launcher do kit');
  assert.deepEqual(p.marketing, ['loadMarketing'], 'o Rastro seguiu e não carregou um segundo launcher');
  assert.equal(p.guardado.get('strat_consent'), 'granted', 'o grant do Rastro gravou o aceite');
});

test('contrato com o Rastro: o aceite que ele grava é o que o launcher lê na visita seguinte', () => {
  const primeira = pagina();
  primeira.rodarLauncher();
  primeira.chegaRastro();
  primeira.botoes.yes.onclick();
  const seguinte = pagina({ escolha: primeira.guardado.get('strat_consent') });
  seguinte.rodarLauncher();
  assert.deepEqual(seguinte.inseridos, [LAUNCHER], 'carrega no parse do <head>, antes do Rastro');
});

test('contrato com o Rastro: o "recusar" não carrega nada da Hotmart', () => {
  const p = pagina();
  p.rodarLauncher();
  p.chegaRastro();
  p.botoes.no.onclick();
  assert.deepEqual(p.inseridos, []);
  assert.equal(p.guardado.get('strat_consent'), 'denied');
});

test('contrato com o Rastro ao vivo: os trechos que o launcher usa continuam no script do Rastro', async (t) => {
  let fonte;
  try {
    const r = await fetch(`${RASTRO}?product=site`, { signal: AbortSignal.timeout(10000) });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    fonte = await r.text();
  } catch (e) {
    t.skip(`sem acesso ao Rastro (${e.message}); rode de novo com rede`);
    return;
  }
  const vivo = normal(fonte);
  for (const [nome, trecho] of Object.entries(TRECHOS)) {
    assert.ok(
      vivo.includes(normal(trecho)),
      `o trecho "${nome}" mudou no Rastro: confira o scriptDoLauncher (src/tracking.js) e atualize TRECHOS`,
    );
  }
});
