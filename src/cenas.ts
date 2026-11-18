/** Cenas: planejamento dentro do capítulo (opcional). */
import { PERGUNTAS_CENA, type Cena } from './data.ts';

export function doCapitulo(cenas: Cena[], capituloId: string): Cena[] {
  return cenas.filter((c) => c.capituloId === capituloId).sort((a, b) => a.ordem - b.ordem || a.criadoEm - b.criadoEm);
}

export function novaCena(cenas: Cena[], livroId: string, capituloId: string, agora: number, id: string, titulo = ''): Cena {
  const ordens = cenas.filter((c) => c.capituloId === capituloId).map((c) => c.ordem);
  return { id, livroId, capituloId, ordem: ordens.length ? Math.max(...ordens) + 1 : 1, titulo, momento: '', clima: '', resumo: '', perguntas: PERGUNTAS_CENA.map(() => ''), mostrarModelo: true, criadoEm: agora, editadoEm: agora };
}

export function moverCena(cenas: Cena[], id: string, delta: -1 | 1): Cena[] {
  const c = cenas.find((x) => x.id === id);
  if (!c) return cenas;
  const lista = doCapitulo(cenas, c.capituloId);
  const i = lista.findIndex((x) => x.id === id), j = i + delta;
  if (j < 0 || j >= lista.length) return cenas;
  [lista[i], lista[j]] = [lista[j], lista[i]];
  const nova = new Map(lista.map((x, k) => [x.id, k + 1]));
  return cenas.map((x) => (nova.has(x.id) ? { ...x, ordem: nova.get(x.id)! } : x));
}

export const atualizarCena = (cenas: Cena[], id: string, patch: Partial<Cena>, agora: number) => cenas.map((c) => (c.id === id ? { ...c, ...patch, editadoEm: agora } : c));

/** Quantas das 6 perguntas foram respondidas. */
export const respondidas = (c: Cena) => c.perguntas.filter((p) => p.trim()).length;

/** Copia as cenas de um capítulo para outro (duplicar capítulo). */
export function copiarCenas(cenas: Cena[], de: string, para: string, livroId: string, agora: number, novoId: () => string): Cena[] {
  return doCapitulo(cenas, de).map((c) => ({ ...c, id: novoId(), capituloId: para, livroId, criadoEm: agora, editadoEm: agora }));
}
