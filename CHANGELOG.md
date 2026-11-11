# Changelog

Uma linha por PR, a mais nova em cima, com o item do Plane.

## Não lançado
- feat(kit): _headers gerado no build de cada app com HSTS, nosniff, frame-ancestors, Referrer-Policy e Permissions-Policy, e noindex no *.pages.dev (WEB-21)
- feat(kit): sitemap.xml, robots.txt e llms.txt gerados no build de cada app a partir do catálogo e de marcas.js (resumo de cada marca), ligado nos 4 apps, com testes (WEB-18)
- feat(kit): Layout, Seo, JsonLd, Breadcrumb e Faq, com os dados das marcas e testes; os 4 apps usam o Layout e a stratai ganha a página de teste /kit/ (noindex) (WEB-16)
- feat(monorepo): esqueleto pnpm + Astro com os 4 apps, packages/kit, packages/conteudo e lps/academy, saída estática; projetos do Pages agenciastrat, stratai, metricaas e sites-stratacademy ligados ao repositório, com preview por PR (WEB-15)
- docs: esqueleto do repositório com o padrão escrito (CLAUDE.md, docs/, catálogo, modelo de PR) (WEB-7)
