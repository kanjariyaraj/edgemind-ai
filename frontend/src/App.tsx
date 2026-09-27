import { Routes, Route } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Layout from './layouts/Layout'
import Overview from './pages/Overview'
import MemoryExplorer from './pages/MemoryExplorer'
import SemanticSearch from './pages/SemanticSearch'
import DecisionObservatory from './pages/DecisionObservatory'
import SyncCenter from './pages/SyncCenter'
import ConflictCenter from './pages/ConflictCenter'
import SystemArchitecture from './pages/SystemArchitecture'

function App() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Overview />} />
          <Route path="memory" element={<MemoryExplorer />} />
          <Route path="search" element={<SemanticSearch />} />
          <Route path="decisions" element={<DecisionObservatory />} />
          <Route path="sync" element={<SyncCenter />} />
          <Route path="conflicts" element={<ConflictCenter />} />
          <Route path="system" element={<SystemArchitecture />} />
        </Route>
      </Routes>
    </AnimatePresence>
  )
}

export default App