// client/src/hooks/useFilters.js
import { useState, useMemo } from 'react';

export function useFilters(initialFilters = {}) {
  const [filters, setFilters] = useState(initialFilters);

  const updateFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters(initialFilters);
  };

  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter(v => v !== null && v !== undefined && v !== '').length;
  }, [filters]);

  return {
    filters,
    updateFilter,
    clearFilters,
    activeFiltersCount,
  };
}