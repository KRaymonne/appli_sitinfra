import React, { useState, useEffect } from 'react';
import { FileUpload } from '../../components/Personnel/FileUpload';

interface PaymentCardFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  isEdit?: boolean;
}

const PaymentCardForm: React.FC<PaymentCardFormProps> = ({ onSubmit, initialData, isEdit = false }) => {
  const [formData, setFormData] = useState({
    dateAchat: '',
    typeBadge: 'TOTAL',
    typeBadgeLibre: '',
    numBadge: '',
    description: '',
    montant: '',
    dateMiseEnService: '',
    fichierJoint: '',
    devise: 'XAF' // Added devise field with default value
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        dateAchat: initialData.dateAchat ? new Date(initialData.dateAchat).toISOString().split('T')[0] : '',
        typeBadge: initialData.typeBadge || 'TOTAL',
        typeBadgeLibre: initialData.typeBadgeLibre || '',
        numBadge: initialData.numBadge || '',
        description: initialData.description || '',
        montant: initialData.montant?.toString() || '',
        dateMiseEnService: initialData.dateMiseEnService ? new Date(initialData.dateMiseEnService).toISOString().split('T')[0] : '',
        fichierJoint: initialData.fichierJoint || '',
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
    onSubmit({
      ...formData,
      montant: parseFloat(formData.montant) || 0
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date d'achat <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="dateAchat"
              value={formData.dateAchat}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de badge <span className="text-red-500">*</span>
            </label>
            <select
              name="typeBadge"
              value={formData.typeBadge}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="TOTAL">Total</option>
              <option value="SHELL">Shell</option>
              <option value="OTHER">Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de badge libre
            </label>
            <input
              type="text"
              name="typeBadgeLibre"
              value={formData.typeBadgeLibre}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numéro de badge <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="numBadge"
              value={formData.numBadge}
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
              name="montant"
              value={formData.montant}
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
              Date de mise en service <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="dateMiseEnService"
              value={formData.dateMiseEnService}
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

export default PaymentCardForm;