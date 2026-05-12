# Lab DLP Simulation

Laboratorio local para demonstrar conceitos de DLP (Data Loss Prevention) de forma didatica. O projeto combina backend FastAPI, frontend React/Vite e SQLite em uma unica aplicacao servida pelo container Docker.

A simulacao avalia eventos de saida de dados, detecta evidencias sensiveis, calcula classificacao detectada e efetiva, aplica politicas, gera alertas e registra o historico para auditoria.

## Material Do Laboratorio

- [Guia da UI](UI_GUIDE.md): overview rapido das telas e features.
- [Exercicios](EXERCISES.md): roteiro individual para alunos praticarem cenarios de DLP.
- [Guia do notebook](NOTEBOOK_GUIDE.md): como rodar e usar o notebook de codificacoes e hashes.
- [Exercicios do notebook](NOTEBOOK_EXERCISES.md): roteiro individual para praticar codificacoes, hashes e interpretacao das saidas.

## Requisitos

Para a forma recomendada:

- Docker Desktop ou Docker Engine.

Para desenvolvimento local:

- Python 3.12.
- Node.js 20 ou superior.
- npm.

> Observacao: use Python 3.12 no desenvolvimento local. Versoes mais novas, como Python 3.14, podem quebrar dependencias pinadas do backend, especialmente `pydantic-core`.

## Instalacao E Execucao Com Docker

Na raiz do projeto:

```bash
docker build -t lab-dlp-simulation .
```

Suba o laboratorio:

```bash
docker run --rm -p 8000:8000 lab-dlp-simulation
```

Acesse:

```text
http://localhost:8000
```

Para parar o laboratorio quando o container estiver rodando no terminal atual, pressione `Ctrl+C`.

Se o container estiver em background, liste os containers:

```bash
docker ps
```

Depois pare pelo ID ou nome:

```bash
docker stop <container_id_ou_nome>
```

O container serve a API e a UI no mesmo processo. O banco SQLite fica dentro do container e e reiniciado quando o container e removido.

## Uso Rapido

1. Abra `http://localhost:8000`.
2. Escolha uma amostra no Simulador.
3. Execute a simulacao.
4. Clique no ID do evento na tabela.
5. Analise classificacoes, evidencias, politicas, alertas, score e acao final.
6. Use `Resetar eventos` para limpar o historico antes de uma nova turma ou novo roteiro.

## Modelo Da Simulacao

Canais simulados:

- `email`
- `upload`
- `chat`

Classificacoes:

- `publico`
- `interno`
- `confidencial`
- `restrito`

Categorias de destino:

- `interno`
- `externo_aprovado`
- `pessoal`
- `servico_publico`

Acoes possiveis:

- `allow`
- `warn`
- `quarantine`
- `block`

## Desenvolvimento Local

Backend:

```bash
cd backend
python3.12 -m venv .venv
. .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Em desenvolvimento, a UI do Vite roda separada do backend. Para testar a aplicacao empacotada como os alunos vao usar, prefira o Docker.

## Testes

Backend local, com ambiente Python 3.12 ja preparado:

```bash
cd backend
pytest -q
```

Backend via Docker, sem depender do Python instalado na maquina:

```bash
docker run --rm -v "$PWD":/app -w /app/backend python:3.12-slim sh -c "pip install -r requirements.txt && pytest -q"
```

Frontend:

```bash
cd frontend
npm install
npm run build
```

## Notebook De Codificacoes E Hashes

O repositorio tambem contem um notebook didatico sobre codificacoes e hashes:

```text
notebooks/lab_codificacoes_hashes.ipynb
```

Para usar:

1. Abra o arquivo no VS Code com a extensao Jupyter, Jupyter Notebook ou JupyterLab.
2. Execute a celula de codigo.
3. Digite textos ficticios para comparar codificacoes e hashes.
4. Use [Guia do notebook](NOTEBOOK_GUIDE.md) e [Exercicios do notebook](NOTEBOOK_EXERCISES.md) como roteiro.

Nao use dados reais, senhas reais, tokens ou informacoes pessoais no notebook.

## Estrutura

```text
backend/   API FastAPI, motor de simulacao DLP, persistencia SQLite e testes
frontend/  Interface React/Vite
notebooks/ Notebook didatico de codificacoes e hashes
Dockerfile Build unico com backend e frontend
```
