---
title: "Como gerar vídeo com IA no Claude Code, do roteiro em JSON ao MP4"
description: "Como gerar vídeo com IA no Claude Code: escolha o modelo, escreva a cena em JSON, gere o rascunho em 480p e revise os frames antes do render final."
pubDate: 2026-10-15
author: "Helbert Paranhos"
tags: ['claude-code', 'ia']
cover: "https://assets.stratacademy.com.br/blog/gerar-video-ia-claude-code/abertura.webp"
faq:
  - q: "O Claude consegue gerar vídeo?"
    a: "Sozinho, não. Quem gera o vídeo é um modelo de vídeo, como o Seedance 2.5 ou o Wan 3.0, chamado pela API. O Claude Code escreve a cena, chama o modelo pelo MCP do fal, lê como imagem os frames extraídos com ffmpeg para revisar o take e monta o MP4 com as skills oficiais do Remotion."
  - q: "Qual a melhor IA para gerar vídeo em 2026?"
    a: "Não há um vencedor único. No ranking de texto para vídeo com áudio da Artificial Analysis, em 15 de outubro de 2026, Wan 3.0, Utopai X, Seedance 2.5 e MiniMax H3 aparecem com faixas de posição sobrepostas, o que é empate técnico; outras arenas põem o Kling na frente. Escolha pelo trabalho: duração do take, número de referências, preço por segundo e idioma da fala."
  - q: "Posso mandar prompt em JSON para o Veo ou o Seedance?"
    a: "Pode colar, mas o guia oficial do Seedance 2.5 descreve o prompt em linguagem natural, com intervalos de tempo e o papel de cada referência escritos por extenso. O JSON rende mais como contrato entre o Claude Code e o seu código: o código valida os limites do modelo e compila o JSON no texto que o guia pede."
  - q: "Quanto custa gerar vídeo com IA pela API?"
    a: "Depende do modelo, da resolução e do provedor. Pelas tabelas públicas consultadas em 14 de outubro de 2026, 30 segundos custam US$ 13,87 no Seedance 2.5 em 720p pelo fal, US$ 4,02 no Seedance 2.5 pela Atlas Cloud e US$ 3,00 no Wan 3.0 em 720p pela Alibaba. Cada tentativa paga de novo, então rascunho em 480p e render final só do take aprovado é o que mais economiza."
  - q: "A IA de vídeo fala português?"
    a: "Depende do modelo. O fal lista o português entre os idiomas de fala do Seedance 2.5; o Google diz que, no Veo, só o inglês é totalmente suportado; a documentação do Wan 3.0 não lista idiomas. Antes de planejar um vídeo com diálogo, gere um take curto em português do Brasil e declare o idioma e a variante antes da fala."
draft: false
---

Para gerar vídeo com IA no Claude Code, você não pede o vídeo ao Claude Code: pede que ele escreva a cena, chame um modelo de vídeo pela API, confira os frames do resultado e monte o MP4. Quem desenha o movimento é o modelo, como o Seedance 2.5 ou o Wan 3.0. O Claude Code cuida do trabalho em volta dessa chamada, e é ali que se decide quantas tentativas você vai pagar.

Quem gera vídeo direto num site costuma passar por isto: escreve um parágrafo, espera, não gosta, troca uma palavra e gera de novo. Na quarta tentativa a personagem já mudou de rosto, o logo saiu torto e ninguém lembra qual versão do prompt deu o take bom.

Este guia vai do modelo ao MP4 e fecha com um prompt para colar no Claude Code. O comercial de café do exemplo é ilustrativo: a conta dele vem da tabela pública, não de um vídeo gerado para este post.

Se o Claude Code ainda não está na sua máquina, comece pelo guia para [instalar o Claude Code](/blog/como-instalar-o-claude-code-do-zero-guia-completo-2026/).

![Bancada para gerar vídeo com IA no Claude Code: terminal e timeline de um comercial de café no monitor, o take vertical no celular e adesivos do Claude, fal, FFmpeg e Remotion no notebook](https://assets.stratacademy.com.br/blog/gerar-video-ia-claude-code/abertura.webp)

[![Conheça a Strat Academy — cursos de IA e automação na prática](/images/banner-academy.svg)](/assinatura/)

## O Claude Code gera vídeo?

Sozinho, não. O vídeo sai de um modelo de vídeo chamado pela API, e o Claude Code cuida de tudo que acontece antes e depois dessa chamada. Três termos aparecem o tempo todo daqui em diante:

- **API** é a porta pela qual um programa pede um serviço a outro: você manda o prompt e as referências, o provedor devolve o MP4.
- **MCP** (*Model Context Protocol*, o protocolo que liga o Claude Code a ferramentas externas) deixa o Claude Code chamar essa API sem você escrever um cliente para cada fornecedor.
- **Take** é cada clipe que sai de uma chamada ao modelo. Um vídeo de 30 segundos pode ser um take ou quatro.

No pipeline deste guia, o Claude Code faz cinco coisas: escreve a cena num arquivo JSON, roda o código que valida a cena contra os limites do modelo, chama o modelo, revisa os frames do resultado e monta o vídeo final. O modelo de vídeo faz uma só: gerar o take.

Três ferramentas entram nesse caminho. O **fal** é um provedor que dá acesso a mais de 1.000 modelos com uma conta só, e o Claude Code fala com ele pelo MCP. O **ffmpeg** é um programa de linha de comando para vídeo; aqui, ele extrai os frames para a revisão. O **Remotion** monta o vídeo final como uma composição em React.

## Qual modelo de vídeo chamar pela API em outubro de 2026

Chame o modelo pelo tipo de trabalho, não pela posição no ranking. Para um take único de até 30 segundos com áudio, o Seedance 2.5 (ByteDance) e o Wan 3.0 (Alibaba) são os desta tabela que chegam lá numa chamada só; os outros casos estão na lista logo abaixo dela.

| Modelo | Take numa chamada | Referências por geração | Preço por segundo | Onde chamar |
|---|---|---|---|---|
| **Seedance 2.5** | 4 a 30 s, com áudio | até 30 imagens, 10 vídeos e 10 áudios | fal: ~US$ 0,21 (480p) e ~US$ 0,46 (720p), pela fórmula de token; Atlas Cloud: US$ 0,134 fixo | fal (480p e 720p), Atlas Cloud, BytePlus ModelArk |
| **Wan 3.0** | 2 a 30 s, até 1080p, com áudio | até 10 imagens, 5 vídeos e 5 áudios, mais 1 documento | US$ 0,05 (480p), US$ 0,10 (720p), US$ 0,20 (1080p) | Alibaba Cloud Model Studio |
| **MiniMax H3 / H3-Max** | H3: 4 a 15 s (768p ou 2K); H3-Max: 5 a 15 s (480p ou 768p) | até 9 imagens, 3 vídeos e 3 áudios, 12 arquivos no máximo | H3: US$ 0,08 (768p) e US$ 0,13 (2K); H3-Max: US$ 0,05 (480p) e US$ 0,08 (768p) | API da MiniMax |
| **Veo 3.1** | 4, 6 ou 8 s; estende 7 s por vez, até 148 s | até 3 imagens | Standard: US$ 0,40 (720p e 1080p); Lite: US$ 0,05 (720p) | Gemini API |
| **Kling 3.0 Pro** (limites do fal) | 3 a 15 s; aceita prompt em vários shots, de 1 a 15 s cada | elementos chamados no prompt por @Element, cada um com imagens (uma frontal + 1 a 3 de outros ângulos) ou um vídeo; só um elemento por pedido pode ser vídeo | fal: US$ 0,112 sem áudio e US$ 0,168 com áudio | fal |

Fontes, consultadas em 14 de outubro de 2026: [ByteDance Seed](https://seed.bytedance.com/en/blog/one-take-creation-flexible-referencing-introducing-seedance-2-5) e [fal](https://fal.ai/models/bytedance/seedance-2.5/text-to-video) para o Seedance 2.5, [Atlas Cloud](https://ask.atlascloud.ai/seedance-2-5-image-to-video-api-provider-pricing) para a taxa fixa, a [referência da API](https://www.alibabacloud.com/help/en/model-studio/wan3-video-generation-api-reference) e a [tabela de Singapura](https://www.alibabacloud.com/help/en/model-studio/wan3-0-video) do Wan 3.0, o [guia de vídeo](https://platform.minimax.io/docs/guides/video-generation) e os [preços](https://platform.minimax.io/docs/guides/pricing-paygo) da MiniMax, a [documentação do Veo](https://ai.google.dev/gemini-api/docs/veo) e os [preços da Gemini API](https://ai.google.dev/gemini-api/docs/pricing), e o Kling 3.0 Pro no fal ([preço](https://fal.ai/models/fal-ai/kling-video/v3/pro/text-to-video) e [API](https://fal.ai/models/fal-ai/kling-video/v3/pro/image-to-video/api)). No fal, o Seedance 2.5 vai só até 720p; a [página da BytePlus](https://ai.byteplus.com/en/activity/seedance2-5) lista também 1080p.

### Escolha pelo trabalho, não pelo ranking

- **Take único de até 30 s com várias ações:** Seedance 2.5 ou Wan 3.0, os dois da tabela que chegam a 30 s numa chamada.
- **Mesmo personagem ou produto em vários vídeos:** Seedance 2.5, que aceita até 50 referências por geração. Você monta um banco de referências e reaproveita em todas as chamadas.
- **Briefing que já existe em PDF ou planilha:** Wan 3.0, que aceita 1 documento por pedido como insumo, até 100 MB e 50 páginas.
- **Clipe curto em 1080p ou 4K:** Veo 3.1, sabendo que 1080p e 4K só saem com take de 8 s.
- **Rascunho barato:** MiniMax H3-Max ou Wan 3.0 a US$ 0,05/s em 480p, ou o Seedance 2.0 Mini, a cerca de US$ 0,07/s em 480p no fal.

Fontes: as da tabela acima, mais [fal, Seedance 2.0 Mini](https://fal.ai/models/bytedance/seedance-2.0/mini/text-to-video).

No ranking de texto para vídeo com áudio da [Artificial Analysis](https://artificialanalysis.ai/video/leaderboard/text-to-video), feito com votos humanos em pares, Wan 3.0, Utopai X, Seedance 2.5 e MiniMax H3 dividiam o topo em 15 de outubro de 2026, em empate técnico (as faixas de posição se sobrepõem); o Kling 3.0 Pro, régua de 1.000 pontos da escala (a versão Omni aparece em 15º), e o Veo 3.1 ficavam fora dos 15 primeiros.

Na arena da [LLM Stats](https://llm-stats.com/leaderboards/best-ai-for-video-creation), em 14 de outubro de 2026, o Kling 3.0 liderava. E boa parte dos comparativos em português vem de quem vende acesso aos modelos, como WaveSpeed e Atlas Cloud.

O Sora ficou fora da tabela: a OpenAI removeu da API a Videos API e os modelos `sora-2` e `sora-2-pro` em 24 de setembro de 2026, sem indicar substituto ([OpenAI, Deprecations](https://developers.openai.com/api/docs/deprecations)).

## Por que o JSON não vai direto no prompt

Porque o JSON não é a língua do modelo de vídeo. O [guia oficial do Seedance 2.5](https://fal.ai/learn/devs/how-to-use-seedance-2-5), escrito pela BytePlus e publicado no fal, descreve o prompt em linguagem natural, com intervalos de tempo e o papel de cada referência escritos por extenso. O JSON trabalha antes da chamada: é o **contrato** entre o Claude Code, que planeja a cena, e o seu código, que confere os limites do modelo e escreve o texto final.

A diferença aparece quando o projeto cresce:

| | Jeito comum | Jeito que escala |
|---|---|---|
| O que o Claude Code escreve | "um prompt em JSON" | um `scene.json` que segue um schema seu |
| O que vai para a API | o JSON colado no campo de prompt | texto compilado para aquele modelo |
| Limites do modelo | descobertos no erro, depois de pagar | checados no código, antes de gastar |
| Trocar de modelo | reescrever todos os prompts | trocar o compilador |
| Reproduzir o take bom | depende de achar o prompt certo | o `log.json` guarda prompt, parâmetros e custo |

*Schema* é o arquivo que define os campos que a cena pode ter e o tipo de cada um. Com ele, o Claude Code não inventa campo, e o código recusa a cena antes de chamar a API.

## Como montar o pipeline para gerar vídeo com IA no Claude Code

O pipeline tem sete etapas. A primeira é sua, e também as aprovações de gasto e de rascunho; o resto o Claude Code escreve e roda:

| Etapa | O que sai | Quem faz |
|---|---|---|
| 1. Brief | ideia, público, formato (9:16 ou 16:9), duração e tom | você |
| 2. Cena | `scene.json` no schema | Claude Code |
| 3. Validação | ok, ou erro claro antes de gastar | código (`validate.ts` + `limits.json`) |
| 4. Compilação | prompt em texto para o modelo escolhido | código (um compilador por modelo) |
| 5. Geração | MP4 de cada take em 480p, com o custo anotado | Claude Code pelo MCP do fal |
| 6. Revisão | cada take aprovado ou reprovado, com motivo | ffmpeg + Claude Code |
| 7. Montagem | o MP4 final no formato do brief | skills do Remotion |

Se quiser aprender o Claude Code com método antes de montar isso, o [curso de Claude Code](/curso-claude-code/) é o ponto de partida.

### Conectar o MCP do fal

O MCP do fal é gratuito: você paga só o modelo que rodar ([fal](https://fal.ai/mcp)). O comando oficial para ligar no Claude Code é este ([documentação do fal](https://fal.ai/docs/documentation/setting-up/mcp/claude-code)):

```bash
claude mcp add --transport http --scope user fal https://mcp.fal.ai/mcp-relay
```

Depois, dentro do Claude Code, rode `/mcp`, escolha **fal** e **Authenticate**: o login abre no navegador. O MCP do fal usa OAuth, a autorização por login no navegador, e dispensa chave de API ([fal, MCP server](https://fal.ai/docs/model-apis/mcp)). Se é a primeira vez que você faz isso, o passo a passo para [conectar o Claude Code a um servidor MCP](/blog/como-conectar-o-claude-code-as-suas-ferramentas-com-mcp/) explica transporte e escopo.

Pela [documentação do fal](https://fal.ai/docs/model-apis/mcp), o MCP expõe ferramentas para buscar modelos, ler o schema de entrada e saída, consultar preço (`get_pricing`), enviar job longo, checar status, baixar o resultado, cancelar e subir arquivo. É tudo que a geração assíncrona precisa: o Claude Code manda o job, acompanha o status e baixa o MP4 quando fica pronto.

### Validar antes de gastar

O validador lê um `limits.json` por modelo e recusa a cena que o modelo não aceita. No Seedance 2.5, os vídeos de referência somam no máximo 30 s, e os áudios também. No Wan 3.0, com vídeo de entrada, entrada e saída somam no máximo 30 s, e os vídeos de referência, 15 s. No Veo 3.1, a duração só pode ser 4, 6 ou 8 s.

Fontes: [guia oficial do Seedance 2.5](https://fal.ai/learn/devs/how-to-use-seedance-2-5); [Model Studio, Wan 3.0](https://www.alibabacloud.com/help/en/model-studio/wan3-video-generation-api-reference); [Gemini API, Veo](https://ai.google.dev/gemini-api/docs/veo).

Peça ao Claude Code para preencher o `limits.json` lendo o schema pelo MCP, em vez de copiar números de um post, inclusive deste. O provedor muda o schema, e o arquivo acompanha.

Uma regra que vale codificar: **não misture quadro inicial/final com referências na mesma chamada**. No fal, cada modo de geração tem o seu *endpoint* (o endereço da API para aquele modo): quadro inicial e final ficam no endpoint de imagem para vídeo, e para mais que isso o fal manda usar o endpoint de referência. No modo de referência, o guia oficial deixa declarar na primeira linha do prompt que a @Image 1 é o quadro inicial, e pede a mesma proporção na imagem inicial e na final.

Fontes: [fal, Seedance 2.5 image-to-video](https://fal.ai/models/bytedance/seedance-2.5/image-to-video); [guia oficial do Seedance 2.5](https://fal.ai/learn/devs/how-to-use-seedance-2-5).

### Compilar o JSON para cada modelo

O compilador transforma o `scene.json` no texto que o guia de cada modelo pede. Para o Seedance 2.5, a ordem usada aqui é: formato, papel de cada referência, linha do tempo, câmera, continuidade, áudio e restrições. A próxima seção mostra o antes e o depois.

Para cenas com muitos cortes, existe um passo opcional: gerar uma grade de **storyboard** num modelo de imagem e mandar como referência de ordem e composição. O guia oficial aceita essa grade, recomenda no máximo 15 painéis e dá exemplo com quatro ([guia oficial](https://fal.ai/learn/devs/how-to-use-seedance-2-5)).

### Gerar em 480p e revisar os frames

A geração sai sempre em 480p até alguém aprovar. Para revisar, o ffmpeg extrai um frame por segundo de cada take, com a opção `-r 1` que a [documentação do ffmpeg](https://ffmpeg.org/ffmpeg.html) mostra:

```bash
mkdir -p frames
ffmpeg -i out/cafe-lancamento/take-01.mp4 -r 1 -f image2 frames/take-01-%03d.jpeg
```

O Claude Code lê os JPEGs como imagem: a ferramenta Read do Claude Code devolve PNG e JPG como conteúdo visual, não como bytes. O Claude Code confere cada frame contra o campo `continuity` do `scene.json`: avental verde em todos os shots, logo virado para a câmera. O take reprovado volta para a geração com o shot e o motivo anotados; os aprovados ficam como estão. Se a revisão crescer, ela pode virar um subagente revisor que só faz isso.

O rascunho em 480p já sai leve para a revisão. No 9:16, o fal entrega 496 × 864, e cada frame custa ⌈496/28⌉ × ⌈864/28⌉ = 18 × 31 = 558 tokens visuais; os 15 frames do café somam 8.370. Um frame de 1920 × 1080 custaria 2.691 nos modelos Claude 4.7 ou posteriores.

A revisão tem dois limites. No rascunho em 480p, as letras do logo podem não aparecer nítidas: confira de novo no render final (em imagem grande, o Claude Code reduz e recomprime antes de mandar ao modelo, e aí vale recortar a região). E a Anthropic avisa que o Claude erra mais em imagem pequena ou de baixa qualidade.

Fontes: [Claude Code, Tools reference](https://code.claude.com/docs/en/tools-reference); [Claude API, Vision](https://platform.claude.com/docs/en/build-with-claude/vision); [fal, dimensões do Seedance 2.5](https://fal.ai/models/bytedance/seedance-2.5/text-to-video).

### Montar com as skills do Remotion

As Agent Skills oficiais do [Remotion](https://www.remotion.dev/docs/ai/skills) são 12 e se instalam com um comando:

```bash
npx skills add remotion-dev/skills
```

Três skills do Remotion fazem a montagem deste pipeline: `/remotion-create` cria o projeto ou a composição nova, `/remotion-captions` orienta as legendas e `/remotion-render` renderiza o projeto em vídeo. Na dúvida sobre qual chamar, `/remotion-best-practices` é a skill guarda-chuva que cobre as outras. Se *skill* ainda é termo novo, vale ler o que são as [skills do Claude](/blog/o-que-sao-claude-skills-e-as-15-melhores-para-turbinar-sua-produtividade-com-ia/) antes.

## O mesmo shot antes e depois de compilar

O shot sai do Claude Code como um `scene.json`, com papéis, tempos e áudio em campos separados, e chega ao Seedance 2.5 como texto em inglês com a fala em português. O exemplo abaixo é o comercial de café de 15 s, em três shots.

O contrato, como o Claude Code escreve:

```json
{
  "project": "cafe-lancamento",
  "target_model": "seedance-2.5",
  "format": { "aspect_ratio": "9:16", "duration_s": 15, "resolution": "480p" },
  "assets": {
    "barista":  { "ref": "Image 1", "role": "face, hair and green apron only" },
    "cup":      { "ref": "Image 2", "role": "cup shape and printed logo only" },
    "location": { "ref": "Image 3", "role": "counter, window, morning light only",
                  "exclude": ["people"] }
  },
  "shots": [
    { "t": "0-4", "camera": "pushIn",
      "action": "barista pours steamed milk, rosette forms",
      "audio": { "sfx": "milk steaming hiss" } },
    { "t": "4-9", "camera": "orbitRight",
      "action": "cup slides across counter toward lens",
      "audio": { "sfx": "ceramic on wood" } },
    { "t": "9-15", "camera": "static",
      "action": "customer takes first sip and smiles",
      "audio": { "dialogue": "Melhor café do bairro.",
                 "voice": "warm female, Brazilian Portuguese" } }
  ],
  "continuity": ["same green apron in every shot", "logo always facing camera"],
  "constraints": ["no on-screen text except the cup logo"]
}
```

O prompt compilado, como vai para a API:

```text
Vertical 9:16 coffee-shop commercial, natural morning light, clean product look.

References:
@Image 1 defines only the barista's face, hair and green apron.
@Image 2 defines only the cup shape and its printed logo.
@Image 3 defines only the counter, the window and the morning light.
Do not use the people in this image.

0-4 seconds: slow push-in as the barista pours steamed milk and a rosette forms.
Sound: milk steaming.
4-9 seconds: the camera orbits right as the cup slides across the wooden counter
toward the lens, logo facing the camera. Sound: ceramic on wood.
9-15 seconds: static medium close-up. A customer takes the first sip and smiles.
In Portuguese, Brazilian variant, warm female voice, the customer says:
"Melhor café do bairro."

Continuity: same green apron in every shot; the logo always faces the camera.
No on-screen text other than the cup logo.
```

Cada linha segue uma regra publicada:

- **Papel de cada referência.** O guia oficial manda dizer o que cada imagem controla ("@Image 1 defines…") e o que não usar dela ("Do not use…"). O modelo não adivinha que a imagem 3 é a locação.
- **Linha do tempo sem buraco.** O guia pede intervalos como "0-5 seconds:", consecutivos e sem sobreposição; o guia da OpenArt acrescenta segundos inteiros.
- **Idioma antes da fala.** Quando a fala não é em chinês, o guia oficial manda declarar idioma, variante ou sotaque, jeito de falar e quem fala, nessa ordem, antes da frase.

O guia oficial também oferece uma **sintaxe opcional** para o áudio (música entre `()`, efeito entre `<>`, fala entre `{}` e legenda entre `【】`), mas o guia da Rendley diz para não presumir que esses sinais roteiam música, efeito ou fala, então comece pela linguagem natural, como acima.

Fontes: [guia oficial do Seedance 2.5](https://fal.ai/learn/devs/how-to-use-seedance-2-5) (BytePlus, publicado no fal); [guia da OpenArt](https://openart.ai/blog/seedance-2-5-prompt-guide/); [guia da Rendley](https://rendley.com/blog/how-to-prompt-seedance-2-5).

[![Strat Academy 2.0 — comece de graça no Strat Hub](/images/banner-assinatura.svg)](/assinatura/)

## Quanto custa gerar 30 segundos de vídeo

Pelas tabelas públicas de 14 de outubro de 2026, 30 segundos de vídeo custam de US$ 1,50 a US$ 13,87 por tentativa, conforme modelo, resolução e provedor. No fal, o Seedance 2.5 é cobrado por token, a unidade de cobrança que o fal calcula pelo tamanho do quadro e pela duração: US$ 0,0214 por 1.000 tokens, com tokens = altura × largura × duração × 24 ÷ 1024. Os outros desta tabela cobram por segundo. As contas:

| Modelo e provedor | Conta | 30 s | Em reais |
|---|---|---:|---:|
| Seedance 2.5, fal, 720p | 1280 × 720 × 30 × 24 ÷ 1024 = 648.000 tokens × US$ 0,0214/1.000 | US$ 13,87 | R$ 69,47 |
| Seedance 2.5, fal, 480p | 864 × 496 × 30 × 24 ÷ 1024 = 301.320 tokens × US$ 0,0214/1.000 | US$ 6,45 | R$ 32,30 |
| Seedance 2.5, Atlas Cloud | 30 × US$ 0,134 | US$ 4,02 | R$ 20,14 |
| Wan 3.0, 1080p | 30 × US$ 0,20 | US$ 6,00 | R$ 30,06 |
| Wan 3.0, 720p | 30 × US$ 0,10 | US$ 3,00 | R$ 15,03 |
| Veo 3.1 Standard, 1080p | 4 takes de 8 s = 32 × US$ 0,40 | US$ 12,80 | R$ 64,12 |
| Kling 3.0 Pro com áudio, fal | 30 × US$ 0,168 | US$ 5,04 | R$ 25,25 |
| Seedance 2.0 Mini, fal, 480p | 301.320 tokens × US$ 0,007/1.000 | US$ 2,11 | R$ 10,57 |
| MiniMax H3-Max, 480p | 2 takes de 15 s = 30 × US$ 0,05 | US$ 1,50 | R$ 7,51 |

Fontes: [fal (Seedance 2.5)](https://fal.ai/models/bytedance/seedance-2.5/text-to-video) e [fal (referência)](https://fal.ai/models/bytedance/seedance-2.5/reference-to-video), [Atlas Cloud](https://ask.atlascloud.ai/seedance-2-5-image-to-video-api-provider-pricing), [Alibaba Cloud](https://www.alibabacloud.com/help/en/model-studio/wan3-0-video) (região Singapura) e [referência da API do Wan 3.0](https://www.alibabacloud.com/help/en/model-studio/wan3-video-generation-api-reference), [Gemini API](https://ai.google.dev/gemini-api/docs/pricing), [fal (Kling)](https://fal.ai/models/fal-ai/kling-video/v3/pro/text-to-video), [fal (Seedance 2.0 Mini)](https://fal.ai/models/bytedance/seedance-2.0/mini/text-to-video) e [MiniMax](https://platform.minimax.io/docs/guides/pricing-paygo). Reais pela PTAX de venda de 13 de outubro de 2026, R$ 5,0096 ([Banco Central](https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/)).

Dois detalhes mudam a conta. No fal, segundo de vídeo de referência enviado também é cobrado, e imagem e áudio de referência não são. Ligar o áudio não muda o preço nem no Seedance 2.5 pelo fal nem no Wan 3.0.

O que mais pesa, porém, são as **tentativas**. Quatro tentativas de 30 s no Seedance 2.5 em 720p pelo fal somam 4 × 648.000 = 2.592.000 tokens, ou US$ 55,47. Três rascunhos em 480p e um único render final em 720p, no mesmo modelo, somam 3 × 301.320 + 648.000 = 1.551.960 tokens, ou US$ 33,21. Daí a regra do pipeline: rascunho em 480p, aprovação humana, render final só do take escolhido.

O render final em 720p é uma geração nova e pode sair diferente do rascunho que você aprovou. O rascunho aprova roteiro, enquadramento e ritmo; o detalhe fino se confere de novo no final.

No 9:16 (496 × 864 em 480p e 720 × 1280 em 720p), a conta é a mesma do 16:9, porque a área do quadro é igual. O comercial de café, com 15 s em 480p, dá metade dos tokens de 30 s, porque a conta é linear na duração: 150.660 tokens, cerca de US$ 3,22 no Seedance 2.5 pelo fal.

## Onde isso quebra

O pipeline resolve organização e custo, não o que o modelo ainda faz mal. E os números deste post valem para outubro de 2026: por isso o `limits.json` sai do schema e o custo, do `get_pricing`.

**Fala em português.** A BytePlus diz que o Seedance 2.5 suporta "mais de 10 idiomas" sem listar quais; a página do modelo no fal põe o português na lista. O Google diz que, no Veo, só o inglês é totalmente suportado e os outros idiomas "não foram avaliados".

A documentação do Wan 3.0 não lista idiomas, e o Kling 3.0 não lista português: no fal, fala em outro idioma é traduzida automaticamente para o inglês.

Fontes: [BytePlus, Seedance 2.5](https://ai.byteplus.com/en/activity/seedance2-5); [fal, Seedance 2.5](https://fal.ai/seedance-2.5); [Gemini API, Veo](https://ai.google.dev/gemini-api/docs/veo); [fal, Kling 3.0 Pro](https://fal.ai/models/fal-ai/kling-video/v3/pro/image-to-video/api).

O padrão interno da Strat nos criativos com Veo 3 separa o idioma do comando do idioma da fala: comando em inglês, o idioma que o Google suporta por inteiro, áudio em português e cenas de 8 segundos. A regra que vale para qualquer modelo: gere um take curto em português do Brasil antes de planejar um vídeo com diálogo.

**Física e cenas cheias.** A própria ByteDance diz que o Seedance 2.5 ainda tem a melhorar na física de movimentos complexos e em cenas com vários personagens interagindo. A Alibaba declara que a textura do áudio e a precisão do texto na tela do Wan 3.0 "ainda estão amadurecendo".

Texto na tela que precisa sair certo, como preço e telefone, fica mais seguro como legenda na montagem do que pedido no prompt.

Fontes: [ByteDance Seed](https://seed.bytedance.com/en/blog/one-take-creation-flexible-referencing-introducing-seedance-2-5); [Alibaba Cloud](https://www.alibabacloud.com/blog/603505).

## Próximo passo

Cole o prompt abaixo no Claude Code, numa pasta vazia, e deixe ele montar o pipeline. As três paradas marcam o que só você pode fazer: autorizar o acesso, aprovar o gasto e aprovar os rascunhos.

```text
Você vai montar, neste repositório, um pipeline de geração de vídeo por IA
que usa JSON como contrato interno e texto compilado como entrada da API.

Contexto
- Modelo: Seedance 2.5 pelo fal, rascunho em 480p e final em 720p.
  Seedance 2.0 Mini só se eu pedir.
- Acesso pelo MCP do fal. Montagem com as skills oficiais do Remotion.
- Linguagem: TypeScript (Node). Comentários em português.

PARADA 1 — HUMANO
Antes de qualquer código, me peça para:
  a) rodar no terminal:
     claude mcp add --transport http --scope user fal https://mcp.fal.ai/mcp-relay
  b) autorizar o fal pelo /mcp (fal → Authenticate, login no navegador).
Espere eu confirmar.

Etapa 1 — Descobrir os parâmetros reais
Use o MCP do fal para achar os endpoints do modelo (texto→vídeo,
imagem→vídeo, referência→vídeo), ler o schema e consultar o preço.
Salve em models/limits.json: durações, resoluções, limites de referência,
tamanho máximo de prompt, combinações que o schema não aceita e preço.
Não invente valores: o que não aparecer no schema vira "desconhecido".

Etapa 2 — Schema da cena
Crie schemas/scene.schema.json com: project, target_model, format
(aspect_ratio, duration_s, resolution), assets (ref, role, exclude),
shots (t, camera, action, audio {sfx, music, dialogue, voice}),
continuity, constraints. "camera" usa vocabulário fixo
(pushIn, orbitRight, static, handheld...).

Etapa 3 — Validador e compilador
- validate.ts: valida o scene.json contra o schema e contra o limits.json
  do modelo alvo. Falha com mensagem clara.
- compile/seedance.ts: transforma o scene.json em prompt de texto, nesta
  ordem: formato, papel de cada referência ("@Image N defines only ..."),
  linha do tempo em segundos inteiros, sem buraco nem sobreposição,
  câmera, continuidade, áudio por extenso e restrições curtas.
  Fala que não é em chinês, como o português, leva idioma e variante
  antes da frase.
- Não misture quadro inicial/final com referências na mesma chamada.
  No modo de referência, diga no prompt qual imagem abre o vídeo.

Etapa 4 — Geração
- generate.ts: envia o job, acompanha o status, baixa em
  out/{project}/take-{n}.mp4 e grava out/{project}/log.json com o prompt
  final, os parâmetros e o custo estimado.
- Padrão SEMPRE 480p. Resolução maior só com a flag --final.

PARADA 2 — HUMANO
Antes de cada execução, mostre o custo estimado total. Se passar de
US$ 5 ou se for --final, pare e peça minha aprovação.

Etapa 5 — Revisão visual
- qa.ts: extrai 1 frame por segundo com ffmpeg. Você revisa os frames
  contra continuity e constraints do scene.json e marca cada take como
  aprovado ou reprovado, citando o shot e o motivo. Gere de novo só os
  takes reprovados.

PARADA 3 — HUMANO
Me mostre os rascunhos aprovados antes de renderizar a versão final.

Etapa 6 — Montagem
Instale as skills oficiais (npx skills add remotion-dev/skills) e monte
a composição com os takes aprovados, legendas e logo. Exporte em 9:16;
para 16:9, gere os takes nesse formato.

Etapa 7 — Teste ponta a ponta
Rode com examples/cafe.scene.json (15 s, 3 shots, 480p) e me entregue:
o que foi feito, o que falta, o que precisa de mim e o que não foi
implementado.
```

Antes de rodar, salve o `scene.json` do café em `examples/cafe.scene.json` e troque as três imagens de referência pelas suas. Pela conta do fal, o teste de 15 s em 480p, cerca de US$ 3,22, fica abaixo do teto de US$ 5 por execução. O render final em 720p, cerca de US$ 6,93, roda com a flag `--final`, e por isso o Claude Code para e pede a sua aprovação.

Se MCP, skills e subagentes ainda são peças soltas para você, o caminho é aprender o Claude Code primeiro. Dá para [criar conta grátis no Strat Hub](https://hub.stratacademy.com.br) hoje, e a trilha completa, de Claude Code e MCP a agentes e automação com N8N, está na [Strat Academy 2.0](/assinatura/).
