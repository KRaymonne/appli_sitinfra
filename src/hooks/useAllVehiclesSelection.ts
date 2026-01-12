import { useState, useEffect } from 'react';
import { useVehicleSelection } from './useVehicleSelection';
import { useStateVehicleSelection } from './useStateVehicleSelection';

interface Vehicle {
  vehicleId: number;
  licensePlate: string;
  brand: string;
  model: string;
  type: string;
  status: string;
}

interface StateVehicle {
  stateVehicleId: number;
  licensePlate: string;
  brand: string;
  model: string;
  status: string;
}

export const useAllVehiclesSelection = () => {
  const { vehicles, loading: vehiclesLoading, error: vehiclesError, refetch: refetchVehicles } = useVehicleSelection();
  const { stateVehicles, loading: stateVehiclesLoading, error: stateVehiclesError, refetch: refetchStateVehicles } = useStateVehicleSelection();
  
  const [allVehicles, setAllVehicles] = useState<(Vehicle | StateVehicle)[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Combine both vehicle lists
    if (!vehiclesLoading && !stateVehiclesLoading) {
      setLoading(false);
      setAllVehicles([...vehicles, ...stateVehicles]);
      
      // Set error if either has an error
      if (vehiclesError || stateVehiclesError) {
        setError(vehiclesError || stateVehiclesError);
      }
    } else {
      setLoading(true);
    }
  }, [vehicles, stateVehicles, vehiclesLoading, stateVehiclesLoading, vehiclesError, stateVehiclesError]);

  const getAllVehicleOptions = () => {
    const regularVehicles = vehicles.map((vehicle: Vehicle) => ({
      value: `reg-${vehicle.vehicleId}`,
      label: `${vehicle.licensePlate} - ${vehicle.brand} ${vehicle.model}`,
      vehicle: { ...vehicle, type: 'regular' },
    }));
    
    const stateVehiclesOptions = stateVehicles.map((vehicle: StateVehicle) => ({
      value: `state-${vehicle.stateVehicleId}`,
      label: `${vehicle.licensePlate} - ${vehicle.brand} ${vehicle.model} (État)`,
      vehicle: { ...vehicle, type: 'state' },
    }));
    
    return [...regularVehicles, ...stateVehiclesOptions];
  };

  const getVehicleById = (id: string) => {
    if (id.startsWith('reg-')) {
      const vehicleId = parseInt(id.replace('reg-', ''));
      return vehicles.find(vehicle => vehicle.vehicleId === vehicleId);
    } else if (id.startsWith('state-')) {
      const stateVehicleId = parseInt(id.replace('state-', ''));
      return stateVehicles.find(vehicle => vehicle.stateVehicleId === stateVehicleId);
    }
    return null;
  };

  const refetchAll = async () => {
    await Promise.all([
      refetchVehicles(),
      refetchStateVehicles()
    ]);
  };

  return {
    allVehicles,
    regularVehicles: vehicles,
    stateVehicles,
    loading,
    error,
    getAllVehicleOptions,
    getVehicleById,
    refetch: refetchAll,
  };
};