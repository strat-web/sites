# Bootcamp · bootcamp.stratacademy.com.br

Migração do `strat-lps` (`lps/bootcamp`, master `05ca028`) no WEB-48. Projeto do Pages: `academy-bootcamp`.
As **24 rotas** de origem foram preservadas, incluindo a página do grupo e os upsells/downsells. O Bootcamp está pausado desde setembro de 2026; as datas, preços e textos de cada variante são conteúdo histórico da origem, sem nova campanha ou atualização de oferta nesta migração.

| Rota | Perfil do kit | Produto do Rastro | Workspace MetricaaS |
|---|---|---|---|
| `/0808-combo/` | venda | `bootcamp-0808` | `vinicius-rocha-strat-ai` |
| `/0808-v1/grupo/` | conteudo | `bootcamp-0808` | — |
| `/0808-v1/` | lead | `bootcamp-0808` | — |
| `/0808-v1-lote01/` | venda | `bootcamp-0808` | — |
| `/0808-v1-lote02/` | venda | `bootcamp-0808` | — |
| `/0808-v1-lote03/` | venda | `bootcamp-0808` | — |
| `/0808-v2-lote01/` | venda | `bootcamp-0808` | `vinicius-rocha-strat-ai` |
| `/0808-v2-lote02/` | venda | `bootcamp-0808` | `vinicius-rocha-strat-ai` |
| `/0808-v2-lote03/` | venda | `bootcamp-0808` | `vinicius-rocha-strat-ai` |
| `/0808-v3-lote01/` | venda | `bootcamp-0808` | `vinicius-rocha-strat-ai` |
| `/0808-v3-lote02/` | venda | `bootcamp-0808` | `vinicius-rocha-strat-ai` |
| `/0808-v3-lote03/` | venda | `bootcamp-0808` | `vinicius-rocha-strat-ai` |
| `/0808-v4-lote02/` | venda | `bootcamp-0808` | `vinicius-rocha-strat-ai` |
| `/0808-v4-lote03/` | venda | `bootcamp-0808` | `vinicius-rocha-strat-ai` |
| `/0808-v5-lote01/` | venda | `bootcamp-0808` | `vinicius-rocha-strat-ai` |
| `/0808-v5-lote02/` | venda | `bootcamp-0808` | `vinicius-rocha-strat-ai` |
| `/0808-v5-lote03/` | venda | `bootcamp-0808` | `vinicius-rocha-strat-ai` |
| `/b/` | lead | `bootcamp` | — |
| `/downsell-imediato/` | venda | `bootcamp` | — |
| `/` | venda | `bootcamp` | — |
| `/m/` | lead | `bootcamp` | `vinicius-rocha-strat-ai` |
| `/mentoria-grupo/` | venda | `bootcamp-0808` | — |
| `/strat/` | venda | `bootcamp-strat` | — |
| `/upsell-imediato/` | venda | `bootcamp` | — |

Só a principal é indexável. As demais continuam com noindex e fora do sitemap. `migracao.json` registra os caminhos e os funis usados pelos testes.

O tracking colado de cada página saiu e entra pelo kit. As páginas de captação usam lead, a confirmação do grupo usa conteudo e as de checkout usam venda, sem impor o launcher às páginas que não vendem. O `m.js` conserva o workspace onde existia e vem antes dos demais scripts. O checkout de upsell/downsell conserva o widget de oferta da Hotmart e seus produtos.

Texto, disposição e destinos foram preservados. As mesmas fontes são servidas localmente pelo Pages. Os recursos de mídia da origem ficam em `public/`. O kit gera canonical, metadados, arquivos de robôs, sitemap, cabeçalhos e página 404.

Desenvolvimento: `pnpm --filter @strat/bootcamp dev`; build: `pnpm --filter @strat/bootcamp build`; testes: `pnpm --filter @strat/bootcamp test`.

Não fazer inscrições ou compras reais para validar. Conferir formulários com rede simulada e navegação para checkout sem concluir pagamento. DNS ainda na origem; só virar com o “pode virar” do Helbert no Plane.

Os lotes V4/V5/combo mantêm a Gobold Regular da origem, agora em `/fonts/gobold-regular.woff` (mesmo arquivo de `https://fonts.cdnfonts.com/s/18550/Gobold%20Regular.woff`, referenciado pelo CSS original). Essa fonte também precisava chegar antes da primeira pintura para evitar o salto do título; não foi trocada por Anton.

O vídeo de fundo do hero (V4/V5/combo) conserva o original de 1280×720 no desktop; no celular usa uma cópia de 540 px/15 fps, H.264 CRF 34, sem áudio, para não disputar banda com o primeiro quadro. O conteúdo e a duração são os mesmos.

O player de vídeo abaixo da primeira dobra (V5 e combo) conserva o endereço, permissões e conteúdo, mas só recebe `src` quando entra na tela, via IntersectionObserver. Em navegador sem essa API carrega diretamente. Isso impede o player de competir com o vídeo de fundo e as fontes durante a abertura.
