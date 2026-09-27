from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class ConflictLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    memory_id: str = Field(index=True)
    conflict_type: str
    local_version: int
    remote_version: int
    resolution: Optional[str] = None
    status: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    resolved_at: Optional[datetime] = None