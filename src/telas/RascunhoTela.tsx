import { useState } from 'react';
import { contar, doLivro, numero, salvarTexto } from '../capitulos.ts';
import { EditorTexto } from '../Editor.tsx';
import { juntarDocs, tagsEmUso, textoDoc } from '../ideias.ts';
import { ir, useApp } from '../store.tsx';
import { Topo } from '../Topo.tsx';
import { avisar, Icon, Sheet, Toggle } from '../ui.tsx';
import { EscolherTags } from './Ideias.tsx';
import type { Dados, Rascunho } from '../data.ts';

type Folha = null | 'vinculo' | 'transferir' | 'excluir' | 'tags';

/** Escrever um rascunho (o mesmo editor dos capítulos). */
export function RascunhoTela({ livroId, rascId }: { livroId: string; rascId: string }) {
  const { dados, mudar } = useApp();
  const livro = dados.livros.find((l) => l.id === livroId && l.excluidoEm === null);
  const r = dados.rascunhos.find((x) => x.id === rascId && x.livroId === livroId);
  const [folha, setFolha] = useState<Folha>(null);
  const [salvando, setSalvando] = useState(false);
  const [palavras, setPalavras] = useState(r?.palavras ?? 0);
  const [destino, setDestino] = useState<string | null>(r?.capituloId ?? null);
  const [onde, setOnde] = useState<'fim' | 'inicio'>('fim');
  const [manter, setManter] = useState(true);
  if (!livro || !r) return (<><Topo cima="Rascunhos" tela="Rascunho" /><main className="scroll"><div className="vazio"><b>Rascunho não encontrado</b></div></main></>);
  const caps = doLivro(dados.capitulos, livroId);
  const cap = r.capituloId ? caps.find((c) => c.id === r.capituloId) : null;
  const muda = (p: Partial<Rascunho>) => mudar((d) => ({ ...d, rascunhos: d.rascunhos.map((x) => (x.id === r.id ? { ...x, ...p, editadoEm: Date.now() } : x)) }));

  function transferir() {
    const alvo = destino ?? caps[caps.length - 1]?.id;
    if (!alvo) return avisar('Crie um capítulo primeiro');
    mudar((d: Dados) => {
      const c = d.capitulos.find((x) => x.id === alvo)!;
      const rx = d.rascunhos.find((x) => x.id === r!.id)!;
      const doc = juntarDocs(c.conteudo, rx.conteudo, onde);
      return {
        ...d,
        capitulos: salvarTexto(d.capitulos, alvo, doc, textoDoc(doc), Date.now()),
        rascunhos: manter ? d.rascunhos.map((x) => (x.id === rx.id ? { ...x, capituloId: alvo } : x)) : d.rascunhos.filter((x) => x.id !== rx.id),
        livros: d.livros.map((l) => (l.id === livroId ? { ...l, editadoEm: Date.now() } : l)),
      };
    });
    avisar(manter ? 'Texto copiado para o capítulo. O rascunho continua guardado.' : 'Texto levado para o capítulo.');
    ir({ tela: 'editor', id: livroId, cap: alvo }, true);
  }

  return (
    <>
      <Topo cima="Rascunhos" tela={r.titulo || 'Sem título'} direita={<span className={`salvo${salvando ? ' ing' : ''}`} role="status"><i />{salvando ? 'Salvando…' : 'Salvo'}</span>} />
      <main className="scroll escrever">
        <div className="rasc-info">
          <input className="inp" value={r.titulo} placeholder="Título do rascunho" aria-label="Título do rascunho" onChange={(e) => muda({ titulo: e.target.value })} />
          <div className="rasc-linha">
            <button className="chip" onClick={() => setFolha('vinculo')}>{cap ? `→ Cap. ${numero(dados.capitulos, cap)}${cap.titulo ? ' · ' + cap.titulo : ''}` : 'Sem capítulo · ligar'}</button>
            <button className="chip" onClick={() => setFolha('tags')}>{r.tags.length ? r.tags.join(' · ') : '+ tags'}</button>
          </div>
        </div>
        <div className={`pagina pg-${livro.aparencia.pagina} f-${livro.aparencia.fonte}`} style={{ fontSize: livro.aparencia.tamanho }}>
          <EditorTexto
            key={r.id}
            doc={r.conteudo}
            aparencia={livro.aparencia}
            onAparencia={(a) => mudar((d) => ({ ...d, livros: d.livros.map((l) => (l.id === livroId ? { ...l, aparencia: { ...l.aparencia, ...a } } : l)) }))}
            acoes={{}}
            onDigitando={(t) => { setSalvando(true); setPalavras(contar(t).palavras); }}
            onChange={(doc, texto) => { muda({ conteudo: doc, palavras: contar(texto).palavras }); setSalvando(false); }}
          />
        </div>
        <div className="ed-rodape"><span>{palavras.toLocaleString('pt-BR')} palavras</span><span>Salva sozinho</span></div>
        <div className="stack" style={{ marginTop: 16 }}>
          <button className="btn" onClick={() => { setDestino(r.capituloId ?? caps[caps.length - 1]?.id ?? null); setFolha('transferir'); }}><Icon n="enviar" /> Transferir para capítulo</button>
          <div className="row2">
            <button className="btn ghost" onClick={() => ir({ tela: 'ia', id: livroId, alvo: `rasc.${r.id}` })}><Icon n="copia" /> Copiar p/ IA</button>
            <button className="btn ghost" onClick={() => setFolha('excluir')}><Icon n="lixo" /> Excluir</button>
          </div>
        </div>
      </main>

      {folha === 'vinculo' && (
        <Sheet titulo="Ligar a um capítulo" onClose={() => setFolha(null)}>
          <div className="menu">
            <button className={!r.capituloId ? 'on' : ''} onClick={() => { muda({ capituloId: null }); setFolha(null); }}>Sem capítulo (tudo bem)</button>
            {caps.map((c) => <button key={c.id} className={r.capituloId === c.id ? 'on' : ''} onClick={() => { muda({ capituloId: c.id }); setFolha(null); avisar('Rascunho ligado'); }}>Cap. {numero(dados.capitulos, c)} · {c.titulo || 'Sem título'}</button>)}
          </div>
        </Sheet>
      )}
      {folha === 'tags' && (
        <Sheet titulo="Tags do rascunho" onClose={() => setFolha(null)}>
          <EscolherTags tags={r.tags} setTags={(t) => muda({ tags: t })} todas={tagsEmUso([...dados.rascunhos, ...dados.ideias])} />
        </Sheet>
      )}
      {folha === 'transferir' && (
        <Sheet titulo={`Transferir “${r.titulo || 'Sem título'}”`} onClose={() => setFolha(null)}>
          {caps.length === 0 ? <div className="meta">Crie um capítulo primeiro (pelo + do livro).</div> : (
            <>
              <div className="lbl" style={{ marginTop: 0 }}>Para</div>
              <div className="menu" style={{ maxHeight: 200, overflowY: 'auto' }}>
                {caps.map((c) => <button key={c.id} className={destino === c.id ? 'on' : ''} onClick={() => setDestino(c.id)}>Cap. {numero(dados.capitulos, c)} · {c.titulo || 'Sem título'}</button>)}
              </div>
              <div className="lbl">Onde</div>
              <div className="row"><button className={`chip${onde === 'fim' ? ' on' : ''}`} onClick={() => setOnde('fim')}>No fim</button><button className={`chip${onde === 'inicio' ? ' on' : ''}`} onClick={() => setOnde('inicio')}>No início</button></div>
              <div className="srow" style={{ padding: '14px 2px' }}><span>Manter o rascunho original</span><Toggle on={manter} onChange={setManter} label="Manter o rascunho original" /></div>
              <button className="btn full" onClick={transferir}>Transferir</button>
              <div className="meta" style={{ marginTop: 8 }}>“Como nova cena” chega com as cenas (F4).</div>
            </>
          )}
        </Sheet>
      )}
      {folha === 'excluir' && (
        <Sheet onClose={() => setFolha(null)}>
          <div className="confirm">
            <h4>Excluir este rascunho?</h4>
            <p>Isso não pode ser desfeito. Se quiser guardar, transfira para um capítulo antes.</p>
            <div className="row2">
              <button className="btn ghost" onClick={() => setFolha(null)}>Cancelar</button>
              <button className="btn danger" onClick={() => { mudar((d) => ({ ...d, rascunhos: d.rascunhos.filter((x) => x.id !== r.id) })); avisar('Rascunho excluído'); ir({ tela: 'area', id: livroId, area: 'rascunhos' }, true); }}>Excluir</button>
            </div>
          </div>
        </Sheet>
      )}
    </>
  );
}
