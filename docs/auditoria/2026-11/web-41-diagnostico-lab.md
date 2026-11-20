# Diagnóstico de LP do lab em stratai.com.br · 2026-11-16 (WEB-41)

Teste do motor de LP do lab (`lab` 0.6.0, skill `lp-diagnostico` 0.2.0) num site do catálogo, rodado na máquina do
Jhonathan, nos dois modos: **rápido** e **completo**. O alvo foi https://stratai.com.br/, ainda servido pelo
`strat-lps` (a virada para `apps/stratai` é o [WEB-32](https://plane.strat.tec.br/grupo-strat/browse/WEB-32/)).
Nada no site nem no motor foi alterado. Cada falha virou item no `WEB` ou foi ligada a um item que já existia.

Relatórios (HTML e PDF), anexo técnico, capturas e bruto ficam fora do git, na máquina de quem rodou
(`lp-diagnosticos/strat-web41-{rapido,completo}/2026-11-16/`). Nenhum dado de lead foi coletado: a coleta não clicou
em CTA nem enviou formulário.

## Resultado

| | Rápido | Completo |
|---|---|---|
| **Nota Strat** | 83 | 82 |
| Velocidade · Conversão · SEO · Confiança | 69 · 92 · 96 · 82 | 66 · 92 · 96 · 82 |
| PageSpeed celular (performance · acessib. · boas práticas · SEO) | 69 · 95 · 100 · 100 | 66 · 95 · 100 · 100 |
| LCP no celular (laboratório) | 8,2 s | 8,2 s |
| PageSpeed computador (performance) | 52 (1 rodada) | 83 (mediana de 3) |
| Peso da home no celular | 1,16 MB, 33 requisições | 1,17 MB, 33 requisições |
| Crawl das páginas do sitemap | não se aplica | falhou no motor; refeito à mão (3 de 3 páginas) |

Os números de PageSpeed são de laboratório (Lighthouse 13.6.0); o rápido usa a mediana de 3 rodadas no celular e 1 no
computador, o completo usa 3 nos dois. A diferença de 52 para 83 no computador é variação entre rodadas, não mudança
no site.

Crawl refeito por contorno (Unlighthouse 0.19.1, uma amostra por página):

| Página | Performance | Acessib. | Boas práticas | SEO | LCP |
|---|---|---|---|---|---|
| `/` | 76 | 95 | 77 | 100 | 4,5 s |
| `/politica-de-privacidade` | 90 | 100 | 100 | 100 | 2,7 s |
| `/raio-x/` | 90 | 100 | 77 | 100 | 2,6 s |

## Cada achado e o seu destino

| # | Achado | Evidência | Destino |
|---|---|---|---|
| 1 | Modo completo não termina o crawl: o motor grava a configuração do Unlighthouse dentro da pasta de saída, e o Unlighthouse recusa a pasta não vazia | `resumos/crawl.json` com erro e código 1 | [WEB-93](https://plane.strat.tec.br/grupo-strat/browse/WEB-93/) (novo, motor) |
| 2 | A Nota Strat deixa "contato clicável" sem medir, embora o navegador tenha confirmado 6 links de WhatsApp com mensagem | `navegador-atual.json` com `whatsapp_link=true`; `nota.json` com `contato_clicavel=null` | [WEB-94](https://plane.strat.tec.br/grupo-strat/browse/WEB-94/) (novo, motor) |
| 3 | PDF deixa o título do comparativo sozinho numa página e a tabela na seguinte | PDF original guardado em `achados/relatorio-original.pdf` | [WEB-95](https://plane.strat.tec.br/grupo-strat/browse/WEB-95/) (novo, motor) |
| 4 | `www.stratai.com.br` responde 200 e não leva ao domínio sem www | `sinais-atual.json` com `variante_www.consolidado=false` | [WEB-96](https://plane.strat.tec.br/grupo-strat/browse/WEB-96/) (novo; depende da virada do WEB-32) |
| 5 | Contraste insuficiente na home | Lighthouse `color-contrast`, celular e computador, nos dois modos | [WEB-97](https://plane.strat.tec.br/grupo-strat/browse/WEB-97/) (novo) |
| 6 | Salto na hierarquia de títulos da home | Lighthouse `heading-order`, nos dois modos | [WEB-98](https://plane.strat.tec.br/grupo-strat/browse/WEB-98/) (novo) |
| 7 | Nome acessível de um controle diferente do texto visível | Lighthouse `label-content-name-mismatch`, nos dois modos | [WEB-99](https://plane.strat.tec.br/grupo-strat/browse/WEB-99/) (novo) |
| 8 | Home lenta no celular (LCP de 8,2 s; cache curto, imagens e JS duplicado entre as oportunidades) | `psi-atual.json` | [WEB-87](https://plane.strat.tec.br/grupo-strat/browse/WEB-87/) (já existia) |
| 9 | JSON-LD não aparece no HTML da home | `sinais-atual.json` | [WEB-33](https://plane.strat.tec.br/grupo-strat/browse/WEB-33/) (já existia) |
| 10 | Cabeçalhos de segurança ausentes | `sinais-atual.json` | [WEB-21](https://plane.strat.tec.br/grupo-strat/browse/WEB-21/) no kit e virada no [WEB-32](https://plane.strat.tec.br/grupo-strat/browse/WEB-32/) (já existiam): é o `strat-lps`, não o kit |

### O que não virou item
- **Prova social:** o motor marcou `prova_social_indicio=false`, mas as capturas a 390 e 1440 px mostram três logos de
  clientes na primeira dobra. O relatório saiu com a leitura visual, sem acusar falta de prova social.
- **Tracking:** o navegador viu pixel `1823024821883911`, GA4 `G-3VJ019EH58`, Rastro, MetricaaS e PostHog carregando, como
  no catálogo. Carregar não prova que a conversão chega certa; a conferência de ponta a ponta é o portão
  [WEB-39](https://plane.strat.tec.br/grupo-strat/browse/WEB-39/).
- **Recursos e cookies de terceiros** no crawl: pistas de laboratório, sem causa nova comprovada.

## Limites desta rodada
- **Trace de desempenho não foi feito:** a causa do LCP fica para o [WEB-87](https://plane.strat.tec.br/grupo-strat/browse/WEB-87/).
- **Crawl por contorno:** o `crawl.json` original, com a falha, ficou preservado; o resultado das 3 páginas está em
  `resumos/crawl-contorno.json`.
- **PDF:** a paginação foi corrigida só nos arquivos locais, para entregar o relatório; o motor continua igual até o WEB-95.
- O relatório passou por um verificador independente, aprovado na segunda volta. O HTML foi conferido a 390 e a 1440 px
  sem rolagem lateral e sem erro de execução.

## Próximo passo
As falhas do motor (WEB-93 a WEB-95) entram antes de promover as skills de LP para o plugin `site` da oficina
([WEB-42](https://plane.strat.tec.br/grupo-strat/browse/WEB-42/)) e do portão F5
([WEB-45](https://plane.strat.tec.br/grupo-strat/browse/WEB-45/)). O WEB-93 vem primeiro, porque sem ele o modo completo
não termina.
