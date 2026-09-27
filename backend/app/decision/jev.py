from typing import Dict, Any, Optional
from abc import ABC, abstractmethod
import httpx
import json

from app.config import settings


class DecisionEngine(ABC):
    @abstractmethod
    async def evaluate_memory(self, memory: Dict[str, Any], context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        pass
    
    @abstractmethod
    async def evaluate_query(self, query: str, results: list, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        pass
    
    @abstractmethod
    async def evaluate_sync(self, memory: Dict[str, Any], context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        pass
    
    @abstractmethod
    async def evaluate_conflict(self, conflict: Dict[str, Any], context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        pass


class JevDecisionEngine(DecisionEngine):
    def __init__(self):
        self.api_url = settings.jev_api_url
        self.api_key = settings.jev_api_key
        self.client = httpx.AsyncClient(timeout=30.0) if self.api_url else None
    
    async def evaluate_memory(self, memory: Dict[str, Any], context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        if not self.client or not self.api_url:
            return await self._fallback_decision(memory, "memory")
        
        try:
            response = await self.client.post(
                f"{self.api_url}/v1/evaluate/memory",
                headers={"Authorization": f"Bearer {self.api_key}"} if self.api_key else {},
                json={"memory": memory, "context": context or {}},
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return await self._fallback_decision(memory, "memory", error=str(e))
    
    async def evaluate_query(self, query: str, results: list, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        if not self.client or not self.api_url:
            return await self._fallback_decision({"query": query, "results": results}, "query")
        
        try:
            response = await self.client.post(
                f"{self.api_url}/v1/evaluate/query",
                headers={"Authorization": f"Bearer {self.api_key}"} if self.api_key else {},
                json={"query": query, "results": results, "context": context or {}},
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return await self._fallback_decision({"query": query, "results": results}, "query", error=str(e))
    
    async def evaluate_sync(self, memory: Dict[str, Any], context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        if not self.client or not self.api_url:
            return await self._fallback_decision(memory, "sync")
        
        try:
            response = await self.client.post(
                f"{self.api_url}/v1/evaluate/sync",
                headers={"Authorization": f"Bearer {self.api_key}"} if self.api_key else {},
                json={"memory": memory, "context": context or {}},
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return await self._fallback_decision(memory, "sync", error=str(e))
    
    async def evaluate_conflict(self, conflict: Dict[str, Any], context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        if not self.client or not self.api_url:
            return await self._fallback_decision(conflict, "conflict")
        
        try:
            response = await self.client.post(
                f"{self.api_url}/v1/evaluate/conflict",
                headers={"Authorization": f"Bearer {self.api_key}"} if self.api_key else {},
                json={"conflict": conflict, "context": context or {}},
            )
            response.raise_for_status()
            return response.json()
        except Exception as e:
            return await self._fallback_decision(conflict, "conflict", error=str(e))
    
    async def _fallback_decision(self, data: Dict[str, Any], eval_type: str, error: Optional[str] = None) -> Dict[str, Any]:
        return {
            "decision": "DEFER",
            "reason": [f"Jev unavailable: {error or 'not configured'}"],
            "confidence": 0.0,
            "source": "jev_fallback",
            "eval_type": eval_type,
        }
    
    async def close(self):
        if self.client:
            await self.client.aclose()