from typing import Dict, Any, Optional
from datetime import datetime
import hashlib
import json

from app.database.database import get_session
from sqlmodel import SQLModel, Field, select


class DecisionCacheEntry(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    cache_key: str = Field(index=True, unique=True)
    eval_type: str
    decision: str
    reason: str
    confidence: float
    source: str
    model_version: str
    context_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    hits: int = Field(default=0)


def generate_cache_key(eval_type: str, data: Dict[str, Any]) -> str:
    content = json.dumps({"type": eval_type, "data": data}, sort_keys=True)
    return hashlib.sha256(content.encode()).hexdigest()[:32]


def cache_decision(
    eval_type: str,
    data: Dict[str, Any],
    decision: Dict[str, Any],
    model_version: str = "1.0.0",
) -> str:
    cache_key = generate_cache_key(eval_type, data)
    context_hash = hashlib.sha256(json.dumps(data, sort_keys=True).encode()).hexdigest()[:16]
    
    session = get_session()
    
    existing = session.exec(
        select(DecisionCacheEntry).where(DecisionCacheEntry.cache_key == cache_key)
    ).first()
    
    if existing:
        existing.hits += 1
        existing.decision = decision.get("decision", "")
        existing.reason = json.dumps(decision.get("reason", []))
        existing.confidence = decision.get("confidence", 0.0)
        existing.source = decision.get("source", "")
        existing.model_version = model_version
    else:
        entry = DecisionCacheEntry(
            cache_key=cache_key,
            eval_type=eval_type,
            decision=decision.get("decision", ""),
            reason=json.dumps(decision.get("reason", [])),
            confidence=decision.get("confidence", 0.0),
            source=decision.get("source", ""),
            model_version=model_version,
            context_hash=context_hash,
        )
        session.add(entry)
    
    session.commit()
    return cache_key


def get_cached_decision(eval_type: str, data: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    cache_key = generate_cache_key(eval_type, data)
    
    session = get_session()
    entry = session.exec(
        select(DecisionCacheEntry).where(DecisionCacheEntry.cache_key == cache_key)
    ).first()
    
    if entry:
        entry.hits += 1
        session.commit()
        return {
            "decision": entry.decision,
            "reason": json.loads(entry.reason) if entry.reason else [],
            "confidence": entry.confidence,
            "source": entry.source,
            "model_version": entry.model_version,
            "cached": True,
            "cache_hits": entry.hits,
        }
    
    return None


def get_cache_stats() -> Dict[str, Any]:
    session = get_session()
    total = session.exec(select(DecisionCacheEntry)).all()
    hits = sum(e.hits for e in total)
    
    by_source = {}
    for entry in total:
        by_source[entry.source] = by_source.get(entry.source, 0) + 1
    
    return {
        "total_entries": len(total),
        "total_hits": hits,
        "by_source": by_source,
    }