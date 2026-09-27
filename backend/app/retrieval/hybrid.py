from typing import List, Dict, Any, Optional
from app.retrieval.dense import dense_search
from app.retrieval.sparse import sparse_search
from app.config import settings


def hybrid_search(
    query: str,
    limit: int = 10,
    alpha: Optional[float] = None,
    beta: Optional[float] = None,
    filter_condition: Optional[Dict[str, Any]] = None,
) -> List[Dict[str, Any]]:
    alpha = alpha if alpha is not None else settings.hybrid_alpha
    beta = beta if beta is not None else settings.hybrid_beta
    
    dense_results = dense_search(query, limit=limit * 2, filter_condition=filter_condition)
    sparse_results = sparse_search(query, limit=limit * 2)
    
    dense_scores = {r["id"]: r["score"] for r in dense_results}
    sparse_scores = {r["id"]: r["score"] for r in sparse_results}
    
    all_ids = set(dense_scores.keys()) | set(sparse_scores.keys())
    
    max_dense = max(dense_scores.values()) if dense_scores else 1.0
    max_sparse = max(sparse_scores.values()) if sparse_scores else 1.0
    
    hybrid_results = []
    for doc_id in all_ids:
        dense_score = dense_scores.get(doc_id, 0) / max_dense if max_dense > 0 else 0
        sparse_score = sparse_scores.get(doc_id, 0) / max_sparse if max_sparse > 0 else 0
        
        hybrid_score = alpha * dense_score + beta * sparse_score
        
        payload = {}
        for r in dense_results:
            if r["id"] == doc_id:
                payload = r.get("payload", {})
                break
        if not payload:
            for r in sparse_results:
                if r["id"] == doc_id:
                    payload = r.get("payload", {})
                    break
        
        hybrid_results.append({
            "id": doc_id,
            "score": hybrid_score,
            "dense_score": dense_score,
            "sparse_score": sparse_score,
            "payload": payload,
            "retrieval_type": "hybrid",
        })
    
    hybrid_results.sort(key=lambda x: x["score"], reverse=True)
    
    return hybrid_results[:limit]


def rerank_results(
    query: str,
    results: List[Dict[str, Any]],
    top_k: Optional[int] = None,
) -> List[Dict[str, Any]]:
    return results[:top_k] if top_k else results