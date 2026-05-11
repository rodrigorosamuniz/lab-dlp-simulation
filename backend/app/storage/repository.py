import json
import sqlite3

from app.dlp.models import DlpDecision, DlpEventInput


def save_event(connection: sqlite3.Connection, event: DlpEventInput, decision: DlpDecision) -> int:
    try:
        with connection:
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
            if decision.action.value != "allow":
                connection.execute(
                    """
                    INSERT INTO alerts (event_id, severity, action, message)
                    VALUES (?, ?, ?, ?)
                    """,
                    (
                        event_id,
                        decision.severity.value,
                        decision.action.value,
                        "; ".join(policy.name for policy in decision.policies),
                    ),
                )
    except Exception:
        connection.rollback()
        raise
    return event_id


def list_events(connection: sqlite3.Connection) -> list[dict]:
    rows = connection.execute("SELECT * FROM events ORDER BY id DESC").fetchall()
    return [dict(row) for row in rows]


def reset_events(connection: sqlite3.Connection) -> int:
    row = connection.execute("SELECT COUNT(*) AS total FROM events").fetchone()
    deleted_events = int(row["total"])
    with connection:
        connection.execute("DELETE FROM alerts")
        connection.execute("DELETE FROM evidence")
        connection.execute("DELETE FROM policies")
        connection.execute("DELETE FROM events")
        connection.execute(
            "DELETE FROM sqlite_sequence WHERE name IN ('alerts', 'evidence', 'policies', 'events')"
        )
    return deleted_events


def seed_samples(connection: sqlite3.Connection, samples: list[DlpEventInput]) -> None:
    with connection:
        connection.executemany(
            """
            INSERT OR IGNORE INTO samples (
                channel, user, department, destination, destination_category,
                declared_classification, subject, content
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            [
                (
                    sample.channel.value,
                    sample.user,
                    sample.department,
                    sample.destination,
                    sample.destination_category.value,
                    sample.declared_classification.value,
                    sample.subject,
                    sample.content,
                )
                for sample in samples
            ],
        )


def list_samples(connection: sqlite3.Connection) -> list[dict]:
    rows = connection.execute(
        """
        SELECT channel, user, department, destination, destination_category,
               declared_classification, subject, content
        FROM samples
        ORDER BY id
        """
    ).fetchall()
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
    alerts = connection.execute(
        "SELECT severity, action, message, created_at FROM alerts WHERE event_id = ?",
        (event_id,),
    ).fetchall()

    result = dict(event)
    result["rationale"] = json.loads(result["rationale"])
    result["evidence"] = [dict(row) for row in evidence]
    result["policies"] = [dict(row) for row in policies]
    result["alerts"] = [dict(row) for row in alerts]
    return result
