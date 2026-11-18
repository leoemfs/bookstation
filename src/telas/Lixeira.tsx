import { useState } from 'react';
import { diasRestantes, excluirDeVez, naLixeira, restaurar } from '../livros.ts';
import { capRestaurar, capsNaLixeira } from '../capitulos.ts';
import { useApp } from '../store.tsx';
import { Topo } from '../Topo.tsx';
import { avisar, Capa, Icon, Sheet } from '../ui.tsx';

export function Lixeira() {
  const { dados, mudar } = useApp();
  const [apagar, setApagar] = useState<string | 'tudo' | null>(null);
  const lista = naLixeira(dados.livros);
  const caps = capsNaLixeira(dados.capitulos).filter((c) => dados.livros.some((l) => l.id === c.livroId && l.excluidoEm === null));
  const [apagarCap, setApagarCap] = useState<string | null>(null);
  const agora = Date.now();
  const alvo = apagar && apagar !== 'tudo' ? lista.find((l) => l.id === apagar) : null;
  return (
    <>
      <Topo cima="Biblioteca" tela="Lixeira" />
      <main className="scroll">
        <div className="sub" style={{ marginTop: 0 }}>Livros e capítulos excluídos ficam aqui por 30 dias. Depois saem de vez.</div>
        {caps.length > 0 && (
          <>
            <div className="lbl">Capítulos</div>
            <div className="stack" style={{ marginBottom: 18 }}>
              {caps.map((c) => (
                <div key={c.id} className="card">
                  <b style={{ fontSize: 15 }}>{c.titulo || 'Capítulo sem título'}</b>
                  <div className="meta">de “{dados.livros.find((l) => l.id === c.livroId)?.titulo}” · {c.palavras.toLocaleString('pt-BR')} palavras · sai de vez em {Math.max(0, Math.ceil((c.excluidoEm! + 30 * 86_400_000 - agora) / 86_400_000))} dias</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button className="chip on" onClick={() => { mudar((d) => ({ ...d, capitulos: capRestaurar(d.capitulos, c.id) })); avisar('Capítulo recuperado'); }}>Recuperar</button>
                    <button className="chip" onClick={() => setApagarCap(c.id)}>Excluir de vez</button>
                  </div>
                </div>
              ))}
            </div>
            <div className="lbl">Livros</div>
          </>
        )}
        {lista.length === 0 ? (
          caps.length ? <div className="meta">Nenhum livro na lixeira.</div> : <div className="vazio"><div className="ic"><Icon n="lixo" /></div><b>A lixeira está vazia</b></div>
        ) : (
          <div className="stack">
            {lista.map((l) => (
              <div key={l.id} className="card livro">
                <Capa livro={l} w={54} h={78} fonte={9} />
                <div className="info" style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 15.5 }}>{l.titulo}</h3>
                  <div className="meta">sai de vez em {diasRestantes(l, agora)} {diasRestantes(l, agora) === 1 ? 'dia' : 'dias'}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                    <button className="chip on" onClick={() => { mudar((d) => ({ ...d, livros: restaurar(d.livros, l.id) })); avisar('Livro recuperado'); }}>Recuperar</button>
                    <button className="chip" onClick={() => setApagar(l.id)}>Excluir de vez</button>
                  </div>
                </div>
              </div>
            ))}
            {lista.length > 1 && <button className="btn ghost full" onClick={() => setApagar('tudo')}>Esvaziar lixeira</button>}
          </div>
        )}
      </main>
      {apagarCap && (
        <Sheet onClose={() => setApagarCap(null)}>
          <div className="confirm">
            <h4>Excluir o capítulo de vez?</h4>
            <p>O texto, as cenas e o histórico dele saem. Isso não pode ser desfeito.</p>
            <div className="row2">
              <button className="btn ghost" onClick={() => setApagarCap(null)}>Cancelar</button>
              <button className="btn danger" onClick={() => { const id = apagarCap; mudar((d) => ({ ...d, capitulos: d.capitulos.filter((x) => x.id !== id) })); setApagarCap(null); avisar('Excluído de vez'); }}>Excluir</button>
            </div>
          </div>
        </Sheet>
      )}
      {apagar && (
        <Sheet onClose={() => setApagar(null)}>
          <div className="confirm">
            <h4>{apagar === 'tudo' ? 'Esvaziar a lixeira?' : `Excluir “${alvo?.titulo}” de vez?`}</h4>
            <p>Isso não pode ser desfeito.</p>
            <div className="row2">
              <button className="btn ghost" onClick={() => setApagar(null)}>Cancelar</button>
              <button className="btn danger" onClick={() => { mudar((d) => ({ ...d, livros: apagar === 'tudo' ? d.livros.filter((x) => x.excluidoEm === null) : excluirDeVez(d.livros, apagar) })); setApagar(null); avisar('Excluído de vez'); }}>Excluir</button>
            </div>
          </div>
        </Sheet>
      )}
    </>
  );
}
