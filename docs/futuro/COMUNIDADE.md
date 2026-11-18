# Comunidade de leitura (ideia, 18/11/2026)

## A ideia
Uma parte social, no estilo do Wattpad: qualquer pessoa pode ser autora, **publicar** livros e
capítulos, e outras pessoas leem.
- Vitrine em **cartões com a capa** (como a Biblioteca, mas de livros publicados por outras pessoas).
- Ao entrar num livro, a pessoa lê **os capítulos já publicados**, com a transição de folha do
  Google Play Livros (o mesmo leitor da F8).
- Página de **autor**: perfil, livros e seguidores.

## Como funcionaria
- **Publicar = tirar uma cópia.** Quando o autor publica um capítulo, vai para a comunidade uma cópia
  daquele momento. O texto de trabalho continua privado; editar o rascunho não muda o que está publicado
  até o autor publicar de novo.
- O autor escolhe o que publica: livro, capítulos, capa e sinopse. Fichas, rascunhos e ideias **nunca** são publicados.
- Leitores: seguir autor, salvar na estante, marcar onde parou, curtir, comentar (comentário fica para depois).

## O que muda na arquitetura (importante)
Até aqui o app pode viver **sem servidor** (dados no aparelho + cópia no Google Drive de cada pessoa).
Uma comunidade **precisa de servidor e banco de dados na internet**, porque os livros de uma pessoa
têm que aparecer para as outras.
- **Recomendação:** um serviço pronto que já traz banco, login e arquivos, como **Supabase** ou
  **Firebase**. Têm plano gratuito para começar e cobram conforme cresce. Os dois aceitam login com Google.
- Os textos privados continuam fora desse servidor (no aparelho e no Drive da pessoa). Só o que for
  publicado sobe.

## Cuidados que não são técnicos
- **Termos de uso e política de privacidade** (LGPD): obrigatórios num app com contas.
- **Direitos autorais:** o autor declara que o texto é dele; um botão para denunciar plágio.
- **Moderação:** denunciar conteúdo, esconder, bloquear usuário. Classificação etária (o público
  desse tipo de app tem muitos adolescentes).
- **Custo cresce com uso:** imagens de capa e leituras consomem o plano. Comprimir capas.

## Barra de baixo
A Biblioteca ganharia uma aba **Descobrir** (a vitrine). Para caber nas 5 ações, a Lixeira sairia da
barra e iria para dentro da Biblioteca (menu ou filtro). Decidir na prévia.

## Ordem sugerida
Fica **depois** de o app de escrita estar pronto (F1 a F8). Primeiro só leitura de publicados;
depois perfis e seguir; por último comentários.
