# DLP Simulation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first working version of `lab-dlp-simulation`: a single-container educational DLP simulator with fixed policies, classification, alerts, audit events, and a React UI.

**Architecture:** The backend is a FastAPI application with a small, testable DLP domain package and SQLite persistence. The frontend is a Vite React app compiled into static files and served by FastAPI in the production Docker image. The DLP engine stays transparent: deterministic classifiers, explicit context evaluation, fixed policy decisions, risk score factors, and persisted evidence.

**Tech Stack:** Python 3.12, FastAPI, Pydantic, SQLite, pytest, Vite, React, TypeScript, Docker.

---

## File Structure

Create this structure:

```text
lab-dlp-simulation/
  README.md
  Dockerfile
  .dockerignore
  backend/
    requirements.txt
    pyproject.toml
    app/
      __init__.py
      main.py
      api.py
      seed.py
      dlp/
        __init__.py
        models.py
        classifiers.py
        policy.py
        engine.py
        samples.py
      storage/
        __init__.py
        database.py
        repository.py
    tests/
      test_classifiers.py
      test_engine.py
      test_repository.py
      test_api.py
  frontend/
    package.json
    index.html
    tsconfig.json
    vite.config.ts
    src/
      main.tsx
      App.tsx
      api.ts
      types.ts
      styles.css
      components/
        Dashboard.tsx
        Simulator.tsx
        EventsTable.tsx
        EventDetail.tsx
        PolicySummary.tsx
```

Responsibility boundaries:

- `backend/app/dlp/models.py`: enums and Pydantic models used by the engine and API.
- `backend/app/dlp/classifiers.py`: deterministic evidence detection and classification inference.
- `backend/app/dlp/policy.py`: context categories, fixed policy rules, score and severity.
- `backend/app/dlp/engine.py`: orchestrates classifiers and policy evaluation for one outbound event.
- `backend/app/dlp/samples.py`: reproducible corporate sample events.
- `backend/app/storage/database.py`: schema creation and connection handling.
- `backend/app/storage/repository.py`: persistence and query functions.
- `backend/app/api.py`: HTTP routes only; no DLP decision logic.
- `frontend/src/api.ts`: typed calls to backend endpoints.
- `frontend/src/App.tsx`: shell, navigation, and shared state.
- `frontend/src/components/*`: focused UI pieces.

## Task 1: Backend Scaffold And Health API

**Files:**
- Create: `backend/requirements.txt`
- Create: `backend/pyproject.toml`
- Create: `backend/app/__init__.py`
- Create: `backend/app/main.py`
- Create: `backend/app/api.py`
- Create: `backend/tests/test_api.py`

- [ ] **Step 1: Create Python dependencies**

Create `backend/requirements.txt`:

```text
fastapi==0.115.12
uvicorn[standard]==0.34.2
pydantic==2.11.4
pytest==8.3.5
httpx==0.28.1
```

- [ ] **Step 2: Configure pytest**

Create `backend/pyproject.toml`:

```toml
[tool.pytest.ini_options]
pythonpath = ["."]
testpaths = ["tests"]
addopts = "-q"
```

- [ ] **Step 3: Write failing health test**

Create `backend/tests/test_api.py`:

```python
from fastapi.testclient import TestClient

from app.main import app


def test_health_endpoint_returns_ok():
    client = TestClient(app)

    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "lab-dlp-simulation"}
```

- [ ] **Step 4: Run test to verify it fails**

Run:

```bash
cd backend
pytest tests/test_api.py::test_health_endpoint_returns_ok -q
```

Expected: FAIL because `app.main` or `/api/health` does not exist yet.

- [ ] **Step 5: Implement FastAPI app and route**

Create `backend/app/__init__.py`:

```python
"""Lab DLP Simulation backend package."""
```

Create `backend/app/api.py`:

```python
from fastapi import APIRouter

router = APIRouter(prefix="/api")


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "lab-dlp-simulation"}
```

Create `backend/app/main.py`:

```python
from fastapi import FastAPI

from app.api import router

app = FastAPI(title="Lab DLP Simulation")
app.include_router(router)
```

- [ ] **Step 6: Run test to verify it passes**

Run:

```bash
cd backend
pytest tests/test_api.py::test_health_endpoint_returns_ok -q
```

Expected: PASS.

- [ ] **Step 7: Commit scaffold**

```bash
git add backend
git commit -m "feat: scaffold backend health api"
```

## Task 2: Domain Models And Content Classifiers

**Files:**
- Create: `backend/app/dlp/__init__.py`
- Create: `backend/app/dlp/models.py`
- Create: `backend/app/dlp/classifiers.py`
- Create: `backend/tests/test_classifiers.py`

- [ ] **Step 1: Write classifier tests**

Create `backend/tests/test_classifiers.py`:

```python
from app.dlp.classifiers import classify_content
from app.dlp.models import ClassificationLevel, EvidenceType


def evidence_types(result):
    return {item.type for item in result.evidence}


def test_detects_restricted_credentials_and_masks_value():
    result = classify_content("api_key = sk_live_1234567890abcdef")

    assert result.detected_level == ClassificationLevel.RESTRICTED
    assert EvidenceType.SECRET in evidence_types(result)
    assert result.evidence[0].masked_value.startswith("api_key")
    assert "abcdef" not in result.evidence[0].masked_value


def test_detects_confidential_salary_terms():
    result = classify_content("Planilha de salarios e folha de pagamento do RH")

    assert result.detected_level == ClassificationLevel.CONFIDENTIAL
    assert EvidenceType.SALARY in evidence_types(result)


def test_public_marker_without_sensitive_data_stays_public():
    result = classify_content("[PUBLICO] Release aprovado para imprensa")

    assert result.detected_level == ClassificationLevel.PUBLIC
    assert result.declared_marker == ClassificationLevel.PUBLIC
    assert result.evidence == []


def test_multiple_cpfs_raise_restricted_level():
    result = classify_content("Clientes: 123.456.789-09, 987.654.321-00, 111.222.333-44")

    assert result.detected_level == ClassificationLevel.RESTRICTED
    assert EvidenceType.CPF in evidence_types(result)
    assert result.evidence_count_by_type[EvidenceType.CPF] == 3
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
cd backend
pytest tests/test_classifiers.py -q
```

Expected: FAIL because DLP models and classifiers do not exist yet.

- [ ] **Step 3: Implement models**

Create `backend/app/dlp/__init__.py`:

```python
"""Deterministic DLP simulation domain package."""
```

Create `backend/app/dlp/models.py`:

```python
from enum import StrEnum
from pydantic import BaseModel, Field


class Channel(StrEnum):
    EMAIL = "email"
    UPLOAD = "upload"
    CHAT = "chat"


class ClassificationLevel(StrEnum):
    PUBLIC = "publico"
    INTERNAL = "interno"
    CONFIDENTIAL = "confidencial"
    RESTRICTED = "restrito"


class EvidenceType(StrEnum):
    CPF = "cpf"
    CREDIT_CARD = "cartao"
    EMAIL = "email"
    SECRET = "credencial"
    SALARY = "salario"
    LABEL = "rotulo"


class DestinationCategory(StrEnum):
    INTERNAL = "interno"
    APPROVED_EXTERNAL = "externo_aprovado"
    PERSONAL = "pessoal"
    PUBLIC_SERVICE = "servico_publico"


class DlpAction(StrEnum):
    ALLOW = "allow"
    WARN = "warn"
    QUARANTINE = "quarantine"
    BLOCK = "block"


class Severity(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Evidence(BaseModel):
    type: EvidenceType
    label: str
    masked_value: str
    count: int = 1
    weight: int


class ClassificationResult(BaseModel):
    declared_marker: ClassificationLevel | None = None
    detected_level: ClassificationLevel
    evidence: list[Evidence] = Field(default_factory=list)
    evidence_count_by_type: dict[EvidenceType, int] = Field(default_factory=dict)
    rationale: list[str] = Field(default_factory=list)


class DlpEventInput(BaseModel):
    channel: Channel
    user: str
    department: str
    destination: str
    destination_category: DestinationCategory
    declared_classification: ClassificationLevel
    subject: str
    content: str


class PolicyMatch(BaseModel):
    name: str
    action: DlpAction
    severity: Severity
    reason: str
    score_delta: int


class DlpDecision(BaseModel):
    action: DlpAction
    severity: Severity
    score: int
    effective_classification: ClassificationLevel
    detected_classification: ClassificationLevel
    declared_classification: ClassificationLevel
    evidence: list[Evidence]
    policies: list[PolicyMatch]
    rationale: list[str]
```

- [ ] **Step 4: Implement classifiers**

Create `backend/app/dlp/classifiers.py`:

```python
import re
from collections import Counter

from app.dlp.models import ClassificationLevel, ClassificationResult, Evidence, EvidenceType

CPF_RE = re.compile(r"\b\d{3}\.\d{3}\.\d{3}-\d{2}\b")
CARD_RE = re.compile(r"\b(?:\d[ -]*?){13,16}\b")
EMAIL_RE = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b")
SECRET_RE = re.compile(
    r"\b(api[_-]?key|secret|password|token)\s*[:=]\s*['\"]?[A-Za-z0-9_\-]{8,}",
    re.IGNORECASE,
)
SALARY_RE = re.compile(r"\b(salario|salarios|folha de pagamento|remuneracao|bonus)\b", re.IGNORECASE)
LABELS = {
    "[PUBLICO]": ClassificationLevel.PUBLIC,
    "[INTERNO]": ClassificationLevel.INTERNAL,
    "[CONFIDENCIAL]": ClassificationLevel.CONFIDENTIAL,
    "[RESTRITO]": ClassificationLevel.RESTRICTED,
}
LEVEL_ORDER = [
    ClassificationLevel.PUBLIC,
    ClassificationLevel.INTERNAL,
    ClassificationLevel.CONFIDENTIAL,
    ClassificationLevel.RESTRICTED,
]


def classify_content(content: str) -> ClassificationResult:
    evidence: list[Evidence] = []
    rationale: list[str] = []
    declared_marker = _find_declared_marker(content)

    evidence.extend(_find_all(CPF_RE, content, EvidenceType.CPF, "CPF", 35, _mask_cpf))
    evidence.extend(_find_all(CARD_RE, content, EvidenceType.CREDIT_CARD, "Cartao", 45, _mask_card))
    evidence.extend(_find_all(EMAIL_RE, content, EvidenceType.EMAIL, "Email", 10, _mask_email))
    evidence.extend(_find_all(SECRET_RE, content, EvidenceType.SECRET, "Credencial", 60, _mask_secret))
    evidence.extend(_find_all(SALARY_RE, content, EvidenceType.SALARY, "Salario", 25, _mask_term))

    counts = Counter(item.type for item in evidence)
    detected_level = _level_from_evidence(counts)

    if declared_marker is not None:
        rationale.append(f"Rotulo declarado encontrado: {declared_marker.value}.")
        detected_level = _max_level(detected_level, declared_marker)

    if counts:
        rationale.append("Conteudo sensivel detectado por regras deterministicas.")
    elif declared_marker is None:
        rationale.append("Nenhuma evidencia sensivel detectada.")

    return ClassificationResult(
        declared_marker=declared_marker,
        detected_level=detected_level,
        evidence=evidence,
        evidence_count_by_type=dict(counts),
        rationale=rationale,
    )


def _find_declared_marker(content: str) -> ClassificationLevel | None:
    upper = content.upper()
    for marker, level in LABELS.items():
        if marker in upper:
            return level
    return None


def _find_all(pattern: re.Pattern[str], content: str, kind: EvidenceType, label: str, weight: int, masker) -> list[Evidence]:
    matches = pattern.findall(content)
    if not matches:
        return []
    values = [match if isinstance(match, str) else match[0] for match in matches]
    first = values[0]
    return [Evidence(type=kind, label=label, masked_value=masker(first), count=len(values), weight=weight)]


def _level_from_evidence(counts: Counter[EvidenceType]) -> ClassificationLevel:
    if counts[EvidenceType.SECRET] or counts[EvidenceType.CREDIT_CARD] or counts[EvidenceType.CPF] >= 3:
        return ClassificationLevel.RESTRICTED
    if counts[EvidenceType.CPF] or counts[EvidenceType.SALARY]:
        return ClassificationLevel.CONFIDENTIAL
    if counts[EvidenceType.EMAIL] >= 5:
        return ClassificationLevel.CONFIDENTIAL
    if counts[EvidenceType.EMAIL]:
        return ClassificationLevel.INTERNAL
    return ClassificationLevel.PUBLIC


def _max_level(left: ClassificationLevel, right: ClassificationLevel) -> ClassificationLevel:
    return left if LEVEL_ORDER.index(left) >= LEVEL_ORDER.index(right) else right


def _mask_cpf(value: str) -> str:
    return f"{value[:3]}.***.***-{value[-2:]}"


def _mask_card(value: str) -> str:
    digits = re.sub(r"\D", "", value)
    return f"**** **** **** {digits[-4:]}"


def _mask_email(value: str) -> str:
    name, domain = value.split("@", 1)
    return f"{name[:2]}***@{domain}"


def _mask_secret(value: str) -> str:
    key = value.split("=", 1)[0].split(":", 1)[0].strip()
    return f"{key}=********"


def _mask_term(value: str) -> str:
    return value.lower()
```

- [ ] **Step 5: Run classifier tests**

Run:

```bash
cd backend
pytest tests/test_classifiers.py -q
```

Expected: PASS.

- [ ] **Step 6: Commit classifiers**

```bash
git add backend/app/dlp backend/tests/test_classifiers.py
git commit -m "feat: add content classification rules"
```

## Task 3: Policy Engine And DLP Decision Flow

**Files:**
- Create: `backend/app/dlp/policy.py`
- Create: `backend/app/dlp/engine.py`
- Create: `backend/tests/test_engine.py`

- [ ] **Step 1: Write engine tests**

Create `backend/tests/test_engine.py`:

```python
from app.dlp.engine import evaluate_event
from app.dlp.models import (
    Channel,
    ClassificationLevel,
    DestinationCategory,
    DlpAction,
    DlpEventInput,
    Severity,
)


def event(**overrides):
    data = {
        "channel": Channel.EMAIL,
        "user": "ana.silva",
        "department": "RH",
        "destination": "imprensa@example.com",
        "destination_category": DestinationCategory.APPROVED_EXTERNAL,
        "declared_classification": ClassificationLevel.PUBLIC,
        "subject": "Release",
        "content": "[PUBLICO] Release aprovado para imprensa",
    }
    data.update(overrides)
    return DlpEventInput(**data)


def test_allows_public_content_without_sensitive_evidence():
    decision = evaluate_event(event())

    assert decision.action == DlpAction.ALLOW
    assert decision.severity == Severity.LOW
    assert decision.effective_classification == ClassificationLevel.PUBLIC


def test_blocks_confidential_content_to_personal_destination():
    decision = evaluate_event(
        event(
            destination="usuario@gmail.com",
            destination_category=DestinationCategory.PERSONAL,
            declared_classification=ClassificationLevel.CONFIDENTIAL,
            content="[CONFIDENCIAL] Planilha de salarios do time",
        )
    )

    assert decision.action == DlpAction.BLOCK
    assert decision.severity == Severity.HIGH
    assert "Confidencial para destino pessoal" in {policy.name for policy in decision.policies}


def test_blocks_restricted_secret_to_public_service():
    decision = evaluate_event(
        event(
            channel=Channel.CHAT,
            destination="IA publica",
            destination_category=DestinationCategory.PUBLIC_SERVICE,
            content="token = abcdefgh123456789",
        )
    )

    assert decision.action == DlpAction.BLOCK
    assert decision.severity == Severity.CRITICAL
    assert decision.effective_classification == ClassificationLevel.RESTRICTED


def test_warns_on_inconsistent_public_label_with_sensitive_content():
    decision = evaluate_event(
        event(
            destination_category=DestinationCategory.APPROVED_EXTERNAL,
            declared_classification=ClassificationLevel.PUBLIC,
            content="[PUBLICO] CPF do cliente 123.456.789-09",
        )
    )

    assert decision.action in {DlpAction.WARN, DlpAction.QUARANTINE}
    assert any(policy.name == "Rotulo inconsistente" for policy in decision.policies)
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
cd backend
pytest tests/test_engine.py -q
```

Expected: FAIL because `policy.py` and `engine.py` do not exist yet.

- [ ] **Step 3: Implement fixed policies**

Create `backend/app/dlp/policy.py`:

```python
from app.dlp.models import (
    ClassificationLevel,
    DestinationCategory,
    DlpAction,
    EvidenceType,
    PolicyMatch,
    Severity,
)

ACTION_RANK = {
    DlpAction.ALLOW: 0,
    DlpAction.WARN: 1,
    DlpAction.QUARANTINE: 2,
    DlpAction.BLOCK: 3,
}
SEVERITY_RANK = {
    Severity.LOW: 0,
    Severity.MEDIUM: 1,
    Severity.HIGH: 2,
    Severity.CRITICAL: 3,
}


def evaluate_policies(
    declared: ClassificationLevel,
    detected: ClassificationLevel,
    effective: ClassificationLevel,
    destination_category: DestinationCategory,
    evidence_counts: dict[EvidenceType, int],
) -> list[PolicyMatch]:
    matches: list[PolicyMatch] = []

    has_sensitive = bool(evidence_counts)
    has_restricted = (
        evidence_counts.get(EvidenceType.SECRET, 0) > 0
        or evidence_counts.get(EvidenceType.CREDIT_CARD, 0) > 0
        or evidence_counts.get(EvidenceType.CPF, 0) >= 3
    )

    if effective == ClassificationLevel.PUBLIC and not has_sensitive:
        matches.append(PolicyMatch(name="Dados publicos", action=DlpAction.ALLOW, severity=Severity.LOW, reason="Conteudo publico sem evidencias sensiveis.", score_delta=5))

    if effective == ClassificationLevel.INTERNAL and destination_category != DestinationCategory.INTERNAL:
        matches.append(PolicyMatch(name="Conteudo interno para externo", action=DlpAction.WARN, severity=Severity.MEDIUM, reason="Informacao interna enviada para destino externo.", score_delta=30))

    if effective == ClassificationLevel.CONFIDENTIAL and destination_category == DestinationCategory.APPROVED_EXTERNAL:
        matches.append(PolicyMatch(name="Confidencial para destino aprovado", action=DlpAction.QUARANTINE, severity=Severity.MEDIUM, reason="Conteudo confidencial requer revisao antes do envio externo aprovado.", score_delta=45))

    if effective == ClassificationLevel.CONFIDENTIAL and destination_category in {DestinationCategory.PERSONAL, DestinationCategory.PUBLIC_SERVICE}:
        matches.append(PolicyMatch(name="Confidencial para destino pessoal", action=DlpAction.BLOCK, severity=Severity.HIGH, reason="Conteudo confidencial enviado para destino pessoal ou publico.", score_delta=70))

    if effective == ClassificationLevel.RESTRICTED or has_restricted:
        matches.append(PolicyMatch(name="Dados restritos", action=DlpAction.BLOCK, severity=Severity.CRITICAL, reason="Credencial, cartao, CPF em volume ou dado restrito detectado.", score_delta=90))

    if declared == ClassificationLevel.PUBLIC and detected not in {ClassificationLevel.PUBLIC, ClassificationLevel.INTERNAL}:
        action = DlpAction.BLOCK if detected == ClassificationLevel.RESTRICTED else DlpAction.WARN
        severity = Severity.CRITICAL if detected == ClassificationLevel.RESTRICTED else Severity.MEDIUM
        matches.append(PolicyMatch(name="Rotulo inconsistente", action=action, severity=severity, reason="Usuario declarou Publico, mas o DLP detectou conteudo sensivel.", score_delta=35))

    if not matches:
        matches.append(PolicyMatch(name="Monitoramento padrao", action=DlpAction.ALLOW, severity=Severity.LOW, reason="Nenhuma politica restritiva acionada.", score_delta=10))

    return matches


def final_action(matches: list[PolicyMatch]) -> DlpAction:
    return max((match.action for match in matches), key=lambda action: ACTION_RANK[action])


def final_severity(matches: list[PolicyMatch]) -> Severity:
    return max((match.severity for match in matches), key=lambda severity: SEVERITY_RANK[severity])
```

- [ ] **Step 4: Implement engine orchestration**

Create `backend/app/dlp/engine.py`:

```python
from app.dlp.classifiers import classify_content
from app.dlp.models import ClassificationLevel, DlpDecision, DlpEventInput
from app.dlp.policy import evaluate_policies, final_action, final_severity

LEVEL_ORDER = [
    ClassificationLevel.PUBLIC,
    ClassificationLevel.INTERNAL,
    ClassificationLevel.CONFIDENTIAL,
    ClassificationLevel.RESTRICTED,
]


def evaluate_event(event: DlpEventInput) -> DlpDecision:
    classification = classify_content(f"{event.subject}\n{event.content}")
    effective = _max_level(event.declared_classification, classification.detected_level)
    policies = evaluate_policies(
        declared=event.declared_classification,
        detected=classification.detected_level,
        effective=effective,
        destination_category=event.destination_category,
        evidence_counts=classification.evidence_count_by_type,
    )
    score = min(100, sum(policy.score_delta for policy in policies) + _context_score(event, effective))
    rationale = [
        f"Classificacao declarada: {event.declared_classification.value}.",
        f"Classificacao detectada: {classification.detected_level.value}.",
        f"Classificacao efetiva: {effective.value}.",
        *classification.rationale,
        *[policy.reason for policy in policies],
    ]
    return DlpDecision(
        action=final_action(policies),
        severity=final_severity(policies),
        score=score,
        effective_classification=effective,
        detected_classification=classification.detected_level,
        declared_classification=event.declared_classification,
        evidence=classification.evidence,
        policies=policies,
        rationale=rationale,
    )


def _max_level(left: ClassificationLevel, right: ClassificationLevel) -> ClassificationLevel:
    return left if LEVEL_ORDER.index(left) >= LEVEL_ORDER.index(right) else right


def _context_score(event: DlpEventInput, effective: ClassificationLevel) -> int:
    score = 0
    if event.destination_category.value != "interno":
        score += 10
    if event.channel.value == "chat":
        score += 5
    if effective == ClassificationLevel.RESTRICTED:
        score += 20
    return score
```

- [ ] **Step 5: Run engine tests**

Run:

```bash
cd backend
pytest tests/test_engine.py -q
```

Expected: PASS.

- [ ] **Step 6: Commit engine**

```bash
git add backend/app/dlp/policy.py backend/app/dlp/engine.py backend/tests/test_engine.py
git commit -m "feat: add dlp policy engine"
```

## Task 4: Samples And SQLite Persistence

**Files:**
- Create: `backend/app/dlp/samples.py`
- Create: `backend/app/storage/__init__.py`
- Create: `backend/app/storage/database.py`
- Create: `backend/app/storage/repository.py`
- Create: `backend/tests/test_repository.py`

- [ ] **Step 1: Write repository test**

Create `backend/tests/test_repository.py`:

```python
from app.dlp.engine import evaluate_event
from app.dlp.samples import SAMPLE_EVENTS
from app.storage.database import create_schema, open_database
from app.storage.repository import list_events, save_event


def test_save_and_list_event_roundtrip(tmp_path):
    db_path = tmp_path / "events.db"
    connection = open_database(db_path)
    create_schema(connection)
    event = SAMPLE_EVENTS[0]
    decision = evaluate_event(event)

    event_id = save_event(connection, event, decision)
    events = list_events(connection)

    assert event_id > 0
    assert len(events) == 1
    assert events[0]["channel"] == event.channel.value
    assert events[0]["action"] == decision.action.value
    assert events[0]["severity"] == decision.severity.value
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
cd backend
pytest tests/test_repository.py -q
```

Expected: FAIL because samples and storage modules do not exist yet.

- [ ] **Step 3: Implement sample events**

Create `backend/app/dlp/samples.py` with six events covering allow, warn, quarantine, block, chat and upload:

```python
from app.dlp.models import Channel, ClassificationLevel, DestinationCategory, DlpEventInput

SAMPLE_EVENTS = [
    DlpEventInput(channel=Channel.EMAIL, user="ana.silva", department="Comunicacao", destination="imprensa@example.com", destination_category=DestinationCategory.APPROVED_EXTERNAL, declared_classification=ClassificationLevel.PUBLIC, subject="Release publico", content="[PUBLICO] Release aprovado para imprensa sobre campanha institucional."),
    DlpEventInput(channel=Channel.EMAIL, user="bruno.ramos", department="RH", destination="bruno@gmail.com", destination_category=DestinationCategory.PERSONAL, declared_classification=ClassificationLevel.CONFIDENTIAL, subject="Planilha de salarios", content="[CONFIDENCIAL] Folha de pagamento com salarios e bonus do time."),
    DlpEventInput(channel=Channel.EMAIL, user="carla.nunes", department="Juridico", destination="contratos@fornecedor.example", destination_category=DestinationCategory.APPROVED_EXTERNAL, declared_classification=ClassificationLevel.CONFIDENTIAL, subject="Contrato fornecedor", content="[CONFIDENCIAL] Contrato comercial para revisao do fornecedor aprovado."),
    DlpEventInput(channel=Channel.UPLOAD, user="diego.lima", department="Vendas", destination="Drive pessoal", destination_category=DestinationCategory.PERSONAL, declared_classification=ClassificationLevel.INTERNAL, subject="base-clientes.csv", content="Clientes: 123.456.789-09, 987.654.321-00, 111.222.333-44"),
    DlpEventInput(channel=Channel.UPLOAD, user="elisa.moraes", department="TI", destination="Repositorio externo", destination_category=DestinationCategory.PUBLIC_SERVICE, declared_classification=ClassificationLevel.INTERNAL, subject="config.env", content="api_key = sk_live_1234567890abcdef"),
    DlpEventInput(channel=Channel.CHAT, user="felipe.costa", department="Atendimento", destination="IA publica", destination_category=DestinationCategory.PUBLIC_SERVICE, declared_classification=ClassificationLevel.PUBLIC, subject="Prompt de atendimento", content="Gere resposta para cliente joao@example.com com CPF 123.456.789-09."),
]
```

- [ ] **Step 4: Implement SQLite schema**

Create `backend/app/storage/__init__.py`:

```python
"""SQLite persistence for DLP events."""
```

Create `backend/app/storage/database.py`:

```python
from pathlib import Path
import sqlite3


def open_database(path: str | Path = "dlp_simulation.db") -> sqlite3.Connection:
    connection = sqlite3.connect(path)
    connection.row_factory = sqlite3.Row
    return connection


def create_schema(connection: sqlite3.Connection) -> None:
    connection.executescript(
        """
        CREATE TABLE IF NOT EXISTS events (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            channel TEXT NOT NULL,
            user TEXT NOT NULL,
            department TEXT NOT NULL,
            destination TEXT NOT NULL,
            destination_category TEXT NOT NULL,
            declared_classification TEXT NOT NULL,
            detected_classification TEXT NOT NULL,
            effective_classification TEXT NOT NULL,
            subject TEXT NOT NULL,
            content TEXT NOT NULL,
            action TEXT NOT NULL,
            severity TEXT NOT NULL,
            score INTEGER NOT NULL,
            rationale TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS evidence (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_id INTEGER NOT NULL,
            type TEXT NOT NULL,
            label TEXT NOT NULL,
            masked_value TEXT NOT NULL,
            count INTEGER NOT NULL,
            weight INTEGER NOT NULL,
            FOREIGN KEY(event_id) REFERENCES events(id)
        );
        CREATE TABLE IF NOT EXISTS policies (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            action TEXT NOT NULL,
            severity TEXT NOT NULL,
            reason TEXT NOT NULL,
            score_delta INTEGER NOT NULL,
            FOREIGN KEY(event_id) REFERENCES events(id)
        );
        """
    )
    connection.commit()
```

- [ ] **Step 5: Implement repository functions**

Create `backend/app/storage/repository.py`:

```python
import json
import sqlite3

from app.dlp.models import DlpDecision, DlpEventInput


def save_event(connection: sqlite3.Connection, event: DlpEventInput, decision: DlpDecision) -> int:
    cursor = connection.execute(
        """
        INSERT INTO events (
            channel, user, department, destination, destination_category,
            declared_classification, detected_classification, effective_classification,
            subject, content, action, severity, score, rationale
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            event.channel.value,
            event.user,
            event.department,
            event.destination,
            event.destination_category.value,
            event.declared_classification.value,
            decision.detected_classification.value,
            decision.effective_classification.value,
            event.subject,
            event.content,
            decision.action.value,
            decision.severity.value,
            decision.score,
            json.dumps(decision.rationale, ensure_ascii=True),
        ),
    )
    event_id = int(cursor.lastrowid)
    connection.executemany(
        "INSERT INTO evidence (event_id, type, label, masked_value, count, weight) VALUES (?, ?, ?, ?, ?, ?)",
        [(event_id, item.type.value, item.label, item.masked_value, item.count, item.weight) for item in decision.evidence],
    )
    connection.executemany(
        "INSERT INTO policies (event_id, name, action, severity, reason, score_delta) VALUES (?, ?, ?, ?, ?, ?)",
        [(event_id, item.name, item.action.value, item.severity.value, item.reason, item.score_delta) for item in decision.policies],
    )
    connection.commit()
    return event_id


def list_events(connection: sqlite3.Connection) -> list[dict]:
    rows = connection.execute("SELECT * FROM events ORDER BY id DESC").fetchall()
    return [dict(row) for row in rows]


def get_event_detail(connection: sqlite3.Connection, event_id: int) -> dict | None:
    event = connection.execute("SELECT * FROM events WHERE id = ?", (event_id,)).fetchone()
    if event is None:
        return None
    evidence = connection.execute("SELECT type, label, masked_value, count, weight FROM evidence WHERE event_id = ?", (event_id,)).fetchall()
    policies = connection.execute("SELECT name, action, severity, reason, score_delta FROM policies WHERE event_id = ?", (event_id,)).fetchall()
    result = dict(event)
    result["rationale"] = json.loads(result["rationale"])
    result["evidence"] = [dict(row) for row in evidence]
    result["policies"] = [dict(row) for row in policies]
    return result
```

- [ ] **Step 6: Run repository tests**

Run:

```bash
cd backend
pytest tests/test_repository.py -q
```

Expected: PASS.

- [ ] **Step 7: Commit persistence**

```bash
git add backend/app/dlp/samples.py backend/app/storage backend/tests/test_repository.py
git commit -m "feat: persist dlp events"
```

## Task 5: Simulation API

**Files:**
- Modify: `backend/app/api.py`
- Modify: `backend/app/main.py`
- Create: `backend/app/seed.py`
- Modify: `backend/tests/test_api.py`

- [ ] **Step 1: Extend API tests**

Replace `backend/tests/test_api.py` with:

```python
from fastapi.testclient import TestClient

from app.main import app


def test_health_endpoint_returns_ok():
    client = TestClient(app)

    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "lab-dlp-simulation"}


def test_samples_endpoint_returns_seeded_samples():
    client = TestClient(app)

    response = client.get("/api/samples")

    assert response.status_code == 200
    assert len(response.json()) >= 6


def test_simulate_endpoint_returns_decision_and_persists_event():
    client = TestClient(app)
    sample = client.get("/api/samples").json()[0]

    response = client.post("/api/simulate", json=sample)

    assert response.status_code == 200
    body = response.json()
    assert body["decision"]["action"] in {"allow", "warn", "quarantine", "block"}
    assert body["event_id"] > 0

    events = client.get("/api/events").json()
    assert any(event["id"] == body["event_id"] for event in events)
```

- [ ] **Step 2: Run API tests to verify they fail**

Run:

```bash
cd backend
pytest tests/test_api.py -q
```

Expected: FAIL because samples, simulate and events endpoints are missing.

- [ ] **Step 3: Add seeded application state**

Create `backend/app/seed.py`:

```python
from pathlib import Path

from app.storage.database import create_schema, open_database

DB_PATH = Path("dlp_simulation.db")


def app_database():
    connection = open_database(DB_PATH)
    create_schema(connection)
    return connection
```

- [ ] **Step 4: Implement API routes**

Replace `backend/app/api.py` with:

```python
from fastapi import APIRouter, HTTPException

from app.dlp.engine import evaluate_event
from app.dlp.models import DlpEventInput
from app.dlp.samples import SAMPLE_EVENTS
from app.seed import app_database
from app.storage.repository import get_event_detail, list_events, save_event

router = APIRouter(prefix="/api")


@router.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "lab-dlp-simulation"}


@router.get("/samples")
def samples() -> list[dict]:
    return [sample.model_dump(mode="json") for sample in SAMPLE_EVENTS]


@router.post("/simulate")
def simulate(event: DlpEventInput) -> dict:
    decision = evaluate_event(event)
    connection = app_database()
    event_id = save_event(connection, event, decision)
    return {"event_id": event_id, "decision": decision.model_dump(mode="json")}


@router.get("/events")
def events() -> list[dict]:
    connection = app_database()
    return list_events(connection)


@router.get("/events/{event_id}")
def event_detail(event_id: int) -> dict:
    connection = app_database()
    detail = get_event_detail(connection, event_id)
    if detail is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return detail
```

- [ ] **Step 5: Confirm `backend/app/main.py` still includes router**

Use:

```python
from fastapi import FastAPI

from app.api import router

app = FastAPI(title="Lab DLP Simulation")
app.include_router(router)
```

- [ ] **Step 6: Run API tests**

Run:

```bash
cd backend
pytest tests/test_api.py -q
```

Expected: PASS.

- [ ] **Step 7: Commit API**

```bash
git add backend/app/api.py backend/app/main.py backend/app/seed.py backend/tests/test_api.py
git commit -m "feat: expose dlp simulation api"
```

## Task 6: Frontend Scaffold And Typed API Client

**Files:**
- Create: `frontend/package.json`
- Create: `frontend/index.html`
- Create: `frontend/tsconfig.json`
- Create: `frontend/vite.config.ts`
- Create: `frontend/src/main.tsx`
- Create: `frontend/src/types.ts`
- Create: `frontend/src/api.ts`
- Create: `frontend/src/App.tsx`
- Create: `frontend/src/styles.css`

- [ ] **Step 1: Create frontend package**

Create `frontend/package.json`:

```json
{
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "build": "tsc && vite build",
    "preview": "vite preview --host 0.0.0.0"
  },
  "dependencies": {
    "@vitejs/plugin-react": "latest",
    "vite": "latest",
    "typescript": "latest",
    "react": "latest",
    "react-dom": "latest",
    "lucide-react": "latest"
  },
  "devDependencies": {}
}
```

- [ ] **Step 2: Create Vite files**

Create `frontend/index.html`:

```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Lab DLP Simulation</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Create `frontend/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["DOM", "DOM.Iterable", "ES2020"],
    "allowJs": false,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "module": "ESNext",
    "moduleResolution": "Node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx"
  },
  "include": ["src"],
  "references": []
}
```

Create `frontend/vite.config.ts`:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://127.0.0.1:8000"
    }
  }
});
```

- [ ] **Step 3: Add types and API client**

Create `frontend/src/types.ts` with string literal unions matching backend values:

```ts
export type Channel = "email" | "upload" | "chat";
export type ClassificationLevel = "publico" | "interno" | "confidencial" | "restrito";
export type DestinationCategory = "interno" | "externo_aprovado" | "pessoal" | "servico_publico";
export type DlpAction = "allow" | "warn" | "quarantine" | "block";
export type Severity = "low" | "medium" | "high" | "critical";

export interface DlpEventInput {
  channel: Channel;
  user: string;
  department: string;
  destination: string;
  destination_category: DestinationCategory;
  declared_classification: ClassificationLevel;
  subject: string;
  content: string;
}

export interface Evidence {
  type: string;
  label: string;
  masked_value: string;
  count: number;
  weight: number;
}

export interface PolicyMatch {
  name: string;
  action: DlpAction;
  severity: Severity;
  reason: string;
  score_delta: number;
}

export interface DlpDecision {
  action: DlpAction;
  severity: Severity;
  score: number;
  effective_classification: ClassificationLevel;
  detected_classification: ClassificationLevel;
  declared_classification: ClassificationLevel;
  evidence: Evidence[];
  policies: PolicyMatch[];
  rationale: string[];
}

export interface EventSummary {
  id: number;
  created_at: string;
  channel: Channel;
  user: string;
  department: string;
  destination: string;
  destination_category: DestinationCategory;
  declared_classification: ClassificationLevel;
  detected_classification: ClassificationLevel;
  effective_classification: ClassificationLevel;
  subject: string;
  content: string;
  action: DlpAction;
  severity: Severity;
  score: number;
  rationale: string;
}

export interface EventDetail extends Omit<EventSummary, "rationale"> {
  rationale: string[];
  evidence: Evidence[];
  policies: PolicyMatch[];
}
```

Create `frontend/src/api.ts`:

```ts
import type { DlpDecision, DlpEventInput, EventDetail, EventSummary } from "./types";

export async function getSamples(): Promise<DlpEventInput[]> {
  const response = await fetch("/api/samples");
  return requireOk(response);
}

export async function simulate(event: DlpEventInput): Promise<{ event_id: number; decision: DlpDecision }> {
  const response = await fetch("/api/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event)
  });
  return requireOk(response);
}

export async function getEvents(): Promise<EventSummary[]> {
  const response = await fetch("/api/events");
  return requireOk(response);
}

export async function getEventDetail(id: number): Promise<EventDetail> {
  const response = await fetch(`/api/events/${id}`);
  return requireOk(response);
}

async function requireOk<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
}
```

- [ ] **Step 4: Add minimal React app**

Create `frontend/src/main.tsx`:

```tsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

Create `frontend/src/App.tsx`:

```tsx
export default function App() {
  return (
    <main className="app-shell">
      <header>
        <p>Lab DLP Simulation</p>
        <h1>Simulador operacional de Data Loss Prevention</h1>
      </header>
      <section className="panel">
        <h2>Primeira entrega</h2>
        <p>Email, upload web e chat/IA com classificacao, politicas fixas, score, alertas e auditoria.</p>
      </section>
    </main>
  );
}
```

Create `frontend/src/styles.css`:

```css
:root {
  color: #1f2933;
  background: #f5f7fa;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

body {
  margin: 0;
}

.app-shell {
  max-width: 1180px;
  margin: 0 auto;
  padding: 32px;
}

header {
  margin-bottom: 24px;
}

header p {
  color: #52616b;
  font-size: 14px;
  font-weight: 700;
  margin: 0 0 8px;
  text-transform: uppercase;
}

h1 {
  font-size: 34px;
  line-height: 1.15;
  margin: 0;
}

.panel {
  background: white;
  border: 1px solid #d9e2ec;
  border-radius: 8px;
  padding: 20px;
}
```

- [ ] **Step 5: Build frontend**

Run:

```bash
cd frontend
npm install
npm run build
```

Expected: `dist/` is created and build exits successfully.

- [ ] **Step 6: Commit frontend scaffold**

```bash
git add frontend/package.json frontend/package-lock.json frontend/index.html frontend/tsconfig.json frontend/vite.config.ts frontend/src
git commit -m "feat: scaffold frontend app"
```

## Task 7: Operational UI

**Files:**
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/styles.css`
- Create: `frontend/src/components/Dashboard.tsx`
- Create: `frontend/src/components/Simulator.tsx`
- Create: `frontend/src/components/EventsTable.tsx`
- Create: `frontend/src/components/EventDetail.tsx`
- Create: `frontend/src/components/PolicySummary.tsx`

- [ ] **Step 1: Implement UI state in `App.tsx`**

Replace `frontend/src/App.tsx` with an app that loads samples and events, supports selected event detail, and passes callbacks to components:

```tsx
import { useEffect, useState } from "react";
import { getEventDetail, getEvents, getSamples, simulate } from "./api";
import Dashboard from "./components/Dashboard";
import EventDetail from "./components/EventDetail";
import EventsTable from "./components/EventsTable";
import PolicySummary from "./components/PolicySummary";
import Simulator from "./components/Simulator";
import type { DlpDecision, DlpEventInput, EventDetail as EventDetailType, EventSummary } from "./types";

export default function App() {
  const [samples, setSamples] = useState<DlpEventInput[]>([]);
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [selected, setSelected] = useState<EventDetailType | null>(null);
  const [lastDecision, setLastDecision] = useState<DlpDecision | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function refreshEvents() {
    setEvents(await getEvents());
  }

  useEffect(() => {
    getSamples().then(setSamples).catch(() => setError("Nao foi possivel carregar as amostras."));
    refreshEvents().catch(() => setError("Nao foi possivel carregar os eventos."));
  }, []);

  async function handleSimulate(event: DlpEventInput) {
    setError(null);
    const result = await simulate(event);
    setLastDecision(result.decision);
    await refreshEvents();
    setSelected(await getEventDetail(result.event_id));
  }

  async function handleSelect(id: number) {
    setSelected(await getEventDetail(id));
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p>Lab DLP Simulation</p>
          <h1>Simulador operacional de Data Loss Prevention</h1>
        </div>
      </header>
      {error && <div className="alert">{error}</div>}
      <Dashboard events={events} />
      <section className="workspace">
        <Simulator samples={samples} onSimulate={handleSimulate} lastDecision={lastDecision} />
        <PolicySummary />
      </section>
      <section className="workspace">
        <EventsTable events={events} onSelect={handleSelect} />
        <EventDetail event={selected} />
      </section>
    </main>
  );
}
```

- [ ] **Step 2: Implement dashboard**

Create `frontend/src/components/Dashboard.tsx`:

```tsx
import type { EventSummary } from "../types";

interface Props {
  events: EventSummary[];
}

export default function Dashboard({ events }: Props) {
  const blocked = events.filter((event) => event.action === "block").length;
  const quarantined = events.filter((event) => event.action === "quarantine").length;
  const critical = events.filter((event) => event.severity === "critical").length;
  const avgScore = events.length === 0 ? 0 : Math.round(events.reduce((sum, event) => sum + event.score, 0) / events.length);

  return (
    <section className="metrics">
      <Metric label="Eventos" value={events.length.toString()} />
      <Metric label="Bloqueios" value={blocked.toString()} tone="danger" />
      <Metric label="Quarentena" value={quarantined.toString()} tone="warning" />
      <Metric label="Criticos" value={critical.toString()} tone="critical" />
      <Metric label="Score medio" value={avgScore.toString()} />
    </section>
  );
}

function Metric({ label, value, tone = "neutral" }: { label: string; value: string; tone?: string }) {
  return (
    <article className={`metric metric-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
```

- [ ] **Step 3: Implement simulator**

Create `frontend/src/components/Simulator.tsx`:

```tsx
import { useEffect, useMemo, useState } from "react";
import type { Channel, ClassificationLevel, DestinationCategory, DlpDecision, DlpEventInput } from "../types";

interface Props {
  samples: DlpEventInput[];
  lastDecision: DlpDecision | null;
  onSimulate: (event: DlpEventInput) => Promise<void>;
}

const emptyEvent: DlpEventInput = {
  channel: "email",
  user: "",
  department: "",
  destination: "",
  destination_category: "interno",
  declared_classification: "publico",
  subject: "",
  content: ""
};

export default function Simulator({ samples, lastDecision, onSimulate }: Props) {
  const [channel, setChannel] = useState<Channel>("email");
  const channelSamples = useMemo(() => samples.filter((sample) => sample.channel === channel), [samples, channel]);
  const [form, setForm] = useState<DlpEventInput>(emptyEvent);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setForm(channelSamples[0] ?? { ...emptyEvent, channel });
  }, [channel, channelSamples]);

  async function submit() {
    setBusy(true);
    try {
      await onSimulate(form);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel simulator">
      <div className="panel-heading">
        <h2>Simulador</h2>
        <div className="tabs">
          {(["email", "upload", "chat"] as Channel[]).map((item) => (
            <button className={channel === item ? "active" : ""} key={item} onClick={() => setChannel(item)} type="button">
              {item.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <label>
        Amostra
        <select
          value={channelSamples.findIndex((sample) => sample.subject === form.subject)}
          onChange={(event) => setForm(channelSamples[Number(event.target.value)] ?? { ...emptyEvent, channel })}
        >
          {channelSamples.map((sample, index) => (
            <option key={`${sample.channel}-${sample.subject}`} value={index}>
              {sample.subject}
            </option>
          ))}
        </select>
      </label>

      <div className="form-grid">
        <TextField label="Usuario" value={form.user} onChange={(value) => setForm({ ...form, user: value })} />
        <TextField label="Departamento" value={form.department} onChange={(value) => setForm({ ...form, department: value })} />
        <TextField label="Destino" value={form.destination} onChange={(value) => setForm({ ...form, destination: value })} />
        <label>
          Categoria
          <select value={form.destination_category} onChange={(event) => setForm({ ...form, destination_category: event.target.value as DestinationCategory })}>
            <option value="interno">Interno</option>
            <option value="externo_aprovado">Externo aprovado</option>
            <option value="pessoal">Pessoal</option>
            <option value="servico_publico">Servico publico</option>
          </select>
        </label>
        <label>
          Classificacao declarada
          <select value={form.declared_classification} onChange={(event) => setForm({ ...form, declared_classification: event.target.value as ClassificationLevel })}>
            <option value="publico">Publico</option>
            <option value="interno">Interno</option>
            <option value="confidencial">Confidencial</option>
            <option value="restrito">Restrito</option>
          </select>
        </label>
        <TextField label="Assunto ou arquivo" value={form.subject} onChange={(value) => setForm({ ...form, subject: value })} />
      </div>

      <label>
        Conteudo inspecionado
        <textarea value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} />
      </label>

      <button className="primary-action" disabled={busy || !form.user || !form.destination || !form.content} onClick={submit} type="button">
        {busy ? "Simulando..." : "Executar simulacao"}
      </button>

      {lastDecision && (
        <div className="decision">
          <span className={`badge action-${lastDecision.action}`}>{lastDecision.action}</span>
          <span className={`badge severity-${lastDecision.severity}`}>{lastDecision.severity}</span>
          <strong>Score {lastDecision.score}</strong>
          <span>Classificacao efetiva: {lastDecision.effective_classification}</span>
        </div>
      )}
    </section>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label>
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
```

- [ ] **Step 4: Implement event list**

Create `frontend/src/components/EventsTable.tsx`:

```tsx
import type { EventSummary } from "../types";

interface Props {
  events: EventSummary[];
  onSelect: (id: number) => void;
}

export default function EventsTable({ events, onSelect }: Props) {
  return (
    <section className="panel table-panel">
      <h2>Eventos</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Canal</th>
              <th>Usuario</th>
              <th>Destino</th>
              <th>Classificacao</th>
              <th>Acao</th>
              <th>Severidade</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} onClick={() => onSelect(event.id)}>
                <td>{event.id}</td>
                <td>{event.channel}</td>
                <td>{event.user}</td>
                <td>{event.destination}</td>
                <td>{event.effective_classification}</td>
                <td><span className={`badge action-${event.action}`}>{event.action}</span></td>
                <td><span className={`badge severity-${event.severity}`}>{event.severity}</span></td>
                <td>{event.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
```

- [ ] **Step 5: Implement event detail**

Create `frontend/src/components/EventDetail.tsx`:

```tsx
import type { EventDetail as EventDetailType } from "../types";

interface Props {
  event: EventDetailType | null;
}

export default function EventDetail({ event }: Props) {
  if (!event) {
    return (
      <section className="panel detail-panel">
        <h2>Detalhe</h2>
        <p className="muted">Selecione ou execute um evento para ver evidencias, politicas e justificativa.</p>
      </section>
    );
  }

  return (
    <section className="panel detail-panel">
      <h2>Evento #{event.id}</h2>
      <div className="detail-grid">
        <span>Canal: {event.channel}</span>
        <span>Usuario: {event.user}</span>
        <span>Destino: {event.destination}</span>
        <span>Score: {event.score}</span>
      </div>

      <h3>Evidencias</h3>
      <ul className="stack-list">
        {event.evidence.length === 0 && <li>Nenhuma evidencia sensivel detectada.</li>}
        {event.evidence.map((item) => (
          <li key={`${item.type}-${item.masked_value}`}>
            <strong>{item.label}</strong> {item.masked_value} <span className="muted">x{item.count}</span>
          </li>
        ))}
      </ul>

      <h3>Politicas acionadas</h3>
      <ul className="stack-list">
        {event.policies.map((policy) => (
          <li key={policy.name}>
            <strong>{policy.name}</strong> <span className={`badge action-${policy.action}`}>{policy.action}</span>
            <p>{policy.reason}</p>
          </li>
        ))}
      </ul>

      <h3>Justificativa</h3>
      <ul className="stack-list">
        {event.rationale.map((line) => <li key={line}>{line}</li>)}
      </ul>

      <h3>Payload</h3>
      <pre>{event.content}</pre>
    </section>
  );
}
```

- [ ] **Step 6: Implement policy summary**

Create `frontend/src/components/PolicySummary.tsx`:

```tsx
const policies = [
  ["Dados publicos", "Publico sem evidencia sensivel", "allow"],
  ["Conteudo interno para externo", "Interno enviado para destino externo", "warn"],
  ["Confidencial para destino aprovado", "Confidencial para fornecedor aprovado", "quarantine"],
  ["Confidencial para destino pessoal", "Confidencial para email pessoal, drive pessoal ou IA publica", "block"],
  ["Dados restritos", "CPF em volume, cartao, credencial, token, chave ou dump", "block"],
  ["Rotulo inconsistente", "Declarado Publico com conteudo sensivel detectado", "warn/block"]
];

export default function PolicySummary() {
  return (
    <section className="panel">
      <h2>Politicas fixas</h2>
      <ul className="policy-list">
        {policies.map(([name, condition, action]) => (
          <li key={name}>
            <strong>{name}</strong>
            <span>{condition}</span>
            <code>{action}</code>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 7: Update CSS**

Replace `frontend/src/styles.css` with:

```css
:root {
  color: #1f2933;
  background: #f5f7fa;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

body {
  margin: 0;
}

button,
input,
select,
textarea {
  font: inherit;
}

.app-shell {
  max-width: 1280px;
  margin: 0 auto;
  padding: 28px;
}

.topbar {
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
}

.topbar p {
  color: #52616b;
  font-size: 13px;
  font-weight: 700;
  margin: 0 0 8px;
  text-transform: uppercase;
}

h1,
h2,
h3 {
  margin: 0;
}

h1 {
  font-size: 32px;
  line-height: 1.15;
}

h2 {
  font-size: 18px;
}

h3 {
  font-size: 14px;
  margin-top: 18px;
}

.metrics {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  margin-bottom: 16px;
}

.metric,
.panel {
  background: white;
  border: 1px solid #d9e2ec;
  border-radius: 8px;
}

.metric {
  padding: 16px;
}

.metric span,
.muted {
  color: #627d98;
}

.metric strong {
  display: block;
  font-size: 28px;
  margin-top: 6px;
}

.metric-danger {
  border-color: #f0b4aa;
}

.metric-warning {
  border-color: #f5d18c;
}

.metric-critical {
  border-color: #d4a5ff;
}

.workspace {
  display: grid;
  gap: 16px;
  grid-template-columns: minmax(0, 1.25fr) minmax(320px, 0.75fr);
  margin-bottom: 16px;
}

.panel {
  padding: 18px;
}

.panel-heading {
  align-items: center;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  margin-bottom: 14px;
}

.tabs {
  display: flex;
  gap: 8px;
}

.tabs button,
.primary-action {
  border: 1px solid #bcccdc;
  border-radius: 8px;
  cursor: pointer;
  min-height: 40px;
  padding: 0 14px;
}

.tabs button.active,
.primary-action {
  background: #0f609b;
  border-color: #0f609b;
  color: white;
}

label {
  color: #334e68;
  display: grid;
  font-size: 13px;
  font-weight: 700;
  gap: 6px;
}

input,
select,
textarea {
  border: 1px solid #bcccdc;
  border-radius: 8px;
  color: #243b53;
  min-height: 38px;
  padding: 8px 10px;
}

textarea {
  min-height: 132px;
  resize: vertical;
}

.form-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin: 14px 0;
}

.decision {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 14px;
}

.badge {
  border-radius: 999px;
  display: inline-flex;
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
  padding: 7px 9px;
  text-transform: uppercase;
}

.action-allow {
  background: #d9f7e8;
  color: #0c6b3d;
}

.action-warn,
.action-quarantine {
  background: #fff1c2;
  color: #8a5a00;
}

.action-block {
  background: #ffd6d1;
  color: #9f1f12;
}

.severity-low {
  background: #e6f6ff;
  color: #0b609b;
}

.severity-medium {
  background: #fff1c2;
  color: #8a5a00;
}

.severity-high {
  background: #ffe3c2;
  color: #9a4d00;
}

.severity-critical {
  background: #eadcff;
  color: #5f2db3;
}

.table-wrap {
  overflow-x: auto;
}

table {
  border-collapse: collapse;
  min-width: 760px;
  width: 100%;
}

th,
td {
  border-bottom: 1px solid #e4e7eb;
  padding: 10px;
  text-align: left;
}

tbody tr {
  cursor: pointer;
}

tbody tr:hover {
  background: #f0f4f8;
}

.detail-grid {
  display: grid;
  gap: 8px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: 12px;
}

.stack-list,
.policy-list {
  display: grid;
  gap: 8px;
  list-style: none;
  margin: 10px 0 0;
  padding: 0;
}

.stack-list li,
.policy-list li {
  background: #f8fafc;
  border: 1px solid #e4e7eb;
  border-radius: 8px;
  padding: 10px;
}

.policy-list li {
  display: grid;
  gap: 6px;
}

pre {
  background: #102a43;
  border-radius: 8px;
  color: #f0f4f8;
  overflow-x: auto;
  padding: 12px;
  white-space: pre-wrap;
}

.alert {
  background: #ffd6d1;
  border: 1px solid #f0b4aa;
  border-radius: 8px;
  color: #9f1f12;
  margin-bottom: 16px;
  padding: 12px;
}

@media (max-width: 900px) {
  .metrics,
  .workspace,
  .form-grid,
  .detail-grid {
    grid-template-columns: 1fr;
  }

  .app-shell {
    padding: 16px;
  }
}
```

- [ ] **Step 8: Build frontend**

Run:

```bash
cd frontend
npm run build
```

Expected: PASS.

- [ ] **Step 9: Commit operational UI**

```bash
git add frontend/src
git commit -m "feat: add dlp simulation ui"
```

## Task 8: Serve Frontend From FastAPI

**Files:**
- Modify: `backend/app/main.py`
- Modify: `backend/tests/test_api.py`

- [ ] **Step 1: Add static serving behavior**

Modify `backend/app/main.py` so it mounts `frontend/dist` when present and keeps API routes available:

```python
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from app.api import router

app = FastAPI(title="Lab DLP Simulation")
app.include_router(router)

STATIC_DIR = Path(__file__).resolve().parents[2] / "frontend" / "dist"
if STATIC_DIR.exists():
    app.mount("/", StaticFiles(directory=STATIC_DIR, html=True), name="static")
```

- [ ] **Step 2: Run backend tests**

Run:

```bash
cd backend
pytest -q
```

Expected: PASS.

- [ ] **Step 3: Commit static serving**

```bash
git add backend/app/main.py backend/tests/test_api.py
git commit -m "feat: serve frontend from fastapi"
```

## Task 9: Docker And Project Documentation

**Files:**
- Create: `Dockerfile`
- Create: `.dockerignore`
- Create: `README.md`

- [ ] **Step 1: Create Docker ignore**

Create `.dockerignore`:

```text
.git
backend/.pytest_cache
backend/__pycache__
backend/**/*.pyc
frontend/node_modules
frontend/dist
dlp_simulation.db
```

- [ ] **Step 2: Create single-container Dockerfile**

Create `Dockerfile`:

```dockerfile
FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

FROM python:3.12-slim
WORKDIR /app
COPY backend/requirements.txt /app/backend/requirements.txt
RUN pip install --no-cache-dir -r /app/backend/requirements.txt
COPY backend/ /app/backend/
COPY --from=frontend-build /app/frontend/dist /app/frontend/dist
WORKDIR /app/backend
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

- [ ] **Step 3: Create README**

Create `README.md` with:

```markdown
# Lab DLP Simulation

Laboratorio didatico para simular um DLP classico com classificacao de informacao, inspecao de conteudo, politicas fixas, score de risco, alertas e auditoria.

## Executar com Docker

```bash
docker build -t lab-dlp-simulation .
docker run --rm -p 8000:8000 lab-dlp-simulation
```

Acesse `http://localhost:8000`.

## Canais simulados

- Email
- Upload web
- Chat/IA

## Classificacao

- Publico
- Interno
- Confidencial
- Restrito

## Desenvolvimento local

Backend:

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Testes

```bash
cd backend
pytest -q
```
```

- [ ] **Step 4: Run backend tests**

Run:

```bash
cd backend
pytest -q
```

Expected: PASS.

- [ ] **Step 5: Build Docker image**

Run:

```bash
docker build -t lab-dlp-simulation .
```

Expected: image builds successfully.

- [ ] **Step 6: Smoke test container**

Run:

```bash
docker run --rm -p 8000:8000 lab-dlp-simulation
```

In another terminal:

```bash
curl http://localhost:8000/api/health
```

Expected:

```json
{"status":"ok","service":"lab-dlp-simulation"}
```

- [ ] **Step 7: Commit Docker and docs**

```bash
git add Dockerfile .dockerignore README.md
git commit -m "docs: add docker usage"
```

## Task 10: Final Verification And Polish

**Files:**
- Modify only files that fail verification or have obvious UX defects discovered in this task.

- [ ] **Step 1: Run full backend test suite**

Run:

```bash
cd backend
pytest -q
```

Expected: all tests pass.

- [ ] **Step 2: Run frontend build**

Run:

```bash
cd frontend
npm run build
```

Expected: build exits successfully.

- [ ] **Step 3: Run Docker build**

Run:

```bash
docker build -t lab-dlp-simulation .
```

Expected: image builds successfully.

- [ ] **Step 4: Start app for manual verification**

Run:

```bash
docker run --rm -p 8000:8000 lab-dlp-simulation
```

Open `http://localhost:8000` and verify:

- Dashboard renders.
- Samples load.
- Email sample can be simulated.
- Upload sample can be simulated.
- Chat/IA sample can be simulated.
- Event list updates after simulation.
- Event detail shows masked evidence, policies, rationale and payload preview.

- [ ] **Step 5: Commit verification fixes**

If files changed during final polish:

```bash
git add .
git commit -m "fix: polish dlp simulation verification"
```

If no files changed, record no commit for this task.

## Spec Coverage Review

- Operational DLP simulation: Tasks 2, 3, 5 and 7.
- Single Docker container: Task 9.
- FastAPI backend: Tasks 1, 5 and 8.
- SQLite persistence: Task 4.
- React/Vite frontend: Tasks 6 and 7.
- Email, upload and chat/IA channels: Tasks 4, 5 and 7.
- Publico, Interno, Confidencial and Restrito classification: Tasks 2, 3 and 7.
- Transparent evidence and masked values: Tasks 2, 4 and 7.
- Fixed policies, read-only in UI: Tasks 3 and 7.
- Score and severity: Tasks 3, 5 and 7.
- Dashboard, simulator, events and details: Task 7.
- Reproducible samples: Task 4.
- Tests and Docker verification: Tasks 1 through 10.
