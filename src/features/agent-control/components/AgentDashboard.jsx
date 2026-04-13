import { useEffect } from 'react';
import { Monitor, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { AlertBanner } from './AlertBanner';

export function AgentDashboard({ stats, alerts, onRefresh }) {
  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      onRefresh?.();
    }, 30000);

    return () => clearInterval(interval);
  }, [onRefresh]);

  const StatCard = ({ icon: Icon, label, value, color, bgColor }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-lg ${bgColor}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={Monitor}
          label="Total Machines"
          value={stats.total}
          color="text-blue-600 dark:text-blue-400"
          bgColor="bg-blue-50 dark:bg-blue-900/20"
        />
        <StatCard
          icon={Wifi}
          label="Online"
          value={stats.online}
          color="text-green-600 dark:text-green-400"
          bgColor="bg-green-50 dark:bg-green-900/20"
        />
        <StatCard
          icon={WifiOff}
          label="Offline"
          value={stats.offline}
          color="text-red-600 dark:text-red-400"
          bgColor="bg-red-50 dark:bg-red-900/20"
        />
      </div>

      {/* Alerts */}
      {alerts && alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <AlertBanner
              key={index}
              type="warning"
              message={`${alert.hostname}: ${alert.reason}`}
            />
          ))}
        </div>
      )}

      {/* No Alerts State */}
      {alerts && alerts.length === 0 && stats.total > 0 && (
        <div className="flex items-center gap-2 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <Wifi className="w-5 h-5 text-green-600 dark:text-green-400" />
          <span className="text-sm text-green-700 dark:text-green-300">
            All systems operational
          </span>
        </div>
      )}
    </div>
  );
}
