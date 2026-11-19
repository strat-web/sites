# Search Console e Bing

Toda propriedade sai da conta central do Gabriel (sócio), como propriedade de domínio (`sc-domain:`)
verificada por TXT na Cloudflare. Acessos iguais em todas (decisão de 2026-11-02):

| Quem | Nível |
|---|---|
| Gabriel (conta central) | proprietário verificado |
| Helbert | proprietário delegado |
| João Paranhos, Jhonathan Geronimo | Total |
| conta de serviço do MCP `search-console` | Restrito |

Grupo do Google não funciona como usuário: cada pessoa é incluída e, na saída, removida.

## Propriedades

Sitemaps conferidos na tela do Search Console em 2026-11-17 (WEB-38): todos com status "Processado".

| Propriedade | Situação | Sitemaps enviados |
|---|---|---|
| `sc-domain:stratai.com.br` | ativa desde 2026-11-02 | `stratai.com.br/sitemap.xml` e `agencia.stratai.com.br/sitemap.xml` (desde 02/11; o da Agência sai depois do 301, WEB-29) |
| `sc-domain:stratacademy.com.br` | ativa | `stratacademy.com.br/sitemap-index.xml` (horus, desde 10/09) e o `sitemap.xml` de hub, claude, skills, mentoria, bootcamp e vibecode (desde 02 e 03/11). No WEB-49 o site passa a `/sitemap.xml` do kit: enviar o novo e tirar o índice antigo |
| `sc-domain:metricaas.com.br` | ativa desde 2026-11-02 | `metricaas.com.br/sitemap.xml` (desde 03/11) |
| `sc-domain:agenciastrat.com.br` | criada e verificada em 2026-11-05 (WEB-27) | nenhum ainda: `agenciastrat.com.br/sitemap.xml` entra quando o site estiver no ar (WEB-26) |

O kit grava `/sitemap.xml` na raiz de todo app. Na stratai e no metricaas o endereço não muda com a migração: depois da
virada, o Google relê o mesmo endereço com as páginas novas, sem novo envio. Basta conferir as "Páginas encontradas".

## Bing Webmaster
A busca do ChatGPT usa o índice do Bing. Em 2026-11-17 (WEB-38) as propriedades foram importadas do Search Console
pela conta do Jhonathan (Google Workspace stratai.com.br): o Bing lê o Search Console só com permissão de leitura e
revalida a verificação de tempos em tempos por essa ligação. Se o acesso do Jhonathan ao Search Console sair, a
verificação no Bing cai junto: importar de novo por outra conta com acesso.

| Site no Bing | Papel | Sitemap enviado no Bing |
|---|---|---|
| `https://stratai.com.br/` | Read / Modify | `stratai.com.br/sitemap.xml` |
| `https://metricaas.com.br/` | Read / Modify | `metricaas.com.br/sitemap.xml` |
| `https://stratacademy.com.br/` | Read / Modify | `stratacademy.com.br/sitemap-index.xml` (trocar pelo `/sitemap.xml` no WEB-49) |
| `https://agenciastrat.com.br/` | Read / Modify | nenhum ainda (depois do WEB-26) |

A importação não traz os sitemaps de propriedade de domínio: cada um foi enviado à mão na tela Sitemaps do Bing.

## Depois de publicar
Enviar o sitemap no Search Console e no Bing (quando o endereço for novo), inspecionar a home e as páginas novas e,
em 7 dias, conferir se estão indexadas.
