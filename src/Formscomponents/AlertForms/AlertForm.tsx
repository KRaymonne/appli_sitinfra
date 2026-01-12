import React, { useState, useEffect } from 'react';
import { Button } from '../../components/Common/Button';

interface AlertFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  isEdit?: boolean;
}

export const AlertForm: React.FC<AlertFormProps> = ({
  onSubmit,
  initialData,
  isEdit = false
}) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    dueTime: '',
    priority: 'MEDIUM',
    type: '',
    userId: ''
  });

  // Fetch users for the foreign key dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      setLoadingUsers(true);
      try {
        const response = await fetch('/.netlify/functions/personnel-users');
        if (response.ok) {
          const data = await response.json();
          setUsers(Array.isArray(data) ? data : data.users || []);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoadingUsers(false);
      }
    };
    fetchUsers();
  }, []);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        dueDate: initialData.dueDate ? initialData.dueDate.split('T')[0] : '',
        dueTime: initialData.dueTime || '',
        priority: initialData.priority || 'MEDIUM',
        type: initialData.type || '',
        userId: initialData.userId?.toString() || ''
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
      title: formData.title,
      description: formData.description || null,
      dueDate: new Date(formData.dueDate).toISOString(),
      dueTime: formData.dueTime || null,
      priority: formData.priority,
      type: formData.type,
      userId: formData.userId ? parseInt(formData.userId) : null
    };

    onSubmit(submitData);
  };

  const alertTypes = [
    "Facture Client",
    "Facture Fournisseur", 
    "Personnel",
    "Parc auto",
    "Équipement",
    "Affaire/Chantier",
    "Général"
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Titre de l'alerte <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: Échéance facture client XYZ"
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Description détaillée de l'alerte..."
          />
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date d'échéance <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Due Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Heure d'échéance
          </label>
          <input
            type="time"
            name="dueTime"
            value={formData.dueTime}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="HH:MM"
          />
          <p className="text-xs text-gray-500 mt-1">
            Laissez vide si l'heure n'est pas spécifique
          </p>
        </div>

        {/* Priority (Enum) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Priorité <span className="text-red-500">*</span>
          </label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="HIGH">Élevée</option>
            <option value="MEDIUM">Moyenne</option>
            <option value="LOW">Faible</option>
          </select>
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type d'alerte <span className="text-red-500">*</span>
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Sélectionner un type</option>
            {alertTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* User (Foreign Key) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Utilisateur associé
          </label>
          <select
            name="userId"
            value={formData.userId}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loadingUsers}
          >
            <option value="">Aucun utilisateur</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.firstName} {user.lastName} - {user.email}
              </option>
            ))}
          </select>
          {loadingUsers && (
            <p className="text-sm text-gray-500 mt-1">Chargement des utilisateurs...</p>
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-4 pt-6 border-t">
        <Button type="submit" variant="primary">
          {isEdit ? 'Mettre à jour' : 'Créer'} l'alerte
        </Button>
      </div>
    </form>
  );
};

