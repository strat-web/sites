// Página /parcerias/ (WEB-74): o cadastro que vai ao MetricaaS e a regra de não ter condição comercial no texto.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CAMPOS, montarLead, telefoneParaLead } from '../src/lib/parcerias-lead.js';
import { decidirEnvio } from '../src/lib/parcerias-etapas.js';

const APP = join(dirname(fileURLToPath(import.meta.url)), '..');
const ler = (c) => readFileSync(join(APP, c), 'utf8');

test('telefone vai com 55 e só dígitos', () => {
  assert.equal(telefoneParaLead('(11) 90000-0000'), '5511900000000');
  assert.equal(telefoneParaLead('47 3000-0000'), '554730000000');
  assert.equal(telefoneParaLead('+55 11 90000-0000'), '5511900000000');
});

test('montarLead: contato, tipo do cadastro e respostas em campos', () => {
  const lead = montarLead({
    nome: '  Pessoa Ficticia ', email: 'Teste@Example.com', whatsapp: '(00) 90000-0000', perfil: '@ficticio',
    atuacao: ['Implemento IA e automações', 'Outro'], contatos: '6 a 20', segmentos: ['Advocacia'],
    tem_indicacao: 'Tenho 1 ou 2 nomes', experiencia: 'Nunca participei', inicio: 'Agora', detalhes: '',
  });
  assert.deepEqual(lead, {
    nome: 'Pessoa Ficticia',
    telefone: '5500900000000',
    email: 'teste@example.com',
    campos: {
      tipo_cadastro: 'parceria',
      instagram_ou_linkedin: '@ficticio',
      atuacao: 'Implemento IA e automações, Outro',
      contatos: '6 a 20',
      segmentos: 'Advocacia',
      tem_indicacao: 'Tenho 1 ou 2 nomes',
      experiencia: 'Nunca participei',
      inicio: 'Agora',
    },
  });
  assert.ok(!('detalhes' in lead.campos), 'campo vazio não vai');
});

test('cada pergunta do formulário tem campo no lead', () => {
  const form = ler('src/components/parcerias/Formulario.astro');
  const nomes = new Set([...form.matchAll(/name="([a-z_]+)"/g)].map((m) => m[1]));
  for (const n of nomes) assert.ok(['nome', 'email', 'whatsapp', 'perfil', ...CAMPOS].includes(n), `${n} sem destino no lead`);
  assert.doesNotMatch(form, /PRÉVIA/);
});

test('formulário sem data-strat-leadform: o Rastro não pode enviar por GET com os dados na URL', () => {
  const form = ler('src/components/parcerias/Formulario.astro');
  const tag = form.match(/<form\b[^>]*>/)[0];
  assert.doesNotMatch(form, /data-strat-leadform/, 'o lead vai só pelo mtc.lead()');
  assert.match(tag, /\baction="#"/);
  assert.match(tag, /\bmethod="post"/);
});

test('Enter fora da última etapa valida e avança; na última, valida todas antes de enviar', () => {
  const tudoOk = () => true;
  assert.deepEqual(decidirEnvio(0, 3, tudoOk), { acao: 'avancar', etapa: 1 });
  assert.deepEqual(decidirEnvio(1, 3, tudoOk), { acao: 'avancar', etapa: 2 });
  assert.deepEqual(decidirEnvio(2, 3, tudoOk), { acao: 'enviar', etapa: 2 });
  assert.deepEqual(decidirEnvio(0, 3, () => false), { acao: 'ficar', etapa: 0 });
  // na última etapa, uma etapa anterior com erro volta para ela em vez de enviar
  assert.deepEqual(decidirEnvio(2, 3, (i) => i !== 1), { acao: 'voltar', etapa: 1 });
  assert.deepEqual(decidirEnvio(2, 3, (i) => i !== 2), { acao: 'ficar', etapa: 2 });
  // fora da última etapa só a atual é validada (as seguintes ainda estão vazias)
  const vistas = [];
  decidirEnvio(0, 3, (i) => { vistas.push(i); return true; });
  assert.deepEqual(vistas, [0]);
});

test('fontes servidas pelo próprio app, sem Google Fonts', () => {
  const layout = ler('src/layouts/Parcerias.astro');
  assert.doesNotMatch(layout, /fonts\.(googleapis|gstatic)\.com/);
  for (const f of ['space-grotesk-latin.woff2', 'jetbrains-mono-500-latin.woff2']) {
    assert.ok(existsSync(join(APP, 'public/fontes', f)), `public/fontes/${f}`);
    assert.match(layout, new RegExp(`/fontes/${f.replace('.', '\\.')}`));
  }
  assert.match(layout, /<link rel="preload" href="\/fontes\/space-grotesk-latin\.woff2" as="font" type="font\/woff2" crossorigin/);
  assert.equal((layout.match(/font-display: swap/g) || []).length, 2);
});

const SEM_CONDICAO = [[/\d+\s?%/, 'percentual'], [/R\$/, 'valor em reais'], [/\bdia \d|\bem até \d+ (dias|horas)/i, 'dia ou prazo'], [/\[X\]/, 'marcador']];

test('sem condição comercial nos textos da página (percentual, valor em R$, dia ou prazo)', () => {
  // a nota de edição do JSON cita a regra ("nada de percentual, R$ ou data") e fica fora
  const textos = JSON.stringify({ ...JSON.parse(ler('src/data/parcerias.json')), como_editar: '' });
  for (const [re, nome] of SEM_CONDICAO) assert.doesNotMatch(textos, re, nome);
});

const DIST = join(APP, 'dist/parcerias/index.html');
test('dist: /parcerias/ com o Tracking da linha do catálogo e indexável', { skip: !existsSync(DIST) && 'sem dist/: rode pnpm build antes' }, () => {
  const html = readFileSync(DIST, 'utf8');
  assert.match(html, /<link rel="canonical" href="https:\/\/stratai\.com\.br\/parcerias\/">/);
  assert.match(html, /<meta name="robots" content="index, follow">/);
  const scripts = [...html.matchAll(/<script[^>]*\bsrc="(https:[^"]+)"[^>]*>/g)].map((m) => m[0]);
  const visivel = html.replace(/<style[\s\S]*?<\/style>|<script[\s\S]*?<\/script>|<[^>]+>/g, ' ');
  for (const [re, nome] of SEM_CONDICAO) assert.doesNotMatch(visivel, re, `texto da página: ${nome}`);
  assert.doesNotMatch(html, /data-strat-leadform/, 'o Rastro não pode interceptar o cadastro');
  assert.doesNotMatch(html, /fonts\.(googleapis|gstatic)\.com/, 'fontes pelo próprio app');
  assert.deepEqual(scripts, [
    '<script defer src="https://t.metricaas.com.br/m.js" data-ws="agencia-strat">',
    '<script defer src="https://tracking.stratacademy.com.br/sa?product=stratai-parcerias">',
  ]);
});
