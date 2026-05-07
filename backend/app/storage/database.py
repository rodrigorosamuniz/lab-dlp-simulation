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
