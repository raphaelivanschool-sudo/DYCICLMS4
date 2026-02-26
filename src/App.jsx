import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Laboratories from './pages/admin/Laboratories';
import Computers from './pages/admin/Computers';
import NetworkControl from './pages/admin/NetworkControl';
import SecuritySettings from './pages/admin/SecuritySettings';
import SystemLogs from './pages/admin/SystemLogs';
import Tickets from './pages/admin/Tickets';
import Inventory from './pages/admin/Inventory';

// Instructor imports
import InstructorLayout from './components/layout/InstructorLayout';
import ClassroomDashboard from './pages/instructor/ClassroomDashboard';
import StudentScreenMonitoring from './pages/instructor/StudentScreenMonitoring';
import ControlActions from './pages/instructor/ControlActions';
import Messaging from './pages/instructor/Messaging';

// Student imports
import StudentLayout from './components/layout/StudentLayout';
import SessionDashboard from './pages/student/SessionDashboard';
import SupportTicket from './pages/student/SupportTicket';

// Simple auth check - in real app, this would validate the token
const isAuthenticated = () => {
  const auth = localStorage.getItem('auth');
  if (!auth) return false;
  try {
    const authData = JSON.parse(auth);
    // Check if auth is not expired (24 hours)
    const isExpired = Date.now() - authData.timestamp > 24 * 60 * 60 * 1000;
    return !isExpired;
  } catch {
    return false;
  }
};

const getUserRole = () => {
  const auth = localStorage.getItem('auth');
  if (!auth) return null;
  try {
    const authData = JSON.parse(auth);
    return authData.role;
  } catch {
    return null;
  }
};

// Protected Route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  
  const userRole = getUserRole();
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect to appropriate portal based on role
    if (userRole === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (userRole === 'instructor') return <Navigate to="/instructor/dashboard" replace />;
    if (userRole === 'student') return <Navigate to="/student/dashboard" replace />;
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Login Page - Public */}
        <Route path="/" element={<Login />} />
        
        {/* Admin Routes */}
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="laboratories" element={<Laboratories />} />
          <Route path="computers" element={<Computers />} />
          <Route path="network" element={<NetworkControl />} />
          <Route path="security" element={<SecuritySettings />} />
          <Route path="logs" element={<SystemLogs />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="inventory" element={<Inventory />} />
        </Route>

        {/* Instructor Routes */}
        <Route 
          path="/instructor" 
          element={
            <ProtectedRoute allowedRoles={['instructor']}>
              <InstructorLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ClassroomDashboard />} />
          <Route path="monitoring" element={<StudentScreenMonitoring />} />
          <Route path="controls" element={<ControlActions />} />
          <Route path="messaging" element={<Messaging />} />
        </Route>

        {/* Student Routes */}
        <Route 
          path="/student" 
          element={
            <ProtectedRoute allowedRoles={['student']}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<SessionDashboard />} />
          <Route path="tickets" element={<SupportTicket />} />
        </Route>

        {/* Catch all - Redirect to login */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
