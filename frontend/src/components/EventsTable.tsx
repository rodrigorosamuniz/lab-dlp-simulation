import { History, ShieldAlert, ShieldCheck, ShieldX, AlertTriangle, Info } from "lucide-react";
import type { EventSummary, DlpAction, Severity } from "../types";

interface Props {
  events: EventSummary[];
  onSelect: (id: number) => void;
}

export default function EventsTable({ events, onSelect }: Props) {
  const getActionIcon = (action: DlpAction) => {
    switch (action) {
      case "allow": return <ShieldCheck size={14} className="icon-allow" />;
      case "warn": return <ShieldAlert size={14} className="icon-warn" />;
      case "quarantine": return <ShieldAlert size={14} className="icon-warn" />;
      case "block": return <ShieldX size={14} className="icon-block" />;
    }
  };

  const getSeverityIcon = (severity: Severity) => {
    switch (severity) {
      case "low": return <Info size={14} className="icon-low" />;
      case "medium": return <ShieldAlert size={14} className="icon-warn" />;
      case "high": return <AlertTriangle size={14} className="icon-warn" />;
      case "critical": return <ShieldX size={14} className="icon-critical" />;
    }
  };

  return (
    <section className="panel table-panel">
      <div className="panel-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <History className="text-primary" size={20} />
          <h2>Histórico de Eventos</h2>
        </div>
        <span className="muted" style={{ fontSize: '0.875rem', fontWeight: 600 }}>{events.length} registros</span>
      </div>
      
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Canal</th>
              <th>Usuário</th>
              <th>Destino</th>
              <th>Classificação</th>
              <th>Ação</th>
              <th>Severidade</th>
              <th>Score</th>
            </tr>
          </thead>
          <tbody>
            {events.length === 0 && (
              <tr>
                <td colSpan={8}>
                  <div className="table-empty-state">
                    <History size={40} className="muted" style={{ marginBottom: '1rem' }} />
                    <p>Nenhum evento registrado no histórico.</p>
                    <span className="muted">Execute uma simulação para visualizar os logs de auditoria.</span>
                  </div>
                </td>
              </tr>
            )}
            {events.map((event) => (
              <tr key={event.id} onClick={() => onSelect(event.id)} className="clickable-row">
                <td className="id-cell">#{event.id}</td>
                <td className="channel-cell">{event.channel}</td>
                <td>{event.user}</td>
                <td className="destination-cell" title={event.destination}>{event.destination}</td>
                <td><span className="level-text">{event.effective_classification}</span></td>
                <td>
                  <div className="badge-cell">
                    {getActionIcon(event.action)}
                    <span className={`badge action-${event.action}`}>{event.action}</span>
                  </div>
                </td>
                <td>
                  <div className="badge-cell">
                    {getSeverityIcon(event.severity)}
                    <span className={`badge severity-${event.severity}`}>{event.severity}</span>
                  </div>
                </td>
                <td className="score-cell">
                   <div className={`score-dot ${event.score > 70 ? 'bg-danger' : event.score > 30 ? 'bg-warning' : 'bg-success'}`}></div>
                   {event.score}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
<style>{`
  .table-empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 2rem;
    color: var(--text-main);
    text-align: center;
  }
  .table-empty-state p {
    font-weight: 600;
    margin-bottom: 0.25rem;
  }
  .table-empty-state span {
    font-size: 0.8125rem;
  }
  .table-panel {
...
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .table-wrap {
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          overflow: hidden;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.875rem;
        }
        th {
          background: var(--bg-muted);
          color: var(--text-muted);
          font-weight: 600;
          text-align: left;
          padding: 0.75rem 1rem;
          border-bottom: 1px solid var(--border-color);
          text-transform: uppercase;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
        }
        td {
          padding: 0.75rem 1rem;
          border-bottom: 1px solid var(--border-color);
          color: var(--text-main);
        }
        .clickable-row {
          cursor: pointer;
          transition: background-color var(--transition-fast);
        }
        .clickable-row:hover {
          background: var(--bg-surface-hover);
        }
        .id-cell {
          font-weight: 700;
          color: var(--color-primary);
        }
        .channel-cell {
          text-transform: capitalize;
        }
        .destination-cell {
          max-width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .level-text {
          text-transform: capitalize;
          font-weight: 500;
        }
        .badge-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .score-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 700;
        }
        .score-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .bg-success { background: var(--color-success); }
        .bg-warning { background: var(--color-warning); }
        .bg-danger { background: var(--color-danger); }
        
        .icon-allow { color: var(--color-success); }
        .icon-warn { color: var(--color-warning); }
        .icon-block { color: var(--color-danger); }
        .icon-low { color: var(--color-primary); }
        .icon-critical { color: var(--color-critical); }
      `}</style>
    </section>
  );
}
