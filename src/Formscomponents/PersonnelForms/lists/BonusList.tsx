import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import ViewDetailsModal from './ViewDetailsModal';
import ExportBonusDropdown from './ExportBonusDropdown';

interface Bonus {
  bonusId: number;
  userId: number;
  bonusType: string;
  amount: number;
  currency: string;
  awardDate: string;
  reason: string | null;
  paymentMethod: string;
  status: string;
  supportingDocument: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    employeeNumber: string;
    email: string;
  };
}

interface BonusListProps {
  bonuses: Bonus[];
  onEdit: (bonus: Bonus) => void;
  onDelete: (id: number) => void;
  onView: (bonus: Bonus) => void;
}

const BonusList: React.FC<BonusListProps> = ({ bonuses, onEdit, onDelete, onView }) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    bonusType: '',
    status: '',
    search: '',
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; bonus: Bonus | null }>({
    isOpen: false,
    bonus: null,
  });
  
  const [viewModal, setViewModal] = useState<{ isOpen: boolean; bonus: Bonus | null }>({
    isOpen: false,
    bonus: null,
  });

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPROVED': return t('personnel.forms.options.bonusStatus.APPROVED');
      case 'PENDING': return t('personnel.forms.options.bonusStatus.PENDING');
      case 'REJECTED': return t('personnel.forms.options.bonusStatus.REJECTED');
      default: return status;
    }
  };

  const filteredBonuses = useMemo(() => {
    return bonuses.filter((bonus) => {
      if (filters.bonusType && bonus.bonusType !== filters.bonusType) return false;
      if (filters.status && bonus.status !== filters.status) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          bonus.user?.firstName?.toLowerCase().includes(searchLower) ||
          bonus.user?.lastName?.toLowerCase().includes(searchLower) ||
          bonus.bonusType?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [bonuses, filters]);

  const totalPages = Math.ceil(filteredBonuses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBonuses = filteredBonuses.slice(startIndex, endIndex);

  const handleDeleteClick = (bonus: Bonus) => {
    setDeleteModal({ isOpen: true, bonus });
  };

  const handleViewClick = (bonus: Bonus) => {
    setViewModal({ isOpen: true, bonus });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.bonus) {
      onDelete(deleteModal.bonus.bonusId);
      setDeleteModal({ isOpen: false, bonus: null });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('personnel.lists.filters.search')}
            </label>
            <input
              type="text"
              placeholder={t('personnel.lists.filters.searchPlaceholder')}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('personnel.lists.filters.bonusType')}
            </label>
            <select
              value={filters.bonusType}
              onChange={(e) => setFilters({ ...filters, bonusType: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('personnel.lists.filters.all')}</option>
              <option value="PERFORMANCE">{t('personnel.forms.options.bonusTypes.PERFORMANCE')}</option>
              <option value="SENIORITY">{t('personnel.forms.options.bonusTypes.SENIORITY')}</option>
              <option value="SPECIAL">{t('personnel.forms.options.bonusTypes.SPECIAL')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('personnel.lists.filters.status')}
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('personnel.lists.filters.all')}</option>
              <option value="APPROVED">{t('personnel.forms.options.bonusStatus.APPROVED')}</option>
              <option value="PENDING">{t('personnel.forms.options.bonusStatus.PENDING')}</option>
              <option value="REJECTED">{t('personnel.forms.options.bonusStatus.REJECTED')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('personnel.lists.filters.itemsPerPage')}
            </label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
        
        {/* Results count and Export */}
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {t('personnel.lists.messages.resultsFound', { count: filteredBonuses.length })}
          </div>
          {/* Export Dropdown */}
          <ExportBonusDropdown bonuses={filteredBonuses} />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('personnel.lists.tableHeaders.employee')}</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('personnel.lists.tableHeaders.bonusType')}</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('personnel.lists.tableHeaders.amount')}</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('personnel.lists.tableHeaders.awardDate')}</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('personnel.lists.tableHeaders.status')}</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('personnel.lists.tableHeaders.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedBonuses.map((bonus) => (
              <tr key={bonus.bonusId} className="hover:bg-gray-50">
                <td className="px-3 py-2 text-sm text-gray-900">
                  {bonus.user?.firstName} {bonus.user?.lastName}
                </td>
                <td className="px-3 py-2 text-sm text-gray-900">{bonus.bonusType}</td>
                <td className="px-3 py-2 text-sm text-gray-900">{formatCurrency(bonus.amount, bonus.currency)}</td>
                <td className="px-3 py-2 text-sm text-gray-900">{formatDate(bonus.awardDate)}</td>
                <td className="px-3 py-2 text-sm">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(bonus.status)}`}>
                    {getStatusText(bonus.status)}
                  </span>
                </td>
                <td className="px-3 py-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewClick(bonus)}
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                      title={t('personnel.lists.actions.view')}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(bonus)}
                      className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                      title={t('personnel.lists.actions.edit')}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(bonus)}
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                      title={t('personnel.lists.actions.delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
              {t('personnel.lists.messages.previous')}
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('personnel.lists.messages.next')}
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: t('personnel.lists.messages.showingResults', { start: startIndex + 1, end: Math.min(endIndex, filteredBonuses.length), total: filteredBonuses.length }) }}></p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('personnel.lists.messages.previous')}
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
                  {t('personnel.lists.messages.next')}
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, bonus: null })}
        onConfirm={handleDeleteConfirm}
        itemName={deleteModal.bonus ? `Prime de ${deleteModal.bonus.user?.firstName} ${deleteModal.bonus.user?.lastName}` : ''}
        itemType={t('personnel.lists.messages.bonus')}
      />

      {/* View Modal */}
      <ViewDetailsModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, bonus: null })}
        title={t('personnel.lists.messages.viewDetailsTitle', { itemType: t('personnel.lists.messages.bonus') })}
        data={viewModal.bonus || {}}
        fields={[
            { key: 'bonusId', label: t('personnel.lists.messages.id') },
            { key: 'user', label: t('personnel.lists.tableHeaders.employee'), render: (user: any) => user ? `${user.firstName} ${user.lastName}` : '-' },
            { key: 'bonusType', label: t('personnel.lists.tableHeaders.bonusType') },
            { key: 'amount', label: t('personnel.lists.tableHeaders.amount'), render: (val: number) => viewModal.bonus ? formatCurrency(val, viewModal.bonus.currency) : '-' },
            { key: 'currency', label: t('personnel.lists.tableHeaders.currency') },
            { key: 'awardDate', label: t('personnel.lists.tableHeaders.awardDate'), render: formatDate },
            { key: 'reason', label: t('personnel.lists.tableHeaders.reason') },
            { key: 'paymentMethod', label: t('personnel.lists.tableHeaders.paymentMethod') },
            { key: 'status', label: t('personnel.lists.tableHeaders.status'), render: (val: string) => (
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(val)}`}>
                {getStatusText(val)}
              </span>
            )},
            { key: 'supportingDocument', label: t('personnel.lists.messages.document') },
            { key: 'createdAt', label: t('personnel.lists.messages.createdAt'), render: formatDate },
            { key: 'updatedAt', label: t('personnel.lists.messages.updatedAt'), render: formatDate },
          ]}
        />
    </div>
  );
};

export default BonusList;

