import { useState } from 'react';
import { diasRestantes, excluirDeVez, naLixeira, restaurar } from '../livros.ts';
import { useApp } from '../store.tsx';
import { Topo } from '../Topo.tsx';
import { avisar, Capa, Icon, Sheet } from '../ui.tsx';

export function Lixeira() {
  const { dados, mudar } = useApp();
  const [apagar, setApagar] = useState<string | 'tudo' | null>(null);
  const lista = naLixeira(dados.livros);
  const agora = Date.now();
  const alvo = apagar && apagar !== 'tudo' ? lista.find((l) => l.id === apagar) : null;
  return (
    <>
      <Topo cima="Biblioteca" tela="Lixeira" />
      <main className="scroll">
        <div className="sub" style={{ marginTop: 0 }}>Livros excluídos ficam aqui por 30 dias. Depois saem de vez.</div>
        {lista.length === 0 ? (
          <div className="vazio"><div className="ic"><Icon n="lixo" /></div><b>A lixeira está vazia</b></div>
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
