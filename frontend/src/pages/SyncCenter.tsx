import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { 
  GitBranch, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  MoreVertical,
  Database,
  Cloud,
  RotateCcw
} from 'lucide-react'
import { syncApi } from '../services/api'

const statusColors = {
  PENDING: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  PROCESSING: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  SYNCED: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  FAILED: 'text-red-400 bg-red-400/10 border-red-400/20',
  CONFLICT: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
}

const statusIcons = {
  PENDING: Clock,
  PROCESSING: RotateCcw,
  SYNCED: CheckCircle,
  FAILED: XCircle,
  CONFLICT: AlertTriangle,
}

const operationIcons = {
  CREATE: ArrowUp,
  UPDATE: RotateCcw,
  DELETE: XCircle,
}

export default function SyncCenter() {
  const { data: queue, isLoading } = useQuery({
    queryKey: ['syncQueue'],
    queryFn: () => syncApi.queue(),
    refetchInterval: 5000,
  })

  const { data: status } = useQuery({
    queryKey: ['syncStatus'],
    queryFn: () => syncApi.status(),
    refetchInterval: 10000,
  })

  const mockQueue = [
    { operation_id: 'op-1', memory_id: 'mem-abc123', operation: 'CREATE', status: 'SYNCED', attempts: 1, created_at: new Date(Date.now() - 300000).toISOString(), processed_at: new Date(Date.now() - 240000).toISOString() },
    { operation_id: 'op-2', memory_id: 'mem-def456', operation: 'UPDATE', status: 'PENDING', attempts: 0, created_at: new Date(Date.now() - 120000).toISOString() },
    { operation_id: 'op-3', memory_id: 'mem-ghi789', operation: 'CREATE', status: 'FAILED', attempts: 3, last_error: 'Connection timeout', created_at: new Date(Date.now() - 600000).toISOString() },
    { operation_id: 'op-4', memory_id: 'mem-jkl012', operation: 'UPDATE', status: 'CONFLICT', attempts: 1, created_at: new Date(Date.now() - 900000).toISOString() },
  ]

  const displayQueue = queue?.queue || mockQueue

  const stats = {
    total: displayQueue.length,
    pending: displayQueue.filter((q: any) => q.status === 'PENDING').length,
    processing: displayQueue.filter((q: any) => q.status === 'PROCESSING').length,
    synced: displayQueue.filter((q: any) => q.status === 'SYNCED').length,
    failed: displayQueue.filter((q: any) => q.status === 'FAILED').length,
    conflict: displayQueue.filter((q: any) => q.status === 'CONFLICT').length,
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">Sync Center</h1>
          <p className="text-edgemind-textMuted mt-1">Monitor and manage memory synchronization</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`status-indicator ${status?.cloud_available ? 'status-online' : 'status-offline'}`} />
          <span className="text-sm font-medium">{status?.cloud_available ? 'Cloud Connected' : 'Offline Mode'}</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-6 gap-4"
      >
        <StatCard label="Total Operations" value={stats.total} icon={GitBranch} color="text-blue-400" />
        <StatCard label="Pending" value={stats.pending} icon={Clock} color="text-amber-400" />
        <StatCard label="Processing" value={stats.processing} icon={RotateCcw} color="text-blue-400" />
        <StatCard label="Synced" value={stats.synced} icon={CheckCircle} color="text-emerald-400" />
        <StatCard label="Failed" value={stats.failed} icon={XCircle} color="text-red-400" />
        <StatCard label="Conflicts" value={stats.conflict} icon={AlertTriangle} color="text-purple-400" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel rounded-xl overflow-hidden"
      >
        <div className="p-4 border-b border-edgemind-border/50 flex items-center justify-between">
          <h2 className="font-semibold">Sync Queue</h2>
          <div className="flex items-center gap-2 text-sm text-edgemind-textMuted">
            <span>Auto-refresh: 5s</span>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-edgemind-textMuted">Loading queue...</div>
        ) : displayQueue.length > 0 ? (
          <div className="divide-y divide-edgemind-border/50">
            {displayQueue.map((item: any, index) => (
              <SyncQueueRow key={item.operation_id} item={item} index={index} />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <GitBranch className="w-12 h-12 mx-auto text-edgemind-textMuted mb-4 opacity-50" />
            <p className="text-edgemind-textMuted">Sync queue is empty</p>
            <p className="text-sm text-edgemind-textMuted mt-1">Operations will appear here when memories are queued for sync</p>
          </div>
        )}
      </motion.div>
    </div>
  )
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
  return (
    <motion.div className="metric-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-edgemind-textMuted">{label}</p>
          <p className="text-3xl font-bold text-edgemind-text mt-1">{value}</p>
        </div>
        <Icon className={`${color} w-8 h-8 opacity-80`} />
      </div>
    </motion.div>
  )
}

function SyncQueueRow({ item, index }: { item: any; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const StatusIcon = statusIcons[item.status as keyof typeof statusIcons] || Clock
  const OperationIcon = operationIcons[item.operation as keyof typeof operationIcons] || ArrowUp
  const colorClass = statusColors[item.status as keyof typeof statusColors] || statusColors.PENDING

  const formatTime = (dateStr: string) => {
    if (!dateStr) return 'N/A'
    const date = new Date(dateStr)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    return date.toLocaleDateString()
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="p-4 hover:bg-edgemind-panelHover/50 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center flex-shrink-0`}>
          <OperationIcon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-xs text-edgemind-textMuted">{item.operation_id.slice(0, 12)}...</span>
            <span className={`px-2 py-0.5 text-xs rounded border ${colorClass}`}>{item.status}</span>
            <span className="px-2 py-0.5 text-xs rounded border bg-edgemind-bg border-edgemind-border/50 text-edgemind-textMuted">{item.operation}</span>
          </div>
          <p className="text-edgemind-textMuted text-sm font-mono">{item.memory_id.slice(0, 12)}...</p>
        </div>
        <div className="text-right text-sm text-edgemind-textMuted">
          <p>Attempts: <span className="text-edgemind-text font-mono">{item.attempts}</span></p>
          <p>Created: <span className="text-edgemind-text font-mono">{formatTime(item.created_at)}</span></p>
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
          className="mt-4 pt-4 border-t border-edgemind-border/50"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <p className="text-edgemind-textMuted text-sm mb-1">Memory ID</p>
              <p className="font-mono text-xs">{item.memory_id}</p>
            </div>
            <div>
              <p className="text-edgemind-textMuted text-sm mb-1">Operation</p>
              <p className="font-mono text-xs">{item.operation}</p>
            </div>
            <div>
              <p className="text-edgemind-textMuted text-sm mb-1">Created</p>
              <p className="font-mono text-xs">{new Date(item.created_at).toLocaleString()}</p>
            </div>
            {item.processed_at && (
              <div>
                <p className="text-edgemind-textMuted text-sm mb-1">Processed</p>
                <p className="font-mono text-xs">{new Date(item.processed_at).toLocaleString()}</p>
              </div>
            )}
            <div>
              <p className="text-edgemind-textMuted text-sm mb-1">Attempts</p>
              <p className="font-mono text-xs">{item.attempts}</p>
            </div>
            {item.last_error && (
              <div className="md:col-span-3">
                <p className="text-edgemind-textMuted text-sm mb-1">Last Error</p>
                <p className="font-mono text-xs text-red-400">{item.last_error}</p>
              </div>
            )}
          </div>

          {item.status === 'FAILED' && (
            <button
              onClick={() => syncApi.retry(item.operation_id)}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Retry Operation
            </button>
          )}
          {item.status === 'CONFLICT' && (
            <div className="flex gap-2">
              <button className="btn-primary flex-1">View Conflict</button>
              <button className="btn-secondary">Resolve</button>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}