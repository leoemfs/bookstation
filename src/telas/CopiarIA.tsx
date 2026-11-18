import { useMemo, useRef, useState } from 'react';
import { contar, doLivro, numero } from '../capitulos.ts';
import { textoParaDoc } from '../ideias.ts';
import { montarTextoIA, PEDIDOS, type Pedido } from '../ia.ts';
import { ir, useApp } from '../store.tsx';
import { Topo } from '../Topo.tsx';
import { avisar, Icon, Sheet } from '../ui.tsx';
import { criarRascunho } from './Rascunhos.tsx';

type Escopo = 'este' | 'todos' | 'escolher';

/** Copiar para IA (prévia P1 v2): monta um texto simples para colar no chat da IA. A resposta volta como rascunho. */
export function CopiarIA({ livroId, alvo }: { livroId: string; alvo: string }) {
  const { dados, mudar } = useApp();
  const livro = dados.livros.find((l) => l.id === livroId);
  const caps = doLivro(dados.capitulos, livroId);
  const [tipo, idAlvo] = alvo.split('.');
  const capAlvo = tipo === 'cap' ? caps.find((c) => c.id === idAlvo) : undefined;
  const rascunho = tipo === 'rasc' ? dados.rascunhos.find((r) => r.id === idAlvo) : undefined;
  const [escopo, setEscopo] = useState<Escopo>(capAlvo || rascunho ? 'este' : 'todos');
  const [escolhidos, setEscolhidos] = useState<string[]>(capAlvo ? [capAlvo.id] : []);
  const [incluirLivro, setIncluirLivro] = useState(true);
  const ideiasIA = dados.ideias.filter((i) => i.livroId === livroId && !i.arquivada && i.tags.includes('Cocriação IA'));
  const [comIdeias, setComIdeias] = useState(false);
  const [pedido, setPedido] = useState<Pedido>('coerencia');
  const [livre, setLivre] = useState('');
  const [colar, setColar] = useState(false);
  const [resposta, setResposta] = useState('');
  const area = useRef<HTMLTextAreaElement>(null);

  const selecionados = escopo === 'este' ? (capAlvo ? [capAlvo] : []) : escopo === 'todos' ? caps : caps.filter((c) => escolhidos.includes(c.id));
  const texto = useMemo(() => livro ? montarTextoIA({
    livro,
    capitulos: selecionados.map((cap) => ({ cap, numero: numero(dados.capitulos, cap) })),
    rascunho: escopo === 'este' ? rascunho : null,
    ideias: comIdeias ? ideiasIA : [],
    pedido,
    pedidoLivre: livre,
    incluirLivro,
  }) : '', [livro, selecionados, rascunho, escopo, comIdeias, ideiasIA, pedido, livre, incluirLivro, dados.capitulos]);
  if (!livro) return null;
  const palavras = contar(texto).palavras;

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      avisar('Texto copiado. Cole no chat da IA.');
    } catch {
      area.current?.focus();
      area.current?.select();
      avisar('Não deu para copiar sozinho: o texto foi selecionado, use Copiar do celular.');
    }
  }

  const nomeAlvo = capAlvo ? `Cap. ${numero(dados.capitulos, capAlvo)}` : rascunho ? 'Este rascunho' : '';
  return (
    <>
      <Topo cima={capAlvo ? `Cap. ${numero(dados.capitulos, capAlvo)}` : livro.titulo} tela="Copiar para IA" />
      <main className="scroll">
        <div className="sub" style={{ marginTop: 0 }}>Gera um texto simples para colar no chat da IA (ChatGPT, Claude…). A resposta volta como rascunho, nunca substitui o seu texto.</div>
        <div className="lbl">O que copiar</div>
        <div className="row">
          {nomeAlvo && <button className={`chip${escopo === 'este' ? ' on' : ''}`} onClick={() => setEscopo('este')}>{nomeAlvo}</button>}
          <button className={`chip${escopo === 'todos' ? ' on' : ''}`} onClick={() => setEscopo('todos')}>Livro inteiro ({caps.length})</button>
          <button className={`chip${escopo === 'escolher' ? ' on' : ''}`} onClick={() => setEscopo('escolher')}>Escolher capítulos</button>
        </div>
        {escopo === 'escolher' && (
          <div className="wrapchips" style={{ marginTop: 10 }}>
            {caps.map((c) => <button key={c.id} className={`chip${escolhidos.includes(c.id) ? ' on' : ''}`} onClick={() => setEscolhidos(escolhidos.includes(c.id) ? escolhidos.filter((x) => x !== c.id) : [...escolhidos, c.id])}>{numero(dados.capitulos, c)}. {c.titulo || 'Sem título'}</button>)}
          </div>
        )}
        <div className="lbl">Incluir junto</div>
        <div className="row">
          <button className={`chip${incluirLivro ? ' on' : ''}`} onClick={() => setIncluirLivro(!incluirLivro)}>Dados do livro</button>
          {ideiasIA.length > 0 && <button className={`chip ia${comIdeias ? ' on' : ''}`} onClick={() => setComIdeias(!comIdeias)}>Ideias “Cocriação IA” ({ideiasIA.length})</button>}
        </div>
        <div className="meta" style={{ margin: '6px 2px 0' }}>O guia do livro e as fichas entram aqui quando existirem (F5 e F6).</div>
        <div className="lbl">Pedido pronto</div>
        <div className="row">{PEDIDOS.map((p) => <button key={p.v} className={`chip${pedido === p.v ? ' on' : ''}`} onClick={() => setPedido(p.v)}>{p.l}</button>)}</div>
        {pedido === 'livre' && <textarea className="inp" style={{ marginTop: 10 }} value={livre} onChange={(e) => setLivre(e.target.value)} placeholder="O que você quer que a IA faça? Ex.: três jeitos de terminar a cena do farol sem revelar o segredo." />}
        <textarea ref={area} className="export" readOnly value={texto} aria-label="Texto para a IA" />
        <div className="meta" style={{ margin: '6px 2px 12px' }}>≈ {palavras.toLocaleString('pt-BR')} palavras{palavras > 60000 ? ' · muito longo para alguns chats: escolha menos capítulos' : ''}</div>
        <div className="stack">
          <button className="btn" onClick={copiar}><Icon n="copia" /> Copiar texto</button>
          <button className="btn ghost" onClick={() => setColar(true)}>Colar resposta como rascunho</button>
        </div>
        <div className="card soon" style={{ marginTop: 16 }}><span className="pill t-azul">Em breve</span><b style={{ fontSize: 14 }}>IA dentro do app</b><div className="meta">Pedir e receber sem sair do BookStation.</div></div>
      </main>
      {colar && (
        <Sheet titulo="Colar a resposta da IA" onClose={() => setColar(false)}>
          <textarea className="inp" autoFocus rows={8} value={resposta} onChange={(e) => setResposta(e.target.value)} placeholder="Cole aqui o que a IA respondeu." />
          <div className="meta" style={{ margin: '6px 2px 12px' }}>Vira um rascunho novo com a tag “Cocriação IA”. Seu texto original não muda.</div>
          <button className="btn full" disabled={!resposta.trim()} onClick={() => {
            const d = new Date();
            const id = criarRascunho(mudar, livroId, { titulo: `Resposta da IA · ${d.toLocaleDateString('pt-BR')} ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`, conteudo: textoParaDoc(resposta), tags: ['Cocriação IA'], capituloId: capAlvo?.id ?? rascunho?.capituloId ?? null });
            setColar(false);
            avisar('Resposta guardada como rascunho');
            ir({ tela: 'rascunho', id: livroId, rasc: id });
          }}>Guardar como rascunho</button>
        </Sheet>
      )}
    </>
  );
}
