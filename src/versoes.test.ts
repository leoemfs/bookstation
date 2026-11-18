import { test } from 'node:test';
import assert from 'node:assert/strict';
import { antesDeRestaurar, doCapitulo, guardarComNome, INTERVALO_AUTO, MAX_AUTO, registrarAuto, semOrfas, textoDe, type Versao } from './versoes.ts';
import { encontrar } from './busca.ts';
import type { Capitulo, Doc } from './data.ts';

const T0 = Date.UTC(2026, 10, 19, 10);
const doc = (t: string): Doc => ({ type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: t }] }] });
const cap = (t: string, extra: Partial<Capitulo> = {}): Capitulo => ({ id: 'c', livroId: 'L', ordem: 1, titulo: '', situacao: 'escrita', conteudo: doc(t), palavras: t.split(' ').length, caracteres: t.length, trecho: '', criadoEm: T0, editadoEm: T0, ...extra });

test('cópia automática: só se mudou e passou meia hora', () => {
  let vs: Versao[] = [];
  vs = registrarAuto(vs, cap('um texto'), T0, 'v1');
  assert.equal(vs.length, 1);
  assert.equal(registrarAuto(vs, cap('outro texto'), T0 + 60_000, 'v2').length, 1, 'menos de 30 min');
  assert.equal(registrarAuto(vs, cap('um texto'), T0 + INTERVALO_AUTO + 1, 'v2').length, 1, 'texto igual');
  assert.equal(registrarAuto(vs, cap('outro texto'), T0 + INTERVALO_AUTO + 1, 'v2').length, 2);
  assert.equal(registrarAuto([], cap('', { conteudo: null, palavras: 0 }), T0, 'x').length, 0, 'capítulo vazio');
});

test('guarda no máximo 20 automáticas; as com nome ficam sempre', () => {
  let vs: Versao[] = guardarComNome([], cap('primeiro'), 'Antes da revisão', T0, 'n1');
  for (let i = 0; i < MAX_AUTO + 5; i++) vs = registrarAuto(vs, cap('texto ' + i), T0 + (i + 1) * (INTERVALO_AUTO + 1), 'a' + i);
  const lista = doCapitulo(vs, 'c');
  assert.equal(lista.filter((v) => !v.nome).length, MAX_AUTO);
  assert.ok(lista.some((v) => v.nome === 'Antes da revisão'));
  assert.equal(lista[0].id, 'a' + (MAX_AUTO + 4), 'mais nova primeiro');
});

test('restaurar guarda o atual antes; versões de capítulo apagado saem', () => {
  const vs = antesDeRestaurar([], cap('atual'), T0, 'r1');
  assert.equal(vs[0].nome, 'Antes de restaurar');
  assert.equal(semOrfas(vs, new Set(['outro'])).length, 0);
  assert.equal(guardarComNome([], cap('x'), '  ', T0, 'k')[0].nome, 'Versão sem nome');
});

test('texto de uma versão', () => {
  const d: Doc = { type: 'doc', content: [doc('Um').content![0], { type: 'horizontalRule' }, { type: 'paragraph', content: [{ type: 'text', text: 'Dois ' }, { type: 'text', text: 'três', marks: [{ type: 'bold' }] }] }] };
  assert.equal(textoDe(d), 'Um\n⁂\nDois três');
  assert.equal(textoDe(null), '');
});

test('busca sem acento e sem maiúscula', () => {
  assert.deepEqual(encontrar('A Estação das Marés, estacao!', 'estacao'), [[2, 9], [21, 28]]);
  assert.deepEqual(encontrar('MAR mar Mar', 'Már'), [[0, 3], [4, 7], [8, 11]]);
  assert.deepEqual(encontrar('aaa', 'aa'), [[0, 2]]);
  assert.deepEqual(encontrar('texto', '  '), []);
  assert.deepEqual(encontrar('😀 mar', 'mar'), [[3, 6]]);
});
