import { useState } from 'react';
import {
  Monitor,
  Search,
  Filter,
  Power,
  MessageSquare,
  MoreVertical,
  Lock,
  Unlock
} from 'lucide-react';

// Mock data
const computers = [
  { id: 'EDT-PC01', lab: 'EdTech Laboratory', status: 'online', user: 'Student_09', ip: '192.168.1.101', cpu: 45, memory: 62, uptime: '2h 34m' },
  { id: 'EDT-PC02', lab: 'EdTech Laboratory', status: 'online', user: 'Student_15', ip: '192.168.1.102', cpu: 78, memory: 84, uptime: '2h 23m' },
  { id: 'EDT-PC03', lab: 'EdTech Laboratory', status: 'idle', user: null, ip: '192.168.1.103', cpu: 12, memory: 28, uptime: '3h 45m' },
  { id: 'EDT-PC04', lab: 'EdTech Laboratory', status: 'online', user: 'Student_22', ip: '192.168.1.104', cpu: 34, memory: 56, uptime: '1h 52m' },
  { id: 'SND-PC01', lab: 'Sandbox', status: 'offline', user: null, ip: '192.168.1.201', cpu: 0, memory: 0, uptime: '-' },
  { id: 'SND-PC02', lab: 'Sandbox', status: 'online', user: 'Student_31', ip: '192.168.1.202', cpu: 56, memory: 71, uptime: '2h 10m' },
  { id: 'SND-PC03', lab: 'Sandbox', status: 'online', user: 'Student_42', ip: '192.168.1.203', cpu: 41, memory: 50, uptime: '3h 12m' },
  { id: 'SND-PC04', lab: 'Sandbox', status: 'idle', user: null, ip: '192.168.1.204', cpu: 8, memory: 22, uptime: '4h 20m' },
  { id: 'NXS-PC01', lab: 'Nexus', status: 'online', user: 'Student_03', ip: '192.168.1.301', cpu: 23, memory: 45, uptime: '1h 15m' },
  { id: 'NXS-PC02', lab: 'Nexus', status: 'online', user: 'Student_11', ip: '192.168.1.302', cpu: 67, memory: 78, uptime: '2h 45m' },
  { id: 'NXS-PC03', lab: 'Nexus', status: 'offline', user: null, ip: '192.168.1.303', cpu: 0, memory: 0, uptime: '-' },
  { id: 'NXS-PC04', lab: 'Nexus', status: 'idle', user: null, ip: '192.168.1.304', cpu: 5, memory: 15, uptime: '5h 30m' },
];

const labs = ['All Labs', 'EdTech Laboratory', 'Sandbox', 'Nexus'];

// Helper component for badges
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

function Computers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [labFilter, setLabFilter] = useState('All Labs');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredComputers = computers.filter(comp => {
    const matchesSearch = comp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comp.user?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         comp.ip.includes(searchTerm);
    const matchesLab = labFilter === 'All Labs' || comp.lab === labFilter;
    const matchesStatus = statusFilter === 'all' || comp.status === statusFilter;
    return matchesSearch && matchesLab && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const variants = {
      online: 'success',
      idle: 'warning',
      offline: 'destructive',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getStatusDot = (status) => {
    const colors = {
      online: 'bg-green-500',
      idle: 'bg-yellow-500',
      offline: 'bg-red-500',
    };
    return <div className={`w-2 h-2 rounded-full ${colors[status]}`}></div>;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Computers Panel</h1>
          <p className="text-gray-500">Monitor and manage all computers across laboratories</p>
        </div>
        <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
          <Power className="w-4 h-4 mr-2" />
          Refresh Status
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px] max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search computer or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select 
                value={labFilter} 
                onChange={(e) => setLabFilter(e.target.value)}
                className="h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-[180px]"
              >
                {labs.map(lab => (
                  <option key={lab} value={lab}>{lab}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="online">Online</option>
                <option value="idle">Idle</option>
                <option value="offline">Offline</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Computers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredComputers.map((computer) => (
          <div key={computer.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <Monitor className="w-5 h-5 text-gray-600 mr-2" />
                  <div>
                    <p className="font-semibold text-gray-900">{computer.id}</p>
                    <p className="text-xs text-gray-500">{computer.lab}</p>
                  </div>
                </div>
                {getStatusDot(computer.status)}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Status:</span>
                  {getStatusBadge(computer.status)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">User:</span>
                  <span className="text-gray-700">{computer.user || 'No user'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">IP Address:</span>
                  <span className="text-gray-700 font-mono">{computer.ip}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500">Uptime:</span>
                  <span className="text-gray-700">{computer.uptime}</span>
                </div>
              </div>

              {computer.status !== 'offline' && (
                <div className="mt-4 space-y-2">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500">CPU</span>
                      <span className="text-gray-700">{computer.cpu}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${computer.cpu > 70 ? 'bg-red-500' : computer.cpu > 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${computer.cpu}%` }}
                      ></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-gray-500">Memory</span>
                      <span className="text-gray-700">{computer.memory}%</span>
                    </div>
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${computer.memory > 70 ? 'bg-red-500' : computer.memory > 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
                        style={{ width: `${computer.memory}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Lock Screen">
                  <Lock className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Send Message">
                  <MessageSquare className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Remote Control">
                  <Unlock className="w-4 h-4 text-gray-600" />
                </button>
                <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="More Actions">
                  <MoreVertical className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredComputers.length === 0 && (
        <div className="text-center py-12">
          <Monitor className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No computers found matching your filters.</p>
        </div>
      )}
    </div>
  );
}

export default Computers;
