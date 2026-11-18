/**
 * Editor de texto dos capítulos (F2, parte 1). Base copiada do editor do CP Hub e adaptada para livros.
 * - Barra em 2 linhas no celular; "Mais" abre o resto.
 * - Avisa as mudanças pouco depois de parar de digitar (quem chama salva) e ao sair da tela.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import { Extension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import { Placeholder } from '@tiptap/extensions';
import type { Doc } from './data.ts';
import { Sheet } from './ui.tsx';
import { ativo } from './editorAtivo.ts';

/** Recuo da primeira linha do parágrafo (como em livro impresso). */
const Recuo = Extension.create({
  name: 'recuo',
  addGlobalAttributes() {
    return [{ types: ['paragraph'], attributes: { recuo: { default: false, parseHTML: (el) => el.classList.contains('recuo'), renderHTML: (a) => (a.recuo ? { class: 'recuo' } : {}) } } }];
  },
});

type Bloco = 'p' | 'h1' | 'h2' | 'h3' | 'quote';
const BLOCOS: { v: Bloco; l: string }[] = [
  { v: 'p', l: 'Parágrafo' },
  { v: 'h1', l: 'Título 1' },
  { v: 'h2', l: 'Título 2' },
  { v: 'h3', l: 'Título 3' },
  { v: 'quote', l: 'Citação' },
];
function blocoAtual(e: Editor): Bloco {
  for (const n of [1, 2, 3] as const) if (e.isActive('heading', { level: n })) return `h${n}`;
  if (e.isActive('blockquote')) return 'quote';
  return 'p';
}
function mudarBloco(e: Editor, b: Bloco) {
  let c = e.chain().focus();
  if (e.isActive('blockquote') && b !== 'quote') c = c.toggleBlockquote();
  if (b === 'p') c = c.setParagraph();
  else if (b === 'quote') c = e.isActive('blockquote') ? c : c.setParagraph().toggleBlockquote();
  else c = c.setHeading({ level: Number(b[1]) as 1 | 2 | 3 });
  c.run();
}


function Btn({ label, on, onClick, disabled, children, className = '' }: { label: string; on?: boolean; onClick: () => void; disabled?: boolean; children: ReactNode; className?: string }) {
  return (
    // onMouseDown: não tira o cursor do texto ao tocar no botão.
    <button type="button" className={`ed-btn${on ? ' on' : ''} ${className}`} aria-label={label} title={label} aria-pressed={on} disabled={disabled} onMouseDown={(e) => e.preventDefault()} onClick={onClick}>
      {children}
    </button>
  );
}

export function EditorTexto({ doc, onChange, onDigitando }: { doc: Doc | null; onChange: (doc: Doc, texto: string) => void; onDigitando?: (texto: string) => void }) {
  const [mais, setMais] = useState(false);
  const timer = useRef<number | undefined>(undefined);
  const ultimo = useRef(onChange);
  ultimo.current = onChange;
  const pendente = useRef<Editor | null>(null);
  const salvar = () => {
    window.clearTimeout(timer.current);
    if (pendente.current) ultimo.current(pendente.current.getJSON() as Doc, pendente.current.getText({ blockSeparator: '\n' }));
    pendente.current = null;
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] }, link: false, code: false, codeBlock: false }),
      Highlight,
      Recuo,
      Placeholder.configure({ placeholder: ({ node }) => (node.type.name === 'heading' ? 'Título' : 'Comece a escrever…') }),
    ],
    content: doc ?? undefined,
    shouldRerenderOnTransaction: true,
    editorProps: { attributes: { class: 'ed-texto', 'aria-label': 'Texto do capítulo', role: 'textbox', 'aria-multiline': 'true', spellcheck: 'true', lang: 'pt-BR' } },
    onUpdate: ({ editor: e }) => {
      pendente.current = e;
      onDigitando?.(e.getText({ blockSeparator: '\n' }));
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(salvar, 700);
    },
    onBlur: salvar,
  });

  useEffect(() => {
    ativo.editor = editor;
    return () => {
      if (ativo.editor === editor) ativo.editor = null;
    };
  }, [editor]);

  // Ao sair da tela (ou fechar o app), salva o que ainda estava esperando.
  useEffect(() => {
    const aoSair = () => salvar();
    addEventListener('pagehide', aoSair);
    document.addEventListener('visibilitychange', aoSair);
    return () => {
      salvar();
      removeEventListener('pagehide', aoSair);
      document.removeEventListener('visibilitychange', aoSair);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!editor) return null;
  const e = editor;
  const recuo = !!e.getAttributes('paragraph').recuo;

  return (
    <>
      <div className="ed-barra" role="toolbar" aria-label="Formatação">
        <div className="ed-linha">
          <select className="ed-tipo" aria-label="Estilo do parágrafo" value={blocoAtual(e)} onChange={(ev) => mudarBloco(e, ev.target.value as Bloco)}>
            {BLOCOS.map((b) => <option key={b.v} value={b.v}>{b.l}</option>)}
          </select>
          <Btn label="Negrito" on={e.isActive('bold')} onClick={() => e.chain().focus().toggleBold().run()}><b>N</b></Btn>
          <Btn label="Itálico" on={e.isActive('italic')} onClick={() => e.chain().focus().toggleItalic().run()}><i style={{ fontFamily: 'var(--f-book)' }}>I</i></Btn>
          <Btn label="Destaque" on={e.isActive('highlight')} onClick={() => e.chain().focus().toggleHighlight().run()}><span className="ed-hl">A</span></Btn>
          <Btn label="Lista" on={e.isActive('bulletList')} onClick={() => e.chain().focus().toggleBulletList().run()}><span className="ed-txt">•≡</span></Btn>
        </div>
        <div className="ed-linha">
          <Btn label="Sublinhado" on={e.isActive('underline')} onClick={() => e.chain().focus().toggleUnderline().run()}><u>S</u></Btn>
          <Btn label="Tachado" on={e.isActive('strike')} onClick={() => e.chain().focus().toggleStrike().run()}><s>T</s></Btn>
          <Btn label="Desfazer" disabled={!e.can().undo()} onClick={() => e.chain().focus().undo().run()}><span className="ed-txt">↶</span></Btn>
          <Btn label="Refazer" disabled={!e.can().redo()} onClick={() => e.chain().focus().redo().run()}><span className="ed-txt">↷</span></Btn>
          <Btn label="Mais ferramentas" className="ed-mais" onClick={() => setMais(true)}><span className="ed-txt">Mais</span></Btn>
        </div>
      </div>
      <EditorContent editor={e} />
      {mais && (
        <Sheet titulo="Mais ferramentas" onClose={() => setMais(false)}>
          <div className="acts">
            {([
              ['1.', 'Lista numerada', e.isActive('orderedList'), () => e.chain().focus().toggleOrderedList().run()],
              ['❝', 'Citação', e.isActive('blockquote'), () => mudarBloco(e, e.isActive('blockquote') ? 'p' : 'quote')],
              ['⁂', 'Separador', false, () => e.chain().focus().setHorizontalRule().run()],
              ['⇥', recuo ? 'Tirar recuo' : 'Recuo', recuo, () => e.chain().focus().updateAttributes('paragraph', { recuo: !recuo }).run()],
              ['⇤', 'Limpar formatação', false, () => e.chain().focus().unsetAllMarks().clearNodes().run()],
            ] as [string, string, boolean, () => void][]).map(([s, l, on, fn]) => (
              <button key={l} className={`act${on ? ' on' : ''}`} onMouseDown={(ev) => ev.preventDefault()} onClick={() => { setMais(false); fn(); }}>
                <span className="ic" style={{ fontSize: 18, fontWeight: 600 }}>{s}</span>{l}
              </button>
            ))}
          </div>
          <div className="meta" style={{ marginTop: 12 }}>Na parte 2 do editor chegam: fontes e cor da página, bloco manuscrito, busca, histórico e modo sem distrações.</div>
        </Sheet>
      )}
    </>
  );
}
