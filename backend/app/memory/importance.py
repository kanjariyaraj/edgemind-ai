from typing import Dict, Any


def calculate_importance(text: str, source: str, sensitivity: str) -> float:
    base_importance = 0.5
    
    source_weights = {
        "technician_note": 0.8,
        "sensor_reading": 0.6,
        "maintenance_log": 0.7,
        "fault_event": 0.9,
        "user_input": 0.5,
        "system_log": 0.4,
    }
    
    sensitivity_weights = {
        "public": 0.3,
        "internal": 0.6,
        "private": 0.8,
    }
    
    source_boost = source_weights.get(source, 0.5)
    sensitivity_boost = sensitivity_weights.get(sensitivity, 0.5)
    
    keyword_boost = 0.0
    high_value_keywords = [
        "critical", "failure", "error", "fault", "exceeded", "threshold",
        "emergency", "urgent", "alert", "warning", "anomaly", "overheat",
    ]
    text_lower = text.lower()
    for keyword in high_value_keywords:
        if keyword in text_lower:
            keyword_boost += 0.1
    
    importance = base_importance * 0.3 + source_boost * 0.4 + sensitivity_boost * 0.2 + min(keyword_boost, 0.3)
    
    return min(max(importance, 0.0), 1.0)