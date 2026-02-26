import { useState } from 'react';
import {
  Wifi,
  WifiOff,
  Globe,
  Gauge,
  AlertTriangle,
  CheckCircle,
  Building2
} from 'lucide-react';

// Mock data
const labsNetwork = [
  { 
    id: 1, 
    name: 'EdTech Laboratory', 
    building: 'Building A', 
    internetEnabled: true, 
    bandwidth: '45 Mbps',
    latency: '12ms',
    connectedDevices: 15,
    totalDevices: 15,
    status: 'optimal'
  },
  { 
    id: 2, 
    name: 'Sandbox', 
    building: 'Building B', 
    internetEnabled: true, 
    bandwidth: '38 Mbps',
    latency: '18ms',
    connectedDevices: 12,
    totalDevices: 12,
    status: 'good'
  },
  { 
    id: 3, 
    name: 'Nexus', 
    building: 'Building C', 
    internetEnabled: true, 
    bandwidth: '52 Mbps',
    latency: '8ms',
    connectedDevices: 10,
    totalDevices: 10,
    status: 'optimal'
  },
  { 
    id: 4, 
    name: 'Innovation Hub', 
    building: 'Building D', 
    internetEnabled: false, 
    bandwidth: '0 Mbps',
    latency: '-',
    connectedDevices: 0,
    totalDevices: 20,
    status: 'disabled'
  },
  { 
    id: 5, 
    name: 'Tech Lab 5', 
    building: 'Building E', 
    internetEnabled: true, 
    bandwidth: '28 Mbps',
    latency: '35ms',
    connectedDevices: 15,
    totalDevices: 18,
    status: 'fair'
  },
];

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

function NetworkControl() {
  const [labs, setLabs] = useState(labsNetwork);

  const toggleInternet = (labId) => {
    setLabs(labs.map(lab => 
      lab.id === labId 
        ? { ...lab, internetEnabled: !lab.internetEnabled, status: !lab.internetEnabled ? 'optimal' : 'disabled' }
        : lab
    ));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'optimal':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'good':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      case 'fair':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'disabled':
        return <WifiOff className="w-5 h-5 text-red-500" />;
      default:
        return <Globe className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      optimal: 'success',
      good: 'default',
      fair: 'warning',
      disabled: 'destructive',
    };
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  const getBandwidthColor = (bandwidth) => {
    const value = parseInt(bandwidth);
    if (value >= 40) return 'text-green-600';
    if (value >= 25) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Network Control</h1>
        <p className="text-gray-500">Manage internet access and monitor bandwidth across all laboratories</p>
      </div>

      {/* Network Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mr-3">
              <Wifi className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Labs Online</p>
              <p className="text-xl font-bold text-gray-900">4/5</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
              <Gauge className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg Bandwidth</p>
              <p className="text-xl font-bold text-gray-900">40.75 Mbps</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mr-3">
              <Globe className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Connected Devices</p>
              <p className="text-xl font-bold text-gray-900">52</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center mr-3">
              <WifiOff className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Offline Labs</p>
              <p className="text-xl font-bold text-gray-900">1</p>
            </div>
          </div>
        </div>
      </div>

      {/* Lab Network Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {labs.map((lab) => (
          <div key={lab.id} className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mr-3">
                    <Building2 className="w-5 h-5 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{lab.name}</h3>
                    <p className="text-sm text-gray-500">{lab.building}</p>
                  </div>
                </div>
                {getStatusIcon(lab.status)}
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Internet Status</span>
                {getStatusBadge(lab.status)}
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Bandwidth</span>
                <span className={`text-sm font-semibold ${getBandwidthColor(lab.bandwidth)}`}>
                  {lab.bandwidth}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Latency</span>
                <span className="text-sm font-semibold text-gray-700">{lab.latency}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Connected</span>
                <span className="text-sm text-gray-700">
                  {lab.connectedDevices} / {lab.totalDevices} devices
                </span>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <button
                  onClick={() => toggleInternet(lab.id)}
                  className={`w-full h-10 rounded-md text-sm font-medium flex items-center justify-center transition-colors ${
                    lab.internetEnabled 
                      ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50' 
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {lab.internetEnabled ? (
                    <>
                      <WifiOff className="w-4 h-4 mr-2" />
                      Disable Internet
                    </>
                  ) : (
                    <>
                      <Wifi className="w-4 h-4 mr-2" />
                      Enable Internet
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default NetworkControl;
