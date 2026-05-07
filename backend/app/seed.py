from pathlib import Path

from app.storage.database import create_schema, open_database

DB_PATH = Path("dlp_simulation.db")


def app_database():
    connection = open_database(DB_PATH)
    create_schema(connection)
    return connection
