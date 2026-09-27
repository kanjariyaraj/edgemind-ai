export interface Memory {
  id: string
  text: string
  source: string
  device_id: string
  entity_id?: string
  timestamp: string
  created_at: string
  updated_at: string
  importance: number
  confidence: number
  sensitivity: 'public' | 'internal' | 'private'
  version: number
  sync_status: 'local' | 'synced' | 'pending' | 'conflict'
  memory_state: 'active' | 'compressed' | 'archived'
  extra_metadata?: Record<string, any>
}

export interface SearchResult {
  memory_id: string
  text: string
  score: number
  dense_score?: number
  sparse_score?: number
  payload: Memory
  reason?: string
  retrieval_type: 'dense' | 'sparse' | 'hybrid'
}

export interface SearchResponse {
  query: string
  results: SearchResult[]
}

export interface Decision {
  id: string
  memory_id: string
  eval_type: 'memory' | 'query' | 'sync' | 'conflict'
  decision: string
  reason: string[]
  confidence: number
  source: 'local_policy' | 'jev' | 'jev_fallback'
  mode: 'online' | 'offline' | 'degraded'
  signals?: Record<string, any>
  effective_importance?: number
  created_at: string
}

export interface SyncQueueEntry {
  operation_id: string
  memory_id: string
  operation: 'CREATE' | 'UPDATE' | 'DELETE'
  status: 'PENDING' | 'PROCESSING' | 'SYNCED' | 'FAILED' | 'CONFLICT'
  attempts: number
  max_attempts: number
  last_error?: string
  created_at: string
  processed_at?: string
}

export interface SyncStatus {
  status: 'running' | 'idle' | 'error'
  queue_stats: {
    total: number
    pending: number
    processing: number
    synced: number
    failed: number
    conflict: number
  }
}

export interface Conflict {
  id: number
  memory_id: string
  local_version: number
  remote_version: number
  local_payload: Memory
  remote_payload: Memory
  status: 'pending' | 'resolved' | 'ignored'
  resolution?: 'LOCAL_WINS' | 'REMOTE_WINS' | 'MANUAL'
  created_at: string
  resolved_at?: string
}

export interface DashboardMetrics {
  total_memories: number
  local_memories: number
  synced_memories: number
  pending_sync: number
  conflicts: number
  failed_sync: number
  search_count: number
  average_search_latency: number
  decision_count: number
  cache_hits: number
  cache_misses: number
  storage_usage: number
  online_status: 'online' | 'offline' | 'degraded'
}

export interface SystemStatus {
  connectivity: 'online' | 'offline' | 'degraded'
  last_check: string
  cloud_available: boolean
  local_qdrant_available: boolean
  embeddings_available: boolean
  cloud_sync_enabled: boolean
  jev_enabled: boolean
}