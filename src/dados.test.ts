import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalize, CAPAS } from './data.ts';
import { exportar, exportarLivro, importar, juntarLivro, nomeArquivo } from './backup.ts';
import { novoLivro } from './livros.ts';
import { novoCapitulo } from './capitulos.ts';
import { novaIdeia, novoRascunho } from './ideias.ts';
import { lerRota, hashDe, acima } from './router.ts';

const T0 = Date.UTC(2026, 10, 18);

test('normalize: dados vazios ou estranhos viram dados válidos', () => {
  for (const raw of [undefined, null, 42, 'x', { livros: 'nada' }]) {
    const d = normalize(raw, T0);
    assert.deepEqual(d.livros, []);
    assert.equal(d.ajustes.barraRecolhe, true);
    assert.equal(d.ajustes.tema, 'escuro');
  }
});

test('normalize: corrige campos, descarta sem id e repetidos', () => {
  const d = normalize({ livros: [{ id: 'a', titulo: '', capa: 99, situacao: 'xpto', capaImg: 'javascript:1' }, { titulo: 'sem id' }, { id: 'a', titulo: 'repetido' }], ajustes: { tema: 'claro' } }, T0);
  assert.equal(d.livros.length, 1);
  const l = d.livros[0];
  assert.equal(l.titulo, 'Sem título');
  assert.equal(l.capa, CAPAS.length - 1);
  assert.equal(l.situacao, 'planejamento');
  assert.equal(l.capaImg, null);
  assert.equal(l.criadoEm, T0);
  assert.equal(d.ajustes.tema, 'claro');
});

test('backup: exportar e importar devolve o mesmo', () => {
  const dados = normalize({ livros: [novoLivro({ titulo: 'Marés', generos: ['Fantasia'] }, T0, 'a')] }, T0);
  const r = importar(exportar(dados, T0), T0);
  assert.equal(r.tipo, 'tudo');
  if (r.tipo === 'tudo') assert.deepEqual(r.dados, dados);
});

test('backup: arquivo errado dá mensagem clara', () => {
  assert.throws(() => importar('{oi', T0), /não é um backup/);
  assert.throws(() => importar('{"app":"outro"}', T0), /não é um backup/);
  assert.throws(() => importar('{"app":"bookstation","tipo":"livro","livro":{}}', T0), /incompleto/);
});

test('backup de um livro: leva os capítulos e entra sem apagar nada', () => {
  const l = novoLivro({ titulo: 'Marés' }, T0, 'a');
  const outro = novoLivro({ titulo: 'Outro' }, T0, 'b');
  const caps = [novoCapitulo([], 'a', T0, 'c1', 'Abertura'), novoCapitulo([], 'b', T0, 'x1')];
  const ideias = [novaIdeia('ideia', 'a', [], T0, 'i1'), novaIdeia('outra', 'b', [], T0, 'i2')];
  const rascunhos = [novoRascunho('a', T0, 'r1', { capituloId: 'c1' })];
  const r = importar(exportarLivro(l, { capitulos: caps, cenas: [], ideias, rascunhos }, T0), T0);
  assert.equal(r.tipo, 'livro');
  if (r.tipo !== 'livro') return;
  assert.deepEqual(r.capitulos.map((c) => c.id), ['c1']);
  let n = 0;
  assert.deepEqual([r.ideias.length, r.rascunhos.length], [1, 1]);
  const d = juntarLivro(normalize({ livros: [l, outro], capitulos: caps }, T0), r, () => 'n' + ++n);
  assert.deepEqual(d.livros.map((x) => x.id), ['n1', 'a', 'b']);
  assert.deepEqual(d.capitulos.map((c) => [c.id, c.livroId, c.titulo]), [['c1', 'a', 'Abertura'], ['x1', 'b', ''], ['n2', 'n1', 'Abertura']]);
  assert.deepEqual(d.ideias.map((i) => i.livroId), ['n1']);
  assert.deepEqual(d.rascunhos.map((x) => [x.livroId, x.capituloId]), [['n1', 'n2']]);
});

test('normalize: capítulo sem livro some', () => {
  const d = normalize({ livros: [{ id: 'a' }], capitulos: [{ id: 'c', livroId: 'a' }, { id: 'd', livroId: 'zz' }, { id: 'e' }] }, T0);
  assert.deepEqual(d.capitulos.map((c) => c.id), ['c']);
  assert.equal(d.capitulos[0].situacao, 'escrita');
});

test('nome do arquivo de backup', () => {
  assert.equal(nomeArquivo('A Estação das Marés!', new Date(2026, 10, 8).getTime()), 'bookstation-a-estacao-das-mares-2026-11-08.json');
});

test('rotas: ida e volta e nível de cima', () => {
  for (const h of ['#/', '#/novo', '#/livro/abc', '#/livro/abc/capitulos', '#/livro/abc/cap/c1', '#/livro/abc/rascunho/r1', '#/livro/abc/ia', '#/livro/abc/ia/cap.c1', '#/livro/abc/capitulo/c1', '#/livro/abc/capitulo/c1/cena/s1', '#/lixeira', '#/ajustes', '#/ideias', '#/comunidade']) assert.equal(hashDe(lerRota(h)), h);
  assert.deepEqual(lerRota(''), { tela: 'biblioteca' });
  assert.deepEqual(lerRota('#/qualquer'), { tela: 'biblioteca' });
  assert.deepEqual(acima(lerRota('#/livro/abc/guia')), { tela: 'livro', id: 'abc' });
  assert.deepEqual(acima(lerRota('#/livro/abc/cap/c1')), { tela: 'area', id: 'abc', area: 'capitulos' });
  assert.deepEqual(acima(lerRota('#/livro/abc/capitulo/c1/cena/s1')), { tela: 'capitulo', id: 'abc', cap: 'c1' });
  assert.deepEqual(acima(lerRota('#/livro/abc')), { tela: 'biblioteca' });
  assert.equal(acima(lerRota('#/')), null);
});
