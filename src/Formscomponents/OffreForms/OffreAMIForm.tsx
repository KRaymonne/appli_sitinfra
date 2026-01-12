import React, { useState, useEffect } from 'react';
import { FileUpload } from '../../components/Personnel/FileUpload';

interface OffreAMIFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  isEdit?: boolean;
}

const OffreAMIForm: React.FC<OffreAMIFormProps> = ({ onSubmit, initialData, isEdit = false }) => {
  const [formData, setFormData] = useState({
    activityCode: '',
    depositDate: '',
    name: '',
    client: '',
    contact: '',
    submissionDate: '',
    object: '',
    status: 'Application',
    comment: '',
    soumissionType: '',
    attachment: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        activityCode: initialData.activityCode || '',
        depositDate: initialData.depositDate ? new Date(initialData.depositDate).toISOString().split('T')[0] : '',
        name: initialData.name || '',
        client: initialData.client || '',
        contact: initialData.contact || '',
        submissionDate: initialData.submissionDate ? new Date(initialData.submissionDate).toISOString().split('T')[0] : '',
        object: initialData.object || '',
        status: initialData.status || 'Application',
        comment: initialData.comment || '',
        soumissionType: initialData.soumissionType || '',
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
    onSubmit(formData);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code d'activité
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
              Date de dépôt <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="depositDate"
              value={formData.depositDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
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
              name="client"
              value={formData.client}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact
            </label>
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de soumission <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="submissionDate"
              value={formData.submissionDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              <option value="Application">Application</option>
              <option value="Under Review">Under Review</option>
              <option value="Pending">Pending</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Bid Submitted">Bid Submitted</option>
              <option value="Not Pursued">Not Pursued</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de soumission
            </label>
            <input
              type="text"
              name="soumissionType"
              value={formData.soumissionType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Commentaire
            </label>
            <textarea
              name="comment"
              value={formData.comment}
              onChange={handleChange}
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

export default OffreAMIForm;