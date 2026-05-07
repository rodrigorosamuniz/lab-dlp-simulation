from enum import StrEnum

from pydantic import BaseModel, Field


class Channel(StrEnum):
    EMAIL = "email"
    UPLOAD = "upload"
    CHAT = "chat"


class ClassificationLevel(StrEnum):
    PUBLIC = "publico"
    INTERNAL = "interno"
    CONFIDENTIAL = "confidencial"
    RESTRICTED = "restrito"


class EvidenceType(StrEnum):
    CPF = "cpf"
    CREDIT_CARD = "cartao"
    EMAIL = "email"
    SECRET = "credencial"
    SALARY = "salario"
    LABEL = "rotulo"


class DestinationCategory(StrEnum):
    INTERNAL = "interno"
    APPROVED_EXTERNAL = "externo_aprovado"
    PERSONAL = "pessoal"
    PUBLIC_SERVICE = "servico_publico"


class DlpAction(StrEnum):
    ALLOW = "allow"
    WARN = "warn"
    QUARANTINE = "quarantine"
    BLOCK = "block"


class Severity(StrEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Evidence(BaseModel):
    type: EvidenceType
    label: str
    masked_value: str
    count: int = 1
    weight: int


class ClassificationResult(BaseModel):
    declared_marker: ClassificationLevel | None = None
    detected_level: ClassificationLevel
    evidence: list[Evidence] = Field(default_factory=list)
    evidence_count_by_type: dict[EvidenceType, int] = Field(default_factory=dict)
    rationale: list[str] = Field(default_factory=list)


class DlpEventInput(BaseModel):
    channel: Channel
    user: str
    department: str
    destination: str
    destination_category: DestinationCategory
    declared_classification: ClassificationLevel
    subject: str
    content: str


class PolicyMatch(BaseModel):
    name: str
    action: DlpAction
    severity: Severity
    reason: str
    score_delta: int


class DlpDecision(BaseModel):
    action: DlpAction
    severity: Severity
    score: int
    effective_classification: ClassificationLevel
    detected_classification: ClassificationLevel
    declared_classification: ClassificationLevel
    evidence: list[Evidence]
    policies: list[PolicyMatch]
    rationale: list[str]
