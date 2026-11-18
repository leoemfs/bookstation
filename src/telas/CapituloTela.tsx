import { SITUACOES_CAP } from '../data.ts';
import { atualizarCap, doLivro } from '../capitulos.ts';
import { doCapitulo, novaCena } from '../cenas.ts';
import { novoId } from '../livros.ts';
import { ir, useApp } from '../store.tsx';
import { Topo } from '../Topo.tsx';
import { Icon } from '../ui.tsx';

/** Página do capítulo (prévia P4): situação, resumo, objetivo, cenas e rascunhos ligados. */
export function CapituloTela({ livroId, capId }: { livroId: string; capId: string }) {
  const { dados, mudar } = useApp();
  const caps = doLivro(dados.capitulos, livroId);
  const c = dados.capitulos.find((x) => x.id === capId && x.livroId === livroId && x.excluidoEm === null);
  if (!c) return (<><Topo cima="Capítulos" tela="Capítulo" /><main className="scroll"><div className="vazio"><b>Capítulo não encontrado</b>Ele pode estar na lixeira.</div></main></>);
  const n = caps.indexOf(c) + 1;
  const cenas = doCapitulo(dados.cenas, c.id);
  const rascs = dados.rascunhos.filter((r) => r.capituloId === c.id);
  const set = (p: Parameters<typeof atualizarCap>[2]) => mudar((d) => ({ ...d, capitulos: atualizarCap(d.capitulos, c.id, p, Date.now()) }));
  const novaC = () => { const id = novoId(); mudar((d) => ({ ...d, cenas: [...d.cenas, novaCena(d.cenas, livroId, c.id, Date.now(), id)] })); ir({ tela: 'cena', id: livroId, cap: c.id, cena: id }); };
  return (
    <>
      <Topo cima="Capítulos" tela={n ? `Cap. ${n}` : 'Arquivado'} />
      <main className="scroll">
        <div className="cap-cab">{n > 0 && <span className="num">{n}</span>}<input className="inp titulo-cap" value={c.titulo} placeholder="Título do capítulo" aria-label="Título do capítulo" onChange={(e) => set({ titulo: e.target.value })} /></div>
        <button className="btn full" onClick={() => ir({ tela: 'editor', id: livroId, cap: c.id })}><Icon n="caneta" /> Escrever{c.palavras ? ` · ${c.palavras.toLocaleString('pt-BR')} palavras` : ''}</button>
        <div className="lbl">Situação</div>
        <div className="row">{SITUACOES_CAP.map((s) => <button key={s.v} className={`chip${c.situacao === s.v ? ' on' : ''}`} onClick={() => set({ situacao: s.v })}>{s.l}</button>)}</div>
        <div className="lbl">Sobre o capítulo</div>
        <div className="campo"><label htmlFor="res">Resumo</label><textarea id="res" className="inp" value={c.resumo} onChange={(e) => set({ resumo: e.target.value })} placeholder="O que acontece, em poucas frases." /></div>
        <div className="campo"><label htmlFor="obj">Objetivo narrativo</label><textarea id="obj" className="inp" value={c.objetivo} onChange={(e) => set({ objetivo: e.target.value })} placeholder="O que este capítulo precisa mudar na história?" /></div>
        <div className="lbl">Quem e onde</div>
        <div className="meta">Personagens e locais ligados (pelas referências / do texto) chegam com as fichas, na F5.</div>
        <div className="lbl"><span>Cenas · {cenas.length}</span><button className="link-btn" onClick={novaC}>+ cena</button></div>
        <div className="stack" style={{ gap: 8 }}>
          {cenas.map((s, j) => <button key={s.id} className="cena grande" onClick={() => ir({ tela: 'cena', id: livroId, cap: c.id, cena: s.id })}><span className="meta">{j + 1}</span>{s.titulo || 'Cena sem título'}<small>{s.momento}</small></button>)}
          {cenas.length === 0 && <div className="meta">Sem cenas. O capítulo pode ser escrito direto, sem dividir.</div>}
        </div>
        <div className="lbl">Rascunhos ligados</div>
        {rascs.length ? <div className="stack" style={{ gap: 8 }}>{rascs.map((r) => <button key={r.id} className="cena grande" onClick={() => ir({ tela: 'rascunho', id: livroId, rasc: r.id })}><Icon n="rascunho" />{r.titulo || 'Sem título'}<small>{r.palavras} palavras</small></button>)}</div> : <div className="meta">Nenhum.</div>}
        {c.arquivado && <button className="btn ghost full" style={{ marginTop: 16 }} onClick={() => set({ arquivado: false })}>Desarquivar</button>}
      </main>
    </>
  );
}
