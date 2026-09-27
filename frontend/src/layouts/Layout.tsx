import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Database, 
  Search, 
  Brain, 
  GitBranch, 
  AlertTriangle, 
  Cpu,
  Wifi,
  WifiOff,
  AlertCircle
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../services/api'

const navItems = [
  { path: '/', label: 'Command Center', icon: LayoutDashboard },
  { path: '/memory', label: 'Memory Explorer', icon: Database },
  { path: '/search', label: 'Semantic Search', icon: Search },
  { path: '/decisions', label: 'Decision Observatory', icon: Brain },
  { path: '/sync', label: 'Sync Center', icon: GitBranch },
  { path: '/conflicts', label: 'Conflict Center', icon: AlertTriangle },
  { path: '/system', label: 'System Architecture', icon: Cpu },
]

export default function Layout() {
  const location = useLocation()
  const { data: systemStatus } = useQuery({
    queryKey: ['systemStatus'],
    queryFn: () => api.getSystemStatus(),
    refetchInterval: 10000,
  })

  const connectivity = systemStatus?.connectivity || 'offline'

  return (
    <div className="min-h-screen flex">
      <aside className="w-64 glass-panel border-r border-edgemind-border/50 flex flex-col hidden lg:flex">
        <div className="p-6 border-b border-edgemind-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-edgemind-accent to-teal-600 flex items-center justify-center">
              <Cpu className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-edgemind-text">EdgeMind</h1>
              <p className="text-xs text-edgemind-textMuted">Decision-Controlled Memory</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-edgemind-accent/10 text-edgemind-accent border border-edgemind-accent/20'
                      : 'text-edgemind-textMuted hover:text-edgemind-text hover:bg-edgemind-panelHover'
                  }`
                }
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="p-4 border-t border-edgemind-border/50">
          <div className="glass-panel p-3 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <div className={`status-indicator ${connectivity === 'online' ? 'status-online' : connectivity === 'degraded' ? 'status-degraded' : 'status-offline'}`} />
              <span className="text-sm font-medium capitalize">{connectivity}</span>
            </div>
            <div className="flex items-center justify-between text-xs text-edgemind-textMuted">
              <span>Cloud Sync</span>
              <span className={systemStatus?.cloud_available ? 'text-edgemind-online' : 'text-edgemind-offline'}>
                {systemStatus?.cloud_available ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-edgemind-textMuted mt-1">
              <span>Local Qdrant</span>
              <span className={systemStatus?.local_qdrant_available ? 'text-edgemind-online' : 'text-edgemind-offline'}>
                {systemStatus?.local_qdrant_available ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-edgemind-textMuted mt-1">
              <span>Jev Engine</span>
              <span className={systemStatus?.jev_enabled && systemStatus?.cloud_available ? 'text-edgemind-online' : 'text-edgemind-offline'}>
                {systemStatus?.jev_enabled && systemStatus?.cloud_available ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 glass-panel border-b border-edgemind-border/50 px-6 flex items-center justify-between lg:hidden">
          <h1 className="text-lg font-bold">EdgeMind</h1>
          <div className={`status-indicator ${connectivity === 'online' ? 'status-online' : connectivity === 'degraded' ? 'status-degraded' : 'status-offline'}`} />
        </header>

        <div className="flex-1 overflow-auto p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}