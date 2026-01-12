import React, { useState, useMemo } from 'react';
import { Eye } from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import ViewDetailsModal from './ViewDetailsModal';
import ExportTransactionDropdown from './ExportTransactionDropdown';

interface Transaction {
  transactionId: number;
  registerId: number;
  transactionType: string;
  amount: number;
  description?: string;
  expenseType?: string;
  referenceNumber?: string;
  receiptNumber?: string;
  transactionDate: string;
  serviceProvider?: string;
  supplyType?: string;
  attachment?: string;
  devise: string;
  createdAt: string;
  updatedAt: string;
  Inserteridentity?: string;
  InserterCountry?: string;
  register?: {
    registerName: string;
  };
}

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: number) => void;
  onView: (transaction: Transaction) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onEdit, onDelete, onView }) => {
  const [filters, setFilters] = useState({
    transactionType: '',
    search: '',
    startDate: '',
    endDate: '',
    expenseType: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; transaction: Transaction | null }>({
    isOpen: false,
    transaction: null,
  });
  const [viewModal, setViewModal] = useState<{ isOpen: boolean; transaction: Transaction | null }>({
    isOpen: false,
    transaction: null,
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'INCOME': return 'bg-green-100 text-green-800';
      case 'EXPENSE': return 'bg-red-100 text-red-800';
      case 'TRANSFER_OUT': return 'bg-orange-100 text-orange-800';
      case 'TRANSFER_IN': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'INCOME': return 'Revenu';
      case 'EXPENSE': return 'Dépense';
      case 'TRANSFER_OUT': return 'Transfert sortant';
      case 'TRANSFER_IN': return 'Transfert entrant';
      default: return type;
    }
  };

  const getExpenseTypeText = (type: string) => {
    switch (type) {
      case 'MTN_PHONE': return 'MTN Téléphone';
      case 'CUSTOMS': return 'Douanes';
      case 'TRANSPORT': return 'Transport';
      case 'TENDER_DOCUMENTS': return "Documents d'appel d'offres";
      case 'ADVERTISING': return 'Publicité';
      case 'INSURANCE': return 'Assurance';
      case 'MISCELLANEOUS': return 'Divers';
      default: return type;
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      if (filters.transactionType && transaction.transactionType !== filters.transactionType) return false;
      if (filters.expenseType && transaction.expenseType !== filters.expenseType) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const registerName = transaction.register?.registerName || '';
        if (
          !(transaction.description?.toLowerCase().includes(searchLower) ||
          registerName.toLowerCase().includes(searchLower) ||
          transaction.serviceProvider?.toLowerCase().includes(searchLower) ||
          transaction.referenceNumber?.toLowerCase().includes(searchLower) ||
          transaction.receiptNumber?.toLowerCase().includes(searchLower))
        ) {
          return false;
        }
      }
      if (filters.startDate) {
        const transDate = new Date(transaction.transactionDate);
        const startDate = new Date(filters.startDate);
        if (transDate < startDate) return false;
      }
      if (filters.endDate) {
        const transDate = new Date(transaction.transactionDate);
        const endDate = new Date(filters.endDate);
        if (transDate > endDate) return false;
      }
      return true;
    });
  }, [transactions, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleDeleteClick = (transaction: Transaction) => {
    setDeleteModal({ isOpen: true, transaction });
  };

  const handleViewClick = (transaction: Transaction) => {
    setViewModal({ isOpen: true, transaction });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.transaction) {
      onDelete(deleteModal.transaction.transactionId);
    }
    setDeleteModal({ isOpen: false, transaction: null });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return `${new Intl.NumberFormat('fr-FR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)} ${currency}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
              placeholder="Description, caisse, référence..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de transaction
            </label>
            <select
              value={filters.transactionType}
              onChange={(e) => setFilters({ ...filters, transactionType: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="INCOME">Revenu</option>
              <option value="EXPENSE">Dépense</option>
              <option value="TRANSFER_OUT">Transfert sortant</option>
              <option value="TRANSFER_IN">Transfert entrant</option>
            </select>
          </div>

          {/* Expense Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie de dépense
            </label>
            <select
              value={filters.expenseType}
              onChange={(e) => setFilters({ ...filters, expenseType: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes</option>
              <option value="MTN_PHONE">MTN Téléphone</option>
              <option value="CUSTOMS">Douanes</option>
              <option value="TRANSPORT">Transport</option>
              <option value="TENDER_DOCUMENTS">Documents d'appel d'offres</option>
              <option value="ADVERTISING">Publicité</option>
              <option value="INSURANCE">Assurance</option>
              <option value="MISCELLANEOUS">Divers</option>
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de début
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date de fin
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Results count */}
        <div className="mt-3 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {filteredTransactions.length} transaction(s) trouvée(s)
          </div>
          {/* Export Dropdown */}
          <ExportTransactionDropdown transactions={filteredTransactions} />
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {paginatedTransactions.map((transaction) => (
          <div
            key={transaction.transactionId}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onView(transaction)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 flex-1">
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    transaction.transactionType === 'INCOME' ? 'bg-green-100' :
                    transaction.transactionType === 'EXPENSE' ? 'bg-red-100' : 'bg-blue-100'
                  }`}>
                    <svg className={`w-6 h-6 ${
                      transaction.transactionType === 'INCOME' ? 'text-green-600' :
                      transaction.transactionType === 'EXPENSE' ? 'text-red-600' : 'text-blue-600'
                    }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {transaction.transactionType === 'INCOME' ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11l5-5m0 0l5 5m-5-5v12" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 13l-5 5m0 0l-5-5m5 5V6" />
                      )}
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(transaction.transactionType)}`}>
                      {getTypeText(transaction.transactionType)}
                    </span>
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(transaction.amount, transaction.devise)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1 flex-wrap">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(transaction.transactionDate)}
                    </span>
                    {transaction.register && (
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        {transaction.register.registerName}
                      </span>
                    )}
                    {transaction.expenseType && (
                      <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                        {getExpenseTypeText(transaction.expenseType)}
                      </span>
                    )}
                    {transaction.description && (
                      <span className="text-gray-600 italic truncate max-w-xs">
                        {transaction.description}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewClick(transaction);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Voir"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(transaction);
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
                    handleDeleteClick(transaction);
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
        onClose={() => setDeleteModal({ isOpen: false, transaction: null })}
        onConfirm={handleDeleteConfirm}
        itemName={deleteModal.transaction ? `Transaction #${deleteModal.transaction.transactionId}` : ''}
        itemType="la transaction"
      />
      
      {/* View Details Modal */}
      <ViewDetailsModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, transaction: null })}
        title="Détails de la Transaction"
        data={viewModal.transaction || {}}
        fields={[
          { key: 'transactionId', label: 'ID' },
          { key: 'registerId', label: 'ID Caisse' },
          { key: 'transactionType', label: 'Type de transaction' },
          { key: 'amount', label: 'Montant' },
          { key: 'devise', label: 'Devise' },
          { key: 'description', label: 'Description' },
          { key: 'expenseType', label: 'Catégorie de dépense' },
          { key: 'referenceNumber', label: 'Numéro de référence' },
          { key: 'receiptNumber', label: 'Numéro de reçu' },
          { key: 'transactionDate', label: 'Date de transaction' },
          { key: 'serviceProvider', label: 'Fournisseur de service' },
          { key: 'supplyType', label: 'Type d\'approvisionnement' },
          { key: 'attachment', label: 'Pièce jointe' },
          { key: 'Inserteridentity', label: 'Inserter Identity' },
          { key: 'InserterCountry', label: 'Inserter Country' },
          { key: 'createdAt', label: 'Créé le' },
          { key: 'updatedAt', label: 'Mis à jour le' }
        ]}
      />
    </div>
  );
};

export default TransactionList;

