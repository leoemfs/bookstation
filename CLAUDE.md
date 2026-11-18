# Instruções para o Claude: BookStation

App de organização e cocriação de livros (PWA, mobile-first, funciona no computador).
O dono, Leonardo, **não é desenvolvedor**. Responda sempre em **português simples e curto**.

## Regras de ouro (combinadas em 18/11/2026)
1. **Projeto independente do CP Hub (Central Pessoal).** Nunca acrescentar nada no repositório
   `leoemfs/Central-Pessoal` por causa do BookStation, e nunca misturar os dois (código, dados,
   documentos, PRs) sem pedido explícito do Leonardo. O CP Hub só pode ser **lido**, para estudar a
   arquitetura e **copiar** componentes para cá. Copiar é sempre cópia: nada de importar arquivos de lá.
2. Se algo puder quebrar a integridade do CP Hub, **avisar antes** e não fazer.
3. **Prévia sempre antes:** toda tela nova ou mudança visual passa por uma prévia (Artifact) aprovada
   antes de ser construída. Registrar o link em `docs/PREVIAS.md`.
4. **Não construir sem aprovação.** Ideia nova vai para `docs/CENTRAL.md` (caixa de entrada).
5. PRs: o Claude pode abrir PRs sozinho. **Mesclar mudanças fica com o Leonardo.**

## Por onde começar
1. `docs/CENTRAL.md`: situação, fases e fila aprovada.
2. `docs/ESPECIFICACAO.md`: o que o app deve fazer (visão completa).
3. `docs/ARQUITETURA.md`: como montar e o que reaproveitar do CP Hub.
4. `docs/futuro/`: um documento por item (comunidade, diretrizes, LGPD, sincronização Google, IA).

## Fluxo
anotar → especificar → prévia → aprovar → construir → testar. A cada mudança, atualizar a Central.
