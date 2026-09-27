from typing import List, Dict, Any, Optional

from app.embeddings.service import generate_embedding
from app.qdrant.search import hybrid_search
from app.config import settings


def dense_search(
    query: str,
    limit: int = 10,
    score_threshold: Optional[float] = None,
    filter_condition: Optional[Dict[str, Any]] = None,
) -> List[Dict[str, Any]]:
    vector = generate_embedding(query)
    if not vector:
        return []
    
    from qdrant_client.http import models
    
    qdrant_filter = None
    if filter_condition:
        qdrant_filter = models.Filter(**filter_condition)
    
    results = hybrid_search(
        dense_vector=vector,
        limit=limit,
        alpha=1.0,
        beta=0.0,
        filter_condition=qdrant_filter,
    )
    
    for r in results:
        r["retrieval_type"] = "dense"
    
    return results