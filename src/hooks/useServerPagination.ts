import { useState, useEffect, useCallback } from 'react';

interface UseServerPaginationProps {
  endpoint: string;
  initialParams?: Record<string, string>;
}

interface PaginationData {
  data?: any[];
  equipments?: any[];
  [key: string]: any;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const useServerPagination = ({ endpoint, initialParams = {} }: UseServerPaginationProps) => {
  const [data, setData] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<Record<string, string>>(initialParams);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      // Only add non-empty filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value.trim() !== '') {
          params.append(key, value);
        }
      });

      const response = await fetch(`${endpoint}?${params}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: PaginationData = await response.json();

      // Handle different data property names (data, equipments, softwares, maintenances, contacts, assignments, contracts, etc.)
      let dataArray: any[] = [];
      if (Array.isArray(result.data)) {
        dataArray = result.data;
      } else if (Array.isArray(result.equipments)) {
        dataArray = result.equipments;
      } else if (Array.isArray(result.softwares)) {
        dataArray = result.softwares;
      } else if (Array.isArray(result.maintenances)) {
        dataArray = result.maintenances;
      } else if (Array.isArray(result.contacts)) {
        dataArray = result.contacts;
      } else if (Array.isArray(result.assignments)) {
        dataArray = result.assignments;
      } else if (Array.isArray(result.contracts)) {
        dataArray = result.contracts;
      } else if (Array.isArray(result.documents)) {
        dataArray = result.documents;
      } else {
        // Fallback: find first array property
        const key = Object.keys(result).find(key => Array.isArray(result[key]) && key !== 'pagination');
        if (key && Array.isArray(result[key])) {
          dataArray = result[key];
        }
      }
      setData(dataArray);
      setPagination(prev => result.pagination || prev);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [endpoint, pagination.page, pagination.limit, filters]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateFilters = useCallback((newFilters: Record<string, string>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page when filters change
  }, []);

  const updatePagination = useCallback((newPagination: Partial<typeof pagination>) => {
    setPagination(prev => ({ ...prev, ...newPagination }));
  }, []);

  const goToPage = useCallback((page: number) => {
    setPagination(prev => {
      if (page >= 1 && page <= prev.totalPages) {
        return { ...prev, page };
      }
      return prev;
    });
  }, []);

  const changePageSize = useCallback((limit: number) => {
    setPagination(prev => ({ ...prev, limit, page: 1 }));
  }, []);

  return {
    data,
    pagination,
    loading,
    error,
    filters,
    updateFilters,
    updatePagination,
    goToPage,
    changePageSize,
    refetch: fetchData,
  };
};
