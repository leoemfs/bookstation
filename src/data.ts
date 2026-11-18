/**
 * Modelo de dados do BookStation e normalize(): todo dado antigo ou backup passa por aqui.
 * Regra: todo campo novo precisa de valor padrão neste arquivo.
 */

export type Situacao = 'planejamento' | 'desenvolvimento' | 'escrita' | 'revisao' | 'concluido';
export type Roteiro = 'livre' | 'tres-atos' | 'jornada' | 'sete-pontos';
export type Tema = 'escuro' | 'claro' | 'sistema';

export const SITUACOES: { v: Situacao; l: string; tom: 'azul' | 'ambar' | 'verde' | 'violeta' }[] = [
  { v: 'planejamento', l: 'Planejamento', tom: 'azul' },
  { v: 'desenvolvimento', l: 'Em desenvolvimento', tom: 'ambar' },
  { v: 'escrita', l: 'Em escrita', tom: 'verde' },
  { v: 'revisao', l: 'Em revisão', tom: 'violeta' },
  { v: 'concluido', l: 'Concluído', tom: 'verde' },
];

export const ROTEIROS: { v: Roteiro; l: string; d: string; marcos: string[] }[] = [
  { v: 'livre', l: 'Livre', d: 'Sem estrutura. Você organiza do seu jeito.', marcos: [] },
  { v: 'tres-atos', l: 'Três atos', d: 'Começo, meio e fim, com viradas entre eles.', marcos: ['Apresentação', 'Incidente inicial', 'Complicações', 'Ponto de virada', 'Clímax', 'Resolução'] },
  { v: 'jornada', l: 'Jornada do herói', d: 'A personagem sai do mundo comum, é testada e volta transformada.', marcos: ['Mundo comum', 'Chamado', 'Recusa', 'Mentor', 'Travessia', 'Provas', 'Provação', 'Recompensa', 'Retorno'] },
  { v: 'sete-pontos', l: 'Sete pontos', d: 'Planejar do fim para o começo.', marcos: ['Gancho', 'Virada 1', 'Pressão 1', 'Ponto central', 'Pressão 2', 'Virada 2', 'Resolução'] },
];

export const GENEROS = ['Fantasia', 'Mistério', 'Romance', 'Ficção científica', 'Drama', 'Terror', 'Aventura', 'Infantil', 'Poesia', 'Não ficção'];

/** Capas prontas (gradiente). O número fica salvo no livro. */
export const CAPAS = ['#1d4e5f,#0e2a33', '#6b2e2e,#331414', '#3c3a6b,#1b1a36', '#2f5a2a,#142812', '#6b5517,#2b2208', '#4a1d3a,#1d0b17'];

export interface Livro {
  id: string;
  titulo: string;
  generos: string[];
  descricao: string;
  /** Índice em CAPAS. */
  capa: number;
  /** Imagem da capa (data URL comprimida) ou null. */
  capaImg: string | null;
  situacao: Situacao;
  roteiro: Roteiro;
  arquivado: boolean;
  /** Quando foi para a lixeira (ms) ou null. */
  excluidoEm: number | null;
  criadoEm: number;
  editadoEm: number;
}

export interface Ajustes {
  barraRecolhe: boolean;
  tema: Tema;
}

export interface Dados {
  versao: 1;
  livros: Livro[];
  ajustes: Ajustes;
}

export const AJUSTES_PADRAO: Ajustes = { barraRecolhe: true, tema: 'escuro' };

const str = (v: unknown, d = '') => (typeof v === 'string' ? v : d);
const num = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const oneOf = <T extends string>(v: unknown, ok: readonly T[], d: T): T => (ok.includes(v as T) ? (v as T) : d);

export function normalizeLivro(raw: unknown, agora = Date.now()): Livro | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = str(r.id);
  if (!id) return null;
  const criadoEm = num(r.criadoEm, agora);
  return {
    id,
    titulo: str(r.titulo).trim() || 'Sem título',
    generos: Array.isArray(r.generos) ? r.generos.filter((g): g is string => typeof g === 'string') : [],
    descricao: str(r.descricao),
    capa: Math.min(CAPAS.length - 1, Math.max(0, Math.floor(num(r.capa, 0)))),
    capaImg: typeof r.capaImg === 'string' && r.capaImg.startsWith('data:image/') ? r.capaImg : null,
    situacao: oneOf(r.situacao, SITUACOES.map((s) => s.v), 'planejamento'),
    roteiro: oneOf(r.roteiro, ROTEIROS.map((s) => s.v), 'livre'),
    arquivado: r.arquivado === true,
    excluidoEm: typeof r.excluidoEm === 'number' ? r.excluidoEm : null,
    criadoEm,
    editadoEm: num(r.editadoEm, criadoEm),
  };
}

export function normalize(raw: unknown, agora = Date.now()): Dados {
  const r = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  const a = r.ajustes && typeof r.ajustes === 'object' ? (r.ajustes as Record<string, unknown>) : {};
  const vistos = new Set<string>();
  const livros = (Array.isArray(r.livros) ? r.livros : [])
    .map((l) => normalizeLivro(l, agora))
    .filter((l): l is Livro => !!l && !vistos.has(l.id) && !!vistos.add(l.id));
  return {
    versao: 1,
    livros,
    ajustes: {
      barraRecolhe: typeof a.barraRecolhe === 'boolean' ? a.barraRecolhe : AJUSTES_PADRAO.barraRecolhe,
      tema: oneOf(a.tema, ['escuro', 'claro', 'sistema'] as const, AJUSTES_PADRAO.tema),
    },
  };
}
