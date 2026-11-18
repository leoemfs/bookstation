/** Regras dos capítulos: criar, listar na ordem, salvar o texto, e o que acontece com eles quando o livro muda. */
import type { Capitulo, Doc } from './data.ts';

const ordenar = (cs: Capitulo[]) => cs.sort((a, b) => a.ordem - b.ordem || a.criadoEm - b.criadoEm);

/** Capítulos do livro na ordem (sem arquivados nem os da lixeira): é o que conta na numeração. */
export function doLivro(caps: Capitulo[], livroId: string): Capitulo[] {
  return ordenar(caps.filter((c) => c.livroId === livroId && !c.arquivado && c.excluidoEm === null));
}

/** Todos os capítulos do livro fora da lixeira (inclui arquivados). */
export function todosDoLivro(caps: Capitulo[], livroId: string): Capitulo[] {
  return ordenar(caps.filter((c) => c.livroId === livroId && c.excluidoEm === null));
}

/** Número do capítulo = posição no livro (1, 2, 3…). */
export function numero(caps: Capitulo[], cap: Capitulo): number {
  return doLivro(caps, cap.livroId).findIndex((c) => c.id === cap.id) + 1;
}

export function novoCapitulo(caps: Capitulo[], livroId: string, agora: number, id: string, titulo = ''): Capitulo {
  const ordens = caps.filter((c) => c.livroId === livroId).map((c) => c.ordem);
  return { id, livroId, ordem: ordens.length ? Math.max(...ordens) + 1 : 1, titulo, situacao: 'escrita', conteudo: null, palavras: 0, caracteres: 0, trecho: '', resumo: '', objetivo: '', arquivado: false, excluidoEm: null, criadoEm: agora, editadoEm: agora };
}

/** Sobe (-1) ou desce (+1) um capítulo na ordem; a numeração acompanha. */
export function mover(caps: Capitulo[], id: string, delta: -1 | 1): Capitulo[] {
  const c = caps.find((x) => x.id === id);
  if (!c) return caps;
  const lista = doLivro(caps, c.livroId);
  const i = lista.findIndex((x) => x.id === id), j = i + delta;
  if (j < 0 || j >= lista.length) return caps;
  [lista[i], lista[j]] = [lista[j], lista[i]];
  const nova = new Map(lista.map((x, k) => [x.id, k + 1]));
  return caps.map((x) => (nova.has(x.id) ? { ...x, ordem: nova.get(x.id)! } : x));
}

/** Duplica um capítulo logo depois dele. */
export function duplicarCapitulo(caps: Capitulo[], id: string, agora: number, novo: string): Capitulo[] {
  const c = caps.find((x) => x.id === id);
  if (!c) return caps;
  const copia: Capitulo = { ...c, id: novo, titulo: c.titulo ? `${c.titulo} (cópia)` : '(cópia)', ordem: c.ordem + 0.5, arquivado: false, excluidoEm: null, criadoEm: agora, editadoEm: agora };
  const lista = [...doLivro(caps, c.livroId), copia].sort((a, b) => a.ordem - b.ordem);
  const nova = new Map(lista.map((x, k) => [x.id, k + 1]));
  return [...caps, copia].map((x) => (nova.has(x.id) ? { ...x, ordem: nova.get(x.id)! } : x));
}

export const atualizarCap = (caps: Capitulo[], id: string, patch: Partial<Capitulo>, agora: number) => caps.map((c) => (c.id === id ? { ...c, ...patch, editadoEm: agora } : c));
export const capParaLixeira = (caps: Capitulo[], id: string, agora: number) => caps.map((c) => (c.id === id ? { ...c, excluidoEm: agora } : c));
export const capRestaurar = (caps: Capitulo[], id: string) => caps.map((c) => (c.id === id ? { ...c, excluidoEm: null } : c));
export const capsNaLixeira = (caps: Capitulo[]) => caps.filter((c) => c.excluidoEm !== null).sort((a, b) => (b.excluidoEm ?? 0) - (a.excluidoEm ?? 0));

/** Tira da lixeira os capítulos que passaram de 30 dias. */
export function limparCapsLixeira(caps: Capitulo[], agora: number): Capitulo[] {
  return caps.filter((c) => c.excluidoEm === null || agora - c.excluidoEm < 30 * 86_400_000);
}

/** O capítulo editado por último (para "Continuar escrevendo"). */
export function ultimoEditado(caps: Capitulo[], livroId: string): Capitulo | null {
  return doLivro(caps, livroId).reduce<Capitulo | null>((m, c) => (!m || c.editadoEm > m.editadoEm ? c : m), null);
}

export function salvarTexto(caps: Capitulo[], id: string, conteudo: Doc, texto: string, agora: number): Capitulo[] {
  const { palavras, caracteres } = contar(texto);
  return caps.map((c) => (c.id === id ? { ...c, conteudo, palavras, caracteres, trecho: trecho(texto), editadoEm: agora } : c));
}

export function totais(caps: Capitulo[], livroId: string): { capitulos: number; palavras: number } {
  const l = doLivro(caps, livroId);
  return { capitulos: l.length, palavras: l.reduce((s, c) => s + c.palavras, 0) };
}

/** Conta palavras e caracteres como um leitor contaria: travessão e pontuação soltos não são palavras. */
export function contar(texto: string): { palavras: number; caracteres: number } {
  const t = texto.replace(/\s+/g, ' ').trim();
  const palavras = t ? t.split(' ').filter((w) => /[\p{L}\p{N}]/u.test(w)).length : 0;
  return { palavras, caracteres: [...texto.replace(/\n/g, '')].length };
}

/** As últimas palavras do texto, cortadas no começo de uma palavra. */
export function trecho(texto: string, max = 70): string {
  const t = texto.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const fim = t.slice(-max);
  const i = fim.indexOf(' ');
  return '…' + (i >= 0 ? fim.slice(i + 1) : fim);
}

/** Copia os capítulos de um livro para outro (duplicar livro, importar livro). */
export function copiarCapitulos(caps: Capitulo[], deLivro: string, paraLivro: string, novoId: () => string, agora?: number): Capitulo[] {
  return todosDoLivro(caps, deLivro).map((c) => ({ ...c, id: novoId(), livroId: paraLivro, ...(agora ? { criadoEm: agora, editadoEm: agora } : {}) }));
}

/** Tira os capítulos de livros que não existem mais. */
export function semOrfaos(caps: Capitulo[], livroIds: Set<string>): Capitulo[] {
  return caps.filter((c) => livroIds.has(c.livroId));
}
