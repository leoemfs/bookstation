import { useState } from 'react';
import { CAPAS, GENEROS, ROTEIROS, SITUACOES, type Livro } from '../data.ts';
import { exportarLivro, nomeArquivo } from '../backup.ts';
import { atualizar, duplicar, novoId, paraLixeira, quando } from '../livros.ts';
import { copiarCapitulos, doLivro, novoCapitulo, numero, ultimoEditado } from '../capitulos.ts';
import { CAPS_TONS } from '../tons.ts';
import { ir, useApp } from '../store.tsx';
import { Topo } from '../Topo.tsx';
import { avisar, baixarArquivo, Capa, comprimirImagem, Icon, PillSituacao, Sheet, type IconName } from '../ui.tsx';

const AREAS: [IconName, string, string, string][] = [
  ['lista', 'Capítulos', 'capitulos', 'lista completa na F4'],
  ['rascunho', 'Rascunhos', 'rascunhos', ''],
  ['ideia', 'Ideias', 'ideias', ''],
  ['pessoa', 'Personagens', 'personagens', 'chega na F5'],
  ['local', 'Locais', 'locais', 'chega na F5'],
  ['clima', 'Climas', 'climas', 'chega na F5'],
  ['imagem', 'Imagens', 'imagens', 'chega na F5'],
  ['bussola', 'Guia do livro', 'guia', 'identidade e tom'],
  ['estrela', 'Bíblia do universo', 'biblia', 'regras do mundo'],
];

type Folha = null | 'menu' | 'situacao' | 'editar' | 'excluir';

export function Painel({ id }: { id: string }) {
  const { dados, mudar } = useApp();
  const [folha, setFolha] = useState<Folha>(null);
  const l = dados.livros.find((x) => x.id === id && x.excluidoEm === null);
  if (!l) {
    return (
      <>
        <Topo cima="Biblioteca" tela="Livro" />
        <main className="scroll"><div className="vazio"><b>Livro não encontrado</b>Ele pode ter ido para a lixeira.<div style={{ marginTop: 16 }}><button className="btn ghost" onClick={() => ir({ tela: 'biblioteca' })}>Ir para a Biblioteca</button></div></div></main>
      </>
    );
  }
  const agora = Date.now();
  const roteiro = ROTEIROS.find((r) => r.v === l.roteiro)!;
  const caps = doLivro(dados.capitulos, l.id);
  const palavras = caps.reduce((s, c) => s + c.palavras, 0);
  const ultimo = ultimoEditado(dados.capitulos, l.id);
  const rascs = dados.rascunhos.filter((r) => r.livroId === l.id);
  const semCap = rascs.filter((r) => !r.capituloId).length;
  const ideias = dados.ideias.filter((i) => i.livroId === l.id && !i.arquivada);
  const set = (patch: Partial<Livro>) => mudar((d) => ({ ...d, livros: atualizar(d.livros, l.id, patch, Date.now()) }));
  const fechar = () => setFolha(null);

  return (
    <>
      <Topo cima="Biblioteca" tela={l.titulo} direita={<button className="ib" aria-label="Mais opções do livro" onClick={() => setFolha('menu')}><Icon n="pontos" /></button>} />
      <main className="scroll">
        <div className="bk">
          <Capa livro={l} w={86} h={124} />
          <div style={{ minWidth: 0, flex: 1 }}>
            <h1>{l.titulo}</h1>
            {l.generos.length > 0 && <div className="meta">{l.generos.join(' · ')}</div>}
            <div className="meta" style={{ color: 'var(--faint)', margin: '4px 0 8px' }}>editado {quando(l.editadoEm, agora)}</div>
            <button style={{ background: 'none', border: 0, padding: 0 }} onClick={() => setFolha('situacao')} aria-label="Trocar situação">
              <PillSituacao s={l.situacao} livro={l} /> <span className="meta">▾</span>
            </button>
          </div>
        </div>
        {l.descricao && <p className="meta" style={{ fontSize: 14, margin: '14px 2px 0' }}>{l.descricao}</p>}

        {ultimo ? (
          <button className="card hero" style={{ marginTop: 16 }} onClick={() => ir({ tela: 'editor', id: l.id, cap: ultimo.id })}>
            <div className="k">Continuar escrevendo</div>
            <h3>Cap. {numero(dados.capitulos, ultimo)}{ultimo.titulo ? ` · ${ultimo.titulo}` : ''}</h3>
            <div className="meta">{ultimo.trecho ? `Parou em “${ultimo.trecho}”` : 'Ainda sem texto'} · {ultimo.palavras.toLocaleString('pt-BR')} palavras</div>
          </button>
        ) : (
          <button className="card hero" style={{ marginTop: 16 }} onClick={() => { const cid = novoId(); mudar((d) => ({ ...d, capitulos: [...d.capitulos, novoCapitulo(d.capitulos, l.id, Date.now(), cid)] })); ir({ tela: 'editor', id: l.id, cap: cid }); }}>
            <div className="k">Comece a escrever</div>
            <h3>Capítulo 1</h3>
            <div className="meta">Toque para abrir o editor. Tudo salva sozinho.</div>
          </button>
        )}

        <div className="lbl">Andamento</div>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}><b>{caps.length} {caps.length === 1 ? 'capítulo' : 'capítulos'}</b><span className="meta">{palavras.toLocaleString('pt-BR')} palavras</span></div>
          <div className="barras">{caps.length > 0 && CAPS_TONS.map(([s, cor]) => { const k = caps.filter((c) => c.situacao === s).length; return k ? <i key={s} style={{ width: `${(k / caps.length) * 100}%`, background: cor }} /> : null; })}</div>
          {caps.length > 0 ? (
            <div className="meta" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>{CAPS_TONS.map(([s, cor, nome]) => { const k = caps.filter((c) => c.situacao === s).length; return k ? <span key={s}><i style={{ display: 'inline-block', width: 8, height: 8, borderRadius: 2, background: cor, marginRight: 5 }} />{k} {nome}</span> : null; })}</div>
          ) : (
            <div className="meta">Aqui aparece quantos capítulos estão planejados, em escrita, em revisão e concluídos. Serve para orientar, não para cobrar.</div>
          )}
          {caps.length > 0 && (
            <div className="stack" style={{ gap: 0, marginTop: 10 }}>
              {caps.map((c) => (
                <button key={c.id} className="dica" style={{ padding: '9px 0', borderTop: '1px solid var(--border)' }} onClick={() => ir({ tela: 'editor', id: l.id, cap: c.id })}>
                  <span className="meta" style={{ width: 22 }}>{numero(dados.capitulos, c)}</span><span>{c.titulo || 'Sem título'}</span><em>{c.palavras.toLocaleString('pt-BR')}</em>
                </button>
              ))}
            </div>
          )}
        </div>

        {(semCap > 0 || ideias.length > 0) && (
          <>
            <div className="lbl">Para organizar quando quiser</div>
            <div className="card stack" style={{ gap: 12 }}>
              {semCap > 0 && <button className="dica" onClick={() => ir({ tela: 'area', id: l.id, area: 'rascunhos' })}><span className="ic"><Icon n="rascunho" /></span><span>{semCap} {semCap === 1 ? 'rascunho sem capítulo' : 'rascunhos sem capítulo'}</span><em>Ver</em></button>}
              {ideias.length > 0 && <button className="dica" onClick={() => ir({ tela: 'area', id: l.id, area: 'ideias' })}><span className="ic"><Icon n="ideia" /></span><span>{ideias.length} {ideias.length === 1 ? 'ideia' : 'ideias'} na caixa de entrada</span><em>Ver</em></button>}
            </div>
          </>
        )}

        {roteiro.marcos.length > 0 && (
          <>
            <div className="lbl">Roteiro: {roteiro.l}</div>
            <div className="card"><div className="marcos" style={{ fontSize: 13, color: 'var(--muted)', marginTop: 0 }}>{roteiro.marcos.map((m, i) => `${i + 1}. ${m}`).join('  ·  ')}</div></div>
          </>
        )}

        <div className="lbl">Áreas do livro</div>
        <div className="grid2">
          {AREAS.map(([ic, nome, area, sub]) => (
            <button key={area} className="card tile" onClick={() => ir({ tela: 'area', id: l.id, area })}>
              <span className="ic"><Icon n={ic} /></span>
              <b>{nome}</b>
              <small>{area === 'rascunhos' ? `${rascs.length} ${rascs.length === 1 ? 'rascunho' : 'rascunhos'}` : area === 'ideias' ? `${ideias.length} para organizar` : sub}</small>
            </button>
          ))}
        </div>

        <div className="lbl">Últimas alterações</div>
        <div className="card meta">
          {l.editadoEm !== l.criadoEm && <div style={{ padding: '4px 0' }}>Livro editado · {quando(l.editadoEm, agora)}</div>}
          <div style={{ padding: '4px 0' }}>Livro criado · {quando(l.criadoEm, agora)}</div>
        </div>
      </main>

      {folha === 'menu' && (
        <Sheet titulo={l.titulo} onClose={fechar}>
          <div className="menu">
            <button onClick={() => setFolha('editar')}><span className="ic"><Icon n="caneta" /></span>Editar título, gênero e capa</button>
            <button onClick={() => { const nid = novoId(); mudar((d) => ({ ...d, livros: duplicar(d.livros, l.id, Date.now(), nid), capitulos: [...d.capitulos, ...copiarCapitulos(d.capitulos, l.id, nid, novoId, Date.now())] })); fechar(); avisar('Livro duplicado'); }}><span className="ic"><Icon n="copia" /></span>Duplicar livro</button>
            <button onClick={() => { baixarArquivo(nomeArquivo(l.titulo, Date.now()), exportarLivro(l, dados, Date.now())); fechar(); avisar('Arquivo do livro baixado'); }}><span className="ic"><Icon n="baixar" /></span>Exportar este livro</button>
            <button onClick={() => { set({ arquivado: !l.arquivado }); fechar(); avisar(l.arquivado ? 'Livro voltou para a Biblioteca' : 'Livro arquivado'); }}><span className="ic"><Icon n="arquivo" /></span>{l.arquivado ? 'Desarquivar' : 'Arquivar'}</button>
            <button className="danger" onClick={() => setFolha('excluir')}><span className="ic"><Icon n="lixo" /></span>Excluir</button>
          </div>
        </Sheet>
      )}
      {folha === 'situacao' && (
        <Sheet titulo="Situação da obra" onClose={fechar}>
          <div className="menu">
            {SITUACOES.map((s) => <button key={s.v} className={l.situacao === s.v ? 'on' : ''} onClick={() => { set({ situacao: s.v }); fechar(); }}>{s.l}</button>)}
          </div>
        </Sheet>
      )}
      {folha === 'excluir' && (
        <Sheet onClose={fechar}>
          <div className="confirm">
            <h4>Mover para a lixeira?</h4>
            <p>“{l.titulo}” e tudo dentro dele ficam na lixeira por 30 dias. Dá para recuperar.</p>
            <div className="row2">
              <button className="btn ghost" onClick={fechar}>Cancelar</button>
              <button className="btn danger" onClick={() => { mudar((d) => ({ ...d, livros: paraLixeira(d.livros, l.id, Date.now()) })); avisar('Movido para a lixeira'); ir({ tela: 'biblioteca' }, true); }}>Excluir</button>
            </div>
          </div>
        </Sheet>
      )}
      {folha === 'editar' && <Editar l={l} set={set} onClose={fechar} />}
    </>
  );
}

function Editar({ l, set, onClose }: { l: Livro; set: (p: Partial<Livro>) => void; onClose: () => void }) {
  const [titulo, setTitulo] = useState(l.titulo);
  const [generos, setGeneros] = useState(l.generos);
  const [descricao, setDescricao] = useState(l.descricao);
  const [capa, setCapa] = useState(l.capa);
  const [capaImg, setCapaImg] = useState(l.capaImg);
  return (
    <Sheet titulo="Editar livro" onClose={onClose}>
      <div className="field"><label htmlFor="et">Título</label><input id="et" className="inp grande" value={titulo} onChange={(e) => setTitulo(e.target.value)} /></div>
      <div className="field"><label htmlFor="ed">Descrição curta</label><textarea id="ed" className="inp" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Em uma ou duas frases, do que o livro trata?" /></div>
      <div className="field"><span>Gênero</span><div className="wrapchips">{GENEROS.map((g) => <button key={g} className={`chip${generos.includes(g) ? ' on' : ''}`} onClick={() => setGeneros(generos.includes(g) ? generos.filter((x) => x !== g) : [...generos, g])}>{g}</button>)}</div></div>
      <div className="field">
        <span>Capa</span>
        <div className="capas">
          {CAPAS.map((c, i) => <button key={c} className={`capa${!capaImg && capa === i ? ' on' : ''}`} style={{ background: `linear-gradient(160deg,${c})` }} onClick={() => { setCapa(i); setCapaImg(null); }} aria-label={`Capa ${i + 1}`}>{titulo || 'Sem título'}</button>)}
          <label className={`capa up${capaImg ? ' on' : ''}`} style={capaImg ? { backgroundImage: `url(${capaImg})`, backgroundSize: 'cover' } : undefined}>
            {!capaImg && <><Icon n="imagem" /><br />Imagem</>}
            <input type="file" accept="image/*" hidden onChange={async (e) => { const f = e.target.files?.[0]; if (!f) return; try { setCapaImg(await comprimirImagem(f)); } catch (err) { avisar((err as Error).message); } }} />
          </label>
        </div>
      </div>
      <button className="btn full" onClick={() => { set({ titulo: titulo.trim() || 'Sem título', generos, descricao: descricao.trim(), capa, capaImg }); onClose(); avisar('Livro atualizado'); }}>Salvar</button>
    </Sheet>
  );
}
