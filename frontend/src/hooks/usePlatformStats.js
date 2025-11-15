// client/src/hooks/usePlatformStats.js
import { useQuery } from '@tanstack/react-query';
import { statsAPI } from '../services/api';

export function usePlatformOverview(timeframe = '24h') {
  return useQuery({
    queryKey: ['platform-overview', timeframe],
    queryFn: () => statsAPI.getOverview(timeframe).then(res => res.data),
    refetchInterval: 60000,
  });
}

export function useSourcesComparison(timeframe = '24h') {
  return useQuery({
    queryKey: ['sources-comparison', timeframe],
    queryFn: () => statsAPI.getSourcesComparison(timeframe).then(res => res.data),
    refetchInterval: 60000,
  });
}