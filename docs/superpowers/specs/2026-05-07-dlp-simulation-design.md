# Lab DLP Simulation Design

## Objetivo

Criar um laboratorio didatico que simule o funcionamento de um DLP classico sem depender de produtos comerciais. O lab deve demonstrar classificacao da informacao, inspecao de conteudo, avaliacao de contexto, politicas de prevencao, alertas de vazamento e trilha de auditoria.

O foco da primeira entrega e uma simulacao operacional controlada. Ela deve parecer coerente com um ambiente corporativo real, mas continuar simples o suficiente para uso em aula, execucao local e troubleshooting previsivel.

## Nao Objetivos Da Primeira Entrega

- Integrar com email, navegadores, endpoints ou SaaS reais.
- Criar um DLP de producao.
- Implementar machine learning para classificacao.
- Permitir edicao de politicas pela interface.
- Criar exercicios e desafios completos. Eles podem ser adicionados depois em um arquivo Markdown separado.
- Reusar ou alterar o projeto `lab-protecao-dados`.

## Formato Do Projeto

O projeto sera novo e separado, chamado `lab-dlp-simulation`.

A primeira entrega deve rodar em um unico container Docker:

```bash
docker build -t lab-dlp-simulation .
docker run --rm -p 8000:8000 lab-dlp-simulation
```

O aluno ou professor acessa a interface em `http://localhost:8000`.

## Arquitetura

O laboratorio sera hibrido:

- Backend em Python com FastAPI.
- Banco SQLite local para eventos, alertas, politicas, classificacoes e amostras.
- Frontend React/Vite para uma interface mais rica.
- Build Docker unico, em que o frontend e compilado e servido pelo backend.

Componentes principais:

- `DLP Engine`: coordena classificacao, contexto, politicas e decisao final.
- `Content Classifiers`: detectam padroes sensiveis e rotulos declarados.
- `Context Evaluator`: avalia canal, destino, usuario, departamento e tipo de compartilhamento.
- `Policy Engine`: aplica politicas fixas da primeira entrega.
- `Audit Store`: persiste eventos, decisoes, evidencias e alertas no SQLite.
- `Web UI`: permite simular eventos, visualizar painel operacional, consultar alertas e abrir detalhes.

## Canais Simulados

A primeira entrega tera tres canais:

- Email: corpo de mensagem, assunto, remetente, destinatario e anexos simulados.
- Upload web: nome de arquivo, destino, categoria do destino e conteudo textual.
- Chat/IA: prompt, destino de chat ou IA e conteudo colado pelo usuario.

Cada tentativa de saida gera um evento DLP. O evento registra canal, usuario, destino, classificacao declarada, conteudo inspecionado, evidencias detectadas, politicas acionadas, score de risco e decisao.

## Classificacao Da Informacao

O laboratorio usara quatro niveis:

- `Publico`: conteudo aprovado para divulgacao externa, sem dados sensiveis.
- `Interno`: informacao operacional da empresa, adequada ao uso interno e monitorada quando enviada para fora.
- `Confidencial`: dados de clientes, contratos, relatorios financeiros, salarios e documentos juridicos.
- `Restrito`: dados altamente sensiveis, como CPF em volume, cartoes, credenciais, tokens, chaves de API, dumps e bases exportadas.

A interface deve exibir:

- Classificacao declarada pelo usuario ou pela amostra.
- Classificacao detectada pelo DLP.
- Classificacao efetiva usada para decisao.
- Justificativa da classificacao efetiva.

## Deteccoes Da Primeira Entrega

Os classificadores devem ser transparentes e explicaveis. A primeira entrega deve incluir:

- CPF.
- Cartao de credito em formato plausivel.
- Enderecos de email.
- Credenciais e chaves, como `api_key`, `secret`, `password`, `token` e formatos similares.
- Indicadores de salario, folha de pagamento e remuneracao.
- Marcadores declarados, como `[PUBLICO]`, `[INTERNO]`, `[CONFIDENCIAL]` e `[RESTRITO]`.
- Volume de evidencias, por exemplo multiplos CPFs ou muitos emails no mesmo conteudo.

As evidencias devem aparecer no detalhe do evento de forma mascarada quando apropriado, para demonstrar o achado sem expor integralmente o dado sensivel.

## Politicas Fixas

A primeira entrega tera politicas versionadas no projeto e somente leitura na UI.

Politicas iniciais:

| Politica | Condicao | Acao |
| --- | --- | --- |
| Dados publicos | Classificacao `Publico`, sem evidencia sensivel | Permitir |
| Conteudo interno para externo | `Interno` enviado para dominio ou destino externo | Alertar |
| Confidencial para destino aprovado | `Confidencial` enviado para fornecedor ou dominio aprovado | Alertar ou quarentenar |
| Confidencial para destino pessoal | `Confidencial` enviado para email pessoal, drive pessoal, chat publico ou IA publica | Bloquear |
| Dados restritos | CPF em volume, cartao, credencial, token, chave ou dump | Bloquear |
| Rotulo inconsistente | Usuario declara `Publico`, mas o DLP detecta dado sensivel | Alertar ou bloquear conforme severidade |

Acoes possiveis:

- `allow`: permite a saida e registra auditoria.
- `warn`: permite ou simula aviso, gerando alerta de baixa ou media severidade.
- `quarantine`: segura a saida para revisao e gera alerta.
- `block`: bloqueia a saida e gera alerta de alta severidade.

## Score E Severidade

Cada evento deve receber um score numerico de risco e uma severidade textual:

- `low`: evento permitido ou apenas monitorado.
- `medium`: evento com risco contextual ou rotulo inconsistente.
- `high`: evento confidencial em canal ou destino inadequado.
- `critical`: dados restritos, credenciais, cartoes ou alto volume de dados pessoais.

O score deve ser explicavel na UI por fatores como classificacao, canal, destino externo, destino pessoal, volume de evidencias e tipo de dado encontrado.

## Experiencia Da Interface

A interface deve ter quatro areas principais:

- Dashboard: totais de eventos, alertas por severidade, canais mais arriscados, ultimos bloqueios e tendencias simples.
- Simulador: abas para Email, Upload e Chat/IA, com amostras prontas e campos editaveis.
- Eventos: lista filtravel com canal, usuario, destino, classificacao, decisao, severidade e horario.
- Detalhe do evento: evidencias, politicas acionadas, score, justificativa e payload resumido.

A interface nao deve depender de configuracao avancada. O fluxo principal deve ser: escolher uma amostra, revisar ou editar campos, executar simulacao, ver decisao, abrir detalhe.

## Amostras Prontas

Cada canal tera exemplos prontos com campos editaveis.

Email:

- Release publico para imprensa.
- Planilha de salarios enviada para email pessoal.
- Contrato confidencial enviado para fornecedor aprovado.

Upload web:

- Campanha publica enviada para portal externo.
- Base de clientes enviada para drive pessoal.
- Arquivo com chave de API enviado para repositorio externo.

Chat/IA:

- Resumo de politica publica.
- Prompt com dados de cliente para gerar resposta.
- Analise de planilha contendo CPFs.

As amostras devem ser coerentes, pequenas e reproduziveis, para que a aula sempre gere resultados previsiveis.

## Dados Corporativos Simulados

O cenario sera generico, mas corporativo:

- Departamentos: RH, Financeiro, Vendas e Juridico.
- Usuarios internos com perfil e departamento.
- Destinos internos, externos aprovados, externos pessoais e servicos publicos.
- Conteudos relacionados a clientes, contratos, salarios, campanhas publicas e credenciais.

## Persistencia

O SQLite deve armazenar:

- Eventos DLP.
- Alertas gerados.
- Evidencias detectadas.
- Politicas aplicadas.
- Amostras disponiveis.

O banco pode ser recriado de forma previsivel na inicializacao ou por comando dedicado, para manter a aula reproduzivel.

## Tratamento De Erros

Erros de validacao na UI devem orientar o usuario a preencher campos obrigatorios, como canal, destino e conteudo.

Erros internos do motor DLP devem ser registrados e retornados como falha controlada, sem quebrar a interface. Eventos invalidos nao devem gerar decisoes falsas.

## Testes

A primeira entrega deve ter testes focados em:

- Classificacao de conteudo sensivel.
- Resolucao da classificacao efetiva.
- Aplicacao das politicas fixas.
- Calculo de score e severidade.
- Persistencia de evento e alerta.
- Contrato basico da API usada pelo frontend.

Tambem deve haver uma verificacao Docker simples para confirmar que a imagem construi, o servidor sobe e a UI responde.

## Caminho De Evolucao

Depois da primeira entrega, o projeto pode receber:

- Arquivo `EXERCISES.md` com exercicios e desafios.
- Editor de politicas na UI.
- Exportacao de relatorios.
- Simulacao de aprovacao de quarentena.
- Comparacao entre politicas permissivas e restritivas.
- Importacao de arquivos `.txt` ou `.csv` para inspecao.
- Modo professor com reset de dados e cenarios guiados.
