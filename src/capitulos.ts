/** Regras dos capítulos: criar, listar na ordem, salvar o texto, e o que acontece com eles quando o livro muda. */
import type { Capitulo, Doc } from './data.ts';

export function doLivro(caps: Capitulo[], livroId: string): Capitulo[] {
  return caps.filter((c) => c.livroId === livroId).sort((a, b) => a.ordem - b.ordem || a.criadoEm - b.criadoEm);
}

/** Número do capítulo = posição no livro (1, 2, 3…). */
export function numero(caps: Capitulo[], cap: Capitulo): number {
  return doLivro(caps, cap.livroId).findIndex((c) => c.id === cap.id) + 1;
}

export function novoCapitulo(caps: Capitulo[], livroId: string, agora: number, id: string, titulo = ''): Capitulo {
  const ultimos = doLivro(caps, livroId);
  return { id, livroId, ordem: ultimos.length ? ultimos[ultimos.length - 1].ordem + 1 : 1, titulo, situacao: 'escrita', conteudo: null, palavras: 0, caracteres: 0, trecho: '', criadoEm: agora, editadoEm: agora };
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
  return doLivro(caps, deLivro).map((c) => ({ ...c, id: novoId(), livroId: paraLivro, ...(agora ? { criadoEm: agora, editadoEm: agora } : {}) }));
}

/** Tira os capítulos de livros que não existem mais. */
export function semOrfaos(caps: Capitulo[], livroIds: Set<string>): Capitulo[] {
  return caps.filter((c) => livroIds.has(c.livroId));
}
