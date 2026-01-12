import React, { useState, useEffect } from 'react';
import { FileUpload } from '../../components/Personnel/FileUpload';

interface FuelManagementFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  isEdit?: boolean;
  vehicles?: any[];
}

const FuelManagementForm: React.FC<FuelManagementFormProps> = ({ 
  onSubmit, 
  initialData, 
  isEdit = false,
  vehicles = []
}) => {
  const [formData, setFormData] = useState({
    vehicleId: '',
    date: '',
    typePaiement: 'CARD',
    distance: '',
    quantity: '',
    amount: '',
    prixLitre: '',
    station: '',
    fichierJoint: '',
    devise: 'XAF' // Added devise field with default value
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
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : '',
        typePaiement: initialData.typePaiement || 'CARD',
        distance: initialData.distance?.toString() || '',
        quantity: initialData.quantity?.toString() || '',
        amount: initialData.amount?.toString() || '',
        prixLitre: initialData.prixLitre?.toString() || '',
        station: initialData.station || '',
        fichierJoint: initialData.fichierJoint || '',
        devise: initialData.devise || 'XAF' // Added devise field
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      amount: parseFloat(formData.amount) || 0,
      prixLitre: parseFloat(formData.prixLitre) || 0,
      quantity: parseFloat(formData.quantity) || 0,
      distance: parseFloat(formData.distance) || 0
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
              Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de paiement <span className="text-red-500">*</span>
            </label>
            <select
              name="typePaiement"
              value={formData.typePaiement}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="CARD">Carte</option>
              <option value="CASH">Espèces</option>
              <option value="TRANSFER">Virement</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Distance (km)
            </label>
            <input
              type="number"
              name="distance"
              value={formData.distance}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantité (L) <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montant <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Currency Select */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Devise <span className="text-red-500">*</span>
            </label>
            <select
              name="devise"
              value={formData.devise}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="XAF">Franc CFA BEAC (XAF)</option>
              <option value="XOF">Franc CFA UEMOA (XOF)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="GNF">Franc Guinéen (GNF)</option>
              <option value="GHS">Cedi Ghanéen (GHS)</option>
              <option value="RON">Leu Roumain (RON)</option>
              <option value="SLE">Leone (SLE)</option>
              <option value="USD">Dollar Américain (USD)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prix par litre <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="prixLitre"
              value={formData.prixLitre}
              onChange={handleChange}
              required
              min="0"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Station <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="station"
              value={formData.station}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* File Upload Component */}
          <div className="md:col-span-2">
            <FileUpload
              label="Fichier joint"
              value={formData.fichierJoint}
              onChange={(url) => setFormData(prev => ({ ...prev, fichierJoint: url || '' }))}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              useSupabase={false}
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

export default FuelManagementForm;