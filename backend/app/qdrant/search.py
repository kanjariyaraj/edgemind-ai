from qdrant_client import QdrantClient
from qdrant_client.http import models
from typing import List, Optional, Dict, Any

from app.qdrant.client import get_qdrant_client


def hybrid_search(
    dense_vector: List[float],
    sparse_vector: Optional[models.SparseVector] = None,
    limit: int = 10,
    alpha: float = 0.7,
    beta: float = 0.3,
    filter_condition: Optional[models.Filter] = None,
) -> List[Dict[str, Any]]:
    client = get_qdrant_client()
    
    if sparse_vector:
        results = client.search(
            collection_name="memories",
            query_vector=dense_vector,
            query_sparse_vector=sparse_vector,
            limit=limit,
            query_filter=filter_condition,
            with_payload=True,
        )
    else:
        results = client.search(
            collection_name="memories",
            query_vector=dense_vector,
            limit=limit,
            query_filter=filter_condition,
            with_payload=True,
        )
    
    return [
        {
            "id": hit.id,
            "score": hit.score,
            "payload": hit.payload,
        }
        for hit in results
    ]


def recommend_memories(
    positive_ids: List[str],
    negative_ids: Optional[List[str]] = None,
    limit: int = 10,
    filter_condition: Optional[models.Filter] = None,
) -> List[Dict[str, Any]]:
    client = get_qdrant_client()
    results = client.recommend(
        collection_name="memories",
        positive=positive_ids,
        negative=negative_ids or [],
        limit=limit,
        query_filter=filter_condition,
        with_payload=True,
    )
    return [
        {
            "id": hit.id,
            "score": hit.score,
            "payload": hit.payload,
        }
        for hit in results
    ]