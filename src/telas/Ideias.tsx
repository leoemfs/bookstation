import { useState } from 'react';
import type { Ideia } from '../data.ts';
import { filtrarIdeias, ideiaParaRascunho, novaIdeia, tagsEmUso } from '../ideias.ts';
import { novoId, quando } from '../livros.ts';
import { ir, useApp } from '../store.tsx';
import { Topo } from '../Topo.tsx';
import { avisar, Icon, Sheet } from '../ui.tsx';

/** Seletor de tags: as padrão + as próprias + criar nova. */
export function EscolherTags({ tags, setTags, todas }: { tags: string[]; setTags: (t: string[]) => void; todas: string[] }) {
  const [nova, setNova] = useState('');
  const lista = [...new Set([...todas, ...tags])];
  return (
    <div className="wrapchips">
      {lista.map((t) => (
        <button key={t} type="button" className={`chip${tags.includes(t) ? ' on' : ''}${t === 'Cocriação IA' ? ' ia' : ''}`} onClick={() => setTags(tags.includes(t) ? tags.filter((x) => x !== t) : [...tags, t])}>{t}</button>
      ))}
      <input className="chip nova" value={nova} placeholder="+ tag" aria-label="Nova tag" onChange={(e) => setNova(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter' && nova.trim()) { e.preventDefault(); setTags([...new Set([...tags, nova.trim()])]); setNova(''); } }}
        onBlur={() => { if (nova.trim()) { setTags([...new Set([...tags, nova.trim()])]); setNova(''); } }} />
    </div>
  );
}

/** Captura rápida (caixa ou folha): escrever e pronto, organiza depois. */
export function CapturaIdeia({ livroId, aoSalvar, autoFocus }: { livroId: string | null; aoSalvar?: () => void; autoFocus?: boolean }) {
  const { dados, mudar } = useApp();
  const [texto, setTexto] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const salvar = () => {
    if (!texto.trim()) return;
    mudar((d) => ({ ...d, ideias: [...d.ideias, novaIdeia(texto, livroId, tags, Date.now(), novoId())] }));
    setTexto('');
    setTags([]);
    avisar('Ideia guardada');
    aoSalvar?.();
  };
  return (
    <div className="captura">
      <textarea className="inp" value={texto} autoFocus={autoFocus} onChange={(e) => setTexto(e.target.value)} placeholder="Uma frase, um diálogo, uma virada… Escreva e pronto." aria-label="Nova ideia" rows={3} />
      {texto.trim() && (
        <>
          <EscolherTags tags={tags} setTags={setTags} todas={tagsEmUso(dados.ideias)} />
          <button className="btn full" onClick={salvar}>Guardar ideia</button>
        </>
      )}
    </div>
  );
}

export function Ideias({ livroId }: { livroId: string | null }) {
  const { dados, mudar } = useApp();
  const [tag, setTag] = useState<string | null>(null);
  const [arquivadas, setArquivadas] = useState(false);
  const [menu, setMenu] = useState<Ideia | null>(null);
  const [levar, setLevar] = useState<Ideia | null>(null);
  const livro = livroId ? dados.livros.find((l) => l.id === livroId) : null;
  const todas = dados.ideias.filter((i) => i.livroId === livroId);
  const lista = filtrarIdeias(dados.ideias, livroId, { tag, arquivadas });
  const usadas = tagsEmUso(todas).filter((t) => todas.some((i) => i.tags.includes(t)));
  const agora = Date.now();
  const livrosAtivos = dados.livros.filter((l) => l.excluidoEm === null);
  const muda = (id: string, p: Partial<Ideia>) => mudar((d) => ({ ...d, ideias: d.ideias.map((i) => (i.id === id ? { ...i, ...p } : i)) }));
  const virarRascunho = (i: Ideia, lid: string) => {
    const r = ideiaParaRascunho(i, lid, Date.now(), novoId());
    mudar((d) => ({ ...d, rascunhos: [...d.rascunhos, r], ideias: d.ideias.map((x) => (x.id === i.id ? { ...x, arquivada: true } : x)) }));
    avisar('Virou rascunho. A ideia foi arquivada.');
    ir({ tela: 'rascunho', id: lid, rasc: r.id });
  };

  return (
    <>
      <Topo cima={livro ? livro.titulo : 'Biblioteca'} tela={livro ? 'Ideias' : 'Ideias soltas'} />
      <main className="scroll">
        {!livro && <div className="sub" style={{ marginTop: 0 }}>Ideias que ainda não têm livro. Depois dá para levar cada uma para um livro.</div>}
        {!arquivadas && <CapturaIdeia livroId={livroId} />}
        {(usadas.length > 0 || todas.some((i) => i.arquivada)) && (
          <>
            <div className="lbl">Filtrar</div>
            <div className="row">
              <button className={`chip${!tag && !arquivadas ? ' on' : ''}`} onClick={() => { setTag(null); setArquivadas(false); }}>Todas {todas.filter((i) => !i.arquivada).length}</button>
              {usadas.map((t) => <button key={t} className={`chip${tag === t ? ' on' : ''}${t === 'Cocriação IA' ? ' ia' : ''}`} onClick={() => { setTag(tag === t ? null : t); setArquivadas(false); }}>{t}</button>)}
              {todas.some((i) => i.arquivada) && <button className={`chip${arquivadas ? ' on' : ''}`} onClick={() => { setArquivadas(!arquivadas); setTag(null); }}>Arquivadas</button>}
            </div>
          </>
        )}
        <div className="lbl">{arquivadas ? 'Arquivadas' : 'Para organizar'} · {lista.length}</div>
        <div className="stack">
          {lista.map((i) => (
            <button key={i.id} className="card ideia" onClick={() => setMenu(i)}>
              <div className="txt">{i.texto}</div>
              <div className="tags">{i.tags.map((t) => <span key={t} className={`tag${t === 'Cocriação IA' ? ' ia' : ''}`}>{t}</span>)}<span className="meta">{quando(i.criadoEm, agora)}</span></div>
            </button>
          ))}
          {lista.length === 0 && <div className="vazio" style={{ padding: 20 }}>{arquivadas ? 'Nenhuma ideia arquivada.' : 'Nenhuma ideia aqui ainda.'}</div>}
        </div>
      </main>
      {menu && (
        <Sheet titulo={menu.texto.length > 60 ? menu.texto.slice(0, 57) + '…' : menu.texto} onClose={() => setMenu(null)}>
          <div className="menu">
            {livroId ? (
              <button onClick={() => { setMenu(null); virarRascunho(menu, livroId); }}><span className="ic"><Icon n="rascunho" /></span>Transformar em rascunho</button>
            ) : (
              <button onClick={() => { setLevar(menu); setMenu(null); }}><span className="ic"><Icon n="livro" /></span>Levar para um livro</button>
            )}
            <button onClick={() => { muda(menu.id, { tags: menu.tags.includes('Cocriação IA') ? menu.tags.filter((t) => t !== 'Cocriação IA') : [...menu.tags, 'Cocriação IA'] }); setMenu(null); }}><span className="ic"><Icon n="estrela" /></span>{menu.tags.includes('Cocriação IA') ? 'Tirar de “Cocriação IA”' : 'Marcar “Cocriação IA”'}</button>
            <button onClick={() => { muda(menu.id, { arquivada: !menu.arquivada }); setMenu(null); avisar(menu.arquivada ? 'Ideia de volta' : 'Ideia arquivada'); }}><span className="ic"><Icon n="arquivo" /></span>{menu.arquivada ? 'Desarquivar' : 'Arquivar'}</button>
            <button className="danger" onClick={() => { const x = menu; mudar((d) => ({ ...d, ideias: d.ideias.filter((i) => i.id !== x.id) })); setMenu(null); avisar('Ideia excluída'); }}><span className="ic"><Icon n="lixo" /></span>Excluir</button>
          </div>
          <div className="meta" style={{ marginTop: 8 }}>Ligar a capítulo, personagem ou local chega nas próximas fases.</div>
        </Sheet>
      )}
      {levar && (
        <Sheet titulo="Levar para qual livro?" onClose={() => setLevar(null)}>
          <div className="menu">
            {livrosAtivos.map((l) => <button key={l.id} onClick={() => { muda(levar.id, { livroId: l.id }); setLevar(null); avisar(`Ideia levada para “${l.titulo}”`); }}><span className="ic"><Icon n="livro" /></span>{l.titulo}</button>)}
            {livrosAtivos.length === 0 && <div className="meta" style={{ padding: 10 }}>Crie um livro primeiro.</div>}
          </div>
        </Sheet>
      )}
    </>
  );
}
