import { useState, useEffect } from 'react';
import { computersApi, labsApi } from '../../services/api.js';
import {
  Monitor,
  Search,
  Filter,
  Power,
  MessageSquare,
  MoreVertical,
  Lock,
  Unlock,
  Loader2,
  AlertCircle,
  Trash2,
  Edit2,
  X,
  CheckCircle
} from 'lucide-react';

// Inline Badge component
const Badge = ({ variant, children }) => {
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    destructive: 'bg-red-100 text-red-800',
    info: 'bg-blue-100 text-blue-800'
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${variants[variant] || variants.default}`}>
      {children}
    </span>
  );
};

// Toast notification component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 ${
      type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
    }`}>
      {type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
      <span className="text-sm font-medium">{message}</span>
    </div>
  );
};

function Computers() {
  const [computers, setComputers] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [labFilter, setLabFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Toast notification
  const [toast, setToast] = useState(null);

  // Fetch computers and labs on mount
  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [computersRes, labsRes] = await Promise.all([
        computersApi.getAll(),
        labsApi.getAll()
      ]);
      
      setComputers(computersRes.data);
      setLabs(labsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load computers. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    await fetchData();
    showToast('Computer status refreshed');
  };

  const handleDeleteComputer = async (computerId) => {
    if (!confirm('Are you sure you want to delete this computer?')) return;
    
    try {
      await computersApi.delete(computerId);
      showToast('Computer deleted successfully');
      await fetchData();
    } catch (err) {
      console.error('Error deleting computer:', err);
      showToast(err.response?.data?.message || 'Failed to delete computer', 'error');
    }
  };

  const handleToggleLock = async (computer) => {
    try {
      await computersApi.update(computer.id, { isLocked: !computer.isLocked });
      showToast(`Computer ${computer.isLocked ? 'unlocked' : 'locked'} successfully`);
      await fetchData();
    } catch (err) {
      console.error('Error updating computer:', err);
      showToast('Failed to update computer lock status', 'error');
    }
  };

  // Filter computers based on search, lab, and status
  const filteredComputers = computers.filter(comp => {
    const matchesSearch = 
      comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (comp.user && comp.user.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (comp.ipAddress && comp.ipAddress.includes(searchTerm));
    
    const matchesLab = labFilter === 'all' || comp.labId === parseInt(labFilter);
    const matchesStatus = statusFilter === 'all' || comp.status === statusFilter;
    
    return matchesSearch && matchesLab && matchesStatus;
  });

  const getStatusBadge = (status) => {
    const variants = {
      online: 'success',
      idle: 'warning',
      offline: 'destructive',
      in_use: 'info',
      maintenance: 'default'
    };
    const labels = {
      online: 'Online',
      idle: 'Idle',
      offline: 'Offline',
      in_use: 'In Use',
      maintenance: 'Maintenance'
    };
    return <Badge variant={variants[status] || 'default'}>{labels[status] || status}</Badge>;
  };

  const getStatusDot = (status) => {
    const colors = {
      online: 'bg-green-500',
      idle: 'bg-yellow-500',
      offline: 'bg-red-500',
      in_use: 'bg-blue-500',
      maintenance: 'bg-gray-500'
    };
    return <div className={`w-2 h-2 rounded-full ${colors[status] || 'bg-gray-500'}`}></div>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Computers Panel</h1>
            <p className="text-gray-500">Monitor and manage all computers across laboratories</p>
          </div>
        </div>
        
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading computers...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Computers Panel</h1>
          <p className="text-gray-500">Monitor and manage all computers across laboratories</p>
        </div>
        <button 
          onClick={handleRefresh}
          className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <Power className="w-4 h-4 mr-2" />
          Refresh Status
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-700">{error}</span>
          <button 
            onClick={fetchData}
            className="ml-auto text-sm text-red-600 hover:text-red-800 underline"
          >
            Retry
          </button>
        </div>
      )}

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
                <option value="all">All Labs</option>
                {labs.map(lab => (
                  <option key={lab.id} value={lab.id}>{lab.name}</option>
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
                <option value="offline">Offline</option>
                <option value="in_use">In Use</option>
                <option value="idle">Idle</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Computers Grid */}
      {filteredComputers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <Monitor className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">
            {computers.length === 0 
              ? 'No computers found. Add laboratories with computers to get started.'
              : 'No computers found matching your filters.'
            }
          </p>
          {computers.length === 0 && (
            <p className="mt-2 text-sm text-gray-400">
              Go to Laboratories Management to create labs with computers.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredComputers.map((computer) => (
            <div key={computer.id} className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center">
                    <Monitor className="w-5 h-5 text-gray-600 mr-2" />
                    <div>
                      <p className="font-semibold text-gray-900">{computer.name}</p>
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
                    <span className="text-gray-500">Seat:</span>
                    <span className="text-gray-700">#{computer.seatNumber || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">User:</span>
                    <span className="text-gray-700">{computer.user || 'No user'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">IP Address:</span>
                    <span className="text-gray-700 font-mono">{computer.ipAddress || 'Not assigned'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Uptime:</span>
                    <span className="text-gray-700">{computer.uptime || '-'}</span>
                  </div>
                  {computer.isLocked && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Lock Status:</span>
                      <Badge variant="warning">Locked</Badge>
                    </div>
                  )}
                </div>

                {computer.status !== 'offline' && (
                  <div className="mt-4 space-y-2">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-500">CPU</span>
                        <span className="text-gray-700">{computer.cpu || 0}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${(computer.cpu || 0) > 70 ? 'bg-red-500' : (computer.cpu || 0) > 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${computer.cpu || 0}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-gray-500">Memory</span>
                        <span className="text-gray-700">{computer.memory || 0}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${(computer.memory || 0) > 70 ? 'bg-red-500' : (computer.memory || 0) > 40 ? 'bg-yellow-500' : 'bg-green-500'}`}
                          style={{ width: `${computer.memory || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <button 
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors" 
                    title={computer.isLocked ? 'Unlock Screen' : 'Lock Screen'}
                    onClick={() => handleToggleLock(computer)}
                  >
                    {computer.isLocked ? (
                      <Unlock className="w-4 h-4 text-yellow-600" />
                    ) : (
                      <Lock className="w-4 h-4 text-gray-600" />
                    )}
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Send Message">
                    <MessageSquare className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Edit Computer">
                    <Edit2 className="w-4 h-4 text-blue-600" />
                  </button>
                  <button 
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors" 
                    title="Delete Computer"
                    onClick={() => handleDeleteComputer(computer.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Computers;
