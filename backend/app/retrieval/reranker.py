from typing import List, Dict, Any, Optional


class Reranker:
    def rerank(self, query: str, results: List[Dict[str, Any]], top_k: Optional[int] = None) -> List[Dict[str, Any]]:
        raise NotImplementedError


class NoOpReranker(Reranker):
    def rerank(self, query: str, results: List[Dict[str, Any]], top_k: Optional[int] = None) -> List[Dict[str, Any]]:
        return results[:top_k] if top_k else results


class CrossEncoderReranker(Reranker):
    def __init__(self, model_name: str = "cross-encoder/ms-marco-MiniLM-L-6-v2"):
        self.model_name = model_name
        self._model = None
    
    def _get_model(self):
        if self._model is None:
            from sentence_transformers import CrossEncoder
            self._model = CrossEncoder(self.model_name)
        return self._model
    
    def rerank(self, query: str, results: List[Dict[str, Any]], top_k: Optional[int] = None) -> List[Dict[str, Any]]:
        if not results:
            return []
        
        model = self._get_model()
        pairs = [(query, r.get("payload", {}).get("text", "")) for r in results]
        scores = model.predict(pairs)
        
        for i, r in enumerate(results):
            r["rerank_score"] = float(scores[i])
        
        results.sort(key=lambda x: x.get("rerank_score", 0), reverse=True)
        
        return results[:top_k] if top_k else results


_reranker: Optional[Reranker] = None


def get_reranker() -> Reranker:
    global _reranker
    if _reranker is None:
        _reranker = NoOpReranker()
    return _reranker


def set_reranker(reranker: Reranker):
    global _reranker
    _reranker = reranker