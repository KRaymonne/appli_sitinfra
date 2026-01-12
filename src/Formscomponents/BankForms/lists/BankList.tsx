import React, { useState, useMemo } from 'react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import BankViewModal from './BankViewModal';

interface Bank {
  bankId: number;
  name: string;
  type: string;
  balance: number;
  devise: string;
  attachment?: string;
  createdAt: string;
  updatedAt: string;
}

interface BankListProps {
  banks: Bank[];
  onEdit: (bank: Bank) => void;
  onDelete: (id: number) => void;
  onView: (bank: Bank) => void; // This will now show the form
}

const BankList: React.FC<BankListProps> = ({ banks, onEdit, onDelete, onView }) => {
  const [filters, setFilters] = useState({
    type: '',
    search: '',
    devise: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; bank: Bank | null }>({
    isOpen: false,
    bank: null,
  });
  const [viewModal, setViewModal] = useState<{ isOpen: boolean; bank: Bank | null }>({
    isOpen: false,
    bank: null,
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'CHECKING_ACCOUNT': return 'bg-blue-100 text-blue-800';
      case 'SAVINGS_ACCOUNT': return 'bg-green-100 text-green-800';
      case 'PROJECT_ACCOUNT': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'CHECKING_ACCOUNT': return 'Compte courant';
      case 'SAVINGS_ACCOUNT': return 'Compte épargne';
      case 'PROJECT_ACCOUNT': return 'Compte projet';
      default: return type;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredBanks = useMemo(() => {
    return banks.filter((bank) => {
      if (filters.type && bank.type !== filters.type) return false;
      if (filters.devise && bank.devise !== filters.devise) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return bank.name.toLowerCase().includes(searchLower);
      }
      return true;
    });
  }, [banks, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredBanks.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBanks = filteredBanks.slice(startIndex, endIndex);

  const handleDeleteClick = (bank: Bank) => {
    setDeleteModal({ isOpen: true, bank });
  };

  const handleViewClick = (bank: Bank) => {
    setViewModal({ isOpen: true, bank });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.bank) {
      onDelete(deleteModal.bank.bankId);
      setDeleteModal({ isOpen: false, bank: null });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-4">
      {/* Filters Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rechercher
            </label>
            <input
              type="text"
              placeholder="Nom du compte..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="CHECKING_ACCOUNT">Compte courant</option>
              <option value="SAVINGS_ACCOUNT">Compte épargne</option>
              <option value="PROJECT_ACCOUNT">Compte projet</option>
            </select>
          </div>

          {/* Currency Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Devise
            </label>
            <select
              value={filters.devise}
              onChange={(e) => setFilters({ ...filters, devise: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes</option>
              <option value="XAF">Franc CFA BEAC (XAF)</option>
              <option value="XOF">Franc CFA UEMOA (XOF)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="GNF">Franc Guinéen (GNF)</option>
              <option value="GHS">Cedi Ghanéen (GHS)</option>
              <option value="RON">Leu Roumain (RON)</option>
              <option value="SLE">Leone (SLE)</option>
              <option value="USD">Dollar Américain (USD)</option>
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

        {/* Reset Filters */}
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => {
              setFilters({ type: '', search: '', devise: '' });
              setCurrentPage(1);
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Réinitialiser les filtres
          </button>
          <span className="text-sm text-gray-600">
            {filteredBanks.length} compte(s) trouvé(s)
          </span>
        </div>
      </div>

      {/* Export Excel Dropdown */}
      <div className="mb-4 flex justify-end">
        <ExportBankDropdown banks={filteredBanks} />
      </div>

      {/* List */}
      <div className="space-y-3">
        {paginatedBanks.map((bank) => (
          <div
            key={bank.bankId}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onView(bank)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">{bank.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(bank.type)}`}>
                      {getTypeText(bank.type)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span className="flex items-center font-semibold text-green-600">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatCurrency(bank.balance, bank.devise)}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      {bank.devise}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewClick(bank);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Voir plus"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(bank);
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
                    handleDeleteClick(bank);
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
                <span className="font-medium">{Math.min(endIndex, filteredBanks.length)}</span> sur{' '}
                <span className="font-medium">{filteredBanks.length}</span> résultats
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
        onClose={() => setDeleteModal({ isOpen: false, bank: null })}
        onConfirm={handleDeleteConfirm}
        itemName={deleteModal.bank ? deleteModal.bank.name : ''}
        itemType="le compte"
      />
      
      {/* View Details Modal */}
      <BankViewModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, bank: null })}
        bank={viewModal.bank}
      />
    </div>
  );
};

import { exportBanksToExcel, exportBanksToPDF, exportBanksToCSV, Bank as BankType } from '../../../utils/exportBankUtils';

const ExportBankDropdown: React.FC<{ banks: BankType[] }> = ({ banks }) => {
  const [open, setOpen] = React.useState(false);
  const [selectedMonth, setSelectedMonth] = React.useState<string>('');
  const [selectedYear, setSelectedYear] = React.useState<string>('');

  // Extraire les mois et années disponibles dans les banques
  const months = React.useMemo(() => {
    const ms = new Set<string>();
    banks.forEach(b => {
      const d = new Date(b.createdAt);
      ms.add((d.getMonth() + 1).toString().padStart(2, '0'));
    });
    return Array.from(ms);
  }, [banks]);
  const years = React.useMemo(() => {
    const ys = new Set<string>();
    banks.forEach(b => {
      const d = new Date(b.createdAt);
      ys.add(d.getFullYear().toString());
    });
    return Array.from(ys);
  }, [banks]);

  // Filtrer les banques selon le mois et l'année sélectionnés
  const filtered = React.useMemo(() => {
    return banks.filter(b => {
      const d = new Date(b.createdAt);
      const m = (d.getMonth() + 1).toString().padStart(2, '0');
      const y = d.getFullYear().toString();
      return (!selectedMonth || m === selectedMonth) && (!selectedYear || y === selectedYear);
    });
  }, [banks, selectedMonth, selectedYear]);

  const handleExport = (type: 'pdf' | 'excel' | 'csv') => {
    if (!filtered || filtered.length === 0) return;
    if (type === 'pdf') exportBanksToPDF(filtered);
    if (type === 'excel') exportBanksToExcel(filtered);
    if (type === 'csv') exportBanksToCSV(filtered);
    setOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
        onClick={() => setOpen((o) => !o)}
        title="Télécharger les comptes bancaires"
      >
        Télécharger ▼
      </button>
      {open && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-2 px-3 border-b border-gray-100 flex gap-2">
            <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="border rounded px-2 py-1 text-sm">
              <option value="">Mois</option>
              {months.sort().map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="border rounded px-2 py-1 text-sm">
              <option value="">Année</option>
              {years.sort().map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="py-1">
            <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onClick={() => handleExport('pdf')}>PDF</button>
            <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onClick={() => handleExport('excel')}>Excel</button>
            <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onClick={() => handleExport('csv')}>CSV</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankList;
