from typing import List, Dict, Any, Optional
from rank_bm25 import BM25Okapi
import re


class SparseRetriever:
    def __init__(self):
        self.corpus = []
        self.tokenized_corpus = []
        self.bm25 = None
        self.id_to_index = {}
    
    def add_documents(self, documents: List[Dict[str, Any]]):
        for doc in documents:
            doc_id = doc.get("id")
            text = doc.get("text", "")
            if doc_id and text:
                self.id_to_index[doc_id] = len(self.corpus)
                self.corpus.append(doc)
                self.tokenized_corpus.append(self._tokenize(text))
        
        if self.tokenized_corpus:
            self.bm25 = BM25Okapi(self.tokenized_corpus)
    
    def _tokenize(self, text: str) -> List[str]:
        return re.findall(r'\b\w+\b', text.lower())
    
    def search(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        if not self.bm25:
            return []
        
        tokenized_query = self._tokenize(query)
        scores = self.bm25.get_scores(tokenized_query)
        
        top_indices = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)[:limit]
        
        results = []
        for idx in top_indices:
            if scores[idx] > 0:
                doc = self.corpus[idx]
                results.append({
                    "id": doc.get("id"),
                    "score": float(scores[idx]),
                    "payload": doc.get("payload", {}),
                    "retrieval_type": "sparse",
                })
        
        return results


_sparse_retriever: Optional[SparseRetriever] = None


def get_sparse_retriever() -> SparseRetriever:
    global _sparse_retriever
    if _sparse_retriever is None:
        _sparse_retriever = SparseRetriever()
    return _sparse_retriever


def sparse_search(
    query: str,
    limit: int = 10,
) -> List[Dict[str, Any]]:
    retriever = get_sparse_retriever()
    return retriever.search(query, limit)


def index_memories_for_sparse(memories: List[Dict[str, Any]]):
    retriever = get_sparse_retriever()
    retriever.add_documents(memories)