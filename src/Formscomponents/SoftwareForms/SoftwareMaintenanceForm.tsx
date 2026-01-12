import React, { useEffect, useState } from 'react';

interface SoftwareOption {
  softwareId: number;
  name: string;
  version?: string;
}

interface SoftwareMaintenanceFormProps {
  onSubmit: (data: any) => void;
  softwares?: SoftwareOption[];
  initialData?: any;
  isEdit?: boolean;
}

const DEFAULT_FORM = {
  softwareId: '',
  provider: '',
  startDate: '',
  endDate: '',
  price: '',
  currency: 'XAF',
  periodicity: 'ANNUAL',
  maintenanceType: 'SUPPORT',
  observations: '',
};

const SoftwareMaintenanceForm: React.FC<SoftwareMaintenanceFormProps> = ({
  onSubmit,
  softwares = [],
  initialData,
  isEdit = false,
}) => {
  const [formData, setFormData] = useState(DEFAULT_FORM);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        softwareId: initialData.softwareId?.toString() || '',
        provider: initialData.provider || '',
        startDate: initialData.startDate ? initialData.startDate.split('T')[0] : '',
        endDate: initialData.endDate ? initialData.endDate.split('T')[0] : '',
        price: initialData.price?.toString() || '',
        currency: initialData.currency || 'XAF',
        periodicity: initialData.periodicity || 'ANNUAL',
        maintenanceType: initialData.maintenanceType || 'SUPPORT',
        observations: initialData.observations || '',
      });
    } else {
      setFormData(DEFAULT_FORM);
    }
  }, [initialData]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      softwareId: Number(formData.softwareId),
      price: parseFloat(formData.price) || 0,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : '',
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : '',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logiciel <span className="text-red-500">*</span>
            </label>
            <select
              name="softwareId"
              value={formData.softwareId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Sélectionner un logiciel</option>
              {softwares.map((software) => (
                <option key={software.softwareId} value={software.softwareId}>
                  {software.name} {software.version ? `(${software.version})` : ''}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fournisseur maintenance <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="provider"
              value={formData.provider}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Prix</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Devise</label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {['XAF', 'XOF', 'EUR', 'USD', 'GHS', 'GNF', 'RON', 'SLE'].map((currency) => (
                <option key={currency} value={currency}>
                  {currency}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Périodicité</label>
            <select
              name="periodicity"
              value={formData.periodicity}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="MONTHLY">Mensuelle</option>
              <option value="QUARTERLY">Trimestrielle</option>
              <option value="ANNUAL">Annuelle</option>
              <option value="ONE_TIME">Unique</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              name="maintenanceType"
              value={formData.maintenanceType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="SUPPORT">Support</option>
              <option value="CORRECTIVE">Corrective</option>
              <option value="EVOLUTIVE">Évolutive</option>
              <option value="PREVENTIVE">Préventive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observations</label>
            <textarea
              name="observations"
              value={formData.observations}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            {isEdit ? 'Mettre à jour' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SoftwareMaintenanceForm;

