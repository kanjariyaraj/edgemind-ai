from typing import Dict, Any, Optional, List
import httpx

from app.config import settings
from app.sync.cloud_provider import get_cloud_provider


async def check_connectivity() -> bool:
    provider = get_cloud_provider()
    return await provider.check_connectivity()


async def push_memory(memory_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    provider = get_cloud_provider()
    return await provider.push_memory(memory_id, payload)


async def update_memory(memory_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
    provider = get_cloud_provider()
    return await provider.update_memory(memory_id, payload)


async def delete_memory(memory_id: str) -> Dict[str, Any]:
    provider = get_cloud_provider()
    return await provider.delete_memory(memory_id)


async def pull_changes(since: Optional[str] = None) -> List[Dict[str, Any]]:
    provider = get_cloud_provider()
    return await provider.pull_changes(since)


async def reconcile_memory(local: Dict[str, Any], remote: Dict[str, Any]) -> Dict[str, Any]:
    local_version = local.get("version", 1)
    remote_version = remote.get("version", 1)
    
    if local_version > remote_version:
        return {"action": "push", "resolution": "LOCAL_WINS"}
    elif remote_version > local_version:
        return {"action": "pull", "resolution": "REMOTE_WINS"}
    else:
        return {"action": "none", "resolution": "NO_CHANGE"}