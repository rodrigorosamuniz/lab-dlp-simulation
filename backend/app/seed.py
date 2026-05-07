from pathlib import Path

from app.dlp.samples import SAMPLE_EVENTS
from app.storage.database import create_schema, open_database
from app.storage.repository import seed_samples

DB_PATH = Path("dlp_simulation.db")


def app_database():
    connection = open_database(DB_PATH)
    create_schema(connection)
    seed_samples(connection, SAMPLE_EVENTS)
    return connection
