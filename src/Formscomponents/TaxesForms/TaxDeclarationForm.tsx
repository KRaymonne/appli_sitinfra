import React, { useState, useEffect } from 'react';
import { Button } from '../../components/Common/Button';

interface TaxDeclarationFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  isEdit?: boolean;
}

export const TaxDeclarationForm: React.FC<TaxDeclarationFormProps> = ({
  onSubmit,
  initialData,
  isEdit = false
}) => {
  const [formData, setFormData] = useState({
    taxType: 'VAT',
    taxAmount: '',
    penalties: '',
    declarationDate: '',
    paymentDate: '',
    status: 'TO_PAY',
    referenceNumber: '',
    notes: '',
    devise: 'XAF' // Added devise field with default value
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        taxType: initialData.taxType || 'VAT',
        taxAmount: initialData.taxAmount?.toString() || '',
        penalties: initialData.penalties?.toString() || '',
        declarationDate: initialData.declarationDate ? new Date(initialData.declarationDate).toISOString().split('T')[0] : '',
        paymentDate: initialData.paymentDate ? new Date(initialData.paymentDate).toISOString().split('T')[0] : '',
        status: initialData.status || 'TO_PAY',
        referenceNumber: initialData.referenceNumber || '',
        notes: initialData.notes || '',
        devise: initialData.devise || 'XAF' // Added devise field
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData: any = {
      taxType: formData.taxType,
      taxAmount: parseFloat(formData.taxAmount),
      penalties: formData.penalties ? parseFloat(formData.penalties) : 0,
      declarationDate: new Date(formData.declarationDate).toISOString(),
      paymentDate: formData.paymentDate ? new Date(formData.paymentDate).toISOString() : null,
      status: formData.status,
      referenceNumber: formData.referenceNumber,
      notes: formData.notes || null,
      devise: formData.devise // Added devise field
    };

    onSubmit(submitData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tax Type (Enum) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de taxe <span className="text-red-500">*</span>
          </label>
          <select
            name="taxType"
            value={formData.taxType}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="VAT">TVA</option>
            <option value="INCOME_TAX">Impôt sur le revenu</option>
            <option value="CORPORATE_TAX">Impôt sur les sociétés</option>
            <option value="SOCIAL_CONTRIBUTIONS">Cotisations sociales</option>
            <option value="OTHER_TAX">Autre taxe</option>
          </select>
        </div>

        {/* Status (Enum) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Statut <span className="text-red-500">*</span>
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="TO_PAY">À payer</option>
            <option value="PAID">Payé</option>
            <option value="OVERDUE">En retard</option>
          </select>
        </div>

        {/* Tax Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Montant de la taxe <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            name="taxAmount"
            value={formData.taxAmount}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: 500000"
          />
        </div>

        {/* Penalties */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pénalités
          </label>
          <input
            type="number"
            step="0.01"
            name="penalties"
            value={formData.penalties}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: 50000"
          />
        </div>

        {/* Declaration Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date de déclaration <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="declarationDate"
            value={formData.declarationDate}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Payment Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date de paiement
          </label>
          <input
            type="date"
            name="paymentDate"
            value={formData.paymentDate}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Devise Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Devise <span className="text-red-500">*</span>
          </label>
          <select
            name="devise"
            value={formData.devise}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

        {/* Reference Number */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Numéro de référence <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="referenceNumber"
            value={formData.referenceNumber}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: REF-2024-001"
          />
        </div>

        {/* Notes */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Informations complémentaires..."
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t">
        <Button type="submit" variant="primary">
          {isEdit ? 'Mettre à jour' : 'Créer'} la déclaration
        </Button>
      </div>
    </form>
  );
};