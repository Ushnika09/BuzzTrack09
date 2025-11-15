// client/src/hooks/useBrands.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { brandsAPI } from '../services/api';

export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: () => brandsAPI.getAll().then(res => res.data),
  });
}

export function useAddBrand() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (brand) => brandsAPI.add(brand),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });
}

export function useRemoveBrand() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (brand) => brandsAPI.remove(brand),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['brands'] });
    },
  });
}



