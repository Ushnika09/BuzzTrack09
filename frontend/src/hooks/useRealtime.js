// // client/src/hooks/useMentions.js
// import { useQuery } from '@tanstack/react-query';
// import { mentionsAPI } from '../services/api';

// export function useMentions(filters = {}, options = {}) {
//   return useQuery({
//     queryKey: ['mentions', filters],
//     queryFn: () => mentionsAPI.getAll(filters).then(res => res.data),
//     refetchInterval: 30000, // Refetch every 30s
//     ...options,
//   });
// }

// // client/src/hooks/useBrandStats.js
// import { useQuery } from '@tanstack/react-query';
// import { statsAPI } from '../services/api';

// export function useBrandStats(brand, timeframe = '24h') {
//   return useQuery({
//     queryKey: ['stats', brand, timeframe],
//     queryFn: () => statsAPI.getBrandStats(brand, timeframe).then(res => res.data),
//     enabled: !!brand,
//     refetchInterval: 60000, // Refetch every minute
//   });
// }

// // client/src/hooks/useBrands.js
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { brandsAPI } from '../services/api';

// export function useBrands() {
//   return useQuery({
//     queryKey: ['brands'],
//     queryFn: () => brandsAPI.getAll().then(res => res.data),
//   });
// }

// export function useAddBrand() {
//   const queryClient = useQueryClient();
  
//   return useMutation({
//     mutationFn: (brand) => brandsAPI.add(brand),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['brands'] });
//     },
//   });
// }

// export function useRemoveBrand() {
//   const queryClient = useQueryClient();
  
//   return useMutation({
//     mutationFn: (brand) => brandsAPI.remove(brand),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['brands'] });
//     },
//   });
// }

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

// // client/src/hooks/useFilters.js
// import { useState, useMemo } from 'react';

// export function useFilters(initialFilters = {}) {
//   const [filters, setFilters] = useState(initialFilters);

//   const updateFilter = (key, value) => {
//     setFilters(prev => ({ ...prev, [key]: value }));
//   };

//   const clearFilters = () => {
//     setFilters(initialFilters);
//   };

//   const activeFiltersCount = useMemo(() => {
//     return Object.values(filters).filter(v => v !== null && v !== undefined && v !== '').length;
//   }, [filters]);

//   return {
//     filters,
//     updateFilter,
//     clearFilters,
//     activeFiltersCount,
//   };
// }

// // client/src/hooks/useOnboarding.js
// import { useState, useEffect } from 'react';

// export function useOnboarding() {
//   const [showOnboarding, setShowOnboarding] = useState(false);
//   const [currentStep, setCurrentStep] = useState(0);

//   useEffect(() => {
//     const hasSeenOnboarding = localStorage.getItem('buzztrack-onboarding-complete');
//     if (!hasSeenOnboarding) {
//       setShowOnboarding(true);
//     }
//   }, []);

//   const completeOnboarding = () => {
//     localStorage.setItem('buzztrack-onboarding-complete', 'true');
//     setShowOnboarding(false);
//     setCurrentStep(0);
//   };

//   const nextStep = () => {
//     setCurrentStep(prev => prev + 1);
//   };

//   const prevStep = () => {
//     setCurrentStep(prev => Math.max(0, prev - 1));
//   };

//   return {
//     showOnboarding,
//     currentStep,
//     nextStep,
//     prevStep,
//     completeOnboarding,
//     setShowOnboarding,
//   };
// }