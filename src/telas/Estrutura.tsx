import { useState } from 'react';
import { ROTEIROS, type Roteiro } from '../data.ts';
import { doLivro } from '../capitulos.ts';
import { atualizar } from '../livros.ts';
import { useApp } from '../store.tsx';
import { Topo } from '../Topo.tsx';
import { Sheet } from '../ui.tsx';
import { AbasLivro } from './AbasLivro.tsx';

/** Estrutura narrativa (prévia P4): marcos do roteiro com capítulos ligados. Tudo opcional. */
export function Estrutura({ livroId }: { livroId: string }) {
  const { dados, mudar } = useApp();
  const livro = dados.livros.find((l) => l.id === livroId);
  const [ligar, setLigar] = useState<string | null>(null);
  if (!livro) return null;
  const caps = doLivro(dados.capitulos, livroId);
  const r = ROTEIROS.find((x) => x.v === livro.roteiro)!;
  const set = (p: Parameters<typeof atualizar>[2]) => mudar((d) => ({ ...d, livros: atualizar(d.livros, livroId, p, Date.now()) }));
  const ligados = (m: string) => (livro.estrutura[m] ?? []).map((id) => caps.find((c) => c.id === id)).filter((c): c is NonNullable<typeof c> => !!c).sort((a, b) => caps.indexOf(a) - caps.indexOf(b));
  return (
    <>
      <Topo cima={livro.titulo} tela="Estrutura" />
      <main className="scroll">
        <AbasLivro livroId={livroId} atual="estrutura" />
        <div className="lbl" style={{ marginTop: 4 }}>Modelo</div>
        <div className="row">{ROTEIROS.map((x) => <button key={x.v} className={`chip${livro.roteiro === x.v ? ' on' : ''}`} onClick={() => set({ roteiro: x.v as Roteiro })}>{x.l}</button>)}</div>
        <div className="sub" style={{ margin: '10px 2px 14px' }}>{r.d} Ligue capítulos a cada marco. Tudo opcional; trocar de modelo não apaga nada.</div>
        {r.marcos.length === 0 && <div className="vazio" style={{ padding: 20 }}>No modelo livre não há marcos. Escolha um modelo acima para organizar por etapas.</div>}
        {r.marcos.map((m, i) => (
          <div className="colb" key={m}>
            <div className="colb-cab"><span>{i + 1}. {m}</span><button className="link-btn" onClick={() => setLigar(m)}>+ ligar</button></div>
            <div className="wrapchips">{ligados(m).length ? ligados(m).map((c) => <span key={c.id} className="tag grande">Cap. {caps.indexOf(c) + 1}{c.titulo ? ` · ${c.titulo}` : ''}</span>) : <span className="tag vazio-tag">nenhum capítulo ainda</span>}</div>
          </div>
        ))}
        <div className="card soon" style={{ marginTop: 12 }}><span className="pill t-azul">Depois</span><b style={{ fontSize: 14 }}>Quadro narrativo</b><div className="meta">Arrastar ideias, cenas e acontecimentos entre etapas (fase F9).</div></div>
      </main>
      {ligar && (
        <Sheet titulo={`Capítulos de “${ligar}”`} onClose={() => setLigar(null)}>
          {caps.length === 0 ? <div className="meta">Crie capítulos primeiro.</div> : (
            <div className="wrapchips">
              {caps.map((c, i) => {
                const on = (livro.estrutura[ligar] ?? []).includes(c.id);
                return <button key={c.id} className={`chip${on ? ' on' : ''}`} onClick={() => { const atual = livro.estrutura[ligar] ?? []; set({ estrutura: { ...livro.estrutura, [ligar]: on ? atual.filter((x) => x !== c.id) : [...atual, c.id] } }); }}>{i + 1}. {c.titulo || 'Sem título'}</button>;
              })}
            </div>
          )}
          <button className="btn full" style={{ marginTop: 14 }} onClick={() => setLigar(null)}>Pronto</button>
        </Sheet>
      )}
    </>
  );
}
