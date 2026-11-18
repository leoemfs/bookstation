/** Ideias (caixa de entrada) e rascunhos: regras sem tela. */
import type { Capitulo, Doc, Ideia, Rascunho } from './data.ts';
import { TAGS_PADRAO } from './data.ts';
import { contar } from './capitulos.ts';

export function novaIdeia(texto: string, livroId: string | null, tags: string[], agora: number, id: string): Ideia {
  return { id, livroId, texto: texto.trim(), tags: [...new Set(tags)], arquivada: false, criadoEm: agora };
}

export type FiltroIdeia = { tag: string | null; arquivadas: boolean };
export function filtrarIdeias(ideias: Ideia[], livroId: string | null, f: FiltroIdeia): Ideia[] {
  return ideias
    .filter((i) => i.livroId === livroId && i.arquivada === f.arquivadas && (!f.tag || i.tags.includes(f.tag)))
    .sort((a, b) => b.criadoEm - a.criadoEm);
}

/** Tags para os chips: as padrão primeiro, depois as que a pessoa criou. */
export function tagsEmUso(itens: { tags: string[] }[]): string[] {
  const proprias = new Set<string>();
  for (const i of itens) for (const t of i.tags) if (!TAGS_PADRAO.includes(t)) proprias.add(t);
  return [...TAGS_PADRAO, ...[...proprias].sort((a, b) => a.localeCompare(b, 'pt-BR'))];
}

export function novoRascunho(livroId: string, agora: number, id: string, e: Partial<Pick<Rascunho, 'titulo' | 'conteudo' | 'tags' | 'capituloId'>> = {}): Rascunho {
  const conteudo = e.conteudo ?? null;
  return { id, livroId, titulo: e.titulo ?? '', conteudo, tags: e.tags ?? [], capituloId: e.capituloId ?? null, palavras: contar(textoDoc(conteudo)).palavras, criadoEm: agora, editadoEm: agora };
}

/** Ideia virou rascunho: o texto da ideia é o começo do rascunho. */
export function ideiaParaRascunho(ideia: Ideia, livroId: string, agora: number, id: string): Rascunho {
  const titulo = ideia.texto.length > 48 ? ideia.texto.slice(0, 45).trimEnd() + '…' : ideia.texto;
  return novoRascunho(livroId, agora, id, { titulo, conteudo: textoParaDoc(ideia.texto), tags: ideia.tags });
}

export type FiltroRascunho = 'todos' | 'sem-capitulo' | { tag: string };
export function filtrarRascunhos(rs: Rascunho[], livroId: string, f: FiltroRascunho): Rascunho[] {
  return rs
    .filter((r) => r.livroId === livroId && (f === 'todos' || (f === 'sem-capitulo' ? !r.capituloId : r.tags.includes(f.tag))))
    .sort((a, b) => b.editadoEm - a.editadoEm);
}

/** Texto colado (resposta da IA, ideia) vira documento: cada linha não vazia é um parágrafo. */
export function textoParaDoc(texto: string): Doc {
  const linhas = texto.replace(/\r/g, '').split('\n').map((l) => l.trim()).filter(Boolean);
  return { type: 'doc', content: linhas.length ? linhas.map((l) => ({ type: 'paragraph', content: [{ type: 'text', text: l }] })) : [{ type: 'paragraph' }] };
}

/** Texto simples de um documento (um bloco por linha; separador vira ⁂). */
export function textoDoc(doc: Doc | null): string {
  if (!doc) return '';
  const blocos: string[] = [];
  const andar = (n: Doc, buf: string[]) => {
    if (n.text) buf.push(n.text);
    for (const c of n.content ?? []) andar(c, buf);
  };
  for (const b of doc.content ?? []) {
    if (b.type === 'horizontalRule') { blocos.push('⁂'); continue; }
    if (b.type === 'bulletList' || b.type === 'orderedList') {
      (b.content ?? []).forEach((item, i) => { const buf: string[] = []; andar(item, buf); blocos.push(`${b.type === 'orderedList' ? `${i + 1}.` : '•'} ${buf.join('')}`); });
      continue;
    }
    const buf: string[] = [];
    andar(b, buf);
    blocos.push(buf.join(''));
  }
  return blocos.join('\n');
}

/** Junta o texto de um rascunho ao capítulo: no fim (com separador) ou no início. */
export function juntarDocs(cap: Doc | null, extra: Doc | null, onde: 'fim' | 'inicio'): Doc {
  const a = (cap?.content ?? []).filter((n) => !(n.type === 'paragraph' && !n.content?.length));
  const b = extra?.content ?? [];
  if (!a.length) return { type: 'doc', content: b.length ? b : [{ type: 'paragraph' }] };
  if (!b.length) return { type: 'doc', content: a };
  const sep = { type: 'horizontalRule' };
  return { type: 'doc', content: onde === 'fim' ? [...a, sep, ...b] : [...b, sep, ...a] };
}

/** Capítulo que um rascunho ainda pode ligar (do mesmo livro). */
export const capitulosDoLivro = (caps: Capitulo[], livroId: string) => caps.filter((c) => c.livroId === livroId);
