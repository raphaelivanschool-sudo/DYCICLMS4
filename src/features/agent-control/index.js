// Agent Control Feature Module
// Export all components, hooks, and utilities

// Components
export { AgentDashboard } from './components/AgentDashboard';
export { MachineGrid } from './components/MachineGrid';
export { MachineCard } from './components/MachineCard';
export { ScreenViewer } from './components/ScreenViewer';
export { ActivityLog } from './components/ActivityLog';
export { AlertBanner } from './components/AlertBanner';
export { VNCViewer } from './components/VNCViewer';

// Hooks
export { useAgentSocket } from './hooks/useAgentSocket';
export { useMachines } from './hooks/useMachines';
export { useScreenStream } from './hooks/useScreenStream';

// API
export {
  getAgents,
  getStats,
  sendCommand,
  wakeAgent,
  getAgentLogs,
  getAllLogs
} from './api/agentApi';

// Pages
export { AgentControlPage } from './pages/AgentControlPage';
