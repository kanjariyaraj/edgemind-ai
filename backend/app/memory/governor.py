from typing import Dict, Any, List
from datetime import datetime

from app.memory.decay import calculate_effective_importance
from app.memory.compression import detect_duplicates
from app.config import settings


def evaluate_memory(memory: Dict[str, Any]) -> Dict[str, Any]:
    importance = memory.get("importance", 0.5)
    confidence = memory.get("confidence", 0.9)
    sensitivity = memory.get("sensitivity", "internal")
    created_at = datetime.fromisoformat(memory.get("created_at", datetime.utcnow().isoformat()))
    access_count = memory.get("access_count", 0)
    version = memory.get("version", 1)
    sync_status = memory.get("sync_status", "local")
    
    effective_importance = calculate_effective_importance(
        base_importance=importance,
        created_at=created_at,
        access_count=access_count,
        confidence=confidence,
    )
    
    reasons = []
    decision = "KEEP_LOCAL"
    
    if sensitivity == "private":
        decision = "KEEP_LOCAL"
        reasons.append("memory sensitivity=PRIVATE, cloud sync prohibited")
    elif effective_importance >= 0.7:
        decision = "SYNC"
        reasons.append(f"high effective importance ({effective_importance:.2f})")
    elif effective_importance <= 0.2 and access_count == 0:
        decision = "DISCARD"
        reasons.append(f"low effective importance ({effective_importance:.2f}) and never accessed")
    elif effective_importance <= 0.4:
        decision = "COMPRESS"
        reasons.append(f"low effective importance ({effective_importance:.2f}), candidate for compression")
    else:
        decision = "KEEP_LOCAL"
        reasons.append(f"moderate importance ({effective_importance:.2f}), retained locally")
    
    return {
        "decision": decision,
        "reason": reasons,
        "effective_importance": effective_importance,
        "signals": {
            "importance": importance,
            "confidence": confidence,
            "sensitivity": sensitivity,
            "recency_days": (datetime.utcnow() - created_at).days,
            "access_count": access_count,
            "version": version,
        },
    }


def evaluate_batch(memories: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    results = []
    for memory in memories:
        decision = evaluate_memory(memory)
        results.append({**memory, "governor_decision": decision})
    return results