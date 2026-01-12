import { useState, useEffect } from 'react';

interface Vehicle {
  vehicleId: number;
  licensePlate: string;
  brand: string;
  model: string;
  type: string;
  status: string;
}

export const useVehicleSelection = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/.netlify/functions/vehicle-vehicles?limit=1000');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Échec du chargement des véhicules');
      }
      const data = await res.json();
      setVehicles(data.vehicles || []);
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const getVehicleOptions = () => {
    return vehicles.map((vehicle) => ({
      value: vehicle.vehicleId,
      label: `${vehicle.licensePlate} - ${vehicle.brand} ${vehicle.model}`,
      vehicle,
    }));
  };

  const getVehicleById = (vehicleId: number) => {
    return vehicles.find(vehicle => vehicle.vehicleId === vehicleId);
  };

  const getAvailableVehicles = () => {
    return vehicles.filter(vehicle => vehicle.status === 'AVAILABLE');
  };

  return {
    vehicles,
    loading,
    error,
    getVehicleOptions,
    getVehicleById,
    getAvailableVehicles,
    refetch: loadVehicles,
  };
};
