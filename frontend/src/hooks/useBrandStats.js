// client/src/hooks/useBrandStats.js
import { useQuery } from '@tanstack/react-query';
import { statsAPI } from '../services/api';

export function useBrandStats(brand, timeframe = '7d') {
  return useQuery({
    queryKey: ['stats', brand, timeframe],
    queryFn: async () => {
      console.log('🔄 useBrandStats fetching for:', brand);
      const response = await statsAPI.getBrandStats(brand, timeframe);
      console.log('📦 useBrandStats raw response:', response);
      console.log('📊 useBrandStats response data:', response.data);
      return response.data;
    },
    enabled: !!brand,
    refetchInterval: 60000,
  });
}