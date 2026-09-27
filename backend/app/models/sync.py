from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class SyncLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    operation_id: str = Field(index=True)
    memory_id: str = Field(index=True)
    operation: str
    status: str
    attempts: int
    error: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    completed_at: Optional[datetime] = None