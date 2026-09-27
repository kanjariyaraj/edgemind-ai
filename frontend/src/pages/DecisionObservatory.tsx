import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { 
  Brain, 
  Zap, 
  Filter, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp,
  Circle,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Database,
  Cloud,
  Shield,
  Eye,
  ArrowDown,
  ArrowUp,
  Minus
} from 'lucide-react'
import { decisionsApi, memoryApi } from '../services/api'

const decisionColors = {
  KEEP_LOCAL: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  SYNC: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  COMPRESS: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  DEFER: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  DISCARD: 'text-red-400 bg-red-400/10 border-red-400/20',
  QUEUE_SYNC: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
  SYNC_NOW: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  NO_SYNC_NEEDED: 'text-edgemind-textMuted bg-edgemind-border/20 border-edgemind-border/30',
  LOCAL_WINS: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  REMOTE_WINS: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  MANUAL_REVIEW: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  HIGH_CONFIDENCE: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
  MODERATE_CONFIDENCE: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  LOW_CONFIDENCE: 'text-red-400 bg-red-400/10 border-red-400/20',
  NO_RESULTS: 'text-edgemind-textMuted bg-edgemind-border/20 border-edgemind-border/30',
}

const decisionIcons: Record<string, any> = {
  KEEP_LOCAL: Database,
  SYNC: Cloud,
  COMPRESS: Filter,
  DEFER: Clock,
  DISCARD: XCircle,
  QUEUE_SYNC: ArrowUp,
  SYNC_NOW: Cloud,
  NO_SYNC_NEEDED: CheckCircle,
  LOCAL_WINS: Database,
  REMOTE_WINS: Cloud,
  MANUAL_REVIEW: AlertTriangle,
  HIGH_CONFIDENCE: CheckCircle,
  MODERATE_CONFIDENCE: Minus,
  LOW_CONFIDENCE: XCircle,
  NO_RESULTS: XCircle,
}

export default function DecisionObservatory() {
  const { data: decisions, isLoading } = useQuery({
    queryKey: ['decisions'],
    queryFn: () => decisionsApi.list(),
    refetchInterval: 5000,
  })

  const mockDecisions = [
    {
      id: 'dec-1',
      memory_id: 'mem-abc123',
      eval_type: 'memory',
      decision: 'KEEP_LOCAL',
      reason: ['memory sensitivity=PRIVATE', 'cloud sync prohibited'],
      confidence: 0.95,
      source: 'local_policy',
      mode: 'offline',
      signals: {
        importance: 0.82,
        confidence: 0.91,
        sensitivity: 'private',
        recency_days: 1,
        access_count: 5,
        version: 1,
      },
      effective_importance: 0.78,
      created_at: new Date().toISOString(),
    },
    {
      id: 'dec-2',
      memory_id: 'mem-def456',
      eval_type: 'memory',
      decision: 'SYNC',
      reason: ['high effective importance (0.85)', 'sensitivity=INTERNAL'],
      confidence: 0.88,
      source: 'local_policy',
      mode: 'online',
      signals: {
        importance: 0.9,
        confidence: 0.85,
        sensitivity: 'internal',
        recency_days: 0,
        access_count: 12,
        version: 1,
      },
      effective_importance: 0.85,
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'dec-3',
      memory_id: 'mem-ghi789',
      eval_type: 'sync',
      decision: 'QUEUE_SYNC',
      reason: ['Device is offline, sync queued for later'],
      confidence: 1.0,
      source: 'local_policy',
      mode: 'offline',
      signals: {
        importance: 0.75,
        confidence: 0.9,
        sensitivity: 'internal',
        recency_days: 2,
        access_count: 3,
        version: 1,
      },
      created_at: new Date(Date.now() - 7200000).toISOString(),
    },
  ]

  const displayDecisions = decisions?.decisions || mockDecisions

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">Decision Observatory</h1>
          <p className="text-edgemind-textMuted mt-1">Trace memory decisions from signals to actions</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="glass-panel px-3 py-1 rounded-lg text-sm text-edgemind-textMuted">
            Mode: <span className="text-edgemind-accent font-mono ml-2">Local Policy</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {displayDecisions.map((decision, index) => (
          <DecisionFlowCard
            key={decision.id}
            decision={decision}
            index={index}
          />
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel rounded-xl p-6"
      >
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Brain className="w-5 h-5 text-edgemind-accent" />
          Decision Flow Explanation
        </h2>
        <div className="space-y-4 text-sm">
          <FlowStep 
            step={1} 
            title="Signal Collection" 
            desc="Memory metadata (importance, confidence, sensitivity, recency, access count) is gathered" 
            icon={Database} 
          />
          <FlowStep 
            step={2} 
            title="Memory Governor" 
            desc="Effective importance calculated with decay, access bonus, and confidence factors" 
            icon={Zap} 
          />
          <FlowStep 
            step={3} 
            title="Decision Engine" 
            desc="Local Policy (offline) or Jev (online) evaluates signals against policy rules" 
            icon={Brain} 
          />
          <FlowStep 
            step={4} 
            title="Decision Output" 
            desc="KEEP_LOCAL, SYNC, COMPRESS, DEFER, or DISCARD with reasoning" 
            icon={ArrowRight} 
          />
          <FlowStep 
            step={5} 
            title="Action Execution" 
            desc="Sync queued, memory compressed, or retained locally based on decision" 
            icon={Shield} 
          />
        </div>
      </motion.div>
    </div>
  )
}

function DecisionFlowCard({ decision, index }: { decision: any; index: number }) {
  const [expanded, setExpanded] = useState(false)
  const DecisionIcon = decisionIcons[decision.decision] || Brain
  const colorClass = decisionColors[decision.decision as keyof typeof decisionColors] || 'text-edgemind-textMuted'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 + index * 0.1 }}
      className="glass-panel rounded-xl overflow-hidden"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center flex-shrink-0`}>
            <DecisionIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-edgemind-text">{decision.decision}</p>
                <p className="text-xs text-edgemind-textMuted font-mono">{decision.memory_id?.slice(0, 12)}...</p>
              </div>
              <div className="text-right">
                <p className={`text-sm font-medium ${colorClass}`}>{(decision.confidence * 100).toFixed(0)}% confidence</p>
                <p className="text-xs text-edgemind-textMuted capitalize">{decision.mode}</p>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <span className={`px-2 py-0.5 text-xs rounded border ${colorClass}`}>
                {decision.eval_type}
              </span>
              <span className="px-2 py-0.5 text-xs rounded border bg-edgemind-bg border-edgemind-border/50 text-edgemind-textMuted">
                {decision.source}
              </span>
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-2 text-edgemind-textMuted hover:text-edgemind-accent transition-colors flex-shrink-0"
          >
            {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>

        <div className="mt-4 pt-4 border-t border-edgemind-border/50">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <SignalBadge label="Importance" value={decision.signals?.importance} />
            <SignalBadge label="Confidence" value={decision.signals?.confidence} />
            <SignalBadge label="Recency" value={decision.signals?.recency_days !== undefined ? Math.max(0, 1 - decision.signals.recency_days / 30) : 0} unit="days" raw={decision.signals?.recency_days} />
            <SignalBadge label="Access Count" value={decision.signals?.access_count} max={20} />
            <SignalBadge label="Sensitivity" value={decision.signals?.sensitivity === 'private' ? 1 : decision.signals?.sensitivity === 'internal' ? 0.5 : 0} />
            <SignalBadge label="Version" value={decision.signals?.version} max={10} />
          </div>

          {decision.effective_importance !== undefined && (
            <div className="mt-3">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-edgemind-textMuted">Effective Importance</span>
                <span className="font-mono text-edgemind-accent">{decision.effective_importance.toFixed(2)}</span>
              </div>
              <div className="h-2 bg-edgemind-border/50 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(decision.effective_importance * 100, 100)}%` }}
                  className="h-full bg-edgemind-accent rounded-full"
                />
              </div>
            </div>
          )}

          <div className="mt-3 p-3 bg-edgemind-bg rounded-lg">
            <p className="text-edgemind-textMuted text-sm mb-2">Reasoning</p>
            <ul className="space-y-1 text-sm text-edgemind-text">
              {decision.reason?.map((r: string, i: number) => (
                <li key={i} className="flex items-start gap-2">
                  <Circle className="w-1.5 h-1.5 mt-1.5 text-edgemind-accent flex-shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="border-t border-edgemind-border/50 px-4 pb-4 bg-edgemind-bg/50"
        >
          <div className="text-sm">
            <p className="text-edgemind-textMuted mb-2">Full Decision Context</p>
            <pre className="text-xs text-edgemind-text overflow-auto max-h-60 bg-edgemind-bg p-3 rounded">
              {JSON.stringify(decision, null, 2)}
            </pre>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}

function SignalBadge({ label, value, max = 1, unit = '', raw }: any) {
  const displayValue = raw !== undefined ? `${raw}${unit ? ' ' + unit : ''}` : `${(value * 100).toFixed(0)}%`
  const percentage = max > 1 ? Math.min(value / max, 1) : Math.min(value, 1)
  
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-edgemind-textMuted">{label}</span>
        <span className="font-mono text-edgemind-text">{displayValue}</span>
      </div>
      <div className="h-1.5 bg-edgemind-border/50 rounded-full overflow-hidden">
        <div className="h-full bg-edgemind-accent/50 rounded-full" style={{ width: `${percentage * 100}%` }} />
      </div>
    </div>
  )
}

function FlowStep({ step, title, desc, icon: Icon }: { step: number; title: string; desc: string; icon: any }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-edgemind-accent/20 border border-edgemind-accent/30 flex items-center justify-center">
        <span className="text-edgemind-accent font-bold text-sm">{step}</span>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Icon className="w-5 h-5 text-edgemind-accent" />
          <h3 className="font-semibold text-edgemind-text">{title}</h3>
        </div>
        <p className="text-edgemind-textMuted text-sm ml-7 mt-1">{desc}</p>
      </div>
    </div>
  )
}