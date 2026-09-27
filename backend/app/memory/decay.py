from datetime import datetime, timedelta
from typing import Dict, Any


def calculate_recency_factor(created_at: datetime, half_life_days: float = 30.0) -> float:
    age_days = (datetime.utcnow() - created_at).total_seconds() / 86400
    return 0.5 ** (age_days / half_life_days)


def calculate_access_bonus(access_count: int, max_bonus: float = 0.2) -> float:
    import math
    return min(max_bonus * math.log1p(access_count), max_bonus)


def calculate_confidence_factor(confidence: float) -> float:
    return confidence


def calculate_effective_importance(
    base_importance: float,
    created_at: datetime,
    access_count: int = 0,
    confidence: float = 1.0,
    half_life_days: float = 30.0,
) -> float:
    recency_factor = calculate_recency_factor(created_at, half_life_days)
    access_bonus = calculate_access_bonus(access_count)
    confidence_factor = calculate_confidence_factor(confidence)
    
    effective = base_importance * recency_factor * confidence_factor + access_bonus
    
    return min(max(effective, 0.0), 1.0)