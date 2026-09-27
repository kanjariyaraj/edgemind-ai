import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { 
  AlertTriangle, 
  GitBranch, 
  Database, 
  Cloud, 
  CheckCircle, 
  XCircle,
  ArrowRight,
  ArrowLeft,
  Minus,
  Eye,
  Code,
  RefreshCw
} from 'lucide-react'
import { conflictsApi } from '../services/api'

const resolutionColors = {
  LOCAL_WINS: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  REMOTE_WINS: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  MANUAL: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
}

export default function ConflictCenter() {
  const { data: conflicts, isLoading } = useQuery({
    queryKey: ['conflicts'],
    queryFn: () => conflictsApi.list(),
    refetchInterval: 10000,
  })

  const mockConflicts = [
    {
      id: 1,
      memory_id: 'mem-abc123',
      local_version: 3,
      remote_version: 4,
      local_payload: { importance: 0.8, text: 'Machine A temperature normalized after fan replacement', sync_status: 'local' },
      remote_payload: { importance: 0.6, text: 'Machine A temperature still elevated', sync_status: 'synced' },
      status: 'pending',
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 2,
      memory_id: 'mem-def456',
      local_version: 1,
      remote_version: 2,
      local_payload: { importance: 0.9, text: 'Critical: Pump 12 pressure exceeded threshold', sync_status: 'local' },
      remote_payload: { importance: 0.9, text: 'Critical: Pump 12 pressure exceeded threshold - RESOLVED', sync_status: 'synced' },
      status: 'pending',
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
  ]

  const displayConflicts = conflicts?.conflicts || mockConflicts

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">Conflict Center</h1>
          <p className="text-edgemind-textMuted mt-1">Resolve version conflicts between local and cloud memories</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 glass-panel rounded-lg text-sm text-edgemind-textMuted">
            {displayConflicts.length} pending
          </span>
        </div>
      </motion.div>

      {isLoading ? (
        <div className="glass-panel rounded-xl p-8 text-center text-edgemind-textMuted">Loading conflicts...</div>
      ) : displayConflicts.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          {displayConflicts.map((conflict: any, index) => (
            <ConflictCard key={conflict.id} conflict={conflict} index={index} />
          ))}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel rounded-xl p-12 text-center"
        >
          <CheckCircle className="w-12 h-12 mx-auto text-emerald-400 mb-4" />
          <p className="text-edgemind-text">No conflicts detected</p>
          <p className="text-sm text-edgemind-textMuted mt-1">All memories are in sync between local and cloud</p>
        </motion.div>
      )}
    </div>
  )
}

function ConflictCard({ conflict, index }: { conflict: any; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const [resolution, setResolution] = useState<'LOCAL_WINS' | 'REMOTE_WINS' | 'MANUAL' | null>(null)

  const formatTime = (dateStr: string) => new Date(dateStr).toLocaleString()

  const localText = conflict.local_payload?.text || JSON.stringify(conflict.local_payload)
  const remoteText = conflict.remote_payload?.text || JSON.stringify(conflict.remote_payload)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.1 }}
      className="glass-panel rounded-xl overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-amber-400/10 border border-amber-400/20 flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-mono text-xs text-edgemind-textMuted">{conflict.memory_id.slice(0, 12)}...</span>
              <span className="px-2 py-0.5 text-xs rounded border bg-amber-400/10 border-amber-400/20 text-amber-400">
                Version Conflict
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="p-3 bg-blue-400/10 border border-blue-400/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-blue-400" />
                  <span className="font-medium text-blue-400">Local (v{conflict.local_version})</span>
                </div>
                <p className="text-edgemind-text text-sm">{localText}</p>
                <p className="text-xs text-edgemind-textMuted mt-1">Importance: {(conflict.local_payload?.importance * 100).toFixed(0)}%</p>
              </div>
              <div className="p-3 bg-emerald-400/10 border border-emerald-400/20 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Cloud className="w-4 h-4 text-emerald-400" />
                  <span className="font-medium text-emerald-400">Remote (v{conflict.remote_version})</span>
                </div>
                <p className="text-edgemind-text text-sm">{remoteText}</p>
                <p className="text-xs text-edgemind-textMuted mt-1">Importance: {(conflict.remote_payload?.importance * 100).toFixed(0)}%</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 text-edgemind-textMuted hover:text-edgemind-accent transition-colors flex-shrink-0"
          >
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="border-t border-edgemind-border/50 px-4 pb-4"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm">
              <div>
                <p className="text-edgemind-textMuted mb-1">Created</p>
                <p className="font-mono">{formatTime(conflict.created_at)}</p>
              </div>
              <div>
                <p className="text-edgemind-textMuted mb-1">Status</p>
                <p className="font-mono capitalize">{conflict.status}</p>
              </div>
              <div>
                <p className="text-edgemind-textMuted mb-1">Version Diff</p>
                <p className="font-mono">Local v{conflict.local_version} vs Remote v{conflict.remote_version}</p>
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-edgemind-textMuted text-sm">Select Resolution Strategy</p>
              <div className="flex gap-3">
                {(['LOCAL_WINS', 'REMOTE_WINS', 'MANUAL'] as const).map((res) => (
                  <button
                    key={res}
                    onClick={() => {
                      setResolution(res)
                      conflictsApi.resolve(conflict.id, res)
                    }}
                    disabled={conflict.status === 'resolved'}
                    className={`flex-1 py-2 px-4 rounded-lg border transition-all ${
                      resolution === res
                        ? resolutionColors[res] + ' border-current'
                        : 'text-edgemind-textMuted border-edgemind-border/50 hover:border-edgemind-accent/50'
                    }`}
                  >
                    {res === 'LOCAL_WINS' && <Database className="w-4 h-4 mr-2 inline" />}
                    {res === 'REMOTE_WINS' && <Cloud className="w-4 h-4 mr-2 inline" />}
                    {res === 'MANUAL' && <Minus className="w-4 h-4 mr-2 inline" />}
                    {res.replace('_', ' ')}
                  </button>
                ))}
              </div>

              {resolution && (
                <div className={`p-3 rounded-lg border ${resolutionColors[resolution]}`}>
                  <p className="text-sm">
                    <strong>Selected: </strong>
                    {resolution === 'LOCAL_WINS' && 'Keep local version - push to cloud'}
                    {resolution === 'REMOTE_WINS' && 'Keep remote version - pull from cloud'}
                    {resolution === 'MANUAL' && 'Manual merge required - review both versions'}
                  </p>
                </div>
              )}

              {conflict.status === 'resolved' && (
                <div className="p-3 bg-emerald-400/10 border border-emerald-400/20 rounded-lg">
                  <p className="text-emerald-400 text-sm flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Conflict resolved: {conflict.resolution?.replace('_', ' ')}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}