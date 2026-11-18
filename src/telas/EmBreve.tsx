import { AREAS } from '../router.ts';
import { useApp } from '../store.tsx';
import { Topo } from '../Topo.tsx';
import { Icon, type IconName } from '../ui.tsx';

const TEXTOS: Record<string, [IconName, string]> = {
  ideias: ['ideia', 'Captura rápida de ideias, com tags (inclusive “Cocriação IA”), para organizar depois.'],
  comunidade: ['globo', 'Uma experiência de leitura e publicação dentro do app: feed de prévias, livros em cartões e leitura com virada de página.'],
  capitulos: ['lista', 'Criar, reordenar e acompanhar capítulos e cenas.'],
  rascunhos: ['rascunho', 'Rascunhos soltos, com vínculo opcional a capítulos e transferência sem perder o original.'],
  editor: ['caneta', 'Editor com fontes, cor da página, bloco manuscrito, comandos / e salvamento automático.'],
  guia: ['bussola', 'Identidade, direção narrativa e planejamento do livro, tudo opcional.'],
  biblia: ['estrela', 'As regras do mundo do livro, num lugar só.'],
};

/** Telas que ainda vão ser construídas: dizem o que vem e em qual fase. */
export function EmBreve({ area, livroId }: { area: string; livroId?: string }) {
  const { dados } = useApp();
  const livro = livroId ? dados.livros.find((l) => l.id === livroId) : undefined;
  const info = AREAS[area] ?? { nome: area === 'comunidade' ? 'Comunidade' : 'Ideias', fase: area === 'comunidade' ? 'final' : 'F3' };
  const [ic, txt] = TEXTOS[area] ?? (['pessoa', 'Fichas com perguntas para ajudar e “aparece em”.'] as [IconName, string]);
  return (
    <>
      <Topo cima={livro ? livro.titulo : 'Biblioteca'} tela={info.nome} />
      <main className="scroll">
        <div className="vazio">
          <div className="ic"><Icon n={ic} /></div>
          <span className="pill t-azul" style={{ marginBottom: 10 }}>Em breve</span>
          <b>{info.nome}</b>
          {txt}
          <div className="meta" style={{ marginTop: 10 }}>{info.fase === 'final' ? 'Entra no fim da fila de construção.' : `Chega na fase ${info.fase}.`}</div>
        </div>
      </main>
    </>
  );
}
