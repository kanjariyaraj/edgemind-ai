from abc import ABC, abstractmethod
from typing import Dict, Any, Optional, List
import httpx


class CloudSyncProvider(ABC):
    @abstractmethod
    async def push_memory(self, memory_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        pass
    
    @abstractmethod
    async def update_memory(self, memory_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        pass
    
    @abstractmethod
    async def delete_memory(self, memory_id: str) -> Dict[str, Any]:
        pass
    
    @abstractmethod
    async def pull_changes(self, since: Optional[str] = None) -> List[Dict[str, Any]]:
        pass
    
    @abstractmethod
    async def check_connectivity(self) -> bool:
        pass


class QdrantCloudSyncProvider(CloudSyncProvider):
    def __init__(self, url: str, api_key: Optional[str] = None):
        self.url = url.rstrip("/")
        self.api_key = api_key
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def push_memory(self, memory_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        try:
            response = await self.client.post(
                f"{self.url}/collections/memories/points",
                headers={"Authorization": f"Bearer {self.api_key}"} if self.api_key else {},
                json={"points": [{"id": memory_id, **payload}]},
            )
            response.raise_for_status()
            return {"success": True}
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 409:
                return {"success": False, "conflict": True, "error": "Version conflict"}
            return {"success": False, "error": str(e)}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def update_memory(self, memory_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        try:
            response = await self.client.put(
                f"{self.url}/collections/memories/points/{memory_id}",
                headers={"Authorization": f"Bearer {self.api_key}"} if self.api_key else {},
                json=payload,
            )
            response.raise_for_status()
            return {"success": True}
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 409:
                return {"success": False, "conflict": True, "error": "Version conflict"}
            return {"success": False, "error": str(e)}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def delete_memory(self, memory_id: str) -> Dict[str, Any]:
        try:
            response = await self.client.delete(
                f"{self.url}/collections/memories/points/{memory_id}",
                headers={"Authorization": f"Bearer {self.api_key}"} if self.api_key else {},
            )
            response.raise_for_status()
            return {"success": True}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    async def pull_changes(self, since: Optional[str] = None) -> List[Dict[str, Any]]:
        try:
            params = {}
            if since:
                params["since"] = since
            response = await self.client.get(
                f"{self.url}/collections/memories/points",
                headers={"Authorization": f"Bearer {self.api_key}"} if self.api_key else {},
                params=params,
            )
            response.raise_for_status()
            return response.json().get("points", [])
        except Exception as e:
            return []
    
    async def check_connectivity(self) -> bool:
        try:
            response = await self.client.get(f"{self.url}/health", timeout=5.0)
            return response.status_code == 200
        except Exception:
            return False
    
    async def close(self):
        await self.client.aclose()


class MockCloudProvider(CloudSyncProvider):
    def __init__(self):
        self.memories = {}
        self.connected = True
    
    async def push_memory(self, memory_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        if memory_id in self.memories:
            return {"success": False, "conflict": True, "error": "Already exists"}
        self.memories[memory_id] = payload
        return {"success": True}
    
    async def update_memory(self, memory_id: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        if memory_id not in self.memories:
            return {"success": False, "error": "Not found"}
        
        existing_version = self.memories[memory_id].get("version", 1)
        new_version = payload.get("version", 1)
        
        if new_version <= existing_version:
            return {"success": False, "conflict": True, "error": "Version conflict"}
        
        self.memories[memory_id] = payload
        return {"success": True}
    
    async def delete_memory(self, memory_id: str) -> Dict[str, Any]:
        if memory_id in self.memories:
            del self.memories[memory_id]
            return {"success": True}
        return {"success": False, "error": "Not found"}
    
    async def pull_changes(self, since: Optional[str] = None) -> List[Dict[str, Any]]:
        return list(self.memories.values())
    
    async def check_connectivity(self) -> bool:
        return self.connected
    
    def set_connected(self, connected: bool):
        self.connected = connected


_cloud_provider = None


def get_cloud_provider() -> CloudSyncProvider:
    global _cloud_provider
    if _cloud_provider is None:
        if settings.cloud_sync_enabled and settings.cloud_sync_url:
            _cloud_provider = QdrantCloudSyncProvider(settings.cloud_sync_url, settings.cloud_sync_api_key)
        else:
            _cloud_provider = MockCloudProvider()
    return _cloud_provider


def set_cloud_provider(provider: CloudSyncProvider):
    global _cloud_provider
    _cloud_provider = provider