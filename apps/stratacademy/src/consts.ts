// Configuração central do site. Mude aqui e tudo (SEO, OG, RSS, JSON-LD) acompanha.
export const SITE = {
  url: 'https://stratacademy.com.br',       // <- confirmar domínio real
  name: 'Strat Academy',
  title: 'Strat Academy — Automação, IA e N8N para negócios escaláveis',
  description:
    'Tutoriais e estratégias de automação, inteligência artificial e N8N para escalar operações sem aumentar o time.',
  lang: 'pt-BR',
  locale: 'pt_BR',
  author: {
    name: 'Equipe Strat',
    url: 'https://stratacademy.com.br/sobre',
    // sameAs ajuda GEO: liga sua entidade a perfis conhecidos (autoridade/E-E-A-T).
    sameAs: [
      'https://www.linkedin.com/company/stratacademy',
      'https://instagram.com/stratacademy.ai',
    ],
  },
  twitter: '@stratacademy',
} as const;

// Navegação principal — as 4 portas + o motor (blog).
// Ordem = jornada: catálogo -> produto âncora -> ao vivo -> B2B -> conteúdo.
// Ver docs/ARQUITETURA-SITE.md.
export const NAV = [
  { label: 'Cursos', href: '/cursos/' },
  { label: 'Strat Academy 2.0', href: '/assinatura/' },
  { label: 'Eventos', href: '/eventos/' },
  { label: 'Empresas', href: '/empresas/' },
  { label: 'Blog', href: '/blog/' },
] as const;

// CTA principal do cabeçalho. O site não vende: converte em cadastro grátis no Hub (C1).
export const CTA = {
  label: 'Criar conta grátis',
  short: 'Criar conta', // abaixo de 640px o rótulo completo estoura a barra
  href: 'https://hub.stratacademy.com.br/cadastro',
} as const;

// Link discreto para quem já é aluno.
export const LOGIN = { label: 'Entrar', href: 'https://hub.stratacademy.com.br/auth' } as const;

// Canais reais — um lugar só, para não espalhar link solto pelas páginas.
const MSG_B2B =
  'Olá! Vim pelo site da Strat Academy e quero falar sobre automação para a minha empresa.';

export const CANAIS = {
  /** WhatsApp comercial da Strat Ai, com mensagem pré-preenchida que identifica a origem. */
  whatsappB2B: `https://wa.me/5547991658478?text=${encodeURIComponent(MSG_B2B)}`,
  discord: 'https://links.stratacademy.com.br/discord',
  whatsappComunidade: 'https://links.stratacademy.com.br/grupo',
} as const;

// Foto do fundador. Serve para o bloco de autor do blog e para /sobre.
// Está em `assets.stratacademy.com.br`, o domínio do bucket `strat-web-media` (o R2 do
// site, ADR 0008, adendo de 2026-10-16), com cache imutável. Trocar aqui resolve o site inteiro.
export const AUTOR_FOTO: Record<string, string> = {
  'Helbert Paranhos':
    'https://assets.stratacademy.com.br/horus/2026/08/design-sem-nome-e940c0fb9b.web.webp',
};

// Quantidade de posts por página na listagem /blog.
export const PAGE_SIZE = 4;

// Analytics (PostHog) vem de variáveis PUBLIC_* (ver .env.example e ADR 0006).
// A captação de lead não tem config aqui nem no cliente: o destino vive na Pages
// Function `functions/api/lead.ts`. O Sequenzy foi descontinuado.

// Autores como entidades (E-E-A-T + JSON-LD Person). A chave é o nome usado no frontmatter.
export const AUTHORS: Record<string, { role: string; bio: string; sameAs: string[] }> = {
  'Helbert Paranhos': {
    role: 'Fundador da Strat Academy',
    bio: 'Engenheiro de automação e fundador da Strat Academy. Escreve sobre IA, N8N e automação aplicada a negócios.',
    sameAs: [
      'https://www.tiktok.com/@helbert.paranhos',
      'https://www.youtube.com/@strat_ai',
      'https://www.linkedin.com/company/stratacademy',
    ],
  },
  'Equipe Strat': {
    role: 'Time editorial',
    bio: 'O time da Strat Academy escreve sobre automação, IA e N8N aplicados a negócios reais.',
    sameAs: ['https://www.linkedin.com/company/stratacademy', 'https://instagram.com/stratacademy.ai'],
  },
  'Renan Silva': {
    role: 'Especialista em IA aplicada',
    bio: 'Escreve sobre agentes autônomos, LLMs e o impacto da IA no mercado de serviços.',
    sameAs: ['https://www.linkedin.com/company/stratacademy'],
  },
  'Ana Tech': {
    role: 'Engenheira de automação',
    bio: 'Foca em integrações, webhooks e arquitetura de fluxos no N8N.',
    sameAs: ['https://www.linkedin.com/company/stratacademy'],
  },
};

// Links do rodapé.
export const FOOTER = {
  tagline: 'Transformando profissionais em especialistas em automação digital e inteligência artificial.',
  navegacao: [
    { label: 'Cursos', href: '/cursos/' },
    { label: 'Strat Academy 2.0', href: '/assinatura/' },
    { label: 'Eventos', href: '/eventos/' },
    { label: 'Empresas', href: '/empresas/' },
    { label: 'Blog', href: '/blog/' },
  ],
  suporte: [
    { label: 'Materiais', href: '/downloads/' },
    { label: 'Ferramentas grátis', href: '/ferramentas/' },
    { label: 'Benefícios Strat', href: '/parceiros/' },
    { label: 'Comunidade', href: '/comunidade-euforia/' },
    { label: 'Mentoria', href: '/mentoria/' },
    { label: 'Sobre', href: '/sobre/' },
    { label: 'Contato', href: '/contato/' },
    { label: 'Newsletter', href: '/newsletter/' },
    { label: 'Privacidade', href: '/politica-de-privacidade/' },
  ],
  social: [
    { label: 'Site', icon: 'public', href: '#' },
    { label: 'GitHub', icon: 'code', href: '#' },
    { label: 'Comunidade', icon: 'chat', href: '#' },
  ],
} as const;

// Tema visual por categoria (ícone + gradiente) — DADO DE MARCA, fica no app.
// Injetado no @horus/ui/PostCard via prop `themes` (pelo wrapper components/PostCard.astro).
export const CATEGORY_THEMES: Record<string, { icon: string; from: string; to: string }> = {
  automacao: { icon: 'account_tree', from: '#2563eb', to: '#22d3ee' },
  automação: { icon: 'account_tree', from: '#2563eb', to: '#22d3ee' },
  ia: { icon: 'neurology', from: '#2563eb', to: '#7c3aed' },
  n8n: { icon: 'hub', from: '#7c3aed', to: '#2563eb' },
  negocios: { icon: 'trending_up', from: '#2563eb', to: '#6001d1' },
  negócios: { icon: 'trending_up', from: '#2563eb', to: '#6001d1' },
  geo: { icon: 'travel_explore', from: '#2563eb', to: '#22d3ee' },
  seo: { icon: 'search', from: '#7c3aed', to: '#22d3ee' },
  astro: { icon: 'rocket_launch', from: '#2563eb', to: '#7c3aed' },
  conteudo: { icon: 'edit_note', from: '#6001d1', to: '#2563eb' },
  'claude-code': { icon: 'code', from: '#d97757', to: '#d97757' },
  'ferramentas-digitais': { icon: 'build', from: '#d97757', to: '#d97757' },
  produtividade: { icon: 'bolt', from: '#d97757', to: '#d97757' },
};
