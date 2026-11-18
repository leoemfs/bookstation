/** Histórico de versões dos capítulos: cópias automáticas, versões com nome e restaurar sem perder nada. */
import type { Capitulo, Doc } from './data.ts';

export interface Versao {
  id: string;
  capId: string;
  livroId: string;
  quando: number;
  /** Vazio = cópia automática. */
  nome: string;
  conteudo: Doc;
  palavras: number;
}

export const INTERVALO_AUTO = 30 * 60_000;
export const MAX_AUTO = 20;

export const doCapitulo = (vs: Versao[], capId: string) => vs.filter((v) => v.capId === capId).sort((a, b) => b.quando - a.quando);

const igual = (a: Doc | null, b: Doc | null) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Ao abrir o capítulo, guarda uma cópia automática do texto como estava,
 * se o texto mudou desde a última cópia e ela tem mais de 30 minutos. Mantém as 20 automáticas mais novas.
 */
export function registrarAuto(vs: Versao[], cap: Capitulo, agora: number, id: string): Versao[] {
  if (!cap.conteudo || cap.palavras === 0) return vs;
  const doCap = doCapitulo(vs, cap.id);
  const ultima = doCap[0];
  if (ultima && (agora - ultima.quando < INTERVALO_AUTO || igual(ultima.conteudo, cap.conteudo))) return vs;
  const nova: Versao = { id, capId: cap.id, livroId: cap.livroId, quando: agora, nome: '', conteudo: cap.conteudo, palavras: cap.palavras };
  const autos = [nova, ...doCap.filter((v) => !v.nome)];
  const sobra = new Set(autos.slice(MAX_AUTO).map((v) => v.id));
  return [...vs.filter((v) => !sobra.has(v.id)), nova];
}

/** Guarda o texto atual como versão com nome (essas nunca saem sozinhas). */
export function guardarComNome(vs: Versao[], cap: Capitulo, nome: string, agora: number, id: string): Versao[] {
  if (!cap.conteudo) return vs;
  return [...vs, { id, capId: cap.id, livroId: cap.livroId, quando: agora, nome: nome.trim() || 'Versão sem nome', conteudo: cap.conteudo, palavras: cap.palavras }];
}

/** Antes de restaurar, o texto atual vira a versão "Antes de restaurar" (assim nada se perde). */
export function antesDeRestaurar(vs: Versao[], cap: Capitulo, agora: number, id: string): Versao[] {
  return cap.conteudo ? guardarComNome(vs, cap, 'Antes de restaurar', agora, id) : vs;
}

/** Tira versões de capítulos que não existem mais. */
export function semOrfas(vs: Versao[], capIds: Set<string>): Versao[] {
  return vs.filter((v) => capIds.has(v.capId));
}

/** Texto simples de um documento (para ver a versão). */
export function textoDe(doc: Doc | null): string {
  if (!doc) return '';
  const blocos: string[] = [];
  const andar = (n: Doc, buf: string[]) => {
    if (n.text) buf.push(n.text);
    for (const c of n.content ?? []) andar(c, buf);
  };
  for (const b of doc.content ?? []) {
    if (b.type === 'horizontalRule') { blocos.push('⁂'); continue; }
    const buf: string[] = [];
    andar(b, buf);
    blocos.push(buf.join(''));
  }
  return blocos.join('\n');
}
