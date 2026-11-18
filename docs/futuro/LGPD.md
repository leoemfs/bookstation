# LGPD: o que o BookStation precisa seguir (18/11/2026)

> Guia prático para planejar o app. **Não é parecer jurídico.** Antes de abrir a comunidade ao
> público, um advogado de proteção de dados deve revisar a Política de Privacidade e os Termos.
> Conferir números de artigos e resoluções na época, porque as normas da ANPD mudam.

## O ponto principal
Quanto **menos dados** o app guardar no servidor, mais simples fica cumprir a LGPD. Por isso a arquitetura
já ajuda: o livro privado fica **no aparelho e no Google Drive da própria pessoa**, não com a gente.
Só vai para o nosso servidor o que a pessoa **publica** na comunidade e os dados da conta.

## Quais dados haverá, e por quê
| Dado | Onde fica | Para quê | Base legal (art. 7º) |
|---|---|---|---|
| Livros, fichas, rascunhos | Aparelho + Drive da pessoa | Funcionar o app | Não passa por nós |
| Nome, e-mail, foto (login Google) | Servidor da comunidade | Criar a conta | Execução do contrato (termos de uso) |
| Data de nascimento (ou faixa de idade) | Servidor | Proteger menores e aplicar classificação | Obrigação legal / execução do contrato |
| Textos e prévias publicados, curtidas, salvos, seguidores | Servidor | A própria comunidade | Execução do contrato |
| Registros de acesso (IP, data e hora) | Servidor | Segurança e lei (Marco Civil, art. 15: 6 meses, se houver empresa) | Obrigação legal |
| Textos enviados à IA (quando houver IA embutida) | Fornecedor de IA | Gerar sugestões | Consentimento (a pessoa escolhe enviar) |

**Não coletar:** CPF, endereço, telefone, localização, contatos. Nada de anúncios com rastreamento.

## Regras a seguir
1. **Política de privacidade** clara, em português simples, acessível no app e na tela de login:
   o que coleta, para quê, com quem compartilha, por quanto tempo, como exercer direitos.
2. **Termos de uso** + **Diretrizes da comunidade** aceitos ao criar a conta.
3. **Mínimo necessário** (art. 6º): só pedir o que é usado.
4. **Direitos da pessoa** (art. 18) direto no app (Ajustes › Privacidade):
   - ver e **baixar os próprios dados** (portabilidade);
   - **corrigir** perfil;
   - **excluir a conta** e tudo o que foi publicado (apagar de verdade no servidor em até ~30 dias, salvo o que a lei manda guardar);
   - **revogar consentimentos** (ex.: IA) a qualquer momento.
5. **Canal de contato** de privacidade (um e-mail do Gmail dos apps serve no começo). Pequenos
   agentes podem ser dispensados de nomear encarregado (DPO), mas o canal é obrigatório.
6. **Menores de idade** (art. 14 e ECA Digital, Lei 15.211/2025): agir sempre no melhor interesse
   da criança e do adolescente.
   - Menores de 12: **não** abrir conta na comunidade (exigiria consentimento dos pais).
   - 12 a 17: configurações mais protetoras por padrão (perfil menos exposto, sem conteúdo 16+/18+,
     mensagens diretas desligadas), sem perfilamento para recomendação comercial.
7. **Fornecedores fora do Brasil** (Supabase/Firebase, IA): transferência internacional (art. 33).
   Usar fornecedores com cláusulas contratuais padrão aceitas pela ANPD e citar isso na política.
8. **Segurança**: login só pelo Google, conexões criptografadas, regras de acesso no banco (cada um só
   edita o que é seu), backups. **Incidente** (vazamento) relevante: comunicar a ANPD e as pessoas
   afetadas em poucos dias úteis (hoje, 3 dias úteis).
9. **IA**: antes do primeiro envio, avisar que o texto vai para um fornecedor de IA, qual, e se ele usa
   ou não os dados para treinar. Começar com o "Copiar para IA", em que a própria pessoa decide colar.
10. **Retenção**: definir prazos (conta excluída → apagar; registros de acesso → 6 meses; denúncias →
    o tempo de resolver e um prazo curto depois).
11. **Conteúdo de terceiros**: responder rápido a denúncias (direitos autorais, ofensas, exposição de dados).
    As regras de responsabilidade das plataformas mudaram em 2025 (STF, art. 19 do Marco Civil): agir
    depois de uma denúncia bem fundamentada, e não só por ordem judicial.

## Ordem prática
- **Antes de qualquer conta (fases sem comunidade):** política curta dizendo que os dados ficam no aparelho e no Drive da pessoa.
- **Antes de abrir a comunidade:** política completa, termos, diretrizes, idade, exclusão de conta e
  download de dados prontos e **revisados por advogado**.
