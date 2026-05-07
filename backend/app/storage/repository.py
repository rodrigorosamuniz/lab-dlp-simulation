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
        """
        INSERT INTO evidence (event_id, type, label, masked_value, count, weight)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        [
            (event_id, item.type.value, item.label, item.masked_value, item.count, item.weight)
            for item in decision.evidence
        ],
    )
    connection.executemany(
        """
        INSERT INTO policies (event_id, name, action, severity, reason, score_delta)
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        [
            (event_id, item.name, item.action.value, item.severity.value, item.reason, item.score_delta)
            for item in decision.policies
        ],
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

    evidence = connection.execute(
        "SELECT type, label, masked_value, count, weight FROM evidence WHERE event_id = ?",
        (event_id,),
    ).fetchall()
    policies = connection.execute(
        "SELECT name, action, severity, reason, score_delta FROM policies WHERE event_id = ?",
        (event_id,),
    ).fetchall()

    result = dict(event)
    result["rationale"] = json.loads(result["rationale"])
    result["evidence"] = [dict(row) for row in evidence]
    result["policies"] = [dict(row) for row in policies]
    return result
