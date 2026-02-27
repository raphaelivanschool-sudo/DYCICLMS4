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

export default api;
