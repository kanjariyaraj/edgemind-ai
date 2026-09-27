from typing import Optional, List
from sqlmodel import Session, select
from datetime import datetime

from app.database.database import get_session


class BaseRepository:
    def __init__(self, session: Optional[Session] = None):
        self.session = session or get_session()
        self._owns_session = session is None
    
    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if self._owns_session:
            self.session.close()
    
    def commit(self):
        self.session.commit()
    
    def rollback(self):
        self.session.rollback()


class MemoryRepository(BaseRepository):
    pass


class SyncQueueRepository(BaseRepository):
    pass


class ConflictRepository(BaseRepository):
    pass


class DecisionCacheRepository(BaseRepository):
    pass