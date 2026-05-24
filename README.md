# Lab DLP Simulation

Laboratório local para demonstrar conceitos de DLP (Data Loss Prevention) de forma didática. O projeto combina backend FastAPI, frontend React/Vite e SQLite em uma única aplicação servida pelo container Docker.

A simulação avalia eventos de saída de dados, detecta evidências sensíveis, calcula classificação detectada e efetiva, aplica políticas, gera alertas e registra o histórico para auditoria.

## Material Do Laboratório

- [Guia da UI](UI_GUIDE.md): overview rapido das telas e features.
- [Exercícios](EXERCISES.md): roteiro individual para alunos práticarem cenarios de DLP.

## Requisitos

Para a forma recomendada:

- Docker Desktop ou Docker Engine.

Para desenvolvimento local:

- Python 3.12.
- Node.js 20 ou superior.
- npm.

> Observação: use Python 3.12 no desenvolvimento local. Versoes mais novas, como Python 3.14, podem quebrar dependencias pinadas do backend, especialmente `pydantic-core`.

## Instalação E Execução Com Docker

Na raiz do projeto:

```bash
docker build -t lab-dlp-simulation .
```

Suba o laboratório:

```bash
docker run --rm -p 8000:8000 lab-dlp-simulation
```

Acesse:

```text
http://localhost:8000
```

Para parar o laboratório quando o container estiver rodando no terminal atual, pressione `Ctrl+C`.

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
3. Execute a simulação.
4. Clique no ID do evento na tabela.
5. Análise classificações, evidências, políticas, alertas, score e ação final.
6. Use `Resetar eventos` para limpar o histórico antes de uma nova turma ou novo roteiro.

## Modelo Da Simulação

Canais simulados:

- `email`
- `upload`
- `chat`

Classificações:

- `publico`
- `interno`
- `confidencial`
- `restrito`

Categorias de destino:

- `interno`
- `externo_aprovado`
- `pessoal`
- `servico_publico`

Ações possiveis:

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

Em desenvolvimento, a UI do Vite roda separada do backend. Para testar a aplicação empacotada como os alunos vao usar, prefira o Docker.

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

## Estrutura

```text
backend/   API FastAPI, motor de simulacao DLP, persistencia SQLite e testes
frontend/  Interface React/Vite
Dockerfile Build unico com backend e frontend
```
