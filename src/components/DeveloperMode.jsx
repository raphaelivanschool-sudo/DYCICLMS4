import { useState, useEffect, useRef } from 'react';
import { 
  Monitor, 
  Lock, 
  Eye, 
  X, 
  Wifi, 
  WifiOff, 
  User,
  Clock,
  HardDrive,
  Cpu,
  MemoryStick,
  Search,
  Loader2,
  Play,
  Square,
  RefreshCw
} from 'lucide-react';
import networkApi from '../services/network-api.js';
import { computersApi, agentsApi } from '../services/api.js';
import { io } from 'socket.io-client';

const DeveloperMode = ({ onClose }) => {
  const [selectedPCs, setSelectedPCs] = useState([]);
  const [connectedPCs, setConnectedPCs] = useState([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatus, setScanStatus] = useState(null);
  const [error, setError] = useState(null);
  const [lastScanTime, setLastScanTime] = useState(null);
  const [showLockModal, setShowLockModal] = useState(false);
  const [isLocking, setIsLocking] = useState(false);
  const [lockError, setLockError] = useState(null);
  const socketRef = useRef(null);

  // Initialize socket connection for real-time updates
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      socketRef.current = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001', {
        auth: { token }
      });

      socketRef.current.on('scan_progress', (data) => {
        setScanProgress(data.progress);
      });

      // Listen for real-time device discoveries
      socketRef.current.on('device_found', (data) => {
        if (data.device) {
          setConnectedPCs(prev => {
            // Check if device already exists to avoid duplicates
            const exists = prev.some(pc => pc.id === data.device.id);
            if (exists) return prev;
            // Add new device to the beginning of the list
            return [data.device, ...prev];
          });
        }
      });

      // Listen for agent PC connections
      socketRef.current.on('computer_online', (data) => {
        console.log('Agent PC came online:', data);
        setConnectedPCs(prev => {
          // Check if PC already exists
          const exists = prev.some(pc => pc.id === data.computerId);
          if (exists) {
            // Update existing PC
            return prev.map(pc => pc.id === data.computerId ? {
              id: data.computerId,
              name: data.name,
              ip: data.ip,
              user: data.user,
              status: 'online',
              os: 'Windows',
              specs: data.specs || {},
              lastSeen: new Date()
            } : pc);
          }
          // Add new PC
          return [{
            id: data.computerId,
            name: data.name,
            ip: data.ip,
            user: data.user,
            status: 'online',
            os: 'Windows',
            specs: data.specs || {},
            lastSeen: new Date()
          }, ...prev];
        });
      });

      // Listen for agent PC status updates
      socketRef.current.on('computer_status_update', (data) => {
        console.log('Agent PC status update:', data);
        setConnectedPCs(prev => prev.map(pc => 
          pc.id === data.computerId 
            ? { ...pc, status: data.status, user: data.user, lastSeen: new Date(data.timestamp) }
            : pc
        ));
      });

      // Listen for agent PC disconnections
      socketRef.current.on('computer_offline', (data) => {
        console.log('Agent PC went offline:', data);
        setConnectedPCs(prev => prev.map(pc => 
          pc.id === data.computerId 
            ? { ...pc, status: 'offline', lastSeen: new Date(data.lastSeen) }
            : pc
        ));
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, []);

  // Load initial data
  useEffect(() => {
    loadDiscoveredDevices();
    checkScanStatus();
  }, []);

  const loadDiscoveredDevices = async () => {
    try {
      // Load both network scan devices and agent-connected PCs
      const [networkData, agentsData] = await Promise.all([
        networkApi.getDiscoveredDevices().catch(() => ({ devices: [] })),
        agentsApi.getConnected().catch(() => ({ devices: [] }))
      ]);
      
      // Merge devices, prioritizing agent data for duplicates
      const networkDevices = networkData.devices || [];
      const agentDevices = agentsData.devices || [];
      
      // Create a map of agent devices for quick lookup
      const agentDeviceMap = new Map(agentDevices.map(d => [d.id, d]));
      
      // Merge: use agent data if available, otherwise use network data
      const mergedDevices = [
        ...agentDevices,
        ...networkDevices.filter(d => !agentDeviceMap.has(d.id))
      ];
      
      setConnectedPCs(mergedDevices);
      
      // Use the most recent scan time
      const lastScan = agentsData.lastScan || networkData.lastScan;
      if (lastScan) {
        setLastScanTime(new Date(lastScan));
      }
    } catch (err) {
      console.error('Error loading devices:', err);
      setError('Failed to load discovered devices');
    }
  };

  const checkScanStatus = async () => {
    try {
      const status = await networkApi.getScanStatus();
      setScanStatus(status);
      setIsScanning(status.isScanning);
      setScanProgress(status.progress);
    } catch (err) {
      console.error('Error checking scan status:', err);
    }
  };

  const startNetworkScan = async () => {
    try {
      setError(null);
      setIsScanning(true);
      setScanProgress(0);
      
      await networkApi.startScan();
      
      // Poll for status updates
      const statusInterval = setInterval(async () => {
        try {
          const status = await networkApi.getScanStatus();
          setScanStatus(status);
          setScanProgress(status.progress);
          
          if (!status.isScanning) {
            clearInterval(statusInterval);
            setIsScanning(false);
            await loadDiscoveredDevices(); // Reload devices
          }
        } catch (err) {
          console.error('Error checking status:', err);
          clearInterval(statusInterval);
          setIsScanning(false);
        }
      }, 1000);
      
    } catch (err) {
      setError(err.message);
      setIsScanning(false);
    }
  };

  const cancelScan = async () => {
    try {
      await networkApi.cancelScan();
      setIsScanning(false);
      setScanProgress(0);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSelectPC = (pcId) => {
    setSelectedPCs(prev => 
      prev.includes(pcId) 
        ? prev.filter(id => id !== pcId)
        : [...prev, pcId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPCs.length === connectedPCs.length) {
      setSelectedPCs([]);
    } else {
      setSelectedPCs(connectedPCs.map(pc => pc.id));
    }
  };

  const handleLockPCs = () => {
    if (selectedPCs.length === 0) return;

    // Single PC - use native confirm
    if (selectedPCs.length === 1) {
      const pc = connectedPCs.find(p => p.id === selectedPCs[0]);
      const confirmMessage = `Are you sure you want to lock ${pc?.name || 'this computer'} (${pc?.ip || 'Unknown IP'})?\n\nThis will immediately lock the computer.`;
      
      if (window.confirm(confirmMessage)) {
        performLock(selectedPCs);
      }
    } else {
      // Multiple PCs - show custom modal
      setShowLockModal(true);
      setLockError(null);
    }
  };

  const performLock = async (pcIds) => {
    setIsLocking(true);
    setLockError(null);
    
    try {
      // Lock each selected PC
      const lockPromises = pcIds.map(async (pcId) => {
        await computersApi.update(pcId, { isLocked: true });
      });
      
      await Promise.all(lockPromises);
      
      // Refresh the PC list to show updated status
      await loadDiscoveredDevices();
      
      // Clear selection and close modal
      setSelectedPCs([]);
      setShowLockModal(false);
      
    } catch (err) {
      console.error('Error locking PCs:', err);
      setLockError(err.response?.data?.message || 'Failed to lock one or more computers. Please try again.');
    } finally {
      setIsLocking(false);
    }
  };

  const getSelectedPCDetails = () => {
    return selectedPCs.map(id => connectedPCs.find(pc => pc.id === id)).filter(Boolean);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'online': return 'bg-green-100 text-green-800 border-green-200';
      case 'offline': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'locked': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'online': return <Wifi className="w-4 h-4" />;
      case 'offline': return <WifiOff className="w-4 h-4" />;
      case 'locked': return <Lock className="w-4 h-4" />;
      default: return <WifiOff className="w-4 h-4" />;
    }
  };

  const formatLastScan = (date) => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} min ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-900 text-white p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <Monitor className="w-6 h-6" />
              Developer Mode
            </h2>
            <p className="text-gray-300 mt-1">System testing and PC management interface</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-4 flex-wrap mb-4">
            <button 
              onClick={isScanning ? cancelScan : startNetworkScan}
              disabled={isScanning && !scanStatus?.canScan}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isScanning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Scanning... Found {connectedPCs.length} PCs ({scanProgress}%)
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  Connected PCs ({connectedPCs.filter(pc => pc.status === 'online').length})
                </>
              )}
            </button>
            <button 
              onClick={handleLockPCs}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={selectedPCs.length === 0}
            >
              <Lock className="w-4 h-4" />
              Lock PC {selectedPCs.length > 0 && `(${selectedPCs.length})`}
            </button>
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={selectedPCs.length !== 1}
            >
              <Eye className="w-4 h-4" />
              View PC {selectedPCs.length === 1 && '(1 selected)'}
            </button>
            <div className="ml-auto flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {selectedPCs.length} of {connectedPCs.length} selected
              </span>
              <button
                onClick={handleSelectAll}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {selectedPCs.length === connectedPCs.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>

          {/* Scan Progress Bar */}
          {isScanning && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Network scan in progress...</span>
                <span className="text-sm font-medium text-blue-600">{scanProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${scanProgress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Scan Info */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span>Last scan: {formatLastScan(lastScanTime)}</span>
            {scanStatus && (
              <>
                <span>•</span>
                <span>Status: {scanStatus.isScanning ? 'Scanning' : 'Idle'}</span>
                {scanStatus.devicesFound !== undefined && (
                  <>
                    <span>•</span>
                    <span>Devices found: {scanStatus.devicesFound}</span>
                  </>
                )}
              </>
            )}
            <button 
              onClick={loadDiscoveredDevices}
              className="ml-auto flex items-center gap-1 text-blue-600 hover:text-blue-700"
            >
              <RefreshCw className="w-3 h-3" />
              Refresh
            </button>
          </div>
        </div>

        {/* PC List */}
        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {connectedPCs.length === 0 ? (
            <div className="text-center py-12">
              <Monitor className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No PCs discovered</h3>
              <p className="text-gray-500 mb-4">
                {isScanning ? 'Scanning your network for connected PCs...' : 'Click "Connected PCs" to scan your network'}
              </p>
              {!isScanning && (
                <button
                  onClick={startNetworkScan}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Search className="w-4 h-4 mr-2 inline" />
                  Start Network Scan
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {connectedPCs.map((pc) => (
                <div
                  key={pc.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedPCs.includes(pc.id) 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => handleSelectPC(pc.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedPCs.includes(pc.id)}
                        onChange={() => handleSelectPC(pc.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">{pc.name}</h3>
                        <p className="text-sm text-gray-500">{pc.ip}</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(pc.status)}`}>
                      {getStatusIcon(pc.status)}
                      <span className="ml-1">{pc.status?.toUpperCase() || 'UNKNOWN'}</span>
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">User:</span>
                      <span className="font-medium">{pc.user || 'Unknown'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Last seen:</span>
                      <span>{pc.lastSeen ? formatLastScan(new Date(pc.lastSeen)) : 'Unknown'}</span>
                    </div>
                    {pc.os && (
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">OS:</span>
                        <span>{pc.os}</span>
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100">
                      {pc.cpu && (
                        <div className="flex items-center gap-2">
                          <Cpu className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-600 truncate">{pc.cpu}</span>
                        </div>
                      )}
                      {pc.ram && (
                        <div className="flex items-center gap-2">
                          <MemoryStick className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-600">{pc.ram}</span>
                        </div>
                      )}
                      {pc.storage && (
                        <div className="flex items-center gap-2">
                          <HardDrive className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-600 truncate">{pc.storage}</span>
                        </div>
                      )}
                      {pc.mac && (
                        <div className="flex items-center gap-2">
                          <Wifi className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-600 truncate">{pc.mac}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Total PCs: {connectedPCs.length} | 
              Online: {connectedPCs.filter(pc => pc.status === 'online').length} | 
              Offline: {connectedPCs.filter(pc => pc.status === 'offline').length} | 
              Locked: {connectedPCs.filter(pc => pc.status === 'locked').length}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        {/* Lock Confirmation Modal */}
        {showLockModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
              {/* Modal Header */}
              <div className="bg-red-600 text-white p-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Lock className="w-5 h-5" />
                  Lock {selectedPCs.length} Computers?
                </h3>
                <button
                  onClick={() => !isLocking && setShowLockModal(false)}
                  className="p-1 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50"
                  disabled={isLocking}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6">
                <p className="text-gray-700 mb-4">
                  You are about to lock the following computers. This action will immediately lock the selected PCs.
                </p>

                {/* PC List */}
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg mb-4">
                  {getSelectedPCDetails().map((pc) => (
                    <div key={pc.id} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-900">{pc.name}</p>
                        <p className="text-sm text-gray-500">{pc.ip}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(pc.status)}`}>
                        {pc.status?.toUpperCase() || 'UNKNOWN'}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Warning */}
                <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                  <div className="p-1 bg-yellow-100 rounded-full flex-shrink-0">
                    <Lock className="w-4 h-4 text-yellow-700" />
                  </div>
                  <p className="text-sm text-yellow-800">
                    <strong>Warning:</strong> This will immediately lock the selected computers. Users will be logged out and the PCs will require administrator credentials to unlock.
                  </p>
                </div>

                {/* Error Message */}
                {lockError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{lockError}</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowLockModal(false)}
                  disabled={isLocking}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => performLock(selectedPCs)}
                  disabled={isLocking}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isLocking ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Locking...
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      Lock {selectedPCs.length} {selectedPCs.length === 1 ? 'Computer' : 'Computers'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeveloperMode;
