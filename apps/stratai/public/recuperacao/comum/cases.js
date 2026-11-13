/* Cases da StratAI · fonte única (DEV-94, 12/11/2026)
 *
 * Cada case tem uma página em /cases/<slug>/ (o index.html dela só chama CASES.pagina) e um cartão na
 * lâmina de cases do funil. Tudo sai daqui: muda o texto aqui e vale para a página e para o cartão.
 *
 * validado: false → a página mostra a faixa "Rascunho" e o conteúdo ainda precisa do OK.
 * autorizado: false → ainda não há registro de que o cliente autorizou publicar o case (a faixa avisa).
 * Onde falta dado, vai [X] (regra da marca: nada de número bonito inventado).
 * Origem do que já está preenchido: LP da StratAI (strat-lps › lps/stratai/index.html), números
 * confirmados pelo Helbert em 14/10/2026 e casos autorizados pelos clientes (README da LP).
 *
 * Case novo: copie a pasta cases/_modelo para cases/<slug>, ponha o slug no data-case do index.html
 * e acrescente o objeto abaixo.
 */
(function () {
  'use strict';

  var CONFIG = {
    funil: 'v1/',                        // para onde o botão do case leva (relativo à raiz do site)
    botao: 'Ver se a minha operação é aprovada'
  };

  var CASES = [
    {
      // Origem: nota C040 no vault (R$ 10 mil recuperados confirmado pelo Jhonathan em 10/11/2026; painel v2 no ar
      // em 05/11) e o desenho da recuperação na DEV-85. É o único case que já é de recuperação de vendas.
      slug: 'schatz',
      validado: false,
      autorizado: false,
      cliente: 'Schatz',
      segmento: 'Cursos e conteúdo',
      cidade: '[Cidade/UF]',
      agente: 'Recuperação de vendas com IA no WhatsApp para os cursos da Glaucia Schatzmann',
      logo: 'schatz-logo.png', logoFundo: '',
      foto: 'schatz-foto.jpg', fotoAlt: 'Arte de entrega do novo painel do cliente da Schatz, com as métricas de vendas e de vendas perdidas',
      principal: { valor: 'R$ 10 mil', rotulo: 'em receitas recuperadas com a IA da StratAI' },
      numeros: [
        { valor: 'R$ 10 mil', rotulo: 'em receitas recuperadas com a IA da StratAI' },
        { valor: '10', rotulo: 'métricas novas no painel do cliente, ao vivo' },
        { valor: '4', rotulo: 'moedas (real, dólar, euro e libra) somadas em real' }
      ],
      desafio: '[X] Como era antes: quanto se perdia em cartão recusado, Pix e boleto não pagos e carrinho abandonado, e quem ia atrás.',
      caminho: [
        { t: 'A venda perdida vira aviso', d: 'cartão recusado, Pix ou boleto não pago, carrinho abandonado' },
        { t: 'Régua no WhatsApp', d: 'mensagens pela API oficial, uma régua por pessoa' },
        { t: 'A IA assume quando a pessoa responde', d: 'tira a dúvida e leva até o pagamento' },
        { t: 'O painel mostra o recuperado', d: 'receita recuperada por régua, ao vivo' }
      ],
      ferramentas: ['WhatsApp (API oficial)', 'Checkout', 'IA de atendimento', 'Painel do cliente'],
      resultado: '[X] O que mudou: R$ 10 mil recuperados em quanto tempo, por qual régua, e o que vem na próxima fase.',
      depoimento: { texto: '[X] Frase da Glaucia ou do time dela, com autorização.', autor: '[X] Nome', cargo: '[X] Cargo' },
      periodo: '[X] desde quando a recuperação está no ar'
    },
    {
      slug: 'so-churrasco',
      validado: false,
      autorizado: true,
      cliente: 'Só Churrasco',
      segmento: 'Churrascaria',
      cidade: 'Joinville/SC',
      agente: '"Deni", o agente de reservas',
      logo: 'so-churrasco-logo.png', logoFundo: '',
      foto: 'so-churrasco-wide.jpg', fotoAlt: 'Costela na tábua, foto do site do Só Churrasco',
      principal: { valor: '180', rotulo: 'reservas por mês pelo agente' },
      numeros: [
        { valor: '180', rotulo: 'reservas por mês pelo agente' },
        { valor: '~300', rotulo: 'mensagens por mês' },
        { valor: '14+', rotulo: 'versões até ficar do jeito da casa' }
      ],
      desafio: '[X] Como era antes do agente: quem respondia as reservas, em que horário, o que se perdia.',
      caminho: [
        { t: 'Cliente pede mesa no WhatsApp', d: 'por áudio, texto ou foto' },
        { t: 'O Deni oferece horário', d: 'junta mensagens seguidas antes de responder' },
        { t: 'A reserva cai na planilha', d: 'respeitando o limite por horário' },
        { t: 'A equipe é avisada no grupo', d: 'o salão já sabe quem vem' }
      ],
      ferramentas: ['WhatsApp', 'Google Planilhas', 'Grupo da equipe'],
      resultado: '[X] O que mudou na operação, com número e período (ex.: reservas fora do horário, tempo de resposta).',
      depoimento: { texto: '[X] Frase do dono ou da gerente, com autorização.', autor: '[X] Nome', cargo: '[X] Cargo' },
      periodo: '[X] desde quando o agente está no ar'
    },
    {
      slug: 'guizeline',
      validado: false,
      autorizado: true,
      cliente: 'Guizeline',
      segmento: 'Imobiliária',
      cidade: 'Apucarana/PR',
      agente: 'Agente SDR que trabalha quando o time descansa',
      logo: 'guizeline-logo.jpg', logoFundo: '#c6ce16',
      foto: 'guizeline-foto.jpg', fotoAlt: 'Casas do Viverti Apucarana, de um anúncio da Guizeline',
      principal: { valor: '480', rotulo: 'leads atendidos fora do horário' },
      numeros: [
        { valor: '480', rotulo: 'leads atendidos fora do horário' },
        { valor: '18h–8h', rotulo: 'cobertura planejada, e nas férias' },
        { valor: 'Na hora', rotulo: 'o lead do anúncio é qualificado' }
      ],
      desafio: '[X] Como era antes: lead do anúncio chegando à noite e esfriando até o corretor responder.',
      caminho: [
        { t: 'O lead chega do anúncio', d: 'inclusive fora do horário comercial' },
        { t: 'O agente qualifica na hora', d: 'pergunta a renda da família' },
        { t: 'Pede os documentos', d: 'para a simulação do financiamento' },
        { t: 'Reunião marcada no CRM', d: 'o corretor recebe o lead pronto' }
      ],
      ferramentas: ['WhatsApp', 'Meta Ads', 'CRM'],
      resultado: '[X] O que mudou: reuniões marcadas, vendas, tempo até o primeiro contato.',
      depoimento: { texto: '[X] Frase de quem cuida do comercial, com autorização.', autor: '[X] Nome', cargo: '[X] Cargo' },
      periodo: '[X] desde quando o agente está no ar'
    },
    {
      slug: 'vida-probioticos',
      validado: false,
      autorizado: true,
      cliente: 'Vida Probióticos',
      segmento: 'E-commerce',
      cidade: 'Joinville/SC',
      agente: 'Suporte com agentes especialistas',
      logo: 'vida-probioticos-logo.jpg', logoFundo: '',
      foto: 'vida-probioticos-foto.jpg', fotoAlt: 'Potes de kefir e kombucha, foto do site da Vida Probióticos',
      principal: { valor: '85%', rotulo: 'dos atendimentos resolvidos pela IA' },
      numeros: [
        { valor: '85%', rotulo: 'dos atendimentos resolvidos pela IA' },
        { valor: '3', rotulo: 'agentes: entrega, pagamento e preparo' },
        { valor: 'PDF', rotulo: 'manual enviado quando o cliente pergunta' }
      ],
      desafio: '[X] Como era antes: o time respondendo "cadê meu pedido?" o dia todo.',
      caminho: [
        { t: 'O cliente pergunta no WhatsApp', d: '"cadê meu pedido?", "como preparo?"' },
        { t: 'O agente certo assume', d: 'entrega, pagamento ou preparo' },
        { t: 'Consulta o pedido e responde', d: 'com o rastreio ou o manual' },
        { t: 'Só o que precisa de gente vai pro time', d: 'com a conversa inteira junto' }
      ],
      ferramentas: ['WhatsApp', 'Plataforma da loja', 'Rastreio'],
      resultado: '[X] O que mudou: horas do time devolvidas, tempo de resposta, avaliação.',
      depoimento: { texto: '[X] Frase de quem cuida do atendimento, com autorização.', autor: '[X] Nome', cargo: '[X] Cargo' },
      periodo: '[X] desde quando os agentes estão no ar'
    },
    {
      // Origem: nota C015 no vault e PROGRESSO da CONTATO-23/50 (3 formulários aprovados pela cliente em 06/11/2026,
      // V3 no ar desde 04/11, PageSpeed celular 95 em 11/11). Não citar recuperação aqui: a DEV-85 ainda não está no ar.
      // Texto sem "advogado", "jurídico" e "processo", e sem promessa de valor (regra da cliente).
      slug: 'contato',
      validado: false,
      autorizado: false,
      cliente: 'Contato Indenizações',
      segmento: 'Auxílio-acidente',
      cidade: '[Cidade/UF]',
      agente: 'Quiz que qualifica o lead e entrega no WhatsApp do atendimento',
      logo: 'contato-logo.png', logoFundo: '',
      foto: 'contato-foto.jpg', fotoAlt: 'Quiz da Contato Indenizações no formato de conversa do WhatsApp',
      principal: { valor: '3', rotulo: 'formatos de quiz no ar, aprovados pela cliente' },
      numeros: [
        { valor: '3', rotulo: 'formatos de quiz no ar, aprovados pela cliente' },
        { valor: '< 1 min', rotulo: '5 perguntas até o resultado' },
        { valor: '95', rotulo: 'no PageSpeed do celular' }
      ],
      desafio: '[X] Como era antes: de onde vinham os leads, quanto tempo a equipe gastava com quem não tinha direito.',
      caminho: [
        { t: 'O lead chega do anúncio', d: 'e cai num dos 3 formatos do quiz' },
        { t: '5 perguntas em menos de 1 minuto', d: 'quem não tem direito sai na hora, sem pedir contato' },
        { t: 'Resultado na tela', d: 'com protocolo e o resumo das respostas' },
        { t: 'Lead pronto no WhatsApp', d: 'a equipe recebe o resumo e já atende' }
      ],
      ferramentas: ['Quiz em 3 formatos', 'WhatsApp', 'Meta e Google Ads', 'MetricaaS'],
      resultado: '[X] O que mudou: leads por mês, quantos chegam qualificados, custo por lead.',
      depoimento: { texto: '[X] Frase da Beatriz ou de quem cuida do atendimento, com autorização.', autor: '[X] Nome', cargo: '[X] Cargo' },
      periodo: '[X] desde quando o quiz está no ar'
    }
  ];

  // Estrutura de um case novo, tudo por preencher. Aparece em /cases/_modelo/ e não entra nas listas.
  var MODELO = {
    slug: '_modelo', validado: false,
    cliente: '[Nome do cliente]', segmento: '[Segmento]', cidade: '[Cidade/UF]', agente: '[O que o agente faz, em uma linha]',
    logo: 'so-churrasco-logo.png', logoFundo: '', foto: 'so-churrasco-wide.jpg', fotoAlt: '[Descrição da foto]',
    principal: { valor: '[X]', rotulo: '[o número principal]' },
    numeros: [{ valor: '[X]', rotulo: '[número 1]' }, { valor: '[X]', rotulo: '[número 2]' }, { valor: '[X]', rotulo: '[número 3]' }],
    desafio: '[X] Como era antes.',
    caminho: [{ t: '[Passo 1]', d: '[detalhe]' }, { t: '[Passo 2]', d: '[detalhe]' }, { t: '[Passo 3]', d: '[detalhe]' }, { t: '[Passo 4]', d: '[detalhe]' }],
    ferramentas: ['[Ferramenta]'],
    resultado: '[X] O que mudou, com número e período.',
    depoimento: { texto: '[X] Frase do cliente, com autorização.', autor: '[X] Nome', cargo: '[X] Cargo' },
    periodo: '[X] desde quando'
  };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  // texto com [X] ganha a marca de "falta preencher"
  function txt(s) { return esc(s).replace(/(\[[^\]]+\])/g, '<span class="falta">$1</span>'); }
  function porSlug(slug) { if (slug === '_modelo') return MODELO; for (var i = 0; i < CASES.length; i++) if (CASES[i].slug === slug) return CASES[i]; return null; }
  function midia(raiz, f) { return raiz + 'cases/midia/' + f; }
  function logo(c, raiz) {
    return '<span class="case-logo"' + (c.logoFundo ? ' style="background:' + esc(c.logoFundo) + '"' : '') + '><img src="' + midia(raiz, c.logo) + '" alt="' + esc(c.cliente) + '" loading="lazy"></span>';
  }

  // Cartão usado na lâmina de cases do funil. Abre o case em outra aba para não perder o formulário.
  function cartao(c, raiz, novaAba) {
    return '<a class="case-card" href="' + raiz + 'cases/' + c.slug + '/"' + (novaAba ? ' target="_blank" rel="noopener"' : '') + '>' +
      '<span class="case-card-topo">' + logo(c, raiz) + '<span><b>' + esc(c.cliente) + '</b><small>' + txt(c.segmento) + ' · ' + txt(c.cidade) + '</small></span></span>' +
      '<span class="case-card-num">' + esc(c.principal.valor) + '</span>' +
      '<span class="case-card-rot">' + esc(c.principal.rotulo) + '</span>' +
      '<span class="case-card-link">Ver o case completo <span aria-hidden="true">→</span></span>' +
    '</a>';
  }

  var SETA = '<svg class="seta" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  function cabecalho(raiz) {
    return '<header class="cs-topo"><div class="cs-in"><a class="logo" href="https://stratai.com.br/" aria-label="StratAI"><img src="' + raiz + 'comum/strat-wordmark-branco.png" alt="Strat" width="61" height="22"><span>.ai</span></a>' +
      '<a class="mono cs-voltar" href="' + raiz + 'cases/">Cases</a></div></header>';
  }
  function cta(raiz) {
    return '<a class="btn btn-lima" href="' + raiz + CONFIG.funil + '">' + esc(CONFIG.botao) + SETA + '</a>';
  }

  function pagina(slug, raiz) {
    var c = porSlug(slug), app = document.getElementById('app');
    if (!c) { app.innerHTML = cabecalho(raiz) + '<main class="cs-in cs-main"><h1>Case não encontrado.</h1><p><a href="' + raiz + 'cases/">Ver todos os cases</a></p></main>'; return; }
    document.title = c.cliente + ' · Case StratAI';
    var outros = CASES.filter(function (o) { return o.slug !== c.slug; });
    app.innerHTML =
      (c.validado && c.autorizado ? '' : '<div class="rascunho mono" role="note">Rascunho: ' +
        (c.validado ? '' : 'conteúdo a validar') + (!c.validado && !c.autorizado ? ' · ' : '') + (c.autorizado ? '' : 'falta a autorização do cliente') +
        ' antes de publicar</div>') +
      cabecalho(raiz) +
      '<main class="cs-main">' +
        '<section class="cs-in cs-hero">' +
          '<span class="mono">' + txt(c.segmento) + ' · ' + txt(c.cidade) + '</span>' +
          '<div class="cs-titulo">' + logo(c, raiz) + '<h1>' + esc(c.cliente) + '</h1></div>' +
          '<p class="cs-agente">' + esc(c.agente) + '</p>' +
        '</section>' +
        '<figure class="cs-in cs-foto"><img src="' + midia(raiz, c.foto) + '" alt="' + esc(c.fotoAlt) + '"></figure>' +
        '<section class="cs-in cs-numeros">' + c.numeros.map(function (n) { return '<div><b>' + esc(n.valor) + '</b><span>' + esc(n.rotulo) + '</span></div>'; }).join('') + '</section>' +
        '<section class="cs-in cs-bloco"><span class="mono">O desafio</span><p>' + txt(c.desafio) + '</p></section>' +
        '<section class="cs-in cs-bloco"><span class="mono">O que a gente montou · caminho da informação</span>' +
          '<ol class="cs-caminho">' + c.caminho.map(function (p) { return '<li><b>' + esc(p.t) + '</b><span>' + esc(p.d) + '</span></li>'; }).join('') + '</ol>' +
          '<div class="cs-tags">' + c.ferramentas.map(function (f) { return '<span>' + esc(f) + '</span>'; }).join('') + '</div>' +
        '</section>' +
        '<section class="cs-in cs-bloco"><span class="mono">O resultado</span><p>' + txt(c.resultado) + '</p><p class="letra-miuda">' + txt(c.periodo) + '</p></section>' +
        '<section class="cs-in cs-bloco"><blockquote class="cs-dep"><p>' + txt(c.depoimento.texto) + '</p><footer>' + txt(c.depoimento.autor) + ' · ' + txt(c.depoimento.cargo) + '</footer></blockquote></section>' +
        '<section class="cs-in cs-fim"><h2>A sua operação pode ser a próxima.</h2><p>A gente recupera Pix, boleto e carrinho abandonado e fica com 15% só do que voltar.</p>' + cta(raiz) + '</section>' +
        '<section class="cs-in cs-bloco"><span class="mono">Outros cases</span><div class="case-grade">' + outros.map(function (o) { return cartao(o, raiz); }).join('') + '</div></section>' +
      '</main>';
  }

  function lista(raiz) {
    document.getElementById('app').innerHTML = cabecalho(raiz) +
      '<main class="cs-main"><section class="cs-in cs-hero"><span class="mono">Cases da StratAI</span><h1>Não é promessa. <span class="lima">Já está no ar.</span></h1>' +
      '<p class="cs-agente">Agentes de IA da StratAI atendendo empresas de verdade, todos os dias.</p></section>' +
      '<section class="cs-in"><div class="case-grade">' + CASES.map(function (c) { return cartao(c, raiz); }).join('') + '</div></section>' +
      '<section class="cs-in cs-fim">' + cta(raiz) + '</section></main>';
  }

  window.CASES = { CONFIG: CONFIG, LISTA: CASES, porSlug: porSlug, cartao: cartao, pagina: pagina, lista: lista };
})();
