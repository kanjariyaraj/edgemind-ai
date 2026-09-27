from typing import Dict, Any
from datetime import datetime
from enum import Enum

from app.config import settings
from app.sync.cloud_provider import get_cloud_provider


class ConnectivityStatus(str, Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    DEGRADED = "degraded"


_system_status = {
    "connectivity": ConnectivityStatus.OFFLINE,
    "last_check": None,
    "cloud_available": False,
    "local_qdrant_available": True,
    "embeddings_available": True,
}


async def check_connectivity() -> bool:
    provider = get_cloud_provider()
    try:
        result = await provider.check_connectivity()
        _system_status["cloud_available"] = result
        _system_status["last_check"] = datetime.utcnow().isoformat()
        
        if result:
            _system_status["connectivity"] = ConnectivityStatus.ONLINE
        else:
            _system_status["connectivity"] = ConnectivityStatus.OFFLINE
        
        return result
    except Exception:
        _system_status["cloud_available"] = False
        _system_status["connectivity"] = ConnectivityStatus.OFFLINE
        return False


def get_system_status() -> Dict[str, Any]:
    return {
        "connectivity": _system_status["connectivity"],
        "last_check": _system_status["last_check"],
        "cloud_available": _system_status["cloud_available"],
        "local_qdrant_available": _system_status["local_qdrant_available"],
        "embeddings_available": _system_status["embeddings_available"],
        "cloud_sync_enabled": settings.cloud_sync_enabled,
        "jev_enabled": settings.jev_enabled,
    }


def set_connectivity(status: ConnectivityStatus):
    _system_status["connectivity"] = status
    if status == ConnectivityStatus.ONLINE:
        _system_status["cloud_available"] = True
    elif status == ConnectivityStatus.OFFLINE:
        _system_status["cloud_available"] = False