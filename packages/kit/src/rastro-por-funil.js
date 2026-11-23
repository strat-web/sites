// Rastro por funil (consentimento "por-funil" no catálogo, T5; WEB-106). A página é de vários funis, que chegam pela
// URL com ?f=<chave>: o funil escolhe de quem é a conversão. Com uma chave do registro `funis` da linha do catálogo, o
// script liga o /sa do produto daquele funil (o consentimento é o do produto no Rastro: soft mostra o aviso dele, off
// mede sem aviso) e dispara o CompleteRegistration ("chegou na confirmação"), uma vez por sessão e por produto. Sem
// ?f=, ou com chave fora do registro, não liga nada: a conversão não tem dono e sujaria o CPA de outro funil.
//
// Este arquivo vai inteiro, como texto, para dentro do <script is:inline> do <Tracking> (import com ?raw): escreva em
// ES5, sem import nem export. É uma expressão de função; o componente a chama com (window, document, { rastro, funis }),
// onde rastro é o endereço do /sa e funis é { chave: slug do produto }. O teste (test/rastro-por-funil.test.js) roda
// este mesmo texto num DOM simulado.
//
// Igual ao que a comunidade fazia no próprio script até o WEB-106: chave em minúsculas e sem espaço nas pontas, o
// evento com { product, funil } e a guarda strat_cr_<produto> no sessionStorage (refresh e voltar não contam de novo).
// O stratTrack só existe depois que o /sa roda: o script espera até ~6 s (40 × 150 ms) e desiste se o Rastro não vier.
(function (w, d, o) {
  var chave = '';
  try { chave = (new w.URLSearchParams(w.location.search).get('f') || '').toLowerCase().replace(/^\s+|\s+$/g, ''); } catch (e) {}
  // Só chave própria do registro: "constructor", "__proto__" e parecidos não viram produto.
  if (!chave || !Object.prototype.hasOwnProperty.call(o.funis, chave)) return;
  var produto = o.funis[chave];

  var s = d.createElement('script');
  s.src = o.rastro + '?product=' + encodeURIComponent(produto);
  s.defer = true;
  d.head.appendChild(s);

  var guarda = 'strat_cr_' + produto, jaContou = false;
  try { jaContou = w.sessionStorage.getItem(guarda) === '1'; } catch (e) {}
  if (jaContou) return;
  var tentativas = 0, timer = w.setInterval(function () {
    tentativas++;
    if (typeof w.stratTrack === 'function') {
      w.clearInterval(timer);
      try {
        w.stratTrack('CompleteRegistration', { product: produto, funil: chave });
        w.sessionStorage.setItem(guarda, '1');
      } catch (e) {}
    } else if (tentativas > 40) {
      w.clearInterval(timer);
    }
  }, 150);
})
