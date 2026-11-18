import { useState } from 'react';
import { PERGUNTAS_CENA } from '../data.ts';
import { doLivro } from '../capitulos.ts';
import { atualizarCena, doCapitulo, moverCena, respondidas } from '../cenas.ts';
import { ir, useApp } from '../store.tsx';
import { Topo } from '../Topo.tsx';
import { avisar, Icon, Sheet } from '../ui.tsx';

/** Cena (prévia P4): momento, clima, resumo e o modelo opcional de 6 perguntas. */
export function CenaTela({ livroId, cenaId }: { livroId: string; cenaId: string }) {
  const { dados, mudar } = useApp();
  const [excluir, setExcluir] = useState(false);
  const s = dados.cenas.find((x) => x.id === cenaId && x.livroId === livroId);
  if (!s) return (<><Topo cima="Capítulos" tela="Cena" /><main className="scroll"><div className="vazio"><b>Cena não encontrada</b></div></main></>);
  const n = doLivro(dados.capitulos, livroId).findIndex((c) => c.id === s.capituloId) + 1;
  const irmas = doCapitulo(dados.cenas, s.capituloId);
  const k = irmas.indexOf(s) + 1;
  const set = (p: Parameters<typeof atualizarCena>[2]) => mudar((d) => ({ ...d, cenas: atualizarCena(d.cenas, s.id, p, Date.now()) }));
  return (
    <>
      <Topo cima={n ? `Cap. ${n}` : 'Capítulo'} tela={`Cena ${k}`} />
      <main className="scroll">
        <input className="inp titulo-cap" value={s.titulo} placeholder="Título da cena" aria-label="Título da cena" onChange={(e) => set({ titulo: e.target.value })} />
        <div className="row2" style={{ marginTop: 10 }}>
          <div className="campo"><label htmlFor="mo">Momento</label><input id="mo" className="inp" value={s.momento} onChange={(e) => set({ momento: e.target.value })} placeholder="Dia 1, manhã" /></div>
          <div className="campo"><label htmlFor="cl">Clima</label><input id="cl" className="inp" value={s.clima} onChange={(e) => set({ clima: e.target.value })} placeholder="Neblina" /></div>
        </div>
        <div className="campo"><label htmlFor="rs">Resumo</label><textarea id="rs" className="inp" value={s.resumo} onChange={(e) => set({ resumo: e.target.value })} placeholder="O que acontece nesta cena." /></div>
        <div className="lbl"><span>Planejar a cena (opcional) · {respondidas(s)} de 6</span><button className="link-btn" onClick={() => set({ mostrarModelo: !s.mostrarModelo })}>{s.mostrarModelo ? 'esconder' : 'mostrar'}</button></div>
        {s.mostrarModelo && PERGUNTAS_CENA.map((q, i) => (
          <div className="campo pergunta" key={q}>
            <label htmlFor={`q${i}`}><b>{i + 1}</b>{q}</label>
            <textarea id={`q${i}`} className="inp" rows={2} value={s.perguntas[i]} onChange={(e) => { const p = [...s.perguntas]; p[i] = e.target.value; set({ perguntas: p }); }} placeholder="Toque para responder" />
          </div>
        ))}
        {s.mostrarModelo && <div className="meta" style={{ margin: '0 2px 12px' }}>Cenas que não mudam nada costumam ser as primeiras a cortar na revisão.</div>}
        <div className="lbl">Participam</div>
        <div className="meta">Personagens e locais chegam com as fichas, na F5.</div>
        <div className="stack" style={{ marginTop: 16 }}>
          <button className="btn" onClick={() => ir({ tela: 'editor', id: livroId, cap: s.capituloId })}><Icon n="caneta" /> Escrever no capítulo</button>
          <div className="row2">
            <button className="btn ghost" disabled={k <= 1} onClick={() => mudar((d) => ({ ...d, cenas: moverCena(d.cenas, s.id, -1) }))}>▲ Subir</button>
            <button className="btn ghost" disabled={k >= irmas.length} onClick={() => mudar((d) => ({ ...d, cenas: moverCena(d.cenas, s.id, 1) }))}>▼ Descer</button>
          </div>
          <button className="btn ghost" onClick={() => setExcluir(true)}><Icon n="lixo" /> Excluir cena</button>
        </div>
      </main>
      {excluir && (
        <Sheet onClose={() => setExcluir(false)}>
          <div className="confirm">
            <h4>Excluir esta cena?</h4>
            <p>O planejamento da cena sai. O texto do capítulo não muda.</p>
            <div className="row2">
              <button className="btn ghost" onClick={() => setExcluir(false)}>Cancelar</button>
              <button className="btn danger" onClick={() => { mudar((d) => ({ ...d, cenas: d.cenas.filter((x) => x.id !== s.id) })); avisar('Cena excluída'); ir({ tela: 'capitulo', id: livroId, cap: s.capituloId }, true); }}>Excluir</button>
            </div>
          </div>
        </Sheet>
      )}
    </>
  );
}
