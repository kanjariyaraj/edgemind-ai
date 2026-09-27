import asyncio
import logging
from typing import Optional
from datetime import datetime

from app.sync.queue import (
    get_pending_operations,
    mark_processing,
    mark_synced,
    mark_failed,
    mark_conflict,
    SyncStatus,
)
from app.sync.reconciliation import push_memory, update_memory, delete_memory, check_connectivity
from app.config import settings

logger = logging.getLogger(__name__)


class SyncWorker:
    def __init__(self):
        self.running = False
        self.task: Optional[asyncio.Task] = None
        self.base_delay = settings.sync_retry_base_delay
        self.max_attempts = settings.sync_retry_max_attempts
    
    async def start(self):
        if self.running:
            return
        self.running = True
        self.task = asyncio.create_task(self._run_loop())
        logger.info("Sync worker started")
    
    async def stop(self):
        self.running = False
        if self.task:
            self.task.cancel()
            try:
                await self.task
            except asyncio.CancelledError:
                pass
        logger.info("Sync worker stopped")
    
    async def _run_loop(self):
        while self.running:
            try:
                await self._process_queue()
            except Exception as e:
                logger.error(f"Sync worker error: {e}")
            
            await asyncio.sleep(5)
    
    async def _process_queue(self):
        if not await check_connectivity():
            return
        
        operations = get_pending_operations(limit=10)
        
        for op in operations:
            if not self.running:
                break
            
            if not mark_processing(op.operation_id):
                continue
            
            try:
                await self._process_operation(op)
            except Exception as e:
                logger.error(f"Failed to process operation {op.operation_id}: {e}")
                mark_failed(op.operation_id, str(e))
    
    async def _process_operation(self, op):
        import json
        payload = json.loads(op.payload)
        
        if op.operation == "CREATE":
            result = await push_memory(op.memory_id, payload)
        elif op.operation == "UPDATE":
            result = await update_memory(op.memory_id, payload)
        elif op.operation == "DELETE":
            result = await delete_memory(op.memory_id)
        else:
            raise ValueError(f"Unknown operation: {op.operation}")
        
        if result.get("conflict"):
            mark_conflict(op.operation_id, result)
        else:
            mark_synced(op.operation_id)


sync_worker = SyncWorker()