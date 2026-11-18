# Especificação: BookStation

Registrada em 18/11/2026 a partir da descrição do Leonardo. É a **visão completa**: não precisa ser
construída de uma vez (ver fases em `CENTRAL.md`).

**Princípio:** organizar o processo criativo **sem limitar** a liberdade de quem escreve. Todos os campos
são opcionais; estruturas e técnicas são sugestões, nunca obrigações. Não é gerenciador de tarefas,
bloco de notas nem só editor de texto: é especializado em criação literária.

**Problema que resolve:** ideias espalhadas (conversas com IA, anotações, documentos soltos).

## 1. Estrutura
```
BIBLIOTECA
└─ Livro
   ├─ Visão geral (painel)
   ├─ Guia e identidade
   ├─ Estrutura narrativa
   ├─ Capítulos → Cenas (opcionais)
   ├─ Rascunhos
   ├─ Caixa de entrada de ideias
   ├─ Personagens · Locais · Climas e ambientes · Imagens
   ├─ Referências e anotações
   └─ Bíblia do universo
```
Vários livros; dados de um livro **nunca** se misturam com os de outro. Navegar sem perder o contexto.

## 2. Biblioteca (tela inicial)
- Cards de livro: capa, título, gênero, descrição curta, última edição, nº de capítulos, situação.
- Situações: Planejamento · Em desenvolvimento · Em escrita · Em revisão · Concluído · Arquivado.
- Criar, editar, arquivar, excluir (com confirmação e **lixeira** para recuperar).
- Pesquisa e ordenação.

## 3. Painel do livro
- Atalhos: Continuar escrevendo, Capítulos, Rascunhos, Ideias, Personagens, Locais, Imagens, Guia.
- Resumo do andamento (orienta, não cobra): capítulos planejados/escritos/em revisão, rascunhos sem
  vínculo, personagens cadastrados.

## 4. Guia e identidade
- **Identidade:** título, subtítulo, gênero, subgênero, público, sinopse, premissa.
- **Direção narrativa:** narrador, ponto de vista, tempo verbal, tom, estilo, ritmo, temas.
- **Planejamento:** estrutura, conflito principal, objetivo, desenvolvimento, desfecho (opcional), extensão.
- Sugestões de preenchimento; usado depois para contextualizar prompts de IA.

## 5. Capítulos e cenas
- Criar, renomear, reordenar, duplicar, arquivar, excluir, histórico, escrever no editor.
- Campos: posição (número automático), título, conteúdo, resumo, objetivo, situação, cenas,
  personagens, locais. Situações: Planejado · Em escrita · Rascunho · Em revisão · Concluído.
- **Cenas (opcionais):** título, texto, personagens, local, momento cronológico, clima, objetivo,
  conflito, resultado.

## 6. Rascunhos e caixa de ideias
- Rascunho: título, conteúdo, criação, última alteração, tags, situação, capítulo/personagens/locais
  (opcionais). Pode ficar sem vínculo para sempre.
- **Transferir para capítulo** preservando o original. Nunca vira conteúdo definitivo sozinho.
- **Caixa de ideias:** captura em um toque, sem classificar. Depois: virar rascunho, ligar a capítulo
  ou cena, virar personagem ou local, arquivar, excluir.

## 7. Personagens
- Cards (imagem, nome, função, descrição). Ficha com: básicos, físico, personalidade,
  desenvolvimento narrativo, comunicação (fala, vocabulário, bordões, maneirismos, tom).
- **Relações** entre personagens (família, amizade, amor, rivalidade, inimizade, trabalho, aliança)
  com descrição. Futuro: mapa gráfico.
- **Participações:** capítulos, cenas e rascunhos onde aparece.

## 8. Locais
- Tipos: país, região, cidade, bairro, edificação, residência, estabelecimento, fictício, ambiente.
- Ficha: nome, categoria, descrição, imagem, localização, história, arquitetura, geografia, cultura,
  importância, personagens e capítulos ligados.
- Perguntas sensoriais: o que se vê, ouve, cheira, temperatura, sensação.

## 9. Climas e ambientes
- Climas, estações, tempo, condições ambientais, atmosferas.
- Ficha separa **clima meteorológico** de **atmosfera emocional**. Liga a locais, cenas e capítulos.

## 10. Imagens
- Galeria por livro. Categorias: personagens, locais, construções, vestimentas, objetos, paisagens,
  referências, outros. Campos: título, arquivo, descrição, categoria, tags, ligações.
- Abrir sozinha; usar como referência ao escrever, sem obrigar a pôr no texto.

## 11. Editor
- Referência visual: editor do CP Hub (barra com estilo, N, I, destaque, listas, checklist, Mais).
- Recursos: negrito, itálico, sublinhado, tachado, títulos, parágrafos, listas, citação, separador,
  destaque, recuo, desfazer/refazer. No celular: duas linhas ou "Mais".
- **Fontes:** Literária (Lora/Literata), Simples (sem serifa), Manuscrita (Caveat/Kalam) aplicável
  só a um bloco (cartas, bilhetes, diários).
- **Cor da página:** branca, preta, papel antigo, independente do tema do app.
- Contador de palavras e caracteres, salvamento automático com indicador, histórico, busca no texto,
  modo sem distrações, atalhos no computador.

## 12. Comandos `/` e referências
- `/personagem`, `/local`, `/clima`, `/objeto`, `/evento` abrem lista do livro + "criar novo".
- Insere **vínculo real** (por id): continua certo se o nome mudar. Tocar mostra resumo, ficha,
  editar, conexões.
- **Conexões reversas:** cada ficha lista onde é citada.

## 13. Técnicas literárias (sugestões)
- Perguntas de personagem (deseja, precisa, teme, contradição, obstáculo, mudança, gatilho).
- Modelo de cena (onde, quem, desejo, obstáculo, o que acontece, o que muda).
- Enredo: apresentação, incidente, conflitos, complicações, reviravoltas, clímax, resolução;
  modelos (três atos e outros), nenhum obrigatório.
- Revisão em etapas (futuro): estrutural, narrativa, estilo, final.

## 14. IA (sem API no início)
- **Copiar para IA (primeiro passo):** escolhe o que copiar (capítulo, vários, livro inteiro), o que
  incluir (guia, fichas citadas, resumos) e um pedido pronto (coerência, continuidade, correção, estilo
  ou livre). Gera texto simples, como copiar de um chat, para colar no ChatGPT/Claude.
- Ideias podem levar **tags**; a tag "Cocriação IA" marca o que se quer desenvolver com a IA.
- IA dentro do app e comunidade aparecem como "Em breve".
- "Preparar contexto": junta guia, personagens e locais escolhidos + pedido do autor → prompt para copiar.
- Resposta colada vira **novo rascunho**. Nunca substitui texto original.

## 15. Pré-visualização do livro
- Leitura tipo Google Play Livros: páginas, capítulos, progresso, fonte, tamanho, margens, cor,
  claro/escuro, gestos. Usa o conteúdo real na ordem definida.
- Efeito de folhear (futuro), leve, com opção simples para aparelhos fracos / menos animação.

## 16. Aprofundamentos sugeridos (para depois)
- **Linha do tempo** cronológica (diferente da ordem narrada).
- **Mapa de relacionamentos** (personagens, famílias, organizações, locais).
- **Controle de continuidade** (idade, aparência, datas, fatos que se contradizem).
- **Quadro narrativo** (arrastar ideias, cenas e acontecimentos entre etapas).
