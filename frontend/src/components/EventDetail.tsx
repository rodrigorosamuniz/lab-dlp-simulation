import { useState } from "react";
import { FileText, ShieldCheck, Gavel, Search, EyeOff, LayoutPanelTop, Clock, User, Globe, Copy, Check } from "lucide-react";
import type { EventDetail as EventDetailType } from "../types";

interface Props {
  event: EventDetailType | null;
}

export default function EventDetail({ event }: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!event) return;
    navigator.clipboard.writeText(event.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!event) {
    return (
      <section className="panel detail-panel empty-detail">
        <div className="empty-state">
          <div className="empty-icon-wrapper">
             <Search size={48} className="muted" />
          </div>
          <h2>Análise de Detalhes</h2>
          <p className="muted">Selecione um evento no histórico ou execute uma nova simulação para visualizar o relatório detalhado de segurança.</p>
        </div>
        
        <style>{`
          .empty-icon-wrapper {
            background: var(--bg-muted);
            padding: 2rem;
            border-radius: 50%;
            margin-bottom: 1rem;
            border: 2px dashed var(--border-color);
          }
        `}</style>
      </section>
    );
  }

  return (
    <section className="panel detail-panel" key={event.id}>
      <div className="panel-heading detail-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <FileText className="text-primary" size={24} />
          <h2>Relatório do Evento #{event.id}</h2>
        </div>
        <div className="badge-row">
          <span className={`badge action-${event.action}`}>{event.action}</span>
          <span className={`badge severity-${event.severity}`}>{event.severity}</span>
        </div>
      </div>
      
      {/* ... rest of metadata and sections ... */}
      <div className="detail-meta-grid">
        <MetaItem icon={<Clock size={16} />} label="Data/Hora" value={new Date(event.created_at).toLocaleString()} />
        <MetaItem icon={<User size={16} />} label="Usuário" value={`${event.user} (${event.department})`} />
        <MetaItem icon={<Globe size={16} />} label="Destino" value={event.destination} />
        <MetaItem icon={<ShieldCheck size={16} />} label="Classificação Efetiva" value={event.effective_classification} />
      </div>

      <div className="detail-sections">
        <section className="detail-section">
          <div className="section-title">
            <EyeOff size={18} />
            <h3>Evidências Detectadas</h3>
          </div>
          <div className="evidence-list">
            {event.evidence.length === 0 && <p className="muted-text">Nenhuma evidência sensível detectada pelo motor DLP.</p>}
            {event.evidence.map((item) => (
              <div key={`${item.type}-${item.masked_value}`} className="evidence-item">
                <div className="evidence-main">
                  <span className="evidence-label">{item.label}</span>
                  <code className="evidence-value">{item.masked_value}</code>
                </div>
                <div className="evidence-meta">
                  <span className="count-badge">x{item.count}</span>
                  <span className="weight-badge">Peso: {item.weight}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="detail-section">
          <div className="section-title">
            <Gavel size={18} />
            <h3>Políticas Acionadas</h3>
          </div>
          <div className="policy-stack">
            {event.policies.map((policy) => (
              <div key={policy.name} className="policy-item">
                <div className="policy-header">
                  <strong>{policy.name}</strong>
                  <span className={`badge action-${policy.action}`}>{policy.action}</span>
                </div>
                <p className="policy-reason">{policy.reason}</p>
                <div className="policy-footer">
                   <span>Ajuste de Score: +{policy.score_delta}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="detail-section">
          <div className="section-title">
            <LayoutPanelTop size={18} />
            <h3>Racional da Decisão</h3>
          </div>
          <ul className="rationale-list">
            {event.rationale.map((line, i) => <li key={i}>{line}</li>)}
          </ul>
        </section>

        <section className="detail-section">
          <div className="section-title" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Search size={18} />
              <h3>Conteúdo Inspecionado</h3>
            </div>
            <button className="copy-btn" onClick={handleCopy} title="Copiar conteúdo">
              {copied ? <Check size={14} className="icon-allow" /> : <Copy size={14} />}
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>
          <div className="payload-box">
            <pre>{event.content}</pre>
          </div>
        </section>
      </div>

      <style>{`
        .copy-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--bg-muted);
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          padding: 0.375rem 0.75rem;
          border-radius: 0.375rem;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: all var(--transition-fast);
        }
        .copy-btn:hover {
          background: var(--bg-surface-hover);
          color: var(--text-main);
          border-color: var(--border-strong);
        }
        .detail-panel {
          animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
      {/* ... rest of existing styles ... */}

      <style>{`
        .detail-header {
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 1rem;
          margin-bottom: 1.5rem;
        }
        .empty-detail {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 400px;
          text-align: center;
        }
        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
          max-width: 300px;
        }
        .detail-meta-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
          background: var(--bg-muted);
          padding: 1rem;
          border-radius: 0.5rem;
        }
        .meta-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .meta-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
        }
        .meta-value {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-main);
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .detail-sections {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .section-title {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--text-main);
          margin-bottom: 1rem;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 0.5rem;
        }
        .section-title h3 {
          margin: 0;
          font-size: 1rem;
          text-transform: uppercase;
          letter-spacing: 0.025em;
        }
        .evidence-list {
          display: grid;
          gap: 0.75rem;
        }
        .evidence-item {
          background: var(--bg-muted);
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          padding: 0.75rem 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .evidence-main {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .evidence-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--text-muted);
        }
        .evidence-value {
          font-family: monospace;
          font-size: 1rem;
          color: var(--color-primary);
        }
        .evidence-meta {
          display: flex;
          gap: 0.5rem;
        }
        .count-badge, .weight-badge {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.25rem 0.5rem;
          background: var(--bg-surface);
          border: 1px solid var(--border-color);
          border-radius: 0.25rem;
        }
        .policy-stack {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .policy-item {
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          padding: 1rem;
        }
        .policy-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .policy-reason {
          font-size: 0.875rem;
          color: var(--text-muted);
          margin: 0.5rem 0;
        }
        .policy-footer {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--color-primary);
        }
        .rationale-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .rationale-list li {
          font-size: 0.875rem;
          padding-left: 1.25rem;
          position: relative;
        }
        .rationale-list li::before {
          content: "•";
          position: absolute;
          left: 0;
          color: var(--color-primary);
        }
        .payload-box pre {
          background: #1e293b;
          color: #e2e8f0;
          padding: 1rem;
          border-radius: 0.5rem;
          font-size: 0.875rem;
          max-height: 300px;
          overflow: auto;
        }
        .muted-text {
          font-size: 0.875rem;
          color: var(--text-muted);
          font-style: italic;
        }
      `}</style>
    </section>
  );
}

function MetaItem({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
  return (
    <div className="meta-item">
      <div className="meta-label">
        {icon}
        <span>{label}</span>
      </div>
      <div className="meta-value" title={value}>{value}</div>
    </div>
  );
}
