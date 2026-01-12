import React, { useState, useMemo } from 'react';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import ViewDetailsModal from './ViewDetailsModal';
import ExportEquipmentExpenseDropdown from './ExportEquipmentExpenseDropdown';

interface EquipmentExpense {
  expenseId: number;
  equipmentId: number;
  expenseDate: string;
  expenseType: string;
  description?: string;
  amount: number;
  supplier?: string;
  invoiceNumber?: string;
  devise: string;
  equipment?: any;
  createdAt?: string;
  updatedAt?: string;
}

interface EquipmentExpenseListProps {
  expenses: EquipmentExpense[];
  onEdit: (expense: EquipmentExpense) => void;
  onDelete: (id: number) => void;
  onView: (expense: EquipmentExpense) => void;
}

const EquipmentExpenseList: React.FC<EquipmentExpenseListProps> = ({ expenses, onEdit, onDelete, onView }) => {
  const [filters, setFilters] = useState({
    expenseType: '',
    search: '',
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; expense: EquipmentExpense | null }>({
    isOpen: false,
    expense: null,
  });
  
  const [viewModal, setViewModal] = useState<{ isOpen: boolean; expense: EquipmentExpense | null }>({
    isOpen: false,
    expense: null,
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PURCHASE': return 'bg-green-100 text-green-800';
      case 'MAINTENANCE': return 'bg-blue-100 text-blue-800';
      case 'REPAIR': return 'bg-red-100 text-red-800';
      case 'REVISION': return 'bg-yellow-100 text-yellow-800';
      case 'CALIBRATION': return 'bg-purple-100 text-purple-800';
      case 'OTHER': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'PURCHASE': return 'Achat';
      case 'MAINTENANCE': return 'Maintenance';
      case 'REPAIR': return 'Réparation';
      case 'REVISION': return 'Révision';
      case 'CALIBRATION': return 'Calibration';
      case 'OTHER': return 'Autre';
      default: return type;
    }
  };

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      if (filters.expenseType && expense.expenseType !== filters.expenseType) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          expense.equipment?.name?.toLowerCase().includes(searchLower) ||
          expense.supplier?.toLowerCase().includes(searchLower) ||
          expense.invoiceNumber?.toLowerCase().includes(searchLower) ||
          (expense.description && expense.description.toLowerCase().includes(searchLower))
        );
      }
      return true;
    });
  }, [expenses, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedExpenses = filteredExpenses.slice(startIndex, endIndex);

  const handleDeleteClick = (expense: EquipmentExpense) => {
    setDeleteModal({ isOpen: true, expense });
  };
  
  const handleViewClick = (expense: EquipmentExpense) => {
    setViewModal({ isOpen: true, expense });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.expense) {
      onDelete(deleteModal.expense.expenseId);
      setDeleteModal({ isOpen: false, expense: null });
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
              placeholder="Équipement, fournisseur, facture..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de dépense
            </label>
            <select
              value={filters.expenseType}
              onChange={(e) => setFilters({ ...filters, expenseType: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="PURCHASE">Achat</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="REPAIR">Réparation</option>
              <option value="REVISION">Révision</option>
              <option value="CALIBRATION">Calibration</option>
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
              setFilters({ expenseType: '', search: '' });
              setCurrentPage(1);
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Réinitialiser les filtres
          </button>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {filteredExpenses.length} dépense(s) trouvée(s)
            </span>
            {/* Export Dropdown */}
            <ExportEquipmentExpenseDropdown expenses={filteredExpenses} />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {paginatedExpenses.map((expense) => (
          <div
            key={expense.expenseId}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {expense.equipment?.name || `Équipement #${expense.equipmentId}`}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(expense.expenseType)}`}>
                      {getTypeText(expense.expenseType)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span>Date: {new Date(expense.expenseDate).toLocaleDateString('fr-FR')}</span>
                    <span>•</span>
                    {expense.supplier && (
                      <>
                        <span>Fournisseur: {expense.supplier}</span>
                        <span>•</span>
                      </>
                    )}
                    <span>Montant: {formatCurrency(expense.amount, expense.devise)}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleViewClick(expense)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Voir"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(expense);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Modifier"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(expense);
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
                <span className="font-medium">{Math.min(endIndex, filteredExpenses.length)}</span> sur{' '}
                <span className="font-medium">{filteredExpenses.length}</span> résultats
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
        onClose={() => setDeleteModal({ isOpen: false, expense: null })}
        onConfirm={handleDeleteConfirm}
        itemName={deleteModal.expense ? `Dépense #${deleteModal.expense.expenseId}` : ''}
        itemType="la dépense"
      />
      
      {/* View Details Modal */}
      <ViewDetailsModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, expense: null })}
        title="Détails de la Dépense"
        data={viewModal.expense || {}}
        fields={[
          { key: 'expenseId', label: 'ID' },
          { key: 'equipment.name', label: 'Équipement', render: (val: any) => val || '-' },
          { key: 'expenseDate', label: 'Date de dépense', render: (val: string) => val ? formatDate(val) : '-' },
          { key: 'expenseType', label: 'Type de dépense' },
          { key: 'description', label: 'Description' },
          { key: 'amount', label: 'Montant', render: (val: number) => formatCurrency(val, viewModal.expense?.devise || 'EUR') },
          { key: 'devise', label: 'Devise' },
          { key: 'supplier', label: 'Fournisseur' },
          { key: 'invoiceNumber', label: 'Numéro de facture' },
          { key: 'Inserteridentity', label: 'Inserter Identity' },
          { key: 'InserterCountry', label: 'Inserter Country' },
          { key: 'createdAt', label: 'Créé le', render: (val: string) => val ? formatDate(val) : '-' },
          { key: 'updatedAt', label: 'Mis à jour le', render: (val: string) => val ? formatDate(val) : '-' }
        ]}
      />
    </div>
  );
};

export default EquipmentExpenseList;