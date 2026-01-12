import React, { useState, useEffect } from 'react';
import { FileUpload } from '../../components/Personnel/FileUpload';

interface EquipmentFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  isEdit?: boolean;
}

const EquipmentForm: React.FC<EquipmentFormProps> = ({ onSubmit, initialData, isEdit = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: 'TOPOGRAPHIC_MATERIALS',
    type: 'NIVEAUX_LASER',
    brand: 'LEICA',
    model: '',
    serialNumber: '',
    referenceCode: '',
    supplier: 'DELUXE_C',
    purchaseAmount: '',
    purchaseDate: '',
    deliveryDate: '',
    warrantyExpiry: '',
    status: 'GOOD',
    location: '',
    observations: '',
    ownership: 'COMPANY',
    devise: 'XAF', // Changed from currency to devise to match Prisma model
    attachmentFile: '', // Added for file upload
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        category: initialData.category || 'TOPOGRAPHIC_MATERIALS',
        type: initialData.type || 'NIVEAUX_LASER',
        brand: initialData.brand || 'LEICA',
        model: initialData.model || '',
        serialNumber: initialData.serialNumber || '',
        referenceCode: initialData.referenceCode || '',
        supplier: initialData.supplier || 'DELUXE_C',
        purchaseAmount: initialData.purchaseAmount?.toString() || '',
        purchaseDate: initialData.purchaseDate ? new Date(initialData.purchaseDate).toISOString().split('T')[0] : '',
        deliveryDate: initialData.deliveryDate ? new Date(initialData.deliveryDate).toISOString().split('T')[0] : '',
        warrantyExpiry: initialData.warrantyExpiry ? new Date(initialData.warrantyExpiry).toISOString().split('T')[0] : '',
        status: initialData.status || 'GOOD',
        location: initialData.location || '',
        observations: initialData.observations || '',
        ownership: initialData.ownership || 'COMPANY',
        devise: initialData.devise || 'XAF', // Changed from currency to devise
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
      purchaseAmount: parseFloat(formData.purchaseAmount) || 0
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              Catégorie <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="TOPOGRAPHIC_MATERIALS">Matériels Topographiques</option>
              <option value="COMPUTER_MATERIALS">Matériels Informatiques</option>
              <option value="OTHERS">Autres</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="NIVEAUX_LASER">Niveaux Laser</option>
              <option value="PELETEUSES">Pelleuses</option>
              <option value="BETONNIERES">Bétonnières</option>
              <option value="SCIES_A_BETON">Scies à Béton</option>
              <option value="ECHAFAUDAGES">Échafaudages</option>
              <option value="COMPRESSEURS_AIR">Compresseurs d'Air</option>
              <option value="ENGIN_DE_COMPACTAGE">Engin de Compactage</option>
              <option value="CAMIONS_DE_TRANSPORT">Camions de Transport</option>
              <option value="MESUREURS_DE_DISTANCE_LASER">Mesureurs de Distance Laser</option>
              <option value="GENERATEURS">Générateurs</option>
              <option value="ORDINATEURS_PORTABLES">Ordinateurs Portables</option>
              <option value="TABLETTES">Tablettes</option>
              <option value="LOGICIELS_DE_GESTION_DE_PROJET">Logiciels de Gestion de Projet</option>
              <option value="DRONES">Drones</option>
              <option value="IMPRIMANTES_3D">Imprimantes 3D</option>
              <option value="OTHER_Equipement">Autre Équipement</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marque <span className="text-red-500">*</span>
            </label>
            <select
              name="brand"
              value={formData.brand}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="LEICA">Leica</option>
              <option value="TRIMBLE">Trimble</option>
              <option value="TOPCON">Topcon</option>
              <option value="SOKKIA">Sokkia</option>
              <option value="NIKON">Nikon</option>
              <option value="PENTAX">Pentax</option>
              <option value="SPECTRA">Spectra</option>
              <option value="GEO_FENNEL">Geo Fennel</option>
              <option value="SOUTH">South</option>
              <option value="STONEX">Stonex</option>
              <option value="OTHER_BRAND">Autre Marque</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Modèle
            </label>
            <input
              type="text"
              name="model"
              value={formData.model}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Numéro de série <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="serialNumber"
              value={formData.serialNumber}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code de référence <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="referenceCode"
              value={formData.referenceCode}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fournisseur <span className="text-red-500">*</span>
            </label>
            <select
              name="supplier"
              value={formData.supplier}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="DELUXE_C">Deluxe C</option>
              <option value="STIALA_C">Stiala C</option>
              <option value="DIGITOP">Digitop</option>
              <option value="OTHER_SUPPLIER">Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Montant d'achat <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="purchaseAmount"
              value={formData.purchaseAmount}
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
              Date d'achat <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="purchaseDate"
              value={formData.purchaseDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de livraison <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="deliveryDate"
              value={formData.deliveryDate}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expiration de la garantie
            </label>
            <input
              type="date"
              name="warrantyExpiry"
              value={formData.warrantyExpiry}
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
              <option value="GOOD">Bon</option>
              <option value="BAD">Mauvais</option>
              <option value="BROKEN">En panne</option>
              <option value="DECOMMISSIONED">Réformé</option>
              <option value="LOST">Perdu</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Localisation <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Propriété <span className="text-red-500">*</span>
            </label>
            <select
              name="ownership"
              value={formData.ownership}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="PRIVATE">Privé</option>
              <option value="COMPANY">Société</option>
              <option value="TENANT">Locataire</option>
              <option value="OTHER">Autre</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Observations
            </label>
            <textarea
              name="observations"
              value={formData.observations}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <FileUpload
              label="Fichier joint"
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

export default EquipmentForm;