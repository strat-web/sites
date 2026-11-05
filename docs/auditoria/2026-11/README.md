# Auditoria automática · 2026-11-04 (WEB-10)

Motor de LP da cabine (`lote.mjs`): Nota Strat rápida, PageSpeed no celular 1×, sinais do HTML (sem navegador).
Brutos: [saude-catalogo.json](saude-catalogo.json) e [saude-extras.json](saude-extras.json).
A conferência no navegador, que vê o que o JavaScript injeta, é o WEB-11.

| URL | Nota | Perf. celular | LCP (lab) | Principal | Leitura |
|---|---|---|---|---|---|
| https://claude.stratacademy.com.br/ | 76 | 61 | 18,3 s | conteúdo principal demora a aparecer | **real**: o pior LCP do grupo |
| https://skills.stratacademy.com.br/ | 78 | 67 | 9,5 s | conteúdo principal demora a aparecer | **real** |
| https://stratai.com.br/ | 71 | 68 | 8,0 s | sem botão de WhatsApp | **real**: os links são `href="#"` montados por script (WEB-33); LCP alto também |
| https://metricaas.com.br/ | 81 | 68 | 6,7 s | conteúdo principal demora a aparecer | **real** |
| https://stratai.com.br/agencia/ (301) | 77 | 68 | 4,7 s | sem pixel | falso alarme: o pixel vem pela tag do MetricaaS; a URL é só redirecionamento |
| https://agencia.stratai.com.br/ | 79 | 73 | 4,1 s | sem pixel | falso alarme (mesmo motivo); conferir no WEB-11 |
| https://agencia.stratai.com.br/advogados/ | 67 | 98 | 1,7 s | sem WhatsApp, telefone ou formulário | provável falso alarme: formulário e agenda vêm do MetricaaS; conferir no WEB-11 |
| https://stratai.com.br/raio-x/ | 74 | 85 | 2,0 s | sem WhatsApp ou formulário | provável falso alarme: o diagnóstico é montado por script |
| https://bio.stratai.com.br/ | 74 | 93 | 1,7 s | noindex | de propósito (bio não indexa) |
| https://stratacademy.com.br/ | 77 | 100 | 1,5 s | sem WhatsApp ou formulário | site de conteúdo; ok |
| https://vibecode.stratacademy.com.br/ | 79 | 79 | 1,9 s | WhatsApp sem mensagem pronta | **real**, pequeno |
| https://bootcamp.stratacademy.com.br/ | 88 | 89 | 1,9 s | sem cabeçalhos de segurança | **real** (WEB-21) |
| https://mentoria.stratacademy.com.br/ | 89 | 90 | 2,9 s | sem cabeçalhos de segurança | **real** (WEB-21) |
| https://comunidade.stratacademy.com.br/ | 57 | 85 | 3,3 s | sem contato | página pós-cadastro, noindex de propósito |

## O que sai daqui
- **Velocidade:** todo site servido pelo `strat-lps` sai sem compressão (gzip ou brotli) e sem `Cache-Control`
  (conferido com curl em 04/11). A migração para o Pages resolve a entrega; o LCP de 18 s do claude.stratacademy pede
  investigação própria (item novo).
- **Cabeçalhos de segurança:** faltam em todas as páginas do `strat-lps`. Resolvido no kit (WEB-21).
- **Catálogo:** os dois alertas "críticos" do motor eram do catálogo antigo da cabine (esperava MetricaaS
  `strat-marketing` na StratAI e Rastro na Agência). O `catalogo/sites.json` daqui já está certo.
- **Motor de LP:** a checagem sem navegador não vê pixel, formulário e WhatsApp injetados por script (MetricaaS, Rastro).
  Ajuste no motor quando ele for para a oficina (F5).
