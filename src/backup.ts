/** Backup em arquivo: exportar tudo (ou um livro) e importar de volta. */
import { normalize, normalizeCapitulo, normalizeLivro, type Capitulo, type Dados, type Livro } from './data.ts';
import { copiarCapitulos } from './capitulos.ts';

export const APP = 'bookstation';

export function exportar(dados: Dados, agora: number): string {
  return JSON.stringify({ app: APP, tipo: 'tudo', exportadoEm: new Date(agora).toISOString(), dados }, null, 1);
}

export function exportarLivro(livro: Livro, capitulos: Capitulo[], agora: number): string {
  return JSON.stringify({ app: APP, tipo: 'livro', exportadoEm: new Date(agora).toISOString(), livro, capitulos: capitulos.filter((c) => c.livroId === livro.id) }, null, 1);
}

export type Importado = { tipo: 'tudo'; dados: Dados } | { tipo: 'livro'; livro: Livro; capitulos: Capitulo[] };

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
    const capitulos = (Array.isArray(r.capitulos) ? r.capitulos : []).map((c) => normalizeCapitulo(c, agora)).filter((c): c is Capitulo => !!c && c.livroId === livro.id);
    return { tipo: 'livro', livro, capitulos };
  }
  return { tipo: 'tudo', dados: normalize(r.dados, agora) };
}

/** Junta um livro importado (com os capítulos) sem apagar nada: entra sempre com ids novos. */
export function juntarLivro(dados: Dados, livro: Livro, capitulos: Capitulo[], novoId: () => string): Dados {
  const id = novoId();
  return {
    ...dados,
    livros: [{ ...livro, id, excluidoEm: null }, ...dados.livros],
    capitulos: [...dados.capitulos, ...copiarCapitulos(capitulos, livro.id, id, novoId)],
  };
}

export function nomeArquivo(base: string, agora: number): string {
  const d = new Date(agora);
  const p = (n: number) => String(n).padStart(2, '0');
  const limpo = base.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'livro';
  return `bookstation-${limpo}-${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}.json`;
}
