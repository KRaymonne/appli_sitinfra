import React, { useState, useEffect } from 'react';

interface VehicleFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  isEdit?: boolean;
}

const VehicleForm: React.FC<VehicleFormProps> = ({ onSubmit, initialData, isEdit = false }) => {
  const [formData, setFormData] = useState({
    licensePlate: '',
    brand: '',
    model: '',
    type: 'CAR',
    vehiclecountry: 'IVORY_COAST',
    year: '',
    mileage: '',
    civilRegistration: '',
    administrativeRegistration: '',
    acquisitionDate: '',
    usingEntity: '',
    holder: '',
    chassisNumber: '',
    status: 'AVAILABLE',
    assignedTo: '',
    fuelType: 'GASOLINE',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        licensePlate: initialData.licensePlate || '',
        brand: initialData.brand || '',
        model: initialData.model || '',
        type: initialData.type || 'CAR',
        vehiclecountry: initialData.vehiclecountry || 'IVORY_COAST',
        year: initialData.year?.toString() || '',
        mileage: initialData.mileage?.toString() || '',
        civilRegistration: initialData.civilRegistration || '',
        administrativeRegistration: initialData.administrativeRegistration || '',
        acquisitionDate: initialData.acquisitionDate ? new Date(initialData.acquisitionDate).toISOString().split('T')[0] : '',
        usingEntity: initialData.usingEntity || '',
        holder: initialData.holder || '',
        chassisNumber: initialData.chassisNumber || '',
        status: initialData.status || 'AVAILABLE',
        assignedTo: initialData.assignedTo || '',
        fuelType: initialData.fuelType || 'GASOLINE',
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
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plaque d'immatriculation <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="licensePlate"
              value={formData.licensePlate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marque <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Modèle <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de véhicule <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="CAR">Voiture</option>
              <option value="TRUCK">Camion</option>
              <option value="VAN">Fourgon</option>
              <option value="MOTORCYCLE">Moto</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pays du véhicule
            </label>
            <select
              name="vehiclecountry"
              value={formData.vehiclecountry}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="IVORY_COAST">Côte d'Ivoire</option>
              <option value="GHANA">Ghana</option>
              <option value="BENIN">Bénin</option>
              <option value="CAMEROON">Cameroun</option>
              <option value="TOGO">Togo</option>
              <option value="ROMANIE">Roumanie</option>
              <option value="ITALIE">Italie</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Année <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              required
              min="1900"
              max="2030"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kilométrage
            </label>
            <input
              type="number"
              name="mileage"
              value={formData.mileage}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de carburant <span className="text-red-500">*</span>
            </label>
            <select
              name="fuelType"
              value={formData.fuelType}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="GASOLINE">Essence</option>
              <option value="DIESEL">Diesel</option>
              <option value="ELECTRIC">Électrique</option>
              <option value="HYBRID">Hybride</option>
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
              <option value="AVAILABLE">Disponible</option>
              <option value="IN_USE">En utilisation</option>
              <option value="UNDER_MAINTENANCE">En maintenance</option>
              <option value="OUT_OF_SERVICE">Hors service</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numéro de châssis <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="chassisNumber"
              value={formData.chassisNumber}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date d'acquisition
            </label>
            <input
              type="date"
              name="acquisitionDate"
              value={formData.acquisitionDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entité utilisatrice
            </label>
            <input
              type="text"
              name="usingEntity"
              value={formData.usingEntity}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Titulaire
            </label>
            <input
              type="text"
              name="holder"
              value={formData.holder}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Immatriculation civile
            </label>
            <input
              type="text"
              name="civilRegistration"
              value={formData.civilRegistration}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Immatriculation administrative
            </label>
            <input
              type="text"
              name="administrativeRegistration"
              value={formData.administrativeRegistration}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigné à
            </label>
            <input
              type="text"
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
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

export default VehicleForm;
