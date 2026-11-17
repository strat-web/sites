// A saída da calculadora de custo da API do WhatsApp, como HTML.
//
// Uma função só desenha o resultado, e os dois lados a usam: o componente no
// build (o exemplo que os robôs leem sem JavaScript) e o script no navegador (a
// cada tecla). A conta vem do pacote da oficina — aqui só tem formatação.

import {
  calcularMes,
  VIGENCIA,
  type Moeda,
  type ResultadoDoMes,
  type Simulacao,
} from '@strat-ai-horus-os/whatsapp-nucleo';

const ESCAPES: Record<string, string> = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
};
/** O nome da simulação pode vir de um link que outra pessoa montou. */
export const esc = (t: string) => String(t).replace(/[&<>"']/g, (c) => ESCAPES[c]);

export const fmtNum = (n: number) => Math.round(n).toLocaleString('pt-BR');

/** Dinheiro com centavos. Preço unitário pede mais casas: `casas` = 4. */
export const fmtMoeda = (n: number, moeda: Moeda, casas = 2) =>
  n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: moeda,
    minimumFractionDigits: casas,
    maximumFractionDigits: casas,
  });

/** "2026-10-01" → "1º de outubro de 2026". */
export function fmtData(iso: string) {
  const [a, m, d] = iso.split('-').map(Number);
  const mes = new Date(Date.UTC(a, m - 1, d)).toLocaleString('pt-BR', { month: 'long', timeZone: 'UTC' });
  return `${d === 1 ? '1º' : d} de ${mes} de ${a}`;
}

export const VIGENCIA_TEXTO = fmtData(VIGENCIA);

function variacao(atual: number, antes: number, moeda: Moeda) {
  const dif = atual - antes;
  if (Math.abs(dif) < 0.005) return 'o mesmo valor';
  const pct = antes > 0 ? ` (${dif > 0 ? '+' : ''}${Math.round((dif / antes) * 100)}%)` : '';
  return `${dif > 0 ? 'mais' : 'menos'} ${fmtMoeda(Math.abs(dif), moeda)}${pct}`;
}

/** A leitura em uma frase — vai no topo do resultado e no texto da folha. */
export function frase(r: ResultadoDoMes) {
  const m = r.moeda;
  if (r.mensagensEnviadas === 0) return 'Preencha quantas mensagens de cada tipo a sua empresa envia por mês.';
  const mudanca =
    r.efeitoDaMudanca > 0.005
      ? ` A mudança de 1º de outubro de 2026 acrescentou ${fmtMoeda(r.efeitoDaMudanca, m)} a esta conta.`
      : ' A mudança de 1º de outubro de 2026 não alterou esta conta.';
  return `${fmtNum(r.mensagensEnviadas)} mensagens por mês custam ${fmtMoeda(r.total, m)}, ou ${fmtMoeda(r.custoPorMensagem, m, 4)} por mensagem em média.${mudanca}`;
}

export function renderResultado(s: Simulacao, r: ResultadoDoMes = calcularMes(s)) {
  const m = r.moeda;
  const linhas = r.linhas
    .filter((l) => l.mensagens > 0 || ['marketing', 'utilidade', 'autenticacao', 'servico'].includes(l.categoria))
    .map(
      (l) => `<tr>
        <th scope="row">${esc(l.rotulo)}<span class="wa-nota">${esc(l.nota)}</span></th>
        <td>${fmtNum(l.mensagens)}</td>
        <td>${l.gratis > 0 ? fmtNum(l.gratis) : '—'}</td>
        <td>${l.custo > 0 ? fmtMoeda(l.precoMedio, m, 4) : '—'}</td>
        <td class="wa-custo">${fmtMoeda(l.custo, m)}</td>
      </tr>`,
    )
    .join('');

  const c = r.comparacao;
  return `
    <p class="wa-frase">${esc(frase(r))}</p>

    <dl class="wa-leitura">
      <div class="wa-destaque"><dt>Total do mês</dt><dd>${fmtMoeda(r.total, m)}</dd><p>Meta + provedor.</p></div>
      <div><dt>Para a Meta</dt><dd>${fmtMoeda(r.meta, m)}</dd><p>${fmtNum(r.mensagensCobradas)} mensagens cobradas.</p></div>
      <div><dt>Para o provedor</dt><dd>${fmtMoeda(r.provedor, m)}</dd><p>Taxa por mensagem + mensalidade.</p></div>
      <div><dt>Franquia de atendimento</dt><dd>${fmtNum(r.franquiaServico.usada)} / ${fmtNum(r.franquiaServico.total)}</dd><p>Respostas grátis usadas no mês.</p></div>
    </dl>

    <div class="wa-tabela-rola">
      <table class="wa-tabela">
        <thead><tr><th>Categoria</th><th>Mensagens</th><th>Grátis</th><th>Preço médio</th><th>Custo Meta</th></tr></thead>
        <tbody>${linhas}</tbody>
        <tfoot><tr><th scope="row">Total Meta</th><td>${fmtNum(r.mensagensEnviadas)}</td><td></td><td></td><td class="wa-custo">${fmtMoeda(r.meta, m)}</td></tr></tfoot>
      </table>
    </div>

    <div class="wa-comparacao">
      <h3>O mesmo volume, nas regras de cada época</h3>
      <ol class="wa-epocas">
        <li><span class="wa-epoca">Até jun/2025 · por conversa</span><b>${fmtMoeda(c.porConversa, m)}</b><span>Hoje: ${variacao(c.atual, c.porConversa, m)}</span></li>
        <li><span class="wa-epoca">Jul/2025 a set/2026 · por mensagem</span><b>${fmtMoeda(c.porMensagem2025, m)}</b><span>Hoje: ${variacao(c.atual, c.porMensagem2025, m)}</span></li>
        <li class="wa-hoje"><span class="wa-epoca">Desde 1º/10/2026</span><b>${fmtMoeda(c.atual, m)}</b><span>Tabela em vigor</span></li>
      </ol>
      <p class="wa-aviso">Só o custo da Meta, sem o provedor. A época "por conversa" é estimativa: usa a tabela antiga em dólar, de fonte secundária${m === 'BRL' ? ', convertida pelo câmbio informado' : ''}.</p>
    </div>`;
}
