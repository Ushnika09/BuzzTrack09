import { createContext, useContext, useEffect, useState } from 'react';
import io from 'socket.io-client';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socketUrl = import.meta.env.VITE_WS_URL || 'http://localhost:5000';
    console.log('🔌 Connecting to WebSocket:', socketUrl);
    
    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling']
    });

    newSocket.on('connect', () => {
      console.log('✅ WebSocket connected successfully');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ WebSocket disconnected');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('❌ WebSocket connection error:', error);
    });

    // Listen for spike alerts globally
    newSocket.on('spike-alert-general', (spike) => {
      console.log('📡 RECEIVED SPIKE ALERT (general):', spike);
    });

    // Listen for any spike alerts
    newSocket.on('spike-alert', (spike) => {
      console.log('📡 RECEIVED SPIKE ALERT (specific):', spike);
    });

    setSocket(newSocket);

    return () => {
      console.log('🔌 Cleaning up WebSocket connection');
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
}