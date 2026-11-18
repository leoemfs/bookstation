import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalize, CAPAS } from './data.ts';
import { exportar, exportarLivro, importar, juntarLivro, nomeArquivo } from './backup.ts';
import { novoLivro } from './livros.ts';
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

test('backup de um livro: entra sem apagar nada, com id novo se repetir', () => {
  const l = novoLivro({ titulo: 'Marés' }, T0, 'a');
  const r = importar(exportarLivro(l, T0), T0);
  assert.equal(r.tipo, 'livro');
  if (r.tipo !== 'livro') return;
  const juntos = juntarLivro([l], r.livro, 'novo');
  assert.deepEqual(juntos.map((x) => x.id), ['novo', 'a']);
  assert.deepEqual(juntarLivro([], r.livro, 'novo').map((x) => x.id), ['a']);
});

test('nome do arquivo de backup', () => {
  assert.equal(nomeArquivo('A Estação das Marés!', new Date(2026, 10, 8).getTime()), 'bookstation-a-estacao-das-mares-2026-11-08.json');
});

test('rotas: ida e volta e nível de cima', () => {
  for (const h of ['#/', '#/novo', '#/livro/abc', '#/livro/abc/capitulos', '#/lixeira', '#/ajustes', '#/ideias', '#/comunidade']) assert.equal(hashDe(lerRota(h)), h);
  assert.deepEqual(lerRota(''), { tela: 'biblioteca' });
  assert.deepEqual(lerRota('#/qualquer'), { tela: 'biblioteca' });
  assert.deepEqual(acima(lerRota('#/livro/abc/guia')), { tela: 'livro', id: 'abc' });
  assert.deepEqual(acima(lerRota('#/livro/abc')), { tela: 'biblioteca' });
  assert.equal(acima(lerRota('#/')), null);
});
