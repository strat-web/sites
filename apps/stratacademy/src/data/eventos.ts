// ============================================================
// Eventos — URL perene, edição por data.
//
// A URL nunca muda entre edições: /eventos/<slug> acumula autoridade ao longo
// dos anos. A data vive AQUI, não no endereço. Quando não há edição marcada
// (`edicao: null`), a página troca lotes e agenda por lista de espera em vez
// de virar página morta. Ver docs/ARQUITETURA-SITE.md.
//
// Para abrir uma edição: preencha `edicao`. Para fechar: volte para null —
// o recap da última edição continua na página como prova social.
// ============================================================

export interface Lote {
  nome: string;
  preco: string;
  nota?: string;
  esgotado?: boolean;
}

export interface Edicao {
  /** Como aparece na tela. Ex.: "14 e 15 de março de 2027" */
  data: string;
  /** ISO para o JSON-LD Event. Ex.: "2027-03-14T09:00:00-03:00" */
  inicioISO: string;
  fimISO: string;
  cidade: string;
  local: string;
  vagas?: string;
  lotes: Lote[];
  checkout: string;
}

export interface Evento {
  slug: string;
  nome: string;
  formato: 'Presencial' | 'Online';
  mark: string;
  tagline: string;
  h1: string;
  destaque: string;
  lead: string;
  /** null = sem edição marcada -> a página vira lista de espera. */
  edicao: Edicao | null;
  /** Recap da última edição — prova social que sobrevive entre edições. */
  recap: string | null;
  paraQuem: string[];
  sai: { icon: string; title: string; desc: string }[];
  agenda: { n: string; title: string; desc: string }[];
  faq: { q: string; a: string }[];
}

export const EVENTOS: Evento[] = [
  {
    slug: 'imersao-claude-code',
    nome: 'Imersão Claude Code',
    formato: 'Presencial',
    mark: 'imersao',
    tagline: 'Dois dias presenciais para sair com projeto rodando, não com anotação.',
    h1: 'Imersão Claude Code: dois dias para sair construindo',
    destaque: 'sair construindo',
    lead:
      'Presencial, em hotel, com a turma na mesma sala e a gente do lado. Você chega com um projeto na cabeça e sai com ele rodando — usando Claude Code do jeito que a gente usa na operação real.',
    edicao: null,
    recap: null,
    paraQuem: [
      'Já mexeu com Claude Code e quer parar de arranhar a superfície',
      'Aprende melhor com alguém do lado do que assistindo aula sozinho',
      'Tem um projeto específico e quer usar dois dias para destravá-lo',
      'Quer conhecer pessoalmente quem está construindo as mesmas coisas',
    ],
    sai: [
      { icon: 'rocket_launch', title: 'Um projeto seu rodando', desc: 'Você traz o problema. Nos dois dias a gente constrói junto até funcionar.' },
      { icon: 'settings', title: 'Ambiente configurado', desc: 'Sua máquina sai da imersão com o setup completo, contexto e regras de projeto.' },
      { icon: 'groups', title: 'Turma pequena', desc: 'Presencial serve para ter atenção individual. Por isso a vaga é limitada.' },
      { icon: 'video_library', title: 'Gravação no Hub', desc: 'Tudo fica registrado e liberado na sua conta do Strat Hub depois do evento.' },
    ],
    agenda: [
      { n: '01', title: 'Setup e contexto', desc: 'Instalação, configuração e como ensinar o projeto ao agente para ele parar de chutar.' },
      { n: '02', title: 'Trabalho no projeto inteiro', desc: 'Refatoração, criação de feature e correção com o agente atuando no repositório.' },
      { n: '03', title: 'Conectar o mundo', desc: 'MCP, integrações e o agente agindo fora do editor.' },
      { n: '04', title: 'Agentes e escala', desc: 'Subagentes, skills e comandos para o que você repete todo dia.' },
      { n: '05', title: 'Seu projeto no ar', desc: 'A última etapa é levar o que você construiu na imersão para funcionar de verdade.' },
    ],
    faq: [
      { q: 'Preciso levar computador?', a: 'Sim, e é essencial. A imersão é mão na massa do começo ao fim — você trabalha na sua própria máquina, com o seu próprio projeto.' },
      { q: 'Preciso já saber usar o Claude Code?', a: 'Ajuda muito. O ideal é chegar tendo pelo menos instalado e brincado um pouco. Quem cria a conta no Strat Hub tem a Masterclass de Claude Code liberada de graça — é a preparação perfeita.' },
      { q: 'Está incluso hospedagem ou passagem?', a: 'Não. O ingresso cobre a imersão e a estrutura do dia. Deslocamento e hospedagem ficam por sua conta, e a gente informa o hotel com antecedência para quem vem de fora.' },
      { q: 'Vou receber a gravação?', a: 'Sim. O conteúdo fica registrado e liberado na sua conta do Strat Hub depois do evento, para você revisitar quando precisar.' },
      { q: 'Quando será a próxima edição?', a: 'Não temos agenda fixa — abrimos edição quando faz sentido. Entrando na lista de espera você é avisado antes de virar público, e o primeiro lote costuma ser o menor.' },
    ],
  },
  {
    slug: 'bootcamp-claude-code',
    nome: 'Bootcamp Claude Code',
    formato: 'Online',
    mark: 'bootcamp',
    tagline: 'Ao vivo, online, com foco em usar Claude Code dentro do negócio.',
    h1: 'Bootcamp Claude Code para Negócios, ao vivo',
    destaque: 'ao vivo',
    lead:
      'Uma sequência de encontros ao vivo, online, para tirar o Claude Code do experimento pessoal e colocar dentro da operação. Você participa ao vivo e fica com a gravação no Hub.',
    edicao: null,
    recap: null,
    paraQuem: [
      'Quer aplicar Claude Code no trabalho, não só em projeto de fim de semana',
      'Prefere ao vivo, com espaço para perguntar na hora',
      'Está longe ou não consegue viajar para a imersão presencial',
      'Precisa de resultado aplicável rápido, dentro da rotina que já existe',
    ],
    sai: [
      { icon: 'live_tv', title: 'Aulas ao vivo', desc: 'Encontros com espaço real para pergunta — não é vídeo gravado com chat fechado.' },
      { icon: 'business_center', title: 'Foco em negócio', desc: 'O recorte é aplicar na operação: processo, entrega e o que dá retorno.' },
      { icon: 'video_library', title: 'Gravação no Hub', desc: 'Perdeu um encontro ou quer rever? Fica tudo salvo na sua conta.' },
      { icon: 'forum', title: 'Turma junto', desc: 'Você acompanha com gente resolvendo os mesmos problemas ao mesmo tempo.' },
    ],
    agenda: [
      { n: '01', title: 'Fundamentos aplicados', desc: 'Setup e os primeiros ganhos reais dentro do seu contexto de trabalho.' },
      { n: '02', title: 'O agente no seu processo', desc: 'Identificar onde ele entra na operação e onde ele só atrapalha.' },
      { n: '03', title: 'Automatizar o repetitivo', desc: 'Empacotar em comando e skill o que hoje você refaz toda semana.' },
      { n: '04', title: 'Entregar com controle', desc: 'Revisão, limites e o que nunca deve ser delegado sem olhar.' },
    ],
    faq: [
      { q: 'É ao vivo mesmo ou gravado?', a: 'Os encontros são ao vivo, com espaço para pergunta. A gravação é um bônus que fica na sua conta do Strat Hub depois — não é o produto principal.' },
      { q: 'E se eu perder um encontro?', a: 'Você assiste pela gravação no Hub. Mas o ao vivo é onde está o maior valor, porque é quando você consegue perguntar sobre o seu caso.' },
      { q: 'Preciso saber programar?', a: 'Ajuda ter noção de código ou de terminal. Se você está no zero absoluto, comece pela Masterclass de N8N, que é gratuita, e volte depois.' },
      { q: 'Já sou assinante, tenho desconto?', a: 'Bootcamp é ingresso à parte da assinatura. Quando abrimos edição, avisamos primeiro quem está na lista de espera e quem já é aluno.' },
      { q: 'Quando abre a próxima turma?', a: 'Não temos calendário fixo. Entre na lista de espera para ser avisado antes da abertura pública.' },
    ],
  },
];

export const getEvento = (slug: string) => EVENTOS.find((e) => e.slug === slug);
