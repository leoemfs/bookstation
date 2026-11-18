import { useState } from 'react';
import { numero } from '../capitulos.ts';
import { filtrarRascunhos, novoRascunho, tagsEmUso, type FiltroRascunho } from '../ideias.ts';
import { novoId, quando } from '../livros.ts';
import { ir, useApp } from '../store.tsx';
import { Topo } from '../Topo.tsx';
import { Icon } from '../ui.tsx';

export function criarRascunho(mudar: ReturnType<typeof useApp>['mudar'], livroId: string, e: Parameters<typeof novoRascunho>[3] = {}): string {
  const id = novoId();
  mudar((d) => ({ ...d, rascunhos: [...d.rascunhos, novoRascunho(livroId, Date.now(), id, e)] }));
  return id;
}

export function Rascunhos({ livroId }: { livroId: string }) {
  const { dados, mudar } = useApp();
  const [f, setF] = useState<FiltroRascunho>('todos');
  const livro = dados.livros.find((l) => l.id === livroId);
  const doLivro = dados.rascunhos.filter((r) => r.livroId === livroId);
  const lista = filtrarRascunhos(dados.rascunhos, livroId, f);
  const tags = tagsEmUso(doLivro).filter((t) => doLivro.some((r) => r.tags.includes(t)));
  const semCap = doLivro.filter((r) => !r.capituloId).length;
  const agora = Date.now();
  const eh = (x: FiltroRascunho) => JSON.stringify(x) === JSON.stringify(f);
  return (
    <>
      <Topo cima={livro?.titulo ?? 'Livro'} tela="Rascunhos" />
      <main className="scroll">
        <div className="sub" style={{ marginTop: 0 }}>Escreva sem decidir onde vai entrar. Um rascunho pode ficar sem capítulo para sempre.</div>
        {doLivro.length > 0 && (
          <div className="row" style={{ marginBottom: 12 }}>
            <button className={`chip${eh('todos') ? ' on' : ''}`} onClick={() => setF('todos')}>Todos {doLivro.length}</button>
            {semCap > 0 && <button className={`chip${eh('sem-capitulo') ? ' on' : ''}`} onClick={() => setF('sem-capitulo')}>Sem capítulo {semCap}</button>}
            {tags.map((t) => <button key={t} className={`chip${eh({ tag: t }) ? ' on' : ''}${t === 'Cocriação IA' ? ' ia' : ''}`} onClick={() => setF({ tag: t })}>{t}</button>)}
          </div>
        )}
        <div className="stack">
          {lista.map((r) => {
            const c = r.capituloId ? dados.capitulos.find((x) => x.id === r.capituloId) : null;
            return (
              <button key={r.id} className="card" onClick={() => ir({ tela: 'rascunho', id: livroId, rasc: r.id })}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}><b style={{ fontSize: 15 }}>{r.titulo || 'Sem título'}</b><span className="meta" style={{ flex: 'none' }}>{quando(r.editadoEm, agora)}</span></div>
                <div className={`link${c ? '' : ' none'}`}>{c ? `→ Cap. ${numero(dados.capitulos, c)}${c.titulo ? ' · ' + c.titulo : ''}` : 'Sem capítulo'}</div>
                <div className="tags">{r.tags.map((t) => <span key={t} className={`tag${t === 'Cocriação IA' ? ' ia' : ''}`}>{t}</span>)}<span className="meta">{r.palavras.toLocaleString('pt-BR')} palavras</span></div>
              </button>
            );
          })}
          {doLivro.length === 0 && (
            <div className="vazio">
              <div className="ic"><Icon n="rascunho" /></div>
              <b>Nenhum rascunho ainda</b>
              Uma conversa, uma cena solta, um final alternativo…
              <div style={{ marginTop: 16 }}><button className="btn" onClick={() => { const id = criarRascunho(mudar, livroId); ir({ tela: 'rascunho', id: livroId, rasc: id }); }}><Icon n="mais" /> Novo rascunho</button></div>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
