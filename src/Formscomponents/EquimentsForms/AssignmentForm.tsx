import React, { useState, useEffect } from 'react';
import { FileUpload } from '../../components/Personnel/FileUpload';

interface AssignmentFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  isEdit?: boolean;
  equipments?: any[];
  users?: any[];
}

const AssignmentForm: React.FC<AssignmentFormProps> = ({ 
  onSubmit, 
  initialData, 
  isEdit = false,
  equipments = [],
  users: propsUsers = []
}) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [formData, setFormData] = useState({
    equipmentId: '',
    userId: '',
    assignmentDate: '',
    returnDate: '',
    purpose: '',
    notes: '',
    status: 'ASSIGNED',
    attachmentFile: '', // Added for file upload
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
        equipmentId: initialData.equipmentId?.toString() || '',
        userId: initialData.userId?.toString() || '',
        assignmentDate: initialData.assignmentDate ? new Date(initialData.assignmentDate).toISOString().split('T')[0] : '',
        returnDate: initialData.returnDate ? new Date(initialData.returnDate).toISOString().split('T')[0] : '',
        purpose: initialData.purpose || '',
        notes: initialData.notes || '',
        status: initialData.status || 'ASSIGNED',
        attachmentFile: initialData.attachmentFile || ''
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
      userId: parseInt(formData.userId),
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
              Utilisateur <span className="text-red-500">*</span>
            </label>
            <select
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              required
              disabled={loadingUsers}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner un utilisateur</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} - {user.email}
                </option>
              ))}
            </select>
            {loadingUsers && (
              <p className="text-sm text-gray-500 mt-1">Chargement des utilisateurs...</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date d'affectation <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="assignmentDate"
              value={formData.assignmentDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de retour
            </label>
            <input
              type="date"
              name="returnDate"
              value={formData.returnDate}
              onChange={handleChange}
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
              <option value="ASSIGNED">Affecté</option>
              <option value="IN_TRANSIT">En transit</option>
              <option value="RETURNED">Retourné</option>
              <option value="CANCELLED">Annulé</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Objectif
            </label>
            <input
              type="text"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <FileUpload
              label="Document d'affectation"
              value={formData.attachmentFile}
              onChange={(url) => setFormData(prev => ({ ...prev, attachmentFile: url || '' }))}
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              useSupabase={false}
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

export default AssignmentForm;

