import { useEffect, useMemo, useState } from "react";
import type { Channel, ClassificationLevel, DestinationCategory, DlpDecision, DlpEventInput } from "../types";

interface Props {
  samples: DlpEventInput[];
  lastDecision: DlpDecision | null;
  onSimulate: (event: DlpEventInput) => Promise<void>;
}

const channels: Channel[] = ["email", "upload", "chat"];

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
  const [form, setForm] = useState<DlpEventInput>(emptyEvent);
  const [busy, setBusy] = useState(false);
  const channelSamples = useMemo(() => samples.filter((sample) => sample.channel === channel), [samples, channel]);

  useEffect(() => {
    setForm(channelSamples[0] ?? { ...emptyEvent, channel });
  }, [channel, channelSamples]);

  const sampleKey = `${form.channel}-${form.subject}`;
  const isMissingRequired = !form.user.trim() || !form.department.trim() || !form.destination.trim() || !form.subject.trim() || !form.content.trim();

  async function submit() {
    setBusy(true);
    try {
      await onSimulate(form);
    } finally {
      setBusy(false);
    }
  }

  function updateField<K extends keyof DlpEventInput>(key: K, value: DlpEventInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <section className="panel simulator">
      <div className="panel-heading">
        <h2>Simulador</h2>
        <div className="tabs" role="tablist" aria-label="Canal">
          {channels.map((item) => (
            <button className={channel === item ? "active" : ""} key={item} onClick={() => setChannel(item)} type="button">
              {item.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <label>
        Amostra
        <select
          value={sampleKey}
          onChange={(event) => {
            const sample = channelSamples.find((item) => `${item.channel}-${item.subject}` === event.target.value);
            setForm(sample ?? { ...emptyEvent, channel });
          }}
        >
          {channelSamples.map((sample) => (
            <option key={`${sample.channel}-${sample.subject}`} value={`${sample.channel}-${sample.subject}`}>
              {sample.subject}
            </option>
          ))}
        </select>
      </label>

      <div className="form-grid">
        <TextField label="Usuario" value={form.user} onChange={(value) => updateField("user", value)} />
        <TextField label="Departamento" value={form.department} onChange={(value) => updateField("department", value)} />
        <TextField label="Destino" value={form.destination} onChange={(value) => updateField("destination", value)} />
        <label>
          Categoria do destino
          <select value={form.destination_category} onChange={(event) => updateField("destination_category", event.target.value as DestinationCategory)}>
            <option value="interno">Interno</option>
            <option value="externo_aprovado">Externo aprovado</option>
            <option value="pessoal">Pessoal</option>
            <option value="servico_publico">Servico publico</option>
          </select>
        </label>
        <label>
          Classificacao declarada
          <select value={form.declared_classification} onChange={(event) => updateField("declared_classification", event.target.value as ClassificationLevel)}>
            <option value="publico">Publico</option>
            <option value="interno">Interno</option>
            <option value="confidencial">Confidencial</option>
            <option value="restrito">Restrito</option>
          </select>
        </label>
        <TextField label="Assunto ou arquivo" value={form.subject} onChange={(value) => updateField("subject", value)} />
      </div>

      <label>
        Conteudo inspecionado
        <textarea value={form.content} onChange={(event) => updateField("content", event.target.value)} />
      </label>

      <button className="primary-action" disabled={busy || isMissingRequired} onClick={submit} type="button">
        {busy ? "Simulando..." : "Executar simulacao"}
      </button>

      {lastDecision && (
        <div className="decision">
          <span className={`badge action-${lastDecision.action}`}>{lastDecision.action}</span>
          <span className={`badge severity-${lastDecision.severity}`}>{lastDecision.severity}</span>
          <strong>Score {lastDecision.score}</strong>
          <span>Classificacao efetiva: {lastDecision.effective_classification}</span>
        </div>
      )}
    </section>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label>
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
