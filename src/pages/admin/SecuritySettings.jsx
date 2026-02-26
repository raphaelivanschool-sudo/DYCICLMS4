import { useState } from 'react';
import {
  Shield,
  Lock,
  Globe,
  AppWindow,
  Monitor,
  AlertCircle,
  CheckCircle,
  XCircle,
  Building2,
  Save
} from 'lucide-react';

// Mock data
const labs = [
  { id: 1, name: 'EdTech Laboratory', building: 'Building A' },
  { id: 2, name: 'Sandbox', building: 'Building B' },
  { id: 3, name: 'Nexus', building: 'Building C' },
  { id: 4, name: 'Innovation Hub', building: 'Building D' },
  { id: 5, name: 'Tech Lab 5', building: 'Building E' },
];

const blockedWebsites = [
  'facebook.com',
  'youtube.com',
  'twitter.com',
  'instagram.com',
  'tiktok.com',
];

const blockedApps = [
  'Games',
  'Social Media Apps',
  'Video Streaming',
  'File Sharing',
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

function SecuritySettings() {
  const [selectedLab, setSelectedLab] = useState('all');
  const [securitySettings, setSecuritySettings] = useState({
    blockWebsites: true,
    restrictApps: true,
    lockScreens: false,
    disableUSB: false,
    requireLogin: true,
  });

  const toggleSetting = (setting) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Security Settings</h1>
        <p className="text-gray-500">Configure security policies and restrictions across laboratories</p>
      </div>

      {/* Lab Selector */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
        <div className="flex items-center space-x-4">
          <Building2 className="w-5 h-5 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Apply settings to:</span>
          <select
            value={selectedLab}
            onChange={(e) => setSelectedLab(e.target.value)}
            className="flex-1 max-w-xs h-10 px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Laboratories</option>
            {labs.map(lab => (
              <option key={lab.id} value={lab.id}>{lab.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Website Blocking */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center mr-3">
                <Globe className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Website Blocking</h3>
                <p className="text-sm text-gray-500">Block access to restricted websites</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Shield className="w-5 h-5 text-gray-600 mr-3" />
                <span className="text-sm font-medium text-gray-700">Enable Website Blocking</span>
              </div>
              <button
                onClick={() => toggleSetting('blockWebsites')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  securitySettings.blockWebsites ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    securitySettings.blockWebsites ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Blocked Websites:</p>
              <div className="space-y-2">
                {blockedWebsites.map((site, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-red-50 rounded-md">
                    <div className="flex items-center">
                      <XCircle className="w-4 h-4 text-red-500 mr-2" />
                      <span className="text-sm text-red-700">{site}</span>
                    </div>
                    <button className="text-red-400 hover:text-red-600">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button className="w-full py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors border border-dashed border-blue-300">
                + Add Website to Blocklist
              </button>
            </div>
          </div>
        </div>

        {/* App Restrictions */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center mr-3">
                <AppWindow className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">App Restrictions</h3>
                <p className="text-sm text-gray-500">Control which applications can run</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Lock className="w-5 h-5 text-gray-600 mr-3" />
                <span className="text-sm font-medium text-gray-700">Enable App Restrictions</span>
              </div>
              <button
                onClick={() => toggleSetting('restrictApps')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  securitySettings.restrictApps ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    securitySettings.restrictApps ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Restricted Categories:</p>
              <div className="space-y-2">
                {blockedApps.map((app, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-orange-50 rounded-md">
                    <div className="flex items-center">
                      <AlertCircle className="w-4 h-4 text-orange-500 mr-2" />
                      <span className="text-sm text-orange-700">{app}</span>
                    </div>
                    <Badge variant="warning">Blocked</Badge>
                  </div>
                ))}
              </div>
              <button className="w-full py-2 text-sm text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors border border-dashed border-blue-300">
                + Add App Category
              </button>
            </div>
          </div>
        </div>

        {/* Screen Lock Controls */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                <Monitor className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Screen Lock Controls</h3>
                <p className="text-sm text-gray-500">Remote screen lock capabilities</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Lock className="w-5 h-5 text-gray-600 mr-3" />
                <span className="text-sm font-medium text-gray-700">Allow Remote Screen Lock</span>
              </div>
              <button
                onClick={() => toggleSetting('lockScreens')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  securitySettings.lockScreens ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    securitySettings.lockScreens ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button className="flex items-center justify-center p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                <Lock className="w-4 h-4 text-blue-600 mr-2" />
                <span className="text-sm font-medium text-blue-700">Lock All Screens</span>
              </button>
              <button className="flex items-center justify-center p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                <span className="text-sm font-medium text-green-700">Unlock All Screens</span>
              </button>
            </div>
          </div>
        </div>

        {/* USB & Device Controls */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mr-3">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Device Controls</h3>
                <p className="text-sm text-gray-500">USB and external device restrictions</p>
              </div>
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <XCircle className="w-5 h-5 text-gray-600 mr-3" />
                <span className="text-sm font-medium text-gray-700">Disable USB Storage</span>
              </div>
              <button
                onClick={() => toggleSetting('disableUSB')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  securitySettings.disableUSB ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    securitySettings.disableUSB ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-gray-600 mr-3" />
                <span className="text-sm font-medium text-gray-700">Require User Login</span>
              </div>
              <button
                onClick={() => toggleSetting('requireLogin')}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  securitySettings.requireLogin ? 'bg-blue-600' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    securitySettings.requireLogin ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button className="flex items-center h-10 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors">
          <Save className="w-4 h-4 mr-2" />
          Save Security Settings
        </button>
      </div>
    </div>
  );
}

export default SecuritySettings;
