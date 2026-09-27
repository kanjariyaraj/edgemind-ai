from fastembed import TextEmbedding
from typing import List, Optional
import numpy as np

from app.config import settings


_embedding_model: Optional[TextEmbedding] = None


def get_embedding_model() -> TextEmbedding:
    global _embedding_model
    if _embedding_model is None:
        _embedding_model = TextEmbedding(model_name=settings.embedding_model)
    return _embedding_model


def generate_embedding(text: str) -> List[float]:
    model = get_embedding_model()
    embeddings = list(model.embed([text]))
    if embeddings:
        return embeddings[0].tolist()
    return []


def generate_embeddings(texts: List[str]) -> List[List[float]]:
    model = get_embedding_model()
    embeddings = list(model.embed(texts))
    return [emb.tolist() for emb in embeddings]


def cosine_similarity(a: List[float], b: List[float]) -> float:
    a_np = np.array(a)
    b_np = np.array(b)
    return float(np.dot(a_np, b_np) / (np.linalg.norm(a_np) * np.linalg.norm(b_np)))