import React, { useState, useEffect } from 'react';
import { FileUpload } from '../../components/Personnel/FileUpload';

interface VehicleReformFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  isEdit?: boolean;
  vehicles?: any[];
}

const VehicleReformForm: React.FC<VehicleReformFormProps> = ({ 
  onSubmit, 
  initialData, 
  isEdit = false,
  vehicles = []
}) => {
  const [formData, setFormData] = useState({
    vehicleId: '',
    reformDate: '',
    reformReason: '',
    salePrice: '',
    buyer: '',
    buyerNumber: '',
    buyerAddress: '',
    disposalMethod: 'SALE',
    reformReport: '',
    reformCertificate: '',
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
        reformDate: initialData.reformDate ? new Date(initialData.reformDate).toISOString().split('T')[0] : '',
        reformReason: initialData.reformReason || '',
        salePrice: initialData.salePrice?.toString() || '',
        buyer: initialData.buyer || '',
        buyerNumber: initialData.buyerNumber || '',
        buyerAddress: initialData.buyerAddress || '',
        disposalMethod: initialData.disposalMethod || 'SALE',
        reformReport: initialData.reformReport || '',
        reformCertificate: initialData.reformCertificate || '',
        devise: initialData.devise || 'XAF' // Added devise field
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
      salePrice: parseFloat(formData.salePrice) || 0
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
              Date de réforme <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="reformDate"
              value={formData.reformDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Méthode de disposition <span className="text-red-500">*</span>
            </label>
            <select
              name="disposalMethod"
              value={formData.disposalMethod}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="SALE">Vente</option>
              <option value="DESTRUCTION">Destruction</option>
              <option value="DONATION">Don</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prix de vente
            </label>
            <input
              type="number"
              name="salePrice"
              value={formData.salePrice}
              onChange={handleChange}
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
              Acheteur
            </label>
            <input
              type="text"
              name="buyer"
              value={formData.buyer}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numéro de l'acheteur
            </label>
            <input
              type="text"
              name="buyerNumber"
              value={formData.buyerNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Adresse de l'acheteur
            </label>
            <textarea
              name="buyerAddress"
              value={formData.buyerAddress}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <FileUpload
              label="Rapport de réforme"
              value={formData.reformReport}
              onChange={(url) => setFormData(prev => ({ ...prev, reformReport: url || '' }))}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              useSupabase={false}
            />
          </div>

          <div>
            <FileUpload
              label="Certificat de réforme"
              value={formData.reformCertificate}
              onChange={(url) => setFormData(prev => ({ ...prev, reformCertificate: url || '' }))}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              useSupabase={false}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Raison de la réforme <span className="text-red-500">*</span>
            </label>
            <textarea
              name="reformReason"
              value={formData.reformReason}
              onChange={handleChange}
              required
              rows={4}
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

export default VehicleReformForm;