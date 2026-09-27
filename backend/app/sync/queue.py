from typing import Dict, Any, Optional, List
from datetime import datetime
from enum import Enum
import uuid

from sqlmodel import SQLModel, Field, select, Session
from app.database.database import get_session


class SyncOperation(str, Enum):
    CREATE = "CREATE"
    UPDATE = "UPDATE"
    DELETE = "DELETE"


class SyncStatus(str, Enum):
    PENDING = "PENDING"
    PROCESSING = "PROCESSING"
    SYNCED = "SYNCED"
    FAILED = "FAILED"
    CONFLICT = "CONFLICT"


class SyncQueueEntry(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    operation_id: str = Field(default_factory=lambda: str(uuid.uuid4()), index=True)
    memory_id: str = Field(index=True)
    operation: str
    payload: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    attempts: int = Field(default=0)
    max_attempts: int = Field(default=5)
    last_error: Optional[str] = None
    status: str = Field(default=SyncStatus.PENDING.value, index=True)
    processed_at: Optional[datetime] = None


def queue_sync_operation(
    memory_id: str,
    operation: str,
    payload: Dict[str, Any],
    max_attempts: Optional[int] = None,
) -> str:
    session = get_session()
    
    existing = session.exec(
        select(SyncQueueEntry).where(
            SyncQueueEntry.memory_id == memory_id,
            SyncQueueEntry.status.in_([SyncStatus.PENDING.value, SyncStatus.PROCESSING.value])
        )
    ).first()
    
    if existing:
        existing.operation = operation
        existing.payload = str(payload)
        existing.attempts = 0
        existing.last_error = None
        existing.status = SyncStatus.PENDING.value
        session.commit()
        return existing.operation_id
    
    entry = SyncQueueEntry(
        memory_id=memory_id,
        operation=operation,
        payload=str(payload),
        max_attempts=max_attempts or 5,
        status=SyncStatus.PENDING.value,
    )
    session.add(entry)
    session.commit()
    session.refresh(entry)
    
    return entry.operation_id


def get_pending_operations(limit: int = 100) -> List[SyncQueueEntry]:
    session = get_session()
    return session.exec(
        select(SyncQueueEntry)
        .where(SyncQueueEntry.status == SyncStatus.PENDING.value)
        .order_by(SyncQueueEntry.created_at)
        .limit(limit)
    ).all()


def get_failed_operations(limit: int = 100) -> List[SyncQueueEntry]:
    session = get_session()
    return session.exec(
        select(SyncQueueEntry)
        .where(SyncQueueEntry.status == SyncStatus.FAILED.value)
        .order_by(SyncQueueEntry.created_at)
        .limit(limit)
    ).all()


def mark_processing(operation_id: str) -> bool:
    session = get_session()
    entry = session.exec(
        select(SyncQueueEntry).where(SyncQueueEntry.operation_id == operation_id)
    ).first()
    
    if entry:
        entry.status = SyncStatus.PROCESSING.value
        session.commit()
        return True
    return False


def mark_synced(operation_id: str) -> bool:
    session = get_session()
    entry = session.exec(
        select(SyncQueueEntry).where(SyncQueueEntry.operation_id == operation_id)
    ).first()
    
    if entry:
        entry.status = SyncStatus.SYNCED.value
        entry.processed_at = datetime.utcnow()
        session.commit()
        return True
    return False


def mark_failed(operation_id: str, error: str) -> bool:
    session = get_session()
    entry = session.exec(
        select(SyncQueueEntry).where(SyncQueueEntry.operation_id == operation_id)
    ).first()
    
    if entry:
        entry.attempts += 1
        entry.last_error = error
        if entry.attempts >= entry.max_attempts:
            entry.status = SyncStatus.FAILED.value
        else:
            entry.status = SyncStatus.PENDING.value
        session.commit()
        return True
    return False


def mark_conflict(operation_id: str, conflict_data: Dict[str, Any]) -> bool:
    session = get_session()
    entry = session.exec(
        select(SyncQueueEntry).where(SyncQueueEntry.operation_id == operation_id)
    ).first()
    
    if entry:
        entry.status = SyncStatus.CONFLICT.value
        entry.payload = str(conflict_data)
        session.commit()
        return True
    return False


def retry_operation(operation_id: str) -> bool:
    session = get_session()
    entry = session.exec(
        select(SyncQueueEntry).where(SyncQueueEntry.operation_id == operation_id)
    ).first()
    
    if entry and entry.status in [SyncStatus.FAILED.value, SyncStatus.CONFLICT.value]:
        entry.status = SyncStatus.PENDING.value
        entry.attempts = 0
        entry.last_error = None
        session.commit()
        return True
    return False


def get_sync_queue_stats() -> Dict[str, Any]:
    session = get_session()
    all_entries = session.exec(select(SyncQueueEntry)).all()
    
    stats = {
        "total": len(all_entries),
        "pending": 0,
        "processing": 0,
        "synced": 0,
        "failed": 0,
        "conflict": 0,
    }
    
    for entry in all_entries:
        stats[entry.status.lower()] = stats.get(entry.status.lower(), 0) + 1
    
    return stats