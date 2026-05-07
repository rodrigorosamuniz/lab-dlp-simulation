import sqlite3

import pytest

from app.dlp.engine import evaluate_event
from app.dlp.samples import SAMPLE_EVENTS
from app.storage.database import create_schema, open_database
from app.storage.repository import get_event_detail, list_events, list_samples, save_event, seed_samples


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


def test_event_detail_includes_evidence_policies_and_rationale(tmp_path):
    db_path = tmp_path / "events.db"
    connection = open_database(db_path)
    create_schema(connection)
    event = SAMPLE_EVENTS[4]
    decision = evaluate_event(event)

    event_id = save_event(connection, event, decision)
    detail = get_event_detail(connection, event_id)

    assert detail is not None
    assert detail["id"] == event_id
    assert detail["rationale"] == decision.rationale
    assert detail["evidence"]
    assert detail["policies"]
    assert detail["alerts"]


def test_seed_and_list_samples_roundtrip(tmp_path):
    db_path = tmp_path / "events.db"
    connection = open_database(db_path)
    create_schema(connection)

    seed_samples(connection, SAMPLE_EVENTS)
    seed_samples(connection, SAMPLE_EVENTS)
    samples = list_samples(connection)

    assert len(samples) == len(SAMPLE_EVENTS)
    assert {sample["channel"] for sample in samples} == {"email", "upload", "chat"}


def test_list_events_orders_newest_first(tmp_path):
    db_path = tmp_path / "events.db"
    connection = open_database(db_path)
    create_schema(connection)

    first_id = save_event(connection, SAMPLE_EVENTS[0], evaluate_event(SAMPLE_EVENTS[0]))
    second_id = save_event(connection, SAMPLE_EVENTS[1], evaluate_event(SAMPLE_EVENTS[1]))

    events = list_events(connection)

    assert [event["id"] for event in events] == [second_id, first_id]


def test_foreign_keys_reject_orphan_evidence(tmp_path):
    db_path = tmp_path / "events.db"
    connection = open_database(db_path)
    create_schema(connection)

    with pytest.raises(sqlite3.IntegrityError):
        connection.execute(
            """
            INSERT INTO evidence (event_id, type, label, masked_value, count, weight)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (999, "cpf", "CPF", "123.***.***-09", 1, 35),
        )


def test_save_event_rolls_back_when_child_insert_fails(tmp_path):
    db_path = tmp_path / "events.db"
    connection = open_database(db_path)
    create_schema(connection)
    event = SAMPLE_EVENTS[3]
    decision = evaluate_event(event)
    broken_evidence = decision.evidence[0].model_copy(update={"weight": None})
    broken_decision = decision.model_copy(update={"evidence": [broken_evidence]})

    with pytest.raises(sqlite3.IntegrityError):
        save_event(connection, event, broken_decision)

    assert list_events(connection) == []
