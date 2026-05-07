from app.dlp.classifiers import LEVEL_ORDER, classify_content
from app.dlp.models import (
    Channel,
    ClassificationLevel,
    DestinationCategory,
    DlpDecision,
    DlpEventInput,
)
from app.dlp.policy import evaluate_policies, final_action, final_severity


def evaluate_event(event: DlpEventInput) -> DlpDecision:
    classification = classify_content(f"{event.subject}\n{event.content}")
    declared = event.declared_classification
    detected = classification.detected_level
    effective = _max_classification(declared, detected)
    policies = evaluate_policies(
        declared=declared,
        detected=detected,
        effective=effective,
        destination_category=event.destination_category,
        evidence_counts=classification.evidence_count_by_type,
    )
    score = min(100, sum(policy.score_delta for policy in policies) + _context_score(event, effective))

    return DlpDecision(
        action=final_action(policies),
        severity=final_severity(policies),
        score=score,
        effective_classification=effective,
        detected_classification=detected,
        declared_classification=declared,
        evidence=classification.evidence,
        policies=policies,
        rationale=[
            f"Classificacao declarada: {declared.value}.",
            f"Classificacao detectada: {detected.value}.",
            f"Classificacao efetiva: {effective.value}.",
            *classification.rationale,
            *[policy.reason for policy in policies],
        ],
    )


def _max_classification(
    declared: ClassificationLevel,
    detected: ClassificationLevel,
) -> ClassificationLevel:
    return max((declared, detected), key=LEVEL_ORDER.index)


def _context_score(event: DlpEventInput, effective: ClassificationLevel) -> int:
    score = 0
    if event.destination_category != DestinationCategory.INTERNAL:
        score += 10
    if event.channel == Channel.CHAT:
        score += 5
    if effective == ClassificationLevel.RESTRICTED:
        score += 20
    return score
