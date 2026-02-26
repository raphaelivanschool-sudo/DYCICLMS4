import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import MessagingModule from '../messaging/MessagingModule';
import {
  LayoutDashboard,
  Ticket,
  Bell,
  LogOut,
  GraduationCap,
  MessageCircle,
} from 'lucide-react';
import { mockStudentSession } from '../../data/mockStudentData';

const navigation = [
  { name: 'Session Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
  { name: 'Support Ticket', href: '/student/tickets', icon: Ticket },
  { name: 'Chats', href: '/student/chats', icon: MessageCircle },
];

function StudentLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showMessaging, setShowMessaging] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('auth');
    navigate('/');
  };

  const handleChatsClick = () => {
    setShowMessaging(true);
  };

  const getBreadcrumb = () => {
    const path = location.pathname;
    const currentNav = navigation.find(item => item.href === path);
    return currentNav ? currentNav.name : 'Dashboard';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Orange accent for Student */}
      <div className="w-64 bg-[#1e293b] flex flex-col flex-shrink-0">
        {/* Logo Area */}
        <div className="h-16 flex items-center px-4 border-b border-slate-700">
          <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center mr-3">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-semibold text-sm">DYCI Student</h1>
            <p className="text-slate-400 text-xs">Portal</p>
          </div>
        </div>

        {/* Current Session Info */}
        <div className="p-4 border-b border-slate-700">
          <p className="text-xs text-slate-400 mb-1">Current Session</p>
          <p className="text-sm font-medium text-white">{mockStudentSession.labName}</p>
          <p className="text-xs text-slate-400">{mockStudentSession.roomNumber}</p>
          <div className="mt-2 flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
            <span className="text-xs text-green-400">Active</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              const isChats = item.name === 'Chats';
              return (
                <li key={item.name}>
                  {isChats ? (
                    <button
                      onClick={handleChatsClick}
                      className={`flex items-center w-full px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                        showMessaging
                          ? 'bg-[#ea580c] text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mr-3 ${showMessaging ? 'text-white' : 'text-slate-400'}`} />
                      {item.name}
                    </button>
                  ) : (
                    <Link
                      to={item.href}
                      className={`flex items-center px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-[#ea580c] text-white'
                          : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <Icon className={`w-4 h-4 mr-3 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      {item.name}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Profile */}
        <div className="border-t border-slate-700 p-4">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center mr-3">
              <span className="text-white text-xs font-semibold">{mockStudentSession.studentInitials}</span>
            </div>
            <div>
              <p className="text-white text-sm font-medium">{mockStudentSession.studentName}</p>
              <p className="text-slate-400 text-xs">{mockStudentSession.pcName}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md text-sm transition-colors"
          >
            <LogOut className="w-4 h-4 mr-3" />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 shadow-sm">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-gray-500">
            <span className="text-gray-900 font-medium">{getBreadcrumb()}</span>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-gray-500 mr-4">
              <span className="text-gray-900 font-medium mr-2">{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
            </div>
            <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-6">
          <Outlet />
        </main>
      </div>

      {/* Messaging Module */}
      <MessagingModule 
        isOpen={showMessaging} 
        onClose={() => setShowMessaging(false)} 
        userRole="student"
        currentUser={{ name: mockStudentSession.studentName, initials: mockStudentSession.studentInitials }}
      />
    </div>
  );
}

export default StudentLayout;
