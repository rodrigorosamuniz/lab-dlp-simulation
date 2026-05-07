import type { DlpDecision, DlpEventInput, EventDetail, EventSummary } from "./types";

export async function getSamples(): Promise<DlpEventInput[]> {
  const response = await fetch("/api/samples");
  return requireOk(response);
}

export async function simulate(event: DlpEventInput): Promise<{ event_id: number; decision: DlpDecision }> {
  const response = await fetch("/api/simulate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event)
  });
  return requireOk(response);
}

export async function getEvents(): Promise<EventSummary[]> {
  const response = await fetch("/api/events");
  return requireOk(response);
}

export async function getEventDetail(id: number): Promise<EventDetail> {
  const response = await fetch(`/api/events/${id}`);
  return requireOk(response);
}

async function requireOk<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return response.json() as Promise<T>;
}
