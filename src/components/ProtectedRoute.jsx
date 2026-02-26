import { Navigate } from 'react-router-dom';

const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

const getUserRole = () => {
  const user = localStorage.getItem('user');
  if (!user) return null;
  try {
    const userData = JSON.parse(user);
    return userData.role?.toLowerCase();
  } catch {
    return null;
  }
};

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

export default ProtectedRoute;
