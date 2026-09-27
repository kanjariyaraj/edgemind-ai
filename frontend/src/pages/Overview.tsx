import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { 
  Database, 
  HardDrive, 
  Cloud, 
  AlertTriangle, 
  Activity, 
  Zap,
  CheckCircle,
  XCircle,
  Clock,
  Brain,
  ArrowUpDown
} from 'lucide-react'
import { dashboardApi, systemApi, syncApi } from '../services/api'

const metricCards = [
  { key: 'total_memories', label: 'Total Memories', icon: Database, color: 'text-blue-400' },
  { key: 'local_memories', label: 'Local Only', icon: HardDrive, color: 'text-emerald-400' },
  { key: 'synced_memories', label: 'Synced', icon: Cloud, color: 'text-purple-400' },
  { key: 'pending_sync', label: 'Pending Sync', icon: ArrowUpDown, color: 'text-amber-400' },
  { key: 'conflicts', label: 'Conflicts', icon: AlertTriangle, color: 'text-red-400' },
  { key: 'failed_sync', label: 'Failed Sync', icon: XCircle, color: 'text-orange-400' },
]

export default function Overview() {
  const { data: metrics } = useQuery({
    queryKey: ['dashboardMetrics'],
    queryFn: () => dashboardApi.metrics(),
    refetchInterval: 5000,
  })

  const { data: systemStatus } = useQuery({
    queryKey: ['systemStatus'],
    queryFn: () => systemApi.getStatus(),
    refetchInterval: 10000,
  })

  const { data: syncStatus } = useQuery({
    queryKey: ['syncStatus'],
    queryFn: () => syncApi.status(),
    refetchInterval: 5000,
  })

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-edgemind-text">Command Center</h1>
          <p className="text-edgemind-textMuted mt-1">EdgeMind system overview and real-time status</p>
        </div>
        <div className="flex items-center gap-3">
          <div className={`status-indicator ${systemStatus?.connectivity === 'online' ? 'status-online' : systemStatus?.connectivity === 'degraded' ? 'status-degraded' : 'status-offline'}`} />
          <span className="text-sm font-medium capitalize">{systemStatus?.connectivity || 'unknown'}</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
      >
        {metricCards.map((metric, index) => {
          const Icon = metric.icon
          const value = metrics?.[metric.key] ?? 'N/A'
          return (
            <motion.div
              key={metric.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
              className="metric-card"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-edgemind-textMuted">{metric.label}</p>
                  <p className="text-3xl font-bold text-edgemind-text mt-1">{value}</p>
                </div>
                <Icon className={`${metric.color} w-8 h-8 opacity-80`} />
              </div>
            </motion.div>
          )
        })}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="glass-panel rounded-xl p-6"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-edgemind-accent" />
            System Health
          </h2>
          <div className="space-y-3">
            <HealthRow label="API Server" status="healthy" />
            <HealthRow label="Local Qdrant" status={systemStatus?.local_qdrant_available ? 'healthy' : 'unhealthy'} />
            <HealthRow label="Embeddings" status={systemStatus?.embeddings_available ? 'healthy' : 'unhealthy'} />
            <HealthRow label="Cloud Connection" status={systemStatus?.cloud_available ? 'healthy' : 'degraded'} />
            <HealthRow label="Sync Engine" status={syncStatus?.status === 'running' ? 'healthy' : 'idle'} />
            <HealthRow label="Decision Cache" status="healthy" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="glass-panel rounded-xl p-6"
        >
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-edgemind-accent" />
            Decision Engine
          </h2>
          <div className="space-y-3">
            <DecisionRow label="Mode" value={systemStatus?.jev_enabled ? 'Jev (Online)' : 'Local Policy'} />
            <DecisionRow label="Cache Hit Rate" value={metrics?.cache_hits ? `${Math.round((metrics.cache_hits / (metrics.cache_hits + metrics.cache_misses)) * 100)}%` : 'N/A'} />
            <DecisionRow label="Total Decisions" value={metrics?.decision_count || 'N/A'} />
            <DecisionRow label="Avg Latency" value={metrics?.average_decision_latency ? `${metrics.average_decision_latency}ms` : 'N/A'} />
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
        className="glass-panel rounded-xl p-6"
      >
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-edgemind-accent" />
          Recent Activity
        </h2>
        <div className="space-y-3 text-sm">
          <ActivityRow 
            icon={CheckCircle} 
            iconColor="text-edgemind-online" 
            text="System initialized successfully" 
            time="Just now" 
          />
          <ActivityRow 
            icon={Database} 
            iconColor="text-blue-400" 
            text="Local Qdrant connection established" 
            time="1 min ago" 
          />
          <ActivityRow 
            icon={Brain} 
            iconColor="text-purple-400" 
            text="Local decision policy loaded" 
            time="1 min ago" 
          />
          {systemStatus?.cloud_available && (
            <ActivityRow 
              icon={Cloud} 
              iconColor="text-edgemind-accent" 
              text="Cloud sync connection established" 
              time="2 min ago" 
            />
          )}
          {!systemStatus?.cloud_available && (
            <ActivityRow 
              icon={WifiOff} 
              iconColor="text-edgemind-textMuted" 
              text="Running in offline mode" 
              time="2 min ago" 
            />
          )}
        </div>
      </motion.div>
    </div>
  )
}

function HealthRow({ label, status }: { label: string; status: string }) {
  const statusConfig = {
    healthy: { color: 'text-edgemind-online', icon: CheckCircle, label: 'Healthy' },
    degraded: { color: 'text-edgemind-degraded', icon: AlertTriangle, label: 'Degraded' },
    unhealthy: { color: 'text-edgemind-offline', icon: XCircle, label: 'Unhealthy' },
    idle: { color: 'text-edgemind-textMuted', icon: Clock, label: 'Idle' },
  }
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.idle
  const Icon = config.icon
  
  return (
    <div className="flex items-center justify-between">
      <span className="text-edgemind-textMuted">{label}</span>
      <div className="flex items-center gap-2">
        <Icon className={`w-4 h-4 ${config.color}`} />
        <span className={`text-sm font-medium ${config.color}`}>{config.label}</span>
      </div>
    </div>
  )
}

function DecisionRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-edgemind-textMuted">{label}</span>
      <span className="text-sm font-mono text-edgemind-text">{value}</span>
    </div>
  )
}

function ActivityRow({ icon: Icon, iconColor, text, time }: { icon: any; iconColor: string; text: string; time: string }) {
  return (
    <div className="flex items-center gap-3 text-edgemind-textMuted">
      <Icon className={`w-4 h-4 ${iconColor} flex-shrink-0`} />
      <span className="text-edgemind-text">{text}</span>
      <span className="ml-auto text-xs">{time}</span>
    </div>
  )
}