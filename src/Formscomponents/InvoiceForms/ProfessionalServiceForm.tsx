import React, { useState, useEffect } from 'react';

interface ProfessionalServiceFormProps {
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  initialData?: any;
  isEdit?: boolean;
}

const ProfessionalServiceForm: React.FC<ProfessionalServiceFormProps> = ({ onSubmit, onCancel, initialData, isEdit = false }) => {
  const [formData, setFormData] = useState({
    invoiceNumber: '',
    serviceType: 'ACCOUNTING_SOFTWARE_LICENSE_FEE',
    supplier: '',
    amount: '',
    devise: 'XAF', // Changed from currency to devise
    invoiceDate: '',
    paymentDate: '',
    description: '',
    paymentMethod: 'CASH',
    status: 'PENDING',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        invoiceNumber: initialData.invoiceNumber || '',
        serviceType: initialData.serviceType || 'ACCOUNTING_SOFTWARE_LICENSE_FEE',
        supplier: initialData.supplier || '',
        amount: initialData.amount?.toString() || '',
        devise: initialData.devise || 'XAF', // Changed from currency to devise
        invoiceDate: initialData.invoiceDate ? new Date(initialData.invoiceDate).toISOString().split('T')[0] : '',
        paymentDate: initialData.paymentDate ? new Date(initialData.paymentDate).toISOString().split('T')[0] : '',
        description: initialData.description || '',
        paymentMethod: initialData.paymentMethod || 'CASH',
        status: initialData.status || 'PENDING',
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
    const submitData = {
      ...formData,
      amount: parseFloat(formData.amount) || 0,
      invoiceDate: formData.invoiceDate ? new Date(formData.invoiceDate).toISOString() : null,
      paymentDate: formData.paymentDate ? new Date(formData.paymentDate).toISOString() : null,
    };
    onSubmit(submitData);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numéro de Facture <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de Service <span className="text-red-500">*</span>
            </label>
            <select
              name="serviceType"
              value={formData.serviceType}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ACCOUNTING_SOFTWARE_LICENSE_FEE">Redevance logiciel comptable</option>
              <option value="PROFESSIONAL_FEES">Honoraires professionnels</option>
              <option value="AIR_TICKET">Billet d'avion</option>
              <option value="BUILDING_RENTAL">Location de bâtiment</option>
              <option value="INTERNET">Internet</option>
              <option value="BUSINESS_TRIP_ASSIGNMENT">Mission</option>
              <option value="MAINTENANCE_REPAIR_MOVABLE_PROPERTY">Entretien et réparation biens mobiliers</option>
              <option value="RECEPTIONS_HOSPITALITY">Réceptions</option>
              <option value="OTHER_SERVICE">Autre service</option>
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
              Montant <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
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
              Date de Facture <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="invoiceDate"
              value={formData.invoiceDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de Paiement
            </label>
            <input
              type="date"
              name="paymentDate"
              value={formData.paymentDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Méthode de Paiement
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="CASH">Espèces</option>
              <option value="BANK_TRANSFER">Virement bancaire</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="PAID">Payé</option>
              <option value="PENDING">En attente</option>
              <option value="OVERDUE">En retard</option>
            </select>
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

        <div className="flex justify-end space-x-2 pt-4">
          {onCancel && (
            <button
              type="button"
              className="px-4 py-2 text-gray-600 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500"
              onClick={onCancel}
            >
              Annuler
            </button>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isEdit ? 'Mettre à jour' : 'Créer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfessionalServiceForm;