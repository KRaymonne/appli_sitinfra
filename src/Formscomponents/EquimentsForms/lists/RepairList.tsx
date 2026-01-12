import React, { useState, useMemo } from 'react';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import ViewDetailsModal from './ViewDetailsModal';
import ExportRepairDropdown from './ExportRepairDropdown';

interface Repair {
  repairId: number;
  equipmentId: number;
  repairDate: string;
  repairType: string;
  description?: string;
  amount: number;
  supplier: string;
  technician?: string;
  partsReplaced?: string;
  warrantyPeriod?: number;
  devise: string;
  equipment?: any;
  createdAt?: string;
  updatedAt?: string;
}

interface RepairListProps {
  repairs: Repair[];
  onEdit: (repair: Repair) => void;
  onDelete: (id: number) => void;
  onView: (repair: Repair) => void;
}

const RepairList: React.FC<RepairListProps> = ({ repairs, onEdit, onDelete, onView }) => {
  const [filters, setFilters] = useState({
    repairType: '',
    search: '',
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; repair: Repair | null }>({
    isOpen: false,
    repair: null,
  });
  
  const [viewModal, setViewModal] = useState<{ isOpen: boolean; repair: Repair | null }>({
    isOpen: false,
    repair: null,
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'MECHANICAL': return 'bg-blue-100 text-blue-800';
      case 'ELECTRONIC': return 'bg-yellow-100 text-yellow-800';
      case 'SOFTWARE': return 'bg-purple-100 text-purple-800';
      case 'BODYWORK': return 'bg-orange-100 text-orange-800';
      case 'OTHER': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'MECHANICAL': return 'Mécanique';
      case 'ELECTRONIC': return 'Électronique';
      case 'SOFTWARE': return 'Logiciel';
      case 'BODYWORK': return 'Carrosserie';
      case 'OTHER': return 'Autre';
      default: return type;
    }
  };

  const filteredRepairs = useMemo(() => {
    return repairs.filter((repair) => {
      if (filters.repairType && repair.repairType !== filters.repairType) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          repair.equipment?.name?.toLowerCase().includes(searchLower) ||
          repair.supplier?.toLowerCase().includes(searchLower) ||
          repair.technician?.toLowerCase().includes(searchLower) ||
          (repair.description && repair.description.toLowerCase().includes(searchLower)) ||
          (repair.partsReplaced && repair.partsReplaced.toLowerCase().includes(searchLower))
        );
      }
      return true;
    });
  }, [repairs, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredRepairs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRepairs = filteredRepairs.slice(startIndex, endIndex);

  const handleDeleteClick = (repair: Repair) => {
    setDeleteModal({ isOpen: true, repair });
  };
  
  const handleViewClick = (repair: Repair) => {
    setViewModal({ isOpen: true, repair });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.repair) {
      onDelete(deleteModal.repair.repairId);
      setDeleteModal({ isOpen: false, repair: null });
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
              Type de réparation
            </label>
            <select
              value={filters.repairType}
              onChange={(e) => setFilters({ ...filters, repairType: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="MECHANICAL">Mécanique</option>
              <option value="ELECTRONIC">Électronique</option>
              <option value="SOFTWARE">Logiciel</option>
              <option value="BODYWORK">Carrosserie</option>
              <option value="OTHER">Autre</option>
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
              setFilters({ repairType: '', search: '' });
              setCurrentPage(1);
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Réinitialiser les filtres
          </button>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {filteredRepairs.length} réparation(s) trouvée(s)
            </span>
            {/* Export Dropdown */}
            <ExportRepairDropdown repairs={filteredRepairs} />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {paginatedRepairs.map((repair) => (
          <div
            key={repair.repairId}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {repair.equipment?.name || `Équipement #${repair.equipmentId}`}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(repair.repairType)}`}>
                      {getTypeText(repair.repairType)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span>Date: {new Date(repair.repairDate).toLocaleDateString('fr-FR')}</span>
                    <span>•</span>
                    <span>Fournisseur: {repair.supplier}</span>
                    <span>•</span>
                    <span>Montant: {formatCurrency(repair.amount, repair.devise)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleViewClick(repair)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Voir"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(repair);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Modifier"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(repair);
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
                <span className="font-medium">{Math.min(endIndex, filteredRepairs.length)}</span> sur{' '}
                <span className="font-medium">{filteredRepairs.length}</span> résultats
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
        onClose={() => setDeleteModal({ isOpen: false, repair: null })}
        onConfirm={handleDeleteConfirm}
        itemName={deleteModal.repair ? `Réparation #${deleteModal.repair.repairId}` : ''}
        itemType="la réparation"
      />
      
      {/* View Details Modal */}
      <ViewDetailsModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, repair: null })}
        title="Détails de la Réparation"
        data={viewModal.repair || {}}
        fields={[
          { key: 'repairId', label: 'ID' },
          { key: 'equipment.name', label: 'Équipement', render: (val: any) => val || '-' },
          { key: 'repairDate', label: 'Date de réparation', render: (val: string) => val ? formatDate(val) : '-' },
          { key: 'repairType', label: 'Type de réparation' },
          { key: 'description', label: 'Description' },
          { key: 'amount', label: 'Montant', render: (val: number) => formatCurrency(val, viewModal.repair?.devise || 'EUR') },
          { key: 'devise', label: 'Devise' },
          { key: 'supplier', label: 'Fournisseur' },
          { key: 'technician', label: 'Technicien' },
          { key: 'partsReplaced', label: 'Pièces remplacées' },
          { key: 'warrantyPeriod', label: 'Période de garantie (jours)' },
          { key: 'Inserteridentity', label: 'Inserter Identity' },
          { key: 'InserterCountry', label: 'Inserter Country' },
          { key: 'createdAt', label: 'Créé le', render: (val: string) => val ? formatDate(val) : '-' },
          { key: 'updatedAt', label: 'Mis à jour le', render: (val: string) => val ? formatDate(val) : '-' }
        ]}
      />
    </div>
  );
};

export default RepairList;