import { useState } from 'react';
import { 
  Plus,
  Monitor,
  MapPin,
  User,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Eye,
  Wifi,
  HardDrive,
  MoreHorizontal
} from 'lucide-react';
import { mockStudentSession, mockStudentTickets } from '../../data/mockStudentData';

function SupportTicket() {
  const [tickets, setTickets] = useState(mockStudentTickets);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);
  const [formData, setFormData] = useState({
    subject: '',
    category: 'Hardware Issue',
    priority: 'Medium',
    description: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTicket = {
      id: `T-2025-${String(tickets.length + 1).padStart(3, '0')}`,
      subject: formData.subject,
      category: formData.category.split(' ')[0], // Get just "Hardware" from "Hardware Issue"
      priority: formData.priority,
      status: 'Open',
      created: new Date().toLocaleString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }),
      description: formData.description
    };
    setTickets([newTicket, ...tickets]);
    setFormData({ subject: '', category: 'Hardware Issue', priority: 'Medium', description: '' });
    setShowForm(false);
    setToast('Ticket submitted successfully!');
    setTimeout(() => setToast(null), 3000);
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'Open': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'In Progress': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Resolved': return 'bg-green-100 text-green-700 border-green-300';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category.toLowerCase()) {
      case 'hardware': return <HardDrive className="w-4 h-4 mr-1" />;
      case 'network': return <Wifi className="w-4 h-4 mr-1" />;
      default: return <Monitor className="w-4 h-4 mr-1" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50 px-2 py-0.5 rounded';
      case 'Medium': return 'text-orange-600 bg-orange-50 px-2 py-0.5 rounded';
      case 'Low': return 'text-gray-600 bg-gray-100 px-2 py-0.5 rounded';
      default: return 'text-gray-600';
    }
  };

  const stats = {
    total: tickets.length,
    open: tickets.filter(t => t.status === 'Open').length,
    inProgress: tickets.filter(t => t.status === 'In Progress').length,
    resolved: tickets.filter(t => t.status === 'Resolved').length
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Submit Support Ticket</h1>
        <p className="text-gray-500">Report technical issues or request assistance</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Total Tickets</span>
            <Monitor className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-xs text-gray-400 mt-1">All time</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Open</span>
            <AlertCircle className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.open}</div>
          <div className="text-xs text-gray-400 mt-1">Awaiting response</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">In Progress</span>
            <Clock className="w-5 h-5 text-yellow-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.inProgress}</div>
          <div className="text-xs text-gray-400 mt-1">Being addressed</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-500">Resolved</span>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.resolved}</div>
          <div className="text-xs text-gray-400 mt-1">Completed</div>
        </div>
      </div>

      {/* Session Info Bar */}
      <div className="bg-blue-50 rounded-xl border border-blue-100 p-4 mb-6">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center">
            <Monitor className="w-5 h-5 text-blue-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">Laboratory</span>
            <span className="mx-2 text-gray-400">|</span>
            <span className="text-sm text-gray-600">{mockStudentSession.labName}</span>
          </div>
          <div className="flex items-center">
            <MapPin className="w-5 h-5 text-green-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">Seat Number</span>
            <span className="mx-2 text-gray-400">|</span>
            <span className="text-sm text-gray-600">{mockStudentSession.seatNumber}</span>
          </div>
          <div className="flex items-center">
            <Monitor className="w-5 h-5 text-purple-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">Computer</span>
            <span className="mx-2 text-gray-400">|</span>
            <span className="text-sm text-gray-600">{mockStudentSession.pcName}</span>
          </div>
          <div className="flex items-center">
            <User className="w-5 h-5 text-orange-500 mr-2" />
            <span className="text-sm font-medium text-gray-700">Student</span>
            <span className="mx-2 text-gray-400">|</span>
            <span className="text-sm text-gray-600">{mockStudentSession.studentName}</span>
          </div>
        </div>
      </div>

      {/* New Ticket Button */}
      <div className="flex justify-end mb-4">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 font-medium"
        >
          <Plus className="w-4 h-4" />
          New Ticket
        </button>
      </div>

      {/* Ticket Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Submit New Ticket</h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-1 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                  <input
                    type="text"
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    placeholder="Brief description of the issue"
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option>Hardware Issue</option>
                      <option>Software Issue</option>
                      <option>Network Issue</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 h-32 resize-none"
                    placeholder="Detailed description of the problem..."
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-medium"
                >
                  Submit Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tickets Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">My Tickets</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    {ticket.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {ticket.subject}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <span className="flex items-center">
                      {getCategoryIcon(ticket.category)}
                      {ticket.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={getPriorityColor(ticket.priority)}>{ticket.priority}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusBadgeColor(ticket.status)}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {ticket.created}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button className="p-1 hover:bg-gray-100 rounded">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 flex items-center">
          <CheckCircle className="w-5 h-5 mr-2" />
          {toast}
        </div>
      )}
    </div>
  );
}

export default SupportTicket;
