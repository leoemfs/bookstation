# Central do BookStation

## Situação
Fase 0: ideia documentada em 18/11/2026. Sem código. Prévia da navegação em `PREVIAS.md`.

## Fases sugeridas (cada uma é um item; tamanho P/M/G)
| # | Item | Tamanho | Situação |
|---|---|---|---|
| F0 | Documentação e prévia geral | P | **Feito** (18/11) |
| F1 | Esqueleto: Biblioteca, painel do livro, barras, lixeira, backup | M | anotado |
| F2 | Capítulos + editor (fontes, cor da página, autosave, contador) | G | anotado |
| F3 | Rascunhos + caixa de ideias (captura rápida, transferir, **tags**, incluindo a tag "Cocriação IA") | M | anotado |
| F3b | **Copiar para IA**: texto simples (capítulo, vários ou livro + guia + fichas + pedido pronto de coerência) para colar no chat da IA | P | anotado (prévia v2) |
| F4 | Personagens e locais (fichas, relações, participações) | G | anotado |
| F5 | Comandos `/` e conexões reversas | M | anotado |
| F6 | Guia do livro + preparar contexto para IA | M | anotado |
| F7 | Climas, imagens, cenas | M | anotado |
| F8 | Leitor do livro (páginas, gestos; folhear depois) | G | anotado |
| F9 | Linha do tempo, mapa de relações, continuidade, quadro | G | anotado |
| F10 | Sincronização com a conta Google (Drive da pessoa, igual ao CP Hub) | M | anotado (`futuro/SINCRONIZACAO-GOOGLE.md`) |
| F11 | IA: chave da própria pessoa (depois do copiar e colar da F6) | M | anotado (`futuro/IA.md`) |
| F12a | Diretrizes da comunidade e LGPD prontas e revisadas por advogado (antes da F12) | P | rascunho (`futuro/DIRETRIZES-COMUNIDADE.md`, `futuro/LGPD.md`) |
| F12 | Comunidade: publicar e ler livros de outros autores (precisa de servidor) | G | anotado (`futuro/COMUNIDADE.md`) |
| F13 | IA embutida com servidor e limite de uso (precisa de cobrança) | G | anotado (`futuro/IA.md`) |

## Roteiro de prévias (antes de construir)
| # | Área | Arquivo | Situação |
|---|---|---|---|
| P1 | Navegação geral, Comunidade, Ajustes | `previas/navegacao.html` | **aprovada** |
| P2 | Criar livro + painel do livro + guia do livro | `previas/livro.html` | **aprovada** |
| P3 | Editor completo (fontes, manuscrito, Mais, `/`, sem distrações, histórico) | `previas/editor.html` | **aprovada** |
| P4 | Capítulos, cenas e rascunhos (reordenar, vincular, transferir) | `previas/capitulos.html` | **aprovada** |
| P5 | Fichas: personagem, local, clima, imagens, relações, "aparece em" | `previas/fichas.html` | **aprovada** |
| P6 | Leitor do próprio livro (páginas, ajustes de leitura) | `previas/leitor.html` | **aprovada** |
| P7 | Comunidade a fundo (página do livro publicado, perfil de autor, denúncia, idade) | `previas/comunidade.html` | **aprovada** |

## Fila aprovada (18/11/2026: todas as prévias P1 a P7 aprovadas)
Ordem de construção, uma fase por PR, seguindo as prévias como planta:
1. **F1** Esqueleto: Biblioteca, criar livro, painel do livro, barras, Ajustes básicos, lixeira, backup (P1, P2) · M
2. **F2** Editor (P3) · G, dividir em 2 PRs (texto e formatação; aparência, histórico, busca, foco)
3. **F3 + F3b** Ideias com tags, rascunhos, Copiar para IA (P1, P4) · M
4. **F4** Capítulos, cenas, estrutura (P4) · M
5. **F5** Fichas e relações + comandos `/` e "aparece em" (P5, P3) · G, dividir
6. **F6** Guia do livro completo + contexto para IA (P2) · P
7. **F8** Leitor (P6) · M
8. **F12x** Comunidade como **experiência dentro do app** (P1, P7) · M, **baixa prioridade**

Depois (sem prévia ou precisa de servidor): F10 sincronização Google, F11 IA com chave própria, F9 linha do tempo/mapa/quadro,
F12 comunidade real com servidor (só com F12a: diretrizes e LGPD revisadas).

## Caixa de entrada
- Gmail só para os apps (dono dos projetos Google Cloud, conta da IA e servidor). Um projeto Google por app.
- Personalização das barras: barra de baixo que se recolhe ao rolar (opção liga/desliga). A de cima fica fixa.

## Decisões (18/11/2026)
- Barra da Biblioteca: Biblioteca · Ideias · **+** · Publicar · (a definir). Lixeira saiu da barra e virou filtro dentro da Biblioteca. Busca fica na lupa do topo.
- Comunidade (Publicar) e IA dentro do app aparecem como **"Em breve"**.
- No editor, o botão de IA virou **Copiar p/ IA** (funciona sem servidor).
- Branch `main` criado.
- **Comunidade não é o foco.** Entra como experiência dentro do app (telas funcionando com conteúdo de exemplo, sem servidor), no fim da fila.
- 5º botão da Criação: **Ajustes** (personalização, tema, sincronização, integrações, armazenamento, privacidade). Prévia v4.
- Comunidade é um **segundo ambiente**: barra própria (Início · Descobrir · Feed · Salvos · Perfil), cor violeta, feed de prévias com curtir e salvar (prévia v3).

## Feito
- F0: documentação inicial e prévia geral (18/11/2026).
