import { defineConfig } from 'astro/config';
import { arquivosDoSite } from '@strat/kit';

// Saída estática (D4). URL sempre com barra no fim (docs/padroes.md).
export default defineConfig({
  site: 'https://metricaas.com.br',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  // sitemap.xml, robots.txt e llms.txt a partir do catálogo (WEB-18).
  integrations: [arquivosDoSite({ app: 'apps/metricaas' })],
});
