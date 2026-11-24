/**
 * Gera as capas dos posts do blog em SVG, na paleta Alvorada.
 *
 * Sem texto de propósito: a capa é renderizada como <img>, então não dá para
 * contar com a Rubik estar disponível no renderizador — e cair numa fonte de
 * sistema quebraria a identidade. O título já aparece logo abaixo, no card.
 *
 * A composição é determinística: sai do hash do slug, então a mesma capa é
 * sempre a mesma, e posts diferentes recebem variações diferentes.
 *
 * Uso:  node scripts/gerar-capas.mjs
 */
import { readdir, writeFile, readFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const POSTS = join(AQUI, '../src/content/blog');
const SAIDA = join(AQUI, '../public/images/blog');

// Paleta — espelha strat-tokens.css. Se o token mudar, mude aqui também.
const BG = '#F5F3EE';
const SURF = '#FFFFFF';
const ACENTO = '#A8572E';
const VIVO = '#D97A4A';
const LINHA = 'rgba(15,17,21,.13)';

const L = 1200;
const A = 675;

/** Hash estável do slug -> número. */
function hash(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/** Seis composições geométricas. Todas respeitam a proporção 80/15/5 da paleta. */
const COMPOSICOES = [
  // arcos concêntricos — anel sólido no centro
  (r) => `
    <circle cx="${900 + r(60)}" cy="337" r="300" fill="${VIVO}" fill-opacity=".10"/>
    <g fill="none" stroke="${VIVO}" stroke-opacity=".45" stroke-width="7">
      ${[0, 1, 2, 3].map((i) => `<circle cx="${900 + r(60)}" cy="337" r="${90 + i * 82}"/>`).join('')}
    </g>
    <circle cx="${900 + r(60)}" cy="337" r="62" fill="${ACENTO}"/>
    <circle cx="250" cy="${140 + r(120)}" r="26" fill="${VIVO}" fill-opacity=".55"/>`,

  // grade de pontos com destaques sólidos
  (r) => `
    <g fill="${VIVO}" fill-opacity=".42">
      ${Array.from({ length: 7 }, (_, y) =>
        Array.from({ length: 12 }, (_, x) => `<circle cx="${150 + x * 82}" cy="${110 + y * 76}" r="11"/>`).join('')
      ).join('')}
    </g>
    <circle cx="${150 + r(11) * 82}" cy="${110 + r(6) * 76}" r="52" fill="${ACENTO}"/>
    <circle cx="${150 + ((r(11) + 4) % 12) * 82}" cy="${110 + ((r(6) + 3) % 7) * 76}" r="30" fill="${VIVO}"/>`,

  // fluxo de nós — automação
  (r) => {
    const y = (i) => 200 + ((i * 149 + r(120)) % 280);
    const pts = [170, 420, 660, 900, 1060].map((x, i) => [x, y(i)]);
    return `
      <g stroke="${VIVO}" stroke-opacity=".6" stroke-width="8" fill="none" stroke-linecap="round">
        ${pts.slice(0, -1).map(([x1, y1], i) => {
          const [x2, y2] = pts[i + 1];
          return `<path d="M${x1} ${y1} C ${(x1 + x2) / 2} ${y1}, ${(x1 + x2) / 2} ${y2}, ${x2} ${y2}"/>`;
        }).join('')}
      </g>
      ${pts.map(([x, yy], i) =>
        `<circle cx="${x}" cy="${yy}" r="${i === 2 ? 54 : 30}" fill="${i === 2 ? ACENTO : SURF}" stroke="${i === 2 ? ACENTO : VIVO}" stroke-width="6"/>`
      ).join('')}`;
  },

  // faixas diagonais grossas
  (r) => `
    <g transform="rotate(-18 600 337)">
      ${[0, 1, 2, 3, 4, 5].map((i) => {
        const marcada = i === r(5) % 6;
        return `<rect x="${-140 + i * 240}" y="-200" width="${marcada ? 130 : 74}" height="1100"
           fill="${marcada ? ACENTO : VIVO}" fill-opacity="${marcada ? '1' : '.32'}" rx="22"/>`;
      }).join('')}
    </g>`,

  // cartões empilhados
  (r) => `
    <circle cx="170" cy="540" r="200" fill="${VIVO}" fill-opacity=".14"/>
    <g>
      <rect x="${300 + r(60)}" y="105" width="620" height="440" rx="30" fill="${SURF}" opacity=".55"/>
      <rect x="${352 + r(60)}" y="152" width="620" height="440" rx="30" fill="${SURF}" opacity=".8"/>
      <rect x="${404 + r(60)}" y="200" width="620" height="440" rx="30" fill="${SURF}" stroke="${LINHA}" stroke-width="2"/>
      <rect x="${446 + r(60)}" y="246" width="230" height="26" rx="13" fill="${ACENTO}"/>
      <rect x="${446 + r(60)}" y="300" width="470" height="20" rx="10" fill="${VIVO}" fill-opacity=".5"/>
      <rect x="${446 + r(60)}" y="340" width="380" height="20" rx="10" fill="${VIVO}" fill-opacity=".5"/>
      <rect x="${446 + r(60)}" y="380" width="420" height="20" rx="10" fill="${VIVO}" fill-opacity=".28"/>
    </g>`,

  // leque de raios
  (r) => `
    <g stroke="${VIVO}" stroke-opacity=".5" stroke-width="9" stroke-linecap="round">
      ${Array.from({ length: 13 }, (_, i) => {
        const a = (Math.PI / 12) * i - Math.PI / 2;
        return `<line x1="880" y1="337" x2="${880 + Math.cos(a) * 360}" y2="${337 + Math.sin(a) * 360}"/>`;
      }).join('')}
    </g>
    <circle cx="880" cy="337" r="${150 + r(40)}" fill="${BG}"/>
    <circle cx="880" cy="337" r="${104 + r(30)}" fill="${VIVO}" fill-opacity=".35"/>
    <circle cx="880" cy="337" r="56" fill="${ACENTO}"/>`,
];

function capa(slug) {
  const h = hash(slug);
  const r = (n) => h % (n + 1);
  const comp = COMPOSICOES[h % COMPOSICOES.length];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${L} ${A}" width="${L}" height="${A}" role="img" aria-hidden="true">
  <defs>
    <radialGradient id="aura" cx="78%" cy="0%" r="82%">
      <stop offset="0%" stop-color="${VIVO}" stop-opacity=".16"/>
      <stop offset="64%" stop-color="${VIVO}" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="quadro"><rect width="${L}" height="${A}"/></clipPath>
  </defs>
  <g clip-path="url(#quadro)">
    <rect width="${L}" height="${A}" fill="${BG}"/>
    <rect width="${L}" height="${A}" fill="url(#aura)"/>
    ${comp(r)}
  </g>
</svg>`;
}

const arquivos = (await readdir(POSTS)).filter((f) => f.endsWith('.md'));
let escritas = 0;
for (const f of arquivos) {
  const slug = f.replace(/\.md$/, '');
  // pula rascunho
  const md = await readFile(join(POSTS, f), 'utf8');
  if (/^draft:\s*true/m.test(md)) continue;
  await writeFile(join(SAIDA, `${slug}.svg`), capa(slug), 'utf8');
  escritas++;
}
console.log(`capas geradas: ${escritas} de ${arquivos.length} posts`);
