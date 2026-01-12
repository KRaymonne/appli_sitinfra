import React, { useState, useMemo } from 'react';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import ViewDetailsModal from './ViewDetailsModal';
import ExportEquipmentRevisionDropdown from './ExportEquipmentRevisionDropdown';

interface EquipmentRevision {
  revisionId: number;
  equipmentId: number;
  revisionDate: string;
  validityDate?: string;
  amount: number;
  supplier: string;
  referenceNumber?: string;
  description?: string;
  status: string;
  nextRevisionDate?: string;
  devise: string;
  equipment?: any;
  createdAt?: string;
  updatedAt?: string;
}

interface EquipmentRevisionListProps {
  revisions: EquipmentRevision[];
  onEdit: (revision: EquipmentRevision) => void;
  onDelete: (id: number) => void;
  onView: (revision: EquipmentRevision) => void;
}

const EquipmentRevisionList: React.FC<EquipmentRevisionListProps> = ({ revisions, onEdit, onDelete, onView }) => {
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; revision: EquipmentRevision | null }>({
    isOpen: false,
    revision: null,
  });
  
  const [viewModal, setViewModal] = useState<{ isOpen: boolean; revision: EquipmentRevision | null }>({
    isOpen: false,
    revision: null,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'COMPLETED': return 'bg-green-100 text-green-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'En attente';
      case 'COMPLETED': return 'Complété';
      case 'FAILED': return 'Échoué';
      default: return status;
    }
  };

  const filteredRevisions = useMemo(() => {
    return revisions.filter((revision) => {
      if (filters.status && revision.status !== filters.status) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          revision.equipment?.name?.toLowerCase().includes(searchLower) ||
          revision.supplier?.toLowerCase().includes(searchLower) ||
          revision.referenceNumber?.toLowerCase().includes(searchLower) ||
          (revision.description && revision.description.toLowerCase().includes(searchLower))
        );
      }
      return true;
    });
  }, [revisions, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredRevisions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRevisions = filteredRevisions.slice(startIndex, endIndex);

  const handleDeleteClick = (revision: EquipmentRevision) => {
    setDeleteModal({ isOpen: true, revision });
  };
  
  const handleViewClick = (revision: EquipmentRevision) => {
    setViewModal({ isOpen: true, revision });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.revision) {
      onDelete(deleteModal.revision.revisionId);
      setDeleteModal({ isOpen: false, revision: null });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="space-y-4">
      {/* Filters Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rechercher
            </label>
            <input
              type="text"
              placeholder="Équipement, fournisseur, référence..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

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
              <option value="PENDING">En attente</option>
              <option value="COMPLETED">Complété</option>
              <option value="FAILED">Échoué</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Éléments par page
            </label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        {/* Reset Filters */}
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => {
              setFilters({ status: '', search: '' });
              setCurrentPage(1);
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Réinitialiser les filtres
          </button>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {filteredRevisions.length} révision(s) trouvée(s)
            </span>
            {/* Export Dropdown */}
            <ExportEquipmentRevisionDropdown revisions={filteredRevisions} />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {paginatedRevisions.map((revision) => (
          <div
            key={revision.revisionId}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {revision.equipment?.name || `Équipement #${revision.equipmentId}`}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(revision.status)}`}>
                      {getStatusText(revision.status)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span>Date: {new Date(revision.revisionDate).toLocaleDateString('fr-FR')}</span>
                    <span>•</span>
                    <span>Fournisseur: {revision.supplier}</span>
                    <span>•</span>
                    <span>Montant: {formatCurrency(revision.amount, revision.devise)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleViewClick(revision)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Voir"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(revision);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Modifier"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(revision);
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border border-gray-200 rounded-lg sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Affichage de <span className="font-medium">{startIndex + 1}</span> à{' '}
                <span className="font-medium">{Math.min(endIndex, filteredRevisions.length)}</span> sur{' '}
                <span className="font-medium">{filteredRevisions.length}</span> résultats
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Précédent</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx + 1}
                    onClick={() => handlePageChange(idx + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === idx + 1
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Suivant</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, revision: null })}
        onConfirm={handleDeleteConfirm}
        itemName={deleteModal.revision ? `Révision #${deleteModal.revision.revisionId}` : ''}
        itemType="la révision"
      />
      
      {/* View Details Modal */}
      <ViewDetailsModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, revision: null })}
        title="Détails de la Révision"
        data={viewModal.revision || {}}
        fields={[
          { key: 'revisionId', label: 'ID' },
          { key: 'equipment.name', label: 'Équipement', render: (val: any) => val || '-' },
          { key: 'revisionDate', label: 'Date de révision', render: (val: string) => val ? formatDate(val) : '-' },
          { key: 'validityDate', label: 'Date de validité', render: (val: string) => val ? formatDate(val) : '-' },
          { key: 'amount', label: 'Montant', render: (val: number) => formatCurrency(val, viewModal.revision?.devise || 'EUR') },
          { key: 'devise', label: 'Devise' },
          { key: 'supplier', label: 'Fournisseur' },
          { key: 'referenceNumber', label: 'Numéro de référence' },
          { key: 'description', label: 'Description' },
          { key: 'status', label: 'Statut' },
          { key: 'nextRevisionDate', label: 'Prochaine révision', render: (val: string) => val ? formatDate(val) : '-' },
          { key: 'Inserteridentity', label: 'Inserter Identity' },
          { key: 'InserterCountry', label: 'Inserter Country' },
          { key: 'createdAt', label: 'Créé le', render: (val: string) => val ? formatDate(val) : '-' },
          { key: 'updatedAt', label: 'Mis à jour le', render: (val: string) => val ? formatDate(val) : '-' }
        ]}
      />
    </div>
  );
};

export default EquipmentRevisionList;