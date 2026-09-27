from typing import List, Dict, Any, Optional
from datetime import datetime
import hashlib


def detect_duplicates(memories: List[Dict[str, Any]], threshold: float = 0.95) -> List[List[str]]:
    from app.embeddings.service import cosine_similarity
    
    duplicate_groups = []
    processed = set()
    
    for i, mem_a in enumerate(memories):
        if mem_a["id"] in processed:
            continue
        
        group = [mem_a["id"]]
        for j, mem_b in enumerate(memories[i+1:], i+1):
            if mem_b["id"] in processed:
                continue
            
            text_a = mem_a.get("payload", {}).get("text", "")
            text_b = mem_b.get("payload", {}).get("text", "")
            
            if text_a and text_b:
                emb_a = mem_a.get("vector")
                emb_b = mem_b.get("vector")
                
                if emb_a and emb_b:
                    sim = cosine_similarity(emb_a, emb_b)
                    if sim >= threshold:
                        group.append(mem_b["id"])
                        processed.add(mem_b["id"])
        
        if len(group) > 1:
            duplicate_groups.append(group)
            for gid in group:
                processed.add(gid)
    
    return duplicate_groups


def compress_memory_group(memory_ids: List[str], strategy: str = "merge") -> Dict[str, Any]:
    if strategy == "merge":
        return {
            "action": "merge",
            "memory_ids": memory_ids,
            "compressed_at": datetime.utcnow().isoformat(),
            "compression_ratio": len(memory_ids),
        }
    elif strategy == "summarize":
        return {
            "action": "summarize",
            "memory_ids": memory_ids,
            "compressed_at": datetime.utcnow().isoformat(),
            "summary": "LLM summarization not implemented",
        }
    return {"action": "none", "memory_ids": memory_ids}


def create_content_hash(text: str) -> str:
    return hashlib.sha256(text.encode()).hexdigest()[:16]