from typing import Dict, Any, Optional, List
from enum import Enum

from app.decision.jev import JevDecisionEngine, DecisionEngine
from app.decision.local_policy import local_policy_engine, LocalPolicyDecisionEngine
from app.decision.cache import get_cached_decision, cache_decision, get_cache_stats
from app.config import settings
from app.services.system_status import get_system_status


class DecisionMode(str, Enum):
    ONLINE = "online"
    OFFLINE = "offline"
    DEGRADED = "degraded"


class DecisionOrchestrator:
    def __init__(self):
        self.jev_engine = JevDecisionEngine() if settings.jev_enabled else None
        self.local_engine = local_policy_engine
        self.mode = DecisionMode.OFFLINE
    
    def update_mode(self):
        status = get_system_status()
        connectivity = status.get("connectivity", "offline")
        
        if connectivity == "online" and settings.jev_enabled and self.jev_engine and self.jev_engine.api_url:
            self.mode = DecisionMode.ONLINE
        elif connectivity == "degraded":
            self.mode = DecisionMode.DEGRADED
        else:
            self.mode = DecisionMode.OFFLINE
    
    def get_engine(self) -> DecisionEngine:
        if self.mode == DecisionMode.ONLINE:
            return self.jev_engine
        return self.local_engine
    
    async def evaluate_memory(self, memory: Dict[str, Any], context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        self.update_mode()
        
        cached = get_cached_decision("memory", memory)
        if cached:
            cached["mode"] = self.mode.value
            return cached
        
        engine = self.get_engine()
        result = await engine.evaluate_memory(memory, context)
        result["mode"] = self.mode.value
        
        cache_decision("memory", memory, result, engine.version if hasattr(engine, 'version') else "1.0.0")
        
        return result
    
    async def evaluate_query(self, query: str, results: List[Dict[str, Any]], context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        self.update_mode()
        
        cache_data = {"query": query, "result_ids": [r.get("id") for r in results[:5]]}
        cached = get_cached_decision("query", cache_data)
        if cached:
            cached["mode"] = self.mode.value
            return cached
        
        engine = self.get_engine()
        result = await engine.evaluate_query(query, results, context)
        result["mode"] = self.mode.value
        
        cache_decision("query", cache_data, result, engine.version if hasattr(engine, 'version') else "1.0.0")
        
        return result
    
    async def evaluate_sync(self, memory: Dict[str, Any], context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        self.update_mode()
        
        if context is None:
            context = {}
        context["connectivity"] = get_system_status().get("connectivity", "offline")
        
        cached = get_cached_decision("sync", memory)
        if cached:
            cached["mode"] = self.mode.value
            return cached
        
        engine = self.get_engine()
        result = await engine.evaluate_sync(memory, context)
        result["mode"] = self.mode.value
        
        cache_decision("sync", memory, result, engine.version if hasattr(engine, 'version') else "1.0.0")
        
        return result
    
    async def evaluate_conflict(self, conflict: Dict[str, Any], context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        self.update_mode()
        
        cached = get_cached_decision("conflict", conflict)
        if cached:
            cached["mode"] = self.mode.value
            return cached
        
        engine = self.get_engine()
        result = await engine.evaluate_conflict(conflict, context)
        result["mode"] = self.mode.value
        
        cache_decision("conflict", conflict, result, engine.version if hasattr(engine, 'version') else "1.0.0")
        
        return result
    
    def get_cache_stats(self) -> Dict[str, Any]:
        stats = get_cache_stats()
        stats["current_mode"] = self.mode.value
        return stats


decision_orchestrator = DecisionOrchestrator()