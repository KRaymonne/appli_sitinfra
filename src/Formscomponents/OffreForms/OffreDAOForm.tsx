import React, { useState, useEffect } from 'react';
import { FileUpload } from '../../components/Personnel/FileUpload';

interface Contact {
  contactId: number;
  firstName: string;
  lastName: string;
  company?: string;
}

interface OffreDAOFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  isEdit?: boolean;
}

const OffreDAOForm: React.FC<OffreDAOFormProps> = ({ onSubmit, initialData, isEdit = false }) => {
  const [formData, setFormData] = useState({
    activityCode: '',
    transmissionDate: '',
    daoNumber: '',
    clientname: '', // Changé de clientId à clientname selon le modèle Prisma
    contactname: '', // Changé de contactId à contactname selon le modèle Prisma
    submissionDate: '',
    submissionType: 'ELECTRONIC',
    object: '',
    status: 'APPLICATION',
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
        activityCode: initialData.activityCode || '',
        transmissionDate: initialData.transmissionDate ? new Date(initialData.transmissionDate).toISOString().split('T')[0] : '',
        daoNumber: initialData.daoNumber || '',
        clientname: initialData.clientname || '',
        contactname: initialData.contactname || '',
        submissionDate: initialData.submissionDate ? new Date(initialData.submissionDate).toISOString().split('T')[0] : '',
        submissionType: initialData.submissionType || 'ELECTRONIC',
        object: initialData.object || '',
        status: initialData.status || 'APPLICATION',
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
      submissionDate: formData.submissionDate || null,
    };
    onSubmit(submitData);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code Activité
            </label>
            <input
              type="text"
              name="activityCode"
              value={formData.activityCode}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de transmission <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="transmissionDate"
              value={formData.transmissionDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              N° DAO <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="daoNumber"
              value={formData.daoNumber}
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
              Personne Contact
            </label>
            <input
              type="text"
              name="contactname"
              value={formData.contactname}
              onChange={handleChange}
              placeholder="Nom du contact..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de soumission
            </label>
            <input
              type="date"
              name="submissionDate"
              value={formData.submissionDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de soumission <span className="text-red-500">*</span>
            </label>
            <select
              name="submissionType"
              value={formData.submissionType}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ELECTRONIC">Électronique</option>
              <option value="PHYSICAL">Physique</option>
              <option value="EMAIL">Email</option>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Objet <span className="text-red-500">*</span>
            </label>
            <textarea
              name="object"
              value={formData.object}
              onChange={handleChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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

export default OffreDAOForm;