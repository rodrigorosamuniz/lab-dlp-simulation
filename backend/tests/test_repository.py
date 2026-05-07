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
