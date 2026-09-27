from qdrant_client import QdrantClient
from qdrant_client.http import models
from typing import List, Optional, Dict, Any
import uuid

from app.qdrant.client import get_qdrant_client


def upsert_memory(
    memory_id: str,
    vector: List[float],
    payload: Dict[str, Any],
) -> bool:
    client = get_qdrant_client()
    client.upsert(
        collection_name="memories",
        points=[
            models.PointStruct(
                id=memory_id,
                vector=vector,
                payload=payload,
            )
        ],
    )
    return True


def get_memory(memory_id: str) -> Optional[Dict[str, Any]]:
    client = get_qdrant_client()
    try:
        points = client.retrieve(
            collection_name="memories",
            ids=[memory_id],
            with_payload=True,
            with_vectors=False,
        )
        if points:
            return {"id": points[0].id, "payload": points[0].payload}
    except Exception:
        pass
    return None


def delete_memory(memory_id: str) -> bool:
    client = get_qdrant_client()
    client.delete(
        collection_name="memories",
        points_selector=models.PointIdsList(points=[memory_id]),
    )
    return True


def search_memories(
    vector: List[float],
    limit: int = 10,
    score_threshold: Optional[float] = None,
    filter_condition: Optional[models.Filter] = None,
) -> List[Dict[str, Any]]:
    client = get_qdrant_client()
    results = client.search(
        collection_name="memories",
        query_vector=vector,
        limit=limit,
        score_threshold=score_threshold,
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


def scroll_memories(
    limit: int = 100,
    offset: Optional[int] = None,
    filter_condition: Optional[models.Filter] = None,
) -> List[Dict[str, Any]]:
    client = get_qdrant_client()
    records, next_offset = client.scroll(
        collection_name="memories",
        limit=limit,
        offset=offset,
        scroll_filter=filter_condition,
        with_payload=True,
        with_vectors=False,
    )
    return [
        {"id": record.id, "payload": record.payload}
        for record in records
    ], next_offset