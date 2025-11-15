// client/src/hooks/useCollection.js
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { brandsAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

export function useTriggerCollection() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: (brand) => brandsAPI.triggerCollection(brand),
    onSuccess: (data, brand) => {
      toast.success(`Collection triggered for ${brand}`);
      // Invalidate relevant queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['mentions'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
      queryClient.invalidateQueries({ queryKey: ['overview'] });
    },
    onError: (error, brand) => {
      toast.error(`Failed to collect data for ${brand}`);
    },
  });
}