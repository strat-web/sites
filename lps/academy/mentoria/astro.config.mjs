import { defineConfig } from 'astro/config';
import { arquivosDoSite } from '@strat/kit';

// LP da Mentoria Strat AI (produto mentoria), migrada do strat-lps no WEB-48.
// Saída estática (D4). URL sempre com barra no fim (docs/padroes.md).
export default defineConfig({
  site: 'https://mentoria.stratacademy.com.br',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  // sitemap.xml, robots.txt e llms.txt a partir do catálogo (WEB-18).
  integrations: [arquivosDoSite({ app: 'lps/academy/mentoria' })],
});
