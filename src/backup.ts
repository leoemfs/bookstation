/** Backup em arquivo: exportar tudo (ou um livro) e importar de volta. */
import { normalize, normalizeLivro, type Dados, type Livro } from './data.ts';

export const APP = 'bookstation';

export function exportar(dados: Dados, agora: number): string {
  return JSON.stringify({ app: APP, tipo: 'tudo', exportadoEm: new Date(agora).toISOString(), dados }, null, 1);
}

export function exportarLivro(livro: Livro, agora: number): string {
  return JSON.stringify({ app: APP, tipo: 'livro', exportadoEm: new Date(agora).toISOString(), livro }, null, 1);
}

export type Importado = { tipo: 'tudo'; dados: Dados } | { tipo: 'livro'; livro: Livro };

/** Lê um arquivo de backup. Erros vêm com mensagem para mostrar à pessoa. */
export function importar(texto: string, agora: number): Importado {
  let j: unknown;
  try {
    j = JSON.parse(texto);
  } catch {
    throw new Error('Este arquivo não é um backup do BookStation.');
  }
  const r = j as Record<string, unknown> | null;
  if (!r || r.app !== APP) throw new Error('Este arquivo não é um backup do BookStation.');
  if (r.tipo === 'livro') {
    const livro = normalizeLivro(r.livro, agora);
    if (!livro) throw new Error('O livro deste arquivo está incompleto.');
    return { tipo: 'livro', livro };
  }
  return { tipo: 'tudo', dados: normalize(r.dados, agora) };
}

/** Junta um livro importado sem apagar nada: se o id já existe, entra como novo. */
export function juntarLivro(livros: Livro[], livro: Livro, novoId: string): Livro[] {
  const l = livros.some((x) => x.id === livro.id) ? { ...livro, id: novoId } : livro;
  return [{ ...l, excluidoEm: null }, ...livros];
}

export function nomeArquivo(base: string, agora: number): string {
  const d = new Date(agora);
  const p = (n: number) => String(n).padStart(2, '0');
  const limpo = base.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'livro';
  return `bookstation-${limpo}-${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}.json`;
}
