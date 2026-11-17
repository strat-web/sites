# Skills · skills.stratacademy.com.br

Migração do `strat-lps` (`lps/lp-500`, master `05ca028`) no WEB-48. Projeto do Pages: `academy-skills`.

| Rota | Conteúdo | Indexação |
|---|---|---|
| `/` | Página principal | sim |
| `/b/` | Variante escura | não |

As duas usam o Tracking venda do kit, produto `lp-500-skills`, o mesmo checkout Hotmart `R106245534R` e consentimento off da origem. O launcher e o Rastro saíram do HTML colado e entram pelo kit. O visual e o texto foram preservados.

O rodapé da principal conserva os popups de política e termos; os links vazios ganharam destino (política da Academy e âncoras dos próprios controles). O botão final de compra mantém o produto da oferta. As mesmas fontes do Google são servidas localmente pelo Pages para evitar CSS remoto na primeira pintura.

Desenvolvimento: `pnpm --filter @strat/skills dev`; build: `pnpm --filter @strat/skills build`; testes: `pnpm --filter @strat/skills test`.

DNS ainda na origem. Só virar com o “pode virar” do Helbert no Plane.
