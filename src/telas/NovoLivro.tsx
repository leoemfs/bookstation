import { useState } from 'react';
import { CAPAS, GENEROS, ROTEIROS, SITUACOES, type Roteiro, type Situacao } from '../data.ts';
import { novoId, novoLivro } from '../livros.ts';
import { ir, useApp } from '../store.tsx';
import { Topo } from '../Topo.tsx';
import { avisar, comprimirImagem, Icon } from '../ui.tsx';

/** Criar livro em 2 passos (prévia P2): o essencial e, opcional, um roteiro. */
export function NovoLivro() {
  const { mudar } = useApp();
  const [passo, setPasso] = useState(1);
  const [titulo, setTitulo] = useState('');
  const [generos, setGeneros] = useState<string[]>([]);
  const [capa, setCapa] = useState(0);
  const [capaImg, setCapaImg] = useState<string | null>(null);
  const [situacao, setSituacao] = useState<Situacao>('planejamento');
  const [roteiro, setRoteiro] = useState<Roteiro>('livre');
  const nome = titulo.trim() || 'Sem título';

  function criar() {
    const id = novoId();
    mudar((d) => ({ ...d, livros: [novoLivro({ titulo, generos, capa, capaImg, situacao, roteiro }, Date.now(), id), ...d.livros] }));
    avisar('Livro criado');
    ir({ tela: 'livro', id }, true);
  }

  return (
    <>
      <Topo cima={passo === 1 ? 'Biblioteca' : 'Novo livro'} tela={passo === 1 ? 'Novo livro' : 'Como começar'} />
      <main className="scroll">
        <div className="passos"><i className="on" /><i className={passo === 2 ? 'on' : ''} /></div>
        {passo === 1 ? (
          <>
            <h1 className="h">O essencial</h1>
            <div className="sub">Só o título é necessário. O resto dá para mudar depois.</div>
            <div className="field">
              <label htmlFor="titulo">Título</label>
              <input id="titulo" className="inp grande" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Nome do livro" autoFocus />
            </div>
            <div className="field">
              <span>Gênero</span>
              <div className="wrapchips">
                {GENEROS.map((g) => (
                  <button key={g} className={`chip${generos.includes(g) ? ' on' : ''}`} onClick={() => setGeneros(generos.includes(g) ? generos.filter((x) => x !== g) : [...generos, g])}>{g}</button>
                ))}
              </div>
            </div>
            <div className="field">
              <span>Capa</span>
              <div className="capas">
                {CAPAS.map((c, i) => (
                  <button key={c} className={`capa${!capaImg && capa === i ? ' on' : ''}`} style={{ background: `linear-gradient(160deg,${c})` }} onClick={() => { setCapa(i); setCapaImg(null); }} aria-label={`Capa ${i + 1}`}>{nome}</button>
                ))}
                <label className={`capa up${capaImg ? ' on' : ''}`} style={capaImg ? { backgroundImage: `url(${capaImg})`, backgroundSize: 'cover' } : undefined}>
                  {!capaImg && <><Icon n="imagem" /><br />Imagem</>}
                  <input type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; try { setCapaImg(await comprimirImagem(f)); } catch (err) { avisar((err as Error).message); } }} />
                </label>
              </div>
            </div>
            <div className="field">
              <span>Situação</span>
              <div className="row">
                {SITUACOES.slice(0, 4).map((s) => <button key={s.v} className={`chip${situacao === s.v ? ' on' : ''}`} onClick={() => setSituacao(s.v)}>{s.l}</button>)}
              </div>
            </div>
            <button className="btn full" onClick={() => setPasso(2)}>Continuar</button>
          </>
        ) : (
          <>
            <h1 className="h">Quer um roteiro?</h1>
            <div className="sub">Opcional. O modelo só cria os marcos da história no guia; nada é obrigatório.</div>
            <div className="stack">
              {ROTEIROS.map((r) => (
                <button key={r.v} className={`card opt${roteiro === r.v ? ' on' : ''}`} onClick={() => setRoteiro(r.v)} aria-pressed={roteiro === r.v}>
                  <span className="rad" />
                  <div>
                    <b>{r.l}</b>
                    <div className="meta">{r.d}</div>
                    {r.marcos.length > 0 && <div className="marcos">{r.marcos.join(' · ')}</div>}
                  </div>
                </button>
              ))}
            </div>
            <div className="row2" style={{ marginTop: 18 }}>
              <button className="btn ghost" onClick={() => setPasso(1)}>Voltar</button>
              <button className="btn" onClick={criar}>Criar livro</button>
            </div>
          </>
        )}
      </main>
    </>
  );
}
