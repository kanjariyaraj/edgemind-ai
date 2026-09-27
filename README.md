# EdgeMind

**Decision-Controlled Memory for Edge AI**

EdgeMind is an offline-first semantic memory and decision-control system for Edge AI. It enables edge devices to ingest, store, retrieve, and make intelligent decisions about memories without requiring constant cloud connectivity.

## Architecture

```
                    CLOUD
        ┌──────────────────────────────┐
        │ Qdrant Server / Cloud        │
        │ Global Memory                 │
        │ Optional LLM                 │
        └──────────────┬───────────────┘
                       │
                 Sync/Reconcile
                       │
                       ▼
================================================

                    EDGE DEVICE

 ┌──────────────────────────────────────────────┐
 │                                              │
 │              EdgeMind Backend                │
 │                                              │
 │  Ingestion                                   │
 │      ↓                                       │
 │  Chunking / Normalization                    │
 │      ↓                                       │
 │  Local Embeddings                            │
 │      ↓                                       │
 │  Qdrant Edge                                 │
 │      ↓                                       │
 │  Hybrid Retrieval                            │
 │      ↓                                       │
 │  Memory Governor                             │
 │      ↓                                       │
 │  Jev / Local Decision Policy                 │
 │      ↓                                       │
 │  Response / Action                           │
 │                                              │
 │  SQLite                                      │
 │  ├── metadata                                │
 │  ├── sync queue                              │
 │  ├── versions                                │
 │  ├── conflicts                               │
 │  └── decision cache                           │
 │                                              │
 └──────────────────────────────────────────────┘

                    FRONTEND
                         │
                         ▼
                 React Dashboard
```

## Features

- **Offline-First**: Full functionality without internet connectivity
- **Semantic Memory**: Local embeddings with Qdrant Edge storage
- **Hybrid Retrieval**: Dense vector + sparse/BM25 keyword search
- **Memory Governor**: Intelligent decision-making (KEEP_LOCAL, SYNC, COMPRESS, DEFER, DISCARD)
- **Decision Layer**: Jev (online) + Local Policy (offline) with caching
- **Sync Engine**: Queue-based with retry, backoff, and conflict detection
- **Conflict Resolution**: Version-based with LOCAL_WINS, REMOTE_WINS, MANUAL strategies
- **Security**: Sensitivity labels (PUBLIC, INTERNAL, PRIVATE) with local-only policy for private data
- **Dashboard**: Real-time visualization of memory, decisions, sync, and conflicts

## Quick Start

### Prerequisites

- Python 3.11+
- Node.js 18+
- Docker (optional)

### Backend Setup

```bash
cd backend
cp ../.env.example .env
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### Docker

```bash
docker-compose up -d
```

## API Endpoints

- `GET /health` - Health check
- `GET /health/detailed` - Detailed health with dependency checks
- `POST /api/memory` - Create memory
- `GET /api/memory/{id}` - Get memory
- `DELETE /api/memory/{id}` - Delete memory
- `POST /api/search` - Semantic search
- `GET /api/decisions` - List decisions
- `GET /api/decisions/{id}` - Get decision
- `GET /api/sync/status` - Sync status
- `GET /api/sync/queue` - Sync queue
- `POST /api/sync/retry` - Retry failed sync
- `GET /api/conflicts` - List conflicts
- `POST /api/conflicts/{id}/resolve` - Resolve conflict
- `GET /api/dashboard/metrics` - Dashboard metrics

## Configuration

See `.env.example` for all configuration options.

Key settings:
- `QDRANT_MODE`: `edge` (local) or `cloud`
- `CLOUD_SYNC_ENABLED`: Enable cloud synchronization
- `JEV_ENABLED`: Enable Jev decision engine
- `HYBRID_ALPHA`/`HYBRID_BETA`: Hybrid retrieval weights

## Demo Mode

```bash
python scripts/seed_demo.py
```

This creates realistic industrial IoT memories for machines, pumps, generators with technician notes, temperature events, maintenance logs, and fault events.

## Offline Demo Workflow

1. Start online - add memories, search
2. Disconnect cloud (set `CLOUD_SYNC_ENABLED=false`)
3. Observe OFFLINE status
4. Add new memories - stored locally
5. Search works locally
6. Reconnect - automatic sync

## Project Structure

```
edgemind/
├── backend/
│   ├── app/
│   │   ├── api/           # API endpoints
│   │   ├── models/        # SQLModel models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── qdrant/        # Qdrant operations
│   │   ├── embeddings/    # Embedding service
│   │   ├── retrieval/     # Dense/sparse/hybrid search
│   │   ├── memory/        # Ingestion, importance, governor
│   │   ├── decision/      # Jev, local policy, cache
│   │   ├── sync/          # Queue, worker, reconciliation
│   │   ├── database/      # SQLite setup
│   │   ├── security/      # Sensitivity, audit
│   │   └── services/      # System status
│   ├── tests/
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── hooks/
│   │   ├── services/
│   │   ├── types/
│   │   ├── store/
│   │   ├── utils/
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   ├── vite.config.ts
│   └── Dockerfile
├── data/
├── scripts/
├── tests/
├── docs/
├── docker-compose.yml
├── .env.example
└── README.md
```

## Documentation

- [Architecture](docs/architecture.md)
- [API Reference](docs/api.md)
- [Decision System](docs/decisions.md)
- [Sync Protocol](docs/sync.md)
- [Security](docs/security.md)
- [Roadmap](docs/roadmap.md)

## License

MIT