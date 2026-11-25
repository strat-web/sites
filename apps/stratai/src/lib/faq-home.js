// Perguntas e respostas da home, lidas do próprio HTML da página (src/html/home.corpo.html) no build (WEB-33).
// O FAQPage do JSON-LD sai daqui, então o texto é sempre idêntico ao visível (docs/seo-geo.md): mudou a pergunta no
// HTML, muda no JSON-LD. Duas fontes na página:
// - as conversas de "Você deve estar pensando…" (botão .obj-q com a pergunta, .obj-a com a resposta);
// - o "Outras perguntas" (<details> com <summary> e o <p> da resposta; o botão de CTA fica fora).

const ENTIDADES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', '#39': "'" };

/** Texto visível de um trecho de HTML: sem tags, entidades decodificadas, espaços juntados. */
export function textoVisivel(html) {
  return String(html)
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(#?\w+);/g, (m, e) => ENTIDADES[e] ?? m)
    .replace(/\s+/g, ' ')
    .replace(/\s+([.,;:!?…])/g, '$1')
    .trim();
}

// Pedaços que aparecem no balão mas não são a pergunta nem a resposta: a dica "toque pra ver a resposta" e a hora.
const semEnfeites = (html) =>
  String(html)
    .replace(/<span class="hint-open">[\s\S]*?<\/span>/g, '')
    .replace(/<span class="mt">[\s\S]*?<\/span>/g, '')
    .replace(/<i class="ic[^"]*">[\s\S]*?<\/i>/g, '');

/** [{ pergunta, resposta }] na ordem em que aparecem na home. */
export function perguntasDaHome(corpo) {
  const perguntas = [];

  // Conversas: <button class="obj-q" ... aria-controls="objA1">…</button> e <div class="obj-a" id="objA1">…</div>.
  for (const m of corpo.matchAll(/<button[^>]*class="obj-q"[^>]*aria-controls="([^"]+)"[^>]*>([\s\S]*?)<\/button>/g)) {
    const [, id, pergunta] = m;
    const resposta = corpo.match(new RegExp(`<div class="obj-a" id="${id}">([\\s\\S]*?)</div></div>`));
    if (!resposta) throw new Error(`[faq-home] resposta ${id} não encontrada no HTML da home`);
    perguntas.push({ pergunta: textoVisivel(semEnfeites(pergunta)), resposta: textoVisivel(semEnfeites(resposta[1])) });
  }

  // "Outras perguntas": a resposta é o <p> dentro de .ans (o botão de CTA que vem depois não entra).
  const faq = corpo.match(/<div class="faq faq6[^"]*">([\s\S]*?)<\/div>\s*<\/div>\s*<\/section>/);
  if (!faq) throw new Error('[faq-home] bloco "Outras perguntas" não encontrado no HTML da home');
  for (const m of faq[1].matchAll(/<details><summary>([\s\S]*?)<\/summary><div class="ans"><p>([\s\S]*?)<\/p>/g)) {
    perguntas.push({ pergunta: textoVisivel(semEnfeites(m[1])), resposta: textoVisivel(m[2]) });
  }

  return perguntas;
}
