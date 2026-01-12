import React, { useState, useEffect } from 'react';
import { FileUpload } from '../../components/Personnel/FileUpload';

interface TransactionFormProps {
  onSubmit: (data: any) => void;
  initialData?: any; 
  isEdit?: boolean;
  registers?: any[];
  onCancel?: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ onSubmit, initialData, isEdit = false, registers = [], onCancel }) => {
  const [formData, setFormData] = useState({
    registerId: '',
    transactionType: 'INCOME',
    amount: '',
    description: '',
    expenseType: '',
    referenceNumber: '',
    receiptNumber: '',
    transactionDate: new Date().toISOString().split('T')[0],
    serviceProvider: '',
    supplyType: '',
    attachment: '',
    devise: 'XAF',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        registerId: initialData.registerId?.toString() || '',
        transactionType: initialData.transactionType || 'INCOME',
        amount: initialData.amount?.toString() || '',
        description: initialData.description || '',
        expenseType: initialData.expenseType || '',
        referenceNumber: initialData.referenceNumber || '',
        receiptNumber: initialData.receiptNumber || '',
        transactionDate: initialData.transactionDate ? new Date(initialData.transactionDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        serviceProvider: initialData.serviceProvider || '',
        supplyType: initialData.supplyType || '',
        attachment: initialData.attachment || '',
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
    const submitData = {
      ...formData,
      registerId: parseInt(formData.registerId),
      amount: parseFloat(formData.amount),
      transactionDate: new Date(formData.transactionDate).toISOString(),
      expenseType: formData.expenseType || null,
      referenceNumber: formData.referenceNumber || null,
      receiptNumber: formData.receiptNumber || null,
      serviceProvider: formData.serviceProvider || null,
      supplyType: formData.supplyType || null,
      attachment: formData.attachment || null,
      description: formData.description || null,
    };
    onSubmit(submitData);
  };

  const isExpense = formData.transactionType === 'EXPENSE';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Caisse <span className="text-red-500">*</span>
            </label>
            <select
              name="registerId"
              value={formData.registerId}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner une caisse</option>
              {registers.map((register) => (
                <option key={register.registerId} value={register.registerId}>
                  {register.registerName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de transaction <span className="text-red-500">*</span>
            </label>
            <select
              name="transactionType"
              value={formData.transactionType}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="INCOME">Revenu</option>
              <option value="EXPENSE">Dépense</option>
              <option value="TRANSFER_OUT">Transfert sortant</option>
              <option value="TRANSFER_IN">Transfert entrant</option>
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
              step="0.01"
              min="0"
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
              Date de transaction <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="transactionDate"
              value={formData.transactionDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {isExpense && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie de dépense
              </label>
              <select
                name="expenseType"
                value={formData.expenseType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sélectionner une catégorie</option>
                <option value="MTN_PHONE">MTN Téléphone</option>
                <option value="CUSTOMS">Douanes</option>
                <option value="TRANSPORT">Transport</option>
                <option value="TENDER_DOCUMENTS">Documents d'appel d'offres</option>
                <option value="ADVERTISING">Publicité</option>
                <option value="INSURANCE">Assurance</option>
                <option value="MISCELLANEOUS">Divers</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numéro de référence
            </label>
            <input
              type="text"
              name="referenceNumber"
              value={formData.referenceNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numéro de reçu
            </label>
            <input
              type="text"
              name="receiptNumber"
              value={formData.receiptNumber}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fournisseur de service
            </label>
            <input
              type="text"
              name="serviceProvider"
              value={formData.serviceProvider}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type d'approvisionnement
            </label>
            <select
              name="supplyType"
              value={formData.supplyType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner un type</option>
              <option value="MAINTENANCE_PRODUCTS">Produits d'entretien</option>
              <option value="WATER">Eau</option>
              <option value="ELECTRICITY">Électricité</option>
              <option value="FUEL">Carburant</option>
              <option value="SMALL_EQUIPMENT">Petit équipement</option>
              <option value="NONE">Aucun</option>
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

          <div className="md:col-span-2">
            <FileUpload
              label="Pièce jointe"
              value={formData.attachment}
              onChange={(url) => setFormData(prev => ({ ...prev, attachment: url || '' }))}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              useSupabase={false}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
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

export default TransactionForm;

