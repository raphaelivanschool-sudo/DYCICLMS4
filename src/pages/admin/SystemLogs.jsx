import { useState } from 'react';
import {
  FileText,
  Download,
  Search,
  Filter,
  Calendar,
  Users,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  RotateCcw
} from 'lucide-react';

// Mock data
const logs = [
  { id: 1, timestamp: '2025-02-22 14:32:15', user: 'Student 01', action: 'User Login', computer: 'EDT-PC01', lab: 'EdTech Laboratory', status: 'success', details: 'Successful login from student workstation' },
  { id: 2, timestamp: '2025-02-22 14:30:42', user: 'Student 03', action: 'App Blocked', computer: 'EDT-PC03', lab: 'EdTech Laboratory', status: 'warning', details: 'Attempted to run unauthorized game application' },
  { id: 3, timestamp: '2025-02-22 14:28:09', user: 'Student 09', action: 'Internet Disabled', computer: 'SND-PC02', lab: 'Sandbox', status: 'success', details: 'Internet access disabled by administrator' },
  { id: 4, timestamp: '2025-02-22 14:25:33', user: 'Admin', action: 'Screen Locked', computer: 'NXS-PC01', lab: 'Nexus', status: 'success', details: 'Remote screen lock executed successfully' },
  { id: 5, timestamp: '2025-02-22 14:22:18', user: 'Student 05', action: 'System Command', computer: 'EDT-PC05', lab: 'EdTech Laboratory', status: 'error', details: 'Failed to execute system command - insufficient permissions' },
  { id: 6, timestamp: '2025-02-22 14:20:55', user: 'Student 08', action: 'User Logout', computer: 'SND-PC01', lab: 'Sandbox', status: 'success', details: 'User session terminated normally' },
  { id: 7, timestamp: '2025-02-22 14:19:27', user: 'Student 15', action: 'Website Blocked', computer: 'NXS-PC03', lab: 'Nexus', status: 'warning', details: 'Access to blocked website attempted: facebook.com' },
  { id: 8, timestamp: '2025-02-22 14:18:41', user: 'Mr. Cruz', action: 'Instructor Login', computer: 'EDT-PC02', lab: 'EdTech Laboratory', status: 'success', details: 'Instructor login from lab workstation' },
  { id: 9, timestamp: '2025-02-22 14:15:12', user: 'System', action: 'Backup Complete', computer: 'Server', lab: 'All Labs', status: 'success', details: 'Daily backup completed successfully' },
  { id: 10, timestamp: '2025-02-22 14:12:38', user: 'Student 12', action: 'File Transfer', computer: 'SND-PC04', lab: 'Sandbox', status: 'warning', details: 'Large file transfer detected - flagged for review' },
  { id: 11, timestamp: '2025-02-22 14:10:05', user: 'Admin', action: 'Lab Shutdown', computer: 'All', lab: 'Innovation Hub', status: 'success', details: 'Scheduled maintenance shutdown initiated' },
  { id: 12, timestamp: '2025-02-22 14:08:52', user: 'Student 22', action: 'USB Detected', computer: 'EDT-PC04', lab: 'EdTech Laboratory', status: 'error', details: 'USB storage device blocked by security policy' },
];

const stats = {
  totalActions: 156,
  activeUsers: 24,
  criticalCommands: 8,
  errors: 3
};

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

function SystemLogs() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateRange, setDateRange] = useState('today');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.computer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.lab.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesStatus && matchesAction;
  });

  const getStatusBadge = (status) => {
    const variants = {
      success: 'success',
      warning: 'warning',
      error: 'destructive',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const uniqueActions = [...new Set(logs.map(log => log.action))];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Logs & Reports</h1>
          <p className="text-gray-500">Monitor all user actions, logins, and commands issued across laboratories</p>
        </div>
        <button className="flex items-center h-10 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
          <Download className="w-4 h-4 mr-2" />
          Export Logs
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
              <Activity className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Actions Logged</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalActions}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">In selected time range</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mr-3">
              <Users className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Users</p>
              <p className="text-xl font-bold text-gray-900">{stats.activeUsers}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Across all laboratories</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center mr-3">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Critical Commands</p>
              <p className="text-xl font-bold text-gray-900">{stats.criticalCommands}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Security & system actions</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center mr-3">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Errors</p>
              <p className="text-xl font-bold text-gray-900">{stats.errors}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Failed operations</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px] max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="custom">Custom Range</option>
              </select>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="error">Error</option>
            </select>
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Actions</option>
              {uniqueActions.map(action => (
                <option key={action} value={action}>{action}</option>
              ))}
            </select>
            <button className="flex items-center h-9 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
              <RotateCcw className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">Activity Logs</h3>
        </div>
        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lab</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Computer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action / Event</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.timestamp}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.lab}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                      {log.computer}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.user}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(log.status)}
                        <span className="ml-2 text-sm text-gray-900">{log.action}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(log.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button className="flex items-center text-blue-600 hover:text-blue-800">
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No logs found matching your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SystemLogs;
