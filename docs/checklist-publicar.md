# Checklist antes de publicar

Vale para página nova, página migrada e mudança de domínio. Cada item vai no PR como ok, falhou ou não se aplica,
com a evidência (print, curl, link). Adaptado do portão do setor de LP da cabine (`areas/lp/docs/checklist-publicar.md`).

## A · Conteúdo e preview
| # | Item |
|---|---|
| A1 | Nenhuma marca interna na página: `[X]`, `<<...>>`, lorem ipsum, link para localhost ou `pages.dev` |
| A2 | Preview com noindex; produção sem noindex e com canonical para o domínio final |
| A3 | Texto aprovado por quem responde pelo conteúdo (registrado no item) |
| A4 | Toda imagem com `alt`; imagem de pessoa real gerada com IA só com aprovação escrita dela |
| A5 | Política de privacidade publicada e linkada |
| A6 | Nicho regulado (advocacia, saúde, financeiro): laudo de política antes de virar destino de anúncio |

## B · Conversão
| # | Item |
|---|---|
| B1 | CTA visível na primeira dobra a 390 px |
| B2 | Botão de WhatsApp é `<a href="https://wa.me/55...?text=...">` escrito no HTML |
| B3 | `data-strat-cta` em todo CTA, `data-strat-leadform` em todo formulário |
| B4 | Sem rolagem lateral a 390 px; corpo com 16 px ou mais |

## C · Tracking
| # | Item |
|---|---|
| C1 | Tracking só pelo `<Tracking>` do kit; nenhum pixel, gtag ou GTM à mão |
| C2 | Slug do Rastro conhecido (`/sa` responde `known: true`) quando o perfil usa Rastro |
| C3 | Domínio autorizado no MetricaaS e na lista de permissão do pixel |
| C4 | Teste com `?utm_source=teste&utm_medium=verificacao`: `PageView`, `Contact`, `Lead`, evento no MetricaaS |
| C5 | Mesmo `event_id` no navegador e na CAPI (Gerenciador de Eventos) |
| C6 | Com e sem aceitar cookies, o comportamento bate com a política |

## D · Técnico
| # | Item |
|---|---|
| D1 | PageSpeed no celular: performance 90 ou mais, LCP até 2,5 s, CLS até 0,1, até 1,5 MB |
| D2 | Imagem da primeira dobra sem `loading="lazy"`; as outras com; `width` e `height` definidos |
| D3 | `robots.txt`, `sitemap.xml` e `llms.txt` respondendo; título, descrição, um H1, `lang`, og:image, JSON-LD válidos |
| D4 | HTTPS, www ↔ raiz com 301, certificado válido |
| D5 | Cabeçalhos de segurança presentes (o kit gera; conferir com `curl -sI`, ver `padroes.md`, "Cabeçalhos") |
| D6 | Rotas antigas respondem 301 para as novas, mantendo a query (tabela no PR) |

## E · Depois de publicar
| # | Item |
|---|---|
| E1 | Linha do `catalogo/sites.json` com a URL final, perfil, ids e `indexar` |
| E2 | Sitemap enviado no Search Console e no Bing |
| E3 | Em 7 dias: página indexada (inspeção de URL) |
| E4 | Diagnóstico da página guardado como base do antes × depois (plugin de LP, quando existir) |
