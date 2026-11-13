# Changelog

Uma linha por PR, a mais nova em cima, com o item do Plane.

## Não lançado
- feat(stratai): funil de recuperação de vendas em /recuperacao/ (4 versões: telas, raio-x ao vivo, conversa em tela cheia e telas com compra rápida e call com o Helbert) e cases em /recuperacao/cases/<cliente>/, em rascunho e noindex, com o Tracking do kit em soft (produto stratai-recuperacao no Rastro), 10 linhas no catálogo, envio do lead com prazo e tela de erro com tentar de novo, a seção do funil na política de privacidade e test/recuperacao.test.js (WEB-91)
- feat(kit): banner do catálogo = strict do Rastro: o kit monta Rastro com banner sem o banner de cookies do kit (o aviso é o do Rastro), a checagem tracking compara banner = strict, soft = soft e off = off e barra o /sa sem consentMode, venda com banner quebra o build e script da Hotmart em página com banner barra (o launcher carregaria antes do aceite, até o WEB-85), e a página de teste stratacademy.com.br/kit/conteudo/ (noindex) (WEB-81)
- feat(stratai): home, /raio-x/ e /politica-de-privacidade/ migradas do strat-lps sem mudar texto, layout nem tracking, com o Tracking do kit, 301 da casa antiga no _redirects, linha da política no catálogo, og e viewport próprios no Layout e a home na exceção do Lighthouse com piso (WEB-32)
- docs(pages): functions/* no caminho observado dos 4 projetos do Pages (gravado na Cloudflare em 12/11), mudança só na Function passa a disparar build (TRACK-9)
- ci(checagens): tracking confere ordem, defer e type do m.js e barra pixel em <noscript> ou em .js do build; app sem dist/ barra; nova tentativa quando o Rastro não responde; concorrência do workflow por número do PR (WEB-76)
- docs(catalogo): o campo consentimento passa a dizer a regra da página (banner, soft, off só como exceção, sem-tracking e por-funil, com o padrão por perfil do WEB-72), com o mesmo texto em docs/tracking.md (WEB-79)
- docs: decisões do Helbert de 12/11 (WEB-71, WEB-74, WEB-32 antecipado, estrutura da StratAI, casos com nome, conta do PR, WEB-49, fluxo dos PRs), regra de consentimento do WEB-72 em decisoes.md e tracking.md (com o que o código faz hoje: o kit ainda recusa Rastro com banner, banner = strict é o WEB-81), PR pela conta própria do dev e os planos em docs/planos/ (WEB-72)
- feat(conteudo): schema do blog e checar-posts trazidos do horus para packages/conteudo, ligados aos 4 apps (collection blog, scripts checar:posts e test), com post de teste noindex na stratai e na stratacademy (WEB-19)
- feat(kit): página 404 nos 4 apps com o componente PaginaNaoEncontrada (noindex, sem tracking, texto na voz da marca e links só para página que existe no build); seo barra app sem 404.html e links confere a 404 a partir da raiz (WEB-75)
- feat(tracking): Umami medindo pelo próprio domínio: umami_website_id nas 19 URLs do catálogo (um website por host), proxy /u/ como Pages Function na raiz (functions/u/[[caminho]].js, IP do visitante em payload.ip) com os eventos cta, whatsapp, checkout, form_inicio e cadastro; testes do kit atualizados (TRACK-8, TRACK-9)
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
