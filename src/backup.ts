/** Backup em arquivo: exportar tudo (ou um livro) e importar de volta. */
import { normalize, normalizeLivro, type Capitulo, type Cena, type Dados, type Ideia, type Livro, type Rascunho } from './data.ts';

export const APP = 'bookstation';

export function exportar(dados: Dados, agora: number): string {
  return JSON.stringify({ app: APP, tipo: 'tudo', exportadoEm: new Date(agora).toISOString(), dados }, null, 1);
}

export function exportarLivro(livro: Livro, d: Pick<Dados, 'capitulos' | 'cenas' | 'ideias' | 'rascunhos'>, agora: number): string {
  const doLivro = <T extends { livroId: string | null }>(xs: T[]) => xs.filter((x) => x.livroId === livro.id);
  return JSON.stringify({ app: APP, tipo: 'livro', exportadoEm: new Date(agora).toISOString(), livro, capitulos: doLivro(d.capitulos).filter((c) => c.excluidoEm === null), cenas: doLivro(d.cenas), ideias: doLivro(d.ideias), rascunhos: doLivro(d.rascunhos) }, null, 1);
}

export interface PacoteLivro { livro: Livro; capitulos: Capitulo[]; cenas: Cena[]; ideias: Ideia[]; rascunhos: Rascunho[] }
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
    const d = normalize({ livros: [livro], capitulos: r.capitulos, cenas: r.cenas, ideias: r.ideias, rascunhos: r.rascunhos }, agora);
    return { tipo: 'livro', livro, capitulos: d.capitulos, cenas: d.cenas, ideias: d.ideias, rascunhos: d.rascunhos };
  }
  return { tipo: 'tudo', dados: normalize(r.dados, agora) };
}

/** Junta um livro importado (com capítulos, ideias e rascunhos) sem apagar nada: entra sempre com ids novos. */
export function juntarLivro(dados: Dados, p: PacoteLivro, novoId: () => string): Dados {
  const id = novoId();
  const capIds = new Map(p.capitulos.map((c) => [c.id, novoId()]));
  const mapaCap = new Map([...capIds].map(([a, b]) => [a, b]));
  const estrutura = Object.fromEntries(Object.entries(p.livro.estrutura).map(([k, v]) => [k, v.map((c) => mapaCap.get(c)).filter((c): c is string => !!c)]));
  return {
    ...dados,
    livros: [{ ...p.livro, id, estrutura, excluidoEm: null }, ...dados.livros],
    cenas: [...dados.cenas, ...p.cenas.filter((c) => capIds.has(c.capituloId)).map((c) => ({ ...c, id: novoId(), livroId: id, capituloId: capIds.get(c.capituloId)! }))],
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

/** Copia o conteúdo de um livro para outro (duplicar livro): capítulos, cenas e a estrutura. */
export function copiarConteudo(dados: Dados, de: string, para: string, novoId: () => string, agora: number): Pick<Dados, 'capitulos' | 'cenas'> & { estrutura: Record<string, string[]> } {
  const caps = dados.capitulos.filter((c) => c.livroId === de && c.excluidoEm === null);
  const ids = new Map(caps.map((c) => [c.id, novoId()]));
  const livro = dados.livros.find((l) => l.id === de);
  return {
    capitulos: [...dados.capitulos, ...caps.map((c) => ({ ...c, id: ids.get(c.id)!, livroId: para, criadoEm: agora, editadoEm: agora }))],
    cenas: [...dados.cenas, ...dados.cenas.filter((c) => ids.has(c.capituloId)).map((c) => ({ ...c, id: novoId(), livroId: para, capituloId: ids.get(c.capituloId)!, criadoEm: agora, editadoEm: agora }))],
    estrutura: Object.fromEntries(Object.entries(livro?.estrutura ?? {}).map(([k, v]) => [k, v.map((c) => ids.get(c)).filter((c): c is string => !!c)])),
  };
}
