import { motion, useMotionValue, useSpring } from 'framer-motion'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { 
  Search, 
  Brain, 
  Zap, 
  BarChart2,
  SlidersHorizontal,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  ExternalLink
} from 'lucide-react'
import { searchApi } from '../services/api'

export default function SemanticSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDetails, setShowDetails] = useState<string | null>(null)
  const [retrievalType, setRetrievalType] = useState<'hybrid' | 'dense' | 'sparse'>('hybrid')
  const [topK, setTopK] = useState(10)

  const handleSearch = async () => {
    if (!query.trim()) return
    setIsSearching(true)
    try {
      const response = await searchApi.search({ query, top_k: topK })
      setResults(response.results || [])
      setShowDetails(null)
    } catch (error) {
      console.error('Search failed:', error)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSearch()
    }
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">Semantic Search</h1>
          <p className="text-edgemind-textMuted mt-1">Hybrid retrieval with dense vectors and sparse keywords</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 glass-panel p-1 rounded-lg">
            {(['hybrid', 'dense', 'sparse'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setRetrievalType(type)}
                className={`px-3 py-1.5 text-sm rounded-md transition-all ${
                  retrievalType === type
                    ? 'bg-edgemind-accent/20 text-edgemind-accent border border-edgemind-accent/30'
                    : 'text-edgemind-textMuted hover:text-edgemind-text'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-edgemind-textMuted" />
            <select
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
              className="px-3 py-1.5 glass-panel border border-edgemind-border/50 rounded-lg focus:outline-none focus:border-edgemind-accent/50 text-sm"
            >
              <option value={5}>Top 5</option>
              <option value={10}>Top 10</option>
              <option value={20}>Top 20</option>
              <option value={50}>Top 50</option>
            </select>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel rounded-xl p-6"
      >
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-edgemind-textMuted" />
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter your query... (e.g., 'Why did Machine A overheat?')"
            rows={3}
            className="w-full pl-12 pr-4 py-4 glass-panel border border-edgemind-border/50 rounded-lg focus:outline-none focus:border-edgemind-accent/50 resize-none bg-edgemind-bg text-edgemind-text placeholder-edgemind-textMuted font-mono text-sm"
          />
          <div className="absolute right-4 bottom-4 flex items-center gap-2">
            <button
              onClick={handleSearch}
              disabled={isSearching || !query.trim()}
              className="btn-primary flex items-center gap-2"
            >
              <Brain className="w-4 h-4" />
              {isSearching ? 'Searching...' : 'Search'}
            </button>
            <button
              onClick={() => setQuery('')}
              className="btn-secondary"
            >
              Clear
            </button>
          </div>
        </div>
      </motion.div>

      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5 text-edgemind-accent" />
              Results ({results.length})
            </h2>
            <div className="flex items-center gap-4 text-sm text-edgemind-textMuted">
              <span>Retrieval: <span className="text-edgemind-text font-medium capitalize">{retrievalType}</span></span>
              <span>Query: <span className="text-edgemind-text font-mono">{query}</span></span>
            </div>
          </div>

          <div className="grid gap-4">
            {results.map((result, index) => (
              <SearchResultCard
                key={result.memory_id || result.id}
                result={result}
                rank={index + 1}
                onToggleDetails={() => setShowDetails(showDetails === result.memory_id ? null : result.memory_id)}
                isExpanded={showDetails === result.memory_id}
              />
            ))}
          </div>
        </motion.div>
      )}

      {query && !isSearching && results.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel rounded-xl p-12 text-center"
        >
          <Search className="w-12 h-12 mx-auto text-edgemind-textMuted mb-4 opacity-50" />
          <p className="text-edgemind-textMuted">No results found for "{query}"</p>
          <p className="text-sm text-edgemind-textMuted mt-1">Try different keywords or check if memories exist</p>
        </motion.div>
      )}
    </div>
  )
}

function SearchResultCard({ result, rank, onToggleDetails, isExpanded }: any) {
  const score = result.score || 0
  const denseScore = result.dense_score || 0
  const sparseScore = result.sparse_score || 0
  const payload = result.payload || {}
  const memoryId = result.memory_id || result.id

  const getScoreColor = (s: number) => {
    if (s >= 0.8) return 'text-emerald-400'
    if (s >= 0.5) return 'text-amber-400'
    return 'text-edgemind-textMuted'
  }

  const scoreWidth = Math.min(score * 100, 100)
  const denseWidth = Math.min(denseScore * 100, 100)
  const sparseWidth = Math.min(sparseScore * 100, 100)

  return (
    <motion.div
      className="glass-panel rounded-xl overflow-hidden"
      whileHover={{ y: -2, boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}
    >
      <div className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-8 h-8 rounded-lg bg-edgemind-accent/10 border border-edgemind-accent/20 flex items-center justify-center font-bold text-edgemind-accent text-sm flex-shrink-0">
            {rank}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-0.5 text-xs rounded border font-mono ${getScoreColor(score)}`}>
                Hybrid: {score.toFixed(3)}
              </span>
              <span className="px-2 py-0.5 text-xs rounded border bg-edgemind-bg border-edgemind-border/50 text-edgemind-textMuted font-mono">
                Dense: {denseScore.toFixed(3)}
              </span>
              <span className="px-2 py-0.5 text-xs rounded border bg-edgemind-bg border-edgemind-border/50 text-edgemind-textMuted font-mono">
                Sparse: {sparseScore.toFixed(3)}
              </span>
            </div>
            <p className="text-edgemind-text mb-2">{payload.text || 'No text'}</p>
            <div className="flex flex-wrap gap-3 text-xs text-edgemind-textMuted">
              <span className="flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                {memoryId?.slice(0, 12)}...
              </span>
              <span className="flex items-center gap-1">
                {payload.source}
              </span>
              <span className="flex items-center gap-1">
                {payload.device_id}
              </span>
              <span className="flex items-center gap-1">
                Importance: {(payload.importance * 100).toFixed(0)}%
              </span>
            </div>
          </div>
          <button
            onClick={onToggleDetails}
            className="p-2 text-edgemind-textMuted hover:text-edgemind-accent transition-colors flex-shrink-0"
          >
            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="border-t border-edgemind-border/50 p-4 bg-edgemind-bg/50"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <ScoreBar label="Hybrid Score" value={score} color="edgemind-accent" />
              <ScoreBar label="Dense Score" value={denseScore} color="blue" />
              <ScoreBar label="Sparse Score" value={sparseScore} color="purple" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-edgemind-textMuted mb-1">Source</p>
                <p className="font-mono">{payload.source}</p>
              </div>
              <div>
                <p className="text-edgemind-textMuted mb-1">Device</p>
                <p className="font-mono">{payload.device_id}</p>
              </div>
              <div>
                <p className="text-edgemind-textMuted mb-1">Entity</p>
                <p className="font-mono">{payload.entity_id || 'N/A'}</p>
              </div>
              <div>
                <p className="text-edgemind-textMuted mb-1">Sensitivity</p>
                <p className="font-mono">{payload.sensitivity}</p>
              </div>
              <div>
                <p className="text-edgemind-textMuted mb-1">Sync Status</p>
                <p className="font-mono">{payload.sync_status}</p>
              </div>
              <div>
                <p className="text-edgemind-textMuted mb-1">Created</p>
                <p className="font-mono">{payload.created_at ? new Date(payload.created_at).toLocaleString() : 'Unknown'}</p>
              </div>
            </div>
            {result.reason && (
              <div className="mt-4 p-3 bg-edgemind-accent/10 border border-edgemind-accent/20 rounded-lg">
                <p className="text-edgemind-textMuted mb-1">Match Reason</p>
                <p className="text-edgemind-accent text-sm">{result.reason}</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

function ScoreBar({ label, value, color }: { label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    'edgemind-accent': 'bg-edgemind-accent',
    'blue': 'bg-blue-400',
    'purple': 'bg-purple-400',
  }
  
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-edgemind-textMuted">{label}</span>
        <span className="font-mono text-edgemind-text">{value.toFixed(3)}</span>
      </div>
      <div className="h-2 bg-edgemind-border/50 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(value * 100, 100)}%` }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`h-full ${colorMap[color]} rounded-full`}
        />
      </div>
    </div>
  )
}