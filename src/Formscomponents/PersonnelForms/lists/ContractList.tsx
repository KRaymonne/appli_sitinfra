import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import ViewDetailsModal from './ViewDetailsModal';
import ExportContractDropdown from './ExportContractDropdown';

interface Contract {
  contractId: number;
  userId: number;
  contractType: string;
  startDate: string;
  endDate: string | null;
  post: string;
  department: string;
  unit: string | null;
  grossSalary: number;
  netSalary: number;
  currency: string;
  contractFile: string | null;
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

interface ContractListProps {
  contracts: Contract[];
  onEdit: (contract: Contract) => void;
  onDelete: (id: number) => void;
  onView: (contract: Contract) => void;
}

const ContractList: React.FC<ContractListProps> = ({ contracts, onEdit, onDelete, onView }) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    contractType: '',
    department: '',
    search: '',
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; contract: Contract | null }>({
    isOpen: false,
    contract: null,
  });
  
  const [viewModal, setViewModal] = useState<{ isOpen: boolean; contract: Contract | null }>({
    isOpen: false,
    contract: null,
  });

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const getContractTypeText = (type: string) => {
    switch (type) {
      case 'PERMANENT_CONTRACT_CDI': return t('personnel.forms.options.contractTypes.PERMANENT_CONTRACT_CDI');
      case 'FIXED_TERM_CONTRACT_CDD': return t('personnel.forms.options.contractTypes.FIXED_TERM_CONTRACT_CDD');
      case 'INTERNSHIP': return t('personnel.forms.options.contractTypes.INTERNSHIP');
      case 'CONSULTANT': return t('personnel.forms.options.contractTypes.CONSULTANT');
      default: return type;
    }
  };

  const filteredContracts = useMemo(() => {
    return contracts.filter((contract) => {
      if (filters.contractType && contract.contractType !== filters.contractType) return false;
      if (filters.department && contract.department !== filters.department) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          contract.user?.firstName?.toLowerCase().includes(searchLower) ||
          contract.user?.lastName?.toLowerCase().includes(searchLower) ||
          contract.contractType?.toLowerCase().includes(searchLower) ||
          contract.department?.toLowerCase().includes(searchLower) ||
          contract.post?.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [contracts, filters]);

  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedContracts = filteredContracts.slice(startIndex, endIndex);

  const handleDeleteClick = (contract: Contract) => {
    setDeleteModal({ isOpen: true, contract });
  };

  const handleViewClick = (contract: Contract) => {
    setViewModal({ isOpen: true, contract });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.contract) {
      onDelete(deleteModal.contract.contractId);
      setDeleteModal({ isOpen: false, contract: null });
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
              {t('personnel.lists.filters.contractType')}
            </label>
            <select
              value={filters.contractType}
              onChange={(e) => setFilters({ ...filters, contractType: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('personnel.lists.filters.all')}</option>
              <option value="PERMANENT_CONTRACT_CDI">{t('personnel.forms.options.contractTypes.PERMANENT_CONTRACT_CDI')}</option>
              <option value="FIXED_TERM_CONTRACT_CDD">{t('personnel.forms.options.contractTypes.FIXED_TERM_CONTRACT_CDD')}</option>
              <option value="INTERNSHIP">{t('personnel.forms.options.contractTypes.INTERNSHIP')}</option>
              <option value="CONSULTANT">{t('personnel.forms.options.contractTypes.CONSULTANT')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('personnel.lists.filters.department')}
            </label>
            <input
              type="text"
              placeholder={t('personnel.lists.filters.department')}
              value={filters.department}
              onChange={(e) => setFilters({ ...filters, department: e.target.value })}
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
            {t('personnel.lists.messages.resultsFound', { count: filteredContracts.length })}
          </div>
          {/* Export Dropdown */}
          <ExportContractDropdown contracts={filteredContracts} />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('personnel.lists.tableHeaders.employee')}</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('personnel.lists.tableHeaders.contractType')}</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('personnel.lists.tableHeaders.department')}</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('personnel.lists.tableHeaders.post')}</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('personnel.lists.tableHeaders.netSalary')}</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('personnel.lists.tableHeaders.startDate')}</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('personnel.lists.tableHeaders.endDate')}</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('personnel.lists.tableHeaders.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedContracts.map((contract) => (
              <tr key={contract.contractId} className="hover:bg-gray-50">
                <td className="px-3 py-2 text-sm text-gray-900">
                  {contract.user?.firstName} {contract.user?.lastName}
                </td>
                <td className="px-3 py-2 text-sm text-gray-900">{getContractTypeText(contract.contractType)}</td>
                <td className="px-3 py-2 text-sm text-gray-900">{contract.department}</td>
                <td className="px-3 py-2 text-sm text-gray-900">{contract.post}</td>
                <td className="px-3 py-2 text-sm text-gray-900">{formatCurrency(contract.netSalary, contract.currency)}</td>
                <td className="px-3 py-2 text-sm text-gray-900">{formatDate(contract.startDate)}</td>
                <td className="px-3 py-2 text-sm text-gray-900">{formatDate(contract.endDate)}</td>
                <td className="px-3 py-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewClick(contract)}
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                      title={t('personnel.lists.actions.view')}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(contract)}
                      className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                      title={t('personnel.lists.actions.edit')}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(contract)}
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
              <p className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: t('personnel.lists.messages.showingResults', { start: startIndex + 1, end: Math.min(endIndex, filteredContracts.length), total: filteredContracts.length }) }}></p>
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
        onClose={() => setDeleteModal({ isOpen: false, contract: null })}
        onConfirm={handleDeleteConfirm}
        itemName={deleteModal.contract ? `Contrat de ${deleteModal.contract.user?.firstName} ${deleteModal.contract.user?.lastName}` : ''}
        itemType={t('personnel.lists.messages.contract')}
      />

      {/* View Modal */}
      <ViewDetailsModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, contract: null })}
        title={t('personnel.lists.messages.viewDetailsTitle', { itemType: t('personnel.lists.messages.contract') })}
        data={viewModal.contract || {}}
        fields={[
            { key: 'contractId', label: t('personnel.lists.messages.id') },
            { key: 'user', label: t('personnel.lists.tableHeaders.employee'), render: (user: any) => user ? `${user.firstName} ${user.lastName}` : '-' },
            { key: 'contractType', label: t('personnel.lists.tableHeaders.contractType'), render: (val: string) => getContractTypeText(val) },
            { key: 'post', label: t('personnel.lists.tableHeaders.post') },
            { key: 'department', label: t('personnel.lists.tableHeaders.department') },
            { key: 'unit', label: t('personnel.lists.tableHeaders.unit') },
            { key: 'grossSalary', label: t('personnel.lists.tableHeaders.grossSalary'), render: (val: number) => viewModal.contract ? formatCurrency(val, viewModal.contract.currency) : '-' },
            { key: 'netSalary', label: t('personnel.lists.tableHeaders.netSalary'), render: (val: number) => viewModal.contract ? formatCurrency(val, viewModal.contract.currency) : '-' },
            { key: 'currency', label: t('personnel.lists.tableHeaders.currency') },
            { key: 'contractFile', label: t('personnel.lists.messages.file') },
            { key: 'startDate', label: t('personnel.lists.tableHeaders.startDate'), render: formatDate },
            { key: 'endDate', label: t('personnel.lists.tableHeaders.endDate'), render: formatDate },
            { key: 'createdAt', label: t('personnel.lists.messages.createdAt'), render: formatDate },
            { key: 'updatedAt', label: t('personnel.lists.messages.updatedAt'), render: formatDate },
          ]}
        />
    </div>
  );
};

export default ContractList;

