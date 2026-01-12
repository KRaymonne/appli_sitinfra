import React, { useEffect, useState } from 'react';

interface SoftwareOption {
  softwareId: number;
  name: string;
  version?: string;
}

interface UserOption {
  id: number;
  firstName: string;
  lastName: string;
  department?: string;
}

interface SoftwareAssignmentFormProps {
  onSubmit: (data: any) => void;
  softwares?: SoftwareOption[];
  users?: UserOption[];
  initialData?: any;
  isEdit?: boolean;
}

const DEFAULT_FORM = {
  softwareId: '',
  userId: '', // This will now be an input field
  userName: '', // New field for user name input
  department: '',
  assignmentDate: '',
  returnDate: '',
  purpose: '',
  notes: '',
  status: 'ASSIGNED',
};

const SoftwareAssignmentForm: React.FC<SoftwareAssignmentFormProps> = ({
  onSubmit,
  softwares = [],
  users = [],
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
        userId: initialData.userId?.toString() || '',
        userName: initialData.userName || initialData.user?.firstName + ' ' + initialData.user?.lastName || '',
        department: initialData.department || '',
        assignmentDate: initialData.assignmentDate ? initialData.assignmentDate.split('T')[0] : '',
        returnDate: initialData.returnDate ? initialData.returnDate.split('T')[0] : '',
        purpose: initialData.purpose || '',
        notes: initialData.notes || '',
        status: initialData.status || 'ASSIGNED',
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
      userId: formData.userId ? Number(formData.userId) : null,
      assignmentDate: formData.assignmentDate ? new Date(formData.assignmentDate).toISOString() : '',
      returnDate: formData.returnDate ? new Date(formData.returnDate).toISOString() : null,
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Utilisateur</label>
            <input
              type="text"
              name="userName"
              value={formData.userName}
              onChange={handleChange}
              placeholder="Nom de l'utilisateur"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input
              type="hidden"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Département</label>
            <input
              type="text"
              name="department"
              value={formData.department}
              onChange={handleChange}
              placeholder="Direction / Service"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date d'affectation
            </label>
            <input
              type="date"
              name="assignmentDate"
              value={formData.assignmentDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de retour prévue
            </label>
            <input
              type="date"
              name="returnDate"
              value={formData.returnDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="ASSIGNED">Assigné</option>
              <option value="IN_TRANSIT">En cours</option>
              <option value="RETURNED">Retourné</option>
              <option value="CANCELLED">Annulé</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Objet</label>
            <input
              type="text"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              placeholder="Projet, mission, besoin..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={3}
            placeholder="Pré-requis, appareils concernés..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
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

export default SoftwareAssignmentForm;

