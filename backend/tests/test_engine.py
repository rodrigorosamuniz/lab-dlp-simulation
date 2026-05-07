from app.dlp.engine import evaluate_event
from app.dlp.models import (
    Channel,
    ClassificationLevel,
    DestinationCategory,
    DlpAction,
    DlpEventInput,
    Severity,
)


def make_event(**overrides):
    values = {
        "channel": Channel.EMAIL,
        "user": "ana@example.com",
        "department": "Comunicacao",
        "destination": "parceiro.aprovado@example.org",
        "destination_category": DestinationCategory.APPROVED_EXTERNAL,
        "declared_classification": ClassificationLevel.PUBLIC,
        "subject": "Comunicado publico",
        "content": "[PUBLICO] Release aprovado para imprensa",
    }
    values.update(overrides)
    return DlpEventInput(**values)


def policy_names(decision):
    return {policy.name for policy in decision.policies}


def test_allows_public_content_without_sensitive_evidence():
    decision = evaluate_event(make_event())

    assert decision.action == DlpAction.ALLOW
    assert decision.severity == Severity.LOW
    assert decision.effective_classification == ClassificationLevel.PUBLIC


def test_blocks_confidential_content_to_personal_destination():
    decision = evaluate_event(
        make_event(
            destination="destino@gmail.com",
            destination_category=DestinationCategory.PERSONAL,
            declared_classification=ClassificationLevel.CONFIDENTIAL,
            content="[CONFIDENCIAL] Dados de salary e bonus do time",
        )
    )

    assert decision.action == DlpAction.BLOCK
    assert decision.severity == Severity.HIGH
    assert "Confidencial para destino pessoal" in policy_names(decision)


def test_blocks_restricted_secret_to_public_service():
    decision = evaluate_event(
        make_event(
            channel=Channel.CHAT,
            destination="IA publica",
            destination_category=DestinationCategory.PUBLIC_SERVICE,
            content="token = abcdefghijklmnop",
        )
    )

    assert decision.action == DlpAction.BLOCK
    assert decision.severity == Severity.CRITICAL
    assert decision.effective_classification == ClassificationLevel.RESTRICTED


def test_warns_on_inconsistent_public_label_with_sensitive_content():
    decision = evaluate_event(
        make_event(
            declared_classification=ClassificationLevel.PUBLIC,
            content="[PUBLICO] CPF 123.456.789-09",
        )
    )

    assert decision.action in {DlpAction.WARN, DlpAction.QUARANTINE}
    assert "Rotulo inconsistente" in policy_names(decision)
