/** Backup em arquivo: exportar tudo (ou um livro) e importar de volta. */
import { normalize, normalizeLivro, type Capitulo, type Dados, type Ideia, type Livro, type Rascunho } from './data.ts';

export const APP = 'bookstation';

export function exportar(dados: Dados, agora: number): string {
  return JSON.stringify({ app: APP, tipo: 'tudo', exportadoEm: new Date(agora).toISOString(), dados }, null, 1);
}

export function exportarLivro(livro: Livro, d: Pick<Dados, 'capitulos' | 'ideias' | 'rascunhos'>, agora: number): string {
  const doLivro = <T extends { livroId: string | null }>(xs: T[]) => xs.filter((x) => x.livroId === livro.id);
  return JSON.stringify({ app: APP, tipo: 'livro', exportadoEm: new Date(agora).toISOString(), livro, capitulos: doLivro(d.capitulos), ideias: doLivro(d.ideias), rascunhos: doLivro(d.rascunhos) }, null, 1);
}

export interface PacoteLivro { livro: Livro; capitulos: Capitulo[]; ideias: Ideia[]; rascunhos: Rascunho[] }
export type Importado = { tipo: 'tudo'; dados: Dados } | ({ tipo: 'livro' } & PacoteLivro);

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
    // usa o normalize geral para validar capítulos, ideias e rascunhos do pacote
    const d = normalize({ livros: [livro], capitulos: r.capitulos, ideias: r.ideias, rascunhos: r.rascunhos }, agora);
    return { tipo: 'livro', livro, capitulos: d.capitulos, ideias: d.ideias, rascunhos: d.rascunhos };
  }
  return { tipo: 'tudo', dados: normalize(r.dados, agora) };
}

/** Junta um livro importado (com capítulos, ideias e rascunhos) sem apagar nada: entra sempre com ids novos. */
export function juntarLivro(dados: Dados, p: PacoteLivro, novoId: () => string): Dados {
  const id = novoId();
  const capIds = new Map(p.capitulos.map((c) => [c.id, novoId()]));
  return {
    ...dados,
    livros: [{ ...p.livro, id, excluidoEm: null }, ...dados.livros],
    capitulos: [...dados.capitulos, ...p.capitulos.map((c) => ({ ...c, id: capIds.get(c.id)!, livroId: id }))],
    ideias: [...dados.ideias, ...p.ideias.map((i) => ({ ...i, id: novoId(), livroId: id }))],
    rascunhos: [...dados.rascunhos, ...p.rascunhos.map((r) => ({ ...r, id: novoId(), livroId: id, capituloId: r.capituloId ? capIds.get(r.capituloId) ?? null : null }))],
  };
}

export function nomeArquivo(base: string, agora: number): string {
  const d = new Date(agora);
  const p = (n: number) => String(n).padStart(2, '0');
  const limpo = base.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w]+/g, '-').replace(/^-|-$/g, '').toLowerCase() || 'livro';
  return `bookstation-${limpo}-${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}.json`;
}
