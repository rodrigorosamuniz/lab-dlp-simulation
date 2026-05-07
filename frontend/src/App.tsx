import { useEffect, useRef, useState } from "react";
import { getEventDetail, getEvents, getSamples, simulate } from "./api";
import Dashboard from "./components/Dashboard";
import EventDetail from "./components/EventDetail";
import EventsTable from "./components/EventsTable";
import PolicySummary from "./components/PolicySummary";
import Simulator from "./components/Simulator";
import type { DlpDecision, DlpEventInput, EventDetail as EventDetailType, EventSummary } from "./types";

export default function App() {
  const [samples, setSamples] = useState<DlpEventInput[]>([]);
  const [events, setEvents] = useState<EventSummary[]>([]);
  const [selected, setSelected] = useState<EventDetailType | null>(null);
  const [lastDecision, setLastDecision] = useState<DlpDecision | null>(null);
  const [error, setError] = useState<string | null>(null);
  const latestDetailRequest = useRef(0);

  async function refreshEvents() {
    setEvents(await getEvents());
  }

  useEffect(() => {
    getSamples().then(setSamples).catch(() => setError("Nao foi possivel carregar as amostras."));
    refreshEvents().catch(() => setError("Nao foi possivel carregar os eventos."));
  }, []);

  async function handleSimulate(event: DlpEventInput) {
    setError(null);
    const requestToken = latestDetailRequest.current + 1;
    latestDetailRequest.current = requestToken;
    try {
      const result = await simulate(event);
      setLastDecision(result.decision);
      await refreshEvents();
      const detail = await getEventDetail(result.event_id);
      if (latestDetailRequest.current === requestToken) {
        setSelected(detail);
      }
    } catch {
      setError("Nao foi possivel executar a simulacao.");
    }
  }

  async function handleSelect(id: number) {
    setError(null);
    const requestToken = latestDetailRequest.current + 1;
    latestDetailRequest.current = requestToken;
    try {
      const detail = await getEventDetail(id);
      if (latestDetailRequest.current === requestToken) {
        setSelected(detail);
      }
    } catch {
      setError("Nao foi possivel carregar o detalhe do evento.");
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p>Lab DLP Simulation</p>
          <h1>Operacao DLP</h1>
        </div>
      </header>
      {error && <div className="alert">{error}</div>}
      <Dashboard events={events} />
      <section className="workspace">
        <Simulator samples={samples} onSimulate={handleSimulate} lastDecision={lastDecision} />
        <PolicySummary />
      </section>
      <section className="workspace">
        <EventsTable events={events} onSelect={handleSelect} />
        <EventDetail event={selected} />
      </section>
    </main>
  );
}
