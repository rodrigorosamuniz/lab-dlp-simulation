import { useEffect, useMemo, useState } from "react";
import { Activity, Mail, Upload, MessageSquare, Play, Info } from "lucide-react";
import type { Channel, ClassificationLevel, DestinationCategory, DlpDecision, DlpEventInput } from "../types";

interface Props {
  samples: DlpEventInput[];
  lastDecision: DlpDecision | null;
  onSimulate: (event: DlpEventInput) => Promise<void>;
}

const emptyEvent: DlpEventInput = {
  channel: "email",
  user: "",
  department: "",
  destination: "",
  destination_category: "interno",
  declared_classification: "publico",
  subject: "",
  content: ""
};

export default function Simulator({ samples, lastDecision, onSimulate }: Props) {
  const [channel, setChannel] = useState<Channel>("email");
  const channelSamples = useMemo(() => samples.filter((sample) => sample.channel === channel), [samples, channel]);
  const [form, setForm] = useState<DlpEventInput>(emptyEvent);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setForm(channelSamples[0] ?? { ...emptyEvent, channel });
  }, [channel, channelSamples]);

  async function submit() {
    setBusy(true);
    try {
      await onSimulate(form);
    } finally {
      setBusy(false);
    }
  }

  const getChannelIcon = (c: Channel) => {
    switch (c) {
      case "email": return <Mail size={16} />;
      case "upload": return <Upload size={16} />;
      case "chat": return <MessageSquare size={16} />;
    }
  };

  return (
    <section className="panel simulator">
      <div className="panel-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Activity className="text-primary" size={24} />
          <h2>Simulador de Evento</h2>
        </div>
        <div className="tabs" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {(["email", "upload", "chat"] as Channel[]).map((item) => (
            <button 
              className={`tab-button ${channel === item ? "active" : ""}`} 
              key={item} 
              onClick={() => setChannel(item)} 
              type="button"
            >
              {getChannelIcon(item)}
              <span>{item.toUpperCase()}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="simulator-body">
        <div className="simulator-config">
          <label className="field-group">
            Amostra de Referência
            <select
              value={channelSamples.findIndex((sample) => sample.subject === form.subject)}
              onChange={(event) => setForm(channelSamples[Number(event.target.value)] ?? { ...emptyEvent, channel })}
            >
              {channelSamples.map((sample, index) => (
                <option key={`${sample.channel}-${sample.subject}`} value={index}>
                  {sample.subject}
                </option>
              ))}
            </select>
          </label>

          <div className="form-grid">
            <TextField label="Usuário" value={form.user} onChange={(value) => setForm({ ...form, user: value })} />
            <TextField label="Departamento" value={form.department} onChange={(value) => setForm({ ...form, department: value })} />
            <TextField label="Destino" value={form.destination} onChange={(value) => setForm({ ...form, destination: value })} />
            <label className="field-group">
              Categoria do Destino
              <select value={form.destination_category} onChange={(event) => setForm({ ...form, destination_category: event.target.value as DestinationCategory })}>
                <option value="interno">Interno</option>
                <option value="externo_aprovado">Externo aprovado</option>
                <option value="pessoal">Pessoal</option>
                <option value="servico_publico">Serviço público</option>
              </select>
            </label>
            <label className="field-group">
              Classificação Declarada
              <select value={form.declared_classification} onChange={(event) => setForm({ ...form, declared_classification: event.target.value as ClassificationLevel })}>
                <option value="publico">Público</option>
                <option value="interno">Interno</option>
                <option value="confidencial">Confidencial</option>
                <option value="restrito">Restrito</option>
              </select>
            </label>
            <TextField label="Assunto / Arquivo" value={form.subject} onChange={(value) => setForm({ ...form, subject: value })} />
          </div>

          <label className="field-group">
            Conteúdo da Mensagem
            <textarea value={form.content} onChange={(event) => setForm({ ...form, content: event.target.value })} />
          </label>

          <button className="primary-action simulate-btn" disabled={busy || !form.user || !form.destination || !form.content} onClick={submit} type="button">
            {busy ? <RotateCcwIcon /> : <Play size={18} />}
            <span>{busy ? "Analisando..." : "Executar Simulação"}</span>
          </button>
        </div>

        {lastDecision && (
          <div className="live-analysis">
            <div className="analysis-header">
              <Info size={16} />
              <span>Resultado da Análise Live</span>
            </div>
            <div className="decision-card">
              <div className="decision-row">
                <span className="label">Ação DLP:</span>
                <span className={`badge action-${lastDecision.action}`}>{lastDecision.action}</span>
              </div>
              <div className="decision-row">
                <span className="label">Severidade:</span>
                <span className={`badge severity-${lastDecision.severity}`}>{lastDecision.severity}</span>
              </div>
              <div className="decision-row">
                <span className="label">Risco:</span>
                <div className="score-viz">
                   <div className="score-bar"><div className="score-fill" style={{ width: `${lastDecision.score}%` }}></div></div>
                   <strong>{lastDecision.score}</strong>
                </div>
              </div>
              <div className="decision-row">
                <span className="label">Classificação:</span>
                <span className="value">{lastDecision.effective_classification}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .simulator-body {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .simulator-config {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .field-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .tab-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: var(--bg-muted);
          border: 1px solid var(--border-color);
          color: var(--text-muted);
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          cursor: pointer;
          font-weight: 600;
          transition: all var(--transition-fast);
        }
        .tab-button.active {
          background: var(--color-primary);
          border-color: var(--color-primary);
          color: white;
        }
        .simulate-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          width: 100%;
          margin-top: 1rem;
        }
        .live-analysis {
          background: var(--bg-muted);
          border: 1px solid var(--border-color);
          border-radius: 0.75rem;
          padding: 1.25rem;
        }
        .analysis-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-muted);
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 1rem;
        }
        .decision-card {
          display: grid;
          gap: 0.75rem;
        }
        .decision-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .decision-row .label {
          color: var(--text-muted);
          font-size: 0.875rem;
        }
        .decision-row .value {
          font-weight: 600;
          text-transform: capitalize;
        }
        .score-viz {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          flex: 1;
          justify-content: flex-end;
          max-width: 200px;
        }
        .score-bar {
          height: 6px;
          background: var(--border-color);
          border-radius: 3px;
          flex: 1;
          overflow: hidden;
        }
        .score-fill {
          height: 100%;
          background: var(--color-primary);
        }
      `}</style>
    </section>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="field-group">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function RotateCcwIcon() {
  return (
    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8"></path>
      <path d="M21 3v5h-5"></path>
      <style>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </svg>
  );
}
