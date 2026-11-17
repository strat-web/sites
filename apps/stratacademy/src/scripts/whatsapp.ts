// Interatividade da calculadora de custo da API do WhatsApp — JavaScript puro.
//
// Três regras:
// 1. A conta vem do pacote da oficina e o desenho de lib/whatsapp.ts — as mesmas
//    funções que o build usou. Nada é recalculado aqui de outro jeito.
// 2. Todo dado que chega de fora (URL, localStorage, arquivo) passa por migrar().
// 3. Progressive enhancement: sem este script, o resultado do build continua na
//    tela e os botões continuam escondidos.

import {
  calcularMes,
  lerJSON,
  migrar,
  tentarMigrar,
  type Simulacao,
} from '@strat-ai-horus-os/whatsapp-nucleo';
import { renderResultado, fmtNum } from '../lib/whatsapp';

const CHAVE_LOCAL = 'strat:whatsapp:v1';
const PARAM = 's';

function evento(nome: string, local: string) {
  const rastrear = (window as unknown as { stratTrack?: (n: string, p: object) => void }).stratTrack;
  if (typeof rastrear !== 'function') return;
  try {
    rastrear(nome, { destino: '', local, rota: location.pathname });
  } catch { /* tracking nunca pode quebrar a ferramenta */ }
}

function baixar(nome: string, conteudo: string, tipo: string) {
  const url = URL.createObjectURL(new Blob([conteudo], { type: tipo }));
  const a = Object.assign(document.createElement('a'), { href: url, download: nome });
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function lerDaUrl(): Simulacao | null {
  const cru = new URLSearchParams(location.search).get(PARAM);
  if (!cru) return null;
  try {
    return tentarMigrar(JSON.parse(cru));
  } catch {
    return null;
  }
}

function lerDoNavegador(): Simulacao | null {
  try {
    const cru = localStorage.getItem(CHAVE_LOCAL);
    return cru ? tentarMigrar(JSON.parse(cru)) : null;
  } catch {
    return null;
  }
}

function gravar(s: Simulacao) {
  try {
    localStorage.setItem(CHAVE_LOCAL, JSON.stringify(s));
  } catch { /* cota cheia ou navegação privada: a ferramenta segue funcionando */ }
}

/** A simulação inteira vai na URL: o link não passa por servidor nenhum. */
function urlDe(s: Simulacao) {
  const u = new URL(location.href);
  u.searchParams.set(PARAM, JSON.stringify(s));
  return u.toString();
}

function csv(s: Simulacao) {
  const r = calcularMes(s);
  const n = (v: number, casas = 2) => v.toFixed(casas).replace('.', ',');
  const linhas = [
    ['Categoria', 'Mensagens', 'Grátis', `Preço médio (${r.moeda})`, `Custo (${r.moeda})`],
    ...r.linhas.map((l) => [l.rotulo, String(l.mensagens), String(l.gratis), n(l.precoMedio, 4), n(l.custo)]),
    ['Total Meta', String(r.mensagensEnviadas), '', '', n(r.meta)],
    ['Provedor', '', '', '', n(r.provedor)],
    ['Total do mês', '', '', '', n(r.total)],
  ];
  return '﻿' + linhas.map((l) => l.map((c) => `"${c.replace(/"/g, '""')}"`).join(';')).join('\r\n');
}

function iniciar(raiz: HTMLElement) {
  const form = raiz.querySelector<HTMLFormElement>('[data-wa-form]')!;
  const saida = raiz.querySelector<HTMLElement>('[data-wa-saida]')!;
  const acoes = raiz.querySelector<HTMLElement>('[data-wa-acoes]')!;
  const status = raiz.querySelector<HTMLElement>('[data-wa-status]')!;
  const arquivo = raiz.querySelector<HTMLInputElement>('[data-wa-arquivo]')!;
  const local = raiz.dataset.local ?? 'whatsapp';

  const exemplo = migrar(JSON.parse(raiz.querySelector('[data-wa-dados]')!.textContent || '{}'));
  // Link compartilhado vence o que estava salvo; o salvo vence o exemplo.
  // Nas páginas de modelo o exemplo é o próprio modelo, então só a URL o substitui.
  const ehModelo = location.pathname.includes('/modelos/');
  let estado: Simulacao = lerDaUrl() ?? (ehModelo ? null : lerDoNavegador()) ?? exemplo;
  let usou = false;

  function preencher(s: Simulacao) {
    for (const el of Array.from(form.elements)) {
      const campo = el as HTMLInputElement | HTMLSelectElement;
      if (!campo.name || !(campo.name in s)) continue;
      campo.value = String(s[campo.name as keyof Simulacao]);
    }
  }

  function ler(): Simulacao {
    const cru: Record<string, unknown> = { ...estado };
    for (const el of Array.from(form.elements)) {
      const campo = el as HTMLInputElement | HTMLSelectElement;
      if (!campo.name) continue;
      cru[campo.name] = campo.type === 'number' ? (campo.value === '' ? 0 : Number(campo.value)) : campo.value;
    }
    return migrar(cru);
  }

  function desenhar() {
    saida.innerHTML = renderResultado(estado);
  }

  function aviso(texto: string) {
    status.textContent = texto;
    window.setTimeout(() => (status.textContent = 'Salvo neste navegador'), 2500);
  }

  let espera: number | undefined;
  form.addEventListener('input', () => {
    window.clearTimeout(espera);
    espera = window.setTimeout(() => {
      estado = ler();
      desenhar();
      gravar(estado);
      if (!usou) {
        usou = true;
        evento('ferramenta_usada', local);
      }
    }, 150);
  });
  form.addEventListener('submit', (e) => e.preventDefault());

  acoes.addEventListener('click', async (e) => {
    const acao = (e.target as HTMLElement).closest<HTMLElement>('[data-wa-acao]')?.dataset.waAcao;
    if (!acao) return;
    evento(`whatsapp_${acao}`, local);

    if (acao === 'link') {
      const url = urlDe(estado);
      history.replaceState(null, '', url);
      try {
        await navigator.clipboard.writeText(url);
        aviso('Link copiado');
      } catch {
        aviso('Copie o endereço da barra do navegador');
      }
    } else if (acao === 'csv') {
      baixar('custo-whatsapp-api.csv', csv(estado), 'text/csv;charset=utf-8');
    } else if (acao === 'json') {
      baixar('simulacao-whatsapp-api.json', JSON.stringify(estado, null, 2), 'application/json');
    } else if (acao === 'importar') {
      arquivo.click();
    } else if (acao === 'imprimir') {
      window.print();
    } else if (acao === 'exemplo') {
      estado = exemplo;
      preencher(estado);
      desenhar();
      gravar(estado);
      history.replaceState(null, '', location.pathname);
      aviso('Exemplo restaurado');
    }
  });

  arquivo.addEventListener('change', async () => {
    const f = arquivo.files?.[0];
    arquivo.value = '';
    if (!f) return;
    try {
      estado = lerJSON(await f.text());
      preencher(estado);
      desenhar();
      gravar(estado);
      aviso(`Simulação aberta: ${fmtNum(calcularMes(estado).mensagensEnviadas)} mensagens`);
    } catch (erro) {
      aviso(erro instanceof Error ? erro.message : 'Não consegui abrir o arquivo');
    }
  });

  preencher(estado);
  desenhar();
  acoes.hidden = false;
}

document.querySelectorAll<HTMLElement>('[data-wa]').forEach(iniciar);
