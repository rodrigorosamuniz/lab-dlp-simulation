# Exercicios Do Lab DLP Simulation

## Objetivo

Usar a interface do laboratorio para entender como um DLP classifica informacoes, detecta evidencias sensiveis, aplica politicas, calcula risco e decide entre permitir, alertar, quarentenar ou bloquear uma saida de dados.

## Preparacao

Suba o container:

```bash
docker run --rm -p 8000:8000 lab-dlp-simulation
```

Acesse:

```text
http://localhost:8000
```

Observe inicialmente:

- Dashboard;
- Simulador;
- Politicas Fixas;
- tabela de Eventos;
- Detalhe do evento.

## Exercicio 1: Conteudo Publico Permitido

No Simulador, use:

- canal: `EMAIL`
- amostra: `Release publico`

Execute a simulacao.

Responda:

1. Qual foi a acao final?
2. Qual foi a severidade?
3. O DLP encontrou alguma evidencia sensivel?
4. Por que faz sentido permitir esse envio?

Resultado esperado:

- acao proxima de `allow`;
- severidade baixa;
- nenhuma evidencia sensivel relevante.

## Exercicio 2: Informacao Confidencial Para Email Pessoal

No Simulador, use:

- canal: `EMAIL`
- amostra: `Planilha de salarios`

Execute a simulacao.

Responda:

1. Qual politica foi acionada?
2. A classificacao declarada e a detectada sao iguais?
3. Por que salario e tratado como informacao sensivel?
4. Qual seria um destino mais adequado para esse conteudo?

Resultado esperado:

- acao `block`;
- severidade alta;
- politica relacionada a conteudo confidencial enviado para destino pessoal.

## Exercicio 3: Contrato Para Fornecedor Aprovado

No Simulador, use:

- canal: `EMAIL`
- amostra: `Contrato fornecedor`

Execute a simulacao.

Responda:

1. O envio foi permitido, bloqueado ou colocado em quarentena?
2. Por que o destino aprovado muda a decisao?
3. Qual e a diferenca entre bloquear e quarentenar?
4. Em um DLP real, quem poderia revisar uma quarentena?

Resultado esperado:

- acao `quarantine` ou alerta controlado;
- severidade intermediaria;
- demonstracao de que contexto importa, nao apenas conteudo.

## Exercicio 4: Upload Publico

No Simulador, use:

- canal: `UPLOAD`
- amostra: `campanha-publica.txt`

Execute a simulacao.

Responda:

1. O canal `UPLOAD` por si so torna o evento suspeito?
2. O conteudo foi classificado como publico, interno, confidencial ou restrito?
3. Por que um DLP nao deve bloquear todo upload externo?

Resultado esperado:

- acao `allow`;
- baixo risco;
- demonstracao de reducao de falso positivo.

## Exercicio 5: Base De Clientes Para Drive Pessoal

No Simulador, use:

- canal: `UPLOAD`
- amostra: `base-clientes.csv`

Execute a simulacao.

Responda:

1. Quais evidencias foram detectadas?
2. A presenca de varios CPFs mudou a classificacao?
3. Qual foi a classificacao efetiva?
4. Por que o destino `Drive pessoal` aumenta o risco?

Resultado esperado:

- acao `block`;
- classificacao efetiva `restrito`;
- evidencia de CPF em volume.

## Exercicio 6: Vazamento De Chave De API

No Simulador, use:

- canal: `UPLOAD`
- amostra: `config.env`

Execute a simulacao.

Responda:

1. Qual evidencia tecnica foi detectada?
2. Por que uma chave de API e considerada dado restrito?
3. Qual foi a severidade?
4. Que controles adicionais poderiam existir em producao?

Resultado esperado:

- acao `block`;
- severidade `critical`;
- evidencia de credencial ou token.

## Exercicio 7: Chat Interno Com Conteudo Publico

No Simulador, use:

- canal: `CHAT`
- amostra: `Resumo de politica publica`

Execute a simulacao.

Responda:

1. O canal chat foi bloqueado?
2. O conteudo continha dado sensivel?
3. Por que a classificacao publica reduz o risco?

Resultado esperado:

- acao `allow`;
- baixo risco;
- demonstracao de que o DLP avalia conteudo e contexto.

## Exercicio 8: Dados De Cliente Em IA Publica

No Simulador, use:

- canal: `CHAT`
- amostra: `Prompt de atendimento`

Execute a simulacao.

Responda:

1. Quais evidencias aparecem no detalhe do evento?
2. O dado sensivel foi exibido inteiro ou mascarado?
3. Por que enviar dados de cliente para IA publica e arriscado?
4. A classificacao declarada pelo usuario foi suficiente para liberar o envio?

Resultado esperado:

- acao de alerta ou bloqueio, dependendo do score;
- evidencia de email e CPF;
- demonstracao de rotulo inconsistente ou classificacao elevada pelo DLP.

## Exercicio 9: CPF Em Volume Em Chat/IA

No Simulador, use:

- canal: `CHAT`
- amostra: `Analise de planilha com CPFs`

Execute a simulacao.

Responda:

1. Quantos CPFs foram detectados?
2. O volume de evidencias mudou a severidade?
3. Qual politica foi acionada?
4. Por que volume e importante em DLP?

Resultado esperado:

- acao `block`;
- severidade alta ou critica;
- classificacao efetiva `restrito`.

## Exercicio 10: Rotulo Inconsistente

Escolha uma amostra publica e edite o conteudo adicionando:

```text
CPF 123.456.789-09
```

Mantenha a classificacao declarada como `Publico`.

Execute a simulacao.

Responda:

1. O que o usuario declarou?
2. O que o DLP detectou?
3. Qual foi a classificacao efetiva?
4. Qual politica trata essa inconsistencia?
5. Por que um DLP nao deve confiar apenas no rotulo declarado?

Resultado esperado:

- politica de rotulo inconsistente;
- classificacao efetiva maior que `Publico`;
- alerta ou bloqueio conforme severidade.

## Exercicio 11: Mudanca De Destino

Use a amostra `Planilha de salarios`.

Primeiro execute como esta.

Depois altere:

- destino: de email pessoal para fornecedor aprovado;
- categoria do destino: de `pessoal` para `externo_aprovado`.

Execute novamente.

Compare os dois eventos.

Responda:

1. A evidencia sensivel mudou?
2. A classificacao mudou?
3. A politica acionada mudou?
4. A acao final mudou?
5. O que isso mostra sobre contexto?

Resultado esperado:

- o conteudo continua sensivel;
- o destino altera a decisao;
- demonstracao de contexto na politica DLP.

## Exercicio 12: Remocao De Evidencia Sensivel

Use a amostra `base-clientes.csv`.

Remova os CPFs do conteudo e substitua por texto generico:

```text
Lista de clientes segmentada por regiao, sem identificadores pessoais.
```

Execute a simulacao.

Responda:

1. A classificacao detectada mudou?
2. A acao final mudou?
3. O score diminuiu?
4. O que isso ensina sobre minimizacao de dados?

Resultado esperado:

- menos evidencias sensiveis;
- risco menor;
- possivel mudanca de `block` para acao menos restritiva.

## Consolidacao Individual

Use a tabela de eventos e os detalhes das simulacoes executadas para responder individualmente.

### Parte 1: Identificar O Evento Mais Critico

1. Abra a tabela de eventos.
2. Localize o evento com maior severidade ou maior score.
3. Clique no ID do evento e observe os detalhes.

Responda:

1. Qual foi o canal usado?
2. Qual foi o destino?
3. Qual foi a classificacao efetiva?
4. Qual foi a acao final?
5. Quais evidencias contribuiram para esse risco?
6. Qual politica foi acionada?

### Parte 2: Comparar Conteudo E Contexto

Escolha dois eventos:

- um evento permitido ou de baixo risco;
- um evento bloqueado ou de alto risco.

Responda:

1. O que mudou no conteudo?
2. O que mudou no destino?
3. O canal influenciou a decisao?
4. A classificacao declarada foi suficiente para explicar a decisao?
5. A classificacao detectada mudou a interpretacao do evento?

### Parte 3: Classificacao Declarada, Detectada E Efetiva

Escolha um evento em que a classificacao efetiva seja diferente da classificacao declarada.

Responda:

1. Qual classificacao o usuario declarou?
2. O que o DLP detectou no conteudo?
3. Qual classificacao efetiva foi aplicada?
4. Por que a classificacao efetiva ficou mais restritiva?
5. O que poderia acontecer se o DLP confiasse apenas na classificacao declarada?

### Parte 4: Evidencias E Mascaramento

Escolha um evento com evidencias sensiveis.

Responda:

1. Quais tipos de evidencia foram detectados?
2. A evidencia aparece inteira ou mascarada?
3. Por que mascarar evidencias e importante em uma tela de auditoria?
4. O mascaramento remove o risco do dado original ou apenas reduz exposicao na visualizacao?

### Parte 5: Limitacoes Da Simulacao

Com base no que foi observado, responda:

1. O laboratorio inspeciona canais reais de email, navegador ou endpoint?
2. O laboratorio bloqueia trafego real ou apenas simula a decisao?
3. As politicas sao editaveis pela UI?
4. Existe integracao com diretorio corporativo, CASB, proxy, EDR ou SIEM?
5. O que seria necessario para transformar esta simulacao em uma prova de conceito mais proxima de producao?

### Parte 6: Sintese

Preencha a tabela:

| Situacao | Evidencia Principal | Contexto De Risco | Acao Do DLP | Motivo |
| --- | --- | --- | --- | --- |
| Conteudo publico enviado externamente |  |  |  |  |
| Salarios enviados para email pessoal |  |  |  |  |
| API key enviada para servico externo |  |  |  |  |
| CPFs enviados para IA publica |  |  |  |  |
| Contrato enviado para fornecedor aprovado |  |  |  |  |

## Gabarito Orientativo

- O DLP combina conteudo, classificacao, canal, destino e politica.
- Dados publicos podem ser permitidos quando nao ha evidencias sensiveis.
- Dados confidenciais podem gerar alerta ou quarentena quando o destino e aprovado.
- Dados restritos, credenciais e CPF em volume tendem a gerar bloqueio.
- Rotulos declarados ajudam, mas nao substituem inspecao de conteudo.
- Destinos pessoais, drives pessoais e IA publica aumentam o risco.
- Evidencias mascaradas permitem auditoria sem expor novamente o dado sensivel.
- Este laboratorio simula decisoes; ele nao intercepta trafego real.
