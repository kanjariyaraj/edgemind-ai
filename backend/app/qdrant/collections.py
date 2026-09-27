from qdrant_client import QdrantClient
from qdrant_client.http import models
from typing import List, Optional

from app.qdrant.client import get_qdrant_client


def list_collections() -> List[str]:
    client = get_qdrant_client()
    collections = client.get_collections()
    return [c.name for c in collections.collections]


def create_memory_collection(vector_size: int = 384) -> bool:
    client = get_qdrant_client()
    collections = list_collections()
    
    if "memories" in collections:
        return False
    
    client.create_collection(
        collection_name="memories",
        vectors_config=models.VectorParams(
            size=vector_size,
            distance=models.Distance.COSINE,
        ),
    )
    return True


def delete_collection(name: str) -> bool:
    client = get_qdrant_client()
    client.delete_collection(collection_name=name)
    return True


def get_collection_info(name: str) -> Optional[dict]:
    client = get_qdrant_client()
    try:
        info = client.get_collection(collection_name=name)
        return {
            "name": info.config.params.vectors.size if info.config.params.vectors else None,
            "vectors_count": info.vectors_count,
            "points_count": info.points_count,
            "status": info.status,
        }
    except Exception:
        return None