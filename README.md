# Lab DLP Simulation

Lab DLP Simulation is a local data loss prevention simulator with a FastAPI backend and a Vite React frontend. It evaluates sample data movement events, detects sensitive evidence, applies policy rules, stores simulated decisions in SQLite, and serves the built frontend from the same backend process.

## Docker

Build the single-container image:

```bash
docker build -t lab-dlp-simulation .
```

Run the container:

```bash
docker run --rm -p 8000:8000 lab-dlp-simulation
```

Open the app at http://localhost:8000.

## Simulation Model

Simulated channels:

- `email`
- `upload`
- `chat`

Classification levels:

- `publico`
- `interno`
- `confidencial`
- `restrito`

## Local Development

Backend:

```bash
cd backend
python -m venv .venv
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

Run backend tests:

```bash
cd backend
pytest
```
