import { useEffect, useRef, useState } from 'react';
import { normalize, type Dados } from './data.ts';
import { dbGet, dbSet, pedirPersistencia } from './db.ts';
import { limparLixeira } from './livros.ts';
import { Importar } from './Importar.tsx';
import { lerRota, type Rota } from './router.ts';
import { Ctx, ir } from './store.tsx';
import { avisar, Icon, Sheet, Toasts, type IconName } from './ui.tsx';
import { Ajustes } from './telas/Ajustes.tsx';
import { Biblioteca } from './telas/Biblioteca.tsx';
import { EmBreve } from './telas/EmBreve.tsx';
import { Lixeira } from './telas/Lixeira.tsx';
import { NovoLivro } from './telas/NovoLivro.tsx';
import { Painel } from './telas/Painel.tsx';

const CHAVE = 'dados';

export function App() {
  const [dados, setDados] = useState<Dados | null>(null);
  const [rota, setRota] = useState<Rota>(() => lerRota(location.hash));
  const [mais, setMais] = useState(false);
  const [some, setSome] = useState(false);
  const avisouReserva = useRef(false);
  const mudou = useRef(false);

  useEffect(() => {
    dbGet<unknown>(CHAVE).then((raw) => {
      const d = normalize(raw);
      setDados({ ...d, livros: limparLixeira(d.livros, Date.now()) });
    }, () => setDados(normalize(undefined)));
    const onHash = () => { setRota(lerRota(location.hash)); setMais(false); scrollTo(0, 0); setSome(false); };
    addEventListener('hashchange', onHash);
    return () => removeEventListener('hashchange', onHash);
  }, []);

  // tema
  const tema = dados?.ajustes.tema ?? 'escuro';
  useEffect(() => {
    const aplicar = () => {
      const t = tema === 'sistema' ? (matchMedia('(prefers-color-scheme: light)').matches ? 'claro' : 'escuro') : tema;
      document.documentElement.dataset.theme = t;
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', t === 'claro' ? '#f6f4ef' : '#0b0b0d');
      try { localStorage.setItem('bookstation:tema', t); } catch { /* ignora */ }
    };
    aplicar();
    const mq = matchMedia('(prefers-color-scheme: light)');
    mq.addEventListener('change', aplicar);
    return () => mq.removeEventListener('change', aplicar);
  }, [tema]);

  // barra de baixo some ao rolar para baixo e volta ao subir
  const recolhe = dados?.ajustes.barraRecolhe ?? true;
  useEffect(() => {
    if (!recolhe) { setSome(false); return; }
    let y0 = scrollY;
    const f = () => { const y = scrollY; if (y > y0 + 6 && y > 60) setSome(true); else if (y < y0 - 6) setSome(false); y0 = y; };
    addEventListener('scroll', f, { passive: true });
    return () => removeEventListener('scroll', f);
  }, [recolhe]);

  // grava sozinho depois de cada mudança feita pela pessoa
  useEffect(() => {
    if (!dados || !mudou.current) return;
    dbSet(CHAVE, dados).then((r) => {
      if (r === 'reserva' && !avisouReserva.current) { avisouReserva.current = true; avisar('Salvo no modo reserva do navegador. Faça um backup.'); }
    }, () => avisar('Não deu para salvar. Faça um backup agora.'));
    pedirPersistencia();
  }, [dados]);

  if (!dados) return null;

  const mudar = (fn: (d: Dados) => Dados) => { mudou.current = true; setDados((d) => fn(d!)); };

  const noLivro = rota.tela === 'livro' || rota.tela === 'area';
  const livroId = noLivro ? rota.id : '';
  const barra: [IconName, string, Rota | null][] = noLivro
    ? [['casa', 'Painel', { tela: 'livro', id: livroId }], ['lista', 'Capítulos', { tela: 'area', id: livroId, area: 'capitulos' }], ['mais', '', null], ['pessoa', 'Fichas', { tela: 'area', id: livroId, area: 'fichas' }], ['ideia', 'Ideias', { tela: 'area', id: livroId, area: 'ideias' }]]
    : [['lib', 'Biblioteca', { tela: 'biblioteca' }], ['ideia', 'Ideias', { tela: 'ideias' }], ['mais', '', null], ['globo', 'Comunidade', { tela: 'comunidade' }], ['engrenagem', 'Ajustes', { tela: 'ajustes' }]];
  const ativo = (r: Rota | null) => !!r && JSON.stringify(r) === JSON.stringify(rota);
  const breve = (fase: string) => () => { setMais(false); avisar(`Chega na fase ${fase}`); };

  return (
    <Ctx.Provider value={{ dados, mudar }}>
      {rota.tela === 'biblioteca' && <Biblioteca />}
      {rota.tela === 'novo' && <NovoLivro />}
      {rota.tela === 'livro' && <Painel id={rota.id} key={rota.id} />}
      {rota.tela === 'area' && <EmBreve area={rota.area} livroId={rota.id} />}
      {rota.tela === 'lixeira' && <Lixeira />}
      {rota.tela === 'ajustes' && <Ajustes />}
      {(rota.tela === 'ideias' || rota.tela === 'comunidade') && <EmBreve area={rota.tela} />}

      {rota.tela !== 'novo' && (
        <nav className={`tabbar${some ? ' some' : ''}`} aria-label="Navegação">
          {barra.map(([ic, nome, r]) =>
            r ? (
              <button key={nome} className={ativo(r) ? 'on' : ''} aria-current={ativo(r) ? 'page' : undefined} onClick={() => ir(r)}>
                <Icon n={ic} />{nome}
              </button>
            ) : (
              <button key="mais" className="mais" aria-label="Criar" onClick={() => setMais(true)}><Icon n="mais" /></button>
            ),
          )}
        </nav>
      )}

      {mais && (
        <Sheet titulo={noLivro ? `Criar em ${dados.livros.find((l) => l.id === livroId)?.titulo ?? 'livro'}` : 'Criar na Biblioteca'} onClose={() => setMais(false)}>
          <div className="acts">
            {noLivro ? (
              <>
                {([['ideia', 'Ideia rápida', 'F3'], ['lista', 'Capítulo', 'F4'], ['rascunho', 'Rascunho', 'F3'], ['pessoa', 'Personagem', 'F5'], ['local', 'Local', 'F5'], ['imagem', 'Imagem', 'F5']] as [IconName, string, string][]).map(([ic, t, f]) => (
                  <button key={t} className="act breve" onClick={breve(f)}><span className="ic"><Icon n={ic} /></span>{t}<small>em breve</small></button>
                ))}
                <div className="sep" />
                <button className="act breve" onClick={breve('F5')}><span className="ic"><Icon n="estrela" /></span>Categorias<small>em breve</small></button>
              </>
            ) : (
              <>
                <button className="act" onClick={() => { setMais(false); ir({ tela: 'novo' }); }}><span className="ic"><Icon n="livro" /></span>Novo livro</button>
                <button className="act breve" onClick={breve('F3')}><span className="ic"><Icon n="ideia" /></span>Ideia solta<small>em breve</small></button>
                <Importar className="act"><span className="ic"><Icon n="enviar" /></span>Importar backup</Importar>
              </>
            )}
          </div>
        </Sheet>
      )}
      <Toasts />
    </Ctx.Provider>
  );
}
