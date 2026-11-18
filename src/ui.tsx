/** Componentes de tela do BookStation (ícones, folha, aviso, capa, alavanca). */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { CAPAS, SITUACOES, type Livro, type Situacao } from './data.ts';

const P = {
  lib: '<path d="M3 5h4v14H3zM9 5h4v14H9zM15.5 5.5l3.5-1 3 13.5-3.5 1z"/>',
  busca: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4-4"/>',
  ideia: '<path d="M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2.1h5c0-.9.4-1.6 1-2.1A6 6 0 0 0 12 3z"/>',
  lixo: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
  mais: '<path d="M12 5v14M5 12h14"/>',
  casa: '<path d="M4 11l8-7 8 7v9h-5v-6H9v6H4z"/>',
  lista: '<path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01"/>',
  pessoa: '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4.5-6 8-6s7 2 8 6"/>',
  local: '<path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/>',
  caneta: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/>',
  rascunho: '<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/>',
  imagem: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-8 8"/>',
  clima: '<path d="M7 18h10a4 4 0 0 0 .5-8A6 6 0 0 0 6 9.5 4.3 4.3 0 0 0 7 18z"/>',
  bussola: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  estrela: '<path d="M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.5 6.7 19.4l1.2-6L3.4 9.3l6-.7z"/>',
  enviar: '<path d="M12 16V4M7 9l5-5 5 5M5 20h14"/>',
  baixar: '<path d="M12 4v12M7 11l5 5 5-5M5 20h14"/>',
  globo: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/>',
  engrenagem: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  pontos: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
  voltar: '<path d="M15 5l-7 7 7 7"/>',
  fechar: '<path d="M6 6l12 12M18 6L6 18"/>',
  copia: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
  arquivo: '<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v10h14V9M10 13h4"/>',
  desfazer: '<path d="M9 14L4 9l5-5"/><path d="M4 9h11a5 5 0 0 1 0 10h-3"/>',
  livro: '<path d="M3 5c3-1 6-1 9 1 3-2 6-2 9-1v14c-3-1-6-1-9 1-3-2-6-2-9-1z"/><path d="M12 6v14"/>',
};
export type IconName = keyof typeof P;
export function Icon({ n }: { n: IconName }) {
  return <svg className="i" viewBox="0 0 24 24" aria-hidden="true" dangerouslySetInnerHTML={{ __html: P[n] }} />;
}

/* ---------- aviso rápido ---------- */
type ToastFn = (t: string) => void;
let pushToast: ToastFn = () => {};
export const avisar: ToastFn = (t) => pushToast(t);
export function Toasts() {
  const [msg, setMsg] = useState<{ t: string; k: number } | null>(null);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    pushToast = (t) => {
      setMsg({ t, k: Date.now() });
      clearTimeout(timer);
      timer = setTimeout(() => setMsg(null), 2200);
    };
    return () => clearTimeout(timer);
  }, []);
  return msg ? <div className="toast" role="status" key={msg.k}>{msg.t}</div> : null;
}

/* ---------- folha que sobe de baixo; o voltar do celular fecha ----------
 * Uma entrada só no histórico para as folhas abertas: trocar de uma folha para outra não mexe no histórico,
 * o voltar do celular fecha a de cima, e navegar de dentro de uma folha troca essa entrada pela nova tela. */
let abertas = 0;
let temEntrada = false;
const fechadores: (() => void)[] = [];
if (typeof window !== 'undefined') {
  addEventListener('popstate', () => {
    if (temEntrada && !history.state?.folha) {
      temEntrada = false;
      fechadores[fechadores.length - 1]?.();
    }
  });
}
/** Chamado antes de navegar: se havia folha aberta, a nova tela ocupa o lugar dela no histórico. */
export function consumirEntradaFolha(): boolean {
  const tinha = temEntrada;
  temEntrada = false;
  return tinha;
}
export function Sheet({ titulo, onClose, children }: { titulo?: ReactNode; onClose: () => void; children: ReactNode }) {
  const fechar = useRef(onClose);
  fechar.current = onClose;
  useEffect(() => {
    const f = () => fechar.current();
    abertas++;
    fechadores.push(f);
    if (!temEntrada) {
      history.pushState({ folha: true }, '');
      temEntrada = true;
    }
    return () => {
      abertas--;
      fechadores.splice(fechadores.indexOf(f), 1);
      setTimeout(() => {
        if (abertas === 0 && temEntrada) {
          temEntrada = false;
          history.back();
        }
      }, 0);
    };
  }, []);
  return (
    <>
      <div className="shade" onClick={onClose} />
      <div className="sheet" role="dialog" aria-modal="true">
        <div className="grab" />
        {titulo && <h5>{titulo}</h5>}
        {children}
      </div>
    </>
  );
}

/* ---------- capa do livro ---------- */
export function Capa({ livro, w, h, fonte = 12 }: { livro: Pick<Livro, 'titulo' | 'capa' | 'capaImg'>; w: number; h: number; fonte?: number }) {
  if (livro.capaImg) return <div className="capa img" style={{ width: w, height: h, backgroundImage: `url(${livro.capaImg})` }} role="img" aria-label={`Capa de ${livro.titulo}`} />;
  return (
    <div className="capa" style={{ width: w, height: h, fontSize: fonte, background: `linear-gradient(160deg,${CAPAS[livro.capa] ?? CAPAS[0]})` }} aria-hidden="true">
      {livro.titulo}
    </div>
  );
}

export function PillSituacao({ s, livro }: { s: Situacao; livro?: Livro }) {
  if (livro?.arquivado) return <span className="pill t-cinza">Arquivado</span>;
  const x = SITUACOES.find((y) => y.v === s)!;
  return <span className={`pill t-${x.tom}`}>{x.l}</span>;
}

export function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return <button type="button" className={`tgl${on ? ' on' : ''}`} role="switch" aria-checked={on} aria-label={label} onClick={() => onChange(!on)} />;
}

/** Reduz uma imagem escolhida para caber como capa (JPEG até 600px), para não pesar no aparelho. */
export function comprimirImagem(arquivo: File, max = 600): Promise<string> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(arquivo);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Não deu para abrir esta imagem.'));
    };
    img.src = url;
  });
}

/** Baixa um texto como arquivo. */
export function baixarArquivo(nome: string, texto: string) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([texto], { type: 'application/json' }));
  a.download = nome;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
