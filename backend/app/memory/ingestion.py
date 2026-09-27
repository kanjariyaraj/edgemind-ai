from typing import List, Dict, Any, Optional
from datetime import datetime
import uuid

from app.embeddings.service import generate_embedding
from app.qdrant.points import upsert_memory
from app.database.database import get_session
from app.memory.importance import calculate_importance
from app.memory.governor import evaluate_memory
from app.sync.queue import queue_sync_operation
from app.config import settings


def ingest_memory(
    text: str,
    source: str,
    device_id: str,
    entity_id: Optional[str] = None,
    sensitivity: str = "internal",
    metadata: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    memory_id = str(uuid.uuid4())
    now = datetime.utcnow()
    
    vector = generate_embedding(text)
    
    importance = calculate_importance(text, source, sensitivity)
    
    payload = {
        "id": memory_id,
        "text": text,
        "source": source,
        "device_id": device_id,
        "entity_id": entity_id,
        "timestamp": now.isoformat(),
        "created_at": now.isoformat(),
        "updated_at": now.isoformat(),
        "importance": importance,
        "confidence": 0.9,
        "sensitivity": sensitivity,
        "version": 1,
        "sync_status": "local",
        "memory_state": "active",
        **(metadata or {}),
    }
    
    upsert_memory(memory_id, vector, payload)
    
    session = get_session()
    from app.models.memory import MemoryMetadata
    memory_meta = MemoryMetadata(
        id=memory_id,
        text=text,
        source=source,
        device_id=device_id,
        entity_id=entity_id,
        timestamp=now,
        created_at=now,
        updated_at=now,
        importance=importance,
        confidence=0.9,
        sensitivity=sensitivity,
        version=1,
        sync_status="local",
        memory_state="active",
        extra_metadata=metadata or {},
    )
    session.add(memory_meta)
    session.commit()
    
    decision = evaluate_memory(payload)
    
    if decision["decision"] in ["SYNC", "KEEP_LOCAL"] and settings.cloud_sync_enabled:
        queue_sync_operation(memory_id, "CREATE", payload)
    
    return {
        "memory_id": memory_id,
        "importance": importance,
        "sync_status": payload["sync_status"],
        "decision": decision["decision"],
        "reason": decision["reason"],
    }