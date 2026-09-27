from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field


class DecisionLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    memory_id: str = Field(index=True)
    eval_type: str
    decision: str
    reason: str
    confidence: float
    source: str
    mode: str
    created_at: datetime = Field(default_factory=datetime.utcnow)