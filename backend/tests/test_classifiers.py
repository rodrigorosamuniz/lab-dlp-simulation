from app.dlp.classifiers import classify_content
from app.dlp.models import ClassificationLevel, EvidenceType


def evidence_types(result):
    return {item.type for item in result.evidence}


def test_detects_restricted_credentials_and_masks_value():
    result = classify_content("api_key = sk_live_1234567890abcdef")

    assert result.detected_level == ClassificationLevel.RESTRICTED
    assert EvidenceType.SECRET in evidence_types(result)
    assert result.evidence[0].masked_value.startswith("api_key")
    assert "abcdef" not in result.evidence[0].masked_value


def test_detects_confidential_salary_terms():
    result = classify_content("Planilha de salarios e folha de pagamento do RH")

    assert result.detected_level == ClassificationLevel.CONFIDENTIAL
    assert EvidenceType.SALARY in evidence_types(result)


def test_public_marker_without_sensitive_data_stays_public():
    result = classify_content("[PUBLICO] Release aprovado para imprensa")

    assert result.detected_level == ClassificationLevel.PUBLIC
    assert result.declared_marker == ClassificationLevel.PUBLIC
    assert result.evidence == []


def test_multiple_cpfs_raise_restricted_level():
    result = classify_content("Clientes: 123.456.789-09, 987.654.321-00, 111.222.333-44")

    assert result.detected_level == ClassificationLevel.RESTRICTED
    assert EvidenceType.CPF in evidence_types(result)
    assert result.evidence_count_by_type[EvidenceType.CPF] == 3
