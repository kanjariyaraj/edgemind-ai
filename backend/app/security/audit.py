import logging
from datetime import datetime
from typing import Optional, Dict, Any

from app.database.database import get_session
from sqlmodel import SQLModel, Field


class AuditLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    event_type: str
    memory_id: Optional[str] = None
    device_id: Optional[str] = None
    user_id: Optional[str] = None
    details: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


audit_logger = logging.getLogger("audit")


def log_event(
    event_type: str,
    memory_id: Optional[str] = None,
    device_id: Optional[str] = None,
    user_id: Optional[str] = None,
    details: Optional[Dict[str, Any]] = None,
    ip_address: Optional[str] = None,
    user_agent: Optional[str] = None,
):
    import json
    session = get_session()
    
    log_entry = AuditLog(
        event_type=event_type,
        memory_id=memory_id,
        device_id=device_id,
        user_id=user_id,
        details=json.dumps(details or {}),
        ip_address=ip_address,
        user_agent=user_agent,
    )
    session.add(log_entry)
    session.commit()
    
    audit_logger.info(
        f"AUDIT: {event_type} | memory_id={memory_id} | device_id={device_id} | "
        f"user_id={user_id} | details={json.dumps(details or {})}"
    )


def log_memory_created(memory_id: str, device_id: str, sensitivity: str):
    log_event(
        "memory_created",
        memory_id=memory_id,
        device_id=device_id,
        details={"sensitivity": sensitivity},
    )


def log_memory_accessed(memory_id: str, device_id: str, query: str):
    log_event(
        "memory_accessed",
        memory_id=memory_id,
        device_id=device_id,
        details={"query": query},
    )


def log_memory_searched(query: str, device_id: str, result_count: int):
    log_event(
        "memory_searched",
        device_id=device_id,
        details={"query": query, "result_count": result_count},
    )


def log_decision_made(memory_id: str, decision: str, reason: list, source: str):
    log_event(
        "decision_made",
        memory_id=memory_id,
        details={"decision": decision, "reason": reason, "source": source},
    )


def log_sync_queued(memory_id: str, operation: str):
    log_event(
        "sync_queued",
        memory_id=memory_id,
        details={"operation": operation},
    )


def log_sync_completed(memory_id: str, operation: str):
    log_event(
        "sync_completed",
        memory_id=memory_id,
        details={"operation": operation},
    )


def log_sync_failed(memory_id: str, operation: str, error: str):
    log_event(
        "sync_failed",
        memory_id=memory_id,
        details={"operation": operation, "error": error},
    )


def log_conflict_detected(memory_id: str, local_version: int, remote_version: int):
    log_event(
        "conflict_detected",
        memory_id=memory_id,
        details={"local_version": local_version, "remote_version": remote_version},
    )


def log_conflict_resolved(memory_id: str, resolution: str):
    log_event(
        "conflict_resolved",
        memory_id=memory_id,
        details={"resolution": resolution},
    )