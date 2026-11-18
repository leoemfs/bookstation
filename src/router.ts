/** Rotas por hash: #/ (Biblioteca), #/novo, #/livro/<id>, #/livro/<id>/<area>, #/lixeira, #/ajustes, #/ideias, #/comunidade. */

export type Rota =
  | { tela: 'biblioteca' }
  | { tela: 'novo' }
  | { tela: 'livro'; id: string }
  | { tela: 'area'; id: string; area: string }
  | { tela: 'lixeira' }
  | { tela: 'ajustes' }
  | { tela: 'ideias' }
  | { tela: 'comunidade' };

export function lerRota(hash: string): Rota {
  const p = hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);
  if (p[0] === 'novo') return { tela: 'novo' };
  if (p[0] === 'livro' && p[1]) return p[2] ? { tela: 'area', id: p[1], area: p[2] } : { tela: 'livro', id: p[1] };
  if (p[0] === 'lixeira' || p[0] === 'ajustes' || p[0] === 'ideias' || p[0] === 'comunidade') return { tela: p[0] };
  return { tela: 'biblioteca' };
}

export function hashDe(r: Rota): string {
  switch (r.tela) {
    case 'biblioteca': return '#/';
    case 'livro': return `#/livro/${encodeURIComponent(r.id)}`;
    case 'area': return `#/livro/${encodeURIComponent(r.id)}/${encodeURIComponent(r.area)}`;
    default: return `#/${r.tela}`;
  }
}

/** O nível de cima (seta ‹ do topo). */
export function acima(r: Rota): Rota | null {
  if (r.tela === 'biblioteca') return null;
  if (r.tela === 'area') return { tela: 'livro', id: r.id };
  return { tela: 'biblioteca' };
}

/** Áreas do livro ainda não construídas e a fase em que chegam. */
export const AREAS: Record<string, { nome: string; fase: string }> = {
  capitulos: { nome: 'Capítulos', fase: 'F4' },
  rascunhos: { nome: 'Rascunhos', fase: 'F3' },
  ideias: { nome: 'Ideias', fase: 'F3' },
  personagens: { nome: 'Personagens', fase: 'F5' },
  locais: { nome: 'Locais', fase: 'F5' },
  climas: { nome: 'Climas', fase: 'F5' },
  imagens: { nome: 'Imagens', fase: 'F5' },
  fichas: { nome: 'Fichas', fase: 'F5' },
  guia: { nome: 'Guia do livro', fase: 'F6' },
  biblia: { nome: 'Bíblia do universo', fase: 'F6' },
  editor: { nome: 'Editor', fase: 'F2' },
  leitura: { nome: 'Leitura', fase: 'F8' },
};
