# Integração com IA para coprodução (ideia, 18/11/2026)

Preços conferidos em 18/11/2026 (tabela oficial da Anthropic, em dólar). Podem mudar: conferir antes de construir.

## Como funciona, em uma frase
O app manda um texto (o pedido + o contexto do livro) para a IA pela internet, e a IA devolve
um texto. Cobra-se por **tamanho**: o que entra e o que sai, medido em **tokens**
(em português, 1.000 palavras dão mais ou menos 1.500 tokens).

## Os 3 jeitos de fazer (do mais simples ao mais completo)
| Jeito | Como é | Custo para você | Servidor? |
|---|---|---|---|
| **1. Copiar e colar** (já planejado na F6) | O app monta o prompt; a pessoa cola no ChatGPT/Claude e traz a resposta de volta como rascunho | Zero | Não |
| **2. Chave da própria pessoa** | A pessoa cria a conta dela na IA e cola a chave nas Configurações. A chave fica só no aparelho dela | Zero (cada um paga o seu uso) | Não |
| **3. IA embutida** (tudo pronto, sem configurar) | O app chama a IA usando a **sua** conta | Você paga o uso de todos | **Sim** |

**Por que o jeito 3 precisa de servidor:** a chave da IA é como um cartão de crédito. Num PWA, tudo
o que está no app pode ser visto por quem souber procurar; se a chave estiver lá, alguém copia e gasta
por sua conta. Por isso ela fica num **servidor pequeno** (uma "função na nuvem"), que recebe o pedido
do app, confere quem é a pessoa, aplica um **limite de uso** e só então chama a IA.
Opções baratas: Cloudflare Workers, Supabase Edge Functions ou Firebase Functions. Para começar,
o plano gratuito costuma bastar; o custo real é o da IA.

**Recomendação:** começar pelo **jeito 1** (F6), depois oferecer o **jeito 2** como opção. O **jeito 3**
só quando houver comunidade/usuários e um plano de cobrança (assinatura ou créditos), porque cada
pedido custa dinheiro seu.

## Quanto custa (exemplo real)
Pedido típico: guia do livro + 3 fichas + o capítulo (≈ 8.000 tokens de entrada) e uma resposta de
umas 1.600 palavras (≈ 2.500 tokens de saída).

| Modelo (Claude) | Preço por 1 milhão de tokens (entra / sai) | Um pedido | 300 pedidos/mês (10 por dia) |
|---|---|---|---|
| Haiku 5.5 (rápido, simples) | US$ 0,10 / US$ 0,50 | ≈ US$ 0,002 | ≈ US$ 0,60 |
| Sonnet 5.5 (equilíbrio, bom para texto) | US$ 2 / US$ 10 | ≈ US$ 0,04 | ≈ US$ 12 |
| Opus 5.5 (o mais capaz do dia a dia) | US$ 4 / US$ 20 | ≈ US$ 0,08 | ≈ US$ 24 |

- Em reais, multiplicar pelo câmbio do dia (a US$ 5,50: um pedido no Sonnet ≈ R$ 0,22).
- **Cache** (o guia e as fichas que se repetem em todo pedido) pode baratear a entrada em até ~90%.
- Outras IAs (ChatGPT, Gemini) funcionam do mesmo jeito, com preços na mesma faixa.
- A assinatura do Claude/ChatGPT que você usa no dia a dia **não** serve para o app: a API é uma conta
  separada, paga por uso (pode ser no Gmail dos apps).

## Possibilidades (o que a IA pode fazer no livro)
- **Escrever junto:** continuar uma cena, propor 3 versões de um trecho, reescrever no tom do livro.
- **Revisão em etapas:** estrutural, narrativa, estilo e final (seção 13 da especificação).
- **Continuidade:** apontar contradições (idade, olhos, datas) comparando capítulos e fichas.
- **Organizar:** transformar uma ideia solta em ficha, resumir capítulos, montar a linha do tempo.
- **Perguntas orientadoras** personalizadas para o personagem ou a cena.
- **Conversar com o livro:** "em que capítulo a Lia descobre o caderno?".
- **Imagens de referência** (outros serviços, cobrados por imagem).

## Regras que não mudam
- O resultado da IA **sempre vira rascunho**; nunca substitui texto do autor sozinho.
- A pessoa vê o que vai ser enviado antes de enviar.
- Na comunidade, avisar quando um texto publicado foi feito com ajuda de IA (decidir depois).
