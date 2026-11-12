// Página 404 (WEB-75): rota de cada arquivo de src/pages e links da 404 que só aparecem quando a página existe.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { linksDaPaginaDeErro, rotaDoArquivo } from '../src/index.js';

test('rotaDoArquivo: arquivo de src/pages vira a rota com barra no fim', () => {
  assert.equal(rotaDoArquivo('/src/pages/index.astro'), '/');
  assert.equal(rotaDoArquivo('/src/pages/raio-x/index.astro'), '/raio-x/');
  assert.equal(rotaDoArquivo('/src/pages/guias/agente.md'), '/guias/agente/');
  assert.equal(rotaDoArquivo('/src/pages/kit/lead/index.astro'), '/kit/lead/');
  assert.equal(rotaDoArquivo('/src/pages/blog/[slug].astro'), undefined);
  assert.equal(rotaDoArquivo('/src/pages/_rascunho.astro'), undefined);
  assert.equal(rotaDoArquivo('/src/pages/404.astro'), undefined);
  assert.equal(rotaDoArquivo('/src/pages/estilo.css'), undefined);
});

test('linksDaPaginaDeErro: página que ainda não existe no build fica de fora; outro domínio entra', () => {
  const arquivos = ['/src/pages/index.astro', '/src/pages/404.astro', '/src/pages/advogados/index.astro'];
  const links = [
    { nome: 'Início', caminho: '/' },
    { nome: 'Advogados', caminho: '/advogados/' },
    { nome: 'Diagnóstico', caminho: '/raio-x/' },
    { nome: 'Curso', caminho: 'https://claude.stratacademy.com.br/' },
  ];
  assert.deepEqual(
    linksDaPaginaDeErro(links, arquivos).map((l) => l.nome),
    ['Início', 'Advogados', 'Curso'],
  );
  // Quando a página entra no build, o link aparece sem mexer na 404.
  assert.equal(linksDaPaginaDeErro(links, [...arquivos, '/src/pages/raio-x/index.astro']).length, 4);
});

test('linksDaPaginaDeErro: endereço relativo, http:// e link sem nome quebram o build', () => {
  assert.throws(() => linksDaPaginaDeErro([{ nome: 'x', caminho: 'raio-x/' }], []), /começar com "\/"/);
  assert.throws(() => linksDaPaginaDeErro([{ nome: 'x', caminho: 'http://outro.com/' }], []), /começar com "\/"/);
  assert.throws(() => linksDaPaginaDeErro([{ nome: 'x', caminho: '//outro.com/' }], []), /começar com "\/"/);
  assert.throws(() => linksDaPaginaDeErro([{ nome: ' ', caminho: '/' }], []), /sem nome/);
});
