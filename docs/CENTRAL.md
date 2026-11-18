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
| P1 | Navegação geral, Comunidade, Ajustes | `previas/navegacao.html` | v4 feita |
| P2 | Criar livro + painel do livro + guia do livro | `previas/livro.html` | v1 feita |
| P3 | Editor completo (fontes, manuscrito, Mais, `/`, sem distrações, histórico) | `previas/editor.html` | v1 feita, aguardando opinião |
| P4 | Capítulos, cenas e rascunhos (reordenar, vincular, transferir) | `previas/capitulos.html` | a fazer |
| P5 | Fichas: personagem, local, clima, imagens, relações, "aparece em" | `previas/fichas.html` | a fazer |
| P6 | Leitor do próprio livro (páginas, ajustes de leitura) | `previas/leitor.html` | a fazer |
| P7 | Comunidade a fundo (página do livro publicado, perfil de autor, denúncia, idade) | `previas/comunidade.html` | a fazer |

## Fila aprovada
(vazia: cada fase precisa de prévia e aprovação antes)

## Caixa de entrada
- Gmail só para os apps (dono dos projetos Google Cloud, conta da IA e servidor). Um projeto Google por app.
- Personalização das barras: barra de baixo que se recolhe ao rolar (opção liga/desliga). A de cima fica fixa.

## Decisões (18/11/2026)
- Barra da Biblioteca: Biblioteca · Ideias · **+** · Publicar · (a definir). Lixeira saiu da barra e virou filtro dentro da Biblioteca. Busca fica na lupa do topo.
- Comunidade (Publicar) e IA dentro do app aparecem como **"Em breve"**.
- No editor, o botão de IA virou **Copiar p/ IA** (funciona sem servidor).
- Branch `main` criado.
- 5º botão da Criação: **Ajustes** (personalização, tema, sincronização, integrações, armazenamento, privacidade). Prévia v4.
- Comunidade é um **segundo ambiente**: barra própria (Início · Descobrir · Feed · Salvos · Perfil), cor violeta, feed de prévias com curtir e salvar (prévia v3).

## Feito
- F0: documentação inicial e prévia geral (18/11/2026).
