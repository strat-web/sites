---
title: "Como conectar o Claude Code as suas ferramentas com MCP"
description: "Aprenda a conectar o Claude Code às suas ferramentas com MCP: comandos reais de 'claude mcp add', transportes, escopos e casos de negócio."
pubDate: 2026-05-13
author: "Equipe Strat"
tags: ['ferramentas-digitais', 'ia']
faq:
  - q: "O que é MCP no Claude Code?"
    a: "MCP (Model Context Protocol) é um padrão aberto lançado pela Anthropic em 25/11/2024 que padroniza a conexão entre uma IA e ferramentas externas (bancos de dados, APIs, apps). No Claude Code, você conecta um MCP server com o comando 'claude mcp add' e o Claude passa a ler e agir diretamente sobre aquele sistema, em vez de você ficar copiando e colando dados no chat."
  - q: "Como adiciono um MCP server no Claude Code?"
    a: "Para servers remotos na nuvem (transporte HTTP, o recomendado), use 'claude mcp add --transport http <nome> <url>'. Para servers locais na sua máquina (stdio), use 'claude mcp add <nome> -- <comando> [args]', onde o '--' separa as opções do Claude do comando do server. Para ver o status e autenticar, rode '/mcp' dentro do Claude Code."
  - q: "Conectar um MCP server é seguro?"
    a: "Não é totalmente 'plug and play'. A documentação oficial da Anthropic alerta que servers que buscam conteúdo externo podem expor você a prompt injection, por isso é essencial confiar no server antes de conectar. Servers no escopo 'project' (compartilhados via .mcp.json) só rodam após sua aprovação explícita. Conecte primeiro conectores conhecidos e revisados."
  - q: "Preciso saber programar para usar MCP no Claude Code?"
    a: "Para conectar servers já prontos (GitHub, Notion, Slack, Postgres), não: basta copiar um comando 'claude mcp add' e autenticar no navegador. O que muda o jogo é aprender a orquestrar isso com o resto do seu fluxo de trabalho, e é exatamente esse tipo de prática guiada que você encontra nos cursos da Strat Academy."
draft: false
---

![Como conectar o Claude Code as suas ferramentas com MCP](/images/blog/como-conectar-o-claude-code-as-suas-ferramentas-com-mcp.svg)

_Pare de copiar e colar dados no chat: aprenda a plugar o Claude Code direto no seu GitHub, banco de dados e apps usando o Model Context Protocol._

Você já se pegou copiando dados de um dashboard, colando no chat da IA, esperando a resposta, e depois voltando pra ferramenta pra aplicar o que ela sugeriu? Esse vai-e-volta manual é cansativo, cheio de erro de cópia e faz você perder o fio da meada no meio da tarefa.

O curioso é que esse problema tem nome técnico. Antes, cada IA precisava de um conector customizado pra cada ferramenta — o chamado problema de integração "N x M". A solução veio em novembro de 2024, quando a Anthropic lançou o **MCP (Model Context Protocol)**, um padrão aberto pra conectar assistentes de IA aos sistemas onde os dados realmente vivem ([Anthropic — Introducing the Model Context Protocol](https://www.anthropic.com/news/model-context-protocol)).

Aqui na Strat Academy, a gente ensina IA na prática — e poucos recursos economizam tanto tempo do seu dia quanto aprender a conectar o Claude Code às ferramentas que você já usa. Este post é o seu guia de MCP Claude Code do zero.

Confira também: [O que é Claude Code e como usar na prática](/blog/o-que-e-claude-code-e-como-usar-na-pratica-para-programar-com-ia/)

[![Conheça a Strat Academy — cursos de IA e automação na prática](/images/banner-academy.svg)](/assinatura/)

## Por que MCP importa para o seu negócio?

Imagine o MCP como uma **porta USB-C para aplicações de IA**. Assim como o USB-C padronizou o jeito de plugar qualquer aparelho, o MCP padroniza a conexão entre a IA e seus sistemas externos. É essa a analogia oficial da Anthropic — e ela explica muito bem o valor prático.

Sem MCP, o Claude só enxerga o que você cola no chat. Com MCP, ele lê e age diretamente sobre o sistema: consulta o banco, abre uma issue no GitHub, lê um documento no Notion. A própria recomendação oficial é simples: quando você se pegar copiando dados de outra ferramenta pra dentro do chat, é hora de conectar um server ([Claude Code Docs](https://code.claude.com/docs/en/mcp)).

Pro seu negócio, isso significa menos tarefa manual e menos erro. Em vez de você ser a "ponte" entre a IA e suas ferramentas, o Claude faz esse caminho sozinho — e você foca na decisão, não na cópia.

Um sinal de que isso não é modinha: em dezembro de 2025 a Anthropic doou o MCP para a Agentic AI Foundation, um fundo sob a Linux Foundation co-fundado com Block e OpenAI. Até 2026, o padrão já tinha sido adotado por OpenAI, Google, Microsoft, Cursor e VS Code. Ou seja: aprender MCP hoje é aprender algo que virou padrão do setor.

## Os conceitos básicos: transportes e escopos

Antes dos comandos, dois conceitos que evitam confusão mais tarde.

**Transportes** são a forma como o Claude Code conversa com o server. São três:

- **HTTP** — para servers remotos na nuvem. É o recomendado hoje.
- **stdio** — um processo local na sua máquina, ideal para ferramentas que precisam de acesso direto ao sistema (como um banco de dados local).
- **SSE** — está oficialmente **depreciado**. Se você achar um tutorial antigo mandando usar SSE, ignore e use HTTP.

**Escopos** definem quem enxerga aquele server, via a flag `--scope`:

- `local` (padrão) — só você, no projeto atual.
- `project` — compartilhado com a equipe por um arquivo `.mcp.json` versionado no repositório. Por segurança, o Claude pede aprovação antes de usar.
- `user` — disponível pra você em todos os projetos da máquina.

Guarde essa ideia: HTTP para nuvem, stdio para local, e o escopo decide se é só seu ou do time.

## O comando central: `claude mcp add`

Na prática, quase tudo gira em torno de um comando. Para conectar um server remoto na nuvem, o padrão é:

```bash
claude mcp add --transport http <nome> <url>
```

Um exemplo real de conexão com o Notion:

```bash
claude mcp add --transport http notion https://mcp.notion.com/mcp
```

Para um server local (stdio), a sintaxe usa `--` para separar as opções do Claude do comando que roda o server:

```bash
claude mcp add [options] <nome> -- <comando> [args...]
```

Esse `--` é o detalhe que mais confunde quem está começando. Ele funciona como uma "parede": tudo antes é configuração do Claude, tudo depois é o comando que sobe o server.

Muitos servers na nuvem exigem login. O Claude Code suporta **OAuth 2.0**: dentro dele você digita `/mcp` para abrir o fluxo de login no navegador e ver o status de cada server conectado. Também dá pra autenticar pelo terminal com `claude mcp login <nome>`.

E você não precisa configurar tudo na unha: a Anthropic mantém servers pré-construídos para Google Drive, Slack, GitHub, Git, Postgres e Puppeteer, além de um diretório de conectores revisados em `claude.ai/directory`.

## Exemplos práticos que você pode copiar hoje

Vamos sair da teoria. Aqui vão dois exemplos oficiais, prontos pra usar.

### Conectar ao GitHub para code reviews

```bash
claude mcp add --transport http github https://api.githubcopilot.com/mcp/ --header "Authorization: Bearer YOUR_GITHUB_PAT"
```

A autenticação usa um personal access token (o ideal é o "fine-grained", com permissões mínimas) passado como header. Depois de conectado, você pode pedir em português mesmo: "Revise o PR #456 e sugira melhorias" ou "Crie uma issue para o bug que acabamos de encontrar".

### Consultar um banco PostgreSQL em linguagem natural

```bash
claude mcp add --transport stdio db -- npx -y @bytebase/dbhub --dsn "postgresql://readonly:pass@prod.db.com:5432/analytics"
```

Repare no usuário `readonly`: conectar em modo somente-leitura é uma boa prática de segurança. Com isso ativo, dá pra perguntar "Qual foi o faturamento total deste mês?" ou "Me mostre o schema da tabela de pedidos" — sem escrever uma linha de SQL.

Esses são só dois casos. A documentação lista fluxos de negócio como implementar uma feature a partir de um issue tracker ("Adicione a feature descrita na issue ENG-4521 do JIRA e crie um PR no GitHub"), analisar erros no Sentry, integrar designs do Figma ou gerar rascunhos de e-mail no Gmail.

[![Masterclass: seu primeiro agente de IA em até 6h por R$17](/images/banner-masterclass.svg)](/assinatura/)

## Recursos avançados e a honestidade sobre riscos

Conforme você avança, o MCP fica mais poderoso. Servers podem expor **resources** que você referencia com menções `@` (ex.: `@github:issue://123` ou `@postgres:schema://users`) e **prompts** que viram comandos no formato `/mcp__servername__promptname` — como `/mcp__github__pr_review 456`. Basta digitar `@` ou `/` que o Claude mostra o que está disponível.

Outro ponto elegante: por padrão o Claude Code usa **tool search**. As ferramentas dos servers ficam "deferidas" — ele não carrega todas de uma vez, busca sob demanda só as relevantes pra tarefa. Isso mantém o uso de contexto baixo mesmo com muitos servers conectados.

Agora, a parte honesta — porque prometer só maravilha seria desonesto com você. A própria documentação alerta que servers que buscam conteúdo externo podem te expor a **prompt injection**, então verifique e confie em cada server antes de conectar. Não é plug and play sem riscos.

Dois avisos práticos:

- **Números de mercado exigem cautela.** Você vai ver blogs falando em "mais de 10.000 servers públicos". Esse número aparece em fontes de terceiros, não em fonte oficial da Anthropic, que fala apenas em "milhares de servers da comunidade". Trate qualquer contagem exata como estimativa.
- **A sintaxe muda rápido.** Os comandos aqui refletem a documentação de meados de 2026. URLs de endpoints de terceiros (Notion, GitHub) também mudam. Sempre confira a [documentação oficial do Claude Code](https://code.claude.com/docs/en/mcp) antes de colar um comando exato.

E vale lembrar: MCP não é obrigatório pra tudo. Conectores do claude.ai, plugins e ferramentas nativas coexistem. Use MCP quando ele resolve uma dor real de integração, não por moda.

## Como começar agora

O melhor caminho é escolher **uma** dor concreta e resolver com um único server. Aquela ferramenta de onde você mais copia dados pro chat? Comece por ela. Conecte, rode `/mcp` pra confirmar que autenticou, e faça um pedido simples em português pra sentir a diferença.

Depois de provar valor num caso, o segundo e o terceiro server vêm naturalmente — e é aí que seu fluxo de trabalho deixa de ser "eu no meio de tudo" e passa a ser "eu orquestrando". Esse salto de mentalidade, de operador manual pra maestro de ferramentas, é o coração do que ensinamos.

Se você quer aprender isso com método, mão na massa e sem se perder na documentação, comece pelo [masterclasses gratuitas](/downloads/): são 4 aulas pra você dar os primeiros passos com IA aplicada ao seu negócio hoje mesmo.

---
**Leia também:**
- [O que é Claude Code e como usar na prática para programar com IA](/blog/o-que-e-claude-code-e-como-usar-na-pratica-para-programar-com-ia/)
- [Como criar automações de negócio com Claude Code e N8N](/blog/como-criar-automacoes-de-negocio-com-claude-code-e-n8n/)
- [10 comandos e prompts essenciais do Claude Code](/blog/10-comandos-e-prompts-essenciais-do-claude-code/)
