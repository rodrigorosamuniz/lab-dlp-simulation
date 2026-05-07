from app.dlp.models import (
    ClassificationLevel,
    DestinationCategory,
    DlpAction,
    EvidenceType,
    PolicyMatch,
    Severity,
)

ACTION_RANK = {
    DlpAction.ALLOW: 0,
    DlpAction.WARN: 1,
    DlpAction.QUARANTINE: 2,
    DlpAction.BLOCK: 3,
}
SEVERITY_RANK = {
    Severity.LOW: 0,
    Severity.MEDIUM: 1,
    Severity.HIGH: 2,
    Severity.CRITICAL: 3,
}


def evaluate_policies(
    declared: ClassificationLevel,
    detected: ClassificationLevel,
    effective: ClassificationLevel,
    destination_category: DestinationCategory,
    evidence_counts: dict[EvidenceType, int],
) -> list[PolicyMatch]:
    matches: list[PolicyMatch] = []

    if effective == ClassificationLevel.PUBLIC and not _has_sensitive_evidence(evidence_counts):
        matches.append(
            PolicyMatch(
                name="Dados publicos",
                action=DlpAction.ALLOW,
                severity=Severity.LOW,
                reason="Conteudo publico sem evidencias sensiveis.",
                score_delta=5,
            )
        )

    if effective == ClassificationLevel.INTERNAL and destination_category != DestinationCategory.INTERNAL:
        matches.append(
            PolicyMatch(
                name="Conteudo interno para externo",
                action=DlpAction.WARN,
                severity=Severity.MEDIUM,
                reason="Conteudo interno enviado para destino fora do ambiente interno.",
                score_delta=30,
            )
        )

    if effective == ClassificationLevel.CONFIDENTIAL and destination_category == DestinationCategory.APPROVED_EXTERNAL:
        matches.append(
            PolicyMatch(
                name="Confidencial para destino aprovado",
                action=DlpAction.QUARANTINE,
                severity=Severity.MEDIUM,
                reason="Conteudo confidencial exige revisao antes de envio externo aprovado.",
                score_delta=45,
            )
        )

    if effective == ClassificationLevel.CONFIDENTIAL and destination_category in {
        DestinationCategory.PERSONAL,
        DestinationCategory.PUBLIC_SERVICE,
    }:
        matches.append(
            PolicyMatch(
                name="Confidencial para destino pessoal",
                action=DlpAction.BLOCK,
                severity=Severity.HIGH,
                reason="Conteudo confidencial nao pode seguir para destino pessoal ou servico publico.",
                score_delta=70,
            )
        )

    if _is_restricted(effective, evidence_counts):
        matches.append(
            PolicyMatch(
                name="Dados restritos",
                action=DlpAction.BLOCK,
                severity=Severity.CRITICAL,
                reason="Conteudo restrito ou evidencia critica detectada.",
                score_delta=90,
            )
        )

    if declared == ClassificationLevel.PUBLIC and detected not in {
        ClassificationLevel.PUBLIC,
        ClassificationLevel.INTERNAL,
    }:
        action = DlpAction.BLOCK if detected == ClassificationLevel.RESTRICTED else DlpAction.WARN
        severity = Severity.CRITICAL if detected == ClassificationLevel.RESTRICTED else Severity.MEDIUM
        matches.append(
            PolicyMatch(
                name="Rotulo inconsistente",
                action=action,
                severity=severity,
                reason="Rotulo publico inconsistente com sensibilidade detectada.",
                score_delta=35,
            )
        )

    if not matches:
        matches.append(
            PolicyMatch(
                name="Monitoramento padrao",
                action=DlpAction.ALLOW,
                severity=Severity.LOW,
                reason="Nenhuma politica especifica acionada.",
                score_delta=10,
            )
        )

    return matches


def final_action(policies: list[PolicyMatch]) -> DlpAction:
    return max((policy.action for policy in policies), key=ACTION_RANK.__getitem__)


def final_severity(policies: list[PolicyMatch]) -> Severity:
    return max((policy.severity for policy in policies), key=SEVERITY_RANK.__getitem__)


def _has_sensitive_evidence(evidence_counts: dict[EvidenceType, int]) -> bool:
    return any(count > 0 for count in evidence_counts.values())


def _is_restricted(
    effective: ClassificationLevel,
    evidence_counts: dict[EvidenceType, int],
) -> bool:
    return (
        effective == ClassificationLevel.RESTRICTED
        or evidence_counts.get(EvidenceType.SECRET, 0) > 0
        or evidence_counts.get(EvidenceType.CREDIT_CARD, 0) > 0
        or evidence_counts.get(EvidenceType.CPF, 0) >= 3
    )
