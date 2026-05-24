# Exercícios Do Lab DLP Simulation

## Objetivo

Usar a interface do laboratório para entender como um DLP classifica informações, detecta evidências sensíveis, aplica políticas, calcula risco e decide entre permitir, alertar, quarentenar ou bloquear uma saída de dados.

## Preparação

Suba o container:

```bash
docker build -t lab-dlp-simulation .
docker run --rm -p 8000:8000 lab-dlp-simulation
```

Acesse:

```text
http://localhost:8000
```

Observe inicialmente:

- Dashboard;
- Simulador;
- Políticas Fixas;
- tabela de Eventos;
- Detalhe do evento.

Se estiver reaproveitando o laboratório depois de outros testes, clique em `Resetar eventos` antes de iniciar os exercícios. Isso limpa o histórico e mantem as amostras disponíveis.

## Exercício 1: Conteúdo Público Permitido

No Simulador, use:

- canal: `EMAIL`
- amostra: `Release publico`

Execute a simulação.

Responda:

1. Qual foi a ação final?
2. Qual foi a severidade?
3. O DLP encontrou alguma evidência sensível?
4. Por que faz sentido permitir esse envio?

Resultado esperado:

- ação próxima de `allow`;
- severidade baixa;
- nenhuma evidência sensível relevante.

## Exercício 2: Informação Confidencial Para Email Pessoal

No Simulador, use:

- canal: `EMAIL`
- amostra: `Planilha de salarios`

Execute a simulação.

Responda:

1. Qual política foi acionada?
2. A classificação declarada e a detectada sao iguais?
3. Por que salário e tratado como informação sensível?
4. Qual seria um destino mais adequado para esse conteúdo?

Resultado esperado:

- ação `block`;
- severidade alta;
- política relacionada a conteúdo confidencial enviado para destino pessoal.

## Exercício 3: Contrato Para Fornecedor Aprovado

No Simulador, use:

- canal: `EMAIL`
- amostra: `Contrato fornecedor`

Execute a simulação.

Responda:

1. O envio foi permitido, bloqueado ou colocado em quarentena?
2. Por que o destino aprovado muda a decisão?
3. Qual e a diferenca entre bloquear e quarentenar?
4. Em um DLP real, quem poderia revisar uma quarentena?

Resultado esperado:

- ação `quarantine` ou alerta controlado;
- severidade intermediaria;
- demonstração de que contexto importa, nao apenas conteúdo.

## Exercício 4: Upload Público

No Simulador, use:

- canal: `UPLOAD`
- amostra: `campanha-publica.txt`

Execute a simulação.

Responda:

1. O canal `UPLOAD` por si so torna o evento suspeito?
2. O conteúdo foi classificado como público, interno, confidencial ou restrito?
3. Por que um DLP nao deve bloquear todo upload externo?

Resultado esperado:

- ação `allow`;
- baixo risco;
- demonstração de reducao de falso positivo.

## Exercício 5: Base De Clientes Para Drive Pessoal

No Simulador, use:

- canal: `UPLOAD`
- amostra: `base-clientes.csv`

Execute a simulação.

Responda:

1. Quais evidências foram detectadas?
2. A presença de vários CPFs mudou a classificação?
3. Qual foi a classificação efetiva?
4. Por que o destino `Drive pessoal` aumenta o risco?

Resultado esperado:

- ação `block`;
- classificação efetiva `restrito`;
- evidência de CPF em volume.

## Exercício 6: Vazamento De Chave De API

No Simulador, use:

- canal: `UPLOAD`
- amostra: `config.env`

Execute a simulação.

Responda:

1. Qual evidência técnica foi detectada?
2. Por que uma chave de API e considerada dado restrito?
3. Qual foi a severidade?
4. Que controles adicionais poderiam existir em produção?

Resultado esperado:

- ação `block`;
- severidade `critical`;
- evidência de credencial ou token.

## Exercício 7: Chat Interno Com Conteúdo Público

No Simulador, use:

- canal: `CHAT`
- amostra: `Resumo de politica publica`

Execute a simulação.

Responda:

1. O canal chat foi bloqueado?
2. O conteúdo continha dado sensível?
3. Por que a classificação publica reduz o risco?

Resultado esperado:

- ação `allow`;
- baixo risco;
- demonstração de que o DLP avalia conteúdo e contexto.

## Exercício 8: Dados De Cliente Em IA Publica

No Simulador, use:

- canal: `CHAT`
- amostra: `Prompt de atendimento`

Execute a simulação.

Responda:

1. Quais evidências aparecem no detalhe do evento?
2. O dado sensível foi exibido inteiro ou mascarado?
3. Por que enviar dados de cliente para IA publica e arriscado?
4. A classificação declarada pelo usuário foi suficiente para liberar o envio?

Resultado esperado:

- ação `block`;
- evidência de email e CPF;
- demonstração de rótulo inconsistente e classificação elevada pelo DLP.

## Exercício 9: CPF Em Volume Em Chat/IA

No Simulador, use:

- canal: `CHAT`
- amostra: `Analise de planilha com CPFs`

Execute a simulação.

Responda:

1. Quantos CPFs foram detectados?
2. O volume de evidências mudou a severidade?
3. Qual política foi acionada?
4. Por que volume e importante em DLP?

Resultado esperado:

- ação `block`;
- severidade alta ou critica;
- classificação efetiva `restrito`.

## Exercício 10: Rótulo Inconsistente

Escolha uma amostra publica e edite o conteúdo adicionando:

```text
CPF 123.456.789-09
```

Mantenha a classificação declarada como `Publico`.

Execute a simulação.

Responda:

1. O que o usuário declarou?
2. O que o DLP detectou?
3. Qual foi a classificação efetiva?
4. Qual política trata essa inconsistencia?
5. Por que um DLP nao deve confiar apenas no rótulo declarado?

Resultado esperado:

- política de rótulo inconsistente;
- classificação efetiva maior que `Publico`;
- alerta, quarentena ou bloqueio conforme destino, canal e severidade.

## Exercício 11: Mudança De Destino

Use a amostra `Planilha de salarios`.

Primeiro execute como esta.

Depois altere:

- destino: de email pessoal para fornecedor aprovado;
- categoria do destino: de `pessoal` para `externo_aprovado`.

Execute novamente.

Compare os dois eventos.

Responda:

1. A evidência sensível mudou?
2. A classificação mudou?
3. A política acionada mudou?
4. A ação final mudou?
5. O que isso mostra sobre contexto?

Resultado esperado:

- o conteúdo continua sensível;
- o destino altera a decisão;
- demonstração de contexto na política DLP.

## Exercício 12: Remocao De Evidência Sensível

Use a amostra `base-clientes.csv`.

Remova os CPFs do conteúdo e substitua por texto generico:

```text
Lista de clientes segmentada por regiao, sem identificadores pessoais.
```

Execute a simulação.

Responda:

1. A classificação detectada mudou?
2. A ação final mudou?
3. O score diminuiu?
4. O que isso ensina sobre minimização de dados?

Resultado esperado:

- menos evidências sensíveis;
- risco menor;
- possível mudança de `block` para ação menos restritiva.

## Consolidação Individual

Use a tabela de eventos e os detalhes das simulações executadas para responder individualmente.

### Parte 1: Identificar O Evento Mais Critico

1. Abra a tabela de eventos.
2. Localize o evento com maior severidade ou maior score.
3. Clique no ID do evento e observe os detalhes.

Responda:

1. Qual foi o canal usado?
2. Qual foi o destino?
3. Qual foi a classificação efetiva?
4. Qual foi a ação final?
5. Quais evidências contribuiram para esse risco?
6. Qual política foi acionada?

### Parte 2: Comparar Conteúdo E Contexto

Escolha dois eventos:

- um evento permitido ou de baixo risco;
- um evento bloqueado ou de alto risco.

Responda:

1. O que mudou no conteúdo?
2. O que mudou no destino?
3. O canal influenciou a decisão?
4. A classificação declarada foi suficiente para explicar a decisão?
5. A classificação detectada mudou a interpretação do evento?

### Parte 3: Classificação Declarada, Detectada E Efetiva

Escolha um evento em que a classificação efetiva seja diferente da classificação declarada.

Responda:

1. Qual classificação o usuário declarou?
2. O que o DLP detectou no conteúdo?
3. Qual classificação efetiva foi aplicada?
4. Por que a classificação efetiva ficou mais restritiva?
5. O que poderia acontecer se o DLP confiasse apenas na classificação declarada?

### Parte 4: Evidências E Mascaramento

Escolha um evento com evidências sensíveis.

Responda:

1. Quais tipos de evidência foram detectados?
2. A evidência aparece inteira ou mascarada?
3. Por que mascarar evidências e importante em uma tela de auditoria?
4. O mascaramento remove o risco do dado original ou apenas reduz exposicao na visualização?

### Parte 5: Limitações Da Simulação

Com base no que foi observado, responda:

1. O laboratório inspeciona canais reais de email, navegador ou endpoint?
2. O laboratório bloqueia tráfego real ou apenas simula a decisão?
3. As políticas sao editáveis pela UI?
4. Existe integração com diretório corporativo, CASB, proxy, EDR ou SIEM?
5. O que seria necessário para transformar esta simulação em uma prova de conceito mais próxima de produção?

### Parte 6: Sintese

Preencha a tabela:

| Situação | Evidência Principal | Contexto De Risco | Ação Do DLP | Motivo |
| --- | --- | --- | --- | --- |
| Conteúdo público enviado externamente |  |  |  |  |
| Salários enviados para email pessoal |  |  |  |  |
| API key enviada para serviço externo |  |  |  |  |
| CPFs enviados para IA publica |  |  |  |  |
| Contrato enviado para fornecedor aprovado |  |  |  |  |

## Gabarito Orientativo

- O DLP combina conteúdo, classificação, canal, destino e política.
- Dados públicos podem ser permitidos quando nao ha evidências sensíveis.
- Dados confidenciais podem gerar alerta ou quarentena quando o destino e aprovado.
- Dados restritos, credenciais e CPF em volume tendem a gerar bloqueio.
- Rótulos declarados ajudam, mas nao substituem inspecao de conteúdo.
- Destinos pessoais, drives pessoais e IA publica aumentam o risco.
- Evidências mascaradas permitem auditoria sem expor novamente o dado sensível.
- Este laboratório simula decisões; ele nao intercepta tráfego real.
