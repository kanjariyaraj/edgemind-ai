from typing import Dict, Any, Optional, List
from datetime import datetime

from app.memory.governor import evaluate_memory
from app.memory.decay import calculate_effective_importance


class LocalPolicyDecisionEngine:
    def __init__(self):
        self.name = "local_policy"
        self.version = "1.0.0"
    
    async def evaluate_memory(self, memory: Dict[str, Any], context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        governor_result = evaluate_memory(memory)
        
        return {
            "decision": governor_result["decision"],
            "reason": governor_result["reason"],
            "confidence": 0.85,
            "source": "local_policy",
            "eval_type": "memory",
            "signals": governor_result["signals"],
            "effective_importance": governor_result["effective_importance"],
        }
    
    async def evaluate_query(self, query: str, results: List[Dict[str, Any]], context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        if not results:
            return {
                "decision": "NO_RESULTS",
                "reason": ["No memories found matching query"],
                "confidence": 1.0,
                "source": "local_policy",
                "eval_type": "query",
            }
        
        top_result = results[0]
        score = top_result.get("score", 0)
        
        if score >= 0.8:
            decision = "HIGH_CONFIDENCE"
            reason = [f"Top result score: {score:.2f} (high confidence)"]
            confidence = 0.9
        elif score >= 0.5:
            decision = "MODERATE_CONFIDENCE"
            reason = [f"Top result score: {score:.2f} (moderate confidence)"]
            confidence = 0.7
        else:
            decision = "LOW_CONFIDENCE"
            reason = [f"Top result score: {score:.2f} (low confidence)"]
            confidence = 0.5
        
        return {
            "decision": decision,
            "reason": reason,
            "confidence": confidence,
            "source": "local_policy",
            "eval_type": "query",
            "top_score": score,
            "result_count": len(results),
        }
    
    async def evaluate_sync(self, memory: Dict[str, Any], context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        importance = memory.get("importance", 0.5)
        sensitivity = memory.get("sensitivity", "internal")
        sync_status = memory.get("sync_status", "local")
        connectivity = context.get("connectivity", "unknown") if context else "unknown"
        
        if sensitivity == "private":
            return {
                "decision": "KEEP_LOCAL",
                "reason": ["Memory is PRIVATE, sync prohibited by policy"],
                "confidence": 1.0,
                "source": "local_policy",
                "eval_type": "sync",
            }
        
        if connectivity == "offline":
            return {
                "decision": "QUEUE_SYNC",
                "reason": ["Device is offline, sync queued for later"],
                "confidence": 1.0,
                "source": "local_policy",
                "eval_type": "sync",
            }
        
        if importance >= 0.7:
            return {
                "decision": "SYNC_NOW",
                "reason": [f"High importance ({importance:.2f}), sync immediately"],
                "confidence": 0.9,
                "source": "local_policy",
                "eval_type": "sync",
            }
        
        if sync_status == "synced" and importance < 0.3:
            return {
                "decision": "NO_SYNC_NEEDED",
                "reason": ["Already synced and low importance"],
                "confidence": 0.8,
                "source": "local_policy",
                "eval_type": "sync",
            }
        
        return {
            "decision": "SYNC_NOW",
            "reason": ["Default sync policy"],
            "confidence": 0.6,
            "source": "local_policy",
            "eval_type": "sync",
        }
    
    async def evaluate_conflict(self, conflict: Dict[str, Any], context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        local_version = conflict.get("local_version", 0)
        remote_version = conflict.get("remote_version", 0)
        local_importance = conflict.get("local_importance", 0.5)
        remote_importance = conflict.get("remote_importance", 0.5)
        sensitivity = conflict.get("sensitivity", "internal")
        
        if sensitivity == "private":
            return {
                "decision": "LOCAL_WINS",
                "reason": ["Private memory, local version takes precedence"],
                "confidence": 0.9,
                "source": "local_policy",
                "eval_type": "conflict",
                "resolution": "LOCAL_WINS",
            }
        
        if local_importance > remote_importance + 0.2:
            return {
                "decision": "LOCAL_WINS",
                "reason": [f"Local importance ({local_importance:.2f}) significantly higher than remote ({remote_importance:.2f})"],
                "confidence": 0.8,
                "source": "local_policy",
                "eval_type": "conflict",
                "resolution": "LOCAL_WINS",
            }
        
        if remote_importance > local_importance + 0.2:
            return {
                "decision": "REMOTE_WINS",
                "reason": [f"Remote importance ({remote_importance:.2f}) significantly higher than local ({local_importance:.2f})"],
                "confidence": 0.8,
                "source": "local_policy",
                "eval_type": "conflict",
                "resolution": "REMOTE_WINS",
            }
        
        if local_version > remote_version:
            return {
                "decision": "LOCAL_WINS",
                "reason": [f"Local version ({local_version}) newer than remote ({remote_version})"],
                "confidence": 0.7,
                "source": "local_policy",
                "eval_type": "conflict",
                "resolution": "LOCAL_WINS",
            }
        
        return {
            "decision": "MANUAL_REVIEW",
            "reason": ["Versions and importance similar, requires manual resolution"],
            "confidence": 0.5,
            "source": "local_policy",
            "eval_type": "conflict",
            "resolution": "MANUAL",
        }


local_policy_engine = LocalPolicyDecisionEngine()