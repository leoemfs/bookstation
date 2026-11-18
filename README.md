# BookStation

Ambiente para organizar, planejar, escrever e acompanhar livros, do primeiro rabisco à obra pronta.

Cada livro é um **pequeno universo independente**: capítulos, cenas, rascunhos, ideias, personagens,
locais, climas, imagens e referências pertencem a uma obra e se ligam entre si, sem misturar com outras.

**Situação:** versão 0.1.0 (F1, esqueleto). Publicado em https://leoemfs.github.io/bookstation/ depois de mesclar no `main`.

## O que já funciona (F1)
- **Biblioteca:** livros em cartões com capa, gênero, descrição, última edição e situação; filtros por situação e
  arquivados; busca (lupa) sem diferenciar acentos; ordenar por última edição, título ou mais novos.
- **Novo livro em 2 passos:** título, gêneros, capa (6 prontas ou imagem comprimida), situação; roteiro opcional
  (Livre, Três atos, Jornada do herói, Sete pontos).
- **Painel do livro:** capa, situação (toque para trocar), ⋯ com editar, duplicar, exportar, arquivar e excluir;
  roteiro escolhido; áreas do livro (as que ainda não existem dizem em que fase chegam).
- **Lixeira:** 30 dias para recuperar; excluir de vez e esvaziar pedem confirmação.
- **Ajustes:** barra de baixo que se recolhe ao rolar, tema escuro/claro/sistema, espaço usado, backup em arquivo,
  restaurar (substituir tudo ou importar um livro sem apagar nada), política de privacidade.
- **Navegação:** barra de cima com ‹ e título em dois níveis; barra de baixo com 5 ações e **+** no meio
  (Biblioteca · Ideias · + · Comunidade · Ajustes; dentro do livro: Painel · Capítulos · + · Fichas · Ideias);
  o voltar do celular fecha as folhas.
- **PWA:** instala no celular e no computador e abre sem internet depois da primeira visita.
- Dados **só no aparelho** (IndexedDB, com reserva no localStorage).

## Estrutura
| Pasta / arquivo | O que é |
|---|---|
| `src/data.ts` | modelo de dados e `normalize()` (todo campo novo precisa de padrão aqui) |
| `src/livros.ts`, `src/backup.ts`, `src/router.ts` | regras puras, com testes em `src/*.test.ts` |
| `src/db.ts` | banco local (base copiada do CP Hub) |
| `src/ui.tsx`, `src/Topo.tsx`, `src/Importar.tsx` | componentes de tela |
| `src/telas/` | Biblioteca, NovoLivro, Painel, Lixeira, Ajustes, EmBreve |
| `docs/` | Central, especificação, arquitetura, prévias |

## Comandos
`npm test` (testes) · `npm run build` (compilar) · `npm run dev` (rodar no computador).

- Visão completa: [`docs/ESPECIFICACAO.md`](docs/ESPECIFICACAO.md)
- Arquitetura proposta: [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md)
- Painel do projeto: [`docs/CENTRAL.md`](docs/CENTRAL.md)
- Prévias visuais: [`docs/PREVIAS.md`](docs/PREVIAS.md)
