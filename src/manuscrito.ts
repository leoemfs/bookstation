import type { Editor } from '@tiptap/react';

/** Liga/desliga o bloco manuscrito no parágrafo do cursor (fica fora do Editor.tsx para não puxar o editor junto). */
export function alternarManuscrito(e: Editor) {
  const m = !!e.getAttributes('paragraph').manuscrito;
  e.chain().focus().setParagraph().updateAttributes('paragraph', { manuscrito: !m }).run();
}
