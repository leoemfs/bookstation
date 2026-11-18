import type { ReactNode } from 'react';
import { Icon } from './ui.tsx';
import { acima, lerRota } from './router.ts';
import { ir } from './store.tsx';

/** Barra de cima: ‹ sobe um nível; título com no máximo dois níveis ("Livro / Tela"). */
export function Topo({ cima, tela, direita }: { cima?: string; tela: string; direita?: ReactNode }) {
  const pai = acima(lerRota(location.hash));
  return (
    <header className="top">
      {pai && (
        <button className="ib back" aria-label="Voltar" onClick={() => ir(pai)}>
          <Icon n="voltar" />
        </button>
      )}
      <div className={`t${cima ? '' : ' solo'}`} style={pai ? undefined : { paddingLeft: 8 }}>
        {cima && <span>{cima} / </span>}
        <b>{tela}</b>
      </div>
      {direita}
    </header>
  );
}
