import { motion } from 'framer-motion'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronUp,
  Database,
  Shield,
  Globe,
  Lock,
  Clock,
  Eye,
  MoreVertical
} from 'lucide-react'
import { memoryApi, searchApi } from '../services/api'

const sensitivityColors = {
  public: 'text-green-400 bg-green-400/10 border-green-400/20',
  internal: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  private: 'text-red-400 bg-red-400/10 border-red-400/20',
}

const syncStatusColors = {
  local: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  synced: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  pending: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  conflict: 'text-red-400 bg-red-400/10 border-red-400/20',
}

export default function MemoryExplorer() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedSensitivity, setSelectedSensitivity] = useState<string>('all')
  const [selectedSyncStatus, setSelectedSyncStatus] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const { data: memories, isLoading } = useQuery({
    queryKey: ['memories', searchQuery, selectedSensitivity, selectedSyncStatus, sortBy, sortOrder],
    queryFn: async () => {
      if (searchQuery) {
        const result = await searchApi.search({ query: searchQuery, top_k: 50 })
        return result.results || []
      }
      return []
    },
    enabled: !!searchQuery,
  })

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString()
  }

  const getImportanceColor = (importance: number) => {
    if (importance >= 0.7) return 'text-emerald-400'
    if (importance >= 0.4) return 'text-amber-400'
    return 'text-edgemind-textMuted'
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">Memory Explorer</h1>
          <p className="text-edgemind-textMuted mt-1">Browse and manage stored memories</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-edgemind-textMuted" />
          <input
            type="text"
            placeholder="Search memories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-80 pl-10 pr-4 py-2 glass-panel border border-edgemind-border/50 rounded-lg focus:outline-none focus:border-edgemind-accent/50"
          />
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel rounded-xl p-4"
      >
        <div className="flex flex-wrap gap-4">
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-edgemind-textMuted" />
            <select
              value={selectedSensitivity}
              onChange={(e) => setSelectedSensitivity(e.target.value)}
              className="pl-10 pr-8 py-2 glass-panel border border-edgemind-border/50 rounded-lg focus:outline-none focus:border-edgemind-accent/50 appearance-none bg-no-repeat bg-right"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1rem' }}
            >
              <option value="all">All Sensitivities</option>
              <option value="public">Public</option>
              <option value="internal">Internal</option>
              <option value="private">Private</option>
            </select>
          </div>
          <div className="relative">
            <select
              value={selectedSyncStatus}
              onChange={(e) => setSelectedSyncStatus(e.target.value)}
              className="pl-4 pr-8 py-2 glass-panel border border-edgemind-border/50 rounded-lg focus:outline-none focus:border-edgemind-accent/50 appearance-none bg-no-repeat bg-right"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1rem' }}
            >
              <option value="all">All Sync Status</option>
              <option value="local">Local Only</option>
              <option value="synced">Synced</option>
              <option value="pending">Pending</option>
              <option value="conflict">Conflict</option>
            </select>
          </div>
          <div className="relative ml-auto">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="pl-4 pr-8 py-2 glass-panel border border-edgemind-border/50 rounded-lg focus:outline-none focus:border-edgemind-accent/50 appearance-none bg-no-repeat bg-right"
              style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundPosition: 'right 0.5rem center', backgroundSize: '1rem' }}
            >
              <option value="created_at">Created Date</option>
              <option value="importance">Importance</option>
              <option value="confidence">Confidence</option>
            </select>
          </div>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-2 glass-panel border border-edgemind-border/50 rounded-lg hover:bg-edgemind-panelHover transition-colors"
          >
            {sortOrder === 'asc' ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel rounded-xl overflow-hidden"
      >
        {isLoading ? (
          <div className="p-8 text-center text-edgemind-textMuted">Loading memories...</div>
        ) : memories && memories.length > 0 ? (
          <div className="divide-y divide-edgemind-border/50">
            {memories.map((memory: any, index) => (
              <motion.div
                key={memory.memory_id || memory.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className="p-4 hover:bg-edgemind-panelHover/50 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-edgemind-textMuted">
                        {memory.memory_id?.slice(0, 8) || memory.id?.slice(0, 8)}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded border ${
                        sensitivityColors[memory.payload?.sensitivity as keyof typeof sensitivityColors] || sensitivityColors.internal
                      }`}>
                        {memory.payload?.sensitivity || 'internal'}
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded border ${
                        syncStatusColors[memory.payload?.sync_status as keyof typeof syncStatusColors] || syncStatusColors.local
                      }`}>
                        {memory.payload?.sync_status || 'local'}
                      </span>
                    </div>
                    <p className="text-edgemind-text mb-2 line-clamp-2">{memory.payload?.text || memory.text}</p>
                    <div className="flex flex-wrap gap-4 text-xs text-edgemind-textMuted">
                      <span className="flex items-center gap-1">
                        <Database className="w-3 h-3" />
                        {memory.payload?.device_id || memory.device_id}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {memory.payload?.created_at ? formatDate(memory.payload.created_at) : 'Unknown'}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className={`font-medium ${getImportanceColor(memory.payload?.importance || memory.importance || 0)}`}>
                          Importance: {((memory.payload?.importance || memory.importance || 0) * 100).toFixed(0)}%
                        </span>
                      </span>
                      <span className="flex items-center gap-1">
                        Confidence: {((memory.payload?.confidence || memory.confidence || 0) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => setExpandedId(expandedId === memory.memory_id ? null : memory.memory_id)}
                    className="p-2 text-edgemind-textMuted hover:text-edgemind-accent transition-colors"
                  >
                    {expandedId === memory.memory_id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>

                {expandedId === memory.memory_id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="mt-4 pt-4 border-t border-edgemind-border/50"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-edgemind-textMuted mb-1">Source</p>
                        <p className="font-mono">{memory.payload?.source || 'unknown'}</p>
                      </div>
                      <div>
                        <p className="text-edgemind-textMuted mb-1">Entity</p>
                        <p className="font-mono">{memory.payload?.entity_id || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-edgemind-textMuted mb-1">Version</p>
                        <p className="font-mono">{memory.payload?.version || 1}</p>
                      </div>
                      <div>
                        <p className="text-edgemind-textMuted mb-1">Memory State</p>
                        <p className="font-mono">{memory.payload?.memory_state || 'active'}</p>
                      </div>
                    </div>
                    {memory.payload?.extra_metadata && (
                      <div className="mt-4 p-3 bg-edgemind-bg rounded-lg">
                        <p className="text-edgemind-textMuted mb-1">Extra Metadata</p>
                        <pre className="text-xs text-edgemind-text overflow-auto max-h-40">
                          {JSON.stringify(memory.payload.extra_metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Database className="w-12 h-12 mx-auto text-edgemind-textMuted mb-4 opacity-50" />
            <p className="text-edgemind-textMuted">No memories found</p>
            <p className="text-sm text-edgemind-textMuted mt-1">
              {searchQuery ? 'Try adjusting your search or filters' : 'Add memories using the API or seed demo data'}
            </p>
          </div>
        )}
      </motion.div>
    </div>
  )
}