import React, { useState, useMemo } from 'react';
import { Eye } from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import ViewDetailsModal from './ViewDetailsModal';
import ExportVehicleReformDropdown from './ExportVehicleReformDropdown';

interface VehicleReform {
  reformId: number;
  reformDate: string;
  reformReason: string;
  salePrice?: number;
  buyer?: string;
  buyerNumber?: string;
  disposalMethod: string;
  devise?: string; // Added devise field
}

interface VehicleReformsListProps {
  reforms: VehicleReform[];
  onEdit: (reform: VehicleReform) => void;
  onDelete: (id: number) => void;
  onView: (reform: VehicleReform) => void;
}

const VehicleReformsList: React.FC<VehicleReformsListProps> = ({ 
  reforms, 
  onEdit, 
  onDelete, 
  onView 
}) => {
  const [filters, setFilters] = useState({
    disposalMethod: '',
    search: '',
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; reform: VehicleReform | null }>({
    isOpen: false,
    reform: null,
  });
  
  const [viewModal, setViewModal] = useState<{ isOpen: boolean; reform: VehicleReform | null }>({
    isOpen: false,
    reform: null,
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatCurrency = (amount: number, devise: string = 'XAF') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: devise,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'SALE': return 'bg-green-100 text-green-800';
      case 'DESTRUCTION': return 'bg-red-100 text-red-800';
      case 'DONATION': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodText = (method: string) => {
    switch (method) {
      case 'SALE': return 'Vente';
      case 'DESTRUCTION': return 'Destruction';
      case 'DONATION': return 'Don';
      default: return method;
    }
  };

  const filteredReforms = useMemo(() => {
    return reforms.filter((reform) => {
      if (filters.disposalMethod && reform.disposalMethod !== filters.disposalMethod) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          reform.reformReason.toLowerCase().includes(searchLower) ||
          (reform.buyer && reform.buyer.toLowerCase().includes(searchLower))
        );
      }
      return true;
    });
  }, [reforms, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredReforms.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReforms = filteredReforms.slice(startIndex, endIndex);

  const handleDeleteClick = (reform: VehicleReform) => {
    setDeleteModal({ isOpen: true, reform });
  };
  
  const handleViewClick = (reform: VehicleReform) => {
    setViewModal({ isOpen: true, reform });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.reform) {
      onDelete(deleteModal.reform.reformId);
      setDeleteModal({ isOpen: false, reform: null });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-4">
      {/* Filters Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rechercher
            </label>
            <input
              type="text"
              placeholder="Raison, acheteur..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Disposal Method Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Méthode de disposition
            </label>
            <select
              value={filters.disposalMethod}
              onChange={(e) => setFilters({ ...filters, disposalMethod: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="SALE">Vente</option>
              <option value="DESTRUCTION">Destruction</option>
              <option value="DONATION">Don</option>
            </select>
          </div>

          {/* Items per page */}
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

        {/* Results count */}
        <div className="mt-3 flex justify-between items-center">
          <button
            onClick={() => {
              setFilters({ disposalMethod: '', search: '' });
              setCurrentPage(1);
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Réinitialiser les filtres
          </button>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {filteredReforms.length} réforme(s) trouvée(s)
            </span>
            {/* Export Dropdown */}
            <ExportVehicleReformDropdown reforms={filteredReforms} />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {paginatedReforms.map((reform) => (
          <div
            key={reform.reformId}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onView(reform)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Réforme #{reform.reformId}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getMethodColor(reform.disposalMethod)}`}>
                      {getMethodText(reform.disposalMethod)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(reform.reformDate).toLocaleDateString()}
                    </span>
                    {reform.salePrice && (
                      <span className="flex items-center font-semibold text-gray-700">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatCurrency(reform.salePrice, reform.devise)}
                      </span>
                    )}
                    {reform.buyer && (
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {reform.buyer}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {reform.reformReason}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewClick(reform);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Voir"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(reform);
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
                    handleDeleteClick(reform);
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
                <span className="font-medium">{Math.min(endIndex, filteredReforms.length)}</span> sur{' '}
                <span className="font-medium">{filteredReforms.length}</span> résultats
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
        onClose={() => setDeleteModal({ isOpen: false, reform: null })}
        onConfirm={handleDeleteConfirm}
        itemName={deleteModal.reform ? `Réforme #${deleteModal.reform.reformId}` : ''}
        itemType="la réforme"
      />
      
      {/* View Details Modal */}
      <ViewDetailsModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, reform: null })}
        title="Détails de la Réforme"
        data={viewModal.reform || {}}
        fields={[
          { key: 'reformId', label: 'ID Réforme' },
          { key: 'reformDate', label: 'Date de réforme', render: (val: string) => val ? formatDate(val) : '-' },
          { key: 'reformReason', label: 'Raison de réforme' },
          { key: 'salePrice', label: 'Prix de vente', render: (val: number) => val ? formatCurrency(val, viewModal.reform?.devise) : '-' },
          { key: 'buyer', label: 'Acheteur' },
          { key: 'buyerNumber', label: 'Numéro acheteur' },
          { key: 'disposalMethod', label: 'Méthode de disposition', render: (val: string) => val ? getMethodText(val) : '-' },
          { key: 'devise', label: 'Devise' },
          { key: 'reformReport', label: 'Rapport de réforme', render: (val: string) => val ? (
            <a
              href={val}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Voir
            </a>
          ) : '-' },
          { key: 'Inserteridentity', label: 'Inserter Identity' },
          { key: 'InserterCountry', label: 'Inserter Country' },
          { key: 'reformCertificate', label: 'Certificat de réforme', render: (val: string) => val ? (
            <a
              href={val}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Voir
            </a>
          ) : '-' }
        ]}
      />
    </div>
  );
};

export default VehicleReformsList;

