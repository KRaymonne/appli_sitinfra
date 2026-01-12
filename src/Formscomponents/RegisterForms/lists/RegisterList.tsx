import React, { useState, useMemo } from 'react';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import ViewDetailsModal from './ViewDetailsModal';
import ExportRegisterDropdown from './ExportRegisterDropdown';

interface Register {
  registerId: number;
  registerName: string;
  location: string;
  responsiblename: string;
  userId?: number;
  currentBalance: number;
  attachmentfile?: string;
  createdAt: string;
  updatedAt: string;
  devise?: string; // Changed from currency to devise
  Inserteridentity?: string;
  InserterCountry?: string;
}

interface RegisterListProps {
  registers: Register[];
  onEdit: (register: Register) => void;
  onDelete: (id: number) => void;
  onView: (register: Register) => void;
}

const RegisterList: React.FC<RegisterListProps> = ({ registers, onEdit, onDelete, onView }) => {
  const [filters, setFilters] = useState({
    search: '',
    minBalance: '',
    maxBalance: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; register: Register | null }>({
    isOpen: false,
    register: null,
  });
  const [viewModal, setViewModal] = useState<{ isOpen: boolean; register: Register | null }>({
    isOpen: false,
    register: null,
  });

  const filteredRegisters = useMemo(() => {
    return registers.filter((register) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const responsibleName = register.responsiblename || '';
        if (
          !register.registerName.toLowerCase().includes(searchLower) &&
          !register.location.toLowerCase().includes(searchLower) &&
          !responsibleName.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }
      if (filters.minBalance && register.currentBalance < parseFloat(filters.minBalance)) return false;
      if (filters.maxBalance && register.currentBalance > parseFloat(filters.maxBalance)) return false;
      return true;
    });
  }, [registers, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredRegisters.length / itemsPerPage);
  const paginatedRegisters = filteredRegisters.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDeleteClick = (register: Register) => {
    setDeleteModal({ isOpen: true, register });
  };

  const handleViewClick = (register: Register) => {
    setViewModal({ isOpen: true, register });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.register) {
      onDelete(deleteModal.register.registerId);
    }
    setDeleteModal({ isOpen: false, register: null });
  };

  const formatCurrency = (amount: number, currency: string = 'XAF') => {
    return new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount) + ' ' + currency;
  };

  const getBalanceColor = (balance: number) => {
    if (balance < 0) return 'text-red-600';
    if (balance === 0) return 'text-gray-600';
    return 'text-green-600';
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
              placeholder="Nom, emplacement, responsable..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Min Balance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Solde minimum
            </label>
            <input
              type="number"
              placeholder="0"
              value={filters.minBalance}
              onChange={(e) => setFilters({ ...filters, minBalance: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Max Balance */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Solde maximum
            </label>
            <input
              type="number"
              placeholder="999999"
              value={filters.maxBalance}
              onChange={(e) => setFilters({ ...filters, maxBalance: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Results count and Export */}
        <div className="mt-3 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {filteredRegisters.length} caisse(s) trouvée(s)
          </div>
          {/* Export Dropdown */}
          <ExportRegisterDropdown registers={filteredRegisters} />
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {paginatedRegisters.map((register) => (
          <div
            key={register.registerId}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">{register.registerName}</h3>
                    <span className={`text-lg font-bold ${getBalanceColor(register.currentBalance)}`}>
                      {formatCurrency(register.currentBalance, register.devise)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {register.location}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {register.responsiblename}
                    </span>
                    {register.attachmentfile && (
                      <span className="flex items-center text-blue-600">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                        </svg>
                        Pièce jointe
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewClick(register);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Voir"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(register);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Modifier"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(register);
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
        <div className="flex justify-center items-center space-x-2 mt-4">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Précédent
          </button>
          <span className="text-sm text-gray-600">
            Page {currentPage} sur {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Suivant
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, register: null })}
        onConfirm={handleDeleteConfirm}
        itemName={deleteModal.register ? deleteModal.register.registerName : ''}
        itemType="la caisse"
      />
      
      {/* View Details Modal */}
      <ViewDetailsModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, register: null })}
        title="Détails de la Caisse"
        data={viewModal.register || {}}
        fields={[
          { key: 'registerId', label: 'ID' },
          { key: 'registerName', label: 'Nom de la caisse' },
          { key: 'location', label: 'Emplacement' },
          { key: 'responsiblename', label: 'Responsable' },
          { key: 'userId', label: 'ID Utilisateur' },
          { key: 'currentBalance', label: 'Solde actuel' },
          { key: 'devise', label: 'Devise' }, // Changed from currency to devise
          { key: 'attachmentfile', label: 'Pièce jointe' },
          { key: 'Inserteridentity', label: 'Inserter Identity' },
          { key: 'InserterCountry', label: 'Inserter Country' },
          { key: 'createdAt', label: 'Créé le' },
          { key: 'updatedAt', label: 'Mis à jour le' }
        ]}
      />
    </div>
  );
};

export default RegisterList;