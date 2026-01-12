import { useState, useEffect } from 'react';

export const useEquipmentSelection = () => {
  const [equipments, setEquipments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEquipments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/.netlify/functions/equipment-equipment');
      if (response.ok) {
        const data = await response.json();
        setEquipments(data.data || data.equipments || []);
      } else {
        setError('Failed to fetch equipments');
        setEquipments([]);
      }
    } catch (err) {
      console.error('Error fetching equipments:', err);
      setError('Error fetching equipments');
      setEquipments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipments();
  }, []);

  return {
    equipments,
    loading,
    error,
    refetch: fetchEquipments,
  };
};

