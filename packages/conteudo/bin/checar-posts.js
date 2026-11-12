#!/usr/bin/env node
// checar-posts (WEB-19): valida os posts do blog do app. Sai com código 1 se houver erro, para servir na CI.
//
// Uso, de dentro do app:   pnpm checar:posts        (script "checar:posts": "checar-posts" no package.json do app)
// De qualquer lugar:       pnpm --filter @strat/stratai checar:posts
// Outra pasta:             checar-posts --app apps/stratacademy
import { checarApp, relatorio } from '../src/checar-posts.js';

const args = process.argv.slice(2);
if (args.includes('--ajuda') || args.includes('-h') || args.includes('--help')) {
  console.log('uso: checar-posts [--app <pasta do app>]   (padrão: a pasta atual)');
  process.exit(0);
}
const i = args.indexOf('--app');
const dirApp = i >= 0 && args[i + 1] ? args[i + 1] : process.cwd();

try {
  const resultado = checarApp(dirApp);
  process.stdout.write(relatorio(resultado));
  process.exit(resultado.erros.length ? 1 : 0);
} catch (erro) {
  console.error(`checar-posts: ${erro.message}`);
  process.exit(2);
}
