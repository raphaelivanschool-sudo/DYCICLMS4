import { useState } from 'react';
import {
  Package,
  Search,
  Plus,
  Edit2,
  Trash2,
  Monitor,
  Printer,
  Cpu,
  HardDrive,
  MousePointer,
  Keyboard,
  Headphones,
  Filter,
  CheckCircle,
  AlertCircle,
  XCircle
} from 'lucide-react';

// Mock data
const inventory = [
  { id: 'DEV-001', name: 'Dell OptiPlex 7090', type: 'Desktop PC', serial: 'SN123456789', lab: 'EdTech Laboratory', condition: 'good', lastMaintenance: '2025-01-15' },
  { id: 'DEV-002', name: 'HP LaserJet Pro', type: 'Printer', serial: 'SN987654321', lab: 'EdTech Laboratory', condition: 'excellent', lastMaintenance: '2025-02-01' },
  { id: 'DEV-003', name: 'Logitech MX Master 3', type: 'Mouse', serial: 'SN456789123', lab: 'Sandbox', condition: 'good', lastMaintenance: '2025-01-20' },
  { id: 'DEV-004', name: 'Dell P2419H Monitor', type: 'Monitor', serial: 'SN789123456', lab: 'Sandbox', condition: 'fair', lastMaintenance: '2024-12-10' },
  { id: 'DEV-005', name: 'Cisco Catalyst 2960', type: 'Network Switch', serial: 'SN321654987', lab: 'Nexus', condition: 'excellent', lastMaintenance: '2025-02-10' },
  { id: 'DEV-006', name: 'Intel Core i7-11700', type: 'Processor', serial: 'SN654987321', lab: 'Nexus', condition: 'good', lastMaintenance: '2025-01-05' },
  { id: 'DEV-007', name: 'Samsung 870 EVO 1TB', type: 'Storage', serial: 'SN147258369', lab: 'Innovation Hub', condition: 'excellent', lastMaintenance: '2025-02-15' },
  { id: 'DEV-008', name: 'Keychron K2 Keyboard', type: 'Keyboard', serial: 'SN369258147', lab: 'Tech Lab 5', condition: 'fair', lastMaintenance: '2024-11-20' },
  { id: 'DEV-009', name: 'Sony WH-1000XM4', type: 'Headphones', serial: 'SN852741963', lab: 'EdTech Laboratory', condition: 'good', lastMaintenance: '2025-01-25' },
  { id: 'DEV-010', name: 'Dell OptiPlex 7080', type: 'Desktop PC', serial: 'SN159753486', lab: 'Tech Lab 5', condition: 'poor', lastMaintenance: '2024-10-05' },
];

const deviceTypes = ['All Types', 'Desktop PC', 'Monitor', 'Printer', 'Mouse', 'Keyboard', 'Network Switch', 'Processor', 'Storage', 'Headphones'];

const labs = ['All Labs', 'EdTech Laboratory', 'Sandbox', 'Nexus', 'Innovation Hub', 'Tech Lab 5'];

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

function Inventory() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All Types');
  const [labFilter, setLabFilter] = useState('All Labs');
  const [conditionFilter, setConditionFilter] = useState('all');

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.serial.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'All Types' || item.type === typeFilter;
    const matchesLab = labFilter === 'All Labs' || item.lab === labFilter;
    const matchesCondition = conditionFilter === 'all' || item.condition === conditionFilter;
    return matchesSearch && matchesType && matchesLab && matchesCondition;
  });

  const getTypeIcon = (type) => {
    const icons = {
      'Desktop PC': Monitor,
      'Monitor': Monitor,
      'Printer': Printer,
      'Mouse': MousePointer,
      'Keyboard': Keyboard,
      'Network Switch': Cpu,
      'Processor': Cpu,
      'Storage': HardDrive,
      'Headphones': Headphones,
    };
    const Icon = icons[type] || Package;
    return <Icon className="w-5 h-5 text-gray-500" />;
  };

  const getConditionBadge = (condition) => {
    const variants = {
      excellent: 'success',
      good: 'default',
      fair: 'warning',
      poor: 'destructive',
    };
    return <Badge variant={variants[condition]}>{condition}</Badge>;
  };

  const stats = {
    total: inventory.length,
    excellent: inventory.filter(i => i.condition === 'excellent').length,
    good: inventory.filter(i => i.condition === 'good').length,
    needsAttention: inventory.filter(i => i.condition === 'fair' || i.condition === 'poor').length,
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory</h1>
          <p className="text-gray-500">Manage and track all laboratory equipment and devices</p>
        </div>
        <button className="flex items-center h-10 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
          <Plus className="w-4 h-4 mr-2" />
          Add Device
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
              <Package className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Devices</p>
              <p className="text-xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mr-3">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Excellent</p>
              <p className="text-xl font-bold text-gray-900">{stats.excellent}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
              <CheckCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Good</p>
              <p className="text-xl font-bold text-gray-900">{stats.good}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center mr-3">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Needs Attention</p>
              <p className="text-xl font-bold text-gray-900">{stats.needsAttention}</p>
            </div>
          </div>
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
                placeholder="Search devices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-10 pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {deviceTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <select
              value={labFilter}
              onChange={(e) => setLabFilter(e.target.value)}
              className="h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {labs.map(lab => (
                <option key={lab} value={lab}>{lab}</option>
              ))}
            </select>
            <select
              value={conditionFilter}
              onChange={(e) => setConditionFilter(e.target.value)}
              className="h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Conditions</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
            </select>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">All Devices</h3>
        </div>
        <div className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Serial Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned Lab</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condition</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Maintenance</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInventory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center mr-3">
                          {getTypeIcon(item.type)}
                        </div>
                        <span className="text-sm font-medium text-gray-900">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">{item.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">{item.serial}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.lab}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getConditionBadge(item.condition)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.lastMaintenance}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button className="p-1 hover:bg-gray-100 rounded transition-colors" title="Edit">
                          <Edit2 className="w-4 h-4 text-gray-600" />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded transition-colors" title="Delete">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredInventory.length === 0 && (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No devices found matching your filters.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Inventory;
