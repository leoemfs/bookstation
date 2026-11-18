/** Restaurar backup: escolhe o arquivo, confere e pergunta antes de trocar tudo. */
import { useRef, useState, type ReactNode } from 'react';
import { importar, juntarLivro, type Importado } from './backup.ts';
import { novoId } from './livros.ts';
import { useApp } from './store.tsx';
import { avisar, Sheet } from './ui.tsx';

export function Importar({ children, className }: { children: ReactNode; className?: string }) {
  const { mudar } = useApp();
  const inp = useRef<HTMLInputElement>(null);
  const [lido, setLido] = useState<Importado | null>(null);
  async function escolheu(f: File | undefined) {
    if (!f) return;
    try {
      setLido(importar(await f.text(), Date.now()));
    } catch (e) {
      avisar((e as Error).message);
    }
    if (inp.current) inp.current.value = '';
  }
  return (
    <>
      <button type="button" className={className} onClick={() => inp.current?.click()}>
        {children}
      </button>
      <input ref={inp} type="file" accept="application/json,.json" hidden onChange={(e) => escolheu(e.target.files?.[0])} />
      {lido?.tipo === 'livro' && (
        <Sheet onClose={() => setLido(null)}>
          <div className="confirm">
            <h4>Importar “{lido.livro.titulo}”?</h4>
            <p>O livro entra na Biblioteca com {lido.capitulos.length} {lido.capitulos.length === 1 ? 'capítulo' : 'capítulos'}. Nada do que você já tem é apagado.</p>
            <div className="row2">
              <button className="btn ghost" onClick={() => setLido(null)}>Cancelar</button>
              <button className="btn" onClick={() => { const { livro: l, capitulos: cs } = lido; mudar((d) => juntarLivro(d, l, cs, novoId)); setLido(null); avisar('Livro importado'); }}>Importar</button>
            </div>
          </div>
        </Sheet>
      )}
      {lido?.tipo === 'tudo' && (
        <Sheet onClose={() => setLido(null)}>
          <div className="confirm">
            <h4>Restaurar este backup?</h4>
            <p>Tem {lido.dados.livros.length} {lido.dados.livros.length === 1 ? 'livro' : 'livros'}. Ele <b>substitui</b> tudo o que está neste aparelho agora. Se tiver dúvida, faça um backup antes.</p>
            <div className="row2">
              <button className="btn ghost" onClick={() => setLido(null)}>Cancelar</button>
              <button className="btn danger" onClick={() => { const d2 = lido.dados; mudar(() => d2); setLido(null); avisar('Backup restaurado'); }}>Substituir tudo</button>
            </div>
          </div>
        </Sheet>
      )}
    </>
  );
}
