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
    event_id = save_event(app_database(), event, decision)
    return {"event_id": event_id, "decision": decision.model_dump(mode="json")}


@router.get("/events")
def events() -> list[dict]:
    return list_events(app_database())


@router.get("/events/{event_id}")
def event_detail(event_id: int) -> dict:
    detail = get_event_detail(app_database(), event_id)
    if detail is None:
        raise HTTPException(status_code=404, detail="Event not found")
    return detail
