---
title: "O que sao subagentes no Claude Code e como usar na pratica"
description: "Guia prático de subagentes Claude Code: o que são, como criar com /agents, isolamento de contexto, custo e casos de uso reais."
pubDate: 2026-06-02
author: "Renan Silva"
tags: ['claude-code', 'ia']
faq:
  - q: "O que são subagentes no Claude Code?"
    a: "São assistentes de IA especializados que rodam numa janela de contexto separada da conversa principal, cada um com seu próprio system prompt, conjunto de ferramentas permitidas e permissões. Quando uma tarefa bate com a descrição de um subagente, o Claude delega esse trabalho a ele, que executa de forma independente e devolve só o resultado final para a sessão principal (Fonte: Anthropic — Create custom subagents)."
  - q: "Qual a diferença entre Skills e subagentes no Claude Code?"
    a: "Uma Skill roda de forma transparente dentro da thread principal — você vê e guia cada passo, ideal para procedimentos como deploy ou checklist de release. Um subagente isola o trabalho intermediário num contexto separado e devolve apenas o resultado, ideal para tarefas laterais barulhentas como busca profunda, análise de logs ou auditoria de dependências (Fonte: Anthropic — Steering Claude Code)."
  - q: "Como criar um subagente no Claude Code na prática?"
    a: "O caminho recomendado é rodar o comando /agents, escolher o escopo (Personal em ~/.claude/agents/ para todos os projetos, ou de projeto em .claude/agents/), usar 'Generate with Claude' para gerar nome, descrição e system prompt, selecionar as ferramentas e o modelo, e salvar. Subagentes criados por essa interface ficam disponíveis na hora, sem reiniciar a sessão."
  - q: "Usar vários subagentes em paralelo aumenta o custo?"
    a: "Sim. Subagentes rodando ao mesmo tempo consomem tokens em paralelo. Uma análise de terceiros (MindStudio) estima que dez subagentes em paralelo podem consumir cerca de dez vezes os tokens de um agente único para o mesmo tempo de parede — é uma estimativa de ordem de grandeza, não um benchmark oficial. Você ganha velocidade, mas paga por isso."
draft: false
---

![O que sao subagentes no Claude Code e como usar na pratica](/images/blog/o-que-sao-subagentes-no-claude-code-e-como-usar.svg)

_Entenda o que são os subagentes Claude Code, como criá-los com o comando /agents e quando delegar tarefas para eles economizarem seu contexto e seu tempo._

Você já pediu uma tarefa grande pro Claude Code e viu a conversa virar uma bagunça? Ele lê dezenas de arquivos pra entender como a autenticação funciona, despeja tudo na tela, e quando volta pro que importa, o contexto anterior já foi empurrado pra fora. A sessão fica lenta, cara e confusa.

Esse problema tem nome e tem solução. **Segundo a documentação oficial da Anthropic, os subagentes existem justamente para preservar contexto**, mantendo exploração e implementação fora da conversa principal ([Create custom subagents — Claude Code Docs](https://code.claude.com/docs/en/sub-agents)). Em vez de tudo cair na mesma janela, o trabalho pesado acontece em separado.

Aqui na Strat Academy, a gente ensina empreendedores e makers a usar ferramentas como o Claude Code de forma estratégica — e subagente é um daqueles recursos que muda o jeito de trabalhar depois que você entende a lógica.

Confira também: [O que é Claude Code e como usar na prática](/blog/o-que-e-claude-code-e-como-usar-na-pratica-para-programar-com-ia/)

[![Conheça a Strat Academy — cursos de IA e automação na prática](/images/banner-academy.svg)](/assinatura/)

## Por que subagentes importam para o seu negócio?

Imagine que você contratou um assistente principal muito competente, mas com uma memória de trabalho limitada. Cada arquivo que ele lê, cada log que ele analisa, ocupa espaço nessa memória. Quando enche, ele começa a esquecer o começo da conversa.

Os **subagentes Claude Code** resolvem isso funcionando como especialistas terceirizados. Cada um roda na sua própria janela de contexto, faz o trabalho sujo e devolve só o resumo limpo — a única coisa que retorna à sessão principal é a mensagem final dele, mais alguns metadados ([Anthropic — Steering Claude Code](https://claude.com/blog/steering-claude-code-skills-hooks-rules-subagents-and-more)).

Para quem toca um negócio, isso significa três ganhos práticos:

- **Sessões mais limpas e focadas** — o assistente principal não se perde no meio de mil detalhes técnicos.
- **Especialização real** — você cria um subagente que só revisa código, outro que só investiga bugs, cada um com regras próprias.
- **Custo sob controle** — dá pra rotear tarefas simples para modelos mais baratos e rápidos, como o Haiku.

Não é firula de programador avançado. É organização de trabalho — algo que qualquer maker ou freelancer que usa IA no dia a dia sente na produtividade.

## Como os subagentes funcionam por dentro

Um subagente é, na definição da Anthropic, um assistente de IA especializado que lida com tipos específicos de tarefa. Ele tem quatro características que o tornam independente:

1. **Janela de contexto própria** — o trabalho dele não polui a conversa principal.
2. **System prompt personalizado** — instruções focadas num domínio específico.
3. **Acesso específico a ferramentas** — você define o que ele pode e não pode usar.
4. **Permissões independentes** — ele opera dentro dos limites que você deu.

Quando o Claude encontra uma tarefa que corresponde à _description_ do subagente, ele delega. O subagente executa sozinho e retorna o resultado. Pense num caso clássico: você quer entender como o login funciona em toda a base de código.

Sem subagente, o Claude lê arquivo por arquivo e tudo isso entope a conversa. Com subagente, essa pesquisa acontece num contexto separado e volta só um resumo organizado ([eesel AI](https://www.eesel.ai/blog/skills-vs-subagent)). O corpo instrucional maior do subagente nunca entra na conversa pai — é como pedir um relatório executivo em vez de assistir a toda a reunião.

## Os subagentes que já vêm prontos

Você não precisa criar nada do zero para começar. O Claude Code já inclui subagentes _built-in_ que ele aciona automaticamente quando faz sentido:

- **Explore** — agente somente-leitura, rápido, que roda no modelo Haiku. É otimizado para busca e análise de código; as ferramentas Write e Edit são negadas nele, então ele nunca altera nada por engano.
- **Plan** — agente de pesquisa usado no _plan mode_, também somente-leitura, que herda o modelo da conversa principal.
- **general-purpose** — o mais capaz, com acesso a todas as ferramentas, feito para tarefas complexas de múltiplos passos.

Um detalhe honesto e útil: **Explore e Plan pulam os arquivos CLAUDE.md e o git status de propósito**, justamente para manter a pesquisa rápida e barata. Ou seja, se você tem instruções importantes no seu CLAUDE.md que precisam valer sempre, saiba que esses dois agentes de exploração não as leem.

## Skills ou subagentes? Quando usar cada um

Essa é a dúvida que mais confunde quem está começando. As duas coisas ajudam a organizar o Claude Code, mas resolvem problemas diferentes.

Segundo o guia oficial da Anthropic, uma **Skill roda de forma transparente dentro da thread principal** — você vê e guia cada passo. É ideal para procedimentos que você quer acompanhar: um deploy, um checklist de release, um processo de review.

Já um **subagente isola o trabalho intermediário** e devolve só o resultado final. É ideal para tarefas laterais barulhentas que iriam poluir a conversa: busca profunda no código, análise de logs de um incidente, auditoria de dependências.

A regra prática: se você quer ver e guiar cada passo, use uma Skill. Se o passo a passo é ruído que você não vai reaproveitar e só interessa o resultado, use um subagente. (Quer se aprofundar nas Skills? Temos um post inteiro sobre isso.)

[![Masterclass: seu primeiro agente de IA em até 6h por R$17](/images/banner-masterclass.svg)](/assinatura/)

## Como criar seu próprio subagente na prática

A maneira recomendada de criar e gerenciar subagentes é o comando `/agents`. Ele abre uma interface em abas: a **Running** lista os subagentes ativos e recém-concluídos, e a **Library** mostra todos os disponíveis (built-in, de usuário, de projeto e de plugin) e permite criar, editar e deletar.

O fluxo mais simples é assim:

```
/agents
```

Na aba Library, você escolhe criar um novo, define o escopo (Personal, que fica em `~/.claude/agents/` e vale para todos os seus projetos, ou de projeto, em `.claude/agents/`), usa a opção **Generate with Claude** para gerar o identificador, a descrição e o system prompt, seleciona as ferramentas — por exemplo, só as de leitura para um revisor de código — escolhe o modelo e salva. Ele fica disponível na hora, sem reiniciar.

### O jeito manual, via arquivo

Também dá pra criar um subagente escrevendo um arquivo Markdown com _frontmatter_ YAML. Só dois campos são obrigatórios: `name` e `description`. O resto é opcional:

```
---
name: revisor-de-codigo
description: Revisa mudanças de código em busca de bugs e falhas de segurança. Use ao final de uma implementação.
tools: Read, Grep, Glob
model: haiku
---

Você é um revisor de código sênior. Analise apenas as mudanças...
```

Arquivos de projeto (`.claude/agents/`) podem ser versionados no git e compartilhados com o time inteiro — todo mundo passa a ter o mesmo revisor. Uma ressalva importante: subagentes definidos em arquivo são carregados no início da sessão, então **se você editar o arquivo direto no disco, precisa reiniciar a sessão** para o Claude enxergar a mudança. Os criados pela interface `/agents` já entram em vigor na hora.

## O custo real do paralelismo

Aqui entra a parte honesta que pouca gente comenta. Rodar vários subagentes ao mesmo tempo é ótimo para velocidade — enquanto um roda os testes, a sessão principal segue escrevendo código. Mas paralelismo tem preço.

Múltiplos subagentes rodando em paralelo consomem tokens simultaneamente. Uma análise da MindStudio estima que **dez subagentes em paralelo podem consumir cerca de dez vezes os tokens de um fluxo de agente único** para o mesmo tempo de parede ([MindStudio](https://www.mindstudio.ai/blog/claude-code-sub-agents-explained)). É uma estimativa de ordem de grandeza, não um benchmark oficial da Anthropic — mas serve de alerta: você ganha tempo, e paga por isso.

Vale também não confundir conceitos. Subagentes atuam **dentro de uma única sessão**. Para rodar muitas sessões independentes em paralelo e monitorá-las de um lugar só, a documentação aponta para os _background agents_; para sessões que conversam entre si, os _agent teams_. São recursos distintos, e detalhes como comandos de orquestração aparecem em blogs de terceiros que mudam rápido — sempre confirme na doc oficial antes de tratar como fato.

## Como começar agora

Subagente não é um recurso que você "aprende" numa tarde e domina. É um hábito de trabalho: você começa notando quais tarefas sujam sua conversa e passa a delegá-las.

Comece pequeno. Abra um projeto seu, rode `/agents` e crie um único subagente — um revisor de código somente-leitura é o melhor primeiro caso. Use o "Generate with Claude", restrinja as ferramentas às de leitura e teste ao final da sua próxima implementação. Você vai sentir a diferença de ter a conversa principal limpa.

E se você quer sair do improviso e aprender a montar agentes de IA de ponta a ponta, do zero à execução, vale conhecer o [Strat Academy 2.0](/assinatura/) — são 6 módulos, mais de 800 alunos, acesso vitalício e 7 dias de garantia. É onde a gente transforma "eu ouvi falar de subagente" em "eu construo os meus".

---
**Leia também:**
- [O que é Claude Code e como usar na prática](/blog/o-que-e-claude-code-e-como-usar-na-pratica-para-programar-com-ia/)
- [O que são Claude Skills e as 15 melhores](/blog/o-que-sao-claude-skills-e-as-15-melhores-para-turbinar-sua-produtividade-com-ia/)
- [10 comandos e prompts essenciais do Claude Code](/blog/10-comandos-e-prompts-essenciais-do-claude-code/)
