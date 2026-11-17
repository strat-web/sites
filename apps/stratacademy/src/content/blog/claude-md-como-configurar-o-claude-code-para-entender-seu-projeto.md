---
title: "CLAUDE.md: como configurar o Claude Code para entender seu projeto"
description: "Aprenda o que é o CLAUDE.md e como configurar o Claude Code para entender seu projeto: /init, escopos de memória, boas práticas e limites."
pubDate: 2026-04-11
author: "Helbert Paranhos"
tags: ['claude-code', 'produtividade']
faq:
  - q: "O que é o arquivo CLAUDE.md?"
    a: "É um arquivo em markdown que você cria na raiz do seu projeto para dar ao Claude Code instruções persistentes: comandos de build e teste, estilo de código, convenções e regras de workflow. Como cada sessão do Claude Code começa com a memória zerada, o CLAUDE.md é lido no início de toda conversa para carregar esse contexto que a ferramenta não consegue adivinhar só lendo o código. (Fonte: [Claude Code Docs](https://code.claude.com/docs/en/memory))"
  - q: "Como criar um CLAUDE.md automaticamente?"
    a: "Rode o comando /init dentro do projeto. O Claude analisa seu codebase, detecta o sistema de build, o framework de teste e os padrões de código, e gera um CLAUDE.md inicial. Se o arquivo já existir, o /init sugere melhorias em vez de sobrescrever. Trate o resultado como ponto de partida, não produto final: refine à mão com aquilo que o Claude não descobre sozinho. (Fonte: [Claude Code Docs](https://code.claude.com/docs/en/memory))"
  - q: "Qual o tamanho ideal de um CLAUDE.md?"
    a: "A recomendação oficial é manter cada arquivo abaixo de 200 linhas. Arquivos inchados consomem mais contexto e fazem o Claude ignorar suas instruções reais, porque as regras importantes se perdem no ruído. Use o teste de corte: para cada linha, pergunte 'remover isto faria o Claude cometer um erro?'. Se não, delete. (Fonte: [Claude Code Docs](https://code.claude.com/docs/en/best-practices))"
  - q: "O Claude sempre obedece o que está no CLAUDE.md?"
    a: "Não com garantia absoluta. A documentação da Anthropic diz que o conteúdo é entregue como mensagem de usuário depois do system prompt, sem garantia de cumprimento estrito, sobretudo com instruções vagas ou conflitantes. Para algo que DEVE acontecer sempre (rodar lint antes de todo commit, por exemplo), use hooks, que rodam como comandos de shell em eventos fixos, e não o CLAUDE.md. (Fonte: [Claude Code Docs](https://code.claude.com/docs/en/memory))"
draft: false
---

![CLAUDE.md: como configurar o Claude Code para entender seu projeto](/images/blog/claude-md-como-configurar-o-claude-code-para-entender-seu-projeto.svg)

_Um único arquivo em markdown transforma o Claude Code de "assistente genérico" em alguém que já conhece seu projeto. Entenda o que é o CLAUDE.md e como configurá-lo na prática._

Você já pediu algo simples ao Claude Code e ele respondeu certo na teoria, mas errado para o seu projeto? Usou 4 espaços onde seu time usa 2, chamou um comando de teste que não existe, criou uma branch com o nome fora do padrão. A cada sessão você repete as mesmas correções, e no dia seguinte tudo se perde de novo.

O motivo é técnico e simples: **cada sessão do Claude Code começa com a memória zerada**. Ele não guarda nada da conversa anterior por conta própria — o arquivo CLAUDE.md é lido no início de toda sessão justamente para carregar esse conhecimento que ele não consegue inferir só lendo o código ([Claude Code Docs — How Claude remembers your project](https://code.claude.com/docs/en/memory)).

Na Strat Academy, a gente insiste nisso porque é o que separa quem usa o Claude Code como um chat esperto de quem o usa como um parceiro que conhece o projeto. E a boa notícia é que configurar isso leva minutos.

Confira também: [O que é Claude Code e como usar na prática](/blog/o-que-e-claude-code-e-como-usar-na-pratica-para-programar-com-ia/)

[![Conheça a Strat Academy — cursos de IA e automação na prática](/images/banner-academy.svg)](/assinatura/)

## Por que o CLAUDE.md importa para o seu negócio?

Pense no CLAUDE.md como o **manual de boas-vindas** que você entrega para um funcionário novo no primeiro dia. Ele é ótimo no que faz, mas não conhece as manias da sua empresa: qual comando roda os testes, como vocês nomeiam as branches, que biblioteca é proibida usar.

Sem esse manual, o novato acerta na média e erra nos detalhes — e os detalhes são exatamente o que custa tempo. Com o CLAUDE.md, você escreve as regras uma vez e o Claude as recebe de novo em toda conversa, sem você precisar repetir.

Para quem toca um negócio e usa o Claude Code para construir automações, landing pages ou ferramentas internas, isso vira dinheiro. Menos retrabalho, menos "isso não era pra ser assim", mais entregas que já saem no padrão. O arquivo é um investimento de dez minutos que se paga em toda sessão seguinte.

## Como criar seu primeiro CLAUDE.md com o /init

A forma mais rápida de começar é não começar do zero. Dentro da pasta do seu projeto, rode:

```bash
/init
```

O Claude vai varrer seu codebase, detectar o sistema de build, o framework de teste e os padrões de código, e gerar um CLAUDE.md inicial com o que descobriu. Se já existir um arquivo, o `/init` **sugere melhorias em vez de sobrescrever** o que você escreveu ([Claude Code Docs](https://code.claude.com/docs/en/memory)).

Trate o resultado como rascunho, não versão final. O `/init` acerta o óbvio (comandos, frameworks), mas quem completa é você — com aquilo que o Claude jamais adivinharia lendo o código, como "nunca use a biblioteca X" ou "toda função nova precisa de teste".

Existe ainda um fluxo interativo novo, ativado com a variável `CLAUDE_CODE_NEW_INIT=1`. Ele pergunta o que você quer configurar, explora o projeto com um subagente, faz perguntas de acompanhamento e mostra uma proposta revisável antes de escrever qualquer coisa. Como flags mudam entre versões, confirme na documentação oficial antes de assumir como definitivo.

### O que colocar (e o que deixar de fora)

O erro mais comum é encher o CLAUDE.md de informação que o Claude já sabe. A regra de ouro: escreva só o que ele **não consegue descobrir sozinho**.

Vale a pena incluir:

- Comandos de build e de teste (ex: `rode npm test antes de commitar`)
- Estilo de código verificável (ex: `use indentação de 2 espaços`)
- Convenções de nomes de branch e regras de pull request
- Decisões de arquitetura que não estão escritas em lugar nenhum
- Bibliotecas ou padrões que o time decidiu evitar

O que cortar:

- Qualquer coisa que o Claude descobre lendo o código
- Convenções padrão da linguagem, que ele já conhece
- Documentação detalhada de API (linke as docs em vez de copiar)
- Óbvios como "escreva código limpo"

([Claude Code Docs — Best practices](https://code.claude.com/docs/en/best-practices))

## Escreva instruções específicas, não vagas

"Formate o código corretamente" não diz nada ao Claude — correto para quem? Já **"use indentação de 2 espaços"** é uma regra que ele consegue seguir e você consegue conferir.

A diferença é sempre essa: troque o vago pelo verificável. "Teste suas mudanças" vira "rode `npm test` antes de commitar". Quando uma regra é crítica, dá para reforçar a aderência com marcadores como `IMPORTANT` ou `YOU MUST` ([Claude Code Docs](https://code.claude.com/docs/en/best-practices)).

Um trecho de CLAUDE.md bem escrito se parece com isto:

```markdown
## Comandos
- Rode `npm test` antes de todo commit
- Build de produção: `npm run build`

## Estilo
- Indentação de 2 espaços, aspas simples
- IMPORTANT: nunca use a biblioteca moment.js; use date-fns
```

E não deixe o arquivo virar segredo pessoal: **comite o CLAUDE.md no git**. Assim o time inteiro contribui, e o arquivo fica melhor com o tempo em vez de envelhecer na sua máquina.

[![Masterclass: seu primeiro agente de IA em até 6h por R$17](/images/banner-masterclass.svg)](/assinatura/)

## Menos é mais: por que o tamanho importa

Existe uma armadilha traiçoeira aqui. Quanto mais você escreve no CLAUDE.md, **pior** o Claude tende a seguir suas instruções. Parece contraintuitivo, mas faz sentido: um arquivo inchado consome contexto e faz as regras importantes se perderem no meio de dezenas de outras ([Claude Code Docs](https://code.claude.com/docs/en/memory)).

A recomendação oficial é manter cada arquivo abaixo de **200 linhas**. E a própria documentação avisa: "arquivos CLAUDE.md inchados fazem o Claude ignorar suas instruções reais". Se ele insiste em errar apesar de uma regra clara, o problema provavelmente é excesso — a regra está se perdendo no ruído.

Use o teste de corte a cada linha: "remover isto faria o Claude cometer um erro?". Se a resposta for não, delete sem dó. Menos linhas, mais obediência.

## Memória hierárquica: um arquivo para cada camada

Você não fica preso a um único CLAUDE.md. A memória do Claude Code funciona em quatro escopos, carregados do mais amplo ao mais específico:

1. **Política gerenciada** — regras da organização inteira, definidas por um admin.
2. **Usuário** (`~/.claude/CLAUDE.md`) — suas preferências pessoais, que valem em todos os projetos.
3. **Projeto** (`./CLAUDE.md`) — regras do repositório, compartilhadas com o time via git.
4. **Local** (`./CLAUDE.local.md`) — anotações só suas, que devem ir para o `.gitignore`.

O Claude sobe a árvore de diretórios a partir de onde você o iniciou e **concatena todos os arquivos** que encontra — eles somam, não se sobrescrevem. Instruções mais próximas do diretório de trabalho são lidas por último ([Claude Code Docs](https://code.claude.com/docs/en/memory)).

Para projetos grandes, dá para modularizar em `.claude/rules/`, com um assunto por arquivo (`testing.md`, `security.md`). O truque poderoso aqui são as **regras com escopo de caminho**: via frontmatter YAML, uma regra só entra no contexto quando o Claude mexe em arquivos que casam com o padrão (ex: `src/api/**/*.ts`). Isso sim economiza contexto de verdade — diferente dos imports com `@path`, que são expandidos e carregados no lançamento igual ao arquivo principal.

## CLAUDE.md não é lei: onde estão os limites

Aqui vai a ressalva mais importante, e a mais ignorada. O CLAUDE.md é **contexto, não configuração forçada**. A documentação da Anthropic é honesta: o conteúdo é entregue como mensagem de usuário depois do system prompt, e "não há garantia de cumprimento estrito", sobretudo com instruções vagas ou conflitantes ([Claude Code Docs](https://code.claude.com/docs/en/memory)).

Traduzindo: se você escreve "rode o lint antes de todo commit" no CLAUDE.md, na maioria das vezes o Claude obedece — mas na hora em que ele decidir pular, nada o impede. Para algo que **precisa** acontecer sempre, use hooks, que rodam como comandos de shell em eventos fixos, independentemente do que o Claude escolhe fazer.

Vale lembrar também que o CLAUDE.md convive com um segundo sistema, a memória automática. Enquanto o CLAUDE.md é escrito por você (seus requisitos), a auto memory é escrita pelo próprio Claude a partir das suas correções (o que ele observou). Ela grava um `MEMORY.md` por projeto, é local à sua máquina — não sincroniza entre computadores — e exige o Claude Code v2.1.59 ou superior.

## Como começar agora

Não tente escrever o CLAUDE.md perfeito de primeira. Rode o `/init`, deixe o Claude gerar o esqueleto, adicione as três ou quatro regras que ele mais erra no seu projeto e comite. Pronto — na próxima sessão você já vai sentir a diferença.

Trate o arquivo como algo vivo: cada vez que corrigir a mesma coisa duas vezes, é sinal de que falta uma linha ali. Cada vez que o Claude ignorar uma regra, é sinal de que o arquivo está grande demais. Podar e refinar é parte do jogo.

E se você quer aprender a construir agentes e automações de verdade com esse tipo de configuração — sem enrolação e com a mão na massa — comece pela nossa [Masterclass, onde você monta seu primeiro agente de IA em até 6 horas](/assinatura/).

---
**Leia também:**
- [O que é Claude Code e como usar na prática](/blog/o-que-e-claude-code-e-como-usar-na-pratica-para-programar-com-ia/)
- [Como instalar o Claude Code do zero](/blog/como-instalar-o-claude-code-do-zero-guia-completo-2026/)
- [O que são subagentes no Claude Code](/blog/o-que-sao-subagentes-no-claude-code-e-como-usar/)
