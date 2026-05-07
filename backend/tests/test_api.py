from fastapi.testclient import TestClient
import pytest

from app.api import database_connection
from app.dlp.samples import SAMPLE_EVENTS
from app.main import app
from app.storage.database import create_schema, open_database
from app.storage.repository import seed_samples


@pytest.fixture
def client(tmp_path):
    db_path = tmp_path / "api-test.db"

    def override_database_connection():
        connection = open_database(db_path)
        create_schema(connection)
        seed_samples(connection, SAMPLE_EVENTS)
        try:
            yield connection
        finally:
            connection.close()

    app.dependency_overrides[database_connection] = override_database_connection
    try:
        yield TestClient(app)
    finally:
        app.dependency_overrides.clear()


def test_health_endpoint_returns_ok():
    client = TestClient(app)

    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "lab-dlp-simulation"}


def test_samples_endpoint_returns_seeded_samples(client):
    response = client.get("/api/samples")

    assert response.status_code == 200
    samples = response.json()
    assert len(samples) >= 9
    assert {sample["channel"] for sample in samples} == {"email", "upload", "chat"}


def test_simulate_endpoint_returns_decision_and_persists_event(client):
    sample = client.get("/api/samples").json()[0]

    response = client.post("/api/simulate", json=sample)

    assert response.status_code == 200
    body = response.json()
    assert body["decision"]["action"] in {"allow", "warn", "quarantine", "block"}
    assert body["event_id"] > 0

    events = client.get("/api/events")

    assert events.status_code == 200
    assert body["event_id"] in [event["id"] for event in events.json()]


def test_simulate_rejects_blank_required_fields(client):
    response = client.post(
        "/api/simulate",
        json={
            "channel": "email",
            "user": " ",
            "department": "RH",
            "destination": "",
            "destination_category": "pessoal",
            "declared_classification": "publico",
            "subject": " ",
            "content": "",
        },
    )

    assert response.status_code == 422
    assert client.get("/api/events").json() == []
