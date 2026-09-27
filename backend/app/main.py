from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.api import health, memory, search, decisions, sync, conflicts, dashboard
from app.database.database import init_db, close_db


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield
    await close_db()


app = FastAPI(
    title="EdgeMind API",
    description="Decision-Controlled Memory for Edge AI",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["health"])
app.include_router(memory.router, prefix="/api/memory", tags=["memory"])
app.include_router(search.router, prefix="/api/search", tags=["search"])
app.include_router(decisions.router, prefix="/api/decisions", tags=["decisions"])
app.include_router(sync.router, prefix="/api/sync", tags=["sync"])
app.include_router(conflicts.router, prefix="/api/conflicts", tags=["conflicts"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["dashboard"])


@app.get("/")
async def root():
    return {
        "name": "EdgeMind",
        "tagline": "Decision-Controlled Memory for Edge AI",
        "version": "0.1.0",
        "status": "running",
    }