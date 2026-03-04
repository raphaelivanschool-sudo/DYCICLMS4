// Authentication utilities

export const getToken = () => {
  return localStorage.getItem('token');
};

export const getUser = () => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

export const getUserRole = () => {
  const user = getUser();
  return user?.role || null;
};

export const getCurrentUserId = () => {
  const user = getUser();
  return user?.id || null;
};

export const isAuthenticated = () => {
  return !!getToken();
};

export const hasRole = (role) => {
  const userRole = getUserRole();
  return userRole === role;
};
