import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import ViewDetailsModal from './ViewDetailsModal';
import ExportSanctionDropdown from './ExportSanctionDropdown';

interface Sanction {
  sanctionId: number;
  userId: number;
  sanctionType: string;
  reason: string;
  sanctionDate: string;
  durationDays: number | null;
  decision: string | null;
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

interface SanctionListProps {
  sanctions: Sanction[];
  onEdit: (sanction: Sanction) => void;
  onDelete: (id: number) => void;
  onView: (sanction: Sanction) => void;
}

const SanctionList: React.FC<SanctionListProps> = ({ sanctions, onEdit, onDelete, onView }) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    sanctionType: '',
    search: '',
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; sanction: Sanction | null }>({
    isOpen: false,
    sanction: null,
  });
  
  const [viewModal, setViewModal] = useState<{ isOpen: boolean; sanction: Sanction | null }>({
    isOpen: false,
    sanction: null,
  });

  const formatDate = (date: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const filteredSanctions = useMemo(() => {
    return sanctions.filter((sanction) => {
      if (filters.sanctionType && sanction.sanctionType !== filters.sanctionType) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          sanction.user?.firstName?.toLowerCase().includes(searchLower) ||
          sanction.user?.lastName?.toLowerCase().includes(searchLower) ||
          sanction.sanctionType?.toLowerCase().includes(searchLower) ||
          sanction.reason?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [sanctions, filters]);

  const totalPages = Math.ceil(filteredSanctions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedSanctions = filteredSanctions.slice(startIndex, endIndex);

  const handleDeleteClick = (sanction: Sanction) => {
    setDeleteModal({ isOpen: true, sanction });
  };

  const handleViewClick = (sanction: Sanction) => {
    setViewModal({ isOpen: true, sanction });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.sanction) {
      onDelete(deleteModal.sanction.sanctionId);
      setDeleteModal({ isOpen: false, sanction: null });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              {t('personnel.lists.filters.sanctionType')}
            </label>
            <select
              value={filters.sanctionType}
              onChange={(e) => setFilters({ ...filters, sanctionType: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('personnel.lists.filters.all')}</option>
              <option value="WARNING">{t('personnel.forms.options.sanctionTypes.WARNING')}</option>
              <option value="SUSPENSION">{t('personnel.forms.options.sanctionTypes.SUSPENSION')}</option>
              <option value="DEMOTION">{t('personnel.forms.options.sanctionTypes.DEMOTION')}</option>
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
            {t('personnel.lists.filters.resultsCountSanction', { count: filteredSanctions.length })}
          </div>
          {/* Export Dropdown */}
          <ExportSanctionDropdown sanctions={filteredSanctions} />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('personnel.lists.tableHeaders.employee')}</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('personnel.lists.tableHeaders.sanctionType')}</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('personnel.lists.tableHeaders.reason')}</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('personnel.lists.tableHeaders.sanctionDate')}</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('personnel.lists.tableHeaders.durationDays')}</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('personnel.lists.tableHeaders.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedSanctions.map((sanction) => (
              <tr key={sanction.sanctionId} className="hover:bg-gray-50">
                <td className="px-3 py-2 text-sm text-gray-900">
                  {sanction.user?.firstName} {sanction.user?.lastName}
                </td>
                <td className="px-3 py-2 text-sm text-gray-900">
                  {sanction.sanctionType === 'WARNING' ? t('personnel.forms.options.sanctionTypes.WARNING') :
                   sanction.sanctionType === 'SUSPENSION' ? t('personnel.forms.options.sanctionTypes.SUSPENSION') :
                   sanction.sanctionType === 'DEMOTION' ? t('personnel.forms.options.sanctionTypes.DEMOTION') :
                   sanction.sanctionType}
                </td>
                <td className="px-3 py-2 text-sm text-gray-900">{sanction.reason}</td>
                <td className="px-3 py-2 text-sm text-gray-900">{formatDate(sanction.sanctionDate)}</td>
                <td className="px-3 py-2 text-sm text-gray-900">{sanction.durationDays ? `${sanction.durationDays} ${t('personnel.lists.tableHeaders.durationDays').toLowerCase()}` : '-'}</td>
                <td className="px-3 py-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewClick(sanction)}
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                      title={t('personnel.lists.actions.view')}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(sanction)}
                      className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                      title={t('personnel.lists.actions.edit')}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(sanction)}
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
              <p className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: t('personnel.lists.messages.showingResults', { start: startIndex + 1, end: Math.min(endIndex, filteredSanctions.length), total: filteredSanctions.length }) }}></p>
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
        onClose={() => setDeleteModal({ isOpen: false, sanction: null })}
        onConfirm={handleDeleteConfirm}
        itemName={deleteModal.sanction ? `${deleteModal.sanction.user?.firstName} ${deleteModal.sanction.user?.lastName}` : ''}
        itemType={t('personnel.lists.messages.sanction')}
      />

      {/* View Modal */}
      <ViewDetailsModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, sanction: null })}
        title={t('personnel.lists.messages.viewDetailsTitle', { itemType: t('personnel.lists.messages.sanction') })}
        data={viewModal.sanction || {}}
        fields={[
          { key: 'sanctionId', label: t('personnel.lists.messages.id') },
          { key: 'user', label: t('personnel.lists.tableHeaders.employee'), render: (user: any) => user ? `${user.firstName} ${user.lastName}` : '-' },
          { key: 'sanctionType', label: t('personnel.lists.tableHeaders.sanctionType'), render: (val: string) => 
            val === 'WARNING' ? t('personnel.forms.options.sanctionTypes.WARNING') :
            val === 'SUSPENSION' ? t('personnel.forms.options.sanctionTypes.SUSPENSION') :
            val === 'DEMOTION' ? t('personnel.forms.options.sanctionTypes.DEMOTION') : val
          },
          { key: 'reason', label: t('personnel.lists.tableHeaders.reason') },
          { key: 'sanctionDate', label: t('personnel.lists.tableHeaders.sanctionDate'), render: formatDate },
          { key: 'durationDays', label: t('personnel.lists.tableHeaders.durationDays') },
          { key: 'decision', label: t('personnel.lists.tableHeaders.decision') },
          { key: 'supportingDocument', label: t('personnel.lists.messages.document') },
          { key: 'createdAt', label: t('personnel.lists.messages.createdAt'), render: formatDate },
          { key: 'updatedAt', label: t('personnel.lists.messages.updatedAt'), render: formatDate },
        ]}
      />
    </div>
  );
};

export default SanctionList;

