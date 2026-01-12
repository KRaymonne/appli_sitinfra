import React, { useState, useEffect } from 'react';

interface VehicleAuthorizationFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  isEdit?: boolean;
  vehicles?: any[];
}

const VehicleAuthorizationForm: React.FC<VehicleAuthorizationFormProps> = ({ 
  onSubmit, 
  initialData, 
  isEdit = false,
  vehicles = []
}) => {
  const [formData, setFormData] = useState({
    vehicleId: '',
    authorizationNumber: '',
    issueDate: '',
    expiryDate: '',
    issuingAuthority: '',
    autorisationtype: 'CIRCULER',
    purpose: '',
    status: 'ACTIVE',
  });

  useEffect(() => {
    if (initialData) {
      // Handle both regular vehicles and state vehicles
      let vehicleId = '';
      if (initialData.vehicleId) {
        if (initialData.vehicleType === 'state') {
          vehicleId = `state-${initialData.vehicleId}`;
        } else {
          vehicleId = `reg-${initialData.vehicleId}`;
        }
      }
      
      setFormData({
        vehicleId: vehicleId,
        authorizationNumber: initialData.authorizationNumber || '',
        issueDate: initialData.issueDate ? new Date(initialData.issueDate).toISOString().split('T')[0] : '',
        expiryDate: initialData.expiryDate ? new Date(initialData.expiryDate).toISOString().split('T')[0] : '',
        issuingAuthority: initialData.issuingAuthority || '',
        autorisationtype: initialData.autorisationtype || 'CIRCULER',
        purpose: initialData.purpose || '',
        status: initialData.status || 'ACTIVE',
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Extract the actual ID and type from the combined vehicle ID
    let vehicleId = formData.vehicleId;
    let vehicleType = 'regular';
    
    if (formData.vehicleId.startsWith('state-')) {
      vehicleId = formData.vehicleId.replace('state-', '');
      vehicleType = 'state';
    } else if (formData.vehicleId.startsWith('reg-')) {
      vehicleId = formData.vehicleId.replace('reg-', '');
    }
    
    onSubmit({
      ...formData,
      vehicleId: parseInt(vehicleId),
      vehicleType: vehicleType,
    });
  };

  // Create vehicle options combining regular and state vehicles
  const getVehicleOptions = () => {
    return vehicles.map((vehicle: any) => {
      // Check if it's a state vehicle or regular vehicle based on the presence of stateVehicleId
      if (vehicle.stateVehicleId !== undefined) {
        return {
          value: `state-${vehicle.stateVehicleId}`,
          label: `${vehicle.licensePlate} - ${vehicle.brand} ${vehicle.model} (État)`
        };
      } else {
        return {
          value: `reg-${vehicle.vehicleId}`,
          label: `${vehicle.licensePlate} - ${vehicle.brand} ${vehicle.model}`
        };
      }
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Véhicule <span className="text-red-500">*</span>
            </label>
            <select
              name="vehicleId"
              value={formData.vehicleId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner un véhicule</option>
              {getVehicleOptions().map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numéro d'autorisation <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="authorizationNumber"
              value={formData.authorizationNumber}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date d'émission <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="issueDate"
              value={formData.issueDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date d'expiration <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="expiryDate"
              value={formData.expiryDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Autorité émettrice <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="issuingAuthority"
              value={formData.issuingAuthority}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type d'autorisation <span className="text-red-500">*</span>
            </label>
            <select
              name="autorisationtype"
              value={formData.autorisationtype}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="CIRCULER">Circuler</option>
              <option value="NON_CIRCULABLE">Non circulable</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ACTIVE">Actif</option>
              <option value="EXPIRED">Expiré</option>
              <option value="REVOKED">Révoqué</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Objectif <span className="text-red-500">*</span>
            </label>
            <textarea
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            {isEdit ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VehicleAuthorizationForm;