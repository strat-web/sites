/* Funil de recuperação da StratAI · fonte única das 3 versões (DEV-94, 12/11/2026)
 *
 * Perguntas, saídas, lâminas, regras de classificação, estimativa e envio do lead moram AQUI.
 * As páginas v1/ (telas), v2/ (raio-x ao vivo), v3/ (conversa) e v4/ (telas + agenda + compra rápida)
 * só mudam a forma. Mudou texto ou regra? Muda aqui e vale para todas.
 * Cases: comum/cases.js. Desenho das lâminas: comum/laminas.js.
 *
 * Lead: MetricaaS, mtc.lead({ nome, telefone, email, campos, resultado, motivo }).
 * A tag (m.js do workspace agencia-strat, Rastro stratai) quem põe é o <Tracking> do kit do strat-web/sites, pela
 * linha da página no catálogo. Aqui só se espera por ela, e o lead só sai em *.stratai.com.br (prévia não manda nada).
 */
(function () {
  'use strict';

  var CONFIG = {
    versaoFunil: '1.1.0',
    comissao: 0.15,
    prazoResposta: '1 dia útil',
    dominioPublicado: /(^|\.)stratai\.com\.br$/,
    urlStratai: 'https://stratai.com.br/',
    // hipótese usada na estimativa (não é promessa; aparece com a fórmula na tela)
    recuperacaoMin: 0.08,
    recuperacaoMax: 0.15,
    guardarHoras: 24
  };

  var ABERTURA = {
    rotulo: 'Recuperação de vendas · 15% só do que voltar',
    titulo: 'Quanto da sua venda morre entre o Pix gerado e o Pix pago?',
    texto: 'A gente vai atrás de quem gerou o Pix, o boleto ou largou o carrinho, e traz essa venda de volta. ' +
      'Sem setup, sem mensalidade: a gente fica com 15% só do que recuperar. Do que você já fatura, a gente não toca em um real.',
    garantia: 'Você não tem nada a perder: se a gente não recuperar nada, você não paga nada.',
    pilares: [
      { valor: 'R$ 0', texto: 'de setup' },
      { valor: 'R$ 0', texto: 'de mensalidade' },
      { valor: '15%', texto: 'só do que a gente recuperar' }
    ],
    paraQuemNao: 'Não é para quem ainda não vende pela internet.',
    cta: 'Ver se a minha operação é aprovada',
    tempo: '7 perguntas · 2 minutos. No fim, o seu perfil entra em análise e a gente responde no seu WhatsApp em até ' + CONFIG.prazoResposta + '.'
  };

  // pts: peso na classificação · saida: encerra na hora, sem pedir contato
  var PERGUNTAS = [
    {
      id: 'canal', rotulo: 'Onde você vende',
      titulo: 'Onde a sua venda acontece hoje?',
      apoio: 'A gente só trabalha em cima de venda que quase aconteceu. Por isso começa por aqui.',
      opcoes: [
        { v: 'plataforma', t: 'Plataforma de checkout', d: 'Hotmart, Kiwify, Eduzz, Guru, Ticto…', pts: 3 },
        { v: 'loja', t: 'Loja virtual própria', d: 'Shopify, Nuvemshop, Yampi, WooCommerce…', pts: 3 },
        { v: 'whatsapp', t: 'No WhatsApp, fechando com o time', d: 'O cliente paga por link de pagamento', pts: 2 },
        { v: 'nenhum', t: 'Ainda não vendo pela internet', saida: 'sem-venda' }
      ]
    },
    {
      id: 'faturamento', rotulo: 'Faturamento',
      titulo: 'Quanto entra por mês nas suas vendas pela internet?',
      apoio: 'Média dos últimos 3 meses. Fica só entre você e o nosso time de análise.',
      opcoes: [
        { v: 'ate20', t: 'Até R$ 20 mil', pts: 0 },
        { v: '20a100', t: 'De R$ 20 mil a R$ 100 mil', pts: 2 },
        { v: '100a500', t: 'De R$ 100 mil a R$ 500 mil', pts: 4 },
        { v: '500mais', t: 'Mais de R$ 500 mil', pts: 4 }
      ]
    },
    {
      id: 'conversao', rotulo: 'Pix pago',
      titulo: 'Seja honesto: de cada 10 Pix ou boletos gerados, quantos viram dinheiro na conta?',
      apoio: 'Ninguém aqui vai te julgar. Esse número só mostra o tamanho do buraco.',
      opcoes: [
        { v: '8mais', t: '8 ou mais', pts: 1 },
        { v: '5a7', t: 'De 5 a 7', pts: 3 },
        { v: 'menos5', t: 'Menos da metade', pts: 4 },
        { v: 'naosei', t: 'Não faço ideia', pts: 4 }
      ]
    },
    {
      id: 'hoje', rotulo: 'O que você faz hoje',
      titulo: 'E quem gera o Pix e some? O que a sua empresa faz com essa pessoa hoje?',
      apoio: '',
      opcoes: [
        { v: 'nada', t: 'Nada. Ela some e pronto', pts: 4 },
        { v: 'email', t: 'Recebe um e-mail automático e acabou', pts: 3 },
        { v: 'time', t: 'Alguém do time chama no WhatsApp quando lembra', pts: 3 },
        { v: 'ferramenta', t: 'Tenho uma ferramenta de recuperação rodando', pts: 2 }
      ]
    },
    {
      id: 'volume', rotulo: 'Vendas paradas',
      titulo: 'Quantas vendas ficam pelo caminho todo mês?',
      apoio: 'Some carrinho abandonado, Pix e boleto não pagos e cartão recusado. Chute vale.',
      opcoes: [
        { v: 'ate50', t: 'Menos de 50', pts: 0, n: 30 },
        { v: '50a200', t: 'De 50 a 200', pts: 2, n: 120 },
        { v: '200a1000', t: 'De 200 a 1.000', pts: 4, n: 500 },
        { v: '1000mais', t: 'Mais de 1.000', pts: 4, n: 1500 },
        { v: 'naosei', t: 'Não sei dizer', pts: 2, n: null }
      ]
    },
    {
      id: 'ticket', rotulo: 'Ticket médio',
      titulo: 'Qual é o seu ticket médio?',
      apoio: 'O valor médio de cada venda.',
      opcoes: [
        { v: 'ate100', t: 'Até R$ 100', pts: 1, n: 70 },
        { v: '100a500', t: 'De R$ 100 a R$ 500', pts: 2, n: 250 },
        { v: '500a2000', t: 'De R$ 500 a R$ 2.000', pts: 4, n: 900 },
        { v: '2000mais', t: 'Acima de R$ 2.000', pts: 4, n: 2500 }
      ]
    },
    {
      id: 'acordo', rotulo: 'O combinado',
      titulo: 'A gente fica com 15% do que for recuperado. Só isso. Topa?',
      apoio: 'Nada do que você já fatura. Recuperou zero, você paga zero.',
      opcoes: [
        { v: 'sim', t: 'Topo. É dinheiro que hoje eu não vejo', pts: 4 },
        { v: 'entender', t: 'Topo, mas quero ver como vocês medem', pts: 3 },
        { v: 'nao', t: 'Não topo. Prefiro deixar como está', saida: 'sem-acordo' }
      ]
    }
  ];

  var SAIDAS = {
    'sem-venda': {
      titulo: 'Por enquanto, não é para você.',
      texto: 'A recuperação trabalha em cima da venda que quase aconteceu: Pix gerado, carrinho abandonado, cartão recusado. ' +
        'Sem venda pela internet, não tem o que recuperar. Quando você começar a vender online, volta aqui.',
      cta: { texto: 'Conhecer a StratAI', url: CONFIG.urlStratai }
    },
    'sem-acordo': {
      titulo: 'Então não é para você. E tudo bem.',
      texto: 'Esse modelo só faz sentido para quem enxerga os 15% como dinheiro que não existia. ' +
        'Se um dia mudar de ideia, este formulário continua aqui.',
      cta: { texto: 'Conhecer a StratAI', url: CONFIG.urlStratai }
    }
  };

  var CONTATO = {
    titulo: 'Última parte: para onde a gente manda a resposta?',
    // Aviso em vermelho e negrito, bem destacado (pedido do Jhonathan, 12/11/2026)
    aviso: 'O preenchimento deste formulário não garante o avanço para a implementação. Será feita uma análise da sua operação pelo time da Strat.',
    campos: [
      { id: 'nome', curto: 'Nome', rotulo: 'Seu nome', tipo: 'text', auto: 'name', placeholder: 'Nome e sobrenome', pergunta: 'Pra começar: qual o seu nome?' },
      { id: 'whatsapp', curto: 'WhatsApp', rotulo: 'WhatsApp com DDD', tipo: 'tel', auto: 'tel-national', placeholder: '(47) 99999-9999', pergunta: 'Qual o seu WhatsApp com DDD? É por lá que vai a resposta.' },
      { id: 'email', curto: 'E-mail', rotulo: 'E-mail', tipo: 'email', auto: 'email', placeholder: 'voce@empresa.com.br', pergunta: 'E o seu e-mail?' },
      { id: 'empresa', curto: 'Empresa', rotulo: 'Site ou @ do Instagram da empresa', tipo: 'text', auto: 'url', placeholder: 'suaempresa.com.br ou @suaempresa', pergunta: 'Por último: o site ou o @ do Instagram da empresa. É o que o time olha na análise.' }
    ],
    botao: 'Enviar para análise',
    privacidade: 'Seus dados vão só para o time da StratAI, para responder esta análise. Nada de lista de e-mail.',
    politica: 'https://stratai.com.br/politica-de-privacidade/'   // o formulário coleta dado pessoal (checklist A5)
  };

  // As duas lâminas que aparecem depois das perguntas e antes do formulário (todas as versões).
  var LAMINAS = {
    beneficios: {
      rotulo: 'O que você recebe',
      titulo: 'A gente banca a estrutura inteira.',
      destaque: 'Esse custo é por nossa conta, porque a gente acredita em você e na sua operação.',
      itens: [
        { titulo: 'Implementação', de: 'R$ 15 mil', valor: 'R$ 0', texto: 'Uma estrutura dessas custa em torno de R$ 15 mil para montar. Você não paga.' },
        { titulo: 'A gente monta o agente de IA', texto: 'Desenho, mensagens, testes e ajustes ficam com o nosso time.' },
        { titulo: 'Zero custo com tokens', texto: 'Todo o custo com IA é nosso. Você não paga por mensagem nem por token.' },
        { titulo: 'Menos gasto com ferramentas', texto: 'Com as nossas parcerias, a gente reduz o que você paga hoje em ManyChat, UnniChat, site e outras ferramentas.' },
        { titulo: 'Servidor por nossa conta', texto: 'Você não paga servidor nem hospedagem.' }
      ],
      rodape: 'Você só paga 15% do que a gente recuperar.',
      botao: 'Continuar'
    },
    cases: {
      rotulo: 'Quem já roda com a StratAI',
      titulo: 'Não é promessa. Já está no ar.',
      texto: 'Agentes de IA da StratAI atendendo empresas de verdade, todos os dias.',
      nota: 'Cases publicados com autorização dos clientes.',
      botao: 'Quero que a minha operação seja analisada'
    }
  };

  // V4: agenda com o Helbert e compra rápida no fim. Campo vazio ou [X] = falta preencher.
  var AGENDA = {
    nome: 'Helbert Paranhos',
    cargo: 'Sócio e CTO da StratAI',
    iniciais: 'HP',
    foto: '',                         // caminho da foto (a decidir); vazio = iniciais
    url: 'https://calendar.app.google/fTLUDRk5TeRrkY9TA', // página de agendamento do Google (ficha do time, strat-context)
    duracao: '30 min',                // a confirmar com o Helbert (a página do Google é que manda)
    formato: 'Google Meet',
    titulo: 'Quer adiantar? Fale direto com o Helbert.',
    texto: 'Uma call para olhar a sua operação com você, antes da resposta da análise.',
    pauta: ['Quanto está parado hoje e de onde vem', 'Como a recuperação liga no seu checkout', 'O que acontece se a sua operação for aprovada'],
    pedeCodigo: false,                // true se a página do Google tiver a pergunta "Código"
    botao: 'Escolher meu horário'
  };

  var PRODUTO_LOW = {
    ativo: true,
    selo: 'Compra rápida',
    nome: '[Nome do produto]',
    descricao: '[Uma frase do que a pessoa recebe e para que serve.]',
    imagem: '',                       // caminho da capa; vazio = área reservada
    preco: '[R$ X]',
    precoDe: '',                      // preço riscado, se houver
    parcelas: '[ou X× de R$ X]',
    itens: ['[O que vem no produto 1]', '[O que vem no produto 2]', '[O que vem no produto 3]'],
    garantia: '[X dias de garantia]',
    pagamento: 'Pix ou cartão',
    checkoutUrl: '',                  // link do checkout (Hotmart, Kiwify…); vazio = botão desligado
    botao: 'Comprar agora'
  };

  var ANALISE = {
    rotulo: 'Status: em análise',
    titulo: 'Seu perfil entrou em análise',
    texto: function (nome) {
      return (nome ? nome + ', a' : 'A') + ' gente não aceita toda operação. Antes de ligar qualquer coisa, o nosso time confere se dá para ' +
        'recuperar o suficiente para valer a pena para os dois lados.';
    },
    prazo: function (tel) {
      return 'Em até ' + CONFIG.prazoResposta + ' você recebe no WhatsApp' + (tel ? ' ' + tel : '') + ' a resposta: aprovado ou não, e o porquê.';
    },
    passos: [
      'Uma chamada curta para ligar o seu checkout (webhook).',
      'A gente monta as mensagens de recuperação e coloca no ar.',
      'Você acompanha no painel cada venda que voltou.',
      'No fim do mês, paga 15% só do que foi recuperado.'
    ]
  };

  // ---------- regras ----------
  function opcao(pid, v) {
    for (var i = 0; i < PERGUNTAS.length; i++) {
      if (PERGUNTAS[i].id !== pid) continue;
      for (var j = 0; j < PERGUNTAS[i].opcoes.length; j++) if (PERGUNTAS[i].opcoes[j].v === v) return PERGUNTAS[i].opcoes[j];
    }
    return null;
  }

  var MAXIMO = PERGUNTAS.reduce(function (t, p) { return t + Math.max.apply(null, p.opcoes.map(function (o) { return o.pts || 0; })); }, 0);

  // A (prioridade) · B (analisar) · C (provável recusa). A pessoa sempre vê "em análise"; a letra vai só para o time.
  function classificar(r) {
    var pts = 0;
    PERGUNTAS.forEach(function (p) { var o = opcao(p.id, r[p.id]); if (o && o.pts) pts += o.pts; });
    // a pergunta do acesso ao checkout saiu em 12/11 (máximo 30 → 27); cortes na mesma proporção
    var classe = pts >= 22 ? 'A' : pts >= 13 ? 'B' : 'C';
    var pequeno = r.faturamento === 'ate20' || (r.volume === 'ate50' && (r.ticket === 'ate100' || r.ticket === '100a500'));
    if (pequeno) classe = 'C';
    return { classe: classe, pontos: pts, maximo: MAXIMO };
  }

  // Estimativa ilustrativa: vendas paradas × ticket médio × 8% a 15% (hipótese). null quando falta número.
  function estimar(r) {
    var vol = opcao('volume', r.volume), tic = opcao('ticket', r.ticket);
    var e = { vendas: vol ? vol.n : undefined, ticket: tic ? tic.n : undefined, parado: null, min: null, max: null };
    if (vol && vol.n && tic && tic.n) {
      e.parado = vol.n * tic.n;
      e.min = e.parado * CONFIG.recuperacaoMin;
      e.max = e.parado * CONFIG.recuperacaoMax;
    }
    return e;
  }

  function dinheiro(v) {
    if (v == null || isNaN(v)) return '[X]';
    if (v >= 1000000) return 'R$\u00a0' + (v / 1000000).toFixed(1).replace('.', ',').replace(',0', '') + ' mi';
    if (v >= 10000) return 'R$\u00a0' + Math.round(v / 1000) + '\u00a0mil';
    return 'R$\u00a0' + Math.round(v).toLocaleString('pt-BR');
  }

  var FORMULA = 'Estimativa ilustrativa, não promessa: vendas paradas por mês × ticket médio × 8% a 15% ' +
    '(hipótese de recuperação). Valores do meio de cada faixa que você marcou.';

  // ---------- validação ----------
  var DOMINIOS_ERRADOS = { 'gmail.con': 'gmail.com', 'gmial.com': 'gmail.com', 'gmai.com': 'gmail.com', 'hotmail.con': 'hotmail.com', 'hotmal.com': 'hotmail.com', 'outlook.con': 'outlook.com', 'yahoo.con': 'yahoo.com' };
  function digitos(v) { return String(v || '').replace(/\D/g, ''); }
  function telefoneLocal(v) { var d = digitos(v); if (d.length > 11 && d.indexOf('55') === 0) d = d.slice(2); return d.slice(0, 11); }
  function mascaraTelefone(v) {
    var d = telefoneLocal(v);
    if (d.length <= 2) return d ? '(' + d : '';
    if (d.length <= 6) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length <= 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
    return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
  }
  function corrigirEmail(v) {
    v = String(v || '').trim().toLowerCase();
    var p = v.split('@');
    if (p.length === 2 && DOMINIOS_ERRADOS[p[1]]) v = p[0] + '@' + DOMINIOS_ERRADOS[p[1]];
    return v;
  }
  function validar(id, v) {
    v = String(v || '').trim();
    if (id === 'nome') return v.length < 2 ? 'Escreva o seu nome.' : /\d/.test(v) ? 'O nome não leva número.' : '';
    if (id === 'whatsapp') { var d = telefoneLocal(v); return (d.length === 10 || d.length === 11) ? '' : 'Coloque o WhatsApp com DDD, só números.'; }
    if (id === 'email') return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(corrigirEmail(v)) ? '' : 'Esse e-mail parece incompleto.';
    if (id === 'empresa') return v.length < 3 ? 'Coloque o site ou o @ da empresa.' : '';
    return '';
  }
  function avisoHTML() {
    return '<p class="aviso-forte" role="note"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/></svg><strong>' + CONTATO.aviso.replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }) + '</strong></p>';
  }
  function privacidadeHTML() {
    return '<p class="letra-miuda">' + CONTATO.privacidade + ' <a href="' + CONTATO.politica + '" target="_blank" rel="noopener">Política de privacidade</a></p>';
  }
  function primeiroNome(n) { return String(n || '').trim().split(/\s+/)[0] || ''; }

  // ---------- estado salvo (quem volta continua de onde parou) ----------
  function chave(versao) { return 'strat_recuperacao_' + versao; }
  function carregar(versao) {
    try {
      var s = JSON.parse(localStorage.getItem(chave(versao)) || 'null');
      if (s && Date.now() - s.salvoEm < CONFIG.guardarHoras * 3600 * 1000) return s;
    } catch (e) {}
    return null;
  }
  function salvar(versao, estado) {
    try { estado.salvoEm = Date.now(); localStorage.setItem(chave(versao), JSON.stringify(estado)); } catch (e) {}
  }
  function apagar(versao) { try { localStorage.removeItem(chave(versao)); } catch (e) {} }

  // ---------- medição ----------
  function publicado() { return CONFIG.dominioPublicado.test(location.hostname); }
  // Só o nome do evento e o passo. Nenhuma resposta e nenhum dado pessoal vai em evento.
  function track(evento, dados) {
    dados = dados || {};
    try { (window.dataLayer = window.dataLayer || []).push(Object.assign({ event: evento }, dados)); } catch (e) {}
    try { if (window.mtc && window.mtc.track) window.mtc.track(evento, dados); } catch (e) {}
  }
  function esperarTag(ms) {
    return new Promise(function (ok, falha) {
      var t0 = Date.now();
      (function tenta() {
        if (window.mtc && window.mtc.lead) return ok(window.mtc);
        if (Date.now() - t0 > ms) return falha({ erro: 'tag-nao-carregou' });
        setTimeout(tenta, 150);
      })();
    });
  }

  function protocoloLocal() {
    var a = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789', s = '';
    for (var i = 0; i < 6; i++) s += a[Math.floor(Math.random() * a.length)];
    return s;
  }

  // Uma chamada só, no fim, com tudo. A (prioridade) e B viram "qualificado"; C vai como "desqualificado"
  // (o lead é criado no MetricaaS, mas não vira evento na Meta e não ensina o anúncio a trazer perfil fraco).
  function enviarLead(versao, respostas, contato) {
    var cl = classificar(respostas), est = estimar(respostas);
    var tel = telefoneLocal(contato.whatsapp);
    var campos = {
      funil: 'recuperacao-vendas', versao_funil: versao, empresa: contato.empresa, classificacao: cl.classe,
      pontos: cl.pontos + '/' + cl.maximo, valor_parado_mes: est.parado ? Math.round(est.parado) : '',
      recuperavel_mes: est.min ? Math.round(est.min) + ' a ' + Math.round(est.max) : ''
    };
    PERGUNTAS.forEach(function (p) { var o = opcao(p.id, respostas[p.id]); if (o) campos[p.id] = o.t; });
    Object.keys(campos).forEach(function (k) { if (campos[k] === '' || campos[k] == null) delete campos[k]; });
    var pedido = {
      nome: String(contato.nome).trim(), telefone: '55' + tel, email: corrigirEmail(contato.email), campos: campos,
      resultado: cl.classe === 'C' ? 'desqualificado' : 'qualificado'
    };
    if (cl.classe === 'C') pedido.motivo = 'perfil-c';
    track('funil_lead', { versao: versao, classe: cl.classe });
    if (!publicado()) {
      console.info('[funil] prévia: lead não enviado (só em *.stratai.com.br).', pedido);
      return Promise.resolve({ codigo: protocoloLocal(), previa: true, pedido: pedido });
    }
    return esperarTag(8000)
      .then(function (m) { return m.lead(pedido); })
      .then(function (r) { return { codigo: (r && r.codigo) || protocoloLocal() }; })
      .catch(function (err) { console.warn('[funil] lead não enviado', err && err.erro); return { codigo: protocoloLocal(), erro: true }; });
  }

  window.FUNIL = {
    CONFIG: CONFIG, ABERTURA: ABERTURA, PERGUNTAS: PERGUNTAS, SAIDAS: SAIDAS, CONTATO: CONTATO, ANALISE: ANALISE, FORMULA: FORMULA,
    LAMINAS: LAMINAS, AGENDA: AGENDA, PRODUTO_LOW: PRODUTO_LOW,
    opcao: opcao, classificar: classificar, estimar: estimar, dinheiro: dinheiro,
    avisoHTML: avisoHTML, privacidadeHTML: privacidadeHTML, validar: validar, mascaraTelefone: mascaraTelefone, corrigirEmail: corrigirEmail, primeiroNome: primeiroNome,
    carregar: carregar, salvar: salvar, apagar: apagar,
    track: track, enviarLead: enviarLead, publicado: publicado
  };
})();
