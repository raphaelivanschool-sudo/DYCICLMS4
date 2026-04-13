import api from '../../../services/api';

export const getAgents = () => api.get('/api/agents');

export const getStats = () => api.get('/api/agents/stats');

export const sendCommand = (targetId, cmd) => 
  api.post('/api/agents/command', { targetId, cmd });

export const wakeAgent = (mac) => 
  api.post('/api/agents/wake', { mac });

export const getAgentLogs = (id, page = 1, limit = 20) => 
  api.get(`/api/agents/${id}/logs`, { params: { page, limit } });

export const getAllLogs = (page = 1, limit = 20) => 
  api.get('/api/agents/logs', { params: { page, limit } });
