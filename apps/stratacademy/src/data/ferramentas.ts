// ============================================================
// Central de ferramentas gratuitas — fonte de verdade.
//
// Mesma ideia do catalogo.ts: os dados moram aqui, as páginas só renderizam.
// Toda ferramenta serve a conversão C1 (criar conta grátis no Hub) — ela resolve
// a tarefa de graça e sem cadastro, e o cadastro é o passo seguinte, não o pedágio.
//
// O código NÃO é publicado, e nenhuma página promete que seja. A prova de
// privacidade que a central usa é outra, e é melhor justamente por não depender
// de repositório: abra o F12 na aba Rede e veja que nenhuma requisição sai.
//
// Regra de ouro para as páginas que consomem isto: o conteúdo tem que estar no
// HTML do build. GPTBot, ClaudeBot e PerplexityBot não executam JavaScript — se
// o texto só aparece depois de um clique, para eles a página está vazia.
//
// Ver docs/ARQUITETURA-SITE.md (as três conversões, contrato de conteúdo).
// ============================================================

import { HUB } from './catalogo';

export { HUB };

export type StatusFerramenta = 'no-ar' | 'em-construcao' | 'planejada';

export interface Ferramenta {
  /** Vira /ferramentas/<slug>. É também o termo de busca, sem acento. */
  slug: string;
  /** Nome curto, como a pessoa chama. Usado em card e migalha. */
  nome: string;
  /** O que a pessoa CONSEGUE FAZER. Vira o h1 da folha — tarefa, não produto. */
  tarefa: string;
  /** O que ela digita no Google. Guia title, h1 e o primeiro parágrafo. */
  termoDeBusca: string;
  /** Uma frase: o que faz e para quem é. Vai no card do hub e no lead da folha. */
  resumo: string;
  status: StatusFerramenta;
  /** Slug do post do blog que conta como foi construída. `null` = ainda não escrito. */
  postDoBlog: string | null;
  /**
   * A key desta ferramenta no Rastro (`functions/_web-products.js` do repo do
   * tracking). Vai como `product` em todo evento das páginas dela, e é o que
   * permite separar o uso da ferramenta do resto do site no PostHog e no Rastro.
   *
   * PRECISA ESTAR CADASTRADA NO RASTRO antes de ir para o ar. Key desconhecida
   * não quebra nada — cai na config `default` —, mas volta com `known: false` e
   * o evento deixa de ser separável. Para conferir:
   *   curl -s "https://tracking.stratacademy.com.br/strat-track?product=<slug>" \
   *     | grep -o '"known":[a-z]*'
   */
  slugRastro: string;
}

// ------------------------------------------------------------
// Duas ferramentas de funil, duas buscas diferentes — de propósito.
//
// Quem busca "criador" quer DESENHAR o caminho; quem busca "calculadora" quer o
// DIAGNÓSTICO a partir de números que já existem. Cada uma tem a sua página, e
// cada página manda para a outra no lugar certo do texto.
// ------------------------------------------------------------

export const FERRAMENTAS: Ferramenta[] = [
  {
    slug: 'criador-de-funil-de-vendas',
    nome: 'Criador de funil de vendas',
    tarefa: 'Criador de funil de vendas: desenhe o caminho inteiro do cliente',
    termoDeBusca: 'criador de funil de vendas',
    resumo:
      'Desenha o funil de vendas arrastando etapas — anúncio, página, e-mail, WhatsApp, checkout — até o caminho inteiro caber numa tela só. Para quem precisa combinar o funil com o time, com o cliente ou consigo mesmo antes de sair montando.',
    status: 'no-ar',
    postDoBlog: 'como-desenhar-o-funil-de-vendas-do-seu-negocio',
    slugRastro: 'criador-funil',
  },
  {
    slug: 'calculadora-de-funil-de-vendas',
    nome: 'Calculadora de funil de vendas',
    tarefa: 'Calculadora de funil de vendas: descubra onde você perde cliente',
    termoDeBusca: 'calculadora de funil de vendas',
    resumo:
      'Monta o funil de vendas do seu negócio etapa por etapa, calcula a taxa de conversão de cada passagem e mostra onde você está perdendo gente. Para quem vende e não sabe dizer em que ponto o cliente some.',
    status: 'no-ar',
    postDoBlog: 'onde-voce-perde-cliente-no-funil-de-vendas',
    slugRastro: 'calculadora-funil',
  },
  {
    slug: 'calculadora-de-custo-whatsapp-api',
    nome: 'Calculadora de custo da API do WhatsApp',
    tarefa: 'Calculadora de custo da API do WhatsApp: quanto você paga à Meta por mês',
    termoDeBusca: 'calculadora custo whatsapp api',
    resumo:
      'Calcula quanto a sua empresa paga por mês na API oficial do WhatsApp — marketing, utilidade, autenticação e atendimento — com a tabela da Meta em vigor desde 1º de outubro de 2026, e mostra o que a mudança de regra acrescentou à conta. Para quem usa ou vai contratar a API e quer o número antes da fatura.',
    status: 'no-ar',
    postDoBlog: 'novos-precos-da-api-do-whatsapp-o-que-mudou-em-outubro-de-2026',
    slugRastro: 'calculadora-whatsapp',
  },
];

/** Só o que já pode receber tráfego. O hub e o sitemap usam esta lista. */
export const FERRAMENTAS_NO_AR = FERRAMENTAS.filter((f) => f.status === 'no-ar');

export const rotaFerramenta = (slug: string) => `/ferramentas/${slug}/`;

/**
 * O `product` do hub `/ferramentas/`.
 *
 * O hub não é uma ferramenta — ele lista todas.
 *
 * DECIDIDO em 2026-09-23, quando entrou a segunda ferramenta: o hub continua
 * emitindo a key da calculadora, que é a ferramenta que já tem tráfego. Uma key
 * própria ('central-ferramentas') só entra aqui DEPOIS de cadastrada no Rastro —
 * key não cadastrada não quebra nada, mas volta com `known: false` e o evento
 * deixa de ser separável. Por isso esta constante é explícita, e não derivada de
 * `FERRAMENTAS[0]`: a ordem da lista muda, a atribuição não pode mudar junto.
 */
export const SLUG_RASTRO_CENTRAL = 'calculadora-funil';

export const buscarFerramenta = (slug: string) => FERRAMENTAS.find((f) => f.slug === slug);

/**
 * A key do Rastro de um post do blog. O post de lançamento de uma ferramenta é a
 * porta de entrada de busca dela, então emite a key da ferramenta, não "site" —
 * senão o tráfego que chega pelo conteúdo some do funil da ferramenta.
 *
 * Deriva do `postDoBlog`: o post da próxima ferramenta herda a key sozinho.
 * Post que não é de lançamento devolve undefined, e o RubikLayout cai em "site".
 */
export const slugRastroDoPost = (postId: string): string | undefined =>
  FERRAMENTAS.find((f) => f.postDoBlog === postId)?.slugRastro;

// ------------------------------------------------------------
// Conteúdo da folha /ferramentas/criador-de-funil-de-vendas
//
// Os MODELOS desta ferramenta não moram aqui: eles vêm do pacote
// `@strat-ai-horus-os/funil-nucleo`, publicado pela oficina, e são a mesma fonte
// que a ferramenta usa por dentro. Duas cópias do mesmo parágrafo divergem.
// ------------------------------------------------------------

export { MODELOS as MODELOS_CONSTRUTOR, buscarModeloPublicado } from '@strat-ai-horus-os/funil-nucleo';

/** As cinco famílias de elemento do editor. Vira tabela na folha. */
export const CATEGORIAS_CONSTRUTOR = [
  {
    nome: 'Tráfego',
    desc: 'De onde a pessoa vem: anúncio, tráfego orgânico, Instagram, YouTube, indicação, lista.',
    exemplo: 'Tráfego pago, Audiência, Instagram, YouTube',
  },
  {
    nome: 'Páginas',
    desc: 'Onde ela cai: captura, vendas, checkout, obrigado, webinário, área de membros, upsell.',
    exemplo: 'Página de captura, Página de vendas, Checkout',
  },
  {
    nome: 'Mensagens',
    desc: 'O que você manda depois: e-mail avulso, sequência de e-mails, WhatsApp, SMS.',
    exemplo: 'E-mail, Sequência de e-mails, WhatsApp',
  },
  {
    nome: 'Lógica e ações',
    desc: 'O que acontece no meio: lead, compra, espera, condição, carrinho abandonado, remarketing, tag.',
    exemplo: 'Lead, Esperar, Se / Ou, Carrinho abandonado',
  },
  {
    nome: 'Formas',
    desc: 'Para organizar o desenho: texto livre, nota e a moldura que agrupa um pedaço do funil.',
    exemplo: 'Texto, Nota, Etapa',
  },
] as const;

/** O passo a passo em texto. São os mesmos passos que a ferramenta executa. */
export const PASSOS_CONSTRUTOR: PassoFunil[] = [
  {
    n: 1,
    titulo: 'Comece pelo fim: onde o dinheiro entra',
    texto:
      'Coloque primeiro a etapa em que a pessoa paga — checkout, proposta aceita, assinatura. Desenhar de trás para frente evita o funil bonito que não termina em venda: cada etapa que você acrescentar depois precisa responder "isso aproxima do pagamento?". Se não aproxima, é conteúdo, não funil.',
  },
  {
    n: 2,
    titulo: 'Marque de onde a pessoa vem',
    texto:
      'Anúncio, busca, Instagram, indicação, lista que você já tem. Use um elemento por origem de verdade, não por canal que você gostaria de ter. Duas origens diferentes quase sempre precisam de páginas diferentes, e é esse o detalhe que o desenho revela antes de você gastar com tráfego.',
  },
  {
    n: 3,
    titulo: 'Ponha as páginas no meio, na ordem real',
    texto:
      'Captura, entrega, vendas, checkout, obrigado. A ordem tem que ser a que acontece, não a que está no seu plano: se hoje o anúncio manda direto para o WhatsApp, desenhe isso. O funil desenhado serve justamente para você ver o que existe antes de discutir o que deveria existir.',
  },
  {
    n: 4,
    titulo: 'Ligue cada passagem com uma seta',
    texto:
      'Arraste da bolinha de um elemento até o outro. Cada seta é uma passagem que depois vira uma taxa de conversão — e passagem que você não consegue medir é o primeiro lugar onde o funil vaza sem ninguém perceber.',
  },
  {
    n: 5,
    titulo: 'Desenhe também quem não comprou',
    texto:
      'Carrinho abandonado, quem não abriu, quem assistiu e não clicou. É o pedaço que a maioria esquece e o que costuma pagar a campanha: recuperar quem já demonstrou interesse é sempre mais barato do que comprar atenção nova. Use as condições e as esperas para mostrar esse caminho.',
  },
  {
    n: 6,
    titulo: 'Use os nomes que o seu time usa',
    texto:
      'Renomeie cada elemento com o nome real: "Aula 1 — o problema" diz mais que "Página de vídeo". O funil desenhado é um documento de combinação entre você, o time e quem executa; ele só funciona se as palavras forem as mesmas que aparecem no WhatsApp do grupo.',
  },
  {
    n: 7,
    titulo: 'Exporte e combine com quem vai montar',
    texto:
      'Baixe o arquivo e mande para quem executa, ou abra em tela cheia na reunião. Guarde a versão de hoje: quando o funil mudar, a comparação entre o desenho velho e o novo é o registro mais honesto do que você testou.',
  },
];

/** O que a ferramenta entrega. Só o que existe hoje — nada de promessa. */
export const EXPORTACOES_CONSTRUTOR = [
  {
    formato: 'JSON',
    titulo: 'Arquivo do funil',
    desc: 'O funil inteiro num arquivo, do jeito que está na tela. Serve para guardar a versão de hoje, mandar para quem executa ou abrir em outro computador.',
  },
  {
    formato: 'Importar',
    titulo: 'Abrir um funil salvo',
    desc: 'O mesmo arquivo volta para dentro do editor, inclusive o que foi exportado de outro navegador. Nada é enviado para nós no caminho.',
  },
  {
    formato: 'Tela cheia',
    titulo: 'Modo apresentação',
    desc: 'Esconde os painéis e deixa só o funil, para mostrar numa reunião ou numa chamada sem aparecer a interface de edição.',
  },
  {
    formato: 'Offline',
    titulo: 'Funciona sem internet',
    desc: 'Depois que a página abre, o editor não precisa mais de rede: dá para desligar o wi-fi e continuar desenhando. O funil fica salvo no seu navegador.',
  },
] as const;

export const FAQ_CONSTRUTOR = [
  {
    q: 'É gratuito mesmo? Precisa criar conta?',
    a: 'É gratuito e não pede cadastro. Você abre a página e desenha. Não há limite de funis, versão paga escondida nem pedido de e-mail no meio do caminho.',
  },
  {
    q: 'Onde o meu funil fica salvo?',
    a: 'No seu próprio navegador, automaticamente, enquanto você desenha. Ele não passa por nós e não fica numa conta — o que também significa que limpar os dados do navegador apaga o funil. Se ele importa, exporte o arquivo: é um clique e é a sua cópia de segurança.',
  },
  {
    q: 'Dá para usar no celular?',
    a: 'Dá, e os painéis se ajustam à tela pequena, mas desenhar funil é uma tarefa de tela grande: no celular funciona melhor para mostrar um funil pronto do que para montar um do zero.',
  },
  {
    q: 'Qual a diferença para a calculadora de funil de vendas?',
    a: 'São duas tarefas. O criador desenha o caminho: quais etapas existem e como elas se ligam. A calculadora faz o diagnóstico: você põe quantas pessoas passaram em cada etapa e ela mostra onde está o gargalo. Na prática, desenhe primeiro aqui e leve os números para a calculadora depois.',
  },
  {
    q: 'Dá para mandar um link do funil para outra pessoa?',
    a: 'Ainda não. Hoje o caminho é exportar o arquivo e enviar, ou abrir o modo apresentação numa chamada. O link compartilhável está em construção, e ele vai nascer com o conteúdo cifrado no seu navegador — a Strat hospeda bytes que não consegue ler.',
  },
  {
    q: 'Quantas etapas um funil deve ter?',
    a: 'As que você consegue medir. Um funil de cinco etapas bem definidas vale mais que um de vinte cheio de caixas que ninguém acompanha. Comece por um dos modelos prontos e tire o que não existe no seu negócio.',
  },
];

// ------------------------------------------------------------
// Conteúdo da folha /ferramentas/calculadora-de-funil-de-vendas
// ------------------------------------------------------------

/** As etapas padrão de um funil. O passo a passo em texto e a ferramenta usam as mesmas. */
export interface EtapaFunil {
  chave: string;
  nome: string;
  /** O que acontece com a pessoa nesta etapa. */
  descricao: string;
  /** Como se mede — o que contar para saber o tamanho da etapa. */
  comoMedir: string;
}

export const ETAPAS_FUNIL: EtapaFunil[] = [
  {
    chave: 'visitantes',
    nome: 'Visitantes',
    descricao:
      'Todo mundo que chega até você — site, perfil, anúncio, indicação. Ainda não pediu nada nem deixou contato.',
    comoMedir: 'Sessões únicas no período, ou alcance da campanha se o tráfego for de anúncio.',
  },
  {
    chave: 'leads',
    nome: 'Leads',
    descricao:
      'Quem deixou um contato: e-mail, WhatsApp, formulário preenchido. Deu permissão para você falar de novo.',
    comoMedir: 'Cadastros no período, sem contar duplicado. Um e-mail que se inscreveu duas vezes é um lead.',
  },
  {
    chave: 'qualificados',
    nome: 'Qualificados',
    descricao:
      'Os leads que têm o problema que você resolve, orçamento e alguma urgência. O resto é lista, não é pipeline.',
    comoMedir: 'Leads que passaram no seu critério de qualificação — respondido em call, formulário ou triagem.',
  },
  {
    chave: 'oportunidades',
    nome: 'Oportunidades',
    descricao: 'Quem recebeu proposta, orçamento ou viu a página de checkout. Está decidindo.',
    comoMedir: 'Propostas enviadas, ou carrinhos e checkouts iniciados no período.',
  },
  {
    chave: 'clientes',
    nome: 'Clientes',
    descricao: 'Fechou e pagou. É o único número do funil que aparece no extrato.',
    comoMedir: 'Vendas pagas no período. Se houver reembolso, desconte — funil que conta venda estornada mente.',
  },
];

/** O passo a passo em texto. São os mesmos passos que a ferramenta executa. */
export interface PassoFunil {
  n: number;
  titulo: string;
  texto: string;
}

export const PASSOS_FUNIL: PassoFunil[] = [
  {
    n: 1,
    titulo: 'Escolha o período e não misture',
    texto:
      'Pegue uma janela só — o mês passado, ou os últimos 30 dias — e use ela para todas as etapas. Contar visitante do mês e venda do trimestre é o erro mais comum: a taxa sai absurdamente baixa e você conclui a coisa errada. Se o seu ciclo de venda for longo, use uma janela maior que o ciclo, não menor.',
  },
  {
    n: 2,
    titulo: 'Liste as etapas do seu funil, na ordem real',
    texto:
      'Comece pelas cinco padrão — visitantes, leads, qualificados, oportunidades, clientes — e ajuste para o que de fato acontece no seu negócio. Quem vende por WhatsApp costuma ter conversa iniciada no meio. Quem vende produto digital muitas vezes não tem qualificação. Etapa que você não consegue medir não deve entrar: ela vira um buraco no cálculo.',
  },
  {
    n: 3,
    titulo: 'Preencha o número absoluto de cada etapa',
    texto:
      'Números inteiros, no mesmo período, contando pessoa e não evento. Se a mesma pessoa abriu três checkouts, é uma oportunidade, não três. Cada etapa precisa ser um subconjunto da anterior: todo cliente foi oportunidade antes, toda oportunidade foi lead antes. Se um número ficar maior que o de cima, a contagem está errada em algum lugar.',
  },
  {
    n: 4,
    titulo: 'Calcule a taxa de conversão de cada passagem',
    texto:
      'Divida a etapa de baixo pela de cima e multiplique por cem. Cem leads que viraram vinte qualificados dão 20% de conversão naquela passagem. Faça isso para cada degrau, não só do topo para o fim — é a taxa por passagem que aponta onde está o problema; a taxa geral só diz que existe um.',
  },
  {
    n: 5,
    titulo: 'Ache o gargalo: a menor taxa entre duas etapas',
    texto:
      'O gargalo é a passagem com a pior taxa, e é lá que está o dinheiro. Dobrar uma etapa que já converte 40% dá menos resultado do que arrumar uma que converte 3%. Cuidado com o gargalo falso: taxa baixa de visitante para lead pode ser tráfego errado chegando, não formulário ruim.',
  },
  {
    n: 6,
    titulo: 'Calcule quanto vale um ponto percentual',
    texto:
      'Multiplique o número de clientes pelo seu ticket médio para achar a receita do funil. Depois recalcule subindo só a taxa do gargalo em um ponto e veja a diferença. Esse número é o que justifica — ou derruba — a próxima ação: se um ponto no gargalo vale R$ 800 por mês, não faz sentido gastar R$ 5.000 para tentar consegui-lo.',
  },
  {
    n: 7,
    titulo: 'Refaça no mês seguinte e compare',
    texto:
      'Funil é uma foto de um período, não um retrato permanente. O valor aparece na série: mesma medição, mesmas etapas, mês a mês. É a comparação que mostra se o que você mudou funcionou — uma medição isolada não prova nada.',
  },
];

/** Modelos prontos — cada um vira /ferramentas/calculadora-de-funil-de-vendas/modelos/<slug>. */
export interface ModeloFunil {
  slug: string;
  nome: string;
  /** h1 da página do modelo. */
  titulo: string;
  /** Uma frase: para quem é este modelo. */
  resumo: string;
  /** Para quem serve, em texto corrido. */
  paraQuem: string;
  /** Em que momento este modelo é a escolha certa — e quando não é. */
  quandoUsar: string;
  /** As armadilhas de MEDIÇÃO deste tipo de funil: o que é fácil contar errado. */
  oQueObservar: string;
  /** As etapas deste modelo, com números de exemplo plausíveis. */
  etapas: { nome: string; valor: number; nota: string }[];
  /** Ticket médio de referência, em reais. */
  ticket: number;
  /** O que costuma ser o gargalo neste tipo de funil, e o que fazer. */
  gargaloTipico: string;
}

export const MODELOS_FUNIL: ModeloFunil[] = [
  {
    slug: 'ecommerce',
    nome: 'E-commerce',
    titulo: 'Modelo de funil de vendas para e-commerce',
    resumo: 'Da visita na loja ao pedido pago, com o carrinho abandonado no lugar certo.',
    paraQuem:
      'Loja virtual que vende produto físico ou digital com checkout próprio. Serve tanto para quem vive de tráfego pago quanto para quem já tem busca orgânica: o que muda é o tamanho do topo, não a forma do funil.',
    quandoUsar:
      'Use quando a venda fecha sozinha, sem conversa: a pessoa entra, escolhe e paga. Se o seu processo tem negociação, orçamento ou reunião no meio, o modelo B2B descreve melhor o que acontece. Também vale para produto digital com checkout próprio, desde que não haja etapa de qualificação humana. Meça mês fechado; semana em e-commerce oscila demais com dia de pagamento e frete grátis para significar alguma coisa.',
    oQueObservar:
      'O erro clássico é contar sessão em vez de pessoa: quem volta três vezes antes de comprar vira três visitantes e afunda a taxa. Use usuários únicos sempre que a sua ferramenta permitir. O segundo erro é contar pedido gerado em vez de pedido pago — boleto emitido e não pago infla o fim do funil em até um terço em algumas operações. E separe tráfego de campanha do orgânico antes de concluir qualquer coisa: uma promoção relâmpago distorce a passagem de produto para carrinho e some no mês seguinte.',
    etapas: [
      { nome: 'Visitantes da loja', valor: 12000, nota: 'Sessões únicas no mês, somando orgânico, pago e direto.' },
      { nome: 'Viram um produto', valor: 4800, nota: 'Chegaram a abrir uma página de produto — passaram da vitrine.' },
      { nome: 'Adicionaram ao carrinho', valor: 960, nota: 'Momento de intenção real. É aqui que a maioria das lojas para de medir.' },
      { nome: 'Iniciaram o checkout', valor: 384, nota: 'Começaram a preencher dados. A diferença para o carrinho é o abandono clássico.' },
      { nome: 'Pedidos pagos', valor: 154, nota: 'Pagamento aprovado. Boleto gerado e não pago não conta.' },
    ],
    ticket: 180,
    gargaloTipico:
      'Quase sempre entre ver o produto e adicionar ao carrinho — o problema costuma ser preço sem contexto, frete que só aparece no fim ou foto que não responde a dúvida óbvia. A segunda maior perda é do checkout para o pedido pago, e aí a causa é quase sempre número de campos ou falta do meio de pagamento que o público usa.',
  },
  {
    slug: 'servicos-b2b',
    nome: 'Serviços B2B',
    titulo: 'Modelo de funil de vendas para serviços B2B',
    resumo: 'Ciclo longo, poucos leads, ticket alto — o funil onde qualificação vale mais que volume.',
    paraQuem:
      'Agência, consultoria, software sob medida, prestador de serviço recorrente. Quem vende por proposta e reunião, não por botão de comprar.',
    quandoUsar:
      'Use quando existe uma conversa antes do sim: proposta, reunião, negociação. É o modelo certo para ticket alto e volume baixo, onde vinte leads bem escolhidos valem mais que duzentos. Se você vende por botão, sem falar com ninguém, use o de e-commerce ou o de infoproduto. A janela de medição precisa ser maior que o seu ciclo de venda — se você fecha em noventa dias, medir mês contra mês compara lead novo com venda de três meses atrás e não quer dizer nada.',
    oQueObservar:
      'Em B2B a perda mais cara é invisível: o no-show. Quem marcou e não apareceu não aparece em nenhum relatório automático, então conte reunião realizada, não reunião agendada — a diferença entre as duas costuma ser a maior descoberta da primeira medição. Cuidado também com o lead reciclado: o contato que voltou depois de seis meses não é lead novo, e contá-lo de novo faz o topo parecer maior do que é. E não misture inbound com prospecção ativa no mesmo funil: as taxas são tão diferentes que a média não descreve nenhum dos dois.',
    etapas: [
      { nome: 'Visitantes do site', valor: 3200, nota: 'Tráfego do mês. Em B2B o topo é pequeno e isso não é problema.' },
      { nome: 'Pediram contato', valor: 96, nota: 'Formulário, WhatsApp ou e-mail. É o lead bruto.' },
      { nome: 'Reunião realizada', valor: 42, nota: 'Apareceu na call. Marcar e não aparecer é a perda invisível do B2B.' },
      { nome: 'Proposta enviada', valor: 24, nota: 'Passou na qualificação e recebeu número.' },
      { nome: 'Contratos fechados', valor: 7, nota: 'Assinou e pagou a primeira parcela.' },
    ],
    ticket: 8500,
    gargaloTipico:
      'A perda que mais dói é entre pedir contato e realizar a reunião — no-show. Costuma ser resolvido com confirmação automática e um intervalo menor entre o pedido e a call, não com mais tráfego. Quando a perda está da proposta para o contrato, o problema raramente é preço: é proposta que chega sem o cliente ter entendido o escopo.',
  },
  {
    slug: 'infoproduto',
    nome: 'Infoproduto',
    titulo: 'Modelo de funil de vendas para infoproduto',
    resumo: 'Isca, e-mail, oferta — o funil de lançamento e de perpétuo, medido do mesmo jeito.',
    paraQuem:
      'Quem vende curso, mentoria, comunidade ou material digital. Funciona para lançamento com carrinho e para venda perpétua; o que muda é a janela de medição.',
    quandoUsar:
      'Use para curso, mentoria, comunidade ou material digital, tanto em lançamento com carrinho aberto quanto em venda perpétua. O que muda entre os dois é só a janela: em lançamento, meça a campanha inteira, do início da captação ao fechamento do carrinho; em perpétuo, meça o mês. Se o seu produto é assinatura de software, o modelo de SaaS descreve melhor, porque tem ativação no meio.',
    oQueObservar:
      'A etapa que quase ninguém mede é o consumo, e é justamente ela que prevê a venda: lista grande que não abre nada não compra, e sem esse degrau o funil mente dizendo que o problema é a oferta. Em lançamento, atenção a contar lead da campanha junto com base antiga — quem já estava na lista converte com taxa completamente diferente de quem entrou essa semana, e somar os dois esconde as duas histórias. Por fim, desconte o reembolso: em infoproduto ele é alto o bastante para mudar a conclusão sobre o que funcionou.',
    etapas: [
      { nome: 'Visitantes da página de captura', valor: 9000, nota: 'Tráfego que chegou na isca, de qualquer origem.' },
      { nome: 'Leads captados', valor: 2700, nota: 'Deixaram e-mail ou WhatsApp em troca do material.' },
      { nome: 'Consumiram o conteúdo', valor: 810, nota: 'Abriram a aula, assistiram o vídeo, baixaram o PDF. Quem não consome não compra.' },
      { nome: 'Foram para a oferta', valor: 324, nota: 'Clicaram no botão e viram o preço.' },
      { nome: 'Compras aprovadas', valor: 39, nota: 'Pagamento confirmado, já descontado o reembolso do período.' },
    ],
    ticket: 397,
    gargaloTipico:
      'Entre captar o lead e ele consumir o conteúdo. A maior parte dos funis de infoproduto tem uma lista grande que nunca abriu nada — e aí o problema não é a oferta, é que a promessa da isca não bateu com o que foi entregue. Mexer no preço antes de arrumar o consumo é gastar esforço no lugar errado.',
  },
  {
    slug: 'saas',
    nome: 'SaaS',
    titulo: 'Modelo de funil de vendas para SaaS',
    resumo: 'Trial, ativação e assinatura — com o degrau que quase todo SaaS esquece de medir.',
    paraQuem:
      'Produto de assinatura com trial ou plano gratuito. O funil só faz sentido com a etapa de ativação no meio: assinante que nunca ativou vira churn no mês seguinte.',
    quandoUsar:
      'Use quando o produto é assinatura com trial ou plano gratuito e existe um momento claro de primeiro valor. Se a sua venda passa por reunião e proposta — SaaS enterprise, ticket alto —, o modelo B2B descreve melhor o processo. A janela é o mês, mas a coorte importa mais que o período: acompanhe quem entrou no mesmo mês ao longo do tempo, não o total misturado.',
    oQueObservar:
      'Defina a ativação antes de medir, e defina como uma ação, não como um clique: "criou o primeiro projeto", "conectou a primeira integração". Ativação vaga transforma o degrau mais importante em número sem significado. Depois, não pare na primeira cobrança: assinatura que cancela no segundo mês entrou no funil como vitória e saiu como prejuízo, então meça também quantas sobrevivem ao mês dois. E não conte cadastro como resultado — é a métrica de vaidade clássica de SaaS, e ela esconde exatamente o degrau que costuma estar quebrado.',
    etapas: [
      { nome: 'Visitantes', valor: 15000, nota: 'Tráfego do site no mês.' },
      { nome: 'Contas criadas', valor: 900, nota: 'Cadastro concluído, com e-mail confirmado.' },
      { nome: 'Ativaram', valor: 288, nota: 'Fizeram a ação que dá o primeiro valor. Defina qual é antes de começar a medir.' },
      { nome: 'Chegaram ao fim do trial', valor: 173, nota: 'Continuaram usando até o trial acabar.' },
      { nome: 'Assinaturas pagas', valor: 61, nota: 'Converteram em plano pago. Meça também quantas sobrevivem ao segundo mês.' },
    ],
    ticket: 97,
    gargaloTipico:
      'Ativação, quase sempre. Conta criada que não faz a primeira ação relevante não vira assinatura, e nenhum e-mail de reengajamento resolve isso melhor do que encurtar o caminho até o primeiro valor. Cuidado com a métrica de vaidade: contar cadastro como resultado esconde exatamente o degrau que está quebrado.',
  },
];

export const buscarModelo = (slug: string) => MODELOS_FUNIL.find((m) => m.slug === slug);

/** O que a ferramenta exporta. Alimenta o bloco "O que dá para exportar" da folha. */
export const EXPORTACOES = [
  {
    formato: 'PNG',
    titulo: 'Imagem do funil',
    desc: 'O funil desenhado, com as taxas de cada passagem. Serve para colar em apresentação, relatório ou mandar no grupo do time.',
  },
  {
    formato: 'CSV',
    titulo: 'Planilha das etapas',
    desc: 'Uma linha por etapa, com valor absoluto, taxa da passagem e taxa acumulada desde o topo. Abre no Excel, no Google Sheets e em qualquer BI.',
  },
  {
    formato: 'JSON',
    titulo: 'Dados brutos',
    desc: 'O funil inteiro em JSON, para reimportar depois, versionar junto do relatório do mês ou jogar dentro de um script seu.',
  },
  {
    formato: 'Link',
    titulo: 'Link compartilhável',
    desc: 'O funil vai codificado na própria URL. Quem abrir vê os mesmos números — sem conta e sem passar por nós: o link é gerado no seu navegador.',
  },
] as const;

export const FAQ_FUNIL = [
  {
    q: 'A ferramenta é gratuita mesmo? Precisa criar conta?',
    a: 'É gratuita e não pede cadastro. Você abre a página, preenche os números e usa. Não há limite de uso, versão paga escondida nem pedido de e-mail no meio do caminho.',
  },
  {
    q: 'Os meus números ficam salvos em algum servidor?',
    a: 'Enquanto você usa a calculadora, não: o cálculo inteiro acontece no seu navegador e nada é enviado para a gente. O link de compartilhamento também não passa por nós — os números vão codificados na própria URL, então quem tem o link vê o funil e quem não tem não recupera nada. Há uma exceção, e ela é sempre uma escolha sua: ao pedir o diagnóstico por e-mail, os números do funil são enviados junto com o seu contato, porque é o que permite escrever a leitura e mandar para você.',
  },
  {
    q: 'Quantas etapas o meu funil deve ter?',
    a: 'Entre quatro e seis, na prática. Menos que quatro esconde onde está a perda; mais que seis costuma criar etapas que você não consegue medir de verdade, e etapa sem medição confiável piora o diagnóstico em vez de melhorar. Comece pelas cinco padrão e ajuste ao seu negócio.',
  },
  {
    q: 'Qual é uma boa taxa de conversão de funil?',
    a: 'Não existe número universal, e quem promete um está vendendo alguma coisa. Loja virtual costuma converter entre 1% e 3% de visitante para pedido; B2B de ticket alto vive com muito menos que isso e é saudável. A comparação que importa é com o seu próprio mês anterior, não com a média de um setor que não é o seu.',
  },
  {
    q: 'Dá para usar para funil de WhatsApp ou de indicação?',
    a: 'Dá. As etapas são livres — você renomeia para o que acontece de verdade no seu processo. Um funil de WhatsApp costuma ficar como mensagem recebida, conversa iniciada, proposta enviada e venda fechada.',
  },
  {
    q: 'Como eu confiro o que é enviado e o que não é?',
    a: 'Sem depender da nossa palavra: abra as ferramentas de desenvolvedor do navegador (F12), vá na aba Rede e use a calculadora. Enquanto você digita, nenhuma requisição sai — o cálculo inteiro roda na sua máquina. Se depois você pedir o diagnóstico por e-mail, vai ver uma única requisição sair, no momento em que enviar o formulário: é ela que leva o seu contato e os números do funil. Nada mais.',
  },
];

// ------------------------------------------------------------
// Conteúdo da folha /ferramentas/calculadora-de-custo-whatsapp-api
//
// A TABELA DE PREÇOS e os CENÁRIOS não moram aqui: vêm do pacote
// `@strat-ai-horus-os/whatsapp-nucleo`, a mesma fonte que a ferramenta usa por
// dentro. Preço mudou? Muda lá, publica, sobe a versão aqui.
// ------------------------------------------------------------

export {
  MODELOS as MODELOS_WHATSAPP,
  buscarModelo as buscarModeloWhatsapp,
} from '@strat-ai-horus-os/whatsapp-nucleo';

/** As categorias de mensagem, em texto. Vira tabela na folha. */
export const CATEGORIAS_WHATSAPP = [
  {
    nome: 'Marketing',
    exemplos: 'Promoção, lançamento, cupom, carrinho abandonado, convite para evento, reengajamento.',
    regra: 'Cobrada em toda mensagem entregue, sem desconto por volume. É a categoria mais cara.',
  },
  {
    nome: 'Utilidade',
    exemplos: 'Confirmação de pedido, rastreio, lembrete de consulta, boleto, aviso de conta.',
    regra:
      'Cobrada por mensagem, com desconto por faixa a partir de 250 mil por mês. Desde 1º/10/2026, também dentro da janela de atendimento.',
  },
  {
    nome: 'Autenticação',
    exemplos: 'Código de verificação, senha de uso único, confirmação de login.',
    regra: 'Cobrada por mensagem, com desconto por faixa a partir de 500 mil por mês.',
  },
  {
    nome: 'Serviço',
    exemplos: 'Resposta livre do atendimento, nas 24 horas depois que o cliente escreveu.',
    regra: '1.000 grátis por número por mês. Da 1.001ª em diante, cobrada desde 1º/10/2026.',
  },
] as const;

/** O passo a passo em texto. São os mesmos passos que a ferramenta executa. */
export const PASSOS_WHATSAPP: PassoFunil[] = [
  {
    n: 1,
    titulo: 'Separe as mensagens por categoria',
    texto:
      'A Meta não cobra "mensagem": cobra marketing, utilidade, autenticação e serviço, cada um com um preço. Liste o que a sua operação manda num mês típico — campanhas, avisos de pedido, lembretes, códigos, respostas do atendimento — e ponha cada tipo na categoria em que a Meta o classifica, não na que você gostaria. Lembrete de carrinho com cupom é marketing, mesmo cadastrado como utilidade.',
  },
  {
    n: 2,
    titulo: 'Conte mensagens entregues, não contatos',
    texto:
      'Desde julho de 2025 a cobrança é por mensagem, não por conversa. Três avisos para o mesmo cliente no mesmo dia são três cobranças. Some quantas mensagens de cada categoria saem por mês; se você só sabe o número de clientes, multiplique pelo número de mensagens que cada um recebe.',
  },
  {
    n: 3,
    titulo: 'Separe a utilidade que sai durante uma conversa',
    texto:
      'Até setembro de 2026, o aviso enviado enquanto o cliente estava conversando com você era grátis. Desde 1º de outubro, é cobrado como qualquer utilidade. Separar as duas linhas mostra quanto a mudança pesou no seu caso.',
  },
  {
    n: 4,
    titulo: 'Desconte a franquia de atendimento de cada número',
    texto:
      'Cada número de WhatsApp da empresa tem 1.000 respostas de serviço grátis por mês, que não acumulam de um mês para o outro. Daí para cima, cada resposta custa R$ 0,035. Informe quantos números você usa: dois números somam duas franquias.',
  },
  {
    n: 5,
    titulo: 'Tire o que entra pela janela grátis de anúncio',
    texto:
      'Quem começa a conversa clicando num anúncio de clique para o WhatsApp, pelo celular, abre uma janela em que a Meta não cobra marketing, utilidade, autenticação nem serviço. Mensagens nessa janela vão numa linha própria e custam zero.',
  },
  {
    n: 6,
    titulo: 'Aplique a tabela, faixa a faixa',
    texto:
      'Multiplique cada categoria pelo preço do Brasil: R$ 0,3217 em marketing e R$ 0,035 em utilidade, autenticação e serviço. Em utilidade e autenticação, o desconto por volume vale só para as mensagens dentro de cada faixa — a primeira mensagem do mês nunca tem desconto.',
  },
  {
    n: 7,
    titulo: 'Some o provedor, que não está na tabela da Meta',
    texto:
      'A Meta não cobra mensalidade, mas o provedor que conecta você à API (o BSP) costuma cobrar uma taxa por mensagem, uma mensalidade ou os dois. Ponha esses valores no fim da conta: em operações pequenas, é comum o provedor custar mais que a Meta.',
  },
];

/** O que a ferramenta entrega. Só o que existe hoje. */
export const EXPORTACOES_WHATSAPP = [
  {
    formato: 'CSV',
    titulo: 'Planilha da conta',
    desc: 'Uma linha por categoria, com volume, mensagens grátis, preço médio e custo. Abre no Excel e no Google Sheets para entrar no orçamento.',
  },
  {
    formato: 'JSON',
    titulo: 'Arquivo da simulação',
    desc: 'A simulação inteira, para guardar a versão de hoje e reabrir depois, inclusive em outro computador.',
  },
  {
    formato: 'Link',
    titulo: 'Link compartilhável',
    desc: 'Os números vão na própria URL. Quem abrir vê a mesma conta — sem cadastro e sem passar por nós.',
  },
  {
    formato: 'PDF',
    titulo: 'Imprimir a conta',
    desc: 'O resultado vira uma folha limpa para anexar à proposta ou levar à reunião de orçamento: imprimir do navegador e salvar como PDF.',
  },
] as const;

export const FAQ_WHATSAPP = [
  {
    q: 'Quanto custa uma mensagem na API oficial do WhatsApp no Brasil?',
    a: 'Na tabela da Meta em vigor desde 1º de outubro de 2026: R$ 0,3217 por mensagem de marketing e R$ 0,035 por mensagem de utilidade, por código de autenticação e por resposta de atendimento acima da franquia de 1.000 por número por mês. Em dólar, US$ 0,0625 e US$ 0,0068. O provedor cobra à parte.',
  },
  {
    q: 'O que mudou na cobrança em outubro de 2026?',
    a: 'Duas coisas que eram grátis passaram a ser cobradas. As respostas do atendimento (mensagens de serviço) agora custam R$ 0,035 cada depois das 1.000 primeiras de cada número no mês. E a mensagem de utilidade enviada dentro de uma conversa aberta pelo cliente, grátis desde julho de 2025, voltou a ser cobrada. Os preços por mensagem do Brasil não mudaram.',
  },
  {
    q: 'A Meta cobra mensalidade para usar a API do WhatsApp?',
    a: 'Não. A Meta cobra só por mensagem entregue e, no caso do agente de IA dela, por token. Mensalidade, quando existe, é do provedor (BSP) que conecta você à API.',
  },
  {
    q: 'Mensagem que o cliente manda para a empresa é cobrada?',
    a: 'Nunca. A Meta só cobra mensagens que a empresa envia e que chegam ao destino. Mensagem não entregue também não é cobrada.',
  },
  {
    q: 'Dá para pagar a API do WhatsApp em reais?',
    a: 'Dá. Desde julho de 2026, empresas e provedores com país de venda Brasil podem ter conta faturada em reais pela Facebook Brasil, e a migração para reais é obrigatória até 30 de junho de 2027. A calculadora usa a tabela oficial em reais da Meta, não uma conversão do dólar.',
  },
  {
    q: 'Os números que eu digito ficam salvos em algum lugar?',
    a: 'Só no seu navegador. O cálculo inteiro roda na sua máquina, e o link de compartilhamento leva os números na própria URL. Abra o F12, vá na aba Rede e digite um número: nenhuma requisição sai.',
  },
];
