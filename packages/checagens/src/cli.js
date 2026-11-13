#!/usr/bin/env node
// Roda as checagens sobre o dist/ dos apps (depois do `pnpm build`). Sai com 1 se alguma barrar.
//
//   node packages/checagens/src/cli.js                 # seo, tracking, links, peso e catalogo
//   node packages/checagens/src/cli.js seo links       # só as pedidas
//   ... --app apps/stratai                             # só um app (pode repetir)
//   ... --sem-rede                                     # não pergunta ao Rastro se o slug existe
//   ... --sem-lighthouse                               # peso só pelos bytes (rápido, para o dia a dia)
//
// A checagem "build" é o próprio `pnpm build` mais os testes dos pacotes (`pnpm -r test`).
import { checarApps, montarContexto } from './contexto.js';
import { checarCatalogo } from './catalogo.js';
import { checarLinks } from './links.js';
import { checarPeso } from './peso.js';
import { checarSeo } from './seo.js';
import { checarTracking } from './tracking.js';

const CHECAGENS = {
  seo: (ctx) => checarSeo(ctx),
  tracking: (ctx, o) => checarTracking(ctx, o),
  links: (ctx) => checarLinks(ctx),
  peso: (ctx, o) => checarPeso(ctx, o),
  catalogo: (ctx) => checarCatalogo(ctx),
};

const args = process.argv.slice(2);
const apps = [];
const nomes = [];
const opcoes = { semRede: false, semLighthouse: false, log: (t) => console.log(`  ${t}`) };
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  if (a === '--app') apps.push(args[++i]);
  else if (a === '--sem-rede') opcoes.semRede = true;
  else if (a === '--sem-lighthouse') opcoes.semLighthouse = true;
  else if (CHECAGENS[a]) nomes.push(a);
  else {
    console.error(`checagem desconhecida: ${a}. Use: ${Object.keys(CHECAGENS).join(', ')}`);
    process.exit(2);
  }
}

const ctx = montarContexto({ apps });

const anotacao = process.env.GITHUB_ACTIONS === 'true';
const rel = (t) => String(t).replaceAll(`${ctx.raiz}/`, '');
let falhou = false;

function relatar(nome, r) {
  for (const a of r.avisos) {
    console.log(`  aviso  ${rel(a.onde)}: ${rel(a.msg)}`);
    if (anotacao) console.log(`::warning title=${nome}::${rel(a.onde)}: ${rel(a.msg)}`);
  }
  for (const e of r.erros) {
    console.log(`  ERRO   ${rel(e.onde)}: ${rel(e.msg)}`);
    if (anotacao) console.log(`::error title=${nome}::${rel(e.onde)}: ${rel(e.msg)}`);
  }
  console.log(r.erros.length ? `  ✗ ${nome}: ${r.erros.length} erro(s)` : `  ✓ ${nome}`);
  if (r.erros.length) falhou = true;
}

// Antes das checagens: todo app pedido tem de ter dist/. App pulado em silêncio daria falso verde (WEB-76).
const semDist = checarApps(ctx);
if (semDist.erros.length) {
  console.log('\n▸ apps');
  relatar('apps', semDist);
}
if (!ctx.apps.length) {
  console.error('nenhum app com dist/: rode `pnpm build` antes');
  process.exit(2);
}

for (const nome of nomes.length ? nomes : Object.keys(CHECAGENS)) {
  console.log(`\n▸ ${nome}`);
  relatar(nome, await CHECAGENS[nome](ctx, opcoes));
}
process.exit(falhou ? 1 : 0);
