import { useState, useEffect } from 'react';

interface StateVehicle {
  stateVehicleId: number;
  licensePlate: string;
  brand: string;
  model: string;
  status: string;
}

export const useStateVehicleSelection = () => {
  const [stateVehicles, setStateVehicles] = useState<StateVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStateVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/.netlify/functions/vehicle-statevehicles?limit=1000');
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Échec du chargement des véhicules d\'État');
      }
      const data = await res.json();
      setStateVehicles(data.stateVehicles || []);
    } catch (err: any) {
      setError(err.message || 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStateVehicles();
  }, []);

  const getStateVehicleOptions = () => {
    return stateVehicles.map((vehicle) => ({
      value: vehicle.stateVehicleId,
      label: `${vehicle.licensePlate} - ${vehicle.brand} ${vehicle.model} (État)`,
      vehicle,
    }));
  };

  const getStateVehicleById = (stateVehicleId: number) => {
    return stateVehicles.find(vehicle => vehicle.stateVehicleId === stateVehicleId);
  };

  const getAvailableStateVehicles = () => {
    return stateVehicles.filter(vehicle => vehicle.status === 'AVAILABLE');
  };

  return {
    stateVehicles,
    loading,
    error,
    getStateVehicleOptions,
    getStateVehicleById,
    getAvailableStateVehicles,
    refetch: loadStateVehicles,
  };
};