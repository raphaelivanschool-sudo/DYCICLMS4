import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Labs API
export const labsApi = {
  // Get all labs
  getAll: () => api.get('/api/labs'),
  
  // Get single lab by ID
  getById: (id) => api.get(`/api/labs/${id}`),
  
  // Create new lab
  create: (data) => api.post('/api/labs', data),
  
  // Update lab
  update: (id, data) => api.put(`/api/labs/${id}`, data),
  
  // Delete lab
  delete: (id) => api.delete(`/api/labs/${id}`)
};

// Users API
export const usersApi = {
  // Get all users with optional role filter
  getAll: (role) => {
    const params = role ? { role } : {};
    return api.get('/api/users', { params });
  }
};

// Computers API
export const computersApi = {
  // Get all computers with optional filters
  getAll: (filters = {}) => api.get('/api/computers', { params: filters }),
  
  // Get single computer by ID
  getById: (id) => api.get(`/api/computers/${id}`),
  
  // Update computer
  update: (id, data) => api.put(`/api/computers/${id}`, data),
  
  // Delete computer
  delete: (id) => api.delete(`/api/computers/${id}`)
};

// Dashboard API
export const dashboardApi = {
  // Get all dashboard statistics
  getStats: () => api.get('/api/dashboard/stats'),
  
  // Get recent activity logs
  getRecentActivity: () => api.get('/api/dashboard/recent-activity')
};

export default api;
