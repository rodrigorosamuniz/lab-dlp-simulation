import { AlertTriangle, Shield, ShieldAlert, ShieldCheck, ShieldX, RotateCcw } from "lucide-react";
import type { EventSummary } from "../types";

interface Props {
  events: EventSummary[];
  onReset: () => Promise<void>;
}

export default function Dashboard({ events, onReset }: Props) {
  const blocked = events.filter((event) => event.action === "block").length;
  const quarantined = events.filter((event) => event.action === "quarantine").length;
  const critical = events.filter((event) => event.severity === "critical").length;
  const avgScore = events.length === 0 ? 0 : Math.round(events.reduce((sum, event) => sum + event.score, 0) / events.length);

  return (
    <section className="dashboard-panel">
      <div className="panel-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Shield className="text-primary" size={24} />
          <h2>Security Insights</h2>
        </div>
        <button className="secondary-action" onClick={onReset} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RotateCcw size={16} />
          <span>Resetar Eventos</span>
        </button>
      </div>
      <div className="metrics">
        <Metric 
          icon={<ShieldCheck size={24} />} 
          label="Total de Eventos" 
          value={events.length.toString()} 
        />
        <Metric 
          icon={<ShieldX size={24} />} 
          label="Bloqueios" 
          value={blocked.toString()} 
          tone="danger" 
        />
        <Metric 
          icon={<ShieldAlert size={24} />} 
          label="Quarentena" 
          value={quarantined.toString()} 
          tone="warning" 
        />
        <Metric 
          icon={<AlertTriangle size={24} />} 
          label="Eventos Críticos" 
          value={critical.toString()} 
          tone="critical" 
        />
        <Metric 
          icon={<Shield size={24} />} 
          label="Risco Médio" 
          value={avgScore.toString()} 
        />
      </div>
      
      <style>{`
        .metric {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding: 1.25rem;
        }
        .metric-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--text-muted);
        }
        .metric-header span {
          font-size: 0.875rem;
          font-weight: 600;
        }
        .metric strong {
          font-size: 2rem;
          font-weight: 700;
          color: var(--text-main);
        }
        .metric-danger { border-left: 4px solid var(--color-danger); }
        .metric-warning { border-left: 4px solid var(--color-warning); }
        .metric-critical { border-left: 4px solid var(--color-critical); }
        
        .text-primary { color: var(--color-primary); }
        
        .secondary-action {
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          color: var(--text-main);
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 600;
          transition: all var(--transition-fast);
        }
        .secondary-action:hover {
          background: var(--bg-surface-hover);
          border-color: var(--border-strong);
        }
      `}</style>
    </section>
  );
}

function Metric({ icon, label, value, tone = "neutral" }: { icon: React.ReactNode, label: string; value: string; tone?: string }) {
  return (
    <article className={`metric panel metric-${tone}`}>
      <div className="metric-header">
        <div className={`icon-${tone}`}>{icon}</div>
        <span>{label}</span>
      </div>
      <strong>{value}</strong>
      
      <style>{`
        .icon-danger { color: var(--color-danger); }
        .icon-warning { color: var(--color-warning); }
        .icon-critical { color: var(--color-critical); }
        .icon-neutral { color: var(--color-primary); }
      `}</style>
    </article>
  );
}
