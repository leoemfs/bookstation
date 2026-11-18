/** Estado do app: dados carregados do aparelho, gravação automática e navegação. */
import { createContext, useContext } from 'react';
import type { Dados } from './data.ts';
import { hashDe, type Rota } from './router.ts';
import { consumirEntradaFolha } from './ui.tsx';

export interface App {
  dados: Dados;
  mudar: (fn: (d: Dados) => Dados) => void;
}
export const Ctx = createContext<App | null>(null);
export function useApp(): App {
  const a = useContext(Ctx);
  if (!a) throw new Error('fora do app');
  return a;
}

export function ir(r: Rota, trocar = false) {
  const h = hashDe(r);
  if (consumirEntradaFolha() || trocar) location.replace(h);
  else location.hash = h;
}
