import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import ViewDetailsModal from './ViewDetailsModal';
import ExportMedicalRecordDropdown from './ExportMedicalRecordDropdown';

interface MedicalRecord {
  medicalRecordsId: number;
  userId: number;
  visitDate: string;
  description: string | null;
  diagnosis: string | null;
  testsPerformed: string | null;
  testResults: string | null;
  prescribedAction: string | null;
  notes: string | null;
  nextVisitDate: string | null;
  medicalFile: string | null;
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

interface MedicalRecordListProps {
  medicalRecords: MedicalRecord[];
  onEdit: (record: MedicalRecord) => void;
  onDelete: (id: number) => void;
  onView: (record: MedicalRecord) => void;
}

const MedicalRecordList: React.FC<MedicalRecordListProps> = ({ medicalRecords, onEdit, onDelete, onView }) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    search: '',
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; record: MedicalRecord | null }>({
    isOpen: false,
    record: null,
  });
  
  const [viewModal, setViewModal] = useState<{ isOpen: boolean; record: MedicalRecord | null }>({
    isOpen: false,
    record: null,
  });

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const filteredRecords = useMemo(() => {
    return medicalRecords.filter((record) => {
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          record.user?.firstName?.toLowerCase().includes(searchLower) ||
          record.user?.lastName?.toLowerCase().includes(searchLower) ||
          record.description?.toLowerCase().includes(searchLower) ||
          record.diagnosis?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [medicalRecords, filters]);

  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedRecords = filteredRecords.slice(startIndex, endIndex);

  const handleDeleteClick = (record: MedicalRecord) => {
    setDeleteModal({ isOpen: true, record });
  };

  const handleViewClick = (record: MedicalRecord) => {
    setViewModal({ isOpen: true, record });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.record) {
      onDelete(deleteModal.record.medicalRecordsId);
      setDeleteModal({ isOpen: false, record: null });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            {t('personnel.lists.filters.resultsCountMedicalRecord', { count: filteredRecords.length })}
          </div>
          {/* Export Dropdown */}
          <ExportMedicalRecordDropdown medicalRecords={filteredRecords} />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('personnel.lists.tableHeaders.employee')}</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('personnel.lists.tableHeaders.visitDate')}</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('personnel.lists.messages.description')}</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('personnel.lists.tableHeaders.diagnosis')}</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('personnel.lists.tableHeaders.nextVisitDate')}</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('personnel.lists.tableHeaders.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedRecords.map((record) => (
              <tr key={record.medicalRecordsId} className="hover:bg-gray-50">
                <td className="px-3 py-2 text-sm text-gray-900">
                  {record.user?.firstName} {record.user?.lastName}
                </td>
                <td className="px-3 py-2 text-sm text-gray-900">{formatDate(record.visitDate)}</td>
                <td className="px-3 py-2 text-sm text-gray-900">{record.description || '-'}</td>
                <td className="px-3 py-2 text-sm text-gray-900">{record.diagnosis || '-'}</td>
                <td className="px-3 py-2 text-sm text-gray-900">{formatDate(record.nextVisitDate)}</td>
                <td className="px-3 py-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewClick(record)}
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                      title={t('personnel.lists.actions.view')}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(record)}
                      className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                      title={t('personnel.lists.actions.edit')}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(record)}
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
              <p className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: t('personnel.lists.messages.showingResults', { start: startIndex + 1, end: Math.min(endIndex, filteredRecords.length), total: filteredRecords.length }) }}></p>
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
        onClose={() => setDeleteModal({ isOpen: false, record: null })}
        onConfirm={handleDeleteConfirm}
        itemName={deleteModal.record ? `${deleteModal.record.user?.firstName} ${deleteModal.record.user?.lastName}` : ''}
        itemType={t('personnel.lists.messages.medicalRecord')}
      />

      {/* View Modal */}
      <ViewDetailsModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, record: null })}
        title={t('personnel.lists.messages.viewDetailsTitle', { itemType: t('personnel.lists.messages.medicalRecord') })}
        data={viewModal.record || {}}
        fields={[
          { key: 'medicalRecordsId', label: t('personnel.lists.messages.id') },
          { key: 'user', label: t('personnel.lists.tableHeaders.employee'), render: (user: any) => user ? `${user.firstName} ${user.lastName}` : '-' },
          { key: 'visitDate', label: t('personnel.lists.tableHeaders.visitDate'), render: formatDate },
          { key: 'description', label: t('personnel.lists.messages.description') },
          { key: 'diagnosis', label: t('personnel.lists.tableHeaders.diagnosis') },
          { key: 'testsPerformed', label: t('personnel.lists.messages.testsPerformed') },
          { key: 'testResults', label: t('personnel.lists.messages.testResults') },
          { key: 'prescribedAction', label: t('personnel.lists.messages.prescribedAction') },
          { key: 'notes', label: t('personnel.lists.messages.notes') },
          { key: 'nextVisitDate', label: t('personnel.lists.tableHeaders.nextVisitDate'), render: formatDate },
          { key: 'medicalFile', label: t('personnel.lists.messages.medicalFile') },
          { key: 'createdAt', label: t('personnel.lists.messages.createdAt'), render: formatDate },
          { key: 'updatedAt', label: t('personnel.lists.messages.updatedAt'), render: formatDate },
        ]}
      />
    </div>
  );
};

export default MedicalRecordList;

