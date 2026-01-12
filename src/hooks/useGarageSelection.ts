import { useState, useEffect } from 'react';

interface Garage {
  garageId: number;
  name: string;
  address: string;
  phoneNumber: string;
  manager: string;
  type: string;
}

export const useGarageSelection = () => {
  const [garages, setGarages] = useState<Garage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGarages = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/.netlify/functions/vehicle-garages?limit=1000');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Échec du chargement des garages');
      }
      const data = await res.json();
      setGarages(data.garages || []);
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGarages();
  }, []);

  const getGarageOptions = () => {
    return garages.map((garage) => ({
      value: garage.garageId,
      label: `${garage.name} - ${garage.address}`,
      garage,
    }));
  };

  const getGarageById = (garageId: number) => {
    return garages.find(garage => garage.garageId === garageId);
  };

  return {
    garages,
    loading,
    error,
    getGarageOptions,
    getGarageById,
    refetch: loadGarages,
  };
};
