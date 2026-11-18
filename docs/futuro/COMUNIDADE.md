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

## Dois ambientes no mesmo app (prévia v3, 18/11/2026)
- **Criação** (âmbar): a biblioteca pessoal. Barra: Biblioteca · Ideias · **+** · Comunidade · (a definir).
- **Comunidade** (violeta, para saber onde se está). Barra: **Início** (volta à biblioteca de criação) ·
  Descobrir · **Feed** (centro) · Salvos · Perfil.
- O botão do meio na Comunidade é o **Feed**. Já estando no Feed, ele vira **+** e abre: Nova prévia,
  Publicar capítulo, Publicar livro.
- **Feed:** publicações de **prévia** = uma imagem com um trecho escrito pelo autor por cima (início ou
  chamada do capítulo). Cada uma tem **curtir**, **salvar** e **Ler capítulo**.
- **Descobrir:** capas em cartões (em alta, novos capítulos). **Salvos:** livros e prévias guardados,
  com "continuar lendo". **Perfil:** livros publicados e seguidores.
- Leitura com virada de página (efeito leve; no app, deslizar).
- No app, até ser construída, a Comunidade aparece como **"Em breve"**.

## Barras
- A de **cima** fica sempre visível: é o guia do caminho ("Comunidade / Feed").
- A de **baixo** pode se recolher ao rolar a tela (aparece de novo ao subir). Mostrado na prévia;
  virar opção de personalização depois.

## Decisão (18/11/2026)
A comunidade **não é o foco** do app. Primeiro entra como **experiência dentro do app** (F12x): as telas das prévias P1 e P7
funcionando com conteúdo de exemplo e "publicar" só no próprio aparelho, **sem servidor, sem contas e sem dados de outras
pessoas** (por isso sem exigências da LGPD nessa etapa). A comunidade real (servidor, contas) fica para depois, se fizer sentido.

## Ordem sugerida
Fica **depois** de o app de escrita estar pronto (F1 a F8). Primeiro só leitura de publicados;
depois perfis e seguir; por último comentários.
