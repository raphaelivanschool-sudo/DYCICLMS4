import {
  Building2,
  Monitor,
  Users,
  Ticket,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock
} from 'lucide-react';

// Mock data
const stats = [
  { name: 'Total Labs', value: '5', change: '+2', changeType: 'increase', icon: Building2 },
  { name: 'Online Computers', value: '42', change: '+5', changeType: 'increase', icon: Monitor },
  { name: 'Active Sessions', value: '18', change: '-3', changeType: 'decrease', icon: Users },
  { name: 'Open Tickets', value: '7', change: '+1', changeType: 'increase', icon: Ticket },
];

const labs = [
  { id: 1, name: 'EdTech Laboratory', building: 'Building A', instructor: 'Mr. Cruz', computers: 15, online: 12, offline: 3, status: 'active' },
  { id: 2, name: 'Sandbox', building: 'Building B', instructor: 'Ms. Dela Vega', computers: 12, online: 10, offline: 2, status: 'active' },
  { id: 3, name: 'Nexus', building: 'Building C', instructor: 'Mr. Ramirez', computers: 10, online: 8, offline: 2, status: 'active' },
  { id: 4, name: 'Innovation Hub', building: 'Building D', instructor: 'Ms. Santos', computers: 20, online: 0, offline: 20, status: 'maintenance' },
  { id: 5, name: 'Tech Lab 5', building: 'Building E', instructor: 'Mr. Garcia', computers: 18, online: 15, offline: 3, status: 'active' },
];

const recentLogs = [
  { id: 1, timestamp: '2025-02-22 14:30', user: 'Student 01', action: 'User Login', computer: 'EDT-PC01', lab: 'EdTech Laboratory', status: 'success' },
  { id: 2, timestamp: '2025-02-22 14:28', user: 'Student 03', action: 'App Blocked', computer: 'EDT-PC03', lab: 'EdTech Laboratory', status: 'warning' },
  { id: 3, timestamp: '2025-02-22 14:25', user: 'Student 09', action: 'Internet Disabled', computer: 'SND-PC02', lab: 'Sandbox', status: 'success' },
  { id: 4, timestamp: '2025-02-22 14:22', user: 'Admin', action: 'Screen Locked', computer: 'NXS-PC01', lab: 'Nexus', status: 'success' },
  { id: 5, timestamp: '2025-02-22 14:20', user: 'Student 05', action: 'System Command', computer: 'EDT-PC05', lab: 'EdTech Laboratory', status: 'error' },
];

const Badge = ({ variant, children }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    destructive: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variants[variant] || variants.default}`}>
      {children}
    </span>
  );
};

function Dashboard() {
  const getStatusBadge = (status) => {
    const variants = {
      active: 'success',
      maintenance: 'warning',
      offline: 'destructive',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const getLogStatusBadge = (status) => {
    const variants = {
      success: 'success',
      warning: 'warning',
      error: 'destructive',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500">Welcome back! Here's what's happening in your laboratories.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          const ChangeIcon = stat.changeType === 'increase' ? ArrowUpRight : ArrowDownRight;
          return (
            <div key={stat.name} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="p-0">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center mt-4">
                  <ChangeIcon className={`w-4 h-4 mr-1 ${stat.changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`} />
                  <span className={`text-sm font-medium ${stat.changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-400 ml-2">vs last week</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lab Status Overview */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">Laboratory Status Overview</h3>
              <p className="text-sm text-gray-500 mt-1">Real-time status of all computer laboratories</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {labs.map((lab) => (
                  <div key={lab.id} className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-900">{lab.name}</h3>
                        <p className="text-sm text-gray-500">{lab.building} • {lab.instructor}</p>
                      </div>
                      {getStatusBadge(lab.status)}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-gray-600">{lab.online} Online</span>
                        </div>
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                          <span className="text-gray-600">{lab.offline} Offline</span>
                        </div>
                      </div>
                      <span className="text-gray-400">{lab.computers} Total</span>
                    </div>
                    <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${(lab.online / lab.computers) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent System Logs */}
        <div>
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-blue-600" />
                Recent System Logs
              </h3>
              <p className="text-sm text-gray-500 mt-1">Latest activities across all labs</p>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentLogs.map((log) => (
                  <div key={log.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{log.action}</p>
                      <p className="text-xs text-gray-500">{log.user} • {log.computer}</p>
                      <p className="text-xs text-gray-400 mt-1">{log.timestamp}</p>
                    </div>
                    {getLogStatusBadge(log.status)}
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors">
                View All Logs →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
