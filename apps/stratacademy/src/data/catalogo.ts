// ============================================================
// Catálogo — espelho do que existe no Strat Hub hoje.
// Fonte de verdade é o Hub: não criar folha de curso sem lastro lá dentro.
// Ver docs/ARQUITETURA-SITE.md (escada B2C, ondas 1/2/3, contrato de página).
// ============================================================

// Destino de todo CTA de conversão: a tela de conta grátis do Hub. A raiz do Hub cai
// no login (/auth), que não cria conta. O clique acrescenta ?origem=site-<rota> e as
// UTMs da página (script de tracking do RubikLayout).
export const HUB = 'https://hub.stratacademy.com.br/cadastro';
/** Login de quem já é aluno. */
export const HUB_ENTRAR = 'https://hub.stratacademy.com.br/auth';

/** Produto âncora. Toda página do site converte aqui (C1). */
export const PLANO = {
  nome: 'Strat Academy 2.0',
  preco: 'R$ 67',
  periodo: '/mês',
  chamada: 'Criar conta grátis',
  href: HUB,
} as const;

/** O que o Hub entrega por dentro — usado no bloco "o que você recebe". */
export const HUB_INCLUI = [
  { icon: 'play_circle', title: 'Aulas e cursos', desc: 'Trilhas completas por ferramenta, do primeiro clique ao projeto no ar.' },
  { icon: 'extension', title: 'Skills & Templates', desc: 'Skills prontas de Claude Code e templates para importar e adaptar.' },
  { icon: 'folder_open', title: 'Materiais', desc: 'Workflows, prompts e arquivos de apoio de cada aula.' },
  { icon: 'smart_toy', title: 'Tutor IA', desc: 'Um tutor dentro da plataforma para destravar dúvida na hora.' },
  { icon: 'redeem', title: 'Benefícios', desc: 'Descontos nas ferramentas que a gente usa na operação real.' },
  { icon: 'newspaper', title: 'News IA', desc: 'O que mudou na semana, filtrado — sem precisar caçar notícia.' },
  { icon: 'workspace_premium', title: 'Certificados', desc: 'Certificado de conclusão a cada trilha que você fecha.' },
  { icon: 'edit_note', title: 'Anotações', desc: 'Suas anotações ficam junto da aula, não num caderno perdido.' },
] as const;

export type Grupo = 'builder' | 'midia';

export interface Curso {
  slug: string;            // vira /curso-<slug>
  nome: string;
  grupo: Grupo;
  onda: 1 | 2 | 3;
  acesso: 'premium' | 'gratuito';
  mark: string;            // chave do ToolMark
  tagline: string;         // 1 linha, aparece no card do catálogo
}

/** Os 11 cursos sob Acesso Premium — Strat Academy 2.0. */
export const CURSOS: Curso[] = [
  { slug: 'claude-code', nome: 'Claude Code', grupo: 'builder', onda: 1, acesso: 'premium', mark: 'claude-code',
    tagline: 'O terminal que escreve, refatora e entende o seu projeto inteiro.' },
  { slug: 'n8n', nome: 'N8N', grupo: 'builder', onda: 1, acesso: 'gratuito', mark: 'n8n',
    tagline: 'Automação visual: conecta o que a empresa já usa e roda sozinho.' },
  { slug: 'cursor', nome: 'Cursor', grupo: 'builder', onda: 1, acesso: 'premium', mark: 'cursor',
    tagline: 'O editor com IA embutida — autocomplete que entende contexto.' },
  { slug: 'lovable', nome: 'Lovable', grupo: 'builder', onda: 1, acesso: 'premium', mark: 'lovable',
    tagline: 'App completo a partir de uma conversa. Vibe coding na prática.' },
  { slug: 'github', nome: 'GitHub', grupo: 'builder', onda: 2, acesso: 'premium', mark: 'github',
    tagline: 'Versionar, colaborar e publicar sem medo de quebrar o que funciona.' },
  { slug: 'google-ai-studio', nome: 'Google AI Studio', grupo: 'builder', onda: 2, acesso: 'premium', mark: 'ai-studio',
    tagline: 'Prototipar com os modelos do Google e levar para dentro do produto.' },
  { slug: 'google-antigravity', nome: 'Google Antigravity', grupo: 'builder', onda: 2, acesso: 'premium', mark: 'antigravity',
    tagline: 'O ambiente agêntico do Google para construir com agentes.' },
  { slug: 'nano-banana', nome: 'Nano Banana', grupo: 'midia', onda: 3, acesso: 'premium', mark: 'nano-banana',
    tagline: 'Geração e edição de imagem com consistência de personagem.' },
  { slug: 'higgsfield', nome: 'Higgsfield', grupo: 'midia', onda: 3, acesso: 'premium', mark: 'higgsfield',
    tagline: 'Movimento de câmera cinematográfico em vídeo gerado por IA.' },
  { slug: 'kling-ai', nome: 'Kling AI', grupo: 'midia', onda: 3, acesso: 'premium', mark: 'kling',
    tagline: 'Vídeo por IA com controle de duração, cena e continuidade.' },
  { slug: 'heygen', nome: 'HeyGen', grupo: 'midia', onda: 3, acesso: 'premium', mark: 'heygen',
    tagline: 'Avatar e dublagem para escalar vídeo sem escalar gravação.' },
];

/** As 3 masterclasses do Hub. As duas gratuitas são o lastro do "crie conta grátis". */
export const MASTERCLASSES = [
  { nome: 'Masterclass N8N', acesso: 'Gratuito', aulas: 24, mark: 'n8n',
    desc: 'A porta de entrada em automação: do primeiro fluxo ao agente que roda sozinho.' },
  { nome: 'Masterclass Claude Code', acesso: 'Gratuito', aulas: null, mark: 'claude-code',
    desc: 'Instalar, configurar e colocar o Claude Code para trabalhar no seu projeto.' },
  { nome: 'Masterclass Hermes Agent', acesso: 'Pago', aulas: 25, mark: 'hermes',
    desc: 'O agente da casa, por dentro: arquitetura, memória e operação real.' },
] as const;

export const GRUPOS: Record<Grupo, { titulo: string; eyebrow: string; desc: string }> = {
  builder: {
    eyebrow: 'Construir',
    titulo: 'Ferramentas para construir',
    desc: 'Para quem quer sair da ideia e colocar sistema, agente e automação no ar.',
  },
  midia: {
    eyebrow: 'Criar',
    titulo: 'Ferramentas para criar mídia',
    desc: 'Para quem produz conteúdo e precisa de imagem e vídeo em escala, com consistência.',
  },
};
