import type { EventSummary } from "../types";

interface Props {
  events: EventSummary[];
  onReset: () => void;
}

export default function Dashboard({ events, onReset }: Props) {
  const blocked = events.filter((event) => event.action === "block").length;
  const quarantined = events.filter((event) => event.action === "quarantine").length;
  const critical = events.filter((event) => event.severity === "critical").length;
  const averageScore = events.length === 0 ? 0 : Math.round(events.reduce((sum, event) => sum + event.score, 0) / events.length);

  return (
    <section className="dashboard-panel" aria-label="Resumo operacional">
      <div className="metrics">
        <Metric label="Eventos" value={events.length.toString()} />
        <Metric label="Bloqueios" value={blocked.toString()} tone="danger" />
        <Metric label="Quarentena" value={quarantined.toString()} tone="warning" />
        <Metric label="Criticos" value={critical.toString()} tone="critical" />
        <Metric label="Score medio" value={averageScore.toString()} />
      </div>
      <button className="secondary-action" type="button" onClick={onReset} disabled={events.length === 0}>
        Resetar eventos
      </button>
    </section>
  );
}

function Metric({ label, value, tone = "neutral" }: { label: string; value: string; tone?: string }) {
  return (
    <article className={`metric metric-${tone}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </article>
  );
}
