// client/src/hooks/useOverview.js
import { useQuery } from '@tanstack/react-query';
import { overviewAPI, statsAPI } from '../services/api';

export function useOverview() {
  return useQuery({
    queryKey: ['overview'],
    queryFn: () => overviewAPI.getAll().then(res => res.data),
    refetchInterval: 60000, // Refetch every minute
  });
}

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