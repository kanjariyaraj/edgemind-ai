# EdgeMind Project Plan

## Project Overview
EdgeMind is an offline-first semantic memory and decision-control system for Edge AI. It enables edge devices to ingest, store, retrieve, and make decisions about memories without requiring constant cloud connectivity.

## Phase Breakdown

### Phase 1: Project Setup (Current)
- [ ] Initialize project structure
- [ ] Create PROJECT_PLAN.md
- [ ] Create backend skeleton with FastAPI
- [ ] Create frontend skeleton with React/Vite
- [ ] Create .env.example
- [ ] Create README.md
- [ ] Create basic health endpoint
- [ ] Run backend and verify /health

### Phase 2: Database Layer
- [ ] SQLite setup with SQLModel
- [ ] Database configuration
- [ ] Repository patterns

### Phase 3: Qdrant Local/Edge Storage
- [ ] Qdrant client configuration
- [ ] Collections management
- [ ] Points operations

### Phase 4: Embedding Service
- [ ] Local embedding service (FastEmbed)
- [ ] Embedding generation

### Phase 5: Memory Ingestion
- [ ] Memory models and schemas
- [ ] Ingestion pipeline
- [ ] API endpoint

### Phase 6: Dense Retrieval
- [ ] Vector search implementation
- [ ] Search API

### Phase 7: Sparse Retrieval
- [ ] BM25/sparse search
- [ ] Keyword matching

### Phase 8: Hybrid Retrieval
- [ ] Combined dense + sparse
- [ ] Configurable alpha/beta weights
- [ ] Reranker abstraction

### Phase 9: Memory Governor
- [ ] Importance calculation
- [ ] Decay functions
- [ ] Decision engine (KEEP_LOCAL, SYNC, COMPRESS, DEFER, DISCARD)

### Phase 10: Decision Layer
- [ ] Local policy engine
- [ ] Jev adapter (online)
- [ ] Decision orchestrator
- [ ] Decision cache

### Phase 11: Offline-First Mode
- [ ] Connectivity detection
- [ ] Offline operation support
- [ ] Status indicators

### Phase 12: Sync Engine
- [ ] SQLite sync queue
- [ ] Sync worker with retry/backoff
- [ ] Idempotency

### Phase 13: Cloud Sync Abstraction
- [ ] CloudSyncProvider interface
- [ ] QdrantCloudSyncProvider
- [ ] MockCloudProvider

### Phase 14: Conflict Detection & Resolution
- [ ] Version-based conflict detection
- [ ] Conflict storage
- [ ] Resolution strategies

### Phase 15: Frontend - Core
- [ ] Dashboard layout
- [ ] System status component
- [ ] Online/Offline/Degraded indicators

### Phase 16: Frontend - Memory Explorer
- [ ] Search interface
- [ ] Memory cards
- [ ] Detail view

### Phase 17: Frontend - Semantic Search
- [ ] Query interface
- [ ] Score visualization
- [ ] Dense/Sparse/Hybrid breakdown

### Phase 18: Frontend - Decision Observatory
- [ ] Decision flow visualization
- [ ] Signal breakdown
- [ ] Reason display

### Phase 19: Frontend - Sync Center
- [ ] Queue visualization
- [ ] Retry/Resolve actions
- [ ] Timeline

### Phase 20: Frontend - Conflict Center
- [ ] Conflict display
- [ ] Resolution buttons

### Phase 21: Metrics & Observability
- [ ] Dashboard metrics API
- [ ] Structured logging
- [ ] Frontend metrics display

### Phase 22: Demo Mode
- [ ] Seed script with realistic data
- [ ] Offline demo workflow

### Phase 23: Testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] API tests

### Phase 24: Docker & Deployment
- [ ] Dockerfile for backend
- [ ] Dockerfile for frontend
- [ ] docker-compose.yml

### Phase 25: Documentation
- [ ] Architecture docs
- [ ] API docs
- [ ] Decision docs
- [ ] Sync docs
- [ ] Security docs
- [ ] Roadmap
- [ ] README polish

## Acceptance Criteria
- [ ] Backend starts
- [ ] Frontend starts
- [ ] Health endpoint works
- [ ] Local Qdrant works
- [ ] Embeddings work
- [ ] Memory can be created
- [ ] Memory can be searched
- [ ] Dense retrieval works
- [ ] Sparse retrieval works
- [ ] Hybrid retrieval works
- [ ] Memory Governor works
- [ ] Local decision engine works
- [ ] Jev adapter exists
- [ ] Decision cache works
- [ ] Offline mode works
- [ ] Sync queue works
- [ ] Cloud provider abstraction works
- [ ] Conflict detection works
- [ ] Conflict resolution works
- [ ] Dashboard works
- [ ] Demo data works
- [ ] Tests pass
- [ ] Docker setup works
- [ ] Documentation exists
- [ ] No secrets committed
- [ ] No fake benchmark numbers
- [ ] No fake integrations