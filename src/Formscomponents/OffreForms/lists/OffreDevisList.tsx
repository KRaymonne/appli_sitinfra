import React, { useState, useMemo } from 'react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { OffreDetailsModal } from '../../../components/Offres/OffreDetailsModal';
import ExportOfferDropdown from './ExportOfferDropdown';

interface OffreDevis {
  devisId: number;
  indexNumber: string;
  clientname: string; // Changé selon le modèle Prisma
  amount: number;
  validityDate: string;
  status: string;
  description?: string;
  attachment?: string;
  devise?: string; // Changé de currency à devise
}

interface OffreDevisListProps {
  offreDevis: OffreDevis[];
  onEdit: (devis: OffreDevis) => void;
  onDelete: (id: number) => void;
  onView: (devis: OffreDevis) => void;
}

const OffreDevisList: React.FC<OffreDevisListProps> = ({ offreDevis, onEdit, onDelete, onView }) => {
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; devis: OffreDevis | null }>({
    isOpen: false,
    devis: null,
  });
  const [detailsModal, setDetailsModal] = useState<{ isOpen: boolean; devis: OffreDevis | null }>({
    isOpen: false,
    devis: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPLICATION': return 'bg-blue-100 text-blue-800';
      case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-800';
      case 'PENDING': return 'bg-orange-100 text-orange-800';
      case 'SHORTLISTED': return 'bg-green-100 text-green-800';
      case 'BID_SUBMITTED': return 'bg-purple-100 text-purple-800';
      case 'NOT_PURSUED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPLICATION': return 'Candidature';
      case 'UNDER_REVIEW': return 'En Étude';
      case 'PENDING': return 'En Attente';
      case 'SHORTLISTED': return 'Retenu';
      case 'BID_SUBMITTED': return 'Soumission';
      case 'NOT_PURSUED': return 'Pas de suite';
      default: return status;
    }
  };

  const formatCurrency = (amount: number, currency: string = 'XAF') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredDevis = useMemo(() => {
    return offreDevis.filter((devis) => {
      if (filters.status && devis.status !== filters.status) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          devis.indexNumber.toLowerCase().includes(searchLower) ||
          devis.clientname.toLowerCase().includes(searchLower) ||
          devis.description?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [offreDevis, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredDevis.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDevis = filteredDevis.slice(startIndex, startIndex + itemsPerPage);

  const handleViewClick = (devis: OffreDevis) => {
    setDetailsModal({ isOpen: true, devis });
  };

  const handleDeleteClick = (devis: OffreDevis) => {
    setDeleteModal({ isOpen: true, devis });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.devis) {
      onDelete(deleteModal.devis.devisId);
      setDeleteModal({ isOpen: false, devis: null });
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rechercher
            </label>
            <input
              type="text"
              placeholder="N° Index, client, description..."
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
              <option value="APPLICATION">Candidature</option>
              <option value="UNDER_REVIEW">En Étude</option>
              <option value="PENDING">En Attente</option>
              <option value="SHORTLISTED">Retenu</option>
              <option value="BID_SUBMITTED">Soumission</option>
              <option value="NOT_PURSUED">Pas de suite</option>
            </select>
          </div>
        </div>

        {/* Results count and Export */}
        <div className="mt-3 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {filteredDevis.length} devis trouvé(s)
          </div>
          {/* Export Dropdown */}
          <ExportOfferDropdown offers={filteredDevis} offerType="devis" />
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {paginatedDevis.map((devis) => (
          <div
            key={devis.devisId}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onView(devis)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {devis.indexNumber}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(devis.status)}`}>
                      {getStatusText(devis.status)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {devis.clientname}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatCurrency(devis.amount, devis.devise)}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(devis.validityDate).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  {devis.description && (
                    <p className="text-sm text-gray-600 mt-1 truncate">{devis.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewClick(devis);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Voir les détails"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(devis);
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
                    handleDeleteClick(devis);
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2 mt-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>
          <span className="px-3 py-1 text-gray-700">
            Page {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, devis: null })}
        onConfirm={handleDeleteConfirm}
        itemName={deleteModal.devis ? `Devis ${deleteModal.devis.indexNumber}` : ''}
        itemType="le devis"
      />

      {/* Details Modal */}
      <OffreDetailsModal
        isOpen={detailsModal.isOpen}
        onClose={() => setDetailsModal({ isOpen: false, devis: null })}
        data={detailsModal.devis}
        type="devis"
      />
    </div>
  );
};

export default OffreDevisList;

