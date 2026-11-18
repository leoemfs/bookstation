import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contar, copiarCapitulos, doLivro, novoCapitulo, numero, salvarTexto, semOrfaos, totais, trecho, ultimoEditado } from './capitulos.ts';

const T0 = Date.UTC(2026, 10, 19);

test('contar palavras: travessão e pontuação soltos não contam', () => {
  assert.deepEqual(contar(''), { palavras: 0, caracteres: 0 });
  assert.equal(contar('— Não estou olhando — disse Iracema.').palavras, 5);
  assert.equal(contar('Guarda-chuva verde, 3 vezes!').palavras, 4);
  assert.equal(contar('  Linha um\nlinha   dois ').palavras, 4);
  assert.equal(contar('Ação').caracteres, 4);
});

test('trecho: últimas palavras, cortando no começo de uma palavra', () => {
  assert.equal(trecho('curto'), 'curto');
  const t = trecho('Naquela manhã o mar não voltou. Iracema contou as estacas do cais duas vezes, como quem conta os dedos.', 40);
  assert.ok(t.startsWith('…'));
  assert.ok(t.endsWith('os dedos.'));
  assert.ok(!t.slice(1).startsWith(' '));
});

test('novo capítulo vai para o fim, numerado pela posição', () => {
  let caps = [novoCapitulo([], 'L', T0, 'a')];
  caps = [...caps, novoCapitulo(caps, 'L', T0, 'b'), novoCapitulo(caps, 'M', T0, 'm')];
  caps = [...caps, novoCapitulo(caps, 'L', T0, 'c')];
  assert.deepEqual(doLivro(caps, 'L').map((c) => c.id), ['a', 'b', 'c']);
  assert.equal(numero(caps, caps.find((c) => c.id === 'c')!), 3);
  assert.equal(numero(caps, caps.find((c) => c.id === 'm')!), 1);
});

test('salvar texto atualiza contagem, trecho e data; último editado e totais', () => {
  let caps = [novoCapitulo([], 'L', T0, 'a'), { ...novoCapitulo([], 'L', T0, 'b'), ordem: 2 }];
  const doc = { type: 'doc', content: [] };
  caps = salvarTexto(caps, 'a', doc, 'O mar não voltou.', T0 + 5);
  caps = salvarTexto(caps, 'b', doc, 'Três palavras aqui', T0 + 2);
  assert.equal(caps[0].palavras, 4);
  assert.equal(caps[0].trecho, 'O mar não voltou.');
  assert.equal(ultimoEditado(caps, 'L')?.id, 'a');
  assert.deepEqual(totais(caps, 'L'), { capitulos: 2, palavras: 7 });
  assert.equal(ultimoEditado(caps, 'X'), null);
});

test('copiar capítulos para outro livro e tirar órfãos', () => {
  const caps = [novoCapitulo([], 'L', T0, 'a', 'Um')];
  let n = 0;
  const copia = copiarCapitulos(caps, 'L', 'N', () => 'k' + ++n, T0 + 9);
  assert.deepEqual(copia.map((c) => [c.id, c.livroId, c.titulo, c.criadoEm]), [['k1', 'N', 'Um', T0 + 9]]);
  assert.deepEqual(semOrfaos([...caps, ...copia], new Set(['N'])).map((c) => c.id), ['k1']);
});
