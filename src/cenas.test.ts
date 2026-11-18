import { test } from 'node:test';
import assert from 'node:assert/strict';
import { capParaLixeira, capRestaurar, capsNaLixeira, doLivro, duplicarCapitulo, limparCapsLixeira, mover, novoCapitulo, numero, todosDoLivro } from './capitulos.ts';
import { copiarCenas, doCapitulo, moverCena, novaCena, respondidas } from './cenas.ts';
import { normalize } from './data.ts';

const T0 = Date.UTC(2026, 10, 20);
function tres() {
  let cs = [novoCapitulo([], 'L', T0, 'a', 'Um')];
  cs = [...cs, novoCapitulo(cs, 'L', T0, 'b', 'Dois')];
  return [...cs, novoCapitulo(cs, 'L', T0, 'c', 'Três')];
}

test('reordenar: sobe e desce, numeração acompanha, nas pontas não faz nada', () => {
  let cs = mover(tres(), 'c', -1);
  assert.deepEqual(doLivro(cs, 'L').map((c) => c.id), ['a', 'c', 'b']);
  assert.equal(numero(cs, cs.find((c) => c.id === 'c')!), 2);
  cs = mover(cs, 'a', -1);
  assert.deepEqual(doLivro(cs, 'L').map((c) => c.id), ['a', 'c', 'b']);
  cs = mover(cs, 'b', 1);
  assert.deepEqual(doLivro(cs, 'L').map((c) => c.id), ['a', 'c', 'b']);
});

test('arquivado e lixeira saem da numeração; recuperar volta', () => {
  let cs = tres().map((c) => (c.id === 'a' ? { ...c, arquivado: true } : c));
  assert.deepEqual(doLivro(cs, 'L').map((c) => c.id), ['b', 'c']);
  assert.equal(numero(cs, cs.find((c) => c.id === 'b')!), 1);
  assert.equal(todosDoLivro(cs, 'L').length, 3);
  cs = capParaLixeira(cs, 'b', T0);
  assert.deepEqual(doLivro(cs, 'L').map((c) => c.id), ['c']);
  assert.deepEqual(capsNaLixeira(cs).map((c) => c.id), ['b']);
  assert.deepEqual(doLivro(capRestaurar(cs, 'b'), 'L').map((c) => c.id), ['b', 'c']);
  assert.equal(limparCapsLixeira(cs, T0 + 31 * 86_400_000).length, 2);
});

test('novo capítulo depois de um arquivado não repete a ordem', () => {
  const cs = tres().map((c) => (c.id === 'c' ? { ...c, arquivado: true } : c));
  const d = novoCapitulo(cs, 'L', T0, 'd');
  assert.equal(d.ordem, 4);
});

test('duplicar capítulo entra logo depois', () => {
  const cs = duplicarCapitulo(tres(), 'a', T0 + 1, 'a2');
  assert.deepEqual(doLivro(cs, 'L').map((c) => [c.id, c.titulo]), [['a', 'Um'], ['a2', 'Um (cópia)'], ['b', 'Dois'], ['c', 'Três']]);
});

test('cenas: ordem, mover, respondidas e copiar', () => {
  let ce = [novaCena([], 'L', 'a', T0, 's1', 'Chegada')];
  ce = [...ce, novaCena(ce, 'L', 'a', T0, 's2', 'Noite'), novaCena(ce, 'L', 'b', T0, 'x')];
  assert.deepEqual(doCapitulo(ce, 'a').map((c) => c.id), ['s1', 's2']);
  ce = moverCena(ce, 's2', -1);
  assert.deepEqual(doCapitulo(ce, 'a').map((c) => c.id), ['s2', 's1']);
  assert.equal(respondidas({ ...ce[0], perguntas: ['No cais', '', ' ', 'Medo', '', ''] }), 2);
  let n = 0;
  assert.deepEqual(copiarCenas(ce, 'a', 'z', 'L', T0, () => 'k' + ++n).map((c) => [c.id, c.capituloId, c.titulo]), [['k1', 'z', 'Noite'], ['k2', 'z', 'Chegada']]);
});

test('normalize: cenas de capítulo que não existe somem; estrutura do livro', () => {
  const d = normalize({ livros: [{ id: 'L', estrutura: { Clímax: ['a', 3], x: 'nada' } }], capitulos: [{ id: 'a', livroId: 'L' }], cenas: [{ id: 's', capituloId: 'a', perguntas: ['onde'] }, { id: 't', capituloId: 'zz' }] }, T0);
  assert.deepEqual(d.cenas.map((c) => [c.id, c.livroId, c.perguntas.length, c.perguntas[0]]), [['s', 'L', 6, 'onde']]);
  assert.deepEqual(d.livros[0].estrutura, { Clímax: ['a'] });
  assert.equal(d.capitulos[0].arquivado, false);
  assert.equal(d.capitulos[0].excluidoEm, null);
});
