import { useEffect, useRef } from 'react';

export function useAgentSocket(onMessage) {
  const socketRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No auth token found for WebSocket connection');
      return;
    }

    const hostname = window.location.hostname;
    const wsUrl = `ws://${hostname}:4000?type=dashboard&token=${token}`;

    try {
      socketRef.current = new WebSocket(wsUrl);

      socketRef.current.onopen = () => {
        console.log('Agent WebSocket connected');
      };

      socketRef.current.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          onMessage?.(message);
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };

      socketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      socketRef.current.onclose = () => {
        console.log('Agent WebSocket disconnected');
      };
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [onMessage]);

  return socketRef.current;
}
