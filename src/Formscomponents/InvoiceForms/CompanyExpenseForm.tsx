import React, { useState, useEffect } from 'react';
import { FileUpload } from '../../components/Personnel/FileUpload';

interface CompanyExpenseFormProps {
  onSubmit: (data: any) => void;
  onCancel?: () => void;
  initialData?: any;
  isEdit?: boolean;
  users?: any[];
}

const CompanyExpenseForm: React.FC<CompanyExpenseFormProps> = ({ onSubmit, onCancel, initialData, isEdit = false, users: propsUsers = [] }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [formData, setFormData] = useState({
    chargeType: 'APPOINTEMENTS_SALAIRES_ET_COMMISSIONS',
    userId: '', // This should be a string now
    amount: '',
    devise: 'XAF', // Changed from currency to devise
    paymentDate: '',
    description: '',
    status: 'PENDING',
    service: '',
    attachment: '',
  });

  // Fetch users for the dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const response = await fetch('/.netlify/functions/personnel-users');
        if (response.ok) {
          const data = await response.json();
          setUsers(Array.isArray(data) ? data : data.users || []);
        } else {
          // Fallback to props users if fetch fails
          setUsers(propsUsers);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
        // Fallback to props users if fetch fails
        setUsers(propsUsers);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, [propsUsers]);

  useEffect(() => {
    if (initialData) {
      setFormData({
        chargeType: initialData.chargeType || 'APPOINTEMENTS_SALAIRES_ET_COMMISSIONS',
        userId: initialData.userId || '', // Keep as string
        amount: initialData.amount?.toString() || '',
        devise: initialData.devise || 'XAF', // Changed from currency to devise
        paymentDate: initialData.paymentDate ? new Date(initialData.paymentDate).toISOString().split('T')[0] : '',
        description: initialData.description || '',
        status: initialData.status || 'PENDING',
        service: initialData.service || '',
        attachment: initialData.attachment || '',
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
      paymentDate: formData.paymentDate ? new Date(formData.paymentDate).toISOString() : null,
      userId: formData.userId ? parseInt(formData.userId) : null, // Convert string to number for database
    };
    onSubmit(submitData);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de Charge <span className="text-red-500">*</span>
            </label>
            <select
              name="chargeType"
              value={formData.chargeType}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="APPOINTEMENTS_SALAIRES_ET_COMMISSIONS">Appointements salaires et commissions</option>
              <option value="CHARGES_SOCIALES_SUR_REMUNERATION_PERSONNEL_NATIONAL">Charges sociales sur rémunération</option>
              <option value="PERSONNEL_DETACHE_OU_PRETE_A_L_ENTREPRISE_MANUTENTION">Personnel détaché ou prêté</option>
              <option value="PRESTATAIRE">Prestataire</option>
              <option value="OTHER_CHARGE">Autre charge</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Employé Concerné
            </label>
            <select
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              disabled={loadingUsers}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">
                {loadingUsers ? 'Chargement des employés...' : 'Sélectionner un employé'}
              </option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} ({user.employeeNumber})
                </option>
              ))}
            </select>
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
              Date de Paiement <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="paymentDate"
              value={formData.paymentDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              Service
            </label>
            <input
              type="text"
              name="service"
              value={formData.service}
              onChange={handleChange}
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

export default CompanyExpenseForm;

