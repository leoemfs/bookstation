import type { SituacaoCap } from './data.ts';

/** Cor e nome de cada situação de capítulo, na ordem da barra de andamento. */
export const CAPS_TONS: [SituacaoCap, string, string][] = [
  ['concluido', 'var(--green)', 'concluídos'],
  ['revisao', 'var(--violet)', 'em revisão'],
  ['escrita', 'var(--accent)', 'em escrita'],
  ['rascunho', 'var(--faint)', 'rascunho'],
  ['planejado', 'var(--blue)', 'planejados'],
];
