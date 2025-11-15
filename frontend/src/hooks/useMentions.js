// client/src/hooks/useMentions.js
import { useQuery } from '@tanstack/react-query';
import { mentionsAPI } from '../services/api';

export function useMentions(filters = {}, options = {}) {
  return useQuery({
    queryKey: ['mentions', filters],
    queryFn: () => mentionsAPI.getAll(filters).then(res => res.data),
    refetchInterval: 30000, // Refetch every 30s
    ...options,
  });
}



