# Guia Da UI Do Lab DLP Simulation

Este guia mostra como usar a interface web do laboratorio para entender as principais features da simulacao de DLP.

## Subir O Laboratorio

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

Para parar o laboratorio:

- se o container estiver rodando no terminal atual, pressione `Ctrl+C`;
- se estiver em background, rode `docker ps` e depois `docker stop <container_id_ou_nome>`.

## Visao Geral

A UI simula uma operacao classica de DLP. Voce escolhe uma tentativa de saida de dados, executa a simulacao e observa como o DLP classifica, decide e registra o evento.

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

Tambem possui o botao `Resetar eventos`, usado para limpar o historico de simulacoes sem remover as amostras do laboratorio.

### Simulador

E onde voce gera eventos DLP. Existem tres canais:

- `EMAIL`
- `UPLOAD`
- `CHAT`

Para cada canal, existem amostras prontas. Ao selecionar uma amostra, a interface preenche:

- usuario;
- departamento;
- destino;
- categoria do destino;
- classificacao declarada;
- assunto ou arquivo;
- conteudo inspecionado.

Voce pode executar a amostra como esta ou editar os campos para observar como a decisao muda.

### Politicas Fixas

Mostra a logica simplificada do DLP:

- conteudo publico tende a ser permitido;
- conteudo interno enviado para fora gera alerta;
- conteudo confidencial para destino aprovado pode ir para quarentena;
- conteudo confidencial para destino pessoal ou IA publica e bloqueado;
- dados restritos, como tokens, cartoes ou varios CPFs, sao bloqueados;
- rotulo inconsistente gera alerta ou bloqueio.

### Eventos E Detalhe

Depois de clicar em `Executar simulacao`, o evento aparece na tabela.

Ao clicar no ID do evento, a interface mostra:

- classificacao declarada;
- classificacao detectada;
- classificacao efetiva;
- acao final: `allow`, `warn`, `quarantine` ou `block`;
- severidade;
- score de risco;
- evidencias detectadas;
- politicas acionadas;
- alertas gerados;
- justificativa da decisao;
- payload inspecionado.

## Roteiro Sugerido

### 1. Testar Conteudo Publico

Use:

- canal: `EMAIL`
- amostra: `Release publico`

Resultado esperado:

- acao: `allow`
- severidade baixa
- sem evidencias sensiveis relevantes

Este cenario demonstra que o DLP nao deve bloquear toda saida externa. Ele deve considerar conteudo, destino e classificacao.

### 2. Testar Vazamento Confidencial

Use:

- canal: `EMAIL`
- amostra: `Planilha de salarios`

Resultado esperado:

- acao: `block`
- severidade alta
- politica relacionada a conteudo confidencial para destino pessoal

Este cenario representa um vazamento classico: informacao de RH sendo enviada para email pessoal.

### 3. Testar Dado Restrito

Use:

- canal: `UPLOAD`
- amostra: `config.env`

Resultado esperado:

- acao: `block`
- severidade critica
- evidencia de credencial ou chave de API

Este cenario mostra como um DLP pode detectar segredos tecnicos em arquivos enviados para servicos externos.

### 4. Testar Chat Ou IA Publica

Use:

- canal: `CHAT`
- uma amostra com CPF ou analise de planilha com CPFs

Resultado esperado:

- acao: `block`
- severidade alta ou critica
- evidencias de CPF, especialmente quando houver volume

Este cenario mostra o risco de copiar dados sensiveis para chats ou ferramentas de IA publica.

### 5. Editar Uma Amostra Manualmente

Escolha uma amostra e altere alguns campos:

- mude o destino de pessoal para aprovado;
- altere a classificacao declarada;
- remova CPFs ou tokens do conteudo;
- adicione CPFs, emails ou uma chave como `api_key = sk_live_1234567890abcdef`.

Observe como mudam:

- classificacao detectada;
- classificacao efetiva;
- politica acionada;
- score;
- acao final.

## Pontos Para Observar

Durante os testes, preste atencao em quatro ideias principais:

- `Classificacao declarada`: o que o usuario ou documento diz ser.
- `Classificacao detectada`: o que o DLP encontrou no conteudo.
- `Classificacao efetiva`: a classificacao usada para decidir.
- `Politica acionada`: a regra que levou a permitir, alertar, quarentenar ou bloquear.

## Interpretacao

O laboratorio nao e um DLP de producao. Ele e uma simulacao didatica para tornar visiveis componentes que normalmente ficam escondidos em ferramentas comerciais:

- classificadores;
- contexto de envio;
- politicas;
- score de risco;
- evidencias;
- alertas;
- auditoria.
