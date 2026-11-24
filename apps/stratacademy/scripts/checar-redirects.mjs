/**
 * Confere, contra um host real, que cada redirect do public/_redirects funciona.
 *
 * POR QUE ISTO EXISTE
 * A suíte local conferia se o DESTINO de cada regra existia no build. Não
 * conferia se a ORIGEM casava — e no Cloudflare Pages `/loja` e `/loja/` são
 * caminhos distintos. Resultado: depois do cutover, 25 das 31 regras davam 404
 * na forma com barra, que é a forma do WordPress, dos links antigos e do que o
 * Google tinha indexado. O build passava verde o tempo todo.
 *
 * O _redirects só existe no runtime do Pages — `astro dev` e `astro build` não o
 * executam. Então isto só pode rodar contra um host de verdade.
 *
 * O QUE FAZ
 * Para cada regra, requisita a origem NAS DUAS FORMAS (sem e com barra final),
 * sem seguir redirect, e falha se alguma não devolver o status declarado (301)
 * com `Location` apontando para o destino declarado.
 *
 * QUANDO RODAR
 *   - contra o PREVIEW, antes de pedir merge de qualquer PR que mexa no _redirects;
 *   - contra o DOMÍNIO REAL, depois de cada deploy que mexer no _redirects.
 *
 * Uso:
 *   pnpm --filter stratacademy redirects:checar -- https://stratacademy.com.br
 *   pnpm --filter stratacademy redirects:checar -- https://<id>.stratacademy.pages.dev
 *
 * Sai com código 1 se qualquer verificação falhar, para servir de trava em CI.
 */
import { readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const ARQUIVO = join(AQUI, '../public/_redirects');
const CONCORRENCIA = 6; // educado com o próprio site, e rápido o bastante
const TIMEOUT_MS = 15_000;

// ---------- host ----------
const arg = process.argv.slice(2).find((a) => !a.startsWith('-'));
if (!arg) {
  console.error('Falta o host.\nEx.: pnpm --filter stratacademy redirects:checar -- https://stratacademy.com.br');
  process.exit(2);
}
let host;
try {
  host = new URL(arg).origin;
} catch {
  console.error(`Host inválido: ${arg}`);
  process.exit(2);
}

// ---------- regras ----------
const RE = /^(\S+)\s+(\S+)\s+(\d{3})\s*$/;
const regras = (await readFile(ARQUIVO, 'utf8'))
  .split('\n')
  .map((l, i) => {
    const m = l.trim().match(RE);
    return m && !m[1].startsWith('#') ? { origem: m[1], destino: m[2], status: Number(m[3]), linha: i + 1 } : null;
  })
  .filter(Boolean);

const alterna = (o) => (o.endsWith('/') && o.length > 1 ? o.slice(0, -1) : `${o}/`);

// Cada caminho a testar, com o que se espera dele. Um caminho aparece uma vez só
// — a regra explícita dele manda; a forma alternada herda da irmã.
const esperado = new Map();
const conflitos = [];
for (const r of regras) {
  esperado.set(r.origem, { ...r, explicita: true });
}
for (const r of regras) {
  const alt = alterna(r.origem);
  const ja = esperado.get(alt);
  if (!ja) {
    // A irmã não tem regra própria: a forma alternada TEM que funcionar mesmo
    // assim, e é exatamente isso que o teste vai flagrar se não funcionar.
    esperado.set(alt, { ...r, origem: alt, explicita: false, irmaDe: r.origem });
  } else if (ja.explicita && (ja.destino !== r.destino || ja.status !== r.status)) {
    conflitos.push(`${r.origem} -> ${r.destino} mas ${alt} -> ${ja.destino}`);
  }
}

// ---------- requisição ----------
const absoluto = (u) => new URL(u, host).href;

async function checar(caminho, exp) {
  const url = host + caminho;
  try {
    const r = await fetch(url, {
      method: 'HEAD',
      redirect: 'manual', // queremos o 301, não para onde ele leva
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { 'User-Agent': 'strat-checar-redirects/1.0' },
    });
    const loc = r.headers.get('location');
    const statusOk = r.status === exp.status;
    const destinoOk = loc !== null && absoluto(loc) === absoluto(exp.destino);
    return { caminho, exp, status: r.status, loc, ok: statusOk && destinoOk };
  } catch (e) {
    return { caminho, exp, status: 'ERRO', loc: e.message, ok: false };
  }
}

async function emLotes(itens, n, fn) {
  const saida = [];
  for (let i = 0; i < itens.length; i += n) {
    saida.push(...(await Promise.all(itens.slice(i, i + n).map(fn))));
  }
  return saida;
}

// ---------- execução ----------
console.log(`\nHost:    ${host}`);
console.log(`Arquivo: public/_redirects — ${regras.length} regras, ${esperado.size} caminhos a testar\n`);

if (conflitos.length) {
  console.log('CONFLITO no próprio arquivo — as duas formas apontam para lugares diferentes:');
  conflitos.forEach((c) => console.log(`  ${c}`));
  console.log();
}

const resultados = await emLotes([...esperado], CONCORRENCIA, ([c, exp]) => checar(c, exp));
resultados.sort((a, b) => a.exp.linha - b.exp.linha || a.caminho.localeCompare(b.caminho));

const falhas = resultados.filter((r) => !r.ok);
const larg = Math.min(72, Math.max(...resultados.map((r) => r.caminho.length)));
// Corta pelo MEIO, nunca pelo fim: o fim é onde mora a barra final, que é a
// única diferença entre as duas formas de uma mesma origem. Cortar o fim deixava
// `/2026/.../slug/` e `/2026/.../slug` idênticos na tela.
const encurta = (c) => {
  if (c.length <= larg) return c.padEnd(larg);
  const fim = 18;
  return c.slice(0, larg - fim - 1) + '…' + c.slice(-fim);
};
for (const r of resultados) {
  const marca = r.ok ? 'ok ' : 'FALHA';
  const onde = encurta(r.caminho);
  const obs = r.exp.explicita ? '' : '  (sem regra própria)';
  const det = r.ok
    ? `${r.status} -> ${r.exp.destino}`
    : `esperava ${r.exp.status} -> ${r.exp.destino} | veio ${r.status}${r.loc ? ` -> ${r.loc}` : ''}`;
  console.log(`  ${marca}  ${onde}  ${det}${obs}`);
}

console.log(`\n${resultados.length - falhas.length}/${resultados.length} caminhos ok`);
if (falhas.length || conflitos.length) {
  console.log(`\nFALHOU: ${falhas.length} caminho(s) sem o 301 declarado${conflitos.length ? `, ${conflitos.length} conflito(s) no arquivo` : ''}.`);
  process.exit(1);
}
console.log('\nTodas as origens, nas duas formas, dão 301 para o destino declarado.');
