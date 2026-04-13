import { useState, useEffect, useCallback } from 'react';
import { getAgents, getStats } from '../api/agentApi';

export function useMachines() {
  const [machines, setMachines] = useState([]);
  const [stats, setStats] = useState({ total: 0, online: 0, offline: 0, alerts: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [agentsRes, statsRes] = await Promise.all([
        getAgents(),
        getStats()
      ]);
      
      setMachines(agentsRes.data || []);
      setStats(statsRes.data || { total: 0, online: 0, offline: 0, alerts: [] });
    } catch (err) {
      setError(err.message || 'Failed to fetch machines');
      console.error('Error fetching machines:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateMachineStatus = useCallback((id, status) => {
    setMachines(prev => 
      prev.map(machine => 
        machine.id === id 
          ? { ...machine, status, lastSeen: new Date().toISOString() }
          : machine
      )
    );
    
    // Update stats
    setStats(prev => {
      const machine = machines.find(m => m.id === id);
      if (!machine || machine.status === status) return prev;
      
      const wasOnline = machine.status === 'ONLINE';
      const isOnline = status === 'ONLINE';
      
      return {
        ...prev,
        online: prev.online + (isOnline ? 1 : -1),
        offline: prev.offline + (wasOnline ? 1 : -1)
      };
    });
  }, [machines]);

  const refetch = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    machines,
    stats,
    isLoading,
    error,
    updateMachineStatus,
    refetch
  };
}
