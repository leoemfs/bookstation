import { useEffect, useState } from 'react';
import type { Ajustes as A, Tema } from '../data.ts';
import { exportar, nomeArquivo } from '../backup.ts';
import { espacoUsado } from '../db.ts';
import { naLixeira } from '../livros.ts';
import { capsNaLixeira } from '../capitulos.ts';
import { Importar } from '../Importar.tsx';
import { ir, useApp } from '../store.tsx';
import { Topo } from '../Topo.tsx';
import { avisar, baixarArquivo, Sheet, Toggle } from '../ui.tsx';
import { VERSAO } from '../versao.ts';

export function Ajustes() {
  const { dados, mudar } = useApp();
  const [espaco, setEspaco] = useState<number | null>(null);
  const [politica, setPolitica] = useState(false);
  useEffect(() => { espacoUsado().then(setEspaco); }, [dados]);
  const set = (p: Partial<A>) => mudar((d) => ({ ...d, ajustes: { ...d.ajustes, ...p } }));
  const lixo = naLixeira(dados.livros).length + capsNaLixeira(dados.capitulos).length;
  const breve = <span className="pill t-azul">Em breve</span>;
  return (
    <>
      <Topo cima="Biblioteca" tela="Ajustes" />
      <main className="scroll">
        <div className="lbl">Personalização</div>
        <div className="set">
          <div className="srow"><span>Barra de baixo se recolhe ao rolar</span><Toggle on={dados.ajustes.barraRecolhe} onChange={(v) => set({ barraRecolhe: v })} label="Barra de baixo se recolhe ao rolar" /></div>
        </div>
        <div className="lbl">Tema</div>
        <div className="set">
          <div className="srow"><span>Aparência do app</span>
            <div className="seg">{(['escuro', 'claro', 'sistema'] as Tema[]).map((t) => <button key={t} className={dados.ajustes.tema === t ? 'on' : ''} onClick={() => set({ tema: t })}>{t[0].toUpperCase() + t.slice(1)}</button>)}</div>
          </div>
        </div>
        <div className="lbl">Sincronização</div>
        <div className="set"><div className="srow"><span>Conta Google</span>{breve}</div></div>
        <div className="lbl">Integrações</div>
        <div className="set"><div className="srow"><span>IA dentro do app</span>{breve}</div></div>
        <div className="lbl">Armazenamento</div>
        <div className="set">
          <div className="srow"><span>Espaço usado neste aparelho</span><span className="sv">{espaco === null ? '—' : `${(espaco / 1048576).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB`}</span></div>
          <button className="srow" onClick={() => { baixarArquivo(nomeArquivo('backup', Date.now()), exportar(dados, Date.now())); avisar('Backup baixado. Guarde o arquivo num lugar seguro.'); }}><span>Fazer backup em arquivo</span><span className="sv">›</span></button>
          <Importar className="srow"><span>Restaurar backup</span><span className="sv">›</span></Importar>
          <button className="srow" onClick={() => ir({ tela: 'lixeira' })}><span>Lixeira</span><span className="sv">{lixo} {lixo === 1 ? 'item' : 'itens'} ›</span></button>
        </div>
        <div className="meta" style={{ margin: '8px 2px' }}>Seus livros ficam só neste aparelho. Faça backup de vez em quando.</div>
        <div className="lbl">Privacidade</div>
        <div className="set"><button className="srow" onClick={() => setPolitica(true)}><span>Política de privacidade</span><span className="sv">›</span></button></div>
        <div className="meta" style={{ textAlign: 'center', margin: '24px 0 8px' }}>BookStation · versão {VERSAO}</div>
      </main>
      {politica && (
        <Sheet titulo="Política de privacidade" onClose={() => setPolitica(false)}>
          <div style={{ fontSize: 14, lineHeight: 1.6 }}>
            <p style={{ marginTop: 0 }}>O BookStation guarda seus livros <b>somente neste aparelho</b>, no armazenamento do navegador.</p>
            <p>Nada é enviado para servidores, e não há contas, anúncios ou rastreamento.</p>
            <p>O backup é um arquivo que você baixa e guarda onde quiser.</p>
            <p style={{ marginBottom: 0 }} className="meta">Quando houver sincronização com o Google ou comunidade, esta política será atualizada antes, e você poderá escolher se quer usar.</p>
          </div>
        </Sheet>
      )}
    </>
  );
}
