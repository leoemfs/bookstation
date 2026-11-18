import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { normalize, type Dados } from './data.ts';
import { dbGet, dbSet, gravarEmergencia, lerEmergencia, pedirPersistencia } from './db.ts';
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
const Escrever = lazy(() => import('./telas/Escrever.tsx').then((m) => ({ default: m.Escrever })));
import { novoCapitulo, semOrfaos } from './capitulos.ts';
import { novoId } from './livros.ts';
import { ativo as edAtivo } from './editorAtivo.ts';

const CHAVE = 'dados';

export function App() {
  const [dados, setDados] = useState<Dados | null>(null);
  const [rota, setRota] = useState<Rota>(() => lerRota(location.hash));
  const [mais, setMais] = useState(false);
  const [some, setSome] = useState(false);
  const avisouReserva = useRef(false);
  const atual = useRef<Dados | null>(null);

  useEffect(() => {
    dbGet<unknown>(CHAVE).then((raw) => {
      // usa a cópia mais nova: a do banco ou a de emergência (gravada ao fechar o app)
      const banco = normalize(raw);
      const emerg = lerEmergencia();
      const e = emerg ? normalize(emerg) : null;
      const d = e && e.salvoEm > banco.salvoEm ? e : banco;
      if (d === e) dbSet(CHAVE, e);
      const ok = { ...d, livros: limparLixeira(d.livros, Date.now()) };
      atual.current = ok;
      setDados(ok);
    }, () => {
      atual.current = normalize(undefined);
      setDados(atual.current);
    });
    const aoFechar = () => { if (document.visibilityState === 'hidden' && atual.current) gravarEmergencia(atual.current); };
    const aoSair = () => { if (atual.current) gravarEmergencia(atual.current); };
    document.addEventListener('visibilitychange', aoFechar);
    addEventListener('pagehide', aoSair);
    const onHash = () => { setRota(lerRota(location.hash)); setMais(false); scrollTo(0, 0); setSome(false); };
    addEventListener('hashchange', onHash);
    return () => {
      removeEventListener('hashchange', onHash);
      document.removeEventListener('visibilitychange', aoFechar);
      removeEventListener('pagehide', aoSair);
    };
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

  if (!dados) return null;

  // Cada mudança é gravada na hora (também ao fechar o app no meio da digitação).
  const mudar = (fn: (d: Dados) => Dados) => {
    const d = atual.current!;
    let n = { ...fn(d), salvoEm: Date.now() };
    // capítulos de livros que saíram de vez também saem
    if (n.livros !== d.livros) n = { ...n, capitulos: semOrfaos(n.capitulos, new Set(n.livros.map((l) => l.id))) };
    atual.current = n;
    setDados(n);
    dbSet(CHAVE, n).then((r) => {
      if (r === 'reserva' && !avisouReserva.current) { avisouReserva.current = true; avisar('Salvo no modo reserva do navegador. Faça um backup.'); }
    }, () => avisar('Não deu para salvar. Faça um backup agora.'));
    pedirPersistencia();
  };

  const noLivro = rota.tela === 'livro' || rota.tela === 'area' || rota.tela === 'editor';
  const noEditor = rota.tela === 'editor';
  const livroId = noLivro ? rota.id : '';
  const barra: [IconName, string, Rota | null | (() => void)][] = noEditor
    ? [['lista', 'Capítulos', { tela: 'area', id: livroId, area: 'capitulos' }], ['pessoa', 'Fichas', { tela: 'area', id: livroId, area: 'fichas' }], ['mais', '', null], ['copia', 'Copiar p/ IA', () => avisar('Copiar para IA chega na F3')], ['livro', 'Ler', () => avisar('A leitura chega na F8')]]
    : noLivro
    ? [['casa', 'Painel', { tela: 'livro', id: livroId }], ['lista', 'Capítulos', { tela: 'area', id: livroId, area: 'capitulos' }], ['mais', '', null], ['pessoa', 'Fichas', { tela: 'area', id: livroId, area: 'fichas' }], ['ideia', 'Ideias', { tela: 'area', id: livroId, area: 'ideias' }]]
    : [['lib', 'Biblioteca', { tela: 'biblioteca' }], ['ideia', 'Ideias', { tela: 'ideias' }], ['mais', '', null], ['globo', 'Comunidade', { tela: 'comunidade' }], ['engrenagem', 'Ajustes', { tela: 'ajustes' }]];
  const ativo = (r: Rota | null | (() => void)) => !!r && typeof r !== 'function' && JSON.stringify(r) === JSON.stringify(rota);
  const novoCap = () => {
    const id = novoId();
    mudar((d) => ({ ...d, capitulos: [...d.capitulos, novoCapitulo(d.capitulos, livroId, Date.now(), id)] }));
    setMais(false);
    ir({ tela: 'editor', id: livroId, cap: id });
  };
  const inserir = (fn: () => void) => () => { setMais(false); setTimeout(fn, 0); };
  const breve = (fase: string) => () => { setMais(false); avisar(`Chega na fase ${fase}`); };

  return (
    <Ctx.Provider value={{ dados, mudar }}>
      {rota.tela === 'biblioteca' && <Biblioteca />}
      {rota.tela === 'novo' && <NovoLivro />}
      {rota.tela === 'livro' && <Painel id={rota.id} key={rota.id} />}
      {rota.tela === 'area' && <EmBreve area={rota.area} livroId={rota.id} />}
      {rota.tela === 'editor' && <Suspense fallback={null}><Escrever livroId={rota.id} capId={rota.cap} key={rota.cap} /></Suspense>}
      {rota.tela === 'lixeira' && <Lixeira />}
      {rota.tela === 'ajustes' && <Ajustes />}
      {(rota.tela === 'ideias' || rota.tela === 'comunidade') && <EmBreve area={rota.tela} />}

      {rota.tela !== 'novo' && (
        <nav className={`tabbar${some ? ' some' : ''}`} aria-label="Navegação">
          {barra.map(([ic, nome, r]) =>
            r ? (
              <button key={nome} className={ativo(r) ? 'on' : ''} aria-current={ativo(r) ? 'page' : undefined} onClick={() => (typeof r === 'function' ? r() : ir(r))}>
                <Icon n={ic} />{nome}
              </button>
            ) : (
              <button key="mais" className="mais" aria-label="Criar" onClick={() => setMais(true)}><Icon n="mais" /></button>
            ),
          )}
        </nav>
      )}

      {mais && (
        <Sheet titulo={noEditor ? 'Inserir no capítulo' : noLivro ? `Criar em ${dados.livros.find((l) => l.id === livroId)?.titulo ?? 'livro'}` : 'Criar na Biblioteca'} onClose={() => setMais(false)}>
          <div className="acts">
            {noEditor ? (
              <>
                <button className="act" onClick={inserir(() => edAtivo.editor?.chain().focus().setHorizontalRule().run())}><span className="ic" style={{ fontSize: 18 }}>⁂</span>Separador</button>
                <button className="act" onClick={inserir(() => edAtivo.editor?.chain().focus().toggleBlockquote().run())}><span className="ic" style={{ fontSize: 18 }}>❝</span>Citação</button>
                <button className="act" onClick={novoCap}><span className="ic"><Icon n="lista" /></span>Novo capítulo</button>
                {([['pessoa', 'Personagem', 'F5'], ['local', 'Local', 'F5'], ['clima', 'Clima', 'F5'], ['caneta', 'Bloco manuscrito', 'F2 parte 2'], ['rascunho', 'Trazer rascunho', 'F3'], ['ideia', 'Ideia rápida', 'F3']] as [IconName, string, string][]).map(([ic, t, f]) => (
                  <button key={t} className="act breve" onClick={breve(f)}><span className="ic"><Icon n={ic} /></span>{t}<small>em breve</small></button>
                ))}
              </>
            ) : noLivro ? (
              <>
                <button className="act" onClick={novoCap}><span className="ic"><Icon n="lista" /></span>Capítulo</button>
                {([['ideia', 'Ideia rápida', 'F3'], ['rascunho', 'Rascunho', 'F3'], ['pessoa', 'Personagem', 'F5'], ['local', 'Local', 'F5'], ['imagem', 'Imagem', 'F5']] as [IconName, string, string][]).map(([ic, t, f]) => (
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
