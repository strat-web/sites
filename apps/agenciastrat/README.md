# Agência Strat — WEB-23

Migração do `Strat-Ai-Horus-OS/strat-lps`, `lps/agencia`, commit `05ca028` (13/11/2026, correção WEB-71 incluída), para Astro com o kit. Home e política conferidas contra o HTML público em 16/11/2026; o servidor antigo acrescenta o Umami a ambas.

| Rota | Conteúdo | Medição |
|---|---|---|
| `/` | `src/html/home.*.html` e `src/pages/index.astro` | MetricaaS `strat-marketing`, pixel da Agência só após aceite e Umami pelo kit |
| `/politica-de-privacidade/` | `src/html/politica-de-privacidade.*.html` | somente Umami pelo kit, como no ar |

`public/css/`, `public/js/` e `public/midia/` vêm da mesma revisão do original. O JS preserva os campos e a validação da WEB-71, os cliques, a vitrine e o formulário. O bloco antigo de cookies saiu do JS: só o kit cuida do consentimento, com a mesma chave `strat_cookies`; CSS local mantém a apresentação original. O kit espera o m.js carregar antes de liberar o pixel (WEB-80).

SEO e JSON-LD da marca vêm do Layout. FAQPage original mantido, sem duplicar ProfessionalService. Caminhos de recursos passaram a ser absolutos para funcionar na política com barra no fim. A política mantém o texto original, inclusive as referências ao domínio atual; atualização do texto para a virada fica pendente de revisão de conteúdo.

`/politica-de-privacidade` e `/politica-de-privacidade.html` respondem 301 para `/politica-de-privacidade/` via `_redirects`. O redirecionamento entre domínios é WEB-29. As páginas de teste `/kit/lead/`, `/kit/portao/` e `/kit/gpt-4.1/` saíram conforme previsto no catálogo. O molde da imagem OG ficou em `design/`, fora das rotas públicas.

## Conferir localmente

`pnpm --filter @strat/agenciastrat dev --host 127.0.0.1 --port 4323`.

Comparar com https://agencia.stratai.com.br/ em 390 e 1440 px, com aviso de cookies, aceite e recusa. Não enviar lead real no preview. A autorização do domínio e o teste ponta a ponta ficam nos WEB-28/31; `/advogados` e `/bio` são WEB-24/25.

## Validação e pendências

Build e testes iniciais passaram. Tracking, SEO e links das páginas migradas passaram após retirar o molde OG das rotas públicas. A home soma cerca de 5,7 MB no orçamento de recursos locais: os três vídeos originais somam cerca de 4,8 MB. Mantidos sem recompressão para preservar a mídia. O teto de 1,5 MB e as exceções não foram alterados; definir tratamento desses vídeos antes de publicar o PR. WEB-88 (#35) ainda em revisão: esta branch vem da main e ainda usa o servidor Lighthouse sem compressão.

Sem publicação, mudança de DNS ou envio de lead real nesta etapa.

Decisão do Jhonathan em 16/11: preservar os arquivos originais e encaminhar a restrição de peso ao Helbert; registrado no comentário da WEB-23. Sem recompressão, R2 ou exceção nesta etapa.
