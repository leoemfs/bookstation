import { ir } from '../store.tsx';

/** Abas do topo: partes do mesmo conteúdo do livro (Capítulos · Rascunhos · Estrutura). */
export function AbasLivro({ livroId, atual }: { livroId: string; atual: 'capitulos' | 'rascunhos' | 'estrutura' }) {
  return (
    <div className="abas" role="tablist">
      {([['capitulos', 'Capítulos'], ['rascunhos', 'Rascunhos'], ['estrutura', 'Estrutura']] as const).map(([k, l]) => (
        <button key={k} role="tab" aria-selected={atual === k} className={atual === k ? 'on' : ''} onClick={() => atual !== k && ir({ tela: 'area', id: livroId, area: k }, true)}>{l}</button>
      ))}
    </div>
  );
}
