import { useState } from 'react';
import { SITUACOES_CAP, type Capitulo, type SituacaoCap } from '../data.ts';
import { atualizarCap, capParaLixeira, doLivro, duplicarCapitulo, mover, novoCapitulo, todosDoLivro } from '../capitulos.ts';
import { copiarCenas, doCapitulo } from '../cenas.ts';
import { novoId } from '../livros.ts';
import { ir, useApp } from '../store.tsx';
import { Topo } from '../Topo.tsx';
import { avisar, Icon, Sheet } from '../ui.tsx';
import { AbasLivro } from './AbasLivro.tsx';

const tom = (s: SituacaoCap) => SITUACOES_CAP.find((x) => x.v === s)!;

export function Capitulos({ livroId }: { livroId: string }) {
  const { dados, mudar } = useApp();
  const livro = dados.livros.find((l) => l.id === livroId);
  const [filtro, setFiltro] = useState<SituacaoCap | 'todos'>('todos');
  const [reordenar, setReordenar] = useState(false);
  const [abertos, setAbertos] = useState<Record<string, boolean>>({});
  const [menu, setMenu] = useState<Capitulo | null>(null);
  const [renomear, setRenomear] = useState<Capitulo | null>(null);
  const [nome, setNome] = useState('');
  const [excluir, setExcluir] = useState<Capitulo | null>(null);
  const [verArquivados, setVerArquivados] = useState(false);
  const caps = doLivro(dados.capitulos, livroId);
  const arquivados = todosDoLivro(dados.capitulos, livroId).filter((c) => c.arquivado);
  const lista = reordenar || filtro === 'todos' ? caps : caps.filter((c) => c.situacao === filtro);
  const cenasTot = dados.cenas.filter((s) => caps.some((c) => c.id === s.capituloId)).length;
  const palavras = caps.reduce((s, c) => s + c.palavras, 0);
  const usadas = SITUACOES_CAP.filter((s) => caps.some((c) => c.situacao === s.v));
  const agora = () => Date.now();
  const novo = () => { const id = novoId(); mudar((d) => ({ ...d, capitulos: [...d.capitulos, novoCapitulo(d.capitulos, livroId, agora(), id)] })); ir({ tela: 'editor', id: livroId, cap: id }); };

  return (
    <>
      <Topo cima={livro?.titulo ?? 'Livro'} tela="Capítulos" />
      <main className="scroll">
        <AbasLivro livroId={livroId} atual="capitulos" />
        {caps.length > 0 ? (
          <>
            <div className="barra-filtro">
              <div className="row">
                <button className={`chip${filtro === 'todos' ? ' on' : ''}`} onClick={() => setFiltro('todos')}>Todos</button>
                {usadas.map((s) => <button key={s.v} className={`chip${filtro === s.v ? ' on' : ''}`} onClick={() => setFiltro(s.v)}>{s.l}</button>)}
              </div>
              {caps.length > 1 && <button className={`chip fixo${reordenar ? ' on' : ''}`} onClick={() => { setReordenar(!reordenar); if (reordenar) avisar('Ordem salva. Os números foram atualizados.'); }}>{reordenar ? 'Pronto' : 'Reordenar'}</button>}
            </div>
            <div className="lbl"><span>{caps.length} {caps.length === 1 ? 'capítulo' : 'capítulos'} · {cenasTot} {cenasTot === 1 ? 'cena' : 'cenas'}</span><span>{palavras.toLocaleString('pt-BR')} palavras</span></div>
            <div className="stack">
              {lista.map((c) => {
                const n = caps.indexOf(c) + 1;
                const cenas = doCapitulo(dados.cenas, c.id);
                const t = tom(c.situacao);
                return (
                  <div key={c.id} className={`card cap${reordenar ? ' reord' : ''}`}>
                    <div className="cap-linha">
                      <button className="cap-abrir" onClick={() => !reordenar && ir({ tela: 'capitulo', id: livroId, cap: c.id })} disabled={reordenar}>
                        <span className="num">{n}</span>
                        <span className="info">
                          <b>{c.titulo || 'Sem título'}</b>
                          <span className="meta">{cenas.length ? `${cenas.length} ${cenas.length === 1 ? 'cena' : 'cenas'} · ` : ''}{c.palavras ? `${c.palavras.toLocaleString('pt-BR')} palavras` : 'sem texto ainda'}</span>
                          {!reordenar && <span className={`pill t-${t.tom}`} style={{ marginTop: 4 }}>{t.l}</span>}
                        </span>
                      </button>
                      {reordenar ? (
                        <span className="mv">
                          <button aria-label="Subir" disabled={n === 1} onClick={() => mudar((d) => ({ ...d, capitulos: mover(d.capitulos, c.id, -1) }))}>▲</button>
                          <button aria-label="Descer" disabled={n === caps.length} onClick={() => mudar((d) => ({ ...d, capitulos: mover(d.capitulos, c.id, 1) }))}>▼</button>
                        </span>
                      ) : (
                        <>
                          {cenas.length > 0 && <button className="ib" aria-label={abertos[c.id] ? 'Esconder cenas' : 'Mostrar cenas'} onClick={() => setAbertos({ ...abertos, [c.id]: !abertos[c.id] })}>{abertos[c.id] ? '▴' : '▾'}</button>}
                          <button className="ib" aria-label="Opções do capítulo" onClick={() => setMenu(c)}><Icon n="pontos" /></button>
                        </>
                      )}
                    </div>
                    {!reordenar && abertos[c.id] && (
                      <div className="cenas">
                        {cenas.map((s, j) => (
                          <button key={s.id} className="cena" onClick={() => ir({ tela: 'cena', id: livroId, cap: c.id, cena: s.id })}><span className="meta">{n}.{j + 1}</span>{s.titulo || 'Cena sem título'}<small>{s.momento}</small></button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              {lista.length === 0 && <div className="vazio" style={{ padding: 20 }}>Nenhum capítulo nesta situação.</div>}
            </div>
            <div className="meta" style={{ margin: '12px 2px' }}>
              O número acompanha a posição.
              {arquivados.length > 0 && <> Arquivados: {arquivados.length} · <button className="link-btn" onClick={() => setVerArquivados(true)}>ver</button></>}
            </div>
          </>
        ) : (
          <div className="vazio">
            <div className="ic"><Icon n="lista" /></div>
            <b>Nenhum capítulo ainda</b>
            Comece pelo primeiro. Dá para reordenar depois.
            <div style={{ marginTop: 16 }}><button className="btn" onClick={novo}><Icon n="mais" /> Novo capítulo</button></div>
          </div>
        )}
      </main>

      {menu && (
        <Sheet titulo={`Cap. ${caps.indexOf(menu) + 1} · ${menu.titulo || 'Sem título'}`} onClose={() => setMenu(null)}>
          <div className="menu">
            <button onClick={() => { setNome(menu.titulo); setRenomear(menu); setMenu(null); }}><span className="ic"><Icon n="caneta" /></span>Renomear</button>
            <button onClick={() => { const m = menu; const nid = novoId(); mudar((d) => ({ ...d, capitulos: duplicarCapitulo(d.capitulos, m.id, agora(), nid), cenas: [...d.cenas, ...copiarCenas(d.cenas, m.id, nid, livroId, agora(), novoId)] })); setMenu(null); avisar('Capítulo duplicado'); }}><span className="ic"><Icon n="copia" /></span>Duplicar</button>
            <button onClick={() => { const m = menu; mudar((d) => ({ ...d, capitulos: atualizarCap(d.capitulos, m.id, { arquivado: true }, agora()) })); setMenu(null); avisar('Capítulo arquivado. Ele sai da lista e da numeração.'); }}><span className="ic"><Icon n="arquivo" /></span>Arquivar</button>
            <button className="danger" onClick={() => { setExcluir(menu); setMenu(null); }}><span className="ic"><Icon n="lixo" /></span>Excluir</button>
          </div>
        </Sheet>
      )}
      {renomear && (
        <Sheet titulo="Renomear capítulo" onClose={() => setRenomear(null)}>
          <div className="field"><label htmlFor="rn">Título</label><input id="rn" className="inp" autoFocus value={nome} onChange={(e) => setNome(e.target.value)} /></div>
          <button className="btn full" onClick={() => { const r = renomear; mudar((d) => ({ ...d, capitulos: atualizarCap(d.capitulos, r.id, { titulo: nome.trim() }, agora()) })); setRenomear(null); }}>Salvar</button>
        </Sheet>
      )}
      {excluir && (
        <Sheet onClose={() => setExcluir(null)}>
          <div className="confirm">
            <h4>Mover capítulo para a lixeira?</h4>
            <p>As cenas vão junto. Os rascunhos ligados ficam e só perdem o vínculo se o capítulo sair de vez. Dá para recuperar por 30 dias.</p>
            <div className="row2">
              <button className="btn ghost" onClick={() => setExcluir(null)}>Cancelar</button>
              <button className="btn danger" onClick={() => { const x = excluir; mudar((d) => ({ ...d, capitulos: capParaLixeira(d.capitulos, x.id, agora()) })); setExcluir(null); avisar('Capítulo na lixeira'); }}>Excluir</button>
            </div>
          </div>
        </Sheet>
      )}
      {verArquivados && (
        <Sheet titulo="Capítulos arquivados" onClose={() => setVerArquivados(false)}>
          <div className="menu">
            {arquivados.map((c) => (
              <button key={c.id} onClick={() => { mudar((d) => ({ ...d, capitulos: atualizarCap(d.capitulos, c.id, { arquivado: false }, agora()) })); avisar('Capítulo de volta à lista'); if (arquivados.length === 1) setVerArquivados(false); }}>
                <span className="ic"><Icon n="arquivo" /></span>{c.titulo || 'Sem título'}<span className="meta" style={{ marginLeft: 'auto' }}>desarquivar</span>
              </button>
            ))}
          </div>
        </Sheet>
      )}
    </>
  );
}
