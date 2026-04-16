import { useState, useEffect } from 'react';
import { Monitor, Lock, Power, Eye, Wifi, WifiOff, Settings } from 'lucide-react';

const PCControlPanel = () => {
  const [pcs, setPcs] = useState([
    { 
      id: 1, 
      name: 'Teacher-PC', 
      ip: '192.168.1.193', 
      status: 'online',
      vncPort: 5900,
      password: 'labpass123'
    },
    { 
      id: 2, 
      name: 'Student-PC-01', 
      ip: '192.168.1.106', 
      status: 'online',
      vncPort: 5900,
      password: 'labpass123'
    },
  ]);

  const [selectedPC, setSelectedPC] = useState(null);
  const [showVNC, setShowVNC] = useState(false);

  const viewScreen = (pc) => {
    setSelectedPC(pc);
    setShowVNC(true);
  };

  const closeVNC = () => {
    setShowVNC(false);
    setSelectedPC(null);
  };

  const lockPC = (pc) => {
    // In a real implementation, this would send a command to the PC
    alert(`Lock command sent to ${pc.name} (${pc.ip})`);
    // You could use your custom agent or PsExec for this
  };

  const shutdownPC = (pc) => {
    if (confirm(`Are you sure you want to shutdown ${pc.name}?`)) {
      alert(`Shutdown command sent to ${pc.name} (${pc.ip})`);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Monitor className="w-8 h-8 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">PC Control Panel</h2>
            <p className="text-gray-500 text-sm">Manage lab computers remotely</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            <Settings className="w-4 h-4" />
            Settings
          </button>
        </div>
      </div>

      {/* PC Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pcs.map(pc => (
          <div key={pc.id} className="border rounded-xl p-4 bg-gray-50 hover:bg-white hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-gray-600" />
                <h3 className="font-semibold text-gray-900">{pc.name}</h3>
              </div>
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                pc.status === 'online' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {pc.status === 'online' ? (
                  <><Wifi className="w-3 h-3" /> Online</>
                ) : (
                  <><WifiOff className="w-3 h-3" /> Offline</>
                )}
              </div>
            </div>
            
            <p className="text-gray-500 text-sm mb-1">{pc.ip}</p>
            <p className="text-gray-400 text-xs mb-4">VNC Port: {pc.vncPort}</p>
            
            <div className="flex gap-2">
              <button 
                onClick={() => viewScreen(pc)}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Eye className="w-4 h-4" />
                View
              </button>
              <button 
                onClick={() => lockPC(pc)}
                className="flex items-center justify-center gap-2 bg-yellow-500 text-white px-3 py-2 rounded-lg hover:bg-yellow-600 transition-colors"
              >
                <Lock className="w-4 h-4" />
              </button>
              <button 
                onClick={() => shutdownPC(pc)}
                className="flex items-center justify-center gap-2 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                <Power className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* VNC Viewer Modal */}
      {showVNC && selectedPC && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl overflow-hidden">
            {/* Header */}
            <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Monitor className="w-6 h-6" />
                <div>
                  <h3 className="font-semibold">{selectedPC.name}</h3>
                  <p className="text-gray-400 text-sm">{selectedPC.ip}:{selectedPC.vncPort}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.open(`vnc://viewer?host=${selectedPC.ip}&port=${selectedPC.vncPort}`, '_blank')}
                  className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Open in VNC Viewer
                </button>
                <button
                  onClick={closeVNC}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* VNC Container */}
            <div className="p-4 bg-gray-100">
              <div className="bg-black rounded-lg overflow-hidden" style={{ height: '600px' }}>
                {/* Placeholder for VNC - You can integrate noVNC here */}
                <div className="h-full flex flex-col items-center justify-center text-white">
                  <Monitor className="w-16 h-16 mb-4 text-gray-600" />
                  <p className="text-gray-400 mb-4">VNC Connection to {selectedPC.name}</p>
                  
                  {/* Option 1: Direct VNC Link */}
                  <a 
                    href={`vnc://viewer?host=${selectedPC.ip}&port=${selectedPC.vncPort}`}
                    className="px-6 py-3 bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors mb-3"
                  >
                    Connect with TightVNC Viewer
                  </a>
                  
                  {/* Instructions */}
                  <div className="mt-4 p-4 bg-gray-800 rounded-lg max-w-md text-sm text-gray-400">
                    <p className="mb-2"><strong>VNC Password:</strong> {selectedPC.password}</p>
                    <p>1. Install TightVNC Viewer on this PC</p>
                    <p>2. Click the button above or use:</p>
                    <p className="font-mono text-xs mt-1">Host: {selectedPC.ip}</p>
                    <p className="font-mono text-xs">Port: {selectedPC.vncPort}</p>
                  </div>

                  {/* Option 2: Browser-based (if noVNC is set up) */}
                  {/* 
                  <iframe 
                    src={`http://${selectedPC.ip}:6080/vnc.html?host=${selectedPC.ip}&port=${selectedPC.vncPort}`}
                    width="100%" 
                    height="100%"
                    className="border-0"
                  />
                  */}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PCControlPanel;
