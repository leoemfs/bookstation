/** Copiar para IA: monta um texto simples (como copiar de um chat) para colar no ChatGPT, Claude etc. */
import { ROTEIROS, type Capitulo, type Ideia, type Livro, type Rascunho } from './data.ts';
import { textoDoc } from './ideias.ts';

export type Pedido = 'coerencia' | 'continuidade' | 'correcao' | 'estilo' | 'livre';
export const PEDIDOS: { v: Pedido; l: string; texto: string }[] = [
  { v: 'coerencia', l: 'Coerência', texto: 'Analise a COERÊNCIA do texto abaixo: contradições de fatos, datas, nomes, personagens e tom. Liste cada problema com o trecho e uma sugestão. Não reescreva o texto.' },
  { v: 'continuidade', l: 'Continuidade', texto: 'Verifique a CONTINUIDADE entre os capítulos abaixo: o que muda sem explicação (idades, aparência, lugares, objetos, quem sabe o quê). Liste os problemas por capítulo.' },
  { v: 'correcao', l: 'Correção', texto: 'Revise ortografia, gramática e pontuação do texto abaixo. Mostre só as correções, no formato: trecho original → trecho corrigido. Não mude o estilo.' },
  { v: 'estilo', l: 'Estilo', texto: 'Avalie o ESTILO do texto abaixo: ritmo, repetições, clareza e diálogos. Aponte os 5 trechos que mais melhorariam e explique por quê. Não reescreva o texto inteiro.' },
  { v: 'livre', l: 'Livre', texto: '' },
];

export interface OpcoesIA {
  livro: Livro;
  capitulos: { cap: Capitulo; numero: number }[];
  rascunho?: Rascunho | null;
  ideias?: Ideia[];
  pedido: Pedido;
  pedidoLivre?: string;
  incluirLivro: boolean;
}

export function montarTextoIA(o: OpcoesIA): string {
  const partes: string[] = [];
  const pedido = o.pedido === 'livre' ? (o.pedidoLivre ?? '').trim() : PEDIDOS.find((p) => p.v === o.pedido)!.texto;
  if (pedido) partes.push(pedido);
  if (o.incluirLivro) {
    const l = o.livro;
    const linhas = [`# Livro: ${l.titulo}`];
    if (l.generos.length) linhas.push(`Gênero: ${l.generos.join(', ')}`);
    if (l.descricao.trim()) linhas.push(`Sobre: ${l.descricao.trim()}`);
    const r = ROTEIROS.find((x) => x.v === l.roteiro);
    if (r && r.marcos.length) linhas.push(`Estrutura: ${r.l} (${r.marcos.join(', ')})`);
    partes.push(linhas.join('\n'));
  }
  if (o.ideias?.length) partes.push(['## Ideias para considerar', ...o.ideias.map((i) => `- ${i.texto.trim()}`)].join('\n'));
  for (const { cap, numero } of o.capitulos) {
    partes.push(`## Capítulo ${numero}${cap.titulo.trim() ? ` · ${cap.titulo.trim()}` : ''}\n${textoDoc(cap.conteudo).trim() || '(sem texto)'}`);
  }
  if (o.rascunho) partes.push(`## Rascunho${o.rascunho.titulo.trim() ? `: ${o.rascunho.titulo.trim()}` : ''}\n${textoDoc(o.rascunho.conteudo).trim() || '(sem texto)'}`);
  return partes.join('\n\n') + '\n';
}
