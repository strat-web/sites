// Opções de imagem OpenGraph (estilo do design system: navy escuro + borda azul).
// Agnóstico de marca: o título/descrição (e fontes, se quiser) vêm por parâmetro.
interface OgOpts {
  fonts?: string[];
}

export function ogOptions(title: string, description: string, opts: OgOpts = {}) {
  return {
    title,
    description,
    bgGradient: [
      [10, 14, 24],
      [28, 31, 42],
    ] as [number, number, number][],
    border: { color: [37, 99, 235] as [number, number, number], width: 24, side: 'inline-start' as const },
    padding: 80,
    // Cada app mantém a fonte em ./src/assets/fonts/ (convenção). Sobrescrevível via opts.fonts.
    fonts: opts.fonts ?? ['./src/assets/fonts/Inter-Variable.ttf'],
    font: {
      title: {
        families: ['Inter'],
        color: [223, 226, 241] as [number, number, number],
        weight: 'Bold' as const,
        size: 64,
      },
      description: {
        families: ['Inter'],
        color: [180, 197, 255] as [number, number, number],
        size: 32,
      },
    },
  };
}
