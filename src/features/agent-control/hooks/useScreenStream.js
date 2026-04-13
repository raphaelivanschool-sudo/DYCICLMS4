import { useState, useCallback, useRef, useEffect } from 'react';
import { sendCommand } from '../api/agentApi';

export function useScreenStream(socket) {
  const [currentFrame, setCurrentFrame] = useState(null);
  const [viewingId, setViewingIdState] = useState(null);
  const previousIdRef = useRef(null);

  const setViewingId = useCallback(async (newId) => {
    // Stop stream on previous machine
    if (previousIdRef.current && previousIdRef.current !== newId) {
      try {
        await sendCommand(previousIdRef.current, 'stream_stop');
      } catch (err) {
        console.error('Failed to stop stream:', err);
      }
    }

    // Start stream on new machine
    if (newId && newId !== previousIdRef.current) {
      try {
        await sendCommand(newId, 'stream_start');
        setCurrentFrame(null);
      } catch (err) {
        console.error('Failed to start stream:', err);
      }
    }

    previousIdRef.current = newId;
    setViewingIdState(newId);
  }, []);

  // Handle incoming frame messages
  useEffect(() => {
    if (!socket) return;

    const handleMessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === 'frame' && message.agentId === viewingId) {
          setCurrentFrame(message.data);
        }
      } catch (err) {
        console.error('Failed to parse frame message:', err);
      }
    };

    socket.addEventListener('message', handleMessage);
    return () => {
      socket.removeEventListener('message', handleMessage);
    };
  }, [socket, viewingId]);

  return {
    currentFrame,
    viewingId,
    setViewingId
  };
}
