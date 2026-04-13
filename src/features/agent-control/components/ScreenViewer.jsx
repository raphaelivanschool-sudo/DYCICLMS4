import { X, Monitor, Loader2 } from 'lucide-react';
import { sendCommand } from '../api/agentApi';

export function ScreenViewer({ frame, machineId, hostname, onClose }) {
  const handleClose = async () => {
    try {
      await sendCommand(machineId, 'stream_stop');
    } catch (err) {
      console.error('Failed to stop stream:', err);
    }
    onClose();
  };

  return (
    <div className="bg-gray-900 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <Monitor className="w-5 h-5 text-blue-400" />
          <span className="font-medium text-gray-100">{hostname || 'Unknown Machine'}</span>
          <span className="text-sm text-gray-400">Screen Stream</span>
        </div>
        <button
          onClick={handleClose}
          className="p-2 rounded-lg hover:bg-gray-700 text-gray-400 hover:text-gray-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Viewer */}
      <div className="aspect-video bg-black flex items-center justify-center">
        {frame ? (
          <img
            src={`data:image/jpeg;base64,${frame}`}
            alt="Screen stream"
            className="max-w-full max-h-full object-contain"
          />
        ) : (
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-gray-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Waiting for stream...</p>
            <p className="text-gray-600 text-sm mt-2">The agent is connecting to the stream server</p>
          </div>
        )}
      </div>
    </div>
  );
}
