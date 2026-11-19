// Interatividade da calculadora de funil — JavaScript puro, sem framework.
//
// Três regras que o resto do arquivo respeita:
//
// 1. A matemática vem de lib/funil.ts, a MESMA que o build usou para renderizar a
//    tabela. Nada de recalcular aqui: se as duas contas divergissem, o HTML e a
//    tela mostrariam números diferentes e ninguém saberia qual acreditar.
// 2. O estado inicial sai do <script type="application/json" data-funil-dados>
//    que o componente já emitiu. Nenhum número é duplicado neste arquivo.
// 3. Isto é progressive enhancement. Se este script não carregar, a tabela do
//    build continua na tela, legível, e os botões seguem escondidos — por isso
//    [data-funil-acoes] nasce com `hidden` no HTML e só é revelado aqui embaixo.

import { calcularFunil, fmtNum, fmtReal, fmtTaxa, type EntradaEtapa } from '../lib/funil';
import {
  desserializar, serializar, normaliza, limpaNome, inteiro,
  MIN_ETAPAS, MAX_ETAPAS, MAX_NOME, type EstadoFunil as Estado,
} from '../lib/funil-url';
import { diagnosticar, type Faixa } from '../lib/funil-diagnostico';
import {
  enviarLead, rastrearLead, mascaraTelefone, telefoneValido,
  prepararTurnstile, tokenTurnstile, resetarTurnstile,
} from '../lib/captacao';

const DEBOUNCE = 200;
const CHAVE_LOCAL = 'strat:funil:v1';

// ------------------------------------------------------------
// Utilidades
// ------------------------------------------------------------

const ESCAPES: Record<string, string> = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
};
/** Nome de etapa pode vir da query string, ou seja, de um link que outra pessoa montou. */
const esc = (t: string) => String(t).replace(/[&<>"']/g, (c) => ESCAPES[c]);

function debounce<T extends (...a: never[]) => void>(fn: T, ms: number) {
  let id: number | undefined;
  return (...args: Parameters<T>) => {
    if (id !== undefined) clearTimeout(id);
    id = window.setTimeout(() => fn(...args), ms);
  };
}

/** Mesmo formato do data-evento do RubikLayout, para os eventos que não são clique. */
function evento(nome: string, local: string) {
  const rastrear = (window as unknown as { stratTrack?: (n: string, p: object) => void }).stratTrack;
  if (typeof rastrear !== 'function') return;
  try {
    rastrear(nome, { destino: '', local, rota: location.pathname });
  } catch { /* tracking nunca pode quebrar a ferramenta */ }
}

// ------------------------------------------------------------
// Estado: JSON do build → URL → localStorage
// ------------------------------------------------------------

function valido(e: Estado | null): e is Estado {
  return !!e && Array.isArray(e.etapas) && e.etapas.length >= MIN_ETAPAS;
}

/** As faixas de referência vêm no mesmo JSON do estado inicial. */
let referencia: Faixa[] = [];

function doBuild(raiz: HTMLElement): Estado | null {
  const tag = raiz.querySelector<HTMLScriptElement>('[data-funil-dados]');
  if (!tag?.textContent) return null;
  try {
    const cru = JSON.parse(tag.textContent);
    if (Array.isArray(cru.referencia)) referencia = cru.referencia;
    return normaliza(cru);
  } catch {
    return null;
  }
}

function doLocal(): Estado | null {
  try {
    const cru = localStorage.getItem(CHAVE_LOCAL);
    if (!cru) return null;
    const e = normaliza(JSON.parse(cru));
    return valido(e) ? e : null;
  } catch {
    return null; // modo privado, storage bloqueado — segue com o padrão do build
  }
}

const salvaLocal = debounce((estado: Estado) => {
  try {
    localStorage.setItem(CHAVE_LOCAL, JSON.stringify(estado));
  } catch { /* sem storage, a ferramenta continua funcionando */ }
}, DEBOUNCE * 2);

// ------------------------------------------------------------
// Render
// ------------------------------------------------------------

function campoHtml(e: EntradaEtapa, i: number, podeRemover: boolean) {
  const nota = e.nota ? `<p class="funil-campo-nota">${esc(e.nota)}</p>` : '';
  const remover = podeRemover
    ? `<button type="button" class="funil-remover" data-funil-remover="${i}"
         aria-label="Remover a etapa ${esc(e.nome)}">&times;</button>`
    : '';
  return `
    <li class="funil-campo">
      <label>
        <span class="funil-campo-nome">
          <input type="text" name="nome-${i}" value="${esc(e.nome)}" data-funil-nome
                 aria-label="Nome da etapa ${i + 1}" maxlength="${MAX_NOME}">
        </span>
        <input type="number" name="valor-${i}" value="${e.valor}" min="0" step="1"
               inputmode="numeric" data-funil-valor aria-label="Quantidade em ${esc(e.nome)}">
        ${remover}
      </label>
      ${nota}
    </li>`;
}

function renderCampos(raiz: HTMLElement, estado: Estado) {
  const lista = raiz.querySelector<HTMLElement>('[data-funil-campos]');
  if (!lista) return;
  const podeRemover = estado.etapas.length > MIN_ETAPAS;
  lista.innerHTML = estado.etapas.map((e, i) => campoHtml(e, i, podeRemover)).join('');

  const add = raiz.querySelector<HTMLButtonElement>('[data-funil-add]');
  if (add) {
    const cheio = estado.etapas.length >= MAX_ETAPAS;
    add.disabled = cheio;
    add.title = cheio ? `Máximo de ${MAX_ETAPAS} etapas` : '';
  }
}

function renderSaida(raiz: HTMLElement, estado: Estado) {
  const funil = calcularFunil(estado.etapas, estado.ticket);

  const barras = raiz.querySelector<HTMLElement>('[data-funil-barras]');
  if (barras) {
    barras.innerHTML = funil.etapas
      .map((e) => {
        const taxa =
          e.taxaPassagem === null
            ? '<span>topo do funil · 100% da base</span>'
            : `<b>${fmtTaxa(e.taxaPassagem)}</b> da etapa anterior` +
              `<span class="funil-sep">·</span>${fmtTaxa(e.taxaAcumulada)} do topo` +
              `<span class="funil-sep">·</span>perdeu ${fmtNum(e.perda ?? 0)}` +
              (e.gargalo ? '<span class="funil-selo">gargalo</span>' : '');
        return `
          <li class="funil-barra${e.gargalo ? ' e-gargalo' : ''}">
            <div class="funil-barra-topo">
              <span class="funil-barra-nome">${esc(e.nome)}</span>
              <span class="funil-barra-valor">${fmtNum(e.valor)}</span>
            </div>
            <div class="funil-barra-trilho">
              <div class="funil-barra-preenche" style="width:${e.largura}%"></div>
            </div>
            <p class="funil-barra-taxa">${taxa}</p>
          </li>`;
      })
      .join('');
  }

  const leitura = raiz.querySelector<HTMLElement>('[data-funil-leitura]');
  if (leitura) {
    const g = funil.gargalo;
    const blocos: [string, string, string][] = [
      ['Conversão geral', fmtTaxa(funil.taxaGeral), 'Do topo até a venda.'],
      ['Gargalo', g ? g.nome : '—',
        g ? `A pior passagem, com ${fmtTaxa(g.taxaPassagem ?? 0)}. É onde está o dinheiro.`
          : 'Preencha ao menos duas etapas.'],
      ['Receita do funil', fmtReal(funil.receita), 'Clientes × ticket médio, no período medido.'],
      ['Vale 1 ponto no gargalo', fmtReal(funil.ganhoPorPonto),
        'Quanto entra a mais se a taxa do gargalo subir um ponto percentual.'],
    ];
    leitura.innerHTML = blocos
      .map(([dt, dd, p]) => `<div><dt>${dt}</dt><dd>${esc(dd)}</dd><p>${esc(p)}</p></div>`)
      .join('');
  }

  return funil;
}

/**
 * Reescreve o relatório para os números atuais. Mesma `diagnosticar` do build —
 * o texto que a pessoa lê depois de editar é gerado pela mesma função que gerou
 * o HTML, então os dois nunca divergem.
 */
function renderRelatorio(raiz: HTMLElement, estado: Estado) {
  const bloco = raiz.querySelector<HTMLElement>('[data-funil-relatorio]');
  if (!bloco) return;
  const d = diagnosticar(estado.etapas, estado.ticket, referencia);

  const resumo = bloco.querySelector<HTMLElement>('[data-relatorio-resumo]');
  if (resumo) resumo.textContent = d.resumo;

  const alerta = bloco.querySelector<HTMLElement>('[data-relatorio-inconsistencia]');
  if (alerta) {
    alerta.hidden = !d.inconsistencia;
    alerta.innerHTML = d.inconsistencia
      ? `<p class="relatorio-alerta">${esc(d.inconsistencia)}</p>`
      : '';
  }

  const lista = bloco.querySelector<HTMLElement>('[data-relatorio-lista]');
  if (lista) {
    const rotulo = (p: (typeof d.passagens)[number]) =>
      p.posicao === 'dentro' ? 'na faixa' : p.posicao === 'acima' ? 'acima da faixa' : 'abaixo da faixa';
    lista.innerHTML = d.passagens
      .map(
        (p) => `
        <li class="relatorio-item${p.gargalo ? ' e-gargalo' : ''}">
          <div class="relatorio-item-topo">
            <h4>${esc(p.de)} &rarr; ${esc(p.nome)}</h4>
            <span class="relatorio-pos pos-${p.posicao}">${fmtTaxa(p.taxa)} &middot; ${rotulo(p)}</span>
          </div>
          <p>${esc(p.significado)}</p>
          <p class="relatorio-olhar"><b>Onde olhar primeiro:</b> ${esc(p.ondeOlhar)}</p>
        </li>`,
      )
      .join('');
  }

  const gargalo = bloco.querySelector<HTMLElement>('[data-relatorio-gargalo]');
  if (gargalo) {
    gargalo.innerHTML = d.gargalo
      ? `<p class="kicker">O gargalo</p>
         <h4>${esc(d.gargalo.de)} &rarr; ${esc(d.gargalo.nome)}</h4>
         <p>${esc(d.gargalo.texto)}</p>`
      : '';
  }
}

// ------------------------------------------------------------
// Imagem — canvas puro, só retângulo e texto.
// É o que circula no WhatsApp, então é a distribuição da ferramenta.
// ------------------------------------------------------------

const COR = {
  bg: '#F5F3EE', surf: '#FFFFFF', bg2: '#EFECE5',
  txt: '#14161B', txt2: '#63615C',
  acento: '#A8572E', acentoVivo: '#D97A4A', // --acento de strat-tokens.css
  linha: 'rgba(15,17,21,.13)',
};
const FONTE = "'Rubik', system-ui, -apple-system, sans-serif";

function desenhar(estado: Estado, titulo: string): HTMLCanvasElement {
  const funil = calcularFunil(estado.etapas, estado.ticket);
  const n = funil.etapas.length;

  const L = 1080;
  const pad = 72;
  const topo = 240;
  const alturaLinha = 132;
  const rodape = 216;
  const A = topo + n * alturaLinha + rodape;

  const cv = document.createElement('canvas');
  const escala = 2; // nitidez em tela de retina e no zoom do WhatsApp
  cv.width = L * escala;
  cv.height = A * escala;
  const ctx = cv.getContext('2d')!;
  ctx.scale(escala, escala);

  // Fundo
  ctx.fillStyle = COR.bg;
  ctx.fillRect(0, 0, L, A);

  // Aura quente no topo — a assinatura visual do design system
  const aura = ctx.createLinearGradient(0, 0, 0, 260);
  aura.addColorStop(0, 'rgba(217,122,74,.20)');
  aura.addColorStop(1, 'rgba(217,122,74,0)');
  ctx.fillStyle = aura;
  ctx.fillRect(0, 0, L, 260);

  // Cabeçalho
  ctx.fillStyle = COR.acento;
  ctx.font = `600 24px ${FONTE}`;
  ctx.fillText('CALCULADORA DE FUNIL DE VENDAS', pad, 92);

  ctx.fillStyle = COR.txt;
  ctx.font = `600 46px ${FONTE}`;
  ctx.fillText(titulo.slice(0, 34), pad, 152);

  ctx.fillStyle = COR.txt2;
  ctx.font = `400 26px ${FONTE}`;
  const g = funil.gargalo;
  ctx.fillText(
    g ? `Gargalo em ${g.nome} · ${fmtTaxa(g.taxaPassagem ?? 0)} de conversão`
      : `Conversão geral de ${fmtTaxa(funil.taxaGeral)}`,
    pad, 196,
  );

  // Barras
  const larguraMax = L - pad * 2;
  funil.etapas.forEach((e, i) => {
    const y = topo + i * alturaLinha;
    const destaque = e.gargalo;
    const w = Math.max((e.largura / 100) * larguraMax, 132);

    // Trilho
    ctx.fillStyle = COR.bg2;
    ctx.fillRect(pad, y + 44, larguraMax, 44);

    // Preenchimento
    ctx.fillStyle = destaque ? COR.acento : COR.acentoVivo;
    ctx.globalAlpha = destaque ? 1 : 0.55;
    ctx.fillRect(pad, y + 44, w, 44);
    ctx.globalAlpha = 1;

    // Nome + valor
    ctx.fillStyle = COR.txt;
    ctx.font = `600 30px ${FONTE}`;
    ctx.fillText(e.nome.slice(0, 28), pad, y + 30);

    ctx.textAlign = 'right';
    ctx.font = `700 30px ${FONTE}`;
    ctx.fillText(fmtNum(e.valor), L - pad, y + 30);
    ctx.textAlign = 'left';

    // Taxa abaixo da barra
    ctx.fillStyle = destaque ? COR.acento : COR.txt2;
    ctx.font = `${destaque ? 600 : 400} 24px ${FONTE}`;
    const legenda =
      e.taxaPassagem === null
        ? '100% — topo do funil'
        : `${fmtTaxa(e.taxaPassagem)} da etapa anterior` + (destaque ? '   ◆ GARGALO' : '');
    ctx.fillText(legenda, pad, y + 116);
  });

  // Rodapé: a leitura + a assinatura
  const yr = topo + n * alturaLinha + 24;
  ctx.strokeStyle = COR.linha;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad, yr);
  ctx.lineTo(L - pad, yr);
  ctx.stroke();

  const resumo: [string, string][] = [
    ['Conversão geral', fmtTaxa(funil.taxaGeral)],
    ['Receita', fmtReal(funil.receita)],
    ['1 ponto no gargalo vale', fmtReal(funil.ganhoPorPonto)],
  ];
  resumo.forEach(([rot, val], i) => {
    const x = pad + i * ((L - pad * 2) / 3);
    ctx.fillStyle = COR.txt2;
    ctx.font = `400 22px ${FONTE}`;
    ctx.fillText(rot, x, yr + 44);
    ctx.fillStyle = COR.txt;
    ctx.font = `700 34px ${FONTE}`;
    ctx.fillText(val, x, yr + 84);
  });

  ctx.fillStyle = COR.txt;
  ctx.font = `700 26px ${FONTE}`;
  ctx.fillText('Strat Academy', pad, yr + 152);
  ctx.fillStyle = COR.txt2;
  ctx.font = `400 24px ${FONTE}`;
  ctx.textAlign = 'right';
  ctx.fillText('stratacademy.com.br/ferramentas', L - pad, yr + 152);
  ctx.textAlign = 'left';

  return cv;
}

// ------------------------------------------------------------
// Ligação
// ------------------------------------------------------------

const ACOES_HTML = `
  <button type="button" class="btn btn-secundario" data-funil-add>+ Adicionar etapa</button>
  <button type="button" class="btn btn-secundario" data-funil-copiar
          data-evento="FunilLinkCopiado">Copiar link</button>
  <button type="button" class="btn btn-secundario" data-funil-imagem
          data-evento="FunilImagemBaixada">Baixar imagem</button>
  <button type="button" class="btn btn-secundario" data-funil-pdf
          data-evento="pdf_impresso">Salvar em PDF</button>
  <span class="funil-salvo" data-funil-salvo hidden>salvo neste navegador</span>`;

function ligar(raiz: HTMLElement) {
  const padrao = doBuild(raiz);
  if (!padrao) return; // sem estado inicial não há o que melhorar; a tabela do build fica

  const local = raiz.dataset.local || 'funil';

  // Precedência: link compartilhado > o que a pessoa salvou > o exemplo do build.
  const daPagina = desserializar(location.search);
  let estado: Estado = daPagina ?? doLocal() ?? padrao;
  // As notas explicativas só existem no padrão do build; recupera pela posição.
  estado = {
    ...estado,
    etapas: estado.etapas.map((e, i) => ({ ...e, nota: e.nota ?? padrao.etapas[i]?.nota })),
  };

  const acoes = raiz.querySelector<HTMLElement>('[data-funil-acoes]');
  if (acoes) {
    acoes.innerHTML = ACOES_HTML;
    acoes.querySelectorAll('[data-evento]').forEach((b) =>
      b.setAttribute('data-evento-local', local),
    );
    acoes.hidden = false; // só agora os botões existem de verdade
  }

  const avisoSalvo = raiz.querySelector<HTMLElement>('[data-funil-salvo]');
  let jaEditou = false;

  // A captura só existe com JavaScript: sem ele, um campo de e-mail que não
  // envia seria pior que campo nenhum. O HTML nasce hidden; revelamos aqui.
  const captura = raiz.querySelector<HTMLElement>('[data-funil-captura]');
  const relatorio = raiz.querySelector<HTMLElement>('[data-funil-relatorio]');
  const popup = raiz.querySelector<HTMLElement>('[data-funil-popup]');
  const formLead = raiz.querySelector<HTMLFormElement>('[data-funil-form-lead]');
  const aviso = raiz.querySelector<HTMLElement>('[data-funil-aviso]');
  const caixaTurnstile = raiz.querySelector<HTMLElement>('[data-funil-turnstile]');
  if (captura) captura.hidden = false;

  // ---------- popup: abrir, fechar, prender o foco ----------
  // Guarda quem abriu, para devolver o foco no fechamento — quem usa teclado
  // precisa voltar para onde estava, não para o topo da página.
  let abriuDaqui: HTMLElement | null = null;

  const focaveis = () =>
    [...(popup?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ) ?? [])].filter((el) => el.offsetParent !== null);

  const fecharPopup = () => {
    if (!popup || popup.hidden) return;
    popup.hidden = true;
    document.documentElement.style.removeProperty('overflow');
    abriuDaqui?.focus();
    abriuDaqui = null;
  };

  const abrirPopup = (origem: HTMLElement) => {
    if (!popup) return;
    abriuDaqui = origem;
    popup.hidden = false;
    // Trava o scroll do fundo: rolar a página atrás do popup desorienta.
    document.documentElement.style.overflow = 'hidden';
    focaveis()[0]?.focus();
    // Turnstile: começa a resolver AGORA, em paralelo, enquanto a pessoa
    // preenche. Sem `await` de propósito — nada aqui pode atrasar a abertura,
    // e o desafio costuma terminar antes de ela chegar no botão.
    prepararTurnstile(caixaTurnstile);
  };

  popup?.addEventListener('click', (e) => {
    const alvo = e.target as HTMLElement;
    // Clique fora = no fundo escuro. O clique dentro da caixa não fecha.
    if (alvo.hasAttribute('data-funil-popup-fundo') || alvo.closest('[data-funil-popup-fechar]')) {
      fecharPopup();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (!popup || popup.hidden) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      fecharPopup();
      return;
    }
    // Foco preso: Tab no último volta ao primeiro, Shift+Tab no primeiro vai ao último.
    if (e.key !== 'Tab') return;
    const lista = focaveis();
    if (lista.length === 0) return;
    const primeiro = lista[0];
    const ultimo = lista[lista.length - 1];
    const atual = document.activeElement as HTMLElement | null;
    if (e.shiftKey && (atual === primeiro || !popup.contains(atual))) {
      e.preventDefault();
      ultimo.focus();
    } else if (!e.shiftKey && atual === ultimo) {
      e.preventDefault();
      primeiro.focus();
    }
  });

  // Máscara do telefone enquanto digita.
  const campoTel = raiz.querySelector<HTMLInputElement>('[data-funil-telefone]');
  campoTel?.addEventListener('input', () => {
    const posFim = campoTel.selectionStart === campoTel.value.length;
    campoTel.value = mascaraTelefone(campoTel.value);
    if (posFim) campoTel.setSelectionRange(campoTel.value.length, campoTel.value.length);
  });

  const revelarRelatorio = () => {
    if (!relatorio) return;
    relatorio.hidden = false;
    if (captura) captura.hidden = true;
    relatorio.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const dizer = (msg: string, tipo?: 'ok' | 'erro') => {
    if (!aviso) return;
    aviso.textContent = msg;
    aviso.className = `captura-aviso${tipo ? ` e-${tipo}` : ''}`;
  };

  const aplicar = (opts: { campos?: boolean } = {}) => {
    if (opts.campos) renderCampos(raiz, estado);
    renderSaida(raiz, estado);
    renderRelatorio(raiz, estado);
    history.replaceState(null, '', serializar(estado, location.pathname));
    salvaLocal(estado);
    if (avisoSalvo) avisoSalvo.hidden = false;
  };

  const lerFormulario = () => {
    const nomes = [...raiz.querySelectorAll<HTMLInputElement>('[data-funil-nome]')];
    const valores = [...raiz.querySelectorAll<HTMLInputElement>('[data-funil-valor]')];
    const ticket = raiz.querySelector<HTMLInputElement>('[data-funil-ticket]');
    estado = {
      etapas: nomes.map((inp, i) => ({
        nome: limpaNome(inp.value) || `Etapa ${i + 1}`,
        valor: inteiro(valores[i]?.value),
        nota: estado.etapas[i]?.nota,
      })),
      ticket: inteiro(ticket?.value),
    };
  };

  const aoEditar = debounce(() => {
    lerFormulario();
    aplicar(); // sem `campos`: rebuildar os inputs aqui roubaria o foco de quem digita
    if (!jaEditou) {
      jaEditou = true;
      evento('FunilEditado', local);
    }
  }, DEBOUNCE);

  raiz.addEventListener('input', (e) => {
    const alvo = e.target as HTMLElement;
    if (alvo.matches('[data-funil-nome], [data-funil-valor], [data-funil-ticket]')) aoEditar();
  });

  raiz.addEventListener('click', async (e) => {
    const alvo = (e.target as HTMLElement).closest('button');
    if (!alvo || !raiz.contains(alvo)) return;

    if (alvo.hasAttribute('data-funil-add')) {
      if (estado.etapas.length >= MAX_ETAPAS) return;
      lerFormulario();
      const ultima = estado.etapas.at(-1)!;
      estado.etapas.push({
        nome: `Etapa ${estado.etapas.length + 1}`,
        // Metade da anterior: mantém o funil coerente (cada etapa é subconjunto da de cima).
        valor: Math.max(Math.floor(ultima.valor / 2), 0),
      });
      aplicar({ campos: true });
      raiz.querySelectorAll<HTMLInputElement>('[data-funil-nome]').item(estado.etapas.length - 1)?.select();
      return;
    }

    const remover = alvo.getAttribute('data-funil-remover');
    if (remover !== null) {
      if (estado.etapas.length <= MIN_ETAPAS) return;
      lerFormulario();
      estado.etapas.splice(Number(remover), 1);
      aplicar({ campos: true });
      return;
    }

    if (alvo.hasAttribute('data-funil-copiar')) {
      lerFormulario();
      aplicar();
      const url = location.origin + serializar(estado, location.pathname);
      const rotulo = alvo.textContent;
      try {
        await navigator.clipboard.writeText(url);
        alvo.textContent = 'Link copiado ✓';
      } catch {
        // Sem permissão de área de transferência: mostra a URL para copiar na mão.
        window.prompt('Copie o link do seu funil:', url);
        alvo.textContent = rotulo;
        return;
      }
      window.setTimeout(() => { alvo.textContent = rotulo; }, 2400);
      return;
    }

    if (alvo.hasAttribute('data-funil-pedir')) {
      abrirPopup(alvo);
      return;
    }

    if (alvo.hasAttribute('data-funil-pdf')) {
      // Sem biblioteca: a @media print transforma a página no relatório, e o
      // navegador gera o PDF. O relatório é revelado antes para entrar na folha.
      lerFormulario();
      aplicar();
      if (relatorio) relatorio.hidden = false;
      window.print();
      return;
    }

    if (alvo.hasAttribute('data-funil-imagem')) {
      lerFormulario();
      aplicar();
      const titulo = raiz.querySelector('h2')?.textContent?.trim() || 'Meu funil de vendas';
      const cv = desenhar(estado, titulo);
      cv.toBlob((blob) => {
        if (!blob) return;
        const href = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = href;
        a.download = 'funil-de-vendas-strat.png';
        a.click();
        URL.revokeObjectURL(href);
      }, 'image/png');
    }
  });

  formLead?.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const campoEmail = formLead.querySelector<HTMLInputElement>('[data-funil-email]');
    const campoNome = formLead.querySelector<HTMLInputElement>('[data-funil-nome-lead]');
    const email = (campoEmail?.value || '').trim();

    if (!email || !campoEmail?.checkValidity()) {
      campoEmail?.setAttribute('aria-invalid', 'true');
      dizer('Confira o e-mail e tente de novo.', 'erro');
      campoEmail?.focus();
      return;
    }
    campoEmail.removeAttribute('aria-invalid');

    // Telefone é OPCIONAL: só barra se foi preenchido e está incompleto. Perder
    // o lead inteiro de quem não quer dar o número seria pior que não ter número.
    const telefone = campoTel?.value || '';
    if (telefone && !telefoneValido(telefone)) {
      campoTel?.setAttribute('aria-invalid', 'true');
      dizer('O telefone parece incompleto. Corrija ou deixe em branco — ele é opcional.', 'erro');
      campoTel?.focus();
      return;
    }
    campoTel?.removeAttribute('aria-invalid');

    formLead.setAttribute('aria-busy', 'true');
    dizer('Enviando…');

    const origem = `ferramenta:${local}`;
    const { ok } = await enviarLead({
      email,
      nome: campoNome?.value,
      telefone,
      formulario: 'diagnostico-funil',
      origem,
      contexto: 'relatorio',
      eventId: rastrearLead(origem, email),
      // Vazio quando não há Turnstile configurado (dev, preview sem chave) ou
      // quando o desafio não resolveu a tempo. Quem decide o que fazer com a
      // ausência é a Function, não o navegador.
      turnstileToken: await tokenTurnstile(caixaTurnstile),
    });

    // Token do Turnstile é de uso único: se a pessoa reenviar, precisa de outro.
    resetarTurnstile(caixaTurnstile);

    dizer(
      ok
        // Nada aqui pode afirmar que um e-mail foi enviado: o fluxo do n8n ainda
        // não manda o diagnóstico, e o site não teria como saber se mandou. Quando
        // o Hermes passar a enviar, este texto pode voltar a prometer — o payload já
        // leva `contexto_url` com o funil inteiro justamente para isso.
        ? 'Pronto. O seu diagnóstico está aí embaixo.'
        : 'Não conseguimos registrar o seu contato agora, mas o diagnóstico está aí embaixo.',
      ok ? 'ok' : 'erro',
    );

    // O relatório é calculado aqui, não no servidor. Se o envio falhar, a pessoa
    // recebe assim mesmo: ela cumpriu a parte dela.
    formLead.removeAttribute('aria-busy');
    fecharPopup();
    revelarRelatorio();
  });

  // Primeira pintura: o build já desenhou o padrão, então só refaz se veio
  // estado de fora (link compartilhado ou o que estava salvo).
  if (daPagina || estado !== padrao) aplicar({ campos: true });
  else renderCampos(raiz, estado); // acrescenta os botões de remover
}

document.querySelectorAll<HTMLElement>('[data-funil]').forEach(ligar);
