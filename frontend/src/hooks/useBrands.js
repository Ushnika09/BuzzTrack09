// hooks/useBrands.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { brandsAPI } from '../services/api';

// Get all tracked brands
export function useBrands() {
  return useQuery({
    queryKey: ['brands'],
    queryFn: async () => {
      const response = await brandsAPI.getAll();
      return response.data;
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchOnWindowFocus: true,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

// Add a new brand
export function useAddBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (brandName) => {
      console.log('Adding brand:', brandName);
      
      // Validate input before sending
      if (!brandName || typeof brandName !== 'string') {
        throw new Error('Invalid brand name');
      }

      const cleanBrandName = brandName.trim();
      if (cleanBrandName.length === 0) {
        throw new Error('Brand name cannot be empty');
      }

      try {
        const response = await brandsAPI.add(cleanBrandName);
        console.log('Add brand API response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Add brand API error:', error);
        
        // Enhanced error handling
        if (error.response) {
          // Server responded with error
          throw new Error(error.response.data?.error || error.response.data?.message || 'Failed to add brand');
        } else if (error.request) {
          // Request made but no response
          throw new Error('No response from server. Please check your connection.');
        } else {
          // Something else went wrong
          throw new Error(error.message || 'Failed to add brand');
        }
      }
    },
    onSuccess: (data, brandName) => {
      console.log('Brand added successfully:', data);
      
      // Invalidate and refetch brands list
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      
      // Also invalidate overview to reflect new brand
      queryClient.invalidateQueries({ queryKey: ['overview'] });
      
      // Optionally, optimistically update the cache
      queryClient.setQueryData(['brands'], (old) => {
        if (!old) return old;
        
        return {
          ...old,
          brands: [...(old.brands || []), brandName],
          count: (old.count || 0) + 1
        };
      });
    },
    onError: (error) => {
      console.error('Brand addition failed:', error);
    },
    retry: false, // Don't retry failed mutations automatically
  });
}

// Remove a brand
export function useRemoveBrand() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (brandName) => {
      console.log('Removing brand:', brandName);
      
      try {
        const response = await brandsAPI.remove(brandName);
        console.log('Remove brand API response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Remove brand API error:', error);
        
        if (error.response) {
          throw new Error(error.response.data?.error || 'Failed to remove brand');
        } else if (error.request) {
          throw new Error('No response from server. Please check your connection.');
        } else {
          throw new Error(error.message || 'Failed to remove brand');
        }
      }
    },
    onSuccess: (data, brandName) => {
      console.log('Brand removed successfully:', data);
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['brands'] });
      queryClient.invalidateQueries({ queryKey: ['overview'] });
      queryClient.invalidateQueries({ queryKey: ['stats', brandName] });
      
      // Optimistically update cache
      queryClient.setQueryData(['brands'], (old) => {
        if (!old) return old;
        
        return {
          ...old,
          brands: (old.brands || []).filter(b => b !== brandName),
          count: Math.max((old.count || 0) - 1, 0)
        };
      });
    },
    onError: (error) => {
      console.error('Brand removal failed:', error);
    },
    retry: false,
  });
}

// Trigger manual collection for a brand
export function useTriggerCollection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (brandName) => {
      console.log('Triggering collection for:', brandName);
      
      try {
        const response = await brandsAPI.triggerCollection(brandName);
        console.log('Trigger collection API response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Trigger collection API error:', error);
        
        if (error.response) {
          throw new Error(error.response.data?.error || 'Failed to trigger collection');
        } else if (error.request) {
          throw new Error('No response from server. Please check your connection.');
        } else {
          throw new Error(error.message || 'Failed to trigger collection');
        }
      }
    },
    onSuccess: (data, brandName) => {
      console.log('Collection triggered successfully:', data);
      
      // Invalidate related queries after a short delay
      // (give the server time to collect data)
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['stats', brandName] });
        queryClient.invalidateQueries({ queryKey: ['mentions', brandName] });
        queryClient.invalidateQueries({ queryKey: ['overview'] });
      }, 2000);
    },
    onError: (error) => {
      console.error('Collection trigger failed:', error);
    },
    retry: 1,
  });
}