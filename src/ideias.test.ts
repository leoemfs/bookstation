import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filtrarIdeias, filtrarRascunhos, ideiaParaRascunho, juntarDocs, novaIdeia, novoRascunho, tagsEmUso, textoDoc, textoParaDoc } from './ideias.ts';
import { montarTextoIA } from './ia.ts';
import { normalize, type Doc } from './data.ts';
import { novoLivro } from './livros.ts';
import { novoCapitulo } from './capitulos.ts';

const T0 = Date.UTC(2026, 10, 19, 12);
const p = (t: string): Doc => ({ type: 'paragraph', content: [{ type: 'text', text: t }] });

test('ideias: filtro por livro, tag e arquivadas; mais nova primeiro', () => {
  const is = [novaIdeia(' frase ', 'L', ['Frase'], T0, 'a'), novaIdeia('cena', 'L', ['Cena', 'Cocriação IA'], T0 + 1, 'b'), novaIdeia('solta', null, [], T0, 'c'), { ...novaIdeia('velha', 'L', [], T0, 'd'), arquivada: true }];
  assert.equal(is[0].texto, 'frase');
  assert.deepEqual(filtrarIdeias(is, 'L', { tag: null, arquivadas: false }).map((i) => i.id), ['b', 'a']);
  assert.deepEqual(filtrarIdeias(is, 'L', { tag: 'Cocriação IA', arquivadas: false }).map((i) => i.id), ['b']);
  assert.deepEqual(filtrarIdeias(is, null, { tag: null, arquivadas: false }).map((i) => i.id), ['c']);
  assert.deepEqual(filtrarIdeias(is, 'L', { tag: null, arquivadas: true }).map((i) => i.id), ['d']);
  assert.deepEqual(tagsEmUso([{ tags: ['Zebra', 'Cena'] }, { tags: ['Árvore'] }]).slice(-2), ['Árvore', 'Zebra']);
});

test('ideia vira rascunho com o texto e as tags', () => {
  const r = ideiaParaRascunho(novaIdeia('E se o Tomé for filho do antigo faroleiro? Pedir à IA três jeitos de revelar.', 'L', ['Cocriação IA'], T0, 'i'), 'L', T0, 'r');
  assert.ok(r.titulo.endsWith('…'));
  assert.deepEqual(r.tags, ['Cocriação IA']);
  assert.equal(r.palavras, 16);
  assert.equal(textoDoc(r.conteudo).startsWith('E se o Tomé'), true);
});

test('rascunhos: filtros sem capítulo e por tag', () => {
  const rs = [novoRascunho('L', T0, 'a', { capituloId: 'c1' }), novoRascunho('L', T0 + 5, 'b', { tags: ['Diálogo'] }), novoRascunho('M', T0, 'm')];
  assert.deepEqual(filtrarRascunhos(rs, 'L', 'todos').map((r) => r.id), ['b', 'a']);
  assert.deepEqual(filtrarRascunhos(rs, 'L', 'sem-capitulo').map((r) => r.id), ['b']);
  assert.deepEqual(filtrarRascunhos(rs, 'L', { tag: 'Diálogo' }).map((r) => r.id), ['b']);
});

test('texto colado vira parágrafos e volta igual', () => {
  const d = textoParaDoc('Primeira linha\r\n\n  Segunda  \n');
  assert.equal(d.content!.length, 2);
  assert.equal(textoDoc(d), 'Primeira linha\nSegunda');
  assert.equal(textoParaDoc('   ').content![0].type, 'paragraph');
  assert.equal(textoDoc({ type: 'doc', content: [{ type: 'orderedList', content: [{ type: 'listItem', content: [p('um')] }, { type: 'listItem', content: [p('dois')] }] }, { type: 'horizontalRule' }] }), '1. um\n2. dois\n⁂');
});

test('transferir rascunho: no fim com separador, no início, capítulo vazio', () => {
  const cap: Doc = { type: 'doc', content: [p('A')] };
  const r: Doc = { type: 'doc', content: [p('B')] };
  assert.equal(textoDoc(juntarDocs(cap, r, 'fim')), 'A\n⁂\nB');
  assert.equal(textoDoc(juntarDocs(cap, r, 'inicio')), 'B\n⁂\nA');
  assert.equal(textoDoc(juntarDocs({ type: 'doc', content: [{ type: 'paragraph' }] }, r, 'fim')), 'B');
  assert.equal(textoDoc(juntarDocs(null, r, 'fim')), 'B');
});

test('copiar para IA: pedido, livro, ideias, capítulos e rascunho', () => {
  const livro = { ...novoLivro({ titulo: 'A Estação das Marés', generos: ['Fantasia'], descricao: 'O mar recua.', roteiro: 'tres-atos' }, T0, 'L') };
  const cap = { ...novoCapitulo([], 'L', T0, 'c', 'A maré'), conteudo: { type: 'doc', content: [p('Naquela manhã o mar não voltou.')] } };
  const t = montarTextoIA({ livro, capitulos: [{ cap, numero: 7 }], ideias: [novaIdeia('E se o Tomé…', 'L', [], T0, 'i')], pedido: 'coerencia', incluirLivro: true, rascunho: novoRascunho('L', T0, 'r', { titulo: 'Final', conteudo: textoParaDoc('Outro final.') }) });
  assert.match(t, /^Analise a COERÊNCIA/);
  assert.match(t, /# Livro: A Estação das Marés\nGênero: Fantasia\nSobre: O mar recua\.\nEstrutura: Três atos/);
  assert.match(t, /## Ideias para considerar\n- E se o Tomé…/);
  assert.match(t, /## Capítulo 7 · A maré\nNaquela manhã o mar não voltou\./);
  assert.match(t, /## Rascunho: Final\nOutro final\./);
  const livre = montarTextoIA({ livro, capitulos: [], pedido: 'livre', pedidoLivre: '  Quero 3 finais.  ', incluirLivro: false });
  assert.equal(livre, 'Quero 3 finais.\n');
});

test('normalize: ideias e rascunhos de livro apagado somem; vínculo quebrado vira sem capítulo', () => {
  const d = normalize({
    livros: [{ id: 'L' }],
    capitulos: [{ id: 'c', livroId: 'L' }],
    ideias: [{ id: 'a', livroId: 'L', texto: 'x' }, { id: 'b', livroId: 'Z', texto: 'y' }, { id: 'c', livroId: null, texto: 'solta' }, { id: 'd', texto: '  ' }],
    rascunhos: [{ id: 'r', livroId: 'L', capituloId: 'c' }, { id: 's', livroId: 'L', capituloId: 'nada' }, { id: 't', livroId: 'Z' }],
  }, T0);
  assert.deepEqual(d.ideias.map((i) => [i.id, i.livroId]), [['a', 'L'], ['c', null]]);
  assert.deepEqual(d.rascunhos.map((r) => [r.id, r.capituloId]), [['r', 'c'], ['s', null]]);
});
