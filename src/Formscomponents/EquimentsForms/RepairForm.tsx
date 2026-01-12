import React, { useState, useEffect } from 'react';

interface RepairFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  isEdit?: boolean;
  equipments?: any[];
}

const RepairForm: React.FC<RepairFormProps> = ({ 
  onSubmit, 
  initialData, 
  isEdit = false,
  equipments = []
}) => {
  const [formData, setFormData] = useState({
    equipmentId: '',
    repairDate: '',
    repairType: 'MECHANICAL',
    description: '',
    amount: '',
    supplier: '',
    technician: '',
    partsReplaced: '',
    warrantyPeriod: '',
    devise: 'XAF',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        equipmentId: initialData.equipmentId?.toString() || '',
        repairDate: initialData.repairDate ? new Date(initialData.repairDate).toISOString().split('T')[0] : '',
        repairType: initialData.repairType || 'MECHANICAL',
        description: initialData.description || '',
        amount: initialData.amount?.toString() || '',
        supplier: initialData.supplier || '',
        technician: initialData.technician || '',
        partsReplaced: initialData.partsReplaced || '',
        warrantyPeriod: initialData.warrantyPeriod?.toString() || '',
        devise: initialData.devise || 'XAF',
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
    onSubmit({
      ...formData,
      equipmentId: parseInt(formData.equipmentId),
      amount: parseFloat(formData.amount),
      warrantyPeriod: formData.warrantyPeriod ? parseInt(formData.warrantyPeriod) : null,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Équipement <span className="text-red-500">*</span>
            </label>
            <select
              name="equipmentId"
              value={formData.equipmentId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner un équipement</option>
              {equipments.map((equipment) => (
                <option key={equipment.equipmentId} value={equipment.equipmentId}>
                  {equipment.name} - {equipment.referenceCode}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de réparation <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="repairDate"
              value={formData.repairDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de réparation <span className="text-red-500">*</span>
            </label>
            <select
              name="repairType"
              value={formData.repairType}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="MECHANICAL">Mécanique</option>
              <option value="ELECTRONIC">Électronique</option>
              <option value="SOFTWARE">Logiciel</option>
              <option value="BODYWORK">Carrosserie</option>
              <option value="OTHER">Autre</option>
            </select>
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
              Fournisseur <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Technicien
            </label>
            <input
              type="text"
              name="technician"
              value={formData.technician}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pièces remplacées
            </label>
            <input
              type="text"
              name="partsReplaced"
              value={formData.partsReplaced}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Période de garantie (jours)
            </label>
            <input
              type="number"
              name="warrantyPeriod"
              value={formData.warrantyPeriod}
              onChange={handleChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
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

export default RepairForm;

