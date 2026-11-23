/**
 * Editor de texto dos capítulos (F2). Base copiada do editor do CP Hub e adaptada para livros.
 * - Barra em 2 linhas; "Aa" (aparência) e "Mais" abrem o resto.
 * - Avisa as mudanças pouco depois de parar de digitar (quem chama salva) e ao sair da tela.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { EditorContent, useEditor, type Editor } from '@tiptap/react';
import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';
import type { Node as PMNode } from '@tiptap/pm/model';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import { Placeholder } from '@tiptap/extensions';
import type { Aparencia, CorPagina, Doc } from './data.ts';
import { encontrar } from './busca.ts';
import { Sheet } from './ui.tsx';
import { ativo } from './editorAtivo.ts';
import { alternarManuscrito } from './manuscrito.ts';

/** Recuo da primeira linha e bloco manuscrito: marcações do parágrafo. */
const Paragrafo = Extension.create({
  name: 'paragrafoExtra',
  addGlobalAttributes() {
    const bool = (classe: string) => ({ default: false, parseHTML: (el: HTMLElement) => el.classList.contains(classe), renderHTML: (a: Record<string, unknown>) => (a[classe] ? { class: classe } : {}) });
    return [{ types: ['paragraph'], attributes: { recuo: bool('recuo'), manuscrito: bool('manuscrito') } }];
  },
});

/* ---------- busca no texto (destaca os achados sem mexer no texto) ---------- */
interface EstadoBusca { termo: string; atual: number; achados: { from: number; to: number }[] }
export const chaveBusca = new PluginKey<EstadoBusca>('busca');
function achar(doc: PMNode, termo: string): { from: number; to: number }[] {
  const out: { from: number; to: number }[] = [];
  if (!termo.trim()) return out;
  doc.descendants((node, pos) => {
    if (!node.isTextblock) return true;
    let txt = '';
    const mapa: number[] = [];
    node.forEach((filho, off) => {
      if (filho.isText && filho.text) {
        for (let i = 0; i < filho.text.length; i++) mapa.push(pos + 1 + off + i);
        txt += filho.text;
      } else {
        mapa.push(pos + 1 + off);
        txt += '￼';
      }
    });
    for (const [a, b] of encontrar(txt, termo)) out.push({ from: mapa[a], to: mapa[b - 1] + 1 });
    return false;
  });
  return out;
}
const Busca = Extension.create({
  name: 'busca',
  addProseMirrorPlugins() {
    return [
      new Plugin<EstadoBusca>({
        key: chaveBusca,
        state: {
          init: () => ({ termo: '', atual: 0, achados: [] }),
          apply(tr, ant, _old, novo) {
            const meta = tr.getMeta(chaveBusca) as Partial<EstadoBusca> | undefined;
            if (!meta && !tr.docChanged) return ant;
            const termo = meta?.termo ?? ant.termo;
            const achados = achar(novo.doc, termo);
            return { termo, achados, atual: Math.min(meta?.atual ?? ant.atual, Math.max(0, achados.length - 1)) };
          },
        },
        props: {
          decorations(state) {
            const s = chaveBusca.getState(state);
            if (!s || !s.achados.length) return DecorationSet.empty;
            return DecorationSet.create(state.doc, s.achados.map((a, i) => Decoration.inline(a.from, a.to, { class: i === s.atual ? 'achado atual' : 'achado' })));
          },
        },
      }),
    ];
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
export function mudarBloco(e: Editor, b: Bloco) {
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

export const CORES_PAGINA: { v: CorPagina; l: string; cor: string }[] = [
  { v: 'branca', l: 'Branca', cor: '#fbfaf7' },
  { v: 'preta', l: 'Preta', cor: '#111113' },
  { v: 'papel', l: 'Papel antigo', cor: '#efe3c4' },
];

/**
 * No celular, a faixa de formatação fica colada em cima do teclado. Se a linha do cursor ficar
 * atrás dela (ou do teclado), a página rola o suficiente para o cursor aparecer logo acima da faixa. (Copiado do CP Hub.)
 */
function cursorVisivel(e: Editor) {
  requestAnimationFrame(() => {
    if (e.isDestroyed) return;
    const barra = e.view.dom.closest('.ed')?.querySelector('.ed-barra') as HTMLElement | null;
    if (!barra || getComputedStyle(barra).position !== 'fixed') return;
    let c: { top: number; bottom: number };
    try {
      c = e.view.coordsAtPos(e.state.selection.head);
    } catch {
      return;
    }
    const limite = barra.getBoundingClientRect().top - 16;
    if (c.bottom > limite) window.scrollBy({ top: c.bottom - limite, behavior: 'auto' });
    else if (c.top < 76) window.scrollBy({ top: c.top - 76, behavior: 'auto' });
  });
}

export interface Acoes { buscar: () => void; historico: () => void; foco: () => void; atalhos: () => void }

export function EditorTexto({ doc, onChange, onDigitando, aparencia, onAparencia, acoes }: {
  doc: Doc | null;
  onChange: (doc: Doc, texto: string) => void;
  onDigitando?: (texto: string) => void;
  aparencia: Aparencia;
  onAparencia: (a: Partial<Aparencia>) => void;
  acoes: Partial<Acoes>;
}) {
  const [folha, setFolha] = useState<null | 'mais' | 'aa'>(null);
  // No celular, a faixa de formatação só aparece editando, colada em cima do teclado.
  const [editando, setEditando] = useState(false);
  const caixa = useRef<HTMLDivElement>(null);
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
      Paragrafo,
      Busca,
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
    onFocus: ({ editor: e }) => {
      setEditando(true);
      // O teclado leva um instante para abrir: confere de novo depois.
      window.setTimeout(() => cursorVisivel(e), 350);
    },
    onSelectionUpdate: ({ editor: e }) => cursorVisivel(e),
    onBlur: () => {
      salvar();
      // Tocar no seletor de estilo da faixa não conta como sair do texto.
      window.setTimeout(() => { if (!caixa.current?.querySelector('.ed-barra')?.contains(document.activeElement)) setEditando(false); }, 0);
    },
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
  const manuscrito = !!e.getAttributes('paragraph').manuscrito;
  const fechar = () => setFolha(null);
  const faz = (fn: () => void) => () => { fechar(); fn(); };

  return (
    <div className={`ed${editando ? ' editing' : ''}`} ref={caixa}>
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
          <Btn label="Aparência" on={folha === 'aa'} onClick={() => { e.commands.blur(); setFolha('aa'); }}><span style={{ fontFamily: 'var(--f-book)', fontWeight: 600 }}>Aa</span></Btn>
          <Btn label="Desfazer" disabled={!e.can().undo()} onClick={() => e.chain().focus().undo().run()}><span className="ed-txt">↶</span></Btn>
          <Btn label="Refazer" disabled={!e.can().redo()} onClick={() => e.chain().focus().redo().run()}><span className="ed-txt">↷</span></Btn>
          <Btn label="Mais ferramentas" className="ed-mais" onClick={() => { e.commands.blur(); setFolha('mais'); }}><span className="ed-txt">Mais</span></Btn>
          {/* Só no celular, com a faixa colada no teclado: fecha o teclado. */}
          <Btn label="Pronto" className="ed-pronto" onClick={() => { e.commands.blur(); (document.activeElement as HTMLElement | null)?.blur(); setEditando(false); }}><span className="ed-txt">Pronto</span></Btn>
        </div>
      </div>
      <EditorContent editor={e} />

      {folha === 'aa' && (
        <Sheet titulo="Aparência da escrita" onClose={fechar}>
          <div className="lbl" style={{ marginTop: 0 }}>Fonte do texto</div>
          <div className="seg grande">
            <button className={aparencia.fonte === 'literaria' ? 'on' : ''} style={{ fontFamily: 'var(--f-book)' }} onClick={() => onAparencia({ fonte: 'literaria' })}>Literária</button>
            <button className={aparencia.fonte === 'simples' ? 'on' : ''} onClick={() => onAparencia({ fonte: 'simples' })}>Simples</button>
          </div>
          <div className="lbl">Parágrafo atual</div>
          <div className="seg grande">
            <button className={manuscrito ? 'on' : ''} style={{ fontFamily: 'var(--f-mao)', fontSize: 19 }} onMouseDown={(ev) => ev.preventDefault()} onClick={faz(() => alternarManuscrito(e))}>Bloco manuscrito</button>
            <button className={recuo ? 'on' : ''} onMouseDown={(ev) => ev.preventDefault()} onClick={faz(() => e.chain().focus().updateAttributes('paragraph', { recuo: !recuo }).run())}>Recuo</button>
          </div>
          <div className="lbl">Tamanho da letra · {aparencia.tamanho}</div>
          <div className="seg grande">
            <button disabled={aparencia.tamanho <= 13} onClick={() => onAparencia({ tamanho: aparencia.tamanho - 1 })}>A−</button>
            <button disabled={aparencia.tamanho >= 24} onClick={() => onAparencia({ tamanho: aparencia.tamanho + 1 })}>A+</button>
          </div>
          <div className="lbl">Cor da página</div>
          <div className="cores">
            {CORES_PAGINA.map((c) => (
              <button key={c.v} className={aparencia.pagina === c.v ? 'on' : ''} onClick={() => onAparencia({ pagina: c.v })} aria-label={c.l} aria-pressed={aparencia.pagina === c.v}>
                <i style={{ background: c.cor }} />{c.l}
              </button>
            ))}
          </div>
          <div className="meta" style={{ marginTop: 12 }}>Vale só para este livro. A cor da página não depende do tema do app.</div>
        </Sheet>
      )}

      {folha === 'mais' && (
        <Sheet titulo="Mais ferramentas" onClose={fechar}>
          <div className="acts quatro">
            {([
              ['T̶', 'Tachado', e.isActive('strike'), () => e.chain().focus().toggleStrike().run()],
              ['1.', 'Lista numerada', e.isActive('orderedList'), () => e.chain().focus().toggleOrderedList().run()],
              ['❝', 'Citação', e.isActive('blockquote'), () => mudarBloco(e, e.isActive('blockquote') ? 'p' : 'quote')],
              ['⁂', 'Separador', false, () => e.chain().focus().setHorizontalRule().run()],
              ['⇥', 'Recuo', recuo, () => e.chain().focus().updateAttributes('paragraph', { recuo: !recuo }).run()],
              ['✎', 'Manuscrito', manuscrito, () => alternarManuscrito(e)],
              ['⌕', 'Buscar', false, acoes.buscar],
              ['⟲', 'Histórico', false, acoes.historico],
              ['◻', 'Sem distrações', false, acoes.foco],
              ['⌘', 'Atalhos', false, acoes.atalhos],
              ['⇤', 'Limpar formatação', false, () => e.chain().focus().unsetAllMarks().clearNodes().updateAttributes('paragraph', { recuo: false, manuscrito: false }).run()],
            ] as [string, string, boolean, (() => void) | undefined][]).filter((x): x is [string, string, boolean, () => void] => !!x[3]).map(([s, l, on, fn]) => (
              <button key={l} className={`act${on ? ' on' : ''}`} onMouseDown={(ev) => ev.preventDefault()} onClick={faz(fn)}>
                <span className="ic" style={{ fontSize: 18, fontWeight: 600 }}>{s}</span>{l}
              </button>
            ))}
          </div>
        </Sheet>
      )}
    </div>
  );
}
