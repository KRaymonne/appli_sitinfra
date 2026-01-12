import React, { useEffect, useState } from 'react';
import { FileUpload } from '../../components/Personnel/FileUpload';

interface DocumentFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  isEdit?: boolean;
}

const DEFAULT_FORM = {
  version: '',
  date: '',
  title: '',
  createdBy: '',
  verifiedBy: '',
  validatedBy: '',
  fileName: '',
  fileSize: '',
  status: 'ACTIVE',
  filePath: '',
  description: '',
  category: '',
  entity: 'GRP',
  countryCode: '',
  projectCode: '',
  processCode: '',
  documentType: '',
  documentNumber: '',
  index: '',
};

const DocumentForm: React.FC<DocumentFormProps> = ({ onSubmit, initialData, isEdit = false }) => {
  const [formData, setFormData] = useState(DEFAULT_FORM);

  useEffect(() => {
    if (initialData) {
      setFormData({
        version: initialData.version || '',
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : '',
        title: initialData.title || '',
        createdBy: initialData.createdBy || '',
        verifiedBy: initialData.verifiedBy || '',
        validatedBy: initialData.validatedBy || '',
        fileName: initialData.fileName || '',
        fileSize: initialData.fileSize || '',
        status: initialData.status || 'ACTIVE',
        filePath: initialData.filePath || '',
        description: initialData.description || '',
        category: initialData.category || '',
        entity: initialData.entity || 'GRP',
        countryCode: initialData.countryCode || '',
        projectCode: initialData.projectCode || '',
        processCode: initialData.processCode || '',
        documentType: initialData.documentType || '',
        documentNumber: initialData.documentNumber || '',
        index: initialData.index || '',
      });
    } else {
      setFormData(DEFAULT_FORM);
    }
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
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
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Version
            </label>
            <input
              type="text"
              name="version"
              value={formData.version}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ACTIVE">Actif</option>
              <option value="OBSOLETE">Obsolète</option>
              <option value="DRAFT">Brouillon</option>
              <option value="ARCHIVE">Archivé</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Titre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Libellé du document"
          />
        </div>

        {/* Document file upload */}
        <div>
          <FileUpload
            label="Fichier du document"
            value={formData.filePath}
            onChange={(url) => {
              setFormData((prev) => ({
                ...prev,
                filePath: url || '',
                fileName: url ? url.split('/').pop() || '' : '',
              }));
            }}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png"
            useSupabase={false}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['createdBy', 'verifiedBy', 'validatedBy'].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field === 'createdBy'
                  ? 'Réalisé par'
                  : field === 'verifiedBy'
                    ? 'Vérifié par'
                    : 'Validé par'}
              </label>
              <input
                type="text"
                name={field}
                value={(formData as any)[field]}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom du fichier</label>
            <input
              type="text"
              name="fileName"
              value={formData.fileName}
              onChange={handleChange}
              placeholder="Document.pdf"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Taille du fichier</label>
            <input
              type="text"
              name="fileSize"
              value={formData.fileSize}
              onChange={handleChange}
              placeholder="2.3 MB"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entité</label>
            <select
              name="entity"
              value={formData.entity}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="GRP">Groupe</option>
              <option value="SIT">SITINFRA</option>
              <option value="GEO">GEOTOP</option>
              <option value="SIL">SITALIA</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pays</label>
            <input
              type="text"
              name="countryCode"
              value={formData.countryCode}
              onChange={handleChange}
              placeholder="CMR"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Code projet</label>
            <input
              type="text"
              name="projectCode"
              value={formData.projectCode}
              onChange={handleChange}
              placeholder="DOC-001"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Processus</label>
            <input
              type="text"
              name="processCode"
              value={formData.processCode}
              onChange={handleChange}
              placeholder="S4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de document</label>
            <select
              name="documentType"
              value={formData.documentType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Sélectionner un type</option>
              <option value="PROCEDURE">Procédure</option>
              <option value="POLICY">Politique</option>
              <option value="MANUAL">Manuel</option>
              <option value="CONTRACT">Contrat</option>
              <option value="REPORT">Rapport</option>
              <option value="CERTIFICATE">Certificat</option>
              <option value="LICENSE">Licence</option>
              <option value="PERMIT">Permis/Autorisation</option>
              <option value="INVOICE">Facture</option>
              <option value="RECEIPT">Reçu</option>
              <option value="STATEMENT">Relevé</option>
              <option value="SPECIFICATION">Spécification technique</option>
              <option value="DRAWING">Plan/Dessin technique</option>
              <option value="TECHNICAL_DOC">Document technique</option>
              <option value="ADMINISTRATIVE">Document administratif</option>
              <option value="FINANCIAL">Document financier</option>
              <option value="LEGAL">Document légal/juridique</option>
              <option value="QUALITY">Document qualité</option>
              <option value="SAFETY">Document sécurité</option>
              <option value="TRAINING">Document formation</option>
              <option value="OTHER">Autre</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Numéro</label>
            <input
              type="text"
              name="documentNumber"
              value={formData.documentNumber}
              onChange={handleChange}
              placeholder="003"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Indice</label>
            <input
              type="text"
              name="index"
              value={formData.index}
              onChange={handleChange}
              placeholder="2.0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Informations supplémentaires"
          />
        </div>

        <div className="flex justify-end space-x-3">
          {isEdit && (
            <span className="text-sm text-gray-500 self-center">Mode édition</span>
          )}
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {isEdit ? 'Mettre à jour' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DocumentForm;