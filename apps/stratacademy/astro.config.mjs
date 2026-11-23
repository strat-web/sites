import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import tailwindcss from '@tailwindcss/vite';
import { arquivosDoSite } from '@strat/kit';

const seo = (caminho) => fileURLToPath(new URL(`./src/horus/seo/${caminho}`, import.meta.url));

// Site e blog da Academy, vindos do horus (Strat-Ai-Horus-OS/horus, apps/stratacademy) no WEB-49, com as URLs
// idênticas (D8). Saída estática (D4), URL sempre com barra no fim (docs/padroes.md).
//
// Redirecionamento só em public/_redirects, nunca em `redirects` aqui: em build estático o Astro não emite 301, gera
// um HTML com meta-refresh, e as duas fontes juntas escondiam rota sem regra (veio do horus).
export default defineConfig({
  site: 'https://stratacademy.com.br',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory' },
  // sitemap.xml, robots.txt, llms.txt e _headers a partir do catálogo (WEB-18). O sitemap-index.xml e o
  // sitemap-0.xml do horus respondem 301 para o sitemap.xml (public/_redirects).
  integrations: [arquivosDoSite({ app: 'apps/stratacademy' })],
  // As fotos dos posts moram no R2 em tamanho cheio (até 1600 px e 274 KB). Liberado o domínio, o build baixa cada uma
  // e gera a versão do tamanho em que ela aparece (capa do card na CapaPost; imagem do Markdown com loading="lazy" e
  // largura/altura), servida pelo próprio site. Era o que deixava o blog fora do orçamento do peso no celular (WEB-49).
  // `layout: 'constrained'` dá srcset e sizes às imagens do Markdown; sem os estilos globais do Astro
  // (responsiveStyles fica false), para o visual do .prose continuar o mesmo.
  image: { domains: ['assets.stratacademy.com.br'], layout: 'constrained', responsiveStyles: false },
  vite: {
    plugins: [tailwindcss()],
    resolve: {
      // O @horus/seo (BaseHead, absUrl, ogOptions) veio copiado para src/horus/seo com o mesmo nome de import, para
      // a diferença com o horus ficar pequena enquanto os dois convivem.
      alias: [
        { find: /^@horus\/seo$/, replacement: seo('src/index.ts') },
        { find: /^@horus\/seo\/(.*)$/, replacement: seo('$1') },
      ],
    },
    // O construtor de funil é React e vem em .tsx do pacote das ferramentas. Sem isto, o esbuild transforma com o
    // runtime antigo (React.createElement) e a página quebra com "React is not defined": o site não tem React
    // global, só uma ilha montada por script (src/scripts/construtor.ts).
    esbuild: { jsx: 'automatic', jsxImportSource: 'react' },
    // Os pacotes das ferramentas publicam TypeScript fonte: o Vite precisa transpilá-los.
    ssr: { noExternal: ['@strat-ai-horus-os/funil-nucleo', '@strat-ai-horus-os/funil-react'] },
  },
});
