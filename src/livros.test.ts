import { test } from 'node:test';
import assert from 'node:assert/strict';
import { novoLivro, filtrar, ordenar, contagens, atualizar, duplicar, paraLixeira, restaurar, excluirDeVez, naLixeira, diasRestantes, limparLixeira, quando } from './livros.ts';

const DIA = 86_400_000;
const T0 = Date.UTC(2026, 10, 18, 12);
const base = () => [
  novoLivro({ titulo: 'A Estação das Marés', generos: ['Fantasia'], situacao: 'escrita' }, T0, 'a'),
  novoLivro({ titulo: 'Cartas para Ninguém', situacao: 'planejamento', descricao: 'Um carteiro aposentado' }, T0 + 1000, 'b'),
  novoLivro({ titulo: 'Último Inverno', situacao: 'revisao' }, T0 + 2000, 'c'),
];

test('novo livro: título vazio vira "Sem título" e começa fora da lixeira', () => {
  const l = novoLivro({ titulo: '   ' }, T0, 'x');
  assert.equal(l.titulo, 'Sem título');
  assert.equal(l.excluidoEm, null);
  assert.equal(l.arquivado, false);
  assert.equal(l.situacao, 'planejamento');
  assert.equal(l.roteiro, 'livre');
});

test('filtrar por situação, arquivados e busca sem acento', () => {
  let ls = base();
  ls = atualizar(ls, 'c', { arquivado: true }, T0);
  assert.deepEqual(filtrar(ls, 'todos').map((l) => l.id), ['a', 'b']);
  assert.deepEqual(filtrar(ls, 'arquivados').map((l) => l.id), ['c']);
  assert.deepEqual(filtrar(ls, 'escrita').map((l) => l.id), ['a']);
  assert.deepEqual(filtrar(ls, 'todos', 'estacao').map((l) => l.id), ['a']);
  assert.deepEqual(filtrar(ls, 'todos', 'CARTEIRO').map((l) => l.id), ['b']);
  assert.deepEqual(filtrar(ls, 'todos', 'fantasia').map((l) => l.id), ['a']);
});

test('lixeira some da Biblioteca e das contagens', () => {
  const ls = paraLixeira(base(), 'b', T0);
  assert.deepEqual(filtrar(ls, 'todos').map((l) => l.id), ['a', 'c']);
  const c = contagens(ls);
  assert.equal(c.todos, 2);
  assert.equal(c.planejamento, 0);
  assert.deepEqual(naLixeira(ls).map((l) => l.id), ['b']);
  assert.deepEqual(filtrar(restaurar(ls, 'b'), 'todos').map((l) => l.id), ['a', 'b', 'c']);
  assert.deepEqual(excluirDeVez(ls, 'b').map((l) => l.id), ['a', 'c']);
});

test('lixeira guarda por 30 dias', () => {
  const ls = paraLixeira(base(), 'a', T0);
  assert.equal(diasRestantes(ls[0], T0), 30);
  assert.equal(diasRestantes(ls[0], T0 + 29.5 * DIA), 1);
  assert.equal(limparLixeira(ls, T0 + 29 * DIA).length, 3);
  assert.equal(limparLixeira(ls, T0 + 30 * DIA).length, 2);
});

test('ordenar por edição, título e criação', () => {
  let ls = base();
  ls = atualizar(ls, 'a', { descricao: 'x' }, T0 + 9000);
  assert.deepEqual(ordenar(ls, 'edicao').map((l) => l.id), ['a', 'c', 'b']);
  assert.deepEqual(ordenar(ls, 'titulo').map((l) => l.id), ['a', 'b', 'c']);
  assert.deepEqual(ordenar(ls, 'criacao').map((l) => l.id), ['c', 'b', 'a']);
});

test('duplicar entra logo depois do original, como novo', () => {
  const ls = duplicar(paraLixeira(base(), 'z', T0), 'a', T0 + 5, 'a2');
  assert.deepEqual(ls.map((l) => l.id), ['a', 'a2', 'b', 'c']);
  assert.equal(ls[1].titulo, 'A Estação das Marés (cópia)');
  assert.equal(ls[1].criadoEm, T0 + 5);
});

test('quando: hoje, ontem e datas', () => {
  const agora = new Date(2026, 10, 18, 15, 0).getTime();
  assert.match(quando(new Date(2026, 10, 18, 9, 14).getTime(), agora), /^hoje, 09:14$/);
  assert.equal(quando(new Date(2026, 10, 17, 23, 0).getTime(), agora), 'ontem');
  assert.equal(quando(new Date(2026, 10, 2).getTime(), agora), '02/11');
  assert.equal(quando(new Date(2025, 0, 5).getTime(), agora), '05/01/2025');
});
