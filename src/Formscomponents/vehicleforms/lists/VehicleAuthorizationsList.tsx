import React, { useState, useMemo } from 'react';
import { Eye } from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import ViewDetailsModal from './ViewDetailsModal';
import ExportVehicleAuthorizationDropdown from './ExportVehicleAuthorizationDropdown';
import { VehicleAuthorization } from '../../../utils/exportVehicleUtils';

interface VehicleAuthorizationsListProps {
  authorizations: VehicleAuthorization[];
  onEdit: (authorization: VehicleAuthorization) => void;
  onDelete: (id: number) => void;
  onView: (authorization: VehicleAuthorization) => void;
}

const VehicleAuthorizationsList: React.FC<VehicleAuthorizationsListProps> = ({ 
  authorizations, 
  onEdit, 
  onDelete, 
  onView 
}) => {
  const [filters, setFilters] = useState({
    status: '',
    autorisationtype: '',
    search: '',
  });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; authorization: VehicleAuthorization | null }>({
    isOpen: false,
    authorization: null,
  });
  
  const [viewModal, setViewModal] = useState<{ isOpen: boolean; authorization: VehicleAuthorization | null }>({
    isOpen: false,
    authorization: null,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'EXPIRED': return 'bg-red-100 text-red-800';
      case 'REVOKED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'Active';
      case 'EXPIRED': return 'Expirée';
      case 'REVOKED': return 'Révoquée';
      default: return status;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'CIRCULER': return 'bg-blue-100 text-blue-800';
      case 'NON_CIRCULABLE': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'CIRCULER': return 'Circuler';
      case 'NON_CIRCULABLE': return 'Non circulable';
      default: return type;
    }
  };

  const filteredAuthorizations = useMemo(() => {
    return authorizations.filter((auth) => {
      if (filters.status && auth.status !== filters.status) return false;
      if (filters.autorisationtype && auth.autorisationtype !== filters.autorisationtype) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          auth.authorizationNumber.toLowerCase().includes(searchLower) ||
          auth.issuingAuthority.toLowerCase().includes(searchLower) ||
          auth.purpose.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [authorizations, filters]);

  const handleDeleteClick = (authorization: VehicleAuthorization) => {
    setDeleteModal({ isOpen: true, authorization });
  };
  
  const handleViewClick = (authorization: VehicleAuthorization) => {
    setViewModal({ isOpen: true, authorization });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.authorization) {
      onDelete(deleteModal.authorization.authorizationId);
      setDeleteModal({ isOpen: false, authorization: null });
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rechercher
            </label>
            <input
              type="text"
              placeholder="Numéro, autorité, objet..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="ACTIVE">Active</option>
              <option value="EXPIRED">Expirée</option>
              <option value="REVOKED">Révoquée</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type d'autorisation
            </label>
            <select
              value={filters.autorisationtype}
              onChange={(e) => setFilters({ ...filters, autorisationtype: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="CIRCULER">Circuler</option>
              <option value="NON_CIRCULABLE">Non circulable</option>
            </select>
          </div>
        </div>

        {/* Results count and export */}
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {filteredAuthorizations.length} autorisation(s) trouvée(s)
          </div>
          <div className="flex items-center space-x-4">
            {/* Export Dropdown */}
            <ExportVehicleAuthorizationDropdown authorizations={filteredAuthorizations} />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredAuthorizations.map((auth) => (
          <div
            key={auth.authorizationId}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onView(auth)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {auth.authorizationNumber}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(auth.status)}`}>
                      {getStatusText(auth.status)}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(auth.autorisationtype)}`}>
                      {getTypeText(auth.autorisationtype)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {auth.issuingAuthority}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Émis: {new Date(auth.issueDate).toLocaleDateString()}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Expire: {new Date(auth.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1 line-clamp-1">
                    {auth.purpose}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewClick(auth);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Voir"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(auth);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Modifier"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(auth);
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Supprimer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, authorization: null })}
        onConfirm={handleDeleteConfirm}
        itemName={deleteModal.authorization ? deleteModal.authorization.authorizationNumber : ''}
        itemType="l'autorisation"
      />
      
      {/* View Details Modal */}
      <ViewDetailsModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, authorization: null })}
        title="Détails de l'Autorisation"
        data={viewModal.authorization || {}}
        fields={[
          { key: 'authorizationId', label: 'ID Autorisation' },
          { key: 'authorizationNumber', label: 'Numéro d\'autorisation' },
          { key: 'issueDate', label: 'Date d\'émission', render: (val: string) => val ? new Date(val).toLocaleDateString('fr-FR') : '-' }, 
          { key: 'expiryDate', label: 'Date d\'expiration', render: (val: string) => val ? new Date(val).toLocaleDateString('fr-FR') : '-' },
          { key: 'issuingAuthority', label: 'Autorité émettrice' },
          { key: 'autorisationtype', label: 'Type d\'autorisation', render: (val: string) => val ? getTypeText(val) : '-' },
          { key: 'purpose', label: 'Objet' },
          { key: 'status', label: 'Statut', render: (val: string) => <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(val)}`}>{getStatusText(val)}</span> },
          { key: 'Inserteridentity', label: 'Inserter Identity' },
          { key: 'InserterCountry', label: 'Inserter Country' }
        ]}
      />
    </div>
  );
};

export default VehicleAuthorizationsList;