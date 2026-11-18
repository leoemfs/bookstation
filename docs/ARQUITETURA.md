# Arquitetura proposta

## Decisão principal: cada livro é um universo
Todo registro (capítulo, cena, rascunho, ideia, personagem, local, clima, imagem, relação) guarda o
`livroId`. Consultas sempre filtram por livro. Assim os livros nunca se misturam e um livro pode ser
exportado/importado sozinho.

## Pilha (a mesma do CP Hub, para poder copiar peças)
- React + TypeScript + Vite, PWA publicado no GitHub Pages.
- Dados no aparelho (IndexedDB), com **backup em arquivo** desde o início (imagens pesam).
- Editor: TipTap (o mesmo do CP Hub), documento salvo em JSON.
- Regras puras em `src/*.ts` com testes `node:test`.

## Modelo de dados (rascunho)
| Tabela | Campos principais |
|---|---|
| livros | id, titulo, genero, descricao, capaId, situacao, guia{…}, criadoEm, editadoEm, excluidoEm |
| capitulos | id, livroId, ordem, titulo, conteudo(JSON), resumo, objetivo, situacao |
| cenas | id, livroId, capituloId, ordem, titulo, texto, local, momento, clima, objetivo, conflito, resultado |
| rascunhos | id, livroId, titulo, conteudo, tags, situacao, capituloId? |
| ideias | id, livroId, texto, criadoEm, destino? |
| fichas | id, livroId, tipo (personagem/local/clima/objeto/evento), nome, campos{…}, imagemId? |
| relacoes | id, livroId, deId, paraId, tipo, descricao |
| imagens | id, livroId, arquivo(blob), titulo, categoria, tags, ligações |
| historico | id, livroId, alvoId, conteudo, data |

`excluidoEm` em tudo = lixeira (recuperar em vez de apagar de vez).

## Referências `/`
Viram um nó do editor com `{tipo, id}` (não texto). O nome aparece buscado na ficha na hora, por isso
renomear não quebra. **Conexões reversas** = varrer os documentos do livro atrás desses ids
(rápido o bastante para um livro; se pesar, guardar um índice).

## O que reaproveitar do CP Hub (copiando, nunca importando)
| Peça do CP Hub | Uso aqui |
|---|---|
| `src/modules/estudos/Editor.tsx` (TipTap, barra em 2 linhas + "Mais", salva sozinho) | base do editor; somar fontes, cor de página, `/` comandos |
| `src/ui.tsx` (Sheet, Fullscreen, Segmented, Toggle, Progress, notify, Chips) | componentes de tela |
| `src/styles.css` (tokens preto/verde, cartões) | ponto de partida do visual (tom próprio do livro) |
| `src/router.ts` + `src/navStack.ts` (rotas por hash, voltar do celular) | navegação com trilha |
| `src/BarPull.tsx` + `src/moduleBar.ts` (barra de baixo e gaveta) | barra de 5 ações com + no meio |
| `src/db.ts` / `normalize()` de `src/data.ts` | banco local e dados antigos |
| `public/sw.js` + manifest | PWA offline |

**Integridade do CP Hub:** só leitura. Copiar arquivos não altera nada lá; nenhuma dependência entre
os dois repositórios. Não há risco para o CP Hub.

## Riscos a cuidar
- Imagens no celular ocupam espaço: comprimir ao salvar e avisar o tamanho.
- Dados só no aparelho: backup fácil (e, depois, sincronizar).
- Efeito de folhear e mapa de relações são caros: ficam para fases finais.
