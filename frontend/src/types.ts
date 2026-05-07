export type Channel = "email" | "upload" | "chat";
export type ClassificationLevel = "publico" | "interno" | "confidencial" | "restrito";
export type DestinationCategory = "interno" | "externo_aprovado" | "pessoal" | "servico_publico";
export type DlpAction = "allow" | "warn" | "quarantine" | "block";
export type Severity = "low" | "medium" | "high" | "critical";

export interface DlpEventInput {
  channel: Channel;
  user: string;
  department: string;
  destination: string;
  destination_category: DestinationCategory;
  declared_classification: ClassificationLevel;
  subject: string;
  content: string;
}

export interface Evidence {
  type: string;
  label: string;
  masked_value: string;
  count: number;
  weight: number;
}

export interface PolicyMatch {
  name: string;
  action: DlpAction;
  severity: Severity;
  reason: string;
  score_delta: number;
}

export interface DlpDecision {
  action: DlpAction;
  severity: Severity;
  score: number;
  effective_classification: ClassificationLevel;
  detected_classification: ClassificationLevel;
  declared_classification: ClassificationLevel;
  evidence: Evidence[];
  policies: PolicyMatch[];
  rationale: string[];
}

export interface EventSummary {
  id: number;
  created_at: string;
  channel: Channel;
  user: string;
  department: string;
  destination: string;
  destination_category: DestinationCategory;
  declared_classification: ClassificationLevel;
  detected_classification: ClassificationLevel;
  effective_classification: ClassificationLevel;
  subject: string;
  content: string;
  action: DlpAction;
  severity: Severity;
  score: number;
  rationale: string;
}

export interface EventDetail extends Omit<EventSummary, "rationale"> {
  rationale: string[];
  evidence: Evidence[];
  policies: PolicyMatch[];
}
