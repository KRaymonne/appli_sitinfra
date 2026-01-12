import React, { useState, useMemo } from 'react';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import ViewDetailsModal from './ViewDetailsModal.tsx';
import ExportCalibrationDropdown from './ExportCalibrationDropdown';

interface Calibration {
  calibrationId: number;
  equipmentId: number;
  calibrationDate: string;
  validityDate?: string;
  amount: number;
  supplier: string;
  referenceNumber?: string;
  description?: string;
  nextCalibrationDate?: string;
  devise: string;
  equipment?: any;
  createdAt?: string;
  updatedAt?: string;
}

interface CalibrationListProps {
  calibrations: Calibration[];
  onEdit: (calibration: Calibration) => void;
  onDelete: (id: number) => void;
  onView: (calibration: Calibration) => void;
}

const CalibrationList: React.FC<CalibrationListProps> = ({ calibrations, onEdit, onDelete, onView }) => {
  const [filters, setFilters] = useState({
    search: '',
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; calibration: Calibration | null }>({
    isOpen: false,
    calibration: null,
  });
  
  const [viewModal, setViewModal] = useState<{ isOpen: boolean; calibration: Calibration | null }>({
    isOpen: false,
    calibration: null,
  });

  const filteredCalibrations = useMemo(() => {
    return calibrations.filter((calibration) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          calibration.equipment?.name?.toLowerCase().includes(searchLower) ||
          calibration.supplier?.toLowerCase().includes(searchLower) ||
          calibration.referenceNumber?.toLowerCase().includes(searchLower) ||
          (calibration.description && calibration.description.toLowerCase().includes(searchLower))
        );
      }
      return true;
    });
  }, [calibrations, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredCalibrations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCalibrations = filteredCalibrations.slice(startIndex, endIndex);

  const handleDeleteClick = (calibration: Calibration) => {
    setDeleteModal({ isOpen: true, calibration });
  };
  
  const handleViewClick = (calibration: Calibration) => {
    setViewModal({ isOpen: true, calibration });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.calibration) {
      onDelete(deleteModal.calibration.calibrationId);
      setDeleteModal({ isOpen: false, calibration: null });
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
              setFilters({ search: '' });
              setCurrentPage(1);
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Réinitialiser les filtres
          </button>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {filteredCalibrations.length} calibration(s) trouvée(s)
            </span>
            {/* Export Dropdown */}
            <ExportCalibrationDropdown calibrations={filteredCalibrations} />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {paginatedCalibrations.map((calibration) => (
          <div
            key={calibration.calibrationId}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {calibration.equipment?.name || `Équipement #${calibration.equipmentId}`}
                  </h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span>Date: {new Date(calibration.calibrationDate).toLocaleDateString('fr-FR')}</span>
                    <span>•</span>
                    <span>Fournisseur: {calibration.supplier}</span>
                    <span>•</span>
                    <span>Montant: {formatCurrency(calibration.amount, calibration.devise)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleViewClick(calibration)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Voir"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(calibration);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Modifier"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(calibration);
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
                <span className="font-medium">{Math.min(endIndex, filteredCalibrations.length)}</span> sur{' '}
                <span className="font-medium">{filteredCalibrations.length}</span> résultats
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
        onClose={() => setDeleteModal({ isOpen: false, calibration: null })}
        onConfirm={handleDeleteConfirm}
        itemName={deleteModal.calibration ? `Calibration #${deleteModal.calibration.calibrationId}` : ''}
        itemType="la calibration"
      />
      
      {/* View Details Modal */}
      <ViewDetailsModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, calibration: null })}
        title="Détails de la Calibration"
        data={viewModal.calibration || {}}
        fields={[
          { key: 'calibrationId', label: 'ID' },
          { key: 'equipment.name', label: 'Équipement', render: (val: any) => val || '-' },
          { key: 'calibrationDate', label: 'Date de calibration', render: (val: string) => val ? formatDate(val) : '-' },
          { key: 'validityDate', label: 'Date de validité', render: (val: string) => val ? formatDate(val) : '-' },
          { key: 'amount', label: 'Montant', render: (val: number) => formatCurrency(val, viewModal.calibration?.devise || 'EUR') },
          { key: 'devise', label: 'Devise' },
          { key: 'supplier', label: 'Fournisseur' },
          { key: 'referenceNumber', label: 'Numéro de référence' },
          { key: 'description', label: 'Description' },
          { key: 'nextCalibrationDate', label: 'Prochaine calibration', render: (val: string) => val ? formatDate(val) : '-' },
          { key: 'Inserteridentity', label: 'Inserter Identity' },
          { key: 'InserterCountry', label: 'Inserter Country' },
          { key: 'createdAt', label: 'Créé le', render: (val: string) => val ? formatDate(val) : '-' },
          { key: 'updatedAt', label: 'Mis à jour le', render: (val: string) => val ? formatDate(val) : '-' }
        ]}
      />
    </div>
  );
};

export default CalibrationList;