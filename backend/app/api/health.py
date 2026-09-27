from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
import time

from app.config import settings
from app.database.database import get_session
from app.qdrant.client import get_qdrant_client

router = APIRouter()


class HealthResponse(BaseModel):
    status: str
    version: str = "0.1.0"
    environment: str
    timestamp: float
    checks: dict


class DetailedHealthResponse(HealthResponse):
    qdrant: Optional[dict] = None
    database: Optional[dict] = None
    embeddings: Optional[dict] = None


@router.get("/health", response_model=HealthResponse)
async def health_check():
    start = time.time()
    checks = {}
    
    checks["api"] = "ok"
    
    elapsed = time.time() - start
    return HealthResponse(
        status="healthy",
        environment=settings.app_env,
        timestamp=time.time(),
        checks=checks,
    )


@router.get("/health/detailed", response_model=DetailedHealthResponse)
async def detailed_health_check():
    start = time.time()
    checks = {}
    qdrant_status = None
    database_status = None
    embeddings_status = None
    
    checks["api"] = "ok"
    
    try:
        qdrant = get_qdrant_client()
        collections = qdrant.get_collections()
        qdrant_status = {
            "status": "connected",
            "collections": len(collections.collections),
        }
        checks["qdrant"] = "ok"
    except Exception as e:
        qdrant_status = {"status": "error", "error": str(e)}
        checks["qdrant"] = "failed"
    
    try:
        session = get_session()
        session.execute("SELECT 1")
        database_status = {"status": "connected"}
        checks["database"] = "ok"
    except Exception as e:
        database_status = {"status": "error", "error": str(e)}
        checks["database"] = "failed"
    
    embeddings_status = {"status": "configured", "model": settings.embedding_model}
    checks["embeddings"] = "ok"
    
    overall_status = "healthy" if all(v == "ok" for v in checks.values()) else "degraded"
    
    return DetailedHealthResponse(
        status=overall_status,
        environment=settings.app_env,
        timestamp=time.time(),
        checks=checks,
        qdrant=qdrant_status,
        database=database_status,
        embeddings=embeddings_status,
    )