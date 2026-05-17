import { useEffect, useRef, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { getEventDetail, getEvents, getSamples, resetEvents, simulate } from "./api";
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
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });
  const latestDetailRequest = useRef(0);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

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

  async function handleResetEvents() {
    setError(null);
    latestDetailRequest.current += 1;
    try {
      await resetEvents();
      setEvents([]);
      setSelected(null);
      setLastDecision(null);
    } catch {
      setError("Nao foi possivel resetar os eventos.");
    }
  }

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="topbar-brand">
          <p>Lab DLP Simulation</p>
          <h1>Operacao DLP</h1>
        </div>
        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          <span>{theme === 'light' ? 'Escuro' : 'Claro'}</span>
        </button>
      </header>
      {error && <div className="alert">{error}</div>}
      <Dashboard events={events} onReset={handleResetEvents} />
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
