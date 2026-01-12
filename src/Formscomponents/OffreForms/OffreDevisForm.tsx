import React, { useState, useEffect } from 'react';
import { FileUpload } from '../../components/Personnel/FileUpload';

interface Contact {
  contactId: number;
  firstName: string;
  lastName: string;
  company?: string;
}

interface OffreDevisFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  isEdit?: boolean;
}

const OffreDevisForm: React.FC<OffreDevisFormProps> = ({ onSubmit, initialData, isEdit = false }) => {
  const [formData, setFormData] = useState({
    indexNumber: '',
    clientname: '', // Changé de clientId à clientname selon le modèle Prisma
    amount: '',
    validityDate: '',
    status: 'APPLICATION',
    description: '',
    attachment: '',
    devise: 'XAF' // Changé de currency à devise selon le modèle Prisma
  });

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);

  // Fetch contacts for dropdown
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const response = await fetch('/.netlify/functions/Contact-contacts');
        if (response.ok) {
          const data = await response.json();
          setContacts(data.contacts || []);
        }
      } catch (error) {
        console.error('Error fetching contacts:', error);
      } finally {
        setLoadingContacts(false);
      }
    };
    fetchContacts();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        indexNumber: initialData.indexNumber || '',
        clientname: initialData.clientname || '',
        amount: initialData.amount?.toString() || '',
        validityDate: initialData.validityDate ? new Date(initialData.validityDate).toISOString().split('T')[0] : '',
        status: initialData.status || 'APPLICATION',
        description: initialData.description || '',
        attachment: initialData.attachment || '',
        devise: initialData.devise || 'XAF'
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
      amount: parseFloat(formData.amount),
    };
    onSubmit(submitData);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              N° Index <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="indexNumber"
              value={formData.indexNumber}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Client <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="clientname"
              value={formData.clientname}
              onChange={handleChange}
              required
              placeholder="Nom du client..."
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
              Date de validité <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="validityDate"
              value={formData.validityDate}
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
              <option value="APPLICATION">Candidature</option>
              <option value="UNDER_REVIEW">En Étude</option>
              <option value="PENDING">En Attente</option>
              <option value="SHORTLISTED">Retenu</option>
              <option value="BID_SUBMITTED">Soumission</option>
              <option value="NOT_PURSUED">Pas de suite</option>
            </select>
          </div>

          {/* Devise Select */}
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

          <div className="md:col-span-2">
            <FileUpload
              label="Pièce jointe"
              value={formData.attachment}
              onChange={(url: string | null) => setFormData(prev => ({ ...prev, attachment: url ?? "" }))}
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
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
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

export default OffreDevisForm;