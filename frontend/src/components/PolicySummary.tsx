import { BookOpen, ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import type { DlpAction } from "../types";

const policies = [
  { name: "Dados públicos", condition: "Público sem evidência sensível", action: "allow" as DlpAction },
  { name: "Conteúdo interno para externo", condition: "Interno enviado para destino externo", action: "warn" as DlpAction },
  { name: "Confidencial para destino aprovado", condition: "Confidencial para fornecedor aprovado", action: "quarantine" as DlpAction },
  { name: "Confidencial para destino pessoal", condition: "Confidencial para email pessoal, drive pessoal ou IA pública", action: "block" as DlpAction },
  { name: "Dados restritos", condition: "CPF em volume, cartão, credencial, token, chave ou dump", action: "block" as DlpAction },
  { name: "Rótulo inconsistente", condition: "Declarado Público com conteúdo sensível detectado", action: "warn" as DlpAction }
];

export default function PolicySummary() {
  const getActionIcon = (action: DlpAction) => {
    switch (action) {
      case "allow": return <ShieldCheck size={14} />;
      case "warn": return <ShieldAlert size={14} />;
      case "quarantine": return <ShieldAlert size={14} />;
      case "block": return <ShieldX size={14} />;
    }
  };

  return (
    <section className="panel policy-panel">
      <div className="panel-heading">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <BookOpen className="text-primary" size={20} />
          <h2>Catálogo de Políticas</h2>
        </div>
      </div>
      
      <div className="policy-list">
        {policies.map((policy) => (
          <div key={policy.name} className="policy-card">
            <div className="policy-card-header">
              <strong>{policy.name}</strong>
              <div className={`badge-cell-inline action-${policy.action}`}>
                {getActionIcon(policy.action)}
                <span className={`badge action-${policy.action}`}>{policy.action}</span>
              </div>
            </div>
            <p className="policy-condition">{policy.condition}</p>
          </div>
        ))}
      </div>

      <style>{`
        .policy-panel {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .policy-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .policy-card {
          padding: 1rem;
          background: var(--bg-muted);
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          transition: border-color var(--transition-fast);
        }
        .policy-card:hover {
          border-color: var(--border-strong);
        }
        .policy-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
          margin-bottom: 0.5rem;
        }
        .policy-card-header strong {
          font-size: 0.875rem;
          color: var(--text-main);
          line-height: 1.2;
        }
        .policy-condition {
          font-size: 0.8125rem;
          color: var(--text-muted);
          margin: 0;
        }
        .badge-cell-inline {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
        }
        .badge-cell-inline .badge {
          padding: 0.125rem 0.5rem;
        }
      `}</style>
    </section>
  );
}
