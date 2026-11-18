/** Regras dos livros: criar, filtrar, ordenar, arquivar, lixeira. Sem tela, sem banco. */
import type { Livro, Roteiro, Situacao } from './data.ts';

export const DIAS_LIXEIRA = 30;
const DIA = 86_400_000;

export type Filtro = 'todos' | 'arquivados' | Situacao;
export type Ordem = 'edicao' | 'titulo' | 'criacao';

export function novoId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function novoLivro(
  e: { titulo: string; generos?: string[]; descricao?: string; capa?: number; capaImg?: string | null; situacao?: Situacao; roteiro?: Roteiro },
  agora: number,
  id: string,
): Livro {
  return {
    id,
    titulo: e.titulo.trim() || 'Sem título',
    generos: e.generos ?? [],
    descricao: e.descricao ?? '',
    capa: e.capa ?? 0,
    capaImg: e.capaImg ?? null,
    situacao: e.situacao ?? 'planejamento',
    roteiro: e.roteiro ?? 'livre',
    arquivado: false,
    excluidoEm: null,
    criadoEm: agora,
    editadoEm: agora,
  };
}

/** Livros visíveis na Biblioteca (fora da lixeira), pelo filtro e pela busca. */
export function filtrar(livros: Livro[], filtro: Filtro, busca = ''): Livro[] {
  const q = semAcento(busca.trim());
  return livros.filter((l) => {
    if (l.excluidoEm !== null) return false;
    if (filtro === 'arquivados' ? !l.arquivado : l.arquivado) return false;
    if (filtro !== 'todos' && filtro !== 'arquivados' && l.situacao !== filtro) return false;
    if (!q) return true;
    return semAcento([l.titulo, l.descricao, ...l.generos].join(' ')).includes(q);
  });
}

export function ordenar(livros: Livro[], ordem: Ordem): Livro[] {
  const c = [...livros];
  if (ordem === 'titulo') return c.sort((a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'));
  if (ordem === 'criacao') return c.sort((a, b) => b.criadoEm - a.criadoEm);
  return c.sort((a, b) => b.editadoEm - a.editadoEm);
}

/** Quantos livros cada filtro mostra (para os chips). */
export function contagens(livros: Livro[]): Record<Filtro, number> {
  const out = { todos: 0, arquivados: 0, planejamento: 0, desenvolvimento: 0, escrita: 0, revisao: 0, concluido: 0 } as Record<Filtro, number>;
  for (const l of livros) {
    if (l.excluidoEm !== null) continue;
    if (l.arquivado) { out.arquivados++; continue; }
    out.todos++;
    out[l.situacao]++;
  }
  return out;
}

export function atualizar(livros: Livro[], id: string, patch: Partial<Omit<Livro, 'id' | 'criadoEm'>>, agora: number): Livro[] {
  return livros.map((l) => (l.id === id ? { ...l, ...patch, editadoEm: agora } : l));
}

export function duplicar(livros: Livro[], id: string, agora: number, novo: string): Livro[] {
  const o = livros.find((l) => l.id === id);
  if (!o) return livros;
  const copia: Livro = { ...o, id: novo, titulo: `${o.titulo} (cópia)`, arquivado: false, excluidoEm: null, criadoEm: agora, editadoEm: agora };
  const i = livros.indexOf(o);
  return [...livros.slice(0, i + 1), copia, ...livros.slice(i + 1)];
}

export const paraLixeira = (livros: Livro[], id: string, agora: number) => livros.map((l) => (l.id === id ? { ...l, excluidoEm: agora } : l));
export const restaurar = (livros: Livro[], id: string) => livros.map((l) => (l.id === id ? { ...l, excluidoEm: null } : l));
export const excluirDeVez = (livros: Livro[], id: string) => livros.filter((l) => l.id !== id);
export const naLixeira = (livros: Livro[]) => livros.filter((l) => l.excluidoEm !== null).sort((a, b) => (b.excluidoEm ?? 0) - (a.excluidoEm ?? 0));

/** Dias que faltam para sair da lixeira de vez (mínimo 0). */
export function diasRestantes(l: Livro, agora: number): number {
  if (l.excluidoEm === null) return DIAS_LIXEIRA;
  return Math.max(0, Math.ceil((l.excluidoEm + DIAS_LIXEIRA * DIA - agora) / DIA));
}

/** Tira da lixeira o que passou de 30 dias. */
export function limparLixeira(livros: Livro[], agora: number): Livro[] {
  return livros.filter((l) => l.excluidoEm === null || agora - l.excluidoEm < DIAS_LIXEIRA * DIA);
}

export function semAcento(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** "hoje, 09:14", "ontem", "12/11" ou "12/11/2025". */
export function quando(ms: number, agora: number): string {
  const d = new Date(ms), h = new Date(agora);
  const dia = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diff = Math.round((dia(h) - dia(d)) / DIA);
  const hm = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  if (diff === 0) return `hoje, ${hm}`;
  if (diff === 1) return 'ontem';
  const dd = String(d.getDate()).padStart(2, '0'), mm = String(d.getMonth() + 1).padStart(2, '0');
  return d.getFullYear() === h.getFullYear() ? `${dd}/${mm}` : `${dd}/${mm}/${d.getFullYear()}`;
}
