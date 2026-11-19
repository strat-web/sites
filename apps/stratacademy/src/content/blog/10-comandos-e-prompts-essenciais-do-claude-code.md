---
title: "10 comandos e prompts essenciais do Claude Code para produtividade"
description: "Domine 10 comandos Claude Code (/init, /clear, /compact, /plan, /agents, /code-review, /context) e prompts que economizam contexto e aumentam sua produtividade."
pubDate: 2026-05-02
author: "Equipe Strat"
tags: ['produtividade', 'claude-code']
faq:
  - q: "Qual a diferença entre /clear e /compact no Claude Code?"
    a: "O /clear zera o contexto e começa uma conversa nova do zero (a anterior fica no /resume) — use entre tarefas não relacionadas. Já o /compact resume a conversa atual e libera espaço sem perder o fio, preservando código e decisões importantes. Regra prática: mudou de assunto, /clear; mesma tarefa mas o contexto encheu, /compact. Você ainda pode focar o resumo, como em /compact Focus on the API changes."
  - q: "Preciso usar o plan mode em toda tarefa?"
    a: "Não. A própria doc oficial recomenda pular o plano em tarefas triviais: corrigir um typo, adicionar um log, renomear uma variável. A regra de ouro é: se você consegue descrever o diff em uma frase, pule o plano. O plan mode (/plan) vale a pena quando há incerteza sobre a abordagem, quando a mudança toca vários arquivos ou quando o código é desconhecido. Planejar tudo só adiciona overhead sem retorno."
  - q: "Os comandos do Claude Code são iguais aos do chat do Claude.ai?"
    a: "Não. Este material é sobre o Claude Code, a ferramenta de linha de comando da Anthropic que atua como agente de código no seu projeto. Os slash commands do Claude Code não são os mesmos do app de chat Claude.ai. Além disso, nomes e comportamentos mudam entre versões (alguns comandos têm versão mínima e outros foram removidos), então confira sempre a doc oficial em code.claude.com/docs para a versão que você instalou."
  - q: "O /rewind substitui o Git como controle de versão?"
    a: "Não, e a própria doc da Anthropic avisa isso. O /rewind (com os apelidos /checkpoint e /undo) volta o código ou a conversa para um checkpoint anterior, e o Claude tira um snapshot dos arquivos antes de cada mudança. Mas os checkpoints só rastreiam alterações feitas pelo próprio Claude — não pegam mudanças de processos externos. Ele é uma rede de segurança dentro da sessão, não um substituto do Git. Continue commitando normalmente."
draft: false
---

![10 comandos e prompts essenciais do Claude Code para produtividade](/images/blog/10-comandos-e-prompts-essenciais-do-claude-code.svg)

*Dez comandos e prompts verificados na documentação oficial da Anthropic para você tirar mais do Claude Code sem enrolar o modelo — e sem perder tempo com contexto poluído.*

Você abre o Claude Code animado, faz um pedido, corrige, pede de novo, corrige outra vez… e de repente a IA que estava afiada começa a errar coisas óbvias. Não é azar nem "dia ruim do modelo". É contexto entupido.

A raiz de quase toda boa prática no Claude Code é uma restrição só: a **janela de contexto** enche rápido, e a performance do modelo cai conforme ela enche. A própria documentação da Anthropic é direta ao recomendar limpar o contexto entre tarefas não relacionadas, porque "contexto longo com informação irrelevante degrada a performance do modelo" ([Anthropic — Commands reference](https://code.claude.com/docs/en/commands)).

Na Strat Academy a gente ensina isso na prática: não basta saber que o Claude Code existe, é preciso dirigir a ferramenta com método. E dominar meia dúzia de comandos muda o jogo mais do que qualquer prompt "mágico".

Confira também: [O que é Claude Code e como usar na prática](/blog/o-que-e-claude-code-e-como-usar-na-pratica-para-programar-com-ia/)

[![Conheça a Strat Academy — cursos de IA e automação na prática](/images/banner-academy.svg)](/assinatura/)

## Por que dominar os comandos Claude Code importa para o seu negócio?

Pensa no Claude Code como um funcionário sênior muito rápido, mas com uma mesa pequena. Cada arquivo que ele lê, cada tentativa que dá errado, cada explicação sua ocupa espaço nessa mesa. Quando lota, ele começa a esbarrar nas próprias anotações.

Os **comandos Claude Code** existem justamente para você organizar essa mesa: limpar quando muda de assunto, resumir quando enche, delegar leitura pesada para outro "ajudante" e visualizar para onde o espaço está indo.

Para quem toca um negócio, isso é dinheiro. Menos correção significa menos tempo babá, menos retrabalho e mais entregas fechadas por sessão. Não é sobre decorar comandos — é sobre parar de brigar com a ferramenta e começar a conduzi-la.

## Os 3 comandos de contexto que você usa o dia inteiro

Se você aprender só três comandos, que sejam estes.

**/clear** começa uma conversa nova, com contexto vazio (a anterior continua disponível no `/resume`). Use com frequência entre tarefas que não têm nada a ver uma com a outra. Tem apelidos: `/reset` e `/new`.

**/compact** resume a conversa até aqui e libera espaço sem perder o fio. Aceita um foco opcional — a doc oficial dá o exemplo `/compact Focus on the API changes`. O Claude Code ainda faz compactação automática ao chegar perto do limite, preservando código e decisões importantes.

**/context** mostra o uso atual da janela como uma grade colorida, aponta o que está consumindo contexto demais e dá sugestões de otimização. É o seu "para onde foi meu espaço?" da sessão.

```
/context        # veja para onde o contexto está indo
/compact Focus on the checkout bug   # resuma mantendo o foco
/clear          # zere e recomece limpo na próxima tarefa
```

### A regra de ouro do contexto

Aqui vai a dica mais valiosa e a que quase ninguém segue: se você já corrigiu o Claude **mais de duas vezes** sobre o mesmo problema, o contexto está poluído com abordagens que falharam.

A recomendação oficial é clara: rode `/clear` e recomece com um prompt melhor, incorporando o que você aprendeu. Uma sessão limpa com prompt afiado quase sempre supera uma sessão longa cheia de correções acumuladas.

## /init e o CLAUDE.md: dando um mapa ao Claude

O comando **/init** analisa a estrutura do seu projeto — sistemas de build, frameworks de teste, padrões de código — e gera um arquivo `CLAUDE.md` inicial. Esse arquivo é lido no começo de toda conversa, funcionando como um briefing permanente.

Mas cuidado com o exagero. A doc alerta que um `CLAUDE.md` inchado faz o Claude **ignorar as instruções reais**. O critério por linha é honesto: "remover isso faria o Claude cometer erros?" Se não, corte sem dó. Dá para reforçar o que importa com marcadores como `IMPORTANT` ou `YOU MUST`.

É o mesmo princípio da mesa pequena: mais texto não é melhor. Texto certo é melhor. Aprofundamos isso no guia dedicado — vale a leitura.

## /plan: separar o pensar do fazer

O **plan mode** separa exploração de execução. Nele o Claude lê arquivos e responde perguntas sem alterar nada. Você aciona com `/plan`, opcionalmente com uma descrição, tipo `/plan fix the auth bug`.

O workflow recomendado tem quatro fases: **Explorar** (só leitura), **Planejar** (pedir um plano detalhado), **Implementar** (sair do plano e codar conferindo contra ele) e **Commitar** (commit descritivo e PR).

A honestidade da doc é ótima aqui: pule o plano quando o escopo é claro e a mudança é pequena — um typo, um log, um rename. Planejar tudo só adiciona overhead. A regra prática:

```
Se você descreve o diff em uma frase, pule o plano.
Se há incerteza ou a mudança toca vários arquivos, planeje.
```

## /agents: delegar sem sujar a conversa

O comando **/agents** abre o gerenciador de subagentes — tarefas que o Claude delega para rodar em uma janela de contexto própria, com prompt e permissões independentes. Eles são definidos em arquivos Markdown com frontmatter YAML, dentro de `.claude/agents/`.

Por que isso é poderoso? Porque um subagente pode ler dezenas de arquivos investigando algo e reportar de volta só um resumo. A leitura pesada acontece na mesa dele, não na sua — a conversa principal fica limpa.

Na prática, você pede algo como "use subagents to investigate X" e mantém sua sessão principal enxuta. Se quiser entender a fundo como estruturar isso, temos um material só sobre subagentes.

[![Masterclass: seu primeiro agente de IA em até 6h por R$17](/images/banner-masterclass.svg)](/assinatura/)

## /code-review, /review e /rewind: revisar e voltar no tempo

**/code-review** revisa o diff atual buscando bugs de correção e melhorias de simplificação, rodando em um subagente com contexto novo. Aceita `--fix` (aplica as correções), `--comment` (posta como comentários inline em PR do GitHub) e o modo `ultra` (revisão profunda na nuvem com vários agentes).

**/review** revisa um pull request do GitHub por número — sem argumentos, lista os PRs abertos para você escolher. Um aviso honesto: essa revisão de PRs do GitHub está em *research preview*, disponível para assinaturas Team e Enterprise. Nem todo comando aparece para todo mundo; depende de plataforma, plano e ambiente.

**/rewind** (apelidos `/checkpoint` e `/undo`) volta código e/ou conversa para um checkpoint anterior — cada prompt enviado cria um, e você abre o menu com Esc duas vezes. Mas atenção: os checkpoints **só rastreiam mudanças feitas pelo Claude**. A doc é enfática: eles não substituem o Git. Continue commitando.

## Prompts que funcionam: seja específico e feche o loop

Comando bom sem prompt bom não resolve. A regra número um é dar **contexto específico**: referencie arquivos com `@`, aponte padrões existentes e diga o que significa "pronto".

A doc contrasta os dois extremos:

```
Vago:      add tests for foo.py
Específico: write a test for foo.py covering the edge case
            where the user is logged out. avoid mocks.
```

Quanto mais precisa a instrução, menos correção depois. E tem um segundo pilar: sempre dê ao Claude uma forma de **verificar o próprio trabalho** — testes, build, linter, screenshot — e peça que ele mostre a evidência (a saída do teste, o comando rodado), não só afirme que deu certo. Revisar a evidência é mais rápido que re-executar tudo, e isso fecha o loop de correção sem depender de você notar cada erro.

Um detalhe honesto: os nomes e comportamentos de comandos mudam entre versões. Alguns exigem versão mínima, outros já foram removidos. Sempre confira a doc oficial em code.claude.com/docs para a versão que você tem instalada. E lembre: isto é sobre o Claude Code (o agente de código no terminal), não sobre o chat do Claude.ai — os comandos não são equivalentes.

## Como começar agora

Você não precisa decorar os dez comandos de uma vez. Escolha três para esta semana: `/clear` ao trocar de tarefa, `/context` quando sentir a IA travando e um prompt específico com `@arquivo` e critério de verificação embutido.

Repare no padrão: tudo gira em torno de manter a mesa limpa e dizer com clareza o que você quer. Domine isso e a diferença entre "a IA me atrapalha" e "a IA multiplica meu trabalho" vira uma questão de método, não de sorte.

Se você quer sair da tentativa e erro e aprender esse método com quem já colocou +800 alunos para construir com IA na prática, o caminho mais rápido é o [Strat Academy 2.0](/assinatura/) — 6 módulos, acesso vitalício e garantia de 7 dias para você testar sem risco.

---
**Leia também:**
- [O que é Claude Code e como usar na prática](/blog/o-que-e-claude-code-e-como-usar-na-pratica-para-programar-com-ia/)
- [CLAUDE.md: como configurar o Claude Code para entender seu projeto](/blog/claude-md-como-configurar-o-claude-code-para-entender-seu-projeto/)
- [O que são subagentes no Claude Code](/blog/o-que-sao-subagentes-no-claude-code-e-como-usar/)
