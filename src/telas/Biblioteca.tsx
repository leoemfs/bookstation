import { useState } from 'react';
import { SITUACOES } from '../data.ts';
import { contagens, filtrar, naLixeira, ordenar, quando, type Filtro, type Ordem } from '../livros.ts';
import { ir, useApp } from '../store.tsx';
import { Topo } from '../Topo.tsx';
import { Capa, Icon, PillSituacao } from '../ui.tsx';

const ORDENS: { v: Ordem; l: string }[] = [
  { v: 'edicao', l: 'Última edição' },
  { v: 'titulo', l: 'Título' },
  { v: 'criacao', l: 'Mais novos' },
];

export function Biblioteca() {
  const { dados } = useApp();
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [ordem, setOrdem] = useState<Ordem>(() => (localStorage.getItem('bookstation:ordem') as Ordem) || 'edicao');
  const [buscando, setBuscando] = useState(false);
  const [q, setQ] = useState('');
  const c = contagens(dados.livros);
  const lixo = naLixeira(dados.livros).length;
  const lista = ordenar(filtrar(dados.livros, filtro, q), ordem);
  const agora = Date.now();
  const chips: { v: Filtro; l: string }[] = [{ v: 'todos', l: 'Todos' }, ...SITUACOES.filter((s) => c[s.v] > 0).map((s) => ({ v: s.v as Filtro, l: s.l })), ...(c.arquivados ? [{ v: 'arquivados' as Filtro, l: 'Arquivados' }] : [])];

  return (
    <>
      <Topo tela="BookStation" direita={<button className="ib" aria-label="Buscar livros" onClick={() => { setBuscando(!buscando); setQ(''); }}><Icon n={buscando ? 'fechar' : 'busca'} /></button>} />
      {buscando && (
        <div className="busca">
          <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por título, gênero ou descrição" aria-label="Buscar" />
        </div>
      )}
      <main className={`scroll${buscando ? ' com-busca' : ''}`}>
        <h1 className="h">Biblioteca</h1>
        {dados.livros.some((l) => l.excluidoEm === null) || lixo ? (
          <>
            <div className="row">
              {chips.map((x) => (
                <button key={x.v} className={`chip${filtro === x.v ? ' on' : ''}`} onClick={() => setFiltro(x.v)}>
                  {x.l} {c[x.v]}
                </button>
              ))}
              {lixo > 0 && <button className="chip" onClick={() => ir({ tela: 'lixeira' })}>Lixeira {lixo}</button>}
            </div>
            <div className="lbl">
              <span>{lista.length} {lista.length === 1 ? 'livro' : 'livros'}</span>
              <select value={ordem} aria-label="Ordenar" onChange={(e) => { setOrdem(e.target.value as Ordem); try { localStorage.setItem('bookstation:ordem', e.target.value); } catch { /* ignora */ } }}>
                {ORDENS.map((o) => <option key={o.v} value={o.v}>Ordenar: {o.l}</option>)}
              </select>
            </div>
            <div className="stack">
              {lista.map((l) => (
                <button key={l.id} className="card livro" onClick={() => ir({ tela: 'livro', id: l.id })}>
                  <Capa livro={l} w={70} h={100} fonte={11} />
                  <div className="info">
                    <h3>{l.titulo}</h3>
                    {l.generos.length > 0 && <div className="meta">{l.generos.join(' · ')}</div>}
                    {l.descricao && <div className="meta" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{l.descricao}</div>}
                    <div className="meta" style={{ color: 'var(--faint)' }}>editado {quando(l.editadoEm, agora)} · 0 capítulos</div>
                    <PillSituacao s={l.situacao} livro={l} />
                  </div>
                </button>
              ))}
              {lista.length === 0 && <div className="vazio">{q ? 'Nenhum livro com essa busca.' : 'Nenhum livro neste filtro.'}</div>}
            </div>
          </>
        ) : (
          <div className="vazio">
            <div className="ic"><Icon n="livro" /></div>
            <b>Sua biblioteca está vazia</b>
            Comece com uma ideia simples. Só o título é necessário.
            <div style={{ marginTop: 18 }}><button className="btn" onClick={() => ir({ tela: 'novo' })}><Icon n="mais" /> Novo livro</button></div>
          </div>
        )}
      </main>
    </>
  );
}
