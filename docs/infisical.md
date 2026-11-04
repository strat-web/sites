# Chaves (Infisical `strat-web`)

Projeto `strat-web` (`baffbac0-3e1a-47fb-b381-63326d430e39`) em https://secrets.strat.tec.br, ambientes `dev` e `prod`.
Devs e marketing entram como member. Chave nunca vai para arquivo, PR, print ou comentário: use sempre `infisical run`.

| Pasta | Chaves | Para quê |
|---|---|---|
| `/pagespeed` | `PSI_API_KEY` | PageSpeed Insights e CrUX (motor de LP) |
| `/r2-assets` | `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN`, `R2_BUCKET` | subir imagem do blog e de LP para o R2 (token só de R2) |
| `/gemini` | `GEMINI_API_KEY` | capa de post e imagem de LP |
| `/cloudflare` | `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_TOKEN` | token `pages-strat-web`: Pages, R2 e DNS das zonas agenciastrat, stratai e metricaas (WEB-4) |
| `/openseo` | `OPENSEO_URL` | endereço do OpenSEO (o acesso é por convite, com login próprio) |
| `/agenciastrat`, `/stratai`, `/stratacademy`, `/metricaas` | o que cada site precisar | uma pasta por site |

Exemplos:

```bash
# Git Bash no Windows: sem o MSYS_NO_PATHCONV o caminho /pagespeed vira C:/Program Files/Git/pagespeed
MSYS_NO_PATHCONV=1 infisical run --projectId=baffbac0-3e1a-47fb-b381-63326d430e39 --env=dev --path=/cloudflare -- npx wrangler pages project list
```

**Atenção (2026-11-04):** até o WEB-4 sair, `/cloudflare` do `dev` guarda um token antigo e amplo. Não use; o item
SEG-55 cuida da troca. Use só o que o seu item pede.
