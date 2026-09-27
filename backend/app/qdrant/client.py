from qdrant_client import QdrantClient
from qdrant_client.http import models
from typing import Optional

from app.config import settings


_qdrant_client: Optional[QdrantClient] = None


def get_qdrant_client() -> QdrantClient:
    global _qdrant_client
    if _qdrant_client is None:
        if settings.qdrant_mode == "edge":
            _qdrant_client = QdrantClient(path=settings.qdrant_path)
        elif settings.qdrant_url:
            _qdrant_client = QdrantClient(
                url=settings.qdrant_url,
                api_key=settings.qdrant_api_key,
            )
        else:
            _qdrant_client = QdrantClient(path=settings.qdrant_path)
    return _qdrant_client


def init_collections():
    client = get_qdrant_client()
    collections = client.get_collections().collections
    collection_names = [c.name for c in collections]
    
    if "memories" not in collection_names:
        client.create_collection(
            collection_name="memories",
            vectors_config=models.VectorParams(
                size=384,
                distance=models.Distance.COSINE,
            ),
        )
    
    return client.get_collections()