# BookStation

Ambiente para organizar, planejar, escrever e acompanhar livros, do primeiro rabisco à obra pronta.

Cada livro é um **pequeno universo independente**: capítulos, cenas, rascunhos, ideias, personagens,
locais, climas, imagens e referências pertencem a uma obra e se ligam entre si, sem misturar com outras.

**Situação:** versão 0.5.1 (F1 esqueleto, F2 editor, F3 ideias e rascunhos, F3b Copiar para IA, F4 capítulos, cenas e estrutura). No ar em https://leoemfs.github.io/bookstation/ (atualiza sozinho ao mesclar no `main`).

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
- Dados **só no aparelho** (IndexedDB, com reserva no localStorage). Cada mudança é gravada na hora; ao fechar o app,
  uma cópia de emergência vai para o localStorage e, ao abrir, o app usa a cópia mais nova.

## Editor (F2, parte 1)
- **Escrever um capítulo:** "Comece a escrever" no painel cria o Capítulo 1; o + do livro cria o próximo. O número acompanha a posição.
- Título do capítulo editável no topo da página; página cor de papel antigo, fonte Literata.
- **Barra em 2 linhas** (presa no topo ao rolar): estilo (Parágrafo, Títulos 1-3, Citação), negrito, itálico, destaque, lista;
  sublinhado, tachado, desfazer, refazer, **Mais** (lista numerada, citação, separador ⁂, recuo da primeira linha, limpar formatação).
- **+ no editor:** separador, citação, novo capítulo (o resto chega nas próximas fases).
- **Salva sozinho** (indicador "Salvando… / Salvo"), conta palavras e caracteres ao vivo.
- Painel: "Continuar escrevendo" abre o último capítulo editado com o "Parou em…"; andamento com capítulos, palavras e barra por situação.
- Backup e exportar livro levam os capítulos; excluir de vez apaga os capítulos junto.
- O editor carrega só quando é aberto (a Biblioteca continua leve).

## Editor (F2, parte 2)
- **Aa (aparência, por livro):** fonte Literária ou Simples, tamanho da letra (13 a 24), cor da página (branca, preta, papel antigo).
- **Bloco manuscrito** (fonte Caveat) só no parágrafo atual, pelo Aa, pelo Mais ou pelo + do editor.
- **Busca no capítulo** (lupa do topo ou Ctrl F): sem diferenciar acento nem maiúscula, destaca os achados, ↑ ↓ para navegar.
- **Histórico:** cópia automática ao abrir o capítulo (se o texto mudou há mais de 30 min; guarda as 20 mais novas),
  versões com nome (nunca saem sozinhas), ver e restaurar (o texto de antes vira "Antes de restaurar").
- **Sem distrações:** só a página; botão "Sair do modo foco" e contador discreto (Ctrl Shift F, Esc sai).
- **Atalhos no computador** (Mais › Atalhos): negrito, itálico, sublinhado, tachado, títulos, buscar, histórico, foco.
- **Teclado do celular (igual ao CP Hub, `src/teclado.ts` copiado de lá):** enquanto se escreve, a barra de formatação vira
  uma **faixa de uma linha colada em cima do teclado** (rola para o lado; **Pronto** fecha o teclado); fora da escrita ela some.
  A página rola para o cursor nunca ficar atrás da faixa; a barra de baixo some enquanto o teclado está aberto; Aa e Mais
  fecham o teclado antes de abrir as opções. No computador a barra continua presa no topo.

## Ideias, rascunhos e Copiar para IA (F3 e F3b)
- **Ideias** (caixa de entrada): no livro e soltas (Biblioteca › Ideias). Captura rápida pelo + ou no alto da tela; tags
  (padrão: Cocriação IA, Diálogo, Cena, Reviravolta, Personagem, Lugar, Frase; e as suas); filtro por tag e arquivadas.
  Tocar numa ideia: transformar em rascunho (a ideia é arquivada), marcar "Cocriação IA", arquivar, excluir; as soltas podem ir para um livro.
- **Rascunhos** do livro: lista com filtro (sem capítulo, por tag); o mesmo editor dos capítulos; título, tags e capítulo ligado
  (opcional); **Transferir para capítulo** (no fim ou no início, com separador; manter o original já vem ligado); excluir com confirmação.
- **+ no editor:** trazer rascunho (entra onde está o cursor, o original fica) e ideia rápida.
- **Copiar para IA** (botão na barra do editor ou no rascunho): o que copiar (este capítulo, livro inteiro, escolher capítulos,
  o rascunho), incluir dados do livro e ideias "Cocriação IA", pedido pronto (coerência, continuidade, correção, estilo, livre),
  copiar o texto; **colar a resposta** cria um rascunho com a tag "Cocriação IA" (nunca muda o texto original).
- Painel: "para organizar quando quiser" (rascunhos sem capítulo, ideias); backup e exportar livro levam ideias e rascunhos.

## Capítulos, cenas e estrutura (F4)
- Abas no topo do livro: **Capítulos · Rascunhos · Estrutura**.
- **Capítulos:** filtro por situação, totais (capítulos, cenas, palavras), cenas abrem embaixo (▾), **Reordenar** com ▲▼
  (o número acompanha a posição), ⋯ com renomear, duplicar (com as cenas), arquivar (sai da lista e da numeração; "ver" desarquiva)
  e excluir (vai para a lixeira por 30 dias, com as cenas).
- **Página do capítulo:** escrever, situação (Planejado, Em escrita, Rascunho, Em revisão, Concluído), resumo, objetivo narrativo, cenas, rascunhos ligados.
- **Cena** = cartão de planejamento dentro do capítulo (o texto fica no capítulo): título, momento, clima, resumo, modelo opcional
  de 6 perguntas (com "esconder" e contador), subir/descer, excluir, "Escrever no capítulo".
- **Estrutura:** modelo (Livre, Três atos, Jornada do herói, Sete pontos; trocar não apaga nada) e capítulos ligados a cada marco.
- **Lixeira** mostra capítulos excluídos (recuperar ou excluir de vez); o editor agora fica em "Capítulos / Cap. N".

## Estrutura
| Pasta / arquivo | O que é |
|---|---|
| `src/data.ts` | modelo de dados e `normalize()` (todo campo novo precisa de padrão aqui) |
| `src/livros.ts`, `src/capitulos.ts`, `src/versoes.ts`, `src/busca.ts`, `src/ideias.ts`, `src/ia.ts`, `src/cenas.ts`, `src/backup.ts`, `src/router.ts` | regras puras, com testes em `src/*.test.ts` |
| `src/db.ts` | banco local (base copiada do CP Hub) |
| `src/ui.tsx`, `src/Topo.tsx`, `src/Importar.tsx` | componentes de tela |
| `src/Editor.tsx` | editor de texto (TipTap, base copiada do CP Hub) |
| `src/telas/` | Biblioteca, NovoLivro, Painel, Escrever, Capitulos, CapituloTela, CenaTela, Estrutura, AbasLivro, Ideias, Rascunhos, RascunhoTela, CopiarIA, Lixeira, Ajustes, EmBreve |
| `docs/` | Central, especificação, arquitetura, prévias |

## Comandos
`npm test` (testes) · `npm run build` (compilar) · `npm run dev` (rodar no computador).

- Visão completa: [`docs/ESPECIFICACAO.md`](docs/ESPECIFICACAO.md)
- Arquitetura proposta: [`docs/ARQUITETURA.md`](docs/ARQUITETURA.md)
- Painel do projeto: [`docs/CENTRAL.md`](docs/CENTRAL.md)
- Prévias visuais: [`docs/PREVIAS.md`](docs/PREVIAS.md)
