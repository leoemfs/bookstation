import { useEffect, useRef, useState } from 'react';
import { TextSelection } from '@tiptap/pm/state';
import type { Aparencia, Dados } from '../data.ts';
import { contar, numero, salvarTexto } from '../capitulos.ts';
import { chaveBusca, EditorTexto } from '../Editor.tsx';
import { ativo } from '../editorAtivo.ts';
import { novoId, quando } from '../livros.ts';
import { useApp } from '../store.tsx';
import { Topo } from '../Topo.tsx';
import { antesDeRestaurar, doCapitulo, guardarComNome, registrarAuto, textoDe, type Versao } from '../versoes.ts';
import { avisar, Icon, Sheet } from '../ui.tsx';

const ATALHOS: [string, string][] = [
  ['Negrito', 'Ctrl B'],
  ['Itálico', 'Ctrl I'],
  ['Sublinhado', 'Ctrl U'],
  ['Tachado', 'Ctrl Shift S'],
  ['Desfazer / refazer', 'Ctrl Z / Ctrl Y'],
  ['Título 1, 2, 3', 'Ctrl Alt 1, 2, 3'],
  ['Parágrafo normal', 'Ctrl Alt 0'],
  ['Buscar no texto', 'Ctrl F'],
  ['Histórico', 'Ctrl H'],
  ['Sem distrações', 'Ctrl Shift F (Esc sai)'],
];

type Folha = null | 'historico' | 'atalhos' | { ver: Versao } | 'nomear';

/** Tela de escrever um capítulo. */
export function Escrever({ livroId, capId }: { livroId: string; capId: string }) {
  const { dados, mudar } = useApp();
  const livro = dados.livros.find((l) => l.id === livroId && l.excluidoEm === null);
  const cap = dados.capitulos.find((c) => c.id === capId && c.livroId === livroId);
  const [salvando, setSalvando] = useState(false);
  const [conta, setConta] = useState(() => ({ palavras: cap?.palavras ?? 0, caracteres: cap?.caracteres ?? 0 }));
  const [buscando, setBuscando] = useState(false);
  const [termo, setTermo] = useState('');
  const [achados, setAchados] = useState({ n: 0, atual: 0 });
  const [foco, setFoco] = useState(false);
  const [folha, setFolha] = useState<Folha>(null);
  const [nome, setNome] = useState('');
  const campoBusca = useRef<HTMLInputElement>(null);

  // Ao abrir, guarda uma cópia automática do texto como estava (histórico).
  useEffect(() => {
    const c = dados.capitulos.find((x) => x.id === capId);
    if (c) mudar((d) => { const v = registrarAuto(d.versoes, c, Date.now(), novoId()); return v === d.versoes ? d : { ...d, versoes: v }; });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [capId]);

  // Modo sem distrações: some tudo que não é o texto.
  useEffect(() => {
    document.body.classList.toggle('modo-foco', foco);
    return () => document.body.classList.remove('modo-foco');
  }, [foco]);

  // Atalhos do computador.
  useEffect(() => {
    const k = (ev: KeyboardEvent) => {
      const ctrl = ev.ctrlKey || ev.metaKey;
      if (ctrl && !ev.shiftKey && ev.key.toLowerCase() === 'f') { ev.preventDefault(); abrirBusca(); }
      else if (ctrl && !ev.shiftKey && ev.key.toLowerCase() === 'h') { ev.preventDefault(); setFolha('historico'); }
      else if (ctrl && ev.shiftKey && ev.key.toLowerCase() === 'f') { ev.preventDefault(); setFoco((v) => !v); }
      else if (ev.key === 'Escape' && foco) setFoco(false);
    };
    addEventListener('keydown', k);
    return () => removeEventListener('keydown', k);
  });

  if (!livro || !cap) {
    return (
      <>
        <Topo cima="Biblioteca" tela="Capítulo" />
        <main className="scroll"><div className="vazio"><b>Capítulo não encontrado</b></div></main>
      </>
    );
  }
  const n = numero(dados.capitulos, cap);
  const ap = livro.aparencia;
  const versoes = doCapitulo(dados.versoes, cap.id);

  const salvar = (fn: (d: Dados) => Dados) => {
    const agora = Date.now();
    mudar((d) => {
      const x = fn(d);
      return { ...x, livros: x.livros.map((l) => (l.id === livroId ? { ...l, editadoEm: agora } : l)) };
    });
  };
  const setAparencia = (a: Partial<Aparencia>) => mudar((d) => ({ ...d, livros: d.livros.map((l) => (l.id === livroId ? { ...l, aparencia: { ...l.aparencia, ...a } } : l)) }));

  function buscar(t: string, atual = 0) {
    const e = ativo.editor;
    if (!e) return;
    e.view.dispatch(e.state.tr.setMeta(chaveBusca, { termo: t, atual }));
    const s = chaveBusca.getState(e.state);
    setAchados({ n: s?.achados.length ?? 0, atual: s?.atual ?? 0 });
    const a = s?.achados[s.atual];
    if (a) {
      e.view.dispatch(e.state.tr.setSelection(TextSelection.create(e.state.doc, a.from, a.to)));
      const el = e.view.domAtPos(a.from).node as HTMLElement;
      (el.nodeType === 1 ? el : el.parentElement)?.scrollIntoView({ block: 'center', behavior: 'smooth' });
    }
  }
  function abrirBusca() {
    setBuscando(true);
    setTimeout(() => { campoBusca.current?.focus(); campoBusca.current?.select(); if (termo) buscar(termo, achados.atual); }, 0);
  }
  function fecharBusca() {
    setBuscando(false);
    const e = ativo.editor;
    if (e) e.view.dispatch(e.state.tr.setMeta(chaveBusca, { termo: '', atual: 0 }));
    setAchados({ n: 0, atual: 0 });
  }
  const ir = (d: number) => achados.n && buscar(termo, (achados.atual + d + achados.n) % achados.n);

  function restaurar(v: Versao) {
    const e = ativo.editor;
    if (!e) return;
    mudar((d) => ({ ...d, versoes: antesDeRestaurar(d.versoes, d.capitulos.find((c) => c.id === cap!.id)!, Date.now(), novoId()) }));
    e.commands.setContent(v.conteudo, { emitUpdate: true });
    setFolha(null);
    avisar('Versão restaurada. O texto de antes ficou guardado no histórico.');
  }

  return (
    <>
      <Topo
        cima={livro.titulo}
        tela={`Cap. ${n}`}
        direita={
          <>
            <span className={`salvo${salvando ? ' ing' : ''}`} role="status"><i />{salvando ? 'Salvando…' : 'Salvo'}</span>
            <button className="ib" aria-label="Buscar no capítulo" onClick={() => (buscando ? fecharBusca() : abrirBusca())}><Icon n={buscando ? 'fechar' : 'busca'} /></button>
          </>
        }
      />
      {buscando && (
        <div className="busca">
          <input ref={campoBusca} value={termo} placeholder="Buscar no capítulo" aria-label="Buscar no capítulo"
            onChange={(ev) => { setTermo(ev.target.value); buscar(ev.target.value); }}
            onKeyDown={(ev) => { if (ev.key === 'Enter') { ev.preventDefault(); ir(ev.shiftKey ? -1 : 1); } if (ev.key === 'Escape') fecharBusca(); }} />
          <span className="meta" style={{ minWidth: 58, textAlign: 'center' }}>{termo.trim() ? (achados.n ? `${achados.atual + 1} de ${achados.n}` : 'nenhum') : ''}</span>
          <button className="ib" aria-label="Achado anterior" disabled={!achados.n} onClick={() => ir(-1)}><span style={{ fontSize: 16 }}>↑</span></button>
          <button className="ib" aria-label="Próximo achado" disabled={!achados.n} onClick={() => ir(1)}><span style={{ fontSize: 16 }}>↓</span></button>
        </div>
      )}
      <main className={`scroll escrever${buscando ? ' com-busca' : ''}`}>
        <div className={`pagina pg-${ap.pagina} f-${ap.fonte}`} style={{ fontSize: ap.tamanho }}>
          <div className="cap-num">Capítulo {n}</div>
          <input
            className="cap-titulo"
            value={cap.titulo}
            placeholder="Título do capítulo"
            aria-label="Título do capítulo"
            onChange={(e) => { const t = e.target.value; salvar((d) => ({ ...d, capitulos: d.capitulos.map((c) => (c.id === cap.id ? { ...c, titulo: t, editadoEm: Date.now() } : c)) })); }}
          />
          <EditorTexto
            key={cap.id}
            doc={cap.conteudo}
            aparencia={ap}
            onAparencia={setAparencia}
            acoes={{ buscar: abrirBusca, historico: () => setFolha('historico'), foco: () => setFoco(true), atalhos: () => setFolha('atalhos') }}
            onDigitando={(t) => { setSalvando(true); setConta(contar(t)); }}
            onChange={(doc, texto) => { salvar((d) => ({ ...d, capitulos: salvarTexto(d.capitulos, cap.id, doc, texto, Date.now()) })); setSalvando(false); }}
          />
        </div>
        <div className="ed-rodape"><span>{conta.palavras.toLocaleString('pt-BR')} palavras · {conta.caracteres.toLocaleString('pt-BR')} caracteres</span><span>Salva sozinho</span></div>
      </main>

      {foco && (
        <>
          <button className="foco-sair" onClick={() => setFoco(false)}>Sair do modo foco</button>
          <div className="foco-conta">{conta.palavras.toLocaleString('pt-BR')} palavras</div>
        </>
      )}

      {folha === 'historico' && (
        <Sheet titulo="Histórico do capítulo" onClose={() => setFolha(null)}>
          <div className="versoes">
            <div className="ver"><div>Agora<small>{cap.palavras.toLocaleString('pt-BR')} palavras</small></div><span className="pill t-verde">atual</span></div>
            {versoes.map((v) => (
              <div className="ver" key={v.id}>
                <div>{quando(v.quando, Date.now())}<small>{v.nome ? `“${v.nome}” · ` : 'cópia automática · '}{v.palavras.toLocaleString('pt-BR')} palavras</small></div>
                <button onClick={() => setFolha({ ver: v })}>Ver</button>
              </div>
            ))}
            {versoes.length === 0 && <div className="meta" style={{ padding: '10px 4px' }}>Ainda sem versões. Uma cópia automática é guardada quando você abre o capítulo (se o texto mudou há mais de meia hora). Dá para guardar uma versão com nome a qualquer momento.</div>}
          </div>
          <button className="btn ghost full" style={{ marginTop: 12 }} disabled={!cap.conteudo} onClick={() => { setNome(''); setFolha('nomear'); }}>Guardar esta versão com nome</button>
        </Sheet>
      )}
      {folha === 'nomear' && (
        <Sheet titulo="Guardar versão" onClose={() => setFolha('historico')}>
          <div className="field"><label htmlFor="nv">Nome da versão</label><input id="nv" className="inp" autoFocus value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Antes da revisão" /></div>
          <button className="btn full" onClick={() => { mudar((d) => ({ ...d, versoes: guardarComNome(d.versoes, d.capitulos.find((c) => c.id === cap.id)!, nome, Date.now(), novoId()) })); setFolha('historico'); avisar('Versão guardada'); }}>Guardar</button>
        </Sheet>
      )}
      {folha && typeof folha === 'object' && (
        <Sheet titulo={`${folha.ver.nome || 'Cópia automática'} · ${quando(folha.ver.quando, Date.now())}`} onClose={() => setFolha('historico')}>
          <div className="ver-texto">{textoDe(folha.ver.conteudo)}</div>
          <div className="row2" style={{ marginTop: 12 }}>
            <button className="btn ghost" onClick={() => setFolha('historico')}>Voltar</button>
            <button className="btn" onClick={() => restaurar(folha.ver)}>Restaurar esta</button>
          </div>
        </Sheet>
      )}
      {folha === 'atalhos' && (
        <Sheet titulo="Atalhos no computador" onClose={() => setFolha(null)}>
          <div className="atalhos">{ATALHOS.map(([a, b]) => <div key={a}><span>{a}</span><kbd>{b}</kbd></div>)}</div>
        </Sheet>
      )}
    </>
  );
}
