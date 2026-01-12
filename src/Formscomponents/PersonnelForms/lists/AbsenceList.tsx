import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import ViewDetailsModal from './ViewDetailsModal';
import ExportAbsenceDropdown from './ExportAbsenceDropdown';

interface Absence {
  absenceId: number;
  userId: number;
  absenceType: string;
  description: string | null;
  startDate: string;
  endDate: string;
  daysCount: number;
  returnDate: string;
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

interface AbsenceListProps {
  absences: Absence[];
  onEdit: (absence: Absence) => void;
  onDelete: (id: number) => void;
  onView: (absence: Absence) => void;
}

const AbsenceList: React.FC<AbsenceListProps> = ({ absences, onEdit, onDelete, onView }) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    absenceType: '',
    search: '',
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; absence: Absence | null }>({
    isOpen: false,
    absence: null,
  });
  
  const [viewModal, setViewModal] = useState<{ isOpen: boolean; absence: Absence | null }>({
    isOpen: false,
    absence: null,
  });

  const formatDate = (date: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const filteredAbsences = useMemo(() => {
    return absences.filter((absence) => {
      if (filters.absenceType && absence.absenceType !== filters.absenceType) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          absence.user?.firstName?.toLowerCase().includes(searchLower) ||
          absence.user?.lastName?.toLowerCase().includes(searchLower) ||
          absence.absenceType?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [absences, filters]);

  const totalPages = Math.ceil(filteredAbsences.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAbsences = filteredAbsences.slice(startIndex, endIndex);

  const handleDeleteClick = (absence: Absence) => {
    setDeleteModal({ isOpen: true, absence });
  };

  const handleViewClick = (absence: Absence) => {
    setViewModal({ isOpen: true, absence });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.absence) {
      onDelete(deleteModal.absence.absenceId);
      setDeleteModal({ isOpen: false, absence: null });
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
              {t('personnel.lists.filters.type')}
            </label>
            <select
              value={filters.absenceType}
              onChange={(e) => setFilters({ ...filters, absenceType: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('personnel.lists.filters.all')}</option>
              <option value="SICK_LEAVE">{t('personnel.forms.options.absenceTypes.SICK_LEAVE')}</option>
              <option value="ANNUAL_LEAVE">{t('personnel.forms.options.absenceTypes.ANNUAL_LEAVE')}</option>
              <option value="MATERNITY_LEAVE">{t('personnel.forms.options.absenceTypes.MATERNITY_LEAVE')}</option>
              <option value="PATERNITY_LEAVE">{t('personnel.forms.options.absenceTypes.PATERNITY_LEAVE')}</option>
              <option value="UNPAID_LEAVE">{t('personnel.forms.options.absenceTypes.UNPAID_LEAVE')}</option>
              <option value="OTHER">{t('personnel.forms.options.absenceTypes.OTHER')}</option>
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
            {t('personnel.lists.filters.resultsCount', { count: filteredAbsences.length })}
          </div>
          {/* Export Dropdown */}
          <ExportAbsenceDropdown absences={filteredAbsences} />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('personnel.lists.columns.employee')}</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('personnel.lists.columns.absenceType')}</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('personnel.lists.columns.startDate')}</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('personnel.lists.columns.days')}</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('personnel.lists.columns.endDate')}</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('personnel.lists.columns.returnDate')}</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('personnel.lists.columns.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedAbsences.map((absence) => (
              <tr key={absence.absenceId} className="hover:bg-gray-50">
                <td className="px-3 py-2 text-sm text-gray-900">
                  {absence.user?.firstName} {absence.user?.lastName}
                </td>
                <td className="px-3 py-2 text-sm text-gray-900">{absence.absenceType}</td>
                <td className="px-3 py-2 text-sm text-gray-900">{formatDate(absence.startDate)}</td>
                <td className="px-3 py-2 text-sm text-gray-900">{absence.daysCount}</td>
                <td className="px-3 py-2 text-sm text-gray-900">{formatDate(absence.endDate)}</td>
                <td className="px-3 py-2 text-sm text-gray-900">{formatDate(absence.returnDate)}</td>
                <td className="px-3 py-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewClick(absence)}
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                      title={t('personnel.lists.actions.view')}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(absence)}
                      className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                      title={t('personnel.lists.actions.edit')}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(absence)}
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
              {t('personnel.lists.pagination.previous')}
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('personnel.lists.pagination.next')}
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                {t('personnel.lists.pagination.showing')} <span className="font-medium">{startIndex + 1}</span> {t('personnel.lists.pagination.to')}{' '}
                <span className="font-medium">{Math.min(endIndex, filteredAbsences.length)}</span> {t('personnel.lists.pagination.of')}{' '}
                <span className="font-medium">{filteredAbsences.length}</span> {t('personnel.lists.pagination.results')}
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('personnel.lists.pagination.previous')}
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
                  {t('personnel.lists.pagination.next')}
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, absence: null })}
        onConfirm={handleDeleteConfirm}
        itemName={deleteModal.absence ? `Absence de ${deleteModal.absence.user?.firstName} ${deleteModal.absence.user?.lastName}` : ''}
        itemType="l'absence"
      />

      {/* View Modal */}
      <ViewDetailsModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, absence: null })}
        title={t('personnel.lists.modals.viewTitle')}
        data={viewModal.absence || {}}
        fields={[
          { key: 'absenceId', label: t('personnel.lists.modals.fields.absenceId') },
          { key: 'user', label: t('personnel.forms.labels.employee'), render: (user: any) => user ? `${user.firstName} ${user.lastName}` : '-' },
          { key: 'absenceType', label: t('personnel.forms.labels.absenceType') },
          { key: 'description', label: t('personnel.forms.labels.description') },
          { key: 'supportingDocument', label: t('personnel.forms.labels.supportingDocument') },
          { key: 'startDate', label: t('personnel.forms.labels.startDate'), render: formatDate },
          { key: 'endDate', label: t('personnel.forms.labels.endDate'), render: formatDate },
          { key: 'daysCount', label: t('personnel.forms.labels.daysCount') },
          { key: 'returnDate', label: t('personnel.forms.labels.returnDate'), render: formatDate },
          { key: 'createdAt', label: t('personnel.lists.modals.fields.createdAt'), render: formatDate },
          { key: 'updatedAt', label: t('personnel.lists.modals.fields.updatedAt'), render: formatDate },
        ]}
      />
    </div>
  );
};

export default AbsenceList;

