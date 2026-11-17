// As variantes antigas têm funis diferentes. Uma migração não pode reuni-las no mesmo produto por engano.
import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import {join,dirname,posix} from 'node:path';
const APP=join(dirname(fileURLToPath(import.meta.url)),'..');
const rotas=JSON.parse(readFileSync(join(APP,'migracao.json'),'utf8'));
const catalogo=JSON.parse(readFileSync(join(APP,'../../../catalogo/sites.json'),'utf8'));
test('as 24 rotas antigas continuam com entrada e fragmentos, incluindo grupo e ofertas posteriores',()=>{
 assert.equal(rotas.length,24);
 for(const r of rotas){
  assert.ok(existsSync(join(APP,'src/pages',r.caminho,'index.astro')),r.caminho);
  for(const tipo of ['head','corpo'])assert.ok(existsSync(join(APP,'src/html',`${r.fragmento}.${tipo}.html`)),r.caminho);
 }
 for(const caminho of ['/0808-v1/grupo/','/upsell-imediato/','/downsell-imediato/','/m/','/strat/'])assert.ok(rotas.some(r=>r.caminho===caminho));
});
test('cada rota preserva o funil, workspace e perfil da origem no catálogo; só a principal é indexável',()=>{
 for(const r of rotas){
  const c=catalogo.urls.find(c=>c.url==='https://bootcamp.stratacademy.com.br'+r.caminho);
  assert.ok(c,r.caminho);assert.equal(c.rastro_slug,r.rastro_slug);assert.equal(c.metricaas_ws,r.metricaas_ws);assert.equal(c.perfil,r.perfil);assert.equal(c.indexar,r.caminho==='/');
 }
 assert.equal(rotas.find(r=>r.caminho==='/strat/').rastro_slug,'bootcamp-strat');
 assert.equal(rotas.find(r=>r.caminho==='/0808-v2-lote01/').metricaas_ws,'vinicius-rocha-strat-ai');
});
test('nenhuma cópia manual do tracking nem de tags de SEO geradas pelo kit',()=>{
 for(const r of rotas){
  for(const tipo of ['head','corpo']){
   const texto=readFileSync(join(APP,'src/html',`${r.fragmento}.${tipo}.html`),'utf8');
   assert.doesNotMatch(texto,/<script\b[^>]*(?:tracking\.stratacademy|t\.metricaas|hotmart_launcher)|\bfbq\s*\(|\bgtag\s*\(/);
   if(tipo==='head')assert.doesNotMatch(texto,/<title>|name="(?:description|robots|viewport)"|rel="canonical"|property="og:/);
  }
 }
});
test('todos os recursos locais citados pelos fragmentos existem no caminho da rota',()=>{
 for(const r of rotas){
  const texto=['head','corpo'].map(t=>readFileSync(join(APP,'src/html',`${r.fragmento}.${t}.html`),'utf8')).join('').replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
  const urls=[...[...texto.matchAll(/(?:src|poster|data-thumb)="([^"]+)"/g)].map(m=>m[1]),...[...texto.matchAll(/url\(['"]?([^'")]+)/g)].map(m=>m[1])];
  for(const u of urls){if(/^(https?:|data:|#|\/\/|%23)/.test(u))continue;const p=posix.normalize(u.startsWith('/')?u:posix.join(r.caminho,u)).split(/[?#]/)[0];assert.ok(existsSync(join(APP,'public',p)),r.caminho+': '+u);}
 }
});
