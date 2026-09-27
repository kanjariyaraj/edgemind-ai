import { motion } from 'framer-motion'
import { 
  Cpu, 
  Database, 
  Brain, 
  Zap, 
  GitBranch, 
  Cloud, 
  Shield,
  ArrowRight,
  ArrowDown,
  Server,
  HardDrive,
  Network,
  Layers,
  Filter,
  Eye
} from 'lucide-react'

const architectureLayers = [
  {
    id: 'edge-device',
    label: 'EDGE DEVICE',
    icon: Cpu,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
    borderColor: 'border-blue-400/20',
    components: [
      { name: 'Ingestion Pipeline', desc: 'Normalize & chunk input data', icon: Filter },
      { name: 'Local Embeddings', desc: 'FastEmbed (all-MiniLM-L6-v2)', icon: Brain },
      { name: 'Memory Governor', desc: 'Importance, decay, decisions', icon: Zap },
      { name: 'Decision Engine', desc: 'Local Policy / Jev (online)', icon: Shield },
    ],
  },
  {
    id: 'storage',
    label: 'LOCAL STORAGE',
    icon: Database,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-400/10',
    borderColor: 'border-emerald-400/20',
    components: [
      { name: 'Qdrant Edge', desc: 'Vector storage (384-dim)', icon: Layers },
      { name: 'SQLite', desc: 'Metadata, sync queue, conflicts', icon: HardDrive },
      { name: 'Decision Cache', desc: 'Cached Jev/local decisions', icon: Eye },
    ],
  },
  {
    id: 'retrieval',
    label: 'HYBRID RETRIEVAL',
    icon: Brain,
    color: 'text-purple-400',
    bgColor: 'bg-purple-400/10',
    borderColor: 'border-purple-400/20',
    components: [
      { name: 'Dense Search', desc: 'Semantic vector similarity', icon: Layers },
      { name: 'Sparse Search', desc: 'BM25 keyword matching', icon: Filter },
      { name: 'Hybrid Fusion', desc: 'α·dense + β·sparse (configurable)', icon: ArrowRight },
      { name: 'Reranker', desc: 'Cross-encoder (optional)', icon: Eye },
    ],
  },
  {
    id: 'sync',
    label: 'SYNC ENGINE',
    icon: GitBranch,
    color: 'text-amber-400',
    bgColor: 'bg-amber-400/10',
    borderColor: 'border-amber-400/20',
    components: [
      { name: 'Sync Queue', desc: 'SQLite-backed operation queue', icon: Database },
      { name: 'Worker', desc: 'Retry + exponential backoff', icon: ArrowDown },
      { name: 'Reconciliation', desc: 'Version-based conflict detection', icon: GitBranch },
      { name: 'Cloud Provider', desc: 'Qdrant Cloud / Mock abstraction', icon: Cloud },
    ],
  },
  {
    id: 'cloud',
    label: 'CLOUD (OPTIONAL)',
    icon: Cloud,
    color: 'text-orange-400',
    bgColor: 'bg-orange-400/10',
    borderColor: 'border-orange-400/20',
    components: [
      { name: 'Qdrant Cloud', desc: 'Global memory cluster', icon: Server },
      { name: 'Jev API', desc: 'Advanced decision evaluation', icon: Brain },
      { name: 'Fleet Management', desc: 'Multi-device coordination', icon: Network },
    ],
  },
]

const dataFlow = [
  { from: 'Ingestion', to: 'Embeddings', desc: 'Text → Vector' },
  { from: 'Embeddings', to: 'Qdrant Edge', desc: 'Store vectors' },
  { from: 'Qdrant Edge', to: 'Hybrid Retrieval', desc: 'Search vectors' },
  { from: 'Hybrid Retrieval', to: 'Memory Governor', desc: 'Score & rank' },
  { from: 'Memory Governor', to: 'Decision Engine', desc: 'Evaluate importance' },
  { from: 'Decision Engine', to: 'Sync Engine', desc: 'Queue if needed' },
  { from: 'Sync Engine', to: 'Cloud', desc: 'Replicate (online)' },
]

export default function SystemArchitecture() {
  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold">System Architecture</h1>
          <p className="text-edgemind-textMuted mt-1">EdgeMind component overview and data flow</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-6"
      >
        {architectureLayers.map((layer, layerIndex) => (
          <motion.div
            key={layer.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + layerIndex * 0.1 }}
            className={`glass-panel rounded-xl p-6 border-l-4 ${layer.borderColor} ${layer.bgColor}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-lg ${layer.bgColor} ${layer.borderColor} flex items-center justify-center`}>
                <layer.icon className={`w-5 h-5 ${layer.color}`} />
              </div>
              <div>
                <h2 className="text-xl font-bold">{layer.label}</h2>
                <p className="text-sm text-edgemind-textMuted">Core components and responsibilities</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {layer.components.map((comp, compIndex) => (
                <motion.div
                  key={comp.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + layerIndex * 0.1 + compIndex * 0.05 }}
                  className="glass-panel p-4 rounded-lg hover:bg-edgemind-panelHover/50 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`w-8 h-8 rounded-lg ${layer.bgColor} ${layer.borderColor} flex items-center justify-center`}>
                      <comp.icon className={`w-4 h-4 ${layer.color}`} />
                    </div>
                    <h3 className="font-medium text-edgemind-text">{comp.name}</h3>
                  </div>
                  <p className="text-sm text-edgemind-textMuted">{comp.desc}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-panel rounded-xl p-6"
        >
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <ArrowRight className="w-5 h-5 text-edgemind-accent" />
            Data Flow Pipeline
          </h2>
          <div className="overflow-x-auto">
            <div className="flex items-center gap-4 min-w-max pb-4">
              {dataFlow.map((flow, index) => (
                <motion.div
                  key={flow.from}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center gap-4"
                >
                  <div className="flex flex-col items-center">
                    <div className="w-32 h-24 glass-panel rounded-lg p-3 flex flex-col items-center justify-center text-center border border-edgemind-border/50">
                      <p className="font-medium text-sm text-edgemind-text">{flow.from}</p>
                    </div>
                    {index < dataFlow.length - 1 && (
                      <div className="flex items-center gap-1 mt-2 text-edgemind-accent">
                        <ArrowRight className="w-5 h-5" />
                        <span className="text-xs font-mono">{flow.desc}</span>
                      </div>
                    )}
                  </div>
                  {index < dataFlow.length - 1 && (
                    <div className="flex items-center text-edgemind-border/50">
                      <ArrowRight className="w-6 h-6" />
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="glass-panel rounded-xl p-6"
        >
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-edgemind-accent" />
            Key Design Principles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: 'Offline-First', desc: 'Full functionality without internet. Local embeddings, search, decisions, and queuing.' },
              { title: 'Decision Control', desc: 'Every memory evaluated by Governor. KEEP_LOCAL, SYNC, COMPRESS, DEFER, DISCARD with explanations.' },
              { title: 'Hybrid Retrieval', desc: 'Dense semantic + sparse keyword fusion. Configurable α/β weights. Optional cross-encoder reranking.' },
              { title: 'Conflict Aware', desc: 'Version-based detection. LOCAL_WINS, REMOTE_WINS, MANUAL resolution. No silent overwrites.' },
              { title: 'Sensitivity Labels', desc: 'PUBLIC, INTERNAL, PRIVATE. Private memories never leave device by default.' },
              { title: 'Observable', desc: 'Structured audit logs. Decision cache with hit/miss stats. Real-time dashboard metrics.' },
            ].map((principle, index) => (
              <motion.div
                key={principle.title}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.05 }}
                className="glass-panel p-4 rounded-lg"
              >
                <h3 className="font-semibold text-edgemind-text mb-1">{principle.title}</h3>
                <p className="text-sm text-edgemind-textMuted">{principle.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}