import { useState, useCallback } from 'react';
import { Monitor } from 'lucide-react';
import { useMachines } from '../hooks/useMachines';
import { useAgentSocket } from '../hooks/useAgentSocket';
import { useScreenStream } from '../hooks/useScreenStream';
import { AgentDashboard } from '../components/AgentDashboard';
import { MachineGrid } from '../components/MachineGrid';
import { ScreenViewer } from '../components/ScreenViewer';
import { ActivityLog } from '../components/ActivityLog';

export function AgentControlPage() {
  const { machines, stats, isLoading, error, updateMachineStatus, refetch } = useMachines();
  const [newCommands, setNewCommands] = useState([]);

  // Handle WebSocket messages
  const handleSocketMessage = useCallback((message) => {
    switch (message.type) {
      case 'agent_online':
        updateMachineStatus(message.agentId, 'ONLINE');
        break;
      case 'agent_offline':
        updateMachineStatus(message.agentId, 'OFFLINE');
        break;
      case 'command_sent':
        setNewCommands(prev => [{
          id: Date.now(),
          timestamp: new Date().toISOString(),
          agent: { hostname: message.hostname },
          command: message.command,
          user: { username: message.issuedBy },
          status: 'SENT'
        }, ...prev]);
        break;
      default:
        break;
    }
  }, [updateMachineStatus]);

  const socket = useAgentSocket(handleSocketMessage);
  const { currentFrame, viewingId, setViewingId } = useScreenStream(socket);

  const viewingMachine = machines.find(m => m.id === viewingId);

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <Monitor className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
            Agent Control
          </h1>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 ml-9">
          Monitor and control remote machines across your network
        </p>
      </div>

      {/* Error State */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-500 dark:text-gray-400">Loading machines...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Dashboard Stats */}
          <AgentDashboard 
            stats={stats} 
            alerts={stats.alerts}
            onRefresh={refetch}
          />

          {/* Machine Grid */}
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Machines
            </h2>
            <MachineGrid 
              machines={machines}
              onViewScreen={setViewingId}
            />
          </section>

          {/* Screen Viewer */}
          {viewingId && (
            <section>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Screen Stream
              </h2>
              <ScreenViewer
                frame={currentFrame}
                machineId={viewingId}
                hostname={viewingMachine?.hostname}
                onClose={() => setViewingId(null)}
              />
            </section>
          )}

          {/* Activity Log */}
          <section>
            <ActivityLog newCommands={newCommands} />
          </section>
        </div>
      )}
    </div>
  );
}
