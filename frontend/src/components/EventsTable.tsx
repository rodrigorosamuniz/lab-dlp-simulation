import type { EventSummary } from "../types";

interface Props {
  events: EventSummary[];
  onSelect: (id: number) => void;
}

export default function EventsTable({ events, onSelect }: Props) {
  return (
    <section className="panel table-panel">
      <div className="panel-heading">
        <h2>Eventos</h2>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Canal</th>
              <th>Usuario</th>
              <th>Destino</th>
              <th>Classificacao</th>
              <th>Acao</th>
              <th>Severidade</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} onClick={() => onSelect(event.id)}>
                <td>{event.id}</td>
                <td>{event.channel}</td>
                <td>{event.user}</td>
                <td>{event.destination}</td>
                <td>{event.effective_classification}</td>
                <td>
                  <span className={`badge action-${event.action}`}>{event.action}</span>
                </td>
                <td>
                  <span className={`badge severity-${event.severity}`}>{event.severity}</span>
                </td>
                <td>{event.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
