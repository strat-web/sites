// ============================================================
// O editor do Criador de Funil de Vendas.
//
// Isto é progressive enhancement, igual ao da calculadora: se este script não
// carregar, o funil desenhado no build continua na tela, legível — e a folha
// inteira explica o método em texto.
//
// O editor é grande (React + canvas), então ele só é baixado quando o bloco
// chega perto da tela. Numa página que precisa ranquear, JavaScript que ninguém
// usa é peso puro.
// ============================================================

/** A chave do @strat-ai-horus-os/armazenamento para a ferramenta "funil". */
const CHAVE_DO_DESENHO = 'strat:funil:documento';
const ROTA_MODELOS = '/ferramentas/criador-de-funil-de-vendas/modelos';
/** Abre com este modelo quem chega pela primeira vez, sem nada salvo. */
const MODELO_DE_ESTREIA = 'isca-digital';

/** Mesmo formato do data-evento do RubikLayout, para os eventos que não são clique. */
function evento(nome: string, local: string, extra: Record<string, unknown> = {}) {
  const rastrear = (window as unknown as { stratTrack?: (n: string, p: object) => void }).stratTrack;
  if (typeof rastrear !== 'function') return;
  try {
    rastrear(nome, { destino: '', local, rota: location.pathname, ...extra });
  } catch {
    /* tracking nunca pode quebrar a ferramenta */
  }
}

function temDesenhoSalvo(): boolean {
  try {
    return !!localStorage.getItem(CHAVE_DO_DESENHO);
  } catch {
    return false; // aba anônima com site data bloqueado
  }
}

async function baixarModelo(slug: string): Promise<unknown | undefined> {
  try {
    const r = await fetch(`${ROTA_MODELOS}/${encodeURIComponent(slug)}.json`);
    if (!r.ok) return undefined;
    return await r.json();
  } catch {
    return undefined;
  }
}

/**
 * Qual funil abrir:
 *   1. `?modelo=<slug>` — veio de uma página de modelo, e é um pedido explícito
 *   2. nada salvo — abre o modelo de estreia, o mesmo que está desenhado no HTML
 *   3. já tem desenho salvo — não passa nada, e o editor recupera o trabalho dele
 */
async function documentoInicial(): Promise<unknown | undefined> {
  const pedido = new URLSearchParams(location.search).get('modelo');
  if (pedido) return baixarModelo(pedido);
  if (!temDesenhoSalvo()) return baixarModelo(MODELO_DE_ESTREIA);
  return undefined;
}

async function montar(raiz: HTMLElement) {
  const local = raiz.dataset.construtorLocal ?? 'folha-criador';
  const alvo = raiz.querySelector<HTMLElement>('[data-construtor-raiz]');
  const estatico = raiz.querySelector<HTMLElement>('[data-construtor-estatico]');
  const carregando = raiz.querySelector<HTMLElement>('[data-construtor-carregando]');
  if (!alvo) return;

  if (carregando) carregando.hidden = false;

  try {
    const [{ createElement }, { createRoot }, { CriadorDeFunil }, inicial] = await Promise.all([
      import('react'),
      import('react-dom/client'),
      import('@strat-ai-horus-os/funil-react'),
      documentoInicial(),
    ]);
    await import('@strat-ai-horus-os/funil-react/estilos.css');

    alvo.hidden = false;
    createRoot(alvo).render(
      createElement(CriadorDeFunil, {
        documentoInicial: inicial,
        aoRegistrarEvento: (nome: string, dados?: Record<string, unknown>) =>
          evento(nome, local, dados ?? {}),
      }),
    );

    // O desenho do build sai só depois que o editor está na tela: quem tem
    // conexão ruim nunca fica olhando para um quadro vazio.
    if (estatico) estatico.hidden = true;
    evento('ferramenta_aberta', local);
  } catch {
    // Pacote fora do ar, rede caída, navegador antigo: fica o desenho do build.
    if (alvo) alvo.hidden = true;
  } finally {
    if (carregando) carregando.hidden = true;
  }
}

function iniciar() {
  const raiz = document.querySelector<HTMLElement>('[data-construtor]');
  if (!raiz) return;

  // Sem IntersectionObserver (navegador antigo), monta direto.
  if (!('IntersectionObserver' in window)) {
    void montar(raiz);
    return;
  }

  const observador = new IntersectionObserver(
    (entradas) => {
      if (!entradas.some((e) => e.isIntersecting)) return;
      observador.disconnect();
      void montar(raiz);
    },
    { rootMargin: '300px' },
  );
  observador.observe(raiz);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', iniciar, { once: true });
} else {
  iniciar();
}
