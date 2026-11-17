# WEB-48 · Validação das LPs da Academy

Registro técnico de 17/11/2026. As últimas cinco rodadas PageSpeed e a janela de atribuição ficam também no corpo do PR #47/#51.

Fonte: `strat-lps` master `05ca028`, em 17/11/2026. Migração no PR #47, dependente do PR #51 (WEB-104). Sem virada de DNS.

## Escopo e revisão

Seis LPs, 35 rotas antigas preservadas e duas entradas jurídicas da Mentoria V2 recuperadas do Router original. Cada host tem projeto próprio no Pages. As variantes continuam noindex. Slugs, workspaces e URLs de checkout foram comparados com a origem nas 35 rotas; sete produtos do Rastro responderam known:true e bateram com os ids/consentimento do catálogo. A comunidade conserva o Rastro por funil e o Umami do host, já injetado pela VPS.

As políticas ausentes ganharam link para o texto existente da Academy. Termos e privacidade da V2 foram renderizados do próprio app em HTML estático, sem reescrever texto jurídico. Os vídeos, fontes e Tailwind foram ajustados conforme os README das LPs; conteúdo e disposição foram preservados.

## Medições de desempenho e pisos

CI da coluna abaixo: [job peso de 17/11, 19h22](https://github.com/strat-web/sites/actions/runs/44188198786/job/134410619659).

Medição local de origem em 17/11, Lighthouse 13.5, celular, servidor sem compressão e tracking do kit bloqueado (mesmo modo da CI):

| Página | Origem: nota / LCP / CLS | CI migrada, 17/11 19h22 | Tratamento |
|---|---|---|---|
| Claude principal | 93 / 2,86 s / 0,015 | 96 / 2,7 s / 0 | Piso 90 / 3,0 s / 0,1 até a compressão do WEB-88; PageSpeed tem critério próprio |
| Claude V1 | 81 / 5,11 s / 0 | 97 / 2,6 s / 0 | Piso 90 / 3,0 s / 0,1 até WEB-88 |
| Claude V3 | 86 / 4,20 s / 0 | 96 / 2,7 s / 0 | Piso 90 / 3,0 s / 0,1 até WEB-88 |
| Mentoria V2 (React, noindex) | 77 / 4,36 s / 0,100 | 82 / 3,8 s / 0,100 | Piso de não regressão 80 / 4,3 s / 0,1, sujeito à revisão do Helbert |
| Comunidade | 76 / 4,38 s / 0,005 | 72 / 5,6 s / 0; outras execuções 67/6,0 a 79/4,2 | Piso 65 / 7,0 s / 0,1 para o destino externo; não atesta desempenho da confirmação |
| Bootcamp `/0808-v1/grupo/` | fluxo de confirmação original preservado | 68 / 5,6 s / 0 | Piso 65 / 7,0 s / 0,1 para o destino externo; fluxo de confirmação validado separadamente |

Os pisos estão em `packages/checagens/src/excecoes-peso.js`, mecanismo já previsto em `docs/padroes.md`. Bytes até 1,5 MB e CLS até 0,1 continuam obrigatórios. Não se aplica exceção ao critério extra da Claude: mediana de cinco PageSpeed celular **abaixo** de 2,5 s, com tracking real, no preview. O resultado final dessa validação será registrado no PR #47 e no PR #51, com as cinco rodadas e a mediana.

Abertura das confirmações: o CTA e o layout inicial foram conferidos com a navegação externa interceptada; o redirecionamento original foi mantido. O Lighthouse da CI atravessa a página e passa a medir o WhatsApp; o CLS dessa medição também é do destino, não uma prova de estabilidade da confirmação. Esses pisos não atestam desempenho do WhatsApp nem escondem troca do fluxo.

## Validação funcional

O navegador abriu uma amostra de oito rotas a 390 e 1440 px para comparação com a origem (32 capturas: origem/migração nos dois tamanhos), sem substituir imagens/pessoas ou inventar ofertas. A rolagem lateral herdada da Skills foi bloqueada no documento. Os cards V2 conservam as URLs de ilustrações remotas e usam a marca oficial como fallback de erro.

Teste com `utm_source=teste&utm_medium=verificacao`: na Claude e nos 13 links de checkout de Skills, Rastro reescreveu xcod e UTMs. PageView do pixel, GA4 configurado e `$pageview` do PostHog continuam sendo chamados; o eventID do pixel coincide com o event_id do POST ao tracker. Os SDKs e os envios externos foram simulados/interceptados para não registrar visitas/leads falsos nesse teste. Isso comprova a chamada do cliente e o contrato de deduplicação, não a recepção no Events Manager.

A comunidade sem funil/desconhecido conserva só Umami; `?f=vibecode` escolhe aula-claude-code e preserva PageView/CompleteRegistration. As duas páginas jurídicas têm um H1, não apresentam rolagem lateral e dispensam React.

## Limites para a revisão

- Helbert precisa aprovar o atraso do Rastro e os pisos herdados. Janela até xcod e PageSpeed finais serão registrados após a última versão.
- Autorização de domínios no MetricaaS e recepção/deduplicação nos painéis da Meta/Google são validações humanas; não foram declaradas concluídas por leitura estática ou mock.
- Formulários mantêm o Lead manual original; adicionar `data-strat-leadform` indiscriminadamente faria o Rastro disparar Lead de novo. Os marcadores de CTA foram acrescentados onde faltavam em Skills; nenhuma inscrição ou compra real foi realizada.
- Publicação no domínio e validações de produção só depois da aprovação e do “pode virar” do Helbert.
