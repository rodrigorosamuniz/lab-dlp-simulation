import re
from collections import Counter
from collections.abc import Callable

from app.dlp.models import ClassificationLevel, ClassificationResult, Evidence, EvidenceType

CPF_RE = re.compile(r"\b\d{3}\.\d{3}\.\d{3}-\d{2}\b")
CARD_RE = re.compile(r"\b(?:\d[ -]*?){13,16}\b")
EMAIL_RE = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b")
SECRET_RE = re.compile(
    r"\b(?:api[_-]?key|secret|password|token)\s*[:=]\s*['\"]?[A-Za-z0-9_\-]{8,}",
    re.IGNORECASE,
)
SALARY_RE = re.compile(
    r"\b(salario|salarios|folha de pagamento|remuneracao|bonus)\b",
    re.IGNORECASE,
)
LABELS = {
    "[PUBLICO]": ClassificationLevel.PUBLIC,
    "[INTERNO]": ClassificationLevel.INTERNAL,
    "[CONFIDENCIAL]": ClassificationLevel.CONFIDENTIAL,
    "[RESTRITO]": ClassificationLevel.RESTRICTED,
}
LEVEL_ORDER = [
    ClassificationLevel.PUBLIC,
    ClassificationLevel.INTERNAL,
    ClassificationLevel.CONFIDENTIAL,
    ClassificationLevel.RESTRICTED,
]


def classify_content(content: str) -> ClassificationResult:
    evidence: list[Evidence] = []
    rationale: list[str] = []
    declared_marker = _find_declared_marker(content)

    evidence.extend(_find_all(CPF_RE, content, EvidenceType.CPF, "CPF", 35, _mask_cpf))
    evidence.extend(_find_all(CARD_RE, content, EvidenceType.CREDIT_CARD, "Cartao", 45, _mask_card))
    evidence.extend(_find_all(EMAIL_RE, content, EvidenceType.EMAIL, "Email", 10, _mask_email))
    evidence.extend(_find_all(SECRET_RE, content, EvidenceType.SECRET, "Credencial", 60, _mask_secret))
    evidence.extend(_find_all(SALARY_RE, content, EvidenceType.SALARY, "Salario", 25, _mask_term))

    counts = Counter(item.type for item in evidence)
    detected_level = _level_from_evidence(counts)

    if declared_marker is not None:
        rationale.append(f"Rotulo declarado encontrado: {declared_marker.value}.")
        detected_level = _max_level(detected_level, declared_marker)

    if counts:
        rationale.append("Conteudo sensivel detectado por regras deterministicas.")
    elif declared_marker is None:
        rationale.append("Nenhuma evidencia sensivel detectada.")

    return ClassificationResult(
        declared_marker=declared_marker,
        detected_level=detected_level,
        evidence=evidence,
        evidence_count_by_type=dict(counts),
        rationale=rationale,
    )


def _find_declared_marker(content: str) -> ClassificationLevel | None:
    upper_content = content.upper()
    for marker, level in LABELS.items():
        if marker in upper_content:
            return level
    return None


def _find_all(
    pattern: re.Pattern[str],
    content: str,
    kind: EvidenceType,
    label: str,
    weight: int,
    masker: Callable[[str], str],
) -> list[Evidence]:
    values = [match if isinstance(match, str) else match[0] for match in pattern.findall(content)]
    if not values:
        return []
    return [
        Evidence(
            type=kind,
            label=label,
            masked_value=masker(values[0]),
            count=len(values),
            weight=weight,
        )
    ]


def _level_from_evidence(counts: Counter[EvidenceType]) -> ClassificationLevel:
    if counts[EvidenceType.SECRET] or counts[EvidenceType.CREDIT_CARD] or counts[EvidenceType.CPF] >= 3:
        return ClassificationLevel.RESTRICTED
    if counts[EvidenceType.CPF] or counts[EvidenceType.SALARY]:
        return ClassificationLevel.CONFIDENTIAL
    if counts[EvidenceType.EMAIL] >= 5:
        return ClassificationLevel.CONFIDENTIAL
    if counts[EvidenceType.EMAIL]:
        return ClassificationLevel.INTERNAL
    return ClassificationLevel.PUBLIC


def _max_level(left: ClassificationLevel, right: ClassificationLevel) -> ClassificationLevel:
    return left if LEVEL_ORDER.index(left) >= LEVEL_ORDER.index(right) else right


def _mask_cpf(value: str) -> str:
    return f"{value[:3]}.***.***-{value[-2:]}"


def _mask_card(value: str) -> str:
    digits = re.sub(r"\D", "", value)
    return f"**** **** **** {digits[-4:]}"


def _mask_email(value: str) -> str:
    name, domain = value.split("@", 1)
    return f"{name[:2]}***@{domain}"


def _mask_secret(value: str) -> str:
    key = re.split(r"[:=]", value, maxsplit=1)[0].strip()
    return f"{key}=********"


def _mask_term(value: str) -> str:
    return value.lower()
