import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, 
  GraduationCap, 
  Users, 
  ArrowRight,
  Monitor,
  Lock,
  User
} from 'lucide-react';

const ROLES = [
  { 
    id: 'admin', 
    label: 'IT Administrator', 
    icon: Shield, 
    color: 'blue',
    credentials: { username: 'admin', password: 'admin123' },
    redirect: '/admin/dashboard'
  },
  { 
    id: 'instructor', 
    label: 'Instructor', 
    icon: GraduationCap, 
    color: 'green',
    credentials: { username: 'instructor', password: 'instructor123' },
    redirect: '/instructor/dashboard'
  },
  { 
    id: 'student', 
    label: 'Student', 
    icon: Users, 
    color: 'orange',
    credentials: { username: 'student', password: 'student123' },
    redirect: '/student/dashboard'
  },
];

function Login() {
  const [selectedRole, setSelectedRole] = useState('admin');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const role = ROLES.find(r => r.id === selectedRole);
    
    // Simulate authentication delay
    setTimeout(() => {
      if (username === role.credentials.username && password === role.credentials.password) {
        // Store auth data in localStorage
        localStorage.setItem('auth', JSON.stringify({
          role: selectedRole,
          username: username,
          timestamp: Date.now()
        }));
        navigate(role.redirect);
      } else {
        setError('Invalid credentials. Please try again.');
      }
      setIsLoading(false);
    }, 800);
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
      green: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
      orange: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100',
    };
    return colors[color] || colors.blue;
  };

  const getActiveColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200',
      green: 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-200',
      orange: 'bg-orange-600 text-white border-orange-600 shadow-lg shadow-orange-200',
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl">
          <Monitor className="w-10 h-10 text-blue-700" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Dr. Yanga's Colleges Inc.</h1>
        <p className="text-blue-200">Classroom Laboratory Management System</p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-white rounded-lg shadow-2xl overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-slate-50 to-white border-b border-gray-100">
          <h2 className="text-xl font-semibold text-slate-800">Sign In</h2>
          <p className="text-slate-500 text-sm mt-1">Enter your credentials to access the system</p>
        </div>
        
        <div className="p-6">
          {/* Role Selector */}
          <div className="mb-6">
            <label className="text-sm font-medium text-slate-700 mb-3 block">Select Role</label>
            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => {
                      setSelectedRole(role.id);
                      setError('');
                    }}
                    className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-200 ${
                      isSelected 
                        ? getActiveColorClasses(role.color)
                        : `bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50`
                    }`}
                  >
                    <Icon className="w-5 h-5 mb-1" />
                    <span className="text-xs font-medium">{role.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Username</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-10 pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 pl-10 pr-3 py-2 bg-white border border-gray-300 rounded-md text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <button 
              type="submit" 
              className="w-full h-10 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Sign In
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs font-medium text-amber-800 mb-2">Demo Credentials:</p>
            <div className="space-y-1 text-xs text-amber-700">
              <p><strong>Admin:</strong> admin / admin123</p>
              <p><strong>Instructor:</strong> instructor / instructor123</p>
              <p><strong>Student:</strong> student / student123</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p className="text-slate-400 text-sm mt-8">
        © 2025 Dr. Yanga's Colleges Inc. All rights reserved.
      </p>
    </div>
  );
}

export default Login;
