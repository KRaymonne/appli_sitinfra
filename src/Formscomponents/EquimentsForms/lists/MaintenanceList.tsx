import React, { useState, useMemo } from 'react';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import ViewDetailsModal from './ViewDetailsModal';
import ExportMaintenanceDropdown from './ExportMaintenanceDropdown';

interface Maintenance {
  maintenanceId: number;
  equipmentId: number;
  maintenanceDate: string;
  maintenanceType: string;
  description?: string;
  amount: number;
  supplier: string;
  technician?: string;
  downtimeHours?: number;
  nextMaintenanceDate?: string;
  devise: string;
  equipment?: any;
  createdAt?: string;
  updatedAt?: string;
}

interface MaintenanceListProps {
  maintenances: Maintenance[];
  onEdit: (maintenance: Maintenance) => void;
  onDelete: (id: number) => void;
  onView: (maintenance: Maintenance) => void;
}

const MaintenanceList: React.FC<MaintenanceListProps> = ({ maintenances, onEdit, onDelete, onView }) => {
  const [filters, setFilters] = useState({
    maintenanceType: '',
    search: '',
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; maintenance: Maintenance | null }>({
    isOpen: false,
    maintenance: null,
  });
  
  const [viewModal, setViewModal] = useState<{ isOpen: boolean; maintenance: Maintenance | null }>({
    isOpen: false,
    maintenance: null,
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PREVENTIVE': return 'bg-blue-100 text-blue-800';
      case 'CORRECTIVE': return 'bg-orange-100 text-orange-800';
      case 'PREDICTIVE': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'PREVENTIVE': return 'Préventive';
      case 'CORRECTIVE': return 'Corrective';
      case 'PREDICTIVE': return 'Prédictive';
      default: return type;
    }
  };

  const filteredMaintenances = useMemo(() => {
    return maintenances.filter((maintenance) => {
      if (filters.maintenanceType && maintenance.maintenanceType !== filters.maintenanceType) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          maintenance.equipment?.name?.toLowerCase().includes(searchLower) ||
          maintenance.supplier?.toLowerCase().includes(searchLower) ||
          maintenance.technician?.toLowerCase().includes(searchLower) ||
          (maintenance.description && maintenance.description.toLowerCase().includes(searchLower))
        );
      }
      return true;
    });
  }, [maintenances, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredMaintenances.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedMaintenances = filteredMaintenances.slice(startIndex, endIndex);

  const handleDeleteClick = (maintenance: Maintenance) => {
    setDeleteModal({ isOpen: true, maintenance });
  };
  
  const handleViewClick = (maintenance: Maintenance) => {
    setViewModal({ isOpen: true, maintenance });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.maintenance) {
      onDelete(deleteModal.maintenance.maintenanceId);
      setDeleteModal({ isOpen: false, maintenance: null });
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
              placeholder="Équipement, fournisseur, technicien..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de maintenance
            </label>
            <select
              value={filters.maintenanceType}
              onChange={(e) => setFilters({ ...filters, maintenanceType: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="PREVENTIVE">Préventive</option>
              <option value="CORRECTIVE">Corrective</option>
              <option value="PREDICTIVE">Prédictive</option>
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
              setFilters({ maintenanceType: '', search: '' });
              setCurrentPage(1);
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Réinitialiser les filtres
          </button>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {filteredMaintenances.length} maintenance(s) trouvée(s)
            </span>
            {/* Export Dropdown */}
            <ExportMaintenanceDropdown maintenances={filteredMaintenances} />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {paginatedMaintenances.map((maintenance) => (
          <div
            key={maintenance.maintenanceId}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {maintenance.equipment?.name || `Équipement #${maintenance.equipmentId}`}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(maintenance.maintenanceType)}`}>
                      {getTypeText(maintenance.maintenanceType)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span>Date: {new Date(maintenance.maintenanceDate).toLocaleDateString('fr-FR')}</span>
                    <span>•</span>
                    <span>Fournisseur: {maintenance.supplier}</span>
                    <span>•</span>
                    <span>Montant: {formatCurrency(maintenance.amount, maintenance.devise)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleViewClick(maintenance)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Voir"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(maintenance);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Modifier"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(maintenance);
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
                <span className="font-medium">{Math.min(endIndex, filteredMaintenances.length)}</span> sur{' '}
                <span className="font-medium">{filteredMaintenances.length}</span> résultats
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
        onClose={() => setDeleteModal({ isOpen: false, maintenance: null })}
        onConfirm={handleDeleteConfirm}
        itemName={deleteModal.maintenance ? `Maintenance #${deleteModal.maintenance.maintenanceId}` : ''}
        itemType="la maintenance"
      />
      
      {/* View Details Modal */}
      <ViewDetailsModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, maintenance: null })}
        title="Détails de la Maintenance"
        data={viewModal.maintenance || {}}
        fields={[
          { key: 'maintenanceId', label: 'ID' },
          { key: 'equipment.name', label: 'Équipement', render: (val: any) => val || '-' },
          { key: 'maintenanceDate', label: 'Date de maintenance', render: (val: string) => val ? formatDate(val) : '-' },
          { key: 'maintenanceType', label: 'Type de maintenance' },
          { key: 'description', label: 'Description' },
          { key: 'amount', label: 'Montant', render: (val: number) => formatCurrency(val, viewModal.maintenance?.devise || 'EUR') },
          { key: 'devise', label: 'Devise' },
          { key: 'supplier', label: 'Fournisseur' },
          { key: 'technician', label: 'Technicien' },
          { key: 'downtimeHours', label: 'Heures d\'arrêt' },
          { key: 'nextMaintenanceDate', label: 'Prochaine maintenance', render: (val: string) => val ? formatDate(val) : '-' },
          { key: 'Inserteridentity', label: 'Inserter Identity' },
          { key: 'InserterCountry', label: 'Inserter Country' },
          { key: 'createdAt', label: 'Créé le', render: (val: string) => val ? formatDate(val) : '-' },
          { key: 'updatedAt', label: 'Mis à jour le', render: (val: string) => val ? formatDate(val) : '-' }
        ]}
      />
    </div>
  );
};

export default MaintenanceList;