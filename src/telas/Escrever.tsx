import { useState } from 'react';
import { contar, numero, salvarTexto } from '../capitulos.ts';
import { EditorTexto } from '../Editor.tsx';
import { useApp } from '../store.tsx';
import { Topo } from '../Topo.tsx';

/** Tela de escrever um capítulo. */
export function Escrever({ livroId, capId }: { livroId: string; capId: string }) {
  const { dados, mudar } = useApp();
  const livro = dados.livros.find((l) => l.id === livroId && l.excluidoEm === null);
  const cap = dados.capitulos.find((c) => c.id === capId && c.livroId === livroId);
  const [salvando, setSalvando] = useState(false);
  const [conta, setConta] = useState(() => ({ palavras: cap?.palavras ?? 0, caracteres: cap?.caracteres ?? 0 }));
  if (!livro || !cap) {
    return (
      <>
        <Topo cima="Biblioteca" tela="Capítulo" />
        <main className="scroll"><div className="vazio"><b>Capítulo não encontrado</b></div></main>
      </>
    );
  }
  const n = numero(dados.capitulos, cap);
  const salvar = (patch: (d: typeof dados) => typeof dados) => {
    const agora = Date.now();
    mudar((d) => {
      const x = patch(d);
      return { ...x, livros: x.livros.map((l) => (l.id === livroId ? { ...l, editadoEm: agora } : l)) };
    });
  };
  return (
    <>
      <Topo
        cima={livro.titulo}
        tela={`Cap. ${n}`}
        direita={<span className={`salvo${salvando ? ' ing' : ''}`} role="status"><i />{salvando ? 'Salvando…' : 'Salvo'}</span>}
      />
      <main className="scroll escrever">
        <div className="pagina">
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
            onDigitando={(t) => { setSalvando(true); setConta(contar(t)); }}
            onChange={(doc, texto) => { salvar((d) => ({ ...d, capitulos: salvarTexto(d.capitulos, cap.id, doc, texto, Date.now()) })); setSalvando(false); }}
          />
        </div>
        <div className="ed-rodape"><span>{conta.palavras.toLocaleString('pt-BR')} palavras · {conta.caracteres.toLocaleString('pt-BR')} caracteres</span><span>Salva sozinho</span></div>
      </main>
    </>
  );
}
