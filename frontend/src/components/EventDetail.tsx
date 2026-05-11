import type { EventDetail as EventDetailType } from "../types";

interface Props {
  event: EventDetailType | null;
}

export default function EventDetail({ event }: Props) {
  if (!event) {
    return (
      <section className="panel detail-panel">
        <h2>Detalhe</h2>
        <p className="muted">Nenhum evento selecionado.</p>
      </section>
    );
  }

  return (
    <section className="panel detail-panel">
      <div className="panel-heading">
        <h2>Evento #{event.id}</h2>
        <div className="badge-row">
          <span className={`badge action-${event.action}`}>{event.action}</span>
          <span className={`badge severity-${event.severity}`}>{event.severity}</span>
        </div>
      </div>

      <div className="detail-grid">
        <span>Canal: {event.channel}</span>
        <span>Usuario: {event.user}</span>
        <span>Departamento: {event.department}</span>
        <span>Destino: {event.destination}</span>
        <span>Destino categoria: {event.destination_category}</span>
        <span>Classificacao efetiva: {event.effective_classification}</span>
        <span>Classificacao detectada: {event.detected_classification}</span>
        <span>Classificacao declarada: {event.declared_classification}</span>
        <span>Score: {event.score}</span>
      </div>

      <h3>Evidencias</h3>
      <ul className="stack-list">
        {event.evidence.length === 0 && <li>Nenhuma evidencia sensivel detectada.</li>}
        {event.evidence.map((item) => (
          <li key={`${item.type}-${item.masked_value}`}>
            <strong>{item.label}</strong>
            <span>{item.masked_value}</span>
            <span className="muted">x{item.count} | peso {item.weight}</span>
          </li>
        ))}
      </ul>

      <h3>Politicas</h3>
      <ul className="stack-list">
        {event.policies.map((policy) => (
          <li key={policy.name}>
            <div className="list-heading">
              <strong>{policy.name}</strong>
              <span className={`badge action-${policy.action}`}>{policy.action}</span>
            </div>
            <p>{policy.reason}</p>
            <span className="muted">Delta {policy.score_delta} | {policy.severity}</span>
          </li>
        ))}
      </ul>

      <h3>Alertas</h3>
      <ul className="stack-list">
        {event.alerts.length === 0 && <li>Nenhum alerta gerado para este evento.</li>}
        {event.alerts.map((alert) => (
          <li key={`${alert.created_at}-${alert.message}`}>
            <div className="list-heading">
              <strong>{alert.message}</strong>
              <span className={`badge action-${alert.action}`}>{alert.action}</span>
              <span className={`badge severity-${alert.severity}`}>{alert.severity}</span>
            </div>
            <span className="muted">{alert.created_at}</span>
          </li>
        ))}
      </ul>

      <h3>Racional</h3>
      <ul className="stack-list">
        {event.rationale.map((line) => (
          <li key={line}>{line}</li>
        ))}
      </ul>

      <h3>Payload</h3>
      <div className="payload-heading">
        <strong>{event.subject}</strong>
        <span className="muted">{event.created_at}</span>
      </div>
      <pre>{event.content}</pre>
    </section>
  );
}
