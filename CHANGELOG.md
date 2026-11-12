# Changelog

Uma linha por PR, a mais nova em cima, com o item do Plane.

## Não lançado
- docs(catalogo): o campo consentimento passa a dizer a regra da página (banner, soft, off só como exceção, sem-tracking e por-funil, com o padrão por perfil do WEB-72), com o mesmo texto em docs/tracking.md (WEB-79)
- ci: checagens obrigatórias build, seo, tracking, links, peso e catalogo em todo PR (packages/checagens, checagens.yml), ruleset da main escrito para o Helbert aplicar e âncora #topo das páginas de teste do Tracking corrigida (WEB-20)
- feat(kit): componente Tracking com os perfis venda, lead e conteudo lendo o catálogo (consentimento por URL, banner de cookies do kit, launcher da Hotmart, Umami pelo /u/), campo hotmart_conta e 4 páginas de teste (WEB-17)
- feat(kit): _headers gerado no build de cada app com HSTS, nosniff, frame-ancestors, Referrer-Policy e Permissions-Policy, e noindex no *.pages.dev (WEB-21)
- feat(kit): sitemap.xml, robots.txt e llms.txt gerados no build de cada app a partir do catálogo e de marcas.js (resumo de cada marca), ligado nos 4 apps, com testes (WEB-18)
- feat(kit): Layout, Seo, JsonLd, Breadcrumb e Faq, com os dados das marcas e testes; os 4 apps usam o Layout e a stratai ganha a página de teste /kit/ (noindex); canonical de outro domínio ou `site` em pages.dev quebra o build (WEB-16)
- feat(monorepo): esqueleto pnpm + Astro com os 4 apps, packages/kit, packages/conteudo e lps/academy, saída estática; projetos do Pages agenciastrat, stratai, metricaas e sites-stratacademy ligados ao repositório, com preview por PR (WEB-15)
- docs(auditoria): relatório do portão F1 por domínio, com o destino de cada achado e os itens WEB-70 a WEB-73 (WEB-14)
- fix(catalogo): catálogo bate com a auditoria de 2026-11 (T2, T3, T4, T6, site da Academy, Umami, consentimento e dono) (WEB-13)
- docs(auditoria): conferência no navegador das tags de cada URL do catálogo, com lead de teste (WEB-11)
- docs: esqueleto do repositório com o padrão escrito (CLAUDE.md, docs/, catálogo, modelo de PR) (WEB-7)
