import {test} from 'node:test';
import assert from 'node:assert/strict';
import {runInNewContext} from 'node:vm';
import {scriptDoRastroAposPintura} from '../src/rastro-apos-pintura.js';

function cenario({readyState='loading',visibilityState='visible',raf=true}={}) {
  const quadros=[],eventos={},scripts=[];
  const d={readyState,visibilityState,currentScript:{getAttribute:()=> 'https://tracking.stratacademy.com.br/sa?product=quaia'},createElement:()=>({}),head:{appendChild:s=>scripts.push(s)},addEventListener:(nome,fn)=>{eventos[nome]=fn;}};
  const w=raf?{requestAnimationFrame:fn=>quadros.push(fn)}:{};
  runInNewContext(scriptDoRastroAposPintura(),{window:w,document:d});
  return {quadros,eventos,scripts};
}
test('não inicia a rede antes de o documento estar pronto e passar por dois quadros',()=>{
  const c=cenario();assert.equal(c.scripts.length,0);assert.equal(c.quadros.length,0);
  c.eventos.DOMContentLoaded();assert.equal(c.scripts.length,0);
  c.quadros.shift()();assert.equal(c.scripts.length,0);
  c.quadros.shift()();assert.equal(c.scripts.length,1);
  assert.equal(c.scripts[0].src,'https://tracking.stratacademy.com.br/sa?product=quaia');
  assert.equal(c.scripts[0].async,false);
});
test('o carregador que entra depois do DOMContentLoaded também espera os quadros',()=>{
  const c=cenario({readyState:'interactive'});assert.equal(c.quadros.length,1);
  c.quadros.shift()();c.quadros.shift()();assert.equal(c.scripts.length,1);
});
test('aba oculta e navegador sem rAF não perdem a visita esperando um quadro que não vem',()=>{
  for(const op of [{visibilityState:'hidden'},{raf:false}]){
    const c=cenario({...op,readyState:'complete'});assert.equal(c.scripts.length,1);assert.equal(c.quadros.length,0);
  }
});
test('callbacks repetidos não instalam dois Rastros',()=>{
  const c=cenario();c.eventos.DOMContentLoaded();c.eventos.DOMContentLoaded();
  while(c.quadros.length)c.quadros.shift()();assert.equal(c.scripts.length,1);
});
