import { defineConfig } from 'astro/config';

// Saída estática (D4). URL sempre com barra no fim (docs/padroes.md).
export default defineConfig({
  site: 'https://stratacademy.com.br',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
});
