---
title: "Post de teste do pacote de conteúdo"
description: "Post de teste do WEB-19: prova que o schema do blog e o checar-posts valem neste app. Não é publicado."
pubDate: 2026-11-12
tags: ["teste"]
teste: true
noindex: true
---

Este arquivo existe só para conferir o pacote `@strat/conteudo` (WEB-19). Ele não tem rota, não entra na listagem do
blog, no feed, no sitemap nem no `llms.txt`, e o frontmatter marca `teste: true` e `noindex: true`.

## O que ele prova

- O build do app valida este frontmatter com o schema do pacote (`src/content.config.mjs`).
- O `pnpm checar:posts` do app passa sem erro nem aviso: tem H2, não tem H1 no corpo e o link para
  [a página inicial](/) bate com uma rota do app.

## Quando apagar

Quando o primeiro post de verdade do blog deste app entrar, este arquivo pode sair no mesmo PR.
