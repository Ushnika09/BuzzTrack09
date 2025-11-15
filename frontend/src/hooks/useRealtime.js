

// client/src/hooks/useRealtime.js
import { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export function useRealtime(brand) {
  const [socket, setSocket] = useState(null);
  const [newMention, setNewMention] = useState(null);
  const [spike, setSpike] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    console.log('🔌 Initializing WebSocket connection...');
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      console.log('✅ Socket connected, ID:', socketInstance.id);
      setIsConnected(true);
      
      if (brand) {
        console.log('📡 Subscribing to brand:', brand);
        socketInstance.emit('subscribe', { brand });
      }
    });

    socketInstance.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('🔴 Socket connection error:', error);
    });

    // Listen for new mentions
    socketInstance.on('new-mention', (mention) => {
      console.log('📨 New mention received:', mention);
      setNewMention(mention);
      // Clear after 5 seconds to allow new mentions
      setTimeout(() => setNewMention(null), 5000);
    });

    // Listen for spike alerts (brand-specific room)
    socketInstance.on('spike-alert', (spikeData) => {
      console.log('🚨🚨🚨 SPIKE ALERT RECEIVED (brand room):', spikeData);
      if (spikeData && spikeData.brand === brand) {
        console.log('✅ Spike is for current brand, updating state');
        setSpike(spikeData);
      }
    });

    // ALSO listen for general spike alerts (broadcast)
    socketInstance.on('spike-alert-general', (spikeData) => {
      console.log('🚨 SPIKE ALERT RECEIVED (general):', spikeData);
      if (spikeData && spikeData.brand === brand) {
        console.log('✅ General spike is for current brand, updating state');
        setSpike(spikeData);
      }
    });

    setSocket(socketInstance);

    return () => {
      console.log('🔌 Cleaning up WebSocket...');
      if (brand) {
        socketInstance.emit('unsubscribe', { brand });
      }
      socketInstance.close();
    };
  }, [brand]);

  // Function to clear spike manually
  const clearSpike = useCallback(() => {
    console.log('🧹 Clearing spike state');
    setSpike(null);
  }, []);

  return { 
    socket, 
    newMention, 
    spike, 
    isConnected,
    clearSpike 
  };
}

