import { useState } from 'react';
import {
  Ticket,
  Search,
  Filter,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  MessageSquare,
  Building2,
  User,
  Monitor,
  X,
  Send
} from 'lucide-react';

// Mock data
const tickets = [
  { id: 'TCK-1023', timestamp: '02/09/2025 09:15 AM', student: 'Student 05', computer: 'EDT-PC05', lab: 'EdTech Laboratory', issueType: 'No Display', priority: 'high', status: 'open', description: 'Monitor is not displaying anything after turning on the computer.' },
  { id: 'TCK-1022', timestamp: '02/09/2025 09:00 AM', student: 'Student 09', computer: 'SND-PC03', lab: 'Sandbox', issueType: 'Slow Performance', priority: 'medium', status: 'in-progress', description: 'Computer is running very slow, applications take long to load.' },
  { id: 'TCK-1021', timestamp: '02/09/2025 08:45 AM', student: 'Student 15', computer: 'NXS-PC02', lab: 'Nexus', issueType: 'No Internet Connection', priority: 'high', status: 'in-progress', description: 'Cannot connect to the internet, network icon shows limited access.' },
  { id: 'TCK-1020', timestamp: '02/09/2025 08:30 AM', student: 'Student 12', computer: 'SND-PC06', lab: 'Sandbox', issueType: 'Keyboard Not Working', priority: 'medium', status: 'resolved', description: 'Keyboard is not responding to any key presses.', resolution: 'Keyboard replaced with new USB keyboard.' },
  { id: 'TCK-1019', timestamp: '02/09/2025 08:15 AM', student: 'Student 03', computer: 'EDT-PC01', lab: 'EdTech Laboratory', issueType: 'Software Installation Failed', priority: 'low', status: 'open', description: 'Unable to install required software for class project.' },
  { id: 'TCK-1018', timestamp: '02/09/2025 08:00 AM', student: 'Student 07', computer: 'EDT-PC07', lab: 'EdTech Laboratory', issueType: 'Blue Screen Error', priority: 'high', status: 'in-progress', description: 'Computer shows blue screen with error code CRITICAL_PROCESS_DIED.' },
  { id: 'TCK-1017', timestamp: '02/08/2025 04:20 PM', student: 'Student 11', computer: 'SND-PC05', lab: 'Sandbox', issueType: 'Mouse Not Detected', priority: 'medium', status: 'resolved', description: 'Mouse cursor not moving, device not detected in device manager.', resolution: 'Mouse driver reinstalled, issue resolved.' },
  { id: 'TCK-1016', timestamp: '02/08/2025 03:45 PM', student: 'Student 16', computer: 'NXS-PC05', lab: 'Nexus', issueType: 'Audio Not Working', priority: 'low', status: 'resolved', description: 'No sound coming from speakers or headphones.', resolution: 'Audio driver updated, volume was muted in settings.' },
];

const stats = {
  open: 2,
  inProgress: 3,
  resolved: 7,
  avgResolution: '15 min'
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

function Tickets() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.issueType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.computer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusBadge = (status) => {
    const variants = {
      open: 'destructive',
      'in-progress': 'warning',
      resolved: 'success',
    };
    return <Badge variant={variants[status]}>{status.replace('-', ' ')}</Badge>;
  };

  const getPriorityBadge = (priority) => {
    const variants = {
      high: 'destructive',
      medium: 'warning',
      low: 'default',
    };
    return <Badge variant={variants[priority]}>{priority}</Badge>;
  };

  const getIssueIcon = (issueType) => {
    const icons = {
      'No Display': Monitor,
      'Slow Performance': AlertCircle,
      'No Internet Connection': AlertCircle,
      'Keyboard Not Working': AlertCircle,
      'Software Installation Failed': AlertCircle,
      'Blue Screen Error': AlertCircle,
      'Mouse Not Detected': AlertCircle,
      'Audio Not Working': AlertCircle,
    };
    const Icon = icons[issueType] || AlertCircle;
    return <Icon className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tickets / Support Requests</h1>
          <p className="text-gray-500">Manage and resolve technical issues submitted by students across laboratories</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Open Tickets</p>
              <p className="text-2xl font-bold text-gray-900">{stats.open}</p>
            </div>
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Awaiting assignment</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
            </div>
            <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Being worked on</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
            </div>
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Successfully fixed</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Avg Resolution</p>
              <p className="text-2xl font-bold text-gray-900">{stats.avgResolution}</p>
            </div>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">Average time</p>
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
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-500" />
              <select className="h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="all">All Laboratories</option>
                <option value="edtech">EdTech Laboratory</option>
                <option value="sandbox">Sandbox</option>
                <option value="nexus">Nexus</option>
              </select>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in-progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tickets Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">All Support Tickets</h3>
        </div>
        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Computer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lab</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{ticket.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.timestamp}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ticket.student}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">{ticket.computer}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{ticket.lab}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getIssueIcon(ticket.issueType)}
                        <span className="ml-2 text-sm text-gray-900">{ticket.issueType}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getPriorityBadge(ticket.priority)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(ticket.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button 
                        onClick={() => setSelectedTicket(ticket)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredTickets.length === 0 && (
            <div className="text-center py-12">
              <Ticket className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No tickets found matching your filters.</p>
            </div>
          )}
        </div>
      </div>

      {/* Ticket Detail Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedTicket.id}</h2>
                  <p className="text-sm text-gray-500">{selectedTicket.timestamp}</p>
                </div>
                <button 
                  onClick={() => setSelectedTicket(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Student</p>
                  <p className="text-sm font-medium text-gray-900">{selectedTicket.student}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Computer</p>
                  <p className="text-sm font-medium text-gray-900 font-mono">{selectedTicket.computer}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Laboratory</p>
                  <p className="text-sm font-medium text-gray-900">{selectedTicket.lab}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Priority</p>
                  <div className="mt-1">{getPriorityBadge(selectedTicket.priority)}</div>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500">Issue Type</p>
                <p className="text-sm font-medium text-gray-900">{selectedTicket.issueType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Description</p>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg mt-1">{selectedTicket.description}</p>
              </div>
              {selectedTicket.resolution && (
                <div>
                  <p className="text-sm text-gray-500">Resolution</p>
                  <p className="text-sm text-gray-700 bg-green-50 p-3 rounded-lg mt-1">{selectedTicket.resolution}</p>
                </div>
              )}
              <div>
                <p className="text-sm text-gray-500 mb-2">Add Response</p>
                <textarea
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  placeholder="Type your response..."
                  className="w-full h-24 px-3 py-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button 
                className="h-10 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                onClick={() => setSelectedTicket(null)}
              >
                Close
              </button>
              <button className="flex items-center h-10 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
                <Send className="w-4 h-4 mr-2" />
                Send Response
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tickets;
