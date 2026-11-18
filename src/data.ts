import type { Versao } from './versoes.ts';
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

export type Fonte = 'literaria' | 'simples';
export type CorPagina = 'papel' | 'branca' | 'preta';
export interface Aparencia {
  fonte: Fonte;
  /** Tamanho da letra no editor, em px. */
  tamanho: number;
  pagina: CorPagina;
}
export const APARENCIA_PADRAO: Aparencia = { fonte: 'literaria', tamanho: 17, pagina: 'papel' };

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
  /** Como o texto aparece no editor (vale só para este livro). */
  aparencia: Aparencia;
  arquivado: boolean;
  /** Quando foi para a lixeira (ms) ou null. */
  excluidoEm: number | null;
  criadoEm: number;
  editadoEm: number;
}

export type SituacaoCap = 'planejado' | 'escrita' | 'rascunho' | 'revisao' | 'concluido';
export const SITUACOES_CAP: { v: SituacaoCap; l: string; tom: 'azul' | 'ambar' | 'verde' | 'violeta' | 'cinza' }[] = [
  { v: 'planejado', l: 'Planejado', tom: 'azul' },
  { v: 'escrita', l: 'Em escrita', tom: 'ambar' },
  { v: 'rascunho', l: 'Rascunho', tom: 'cinza' },
  { v: 'revisao', l: 'Em revisão', tom: 'violeta' },
  { v: 'concluido', l: 'Concluído', tom: 'verde' },
];

/** Documento do editor (formato JSON do TipTap). */
export type Doc = { type: string; content?: Doc[]; text?: string; attrs?: Record<string, unknown>; marks?: { type: string; attrs?: Record<string, unknown> }[] };

export interface Capitulo {
  id: string;
  livroId: string;
  /** Posição no livro (o número do capítulo acompanha a ordem). */
  ordem: number;
  titulo: string;
  situacao: SituacaoCap;
  conteudo: Doc | null;
  palavras: number;
  caracteres: number;
  /** Final do texto, para o "Parou em…" do painel. */
  trecho: string;
  criadoEm: number;
  editadoEm: number;
}

export interface Ajustes {
  barraRecolhe: boolean;
  tema: Tema;
}

export interface Dados {
  versao: 1;
  /** Quando foi gravado pela última vez (para escolher a cópia mais nova ao abrir). */
  salvoEm: number;
  livros: Livro[];
  capitulos: Capitulo[];
  versoes: Versao[];
  ajustes: Ajustes;
}

export const AJUSTES_PADRAO: Ajustes = { barraRecolhe: true, tema: 'escuro' };

const str = (v: unknown, d = '') => (typeof v === 'string' ? v : d);
const num = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const oneOf = <T extends string>(v: unknown, ok: readonly T[], d: T): T => (ok.includes(v as T) ? (v as T) : d);

function normalizeAparencia(v: unknown): Aparencia {
  const a = v && typeof v === 'object' ? (v as Record<string, unknown>) : {};
  return {
    fonte: oneOf(a.fonte, ['literaria', 'simples'] as const, APARENCIA_PADRAO.fonte),
    tamanho: Math.min(24, Math.max(13, num(a.tamanho, APARENCIA_PADRAO.tamanho))),
    pagina: oneOf(a.pagina, ['papel', 'branca', 'preta'] as const, APARENCIA_PADRAO.pagina),
  };
}

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
    aparencia: normalizeAparencia(r.aparencia),
    arquivado: r.arquivado === true,
    excluidoEm: typeof r.excluidoEm === 'number' ? r.excluidoEm : null,
    criadoEm,
    editadoEm: num(r.editadoEm, criadoEm),
  };
}

function normalizeDoc(v: unknown): Doc | null {
  return v && typeof v === 'object' && (v as Doc).type === 'doc' ? (v as Doc) : null;
}

export function normalizeCapitulo(raw: unknown, agora = Date.now()): Capitulo | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const id = str(r.id), livroId = str(r.livroId);
  if (!id || !livroId) return null;
  const criadoEm = num(r.criadoEm, agora);
  return {
    id,
    livroId,
    ordem: num(r.ordem, 0),
    titulo: str(r.titulo),
    situacao: oneOf(r.situacao, SITUACOES_CAP.map((s) => s.v), 'escrita'),
    conteudo: normalizeDoc(r.conteudo),
    palavras: Math.max(0, Math.floor(num(r.palavras, 0))),
    caracteres: Math.max(0, Math.floor(num(r.caracteres, 0))),
    trecho: str(r.trecho),
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
  const vistosCap = new Set<string>();
  const ids = new Set(livros.map((l) => l.id));
  const capitulos = (Array.isArray(r.capitulos) ? r.capitulos : [])
    .map((c) => normalizeCapitulo(c, agora))
    .filter((c): c is Capitulo => !!c && ids.has(c.livroId) && !vistosCap.has(c.id) && !!vistosCap.add(c.id));
  const capIds = new Set(capitulos.map((c) => c.id));
  const versoes = (Array.isArray(r.versoes) ? r.versoes : []).filter((v): v is Versao => {
    const x = v as Versao;
    return !!x && typeof x === 'object' && typeof x.id === 'string' && capIds.has(x.capId) && typeof x.quando === 'number' && normalizeDoc(x.conteudo) !== null;
  }).map((v) => ({ ...v, nome: str(v.nome), palavras: num(v.palavras, 0), livroId: str(v.livroId) }));
  return {
    versao: 1,
    salvoEm: num(r.salvoEm, 0),
    livros,
    capitulos,
    versoes,
    ajustes: {
      barraRecolhe: typeof a.barraRecolhe === 'boolean' ? a.barraRecolhe : AJUSTES_PADRAO.barraRecolhe,
      tema: oneOf(a.tema, ['escuro', 'claro', 'sistema'] as const, AJUSTES_PADRAO.tema),
    },
  };
}
