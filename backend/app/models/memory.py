from datetime import datetime
from typing import Optional, Dict, Any
from sqlmodel import SQLModel, Field


class MemoryMetadata(SQLModel, table=True):
    id: str = Field(primary_key=True)
    text: str
    source: str
    device_id: str = Field(index=True)
    entity_id: Optional[str] = Field(default=None, index=True)
    timestamp: datetime
    created_at: datetime
    updated_at: datetime
    importance: float
    confidence: float
    sensitivity: str
    version: int = Field(default=1)
    sync_status: str
    memory_state: str
    extra_metadata: str = Field(default="{}")
    
    def get_metadata(self) -> Dict[str, Any]:
        import json
        return json.loads(self.extra_metadata) if self.extra_metadata else {}
    
    def set_metadata(self, data: Dict[str, Any]):
        import json
        self.extra_metadata = json.dumps(data)