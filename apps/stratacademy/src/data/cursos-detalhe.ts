// ============================================================
// Conteúdo das folhas de curso (onda 1).
// Contrato de página em docs/ARQUITETURA-SITE.md — a folha é SEO + pré-venda,
// nunca checkout: toda conversão é criar conta grátis no Hub (C1).
//
// ATENÇÃO: aqui descrevemos o que a FERRAMENTA faz e para quem serve — isso é
// verificável. A grade de aulas de cada trilha NÃO está aqui de propósito:
// ela é a fonte de verdade do Hub e deve ser puxada de lá, não inventada.
// ============================================================

export interface CursoDetalhe {
  /** Termo de busca que a página ataca — vai no title e no H1. */
  busca: string;
  h1: string;
  destaque: string;          // trecho do h1 que recebe o acento
  lead: string;
  /** Tag do blog usada para puxar os posts relacionados de verdade. */
  tagBlog: string;
  paraQuem: { icon: string; title: string; desc: string }[];
  naoEh: string;
  fazer: { icon: string; title: string; desc: string }[];
  faq: { q: string; a: string }[];
}

export const DETALHES: Record<string, CursoDetalhe> = {
  'claude-code': {
    busca: 'curso de Claude Code',
    h1: 'Curso de Claude Code: do primeiro comando ao projeto inteiro',
    destaque: 'ao projeto inteiro',
    lead:
      'O Claude Code roda no terminal e enxerga o seu repositório como um todo — lê, escreve, refatora e executa. A trilha vai do setup até usar ele em projeto de verdade, com contexto, regras e agentes.',
    tagBlog: 'claude-code',
    paraQuem: [
      { icon: 'code', title: 'Já programa', desc: 'Quer parar de copiar e colar de chat e ter a IA trabalhando dentro do repositório.' },
      { icon: 'terminal', title: 'Vive no terminal', desc: 'Prefere linha de comando a interface e quer automatizar o que hoje é repetitivo.' },
      { icon: 'business_center', title: 'Constrói para cliente', desc: 'Precisa entregar mais rápido sem perder controle do que foi gerado.' },
      { icon: 'school', title: 'Está começando', desc: 'Sabe o básico de código e quer subir de nível com uma ferramenta que explica o caminho.' },
    ],
    naoEh:
      'Não é um curso de lógica de programação. Se você nunca escreveu código, comece pela Masterclass de N8N — automação visual entrega resultado antes e prepara o terreno.',
    fazer: [
      { icon: 'folder_managed', title: 'Contexto de projeto', desc: 'Configurar o CLAUDE.md para o agente entender arquitetura, convenções e o que não pode ser tocado.' },
      { icon: 'edit_document', title: 'Editar de verdade', desc: 'Refatorar, criar arquivo, rodar teste e corrigir o próprio erro — não só sugerir trecho.' },
      { icon: 'hub', title: 'Conectar ferramentas', desc: 'Plugar bancos, APIs e serviços via MCP para o agente agir fora do editor.' },
      { icon: 'groups', title: 'Subagentes', desc: 'Dividir trabalho em agentes especializados em vez de um prompt gigante que se perde.' },
      { icon: 'bolt', title: 'Skills e comandos', desc: 'Empacotar o que você repete em skill e comando reutilizáveis.' },
      { icon: 'rocket_launch', title: 'Entregar', desc: 'Do protótipo ao que roda em produção, com revisão e controle no meio do caminho.' },
    ],
    faq: [
      { q: 'Preciso pagar o Claude para acompanhar?', a: 'O Claude Code exige uma conta na Anthropic para rodar, e isso é contratado direto com eles — não faz parte da assinatura da Strat Academy. Na trilha mostramos as opções de plano e como escolher sem gastar mais do que precisa.' },
      { q: 'Serve para quem não é desenvolvedor?', a: 'Serve para quem já tem alguma noção de código ou de terminal. Se você está partindo do absoluto zero, o caminho mais curto é começar pela Masterclass de N8N, que é gratuita, e voltar para cá depois.' },
      { q: 'Funciona em Windows?', a: 'Funciona. A trilha cobre o setup nos três sistemas, incluindo o caminho no Windows.' },
      { q: 'Isso substitui o Cursor?', a: 'Não são a mesma coisa e muita gente usa os dois. O Cursor é um editor com IA embutida; o Claude Code é um agente de terminal que trabalha no projeto inteiro. Temos trilha para os dois, e no blog há uma comparação detalhada.' },
    ],
  },

  n8n: {
    busca: 'curso de N8N',
    h1: 'Curso de N8N: automação que roda sozinha no seu negócio',
    destaque: 'roda sozinha',
    lead:
      'N8N conecta as ferramentas que a empresa já usa e faz o trabalho repetitivo acontecer sem ninguém clicando. A Masterclass é gratuita e vai do primeiro fluxo ao agente de IA respondendo por você.',
    tagBlog: 'n8n',
    paraQuem: [
      { icon: 'trending_up', title: 'Dono de negócio', desc: 'Quer tirar tarefa manual do time sem contratar mais gente para fazer o mesmo.' },
      { icon: 'work', title: 'Freelancer e agência', desc: 'Quer vender automação como serviço com entrega replicável.' },
      { icon: 'support_agent', title: 'Quem opera', desc: 'Vive em planilha, WhatsApp e CRM e sabe exatamente onde o processo trava.' },
      { icon: 'psychology', title: 'Quem quer IA aplicada', desc: 'Quer usar LLM dentro de um fluxo real, não em aba de chat solta.' },
    ],
    naoEh:
      'Não é para quem quer só entender o conceito. A trilha é de montar fluxo funcionando — se você não pretende colocar a mão na ferramenta, o conteúdo rende pouco.',
    fazer: [
      { icon: 'account_tree', title: 'Seu primeiro fluxo', desc: 'Gatilho, ação e condição: a lógica que sustenta qualquer automação depois.' },
      { icon: 'webhook', title: 'Webhooks e APIs', desc: 'Conectar sistema que não tem integração pronta e fazer os dois conversarem.' },
      { icon: 'chat', title: 'WhatsApp e atendimento', desc: 'Automatizar resposta, triagem e encaminhamento sem perder o toque humano.' },
      { icon: 'smart_toy', title: 'Agentes de IA', desc: 'Colocar um modelo dentro do fluxo com memória e contexto para decidir, não só responder.' },
      { icon: 'storage', title: 'Dados e memória', desc: 'Guardar histórico e estado para o fluxo lembrar do que já aconteceu.' },
      { icon: 'shield', title: 'Não quebrar', desc: 'Tratamento de erro, retentativa e log — o que separa demo de automação confiável.' },
    ],
    faq: [
      { q: 'A Masterclass de N8N é gratuita mesmo?', a: 'É. Ao criar sua conta no Strat Hub você já entra com a Masterclass de N8N completa liberada, sem cartão e sem prazo de degustação.' },
      { q: 'Preciso saber programar?', a: 'Não. N8N é automação visual: você monta o fluxo conectando blocos. Saber um pouco de lógica ajuda, e a própria trilha ensina o que você precisa no caminho.' },
      { q: 'Preciso pagar o N8N?', a: 'O N8N tem versão que você mesmo hospeda e versão em nuvem paga. A trilha mostra os dois caminhos para você escolher pelo seu caso — e dá para acompanhar tudo sem gastar com licença.' },
      { q: 'Dá para vender isso como serviço?', a: 'Muita gente na comunidade faz exatamente isso. A trilha foca em construir automação que funciona; a parte comercial de estruturar e vender projeto é aprofundada na mentoria.' },
    ],
  },

  cursor: {
    busca: 'curso de Cursor',
    h1: 'Curso de Cursor: o editor que entende o seu código',
    destaque: 'entende o seu código',
    lead:
      'O Cursor é um editor com IA no núcleo: ele lê o seu projeto, completa o que você ia escrever e edita vários arquivos de uma vez. A trilha mostra como usar isso sem perder o controle do que entra no repositório.',
    tagBlog: 'claude-code',
    paraQuem: [
      { icon: 'code', title: 'Desenvolvedor', desc: 'Quer velocidade real no dia a dia sem trocar de ambiente de trabalho.' },
      { icon: 'swap_horiz', title: 'Vem do VS Code', desc: 'Quer manter atalhos e extensões e ganhar a camada de IA por cima.' },
      { icon: 'groups', title: 'Time pequeno', desc: 'Precisa produzir como time grande sem abrir mão de revisão.' },
      { icon: 'rocket_launch', title: 'Constrói produto', desc: 'Está tocando projeto próprio e quer encurtar o caminho até a primeira versão.' },
    ],
    naoEh:
      'Não é uma trilha de introdução à programação. O Cursor acelera quem já sabe para onde está indo — se você ainda não escreve código, comece por N8N ou Lovable.',
    fazer: [
      { icon: 'auto_awesome', title: 'Autocomplete com contexto', desc: 'Sugestão que considera o seu projeto, não um trecho genérico da internet.' },
      { icon: 'edit_note', title: 'Editar vários arquivos', desc: 'Descrever a mudança e revisar o diff antes de aceitar qualquer coisa.' },
      { icon: 'travel_explore', title: 'Conversar com o repositório', desc: 'Perguntar onde algo acontece e entender código que você não escreveu.' },
      { icon: 'rule', title: 'Regras de projeto', desc: 'Ensinar convenções para a IA seguir o padrão do time em vez de inventar o dela.' },
      { icon: 'bug_report', title: 'Debug assistido', desc: 'Levar erro e stack trace para dentro do editor e sair com a correção testada.' },
      { icon: 'compare_arrows', title: 'Cursor x Claude Code', desc: 'Quando cada um rende mais e como usar os dois no mesmo fluxo de trabalho.' },
    ],
    faq: [
      { q: 'O Cursor é pago?', a: 'O Cursor tem plano gratuito com limites e planos pagos, contratados direto com eles. Não faz parte da assinatura da Strat Academy — na trilha explicamos o que dá para fazer no gratuito e quando vale subir.' },
      { q: 'Preciso abandonar o VS Code?', a: 'Não precisa. O Cursor é construído sobre a mesma base, então extensões, temas e atalhos em geral vêm junto. A trilha começa pela migração.' },
      { q: 'Cursor ou Claude Code?', a: 'Depende do trabalho. Cursor brilha na edição interativa, arquivo a arquivo; Claude Code brilha em tarefa longa e no projeto inteiro pelo terminal. Boa parte da comunidade usa os dois — e temos trilha para cada um.' },
    ],
  },

  lovable: {
    busca: 'curso de Lovable',
    h1: 'Curso de Lovable: do texto ao aplicativo no ar',
    destaque: 'ao aplicativo no ar',
    lead:
      'No Lovable você descreve o que quer e recebe uma aplicação funcionando, com banco, login e telas. A trilha mostra como sair do protótipo bonito e chegar em algo que aguenta usuário de verdade.',
    tagBlog: 'ia',
    paraQuem: [
      { icon: 'lightbulb', title: 'Tem a ideia', desc: 'Quer validar um produto sem esperar time técnico para começar.' },
      { icon: 'business_center', title: 'Empreendedor', desc: 'Precisa de MVP na mão para mostrar a cliente, sócio ou investidor.' },
      { icon: 'brush', title: 'Design e produto', desc: 'Desenha a experiência e quer prototipar de verdade, não em tela estática.' },
      { icon: 'speed', title: 'Quer velocidade', desc: 'Já programa e quer pular a parte chata do começo de todo projeto.' },
    ],
    naoEh:
      'Não é mágica. O Lovable te leva longe rápido, mas produto que cresce precisa de decisão de arquitetura e de segurança — a trilha é honesta sobre onde está esse limite.',
    fazer: [
      { icon: 'chat', title: 'Descrever bem', desc: 'O prompt é a especificação: como pedir para receber o que você tinha na cabeça.' },
      { icon: 'database', title: 'Banco e dados', desc: 'Modelar as tabelas e conectar a persistência sem virar bagunça na segunda semana.' },
      { icon: 'lock', title: 'Login e acesso', desc: 'Autenticação e permissão — quem entra e o que cada um pode ver.' },
      { icon: 'palette', title: 'Deixar com a sua cara', desc: 'Sair do visual padrão e aplicar identidade própria.' },
      { icon: 'public', title: 'Publicar', desc: 'Colocar no ar com domínio próprio e entender o que muda depois disso.' },
      { icon: 'warning', title: 'Onde tomar cuidado', desc: 'Os erros de segurança e de estrutura mais comuns em app gerado por IA.' },
    ],
    faq: [
      { q: 'Preciso saber programar?', a: 'Não para começar. Você constrói conversando. Entender o básico de como um app funciona ajuda a pedir melhor, e a trilha ensina esse vocabulário no caminho.' },
      { q: 'O Lovable é pago?', a: 'Tem plano gratuito com limite de uso e planos pagos, contratados direto com eles — fora da assinatura da Strat Academy. Dá para acompanhar boa parte da trilha no gratuito.' },
      { q: 'Dá para lançar um produto real?', a: 'Dá, e tem gente fazendo. Mas app que vai receber usuário e dado de terceiro precisa de cuidado com segurança, permissão e custo. A trilha trata disso em vez de fingir que não existe.' },
      { q: 'E se eu quiser continuar no código depois?', a: 'É um caminho comum: começa no Lovable e continua em Cursor ou Claude Code quando o projeto amadurece. Temos trilha para os dois.' },
    ],
  },
};

/** Slugs com folha publicada — usado pelo getStaticPaths e pelo catálogo. */
export const SLUGS_PUBLICADOS = Object.keys(DETALHES);
