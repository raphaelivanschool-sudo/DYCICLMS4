import { useState } from 'react';
import { 
  Monitor, 
  Lock, 
  Power, 
  RefreshCw, 
  Eye, 
  Wifi,
  Loader2,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { sendCommand, wakeAgent } from '../api/agentApi';

export function MachineCard({ machine, onViewScreen }) {
  const [loading, setLoading] = useState({});
  const [toast, setToast] = useState(null);

  const isOnline = machine.status === 'ONLINE';
  
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleCommand = async (cmd) => {
    setLoading(prev => ({ ...prev, [cmd]: true }));
    try {
      if (cmd === 'wake') {
        await wakeAgent(machine.mac);
      } else {
        await sendCommand(machine.id, cmd);
      }
      showToast(`${cmd.charAt(0).toUpperCase() + cmd.slice(1)} command sent successfully`);
    } catch (err) {
      showToast(err.message || `Failed to send ${cmd} command`, 'error');
    } finally {
      setLoading(prev => ({ ...prev, [cmd]: false }));
    }
  };

  const Button = ({ cmd, icon: Icon, label, disabled }) => (
    <button
      onClick={() => handleCommand(cmd)}
      disabled={disabled || loading[cmd]}
      className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-all
        ${disabled 
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600' 
          : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-sm dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700'
        }`}
    >
      {loading[cmd] ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Icon className="w-4 h-4" />
      )}
      {label}
    </button>
  );

  return (
    <div className={`relative rounded-xl border p-4 transition-all
      ${isOnline 
        ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' 
        : 'bg-gray-50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-800 opacity-75'
      }`}
    >
      {/* Status Indicator */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
        <span className={`text-xs font-medium ${isOnline ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 rounded-lg ${isOnline ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-gray-100 dark:bg-gray-800'}`}>
          <Monitor className={`w-5 h-5 ${isOnline ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-600'}`} />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{machine.hostname}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{machine.ipAddress}</p>
        </div>
      </div>

      {/* Info */}
      <div className="space-y-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-2">
          <Wifi className="w-4 h-4" />
          <span>MAC: {machine.mac}</span>
        </div>
        <div className="flex items-center gap-2">
          <Monitor className="w-4 h-4" />
          <span>Platform: {machine.platform}</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        <Button cmd="lock" icon={Lock} label="Lock" disabled={!isOnline} />
        <Button cmd="shutdown" icon={Power} label="Shutdown" disabled={!isOnline} />
        <Button cmd="restart" icon={RefreshCw} label="Restart" disabled={!isOnline} />
        <button
          onClick={() => onViewScreen(machine.id)}
          disabled={!isOnline}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-all
            ${!isOnline 
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600' 
              : 'bg-blue-50 hover:bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50'
            }`}
        >
          <Eye className="w-4 h-4" />
          View Screen
        </button>
        <Button cmd="wake" icon={Wifi} label="Wake" disabled={isOnline} />
      </div>

      {/* Toast */}
      {toast && (
        <div className={`mt-4 p-3 rounded-lg text-sm flex items-center gap-2
          ${toast.type === 'success' 
            ? 'bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-300' 
            : 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <XCircle className="w-4 h-4" />
          )}
          {toast.message}
        </div>
      )}
    </div>
  );
}
