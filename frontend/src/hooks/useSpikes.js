// client/src/hooks/useSpikes.js
import { useQuery } from '@tanstack/react-query';
import { spikesAPI } from '../services/api';

export function useSpikes(brand) {
  return useQuery({
    queryKey: ['spikes', brand],
    queryFn: () => spikesAPI.getCurrent(brand).then(res => res.data),
    enabled: !!brand,
    refetchInterval: 30000, // Refetch every 30s
  });
}

export function useSpikeHistory(brand, days = 7) {
  return useQuery({
    queryKey: ['spike-history', brand, days],
    queryFn: () => spikesAPI.getHistory(brand, days).then(res => res.data),
    enabled: !!brand,
  });
}