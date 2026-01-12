import { useState, useEffect } from 'react';

export const useBusinessSelection = () => {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBusinesses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/.netlify/functions/Business-businesses');
      if (response.ok) {
        const data = await response.json();
        setBusinesses(data.businesses || []);
      } else {
        setError('Failed to fetch businesses');
        setBusinesses([]);
      }
    } catch (err) {
      console.error('Error fetching businesses:', err);
      setError('Error fetching businesses');
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  return {
    businesses,
    loading,
    error,
    refetch: fetchBusinesses,
  };
};

