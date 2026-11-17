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


test('Paint Timing: dois rAF não bastam; inicia só depois do FCP observado',()=>{
  const scripts=[],eventos={};let callback,desconectou=false,opcoes;
  function Observer(cb){callback=cb;this.observe=opts=>{opcoes=opts;};this.disconnect=()=>{desconectou=true;};}
  Observer.supportedEntryTypes=['paint'];
  const w={performance:{getEntriesByType:()=>[]},PerformanceObserver:Observer,requestAnimationFrame:()=>{throw new Error('não deve usar rAF quando Paint Timing existe');}};
  const d={readyState:'complete',visibilityState:'visible',currentScript:{getAttribute:()=>'/sa?product=quaia'},createElement:()=>({}),head:{appendChild:s=>scripts.push(s)},addEventListener:(n,cb)=>{eventos[n]=cb;}};
  runInNewContext(scriptDoRastroAposPintura(),{window:w,document:d});
  assert.equal(scripts.length,0);assert.equal(opcoes.type,'paint');assert.equal(opcoes.buffered,true);
  callback({getEntries:()=>[{name:'first-paint'}]});assert.equal(scripts.length,0);
  callback({getEntries:()=>[{name:'first-contentful-paint'}]});assert.equal(scripts.length,1);assert.equal(desconectou,true);
  callback({getEntries:()=>[{name:'first-contentful-paint'}]});assert.equal(scripts.length,1);
});
test('Paint Timing: FCP já registrado inicia sem esperar outro quadro',()=>{
  const scripts=[];const w={performance:{getEntriesByType:()=>[{name:'first-contentful-paint'}]}};
  const d={readyState:'complete',visibilityState:'visible',currentScript:{getAttribute:()=>'/sa?product=quaia'},createElement:()=>({}),head:{appendChild:s=>scripts.push(s)}};
  runInNewContext(scriptDoRastroAposPintura(),{window:w,document:d});assert.equal(scripts.length,1);
});


test('Paint Timing anunciado mas incompatível cai nos quadros, sem perder o Rastro',()=>{
  const scripts=[],quadros=[];
  function Observer(){this.observe=()=>{throw new TypeError('buffered indisponível');};this.disconnect=()=>{};}
  Observer.supportedEntryTypes=['paint'];
  const w={PerformanceObserver:Observer,performance:{getEntriesByType:()=>[]},requestAnimationFrame:cb=>quadros.push(cb)};
  const d={readyState:'complete',visibilityState:'visible',currentScript:{getAttribute:()=>'/sa?product=quaia'},createElement:()=>({}),head:{appendChild:s=>scripts.push(s)},addEventListener:()=>{}};
  runInNewContext(scriptDoRastroAposPintura(),{window:w,document:d});assert.equal(scripts.length,0);
  quadros.shift()();quadros.shift()();assert.equal(scripts.length,1);
});


test('a primeira dobra espera fontes e a imagem de preload da mídia ativa antes dos quadros',async()=>{
  const scripts=[],quadros=[],urls=[];let resolverFonte,resolverImagem;
  const fonte=new Promise(ok=>{resolverFonte=ok;});const imagem=new Promise(ok=>{resolverImagem=ok;});
  function Img(){Object.defineProperty(this,'src',{set:u=>urls.push(u)});this.decode=()=>imagem;}
  const w={Image:Img,matchMedia:q=>({matches:q==='mobile'}),requestAnimationFrame:cb=>quadros.push(cb),performance:{getEntriesByType:()=>[{name:'first-contentful-paint'}]}};
  const d={readyState:'complete',visibilityState:'visible',fonts:{ready:fonte},querySelectorAll:q=>q.startsWith('link')?[{media:'mobile',href:'/hero-mobile.webp'},{media:'desktop',href:'/hero.webp'}]:[],currentScript:{getAttribute:()=>'/sa?product=quaia'},createElement:()=>({}),head:{appendChild:s=>scripts.push(s)}};
  runInNewContext(scriptDoRastroAposPintura(),{window:w,document:d});assert.deepEqual(urls,['/hero-mobile.webp']);assert.equal(scripts.length,0);
  resolverFonte();await new Promise(ok=>setImmediate(ok));assert.equal(quadros.length,0);
  resolverImagem();await new Promise(ok=>setImmediate(ok));assert.equal(quadros.length,1);
  quadros.shift()();assert.equal(scripts.length,0);quadros.shift()();assert.equal(scripts.length,1);
});
