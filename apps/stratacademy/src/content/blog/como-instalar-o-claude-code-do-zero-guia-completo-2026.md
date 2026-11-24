---
title: "Como instalar o Claude Code do zero: guia completo 2026"
description: "Guia 2026 para instalar Claude Code do zero: instalador nativo, npm, requisitos, planos e primeiro login passo a passo."
pubDate: 2026-04-03
author: "Helbert Paranhos"
tags: ['claude-code', 'ferramentas-digitais']
faq:
  - q: "Preciso pagar para usar o Claude Code?"
    a: "Sim. O plano gratuito do Claude.ai não inclui o Claude Code. É preciso um plano Pro (US$ 17/mês no anual ou US$ 20/mês no mensal), Max (a partir de US$ 100/mês), Team, Enterprise ou uma conta Console com API paga. Você também pode usá-lo por provedores externos como Amazon Bedrock ou Google Vertex AI. Preços verificados em claude.com/pricing em 1 de julho de 2026, em USD e sujeitos a alteração."
  - q: "Qual é a melhor forma de instalar o Claude Code em 2026?"
    a: "A Anthropic recomenda o instalador nativo, que não depende de Node.js. No macOS, Linux e WSL, rode curl -fsSL https://claude.ai/install.sh | bash. No Windows PowerShell, rode irm https://claude.ai/install.ps1 | iex. O método via npm (npm install -g @anthropic-ai/claude-code) continua válido e instala o mesmo binário nativo, mas exige Node.js 18 ou superior."
  - q: "Preciso saber programar para instalar o Claude Code?"
    a: "Não para instalar. Você só copia e cola um comando no terminal e faz login pelo navegador. Depois, você conversa com a ferramenta em português. Saber programar ajuda a aproveitar melhor, mas empreendedores e makers usam o Claude Code para construir automações e ferramentas mesmo sem serem desenvolvedores experientes."
  - q: "Como sei se a instalação deu certo?"
    a: "Rode claude --version para confirmar a versão instalada. Para um diagnóstico completo da instalação e da configuração, rode claude doctor. Se algo estiver errado, esse comando aponta o problema. Para começar de fato, abra o terminal na pasta do projeto e digite claude."
draft: false
---

![Como instalar o Claude Code do zero: guia completo 2026](/images/blog/como-instalar-o-claude-code-do-zero-guia-completo-2026.svg)

_Do instalador nativo ao primeiro login: o passo a passo para instalar Claude Code em qualquer sistema, sem travar no meio do caminho._

Você abriu um tutorial para começar a usar o Claude Code, viu um monte de comandos estranhos, mensagens de erro no terminal e desistiu antes de conseguir rodar a ferramenta pela primeira vez. É frustrante — você quer aprender IA na prática, mas a barreira já aparece na instalação.

Faz sentido esse receio: **segundo a Stack Overflow Developer Survey 2025, 84% dos desenvolvedores já usam ou planejam usar ferramentas de IA no trabalho** ([fonte](https://survey.stackoverflow.co/2025/)). Ou seja, quem não domina essas ferramentas está ficando para trás — e o primeiro passo é justamente conseguir instalá-las direito.

Aqui na Strat Academy, a gente ensina IA e automação do jeito que funciona no mundo real: sem pular etapas. Por isso este guia começa do absolutamente zero e cobre macOS, Windows e Linux.

Confira também: [O que é Claude Code e como usar na prática](/blog/o-que-e-claude-code-e-como-usar-na-pratica-para-programar-com-ia/)

[![Conheça a Strat Academy — cursos de IA e automação na prática](/images/banner-academy.svg)](/assinatura/)

## Por que instalar Claude Code importa para o seu negócio?

O Claude Code é uma ferramenta de linha de comando da Anthropic que coloca um agente de IA direto no seu terminal. Ele lê o seu projeto inteiro, escreve arquivos, corrige erros e roda comandos — tudo por conversa, em português.

Para um empreendedor ou maker, isso muda o jogo. Você deixa de depender 100% de terceiros para construir uma automação, um script ou um MVP. Mas nada disso acontece se a ferramenta não estiver instalada e autenticada corretamente.

É aí que muita gente trava. Instala pela metade, mistura conta gratuita com plano pago, ou usa um tutorial antigo que aponta para links que já mudaram. **Instalar Claude Code do jeito certo é o que separa quem só assiste vídeo de quem realmente coloca a mão na massa.**

## Antes de instalar: requisitos e plano

Duas coisas precisam estar resolvidas antes de digitar qualquer comando: o seu sistema e o seu plano.

### Requisitos de sistema

Os requisitos oficiais da Anthropic são diretos:

- **Sistema operacional:** macOS 13.0+, Windows 10 (1809+) ou Windows Server 2019+, Ubuntu 20.04+, Debian 10+ ou Alpine Linux 3.19+
- **Hardware:** 4 GB de RAM ou mais, processador x64 ou ARM64
- **Internet:** conexão obrigatória (a ferramenta não roda offline)
- **Shell:** Bash, Zsh, PowerShell ou CMD

Se você escolher o método via npm, precisa também de **Node.js 18 ou superior**. Já o instalador nativo dispensa o Node.js — voltamos nisso já já.

### O plano certo (e o mito do plano grátis)

Aqui vai um aviso honesto que muitos artigos de terceiros esquecem: **o plano gratuito do Claude.ai NÃO inclui o Claude Code.**

Para usar a ferramenta, você precisa de uma conta Pro, Max, Team, Enterprise ou uma conta Console (API paga). Também dá para usar via provedores externos como Amazon Bedrock, Google Vertex AI ou Microsoft Foundry.

Os preços do Pro, verificados em [claude.com/pricing](https://claude.com/pricing) em 1 de julho de 2026, são US$ 17/mês na assinatura anual (US$ 200 cobrados de uma vez) ou US$ 20/mês no plano mensal — e o Pro já inclui o Claude Code. O Max começa em US$ 100/mês, com as faixas 5x e 20x, que multiplicam os limites de uso em relação ao Pro. Valores em USD, sujeitos a alteração e a variações por câmbio e impostos no Brasil, então confirme sempre a página oficial.

## Como instalar Claude Code (o método recomendado)

Em 2026, a Anthropic recomenda o **instalador nativo**, que baixa o binário sem depender de Node.js ou npm. É a forma mais limpa e a única que se atualiza sozinha em background.

No **macOS, Linux ou WSL**, abra o terminal e rode:

```bash
curl -fsSL https://claude.ai/install.sh | bash
```

No **Windows PowerShell**:

```powershell
irm https://claude.ai/install.ps1 | iex
```

No **Windows CMD**:

```cmd
curl -fsSL https://claude.ai/install.cmd -o install.cmd && install.cmd && del install.cmd
```

Pronto — em poucos segundos o binário está na sua máquina. Pense nesse instalador como baixar um aplicativo pronto: você não precisa montar as peças, ele já vem completo.

[![Masterclass: seu primeiro agente de IA em até 6h por R$17](/images/banner-masterclass.svg)](/assinatura/)

## Métodos alternativos: npm, Homebrew, WinGet e Linux

O instalador nativo é o recomendado, mas não é o único caminho. Se você já tem Node.js e prefere o npm, o comando é:

```bash
npm install -g @anthropic-ai/claude-code
```

Esse pacote instala **o mesmo binário nativo** — a diferença é só o mecanismo de download. Um aviso oficial importante: **nunca use `sudo npm install -g`**, porque isso causa problemas de permissão e riscos de segurança. Para atualizar uma instalação via npm, use `npm install -g @anthropic-ai/claude-code@latest` (evite `npm update -g`, que pode não trazer a versão mais nova).

Também existem gerenciadores de pacotes:

- **Homebrew (macOS):** `brew install --cask claude-code`
- **WinGet (Windows):** `winget install Anthropic.ClaudeCode`
- **Linux:** apt, dnf ou apk, conforme sua distribuição

Atenção a um detalhe: instalações via Homebrew, WinGet e gerenciadores Linux **não se atualizam automaticamente**. Só as instalações nativas se atualizam em background. Se usar esses métodos, você mesmo precisa rodar a atualização de tempos em tempos.

### Um detalhe extra no Windows

No Windows nativo, instalar o **Git for Windows** é opcional, mas recomendado: com ele, o Claude Code usa o Git Bash para a ferramenta Bash; sem ele, usa o PowerShell como shell. Setups em WSL não precisam do Git for Windows.

Vale saber que há três opções no Windows: o nativo (sem requisitos extras, mas sem suporte a sandboxing), o **WSL 2** (ideal para toolchains Linux e o único com sandboxing suportado) e o WSL 1 (quando o WSL 2 não está disponível, também sem sandboxing). Se você pretende isolar a execução de comandos, o WSL 2 é o caminho.

## Login e autenticação passo a passo

Com a ferramenta instalada, é hora de conectar sua conta. Abra o terminal e digite:

```bash
claude
```

No primeiro lançamento, o Claude Code abre uma janela do navegador para você fazer login. Se o navegador não abrir sozinho, pressione a tecla `c` para copiar a URL de login e cole no browser manualmente. Em ambientes como WSL2, SSH ou containers, cole o código exibido no campo `Paste code here if prompted`.

Depois de logado, você já está pronto para usar. Para sair da conta, use o comando `/logout`.

**Fique atento a uma pegadinha comum:** se a variável de ambiente `ANTHROPIC_API_KEY` estiver definida na sua máquina, ela tem **precedência sobre a sua assinatura** — ou seja, o Claude Code vai cobrar pela API em vez de usar seu plano Pro. Se você tem assinatura ativa mas percebe cobrança de API, rode `unset ANTHROPIC_API_KEY` para voltar a usar a assinatura e confirme com `/status`.

## Verifique a instalação e crie seu primeiro CLAUDE.md

Instalou e autenticou? Confirme se está tudo certo. Para ver a versão:

```bash
claude --version
```

Para um diagnóstico completo da instalação e configuração — útil quando algo não funciona como esperado:

```bash
claude doctor
```

Agora vem a parte que transforma a ferramenta de "curiosa" em "útil de verdade". Abra o terminal dentro da pasta do seu projeto, rode `claude` e, na primeira sessão, digite:

```bash
/init
```

O comando `/init` analisa o código do seu projeto para detectar sistemas de build, frameworks de teste e padrões de código, e gera um arquivo **CLAUDE.md** na raiz. Esse arquivo é lido no início de cada sessão e funciona como um briefing permanente: padrões de código, decisões de arquitetura e bibliotecas preferidas. Depois, use `/memory` para refinar.

Se quiser dominar esse arquivo — que é onde mora boa parte do resultado do Claude Code — vale a pena estudar a fundo. É exatamente esse tipo de detalhe prático que trabalhamos nos cursos da Strat Academy, para você sair da instalação e chegar a projetos reais.

## Como começar agora

Instalar é só o portão de entrada. O que realmente importa é o que você faz na primeira semana com a ferramenta rodando.

Comece pequeno: peça ao Claude Code para explicar um projeto seu, criar um script simples de automação ou corrigir um erro que está te travando. Cada tarefa concluída aumenta sua confiança e revela um novo uso que você nem imaginava.

E você não precisa fazer isso sozinho tateando no escuro. Se quiser o caminho guiado, do zero ao seu primeiro agente de IA funcionando em poucas horas, dá uma olhada na nossa [Strat Academy 2.0](/assinatura/) — o jeito mais rápido de sair da teoria e ver a ferramenta trabalhando pra você.

---
**Leia também:**
- [O que é Claude Code e como usar na prática](/blog/o-que-e-claude-code-e-como-usar-na-pratica-para-programar-com-ia/)
- [CLAUDE.md: como configurar o Claude Code](/blog/claude-md-como-configurar-o-claude-code-para-entender-seu-projeto/)
- [10 comandos e prompts essenciais do Claude Code](/blog/10-comandos-e-prompts-essenciais-do-claude-code/)
