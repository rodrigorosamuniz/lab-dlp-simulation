# Guia Da UI Do Lab DLP Simulation

Este guia mostra como usar a interface web do laboratório para entender as principaís features da simulação de DLP.

## Subir O Laboratório

Assumindo que o Docker Desktop ja esta rodando:

```bash
cd /Users/rodrigomuniz/Codex/lab-dlp-simulation
docker build -t lab-dlp-simulation .
docker run --rm -p 8000:8000 lab-dlp-simulation
```

Depois acesse:

```text
http://localhost:8000
```

Para parar o laboratório:

- se o container estiver rodando no terminal atual, pressione `Ctrl+C`;
- se estiver em background, rode `docker ps` e depois `docker stop <container_id_ou_nome>`.

## Visao Geral

A UI simula uma operação classica de DLP. Voce escolhe uma tentativa de saída de dados, executa a simulação e observa como o DLP classifica, decide e registra o evento.

O fluxo conceitual e:

```text
Canal de saida -> Inspecao de conteudo -> Classificacao -> Politica -> Decisao -> Auditoria/Alerta
```

## Areas Da Interface

### Dashboard

Mostra um resumo dos eventos ja simulados:

- total de eventos;
- bloqueios;
- quarentenas;
- alertas criticos;
- score medio.

Tambem possui o botao `Resetar eventos`, usado para limpar o histórico de simulações sem remover as amostras do laboratório.

### Simulador

E onde voce gera eventos DLP. Existem tres canais:

- `EMAIL`
- `UPLOAD`
- `CHAT`

Para cada canal, existem amostras prontas. Ao selecionar uma amostra, a interface preenche:

- usuário;
- departamento;
- destino;
- categoria do destino;
- classificação declarada;
- assunto ou arquivo;
- conteúdo inspecionado.

Voce pode executar a amostra como esta ou editar os campos para observar como a decisão muda.

### Políticas Fixas

Mostra a logica simplificada do DLP:

- conteúdo público tende a ser permitido;
- conteúdo interno enviado para fora gera alerta;
- conteúdo confidencial para destino aprovado pode ir para quarentena;
- conteúdo confidencial para destino pessoal ou IA publica e bloqueado;
- dados restritos, como tokens, cartoes ou vários CPFs, sao bloqueados;
- rótulo inconsistente gera alerta ou bloqueio.

### Eventos E Detalhe

Depois de clicar em `Executar simulacao`, o evento aparece na tabela.

Ao clicar no ID do evento, a interface mostra:

- classificação declarada;
- classificação detectada;
- classificação efetiva;
- ação final: `allow`, `warn`, `quarantine` ou `block`;
- severidade;
- score de risco;
- evidências detectadas;
- políticas acionadas;
- alertas gerados;
- justificativa da decisão;
- payload inspecionado.

## Roteiro Sugerido

### 1. Testar Conteúdo Público

Use:

- canal: `EMAIL`
- amostra: `Release publico`

Resultado esperado:

- ação: `allow`
- severidade baixa
- sem evidências sensíveis relevantes

Este cenario demonstra que o DLP nao deve bloquear toda saída externa. Ele deve considerar conteúdo, destino e classificação.

### 2. Testar Vazamento Confidencial

Use:

- canal: `EMAIL`
- amostra: `Planilha de salarios`

Resultado esperado:

- ação: `block`
- severidade alta
- política relacionada a conteúdo confidencial para destino pessoal

Este cenario representa um vazamento classico: informação de RH sendo enviada para email pessoal.

### 3. Testar Dado Restrito

Use:

- canal: `UPLOAD`
- amostra: `config.env`

Resultado esperado:

- ação: `block`
- severidade critica
- evidência de credencial ou chave de API

Este cenario mostra como um DLP pode detectar segredos técnicos em arquivos enviados para serviços externos.

### 4. Testar Chat Ou IA Publica

Use:

- canal: `CHAT`
- uma amostra com CPF ou análise de planilha com CPFs

Resultado esperado:

- ação: `block`
- severidade alta ou critica
- evidências de CPF, especialmente quando houver volume

Este cenario mostra o risco de copiar dados sensíveis para chats ou ferramentas de IA publica.

### 5. Editar Uma Amostra Manualmente

Escolha uma amostra e altere alguns campos:

- mude o destino de pessoal para aprovado;
- altere a classificação declarada;
- remova CPFs ou tokens do conteúdo;
- adicione CPFs, emails ou uma chave como `api_key = sk_live_1234567890abcdef`.

Observe como mudam:

- classificação detectada;
- classificação efetiva;
- política acionada;
- score;
- ação final.

## Pontos Para Observar

Durante os testes, preste atencao em quatro ideias principaís:

- `Classificacao declarada`: o que o usuário ou documento diz ser.
- `Classificacao detectada`: o que o DLP encontrou no conteúdo.
- `Classificacao efetiva`: a classificação usada para decidir.
- `Politica acionada`: a regra que levou a permitir, alertar, quarentenar ou bloquear.

## Interpretação

O laboratório nao e um DLP de produção. Ele e uma simulação didática para tornar visiveis componentes que normalmente ficam escondidos em ferramentas comerciais:

- classificadores;
- contexto de envio;
- políticas;
- score de risco;
- evidências;
- alertas;
- auditoria.
