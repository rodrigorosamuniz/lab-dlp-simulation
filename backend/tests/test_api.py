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

    events = client.get("/api/events")

    assert events.status_code == 200
    assert body["event_id"] in [event["id"] for event in events.json()]
