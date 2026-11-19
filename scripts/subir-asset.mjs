#!/usr/bin/env node
// Sobe uma imagem (ou outro arquivo) para o R2 de assets da marca, com cache de 1 ano imutável (WEB-44).
//
//   MSYS_NO_PATHCONV=1 infisical run --projectId=baffbac0-3e1a-47fb-b381-63326d430e39 --env=dev --path=/cloudflare -- \
//     node scripts/subir-asset.mjs <marca> <arquivo> <chave>
//
//   marca: agencia | stratai | metricaas | academy
//   chave: caminho no bucket, sem barra no começo (ex.: blog/agente-whatsapp/capa.webp)
//   --testar: só confere a chave e mostra o que faria, sem subir
//
// Regra (docs/padroes.md): **nunca sobrescrever chave.** O arquivo sai com `Cache-Control: immutable`, então o
// navegador e a borda guardam a versão antiga por um ano: trocar o conteúdo de uma chave não chega a quem já viu.
// Mudou a imagem, mude o nome (capa-v2.webp). O script recusa chave que já existe.
import { execFileSync } from 'node:child_process';
import { existsSync, statSync } from 'node:fs';
import { extname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export const MARCAS = {
  agencia: { bucket: 'assets-agenciastrat', dominio: 'assets.agenciastrat.com.br' },
  stratai: { bucket: 'assets-stratai', dominio: 'assets.stratai.com.br' },
  metricaas: { bucket: 'assets-metricaas', dominio: 'assets.metricaas.com.br' },
  academy: { bucket: 'strat-web-media', dominio: 'assets.stratacademy.com.br' },
};
export const CACHE = 'public, max-age=31536000, immutable';
const TIPOS = {
  '.webp': 'image/webp', '.avif': 'image/avif', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.mp4': 'video/mp4', '.webm': 'video/webm',
  '.pdf': 'application/pdf', '.woff2': 'font/woff2',
};

/** Chave aceita: sem barra no começo, sem `..`, sem espaço, com extensão conhecida. */
export function conferirChave(chave) {
  if (!chave || chave.startsWith('/') || chave.includes('..') || /\s/.test(chave)) return 'chave sem barra no começo, sem ".." e sem espaço';
  if (!TIPOS[extname(chave).toLowerCase()]) return `extensão fora da lista (${Object.keys(TIPOS).join(', ')})`;
  return null;
}

async function chaveExiste(bucket, chave) {
  const { CLOUDFLARE_ACCOUNT_ID: conta, CLOUDFLARE_API_TOKEN: token } = process.env;
  const url = `https://api.cloudflare.com/client/v4/accounts/${conta}/r2/buckets/${bucket}/objects?prefix=${encodeURIComponent(chave)}&per_page=100`;
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  const j = await r.json();
  if (!j.success) throw new Error(`não deu para conferir a chave no R2: ${JSON.stringify(j.errors)}`);
  return j.result.some((o) => o.key === chave);
}

async function main() {
  const args = process.argv.slice(2);
  const testar = args.includes('--testar');
  const [marca, arquivo, chave] = args.filter((a) => a !== '--testar');
  const destino = MARCAS[marca];
  if (!destino || !arquivo || !chave) {
    console.error('uso: node scripts/subir-asset.mjs <agencia|stratai|metricaas|academy> <arquivo> <chave> [--testar]');
    process.exit(2);
  }
  if (!process.env.CLOUDFLARE_API_TOKEN || !process.env.CLOUDFLARE_ACCOUNT_ID) {
    console.error('rode dentro do infisical run --path=/cloudflare (docs/infisical.md)');
    process.exit(2);
  }
  if (!existsSync(arquivo) || !statSync(arquivo).isFile()) throw new Error(`arquivo não encontrado: ${arquivo}`);
  const problema = conferirChave(chave);
  if (problema) throw new Error(problema);
  if (await chaveExiste(destino.bucket, chave)) {
    throw new Error(`a chave ${chave} já existe em ${destino.bucket}: nunca sobrescrever (cache imutável). Use outro nome, ex.: ${chave.replace(/(\.[^.]+)$/, '-v2$1')}`);
  }
  const tipo = TIPOS[extname(chave).toLowerCase()];
  const url = `https://${destino.dominio}/${chave}`;
  if (testar) return console.log(`subiria ${arquivo} (${tipo}) em ${destino.bucket}/${chave} → ${url}`);
  const put = ['--yes', 'wrangler@4.160.0', 'r2', 'object', 'put', `${destino.bucket}/${chave}`, '--file', arquivo,
    '--content-type', tipo, '--cache-control', CACHE, '--remote'];
  // No Windows o npx é npx.cmd e só roda pelo shell: cada argumento vai entre aspas (caminho com espaço; o
  // Cache-Control tem vírgula e espaço). Caminho do Windows não aceita aspas, então não há o que escapar.
  if (process.platform === 'win32') {
    execFileSync('npx.cmd', put.map((a) => `"${a}"`), { stdio: 'inherit', shell: true });
  } else {
    execFileSync('npx', put, { stdio: 'inherit' });
  }
  console.log(url);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main().catch((e) => { console.error(`erro: ${e.message}`); process.exit(1); });
}
