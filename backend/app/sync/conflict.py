from typing import Dict, Any, Optional, List
from datetime import datetime
from enum import Enum

from sqlmodel import SQLModel, Field, select, Session
from app.database.database import get_session


class ConflictStatus(str, Enum):
    PENDING = "pending"
    RESOLVED = "resolved"
    IGNORED = "ignored"


class ConflictResolution(str, Enum):
    LOCAL_WINS = "local_wins"
    REMOTE_WINS = "remote_wins"
    MANUAL = "manual"


class Conflict(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    memory_id: str = Field(index=True)
    local_version: int
    remote_version: int
    local_payload: str
    remote_payload: str
    status: str = Field(default=ConflictStatus.PENDING.value, index=True)
    resolution: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None


def create_conflict(
    memory_id: str,
    local_version: int,
    remote_version: int,
    local_payload: Dict[str, Any],
    remote_payload: Dict[str, Any],
) -> int:
    import json
    session = get_session()
    
    existing = session.exec(
        select(Conflict).where(
            Conflict.memory_id == memory_id,
            Conflict.status == ConflictStatus.PENDING.value
        )
    ).first()
    
    if existing:
        existing.local_version = local_version
        existing.remote_version = remote_version
        existing.local_payload = json.dumps(local_payload)
        existing.remote_payload = json.dumps(remote_payload)
        session.commit()
        return existing.id
    
    conflict = Conflict(
        memory_id=memory_id,
        local_version=local_version,
        remote_version=remote_version,
        local_payload=json.dumps(local_payload),
        remote_payload=json.dumps(remote_payload),
    )
    session.add(conflict)
    session.commit()
    session.refresh(conflict)
    
    return conflict.id


def get_pending_conflicts() -> List[Conflict]:
    session = get_session()
    return session.exec(
        select(Conflict).where(Conflict.status == ConflictStatus.PENDING.value)
    ).all()


def get_conflict(conflict_id: int) -> Optional[Conflict]:
    session = get_session()
    return session.get(Conflict, conflict_id)


def resolve_conflict(conflict_id: int, resolution: ConflictResolution) -> bool:
    session = get_session()
    conflict = session.get(Conflict, conflict_id)
    
    if not conflict or conflict.status != ConflictStatus.PENDING.value:
        return False
    
    conflict.status = ConflictStatus.RESOLVED.value
    conflict.resolution = resolution.value
    conflict.resolved_at = datetime.utcnow()
    session.commit()
    
    return True


def get_conflict_stats() -> Dict[str, Any]:
    session = get_session()
    all_conflicts = session.exec(select(Conflict)).all()
    
    stats = {
        "total": len(all_conflicts),
        "pending": 0,
        "resolved": 0,
        "ignored": 0,
    }
    
    for conflict in all_conflicts:
        stats[conflict.status] = stats.get(conflict.status, 0) + 1
    
    return stats