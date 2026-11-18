# Sincronização com a conta Google (ideia, 18/11/2026)

## A ideia
Entrar com a conta Google para ter os mesmos livros no celular e no computador (PWA instalado
nos dois), do jeito que o CP Hub já faz.

## Como funciona (o mesmo modelo do CP Hub)
- O app guarda uma cópia dos dados na **pasta escondida do app no Google Drive da própria pessoa**
  (`drive.appdata`). O app só enxerga essa pasta, nada do resto do Drive.
- Cada aparelho salva e baixa a cópia mais nova. **Não precisa de servidor nosso**, e os textos
  ficam com a pessoa, não com a gente.
- No CP Hub isso está em `src/drive.ts` e `src/cloud.ts`: dá para **copiar** a ideia e o código
  para cá (nunca importar de lá).
- Imagens pesam: ocupam o espaço do Drive da pessoa (15 GB grátis). Comprimir ao salvar.
- Livros com muitos capítulos: em vez de um arquivo só, um arquivo por livro (e imagens separadas),
  para não reenviar tudo a cada mudança.

## O Gmail só para os apps
Boa ideia. Esse Gmail vira o **dono** dos projetos no Google Cloud (onde se cria o "login com Google").
- **Um projeto do Google Cloud por app** (BookStation separado do CP Hub), todos no mesmo Gmail.
  Assim um não afeta o outro, coerente com a regra de manter os dois independentes.
- Cada projeto tem uma **tela de consentimento** (nome do app, logo, link da política de privacidade).
  Enquanto está "em teste", só até 100 pessoas cadastradas como testadoras conseguem entrar. Para abrir
  ao público, o Google pede uma **verificação** (simples para o escopo da pasta do app; precisa de
  política de privacidade e de um domínio/site do app).
- O mesmo Gmail pode ser dono da conta da IA (ver `IA.md`) e de um Supabase/Firebase (ver `COMUNIDADE.md`).

## Atenção sobre o CP Hub
Se um dia o projeto do Google do **CP Hub** for passado para o Gmail novo, o "ID de login" muda e
quem usa o CP Hub precisaria entrar de novo. **Nada disso será feito agora** e só com pedido explícito.

## Para a comunidade
Se a comunidade existir, o login Google serve para as duas coisas: sincronizar (Drive da pessoa)
e entrar na comunidade (servidor). São permissões separadas, pedidas só quando a pessoa usar cada uma.
