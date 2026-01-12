import { useState, useEffect } from 'react';

export const useRegisterSelection = () => {
  const [registers, setRegisters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRegisters = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/.netlify/functions/register-registers');
      if (response.ok) {
        const data = await response.json();
        setRegisters(data.registers || []);
      } else {
        setError('Failed to fetch registers');
        setRegisters([]);
      }
    } catch (err) {
      console.error('Error fetching registers:', err);
      setError('Error fetching registers');
      setRegisters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegisters();
  }, []);

  return {
    registers,
    loading,
    error,
    refetch: fetchRegisters,
  };
};

