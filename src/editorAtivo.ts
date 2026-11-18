import type { Editor } from '@tiptap/react';

/** O editor aberto agora (o + da barra de baixo insere nele). Fica fora do Editor.tsx para o editor carregar só quando abrir. */
export const ativo: { editor: Editor | null } = { editor: null };
