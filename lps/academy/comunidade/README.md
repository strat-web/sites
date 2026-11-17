# lps/academy/comunidade · comunidade.stratacademy.com.br

Página pós-cadastro ("entre no grupo") de **todos os funis** da Academy, no Cloudflare Pages (projeto
`academy-comunidade`, prévia em https://academy-comunidade.pages.dev). Migrada do `strat-lps` (`lps/comunidade`, branch `master`, 05ca028) no WEB-48, em 17/11/2026,
**sem mudar texto, layout nem tracking**, no padrão do WEB-32 e da `lps/academy/claude`.

| Página | Arquivos | Linha do catálogo | Indexa |
|---|---|---|---|
| `/` (com `?f=<funil>`) | `src/pages/index.astro` + `src/html/home.*.html` | `academy-comunidade` | não (`noindex, nofollow`, como no ar) |

## Como o funil escolhe a página e o tracking
- O funil chega pela URL: `/?f=<chave>`. O registro `FUNIS`, no script do fim de `src/html/home.corpo.html`, escolhe
  a copy, o grupo do WhatsApp, o QR e o **produto do Rastro**. Funil novo é um bloco novo no `FUNIS`. Registro, e não
  `?grupo=<link>` solto, para ninguém montar no nosso domínio um link para qualquer grupo.
- Tracking: o catálogo marca a página com consentimento `por-funil` (decisão do Helbert em 12/11, T5; `docs/tracking.md`).
  O `<Tracking>` do kit não carrega nada aqui. O script da página injeta o `/sa?product=<produto do funil>` só quando o
  funil tem produto e dispara o `CompleteRegistration` uma vez por sessão (`sessionStorage`, chave `strat_cr_<produto>`).
  Sem `?f=`, ou com funil desconhecido, nada carrega, de propósito: a conversão não teria dono e sujaria o CPA de outro funil.
  O `Lead` que conta é disparado na LP de origem, no envio do formulário.
- A LP de origem repassa UTMs e click ids na URL do redirect: o `localStorage` (last-touch) não atravessa subdomínios.

| `?f=` | Produto (Rastro) | Consentimento do produto |
|---|---|---|
| (vazio ou desconhecido) | nenhum (sem tracking) | — |
| `vibecode` | `aula-claude-code` | `soft` |
| `bootcamp-0808` | `bootcamp-0808` | `off` |

- Depois de 1,8 s a página tenta abrir o WhatsApp sozinha; o botão e o QR (só no desktop) continuam valendo.

## O que mudou em relação ao strat-lps (e por quê)
| Mudança | Por quê |
|---|---|
| Botão "Entrar no grupo": `href="#"` → link do grupo padrão no HTML (o script continua trocando pelo grupo do funil) | link sem destino (a checagem `seo` barra); sem JavaScript o botão agora leva ao grupo. Hoje os três funis usam o mesmo grupo |
| `<title>`, description, robots e viewport saíram do HTML e vêm do `Layout` do kit, com os mesmos valores; entram canonical, Open Graph e o JSON-LD da Academy | padrão do kit |
| Página 404 da Academy | no ar, caminho que não existe caía na página de outra LP (o servidor do strat-lps manda host sem rota para a quaia) |
| `robots.txt`, `sitemap.xml` (vazio: a página não indexa) e `llms.txt` gerados pelo kit | padrão do kit (WEB-18) |

Fontes do Google (Inter) seguem como no ar.
