import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import ViewDetailsModal from './ViewDetailsModal';
import ExportUserDropdown from './ExportUserDropdown';

interface User {
  id: number;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  department: string;
  workcountry: string;
  structureName: string | null;
  isStructureResponsible: boolean;
  hireDate: string;
  createdAt: string;
  updatedAt: string;
}

interface UserListProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (id: number) => void;
  onView: (user: User) => void;
}

const UserList: React.FC<UserListProps> = ({ users, onEdit, onDelete, onView }) => {
  const { t } = useTranslation();
  const [filters, setFilters] = useState({
    role: '',
    status: '',
    department: '',
    workcountry: '',
    search: '',
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; user: User | null }>({
    isOpen: false,
    user: null,
  });
  
  const [viewModal, setViewModal] = useState<{ isOpen: boolean; user: User | null }>({
    isOpen: false,
    user: null,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'SUSPENDED': return 'bg-yellow-100 text-yellow-800';
      case 'FIRED': return 'bg-red-100 text-red-800';
      case 'ON_HOLIDAY': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return t('personnel.forms.options.userStatus.ACTIVE');
      case 'SUSPENDED': return t('personnel.forms.options.userStatus.SUSPENDED');
      case 'FIRED': return t('personnel.forms.options.userStatus.FIRED');
      case 'ON_HOLIDAY': return t('personnel.forms.options.userStatus.ON_HOLIDAY');
      default: return status;
    }
  };

  const formatDate = (date: string) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      if (filters.role && user.role !== filters.role) return false;
      if (filters.status && user.status !== filters.status) return false;
      if (filters.department && user.department !== filters.department) return false;
      if (filters.workcountry && user.workcountry !== filters.workcountry) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          user.firstName.toLowerCase().includes(searchLower) ||
          user.lastName.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.employeeNumber.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [users, filters]);

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  const handleDeleteClick = (user: User) => {
    setDeleteModal({ isOpen: true, user });
  };

  const handleViewClick = (user: User) => {
    setViewModal({ isOpen: true, user });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.user) {
      onDelete(deleteModal.user.id);
      setDeleteModal({ isOpen: false, user: null });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('personnel.lists.filters.search')}
            </label>
            <input
              type="text"
              placeholder={t('personnel.lists.filters.searchPlaceholderUser')}
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('personnel.lists.filters.role')}
            </label>
            <select
              value={filters.role}
              onChange={(e) => setFilters({ ...filters, role: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('personnel.lists.filters.all')}</option>
              <option value="ADMIN">{t('personnel.forms.options.roles.ADMIN')}</option>
              <option value="ACCOUNTANT">{t('personnel.forms.options.roles.ACCOUNTANT')}</option>
              <option value="DIRECTOR">{t('personnel.forms.options.roles.DIRECTOR')}</option>
              <option value="DIRECTEUR_TECHNIQUE">{t('personnel.forms.options.roles.DIRECTEUR_TECHNIQUE')}</option>
              <option value="DIRECTEUR_ADMINISTRATIF">{t('personnel.forms.options.roles.DIRECTEUR_ADMINISTRATIF')}</option>
              <option value="EMPLOYEE">{t('personnel.forms.options.roles.EMPLOYEE')}</option>
              <option value="SECRETARY">{t('personnel.forms.options.roles.SECRETARY')}</option>
              <option value="DRIVER">{t('personnel.forms.options.roles.DRIVER')}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('personnel.lists.filters.userStatus')}
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('personnel.lists.filters.all')}</option>
              <option value="ACTIVE">{t('personnel.forms.options.userStatus.ACTIVE')}</option>
              <option value="SUSPENDED">{t('personnel.forms.options.userStatus.SUSPENDED')}</option>
              <option value="FIRED">{t('personnel.forms.options.userStatus.FIRED')}</option>
              <option value="ON_HOLIDAY">{t('personnel.forms.options.userStatus.ON_HOLIDAY')}</option>
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
              {t('personnel.lists.filters.workCountry')}
            </label>
            <select
              value={filters.workcountry}
              onChange={(e) => setFilters({ ...filters, workcountry: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">{t('personnel.lists.filters.all')}</option>
              <option value="IVORY_COAST">{t('personnel.forms.options.workCountries.IVORY_COAST')}</option>
              <option value="GHANA">{t('personnel.forms.options.workCountries.GHANA')}</option>
              <option value="BENIN">{t('personnel.forms.options.workCountries.BENIN')}</option>
              <option value="CAMEROON">{t('personnel.forms.options.workCountries.CAMEROON')}</option>
              <option value="TOGO">{t('personnel.forms.options.workCountries.TOGO')}</option>
              <option value="ROMANIE">{t('personnel.forms.options.workCountries.ROMANIE')}</option>
              <option value="ITALIE">{t('personnel.forms.options.workCountries.ITALIE')}</option>
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
            {t('personnel.lists.filters.resultsCountUser', { count: filteredUsers.length })}
          </div>
          {/* Export Dropdown */}
          <ExportUserDropdown users={filteredUsers} />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-lg overflow-x-auto">
        <table className="w-full min-w-[1200px]">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('personnel.lists.modals.fields.userId')}</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('personnel.forms.labels.employeeNumber')}</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('personnel.forms.labels.firstName')} / {t('personnel.forms.labels.lastName')}</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('personnel.forms.labels.email')}</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('personnel.forms.labels.role')}</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('personnel.forms.labels.userStatus')}</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('personnel.lists.columns.department')}</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('personnel.forms.labels.workCountry')}</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('personnel.forms.labels.hireDate')}</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('personnel.lists.columns.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {paginatedUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 text-sm text-gray-900">{user.id}</td>
                <td className="px-3 py-2 text-sm text-gray-900 font-medium">{user.employeeNumber}</td>
                <td className="px-3 py-2 text-sm text-gray-900">{user.firstName} {user.lastName}</td>
                <td className="px-3 py-2 text-sm text-gray-900">{user.email}</td>
                <td className="px-3 py-2 text-sm text-gray-900">
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                    {t(`personnel.forms.options.roles.${user.role}`) || user.role}
                  </span>
                </td>
                <td className="px-3 py-2 text-sm text-gray-900">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(user.status)}`}>
                    {getStatusText(user.status)}
                  </span>
                </td>
                <td className="px-3 py-2 text-sm text-gray-900">{user.department}</td>
                <td className="px-3 py-2 text-sm text-gray-900">{user.workcountry}</td>
                <td className="px-3 py-2 text-sm text-gray-900">{formatDate(user.hireDate)}</td>
                <td className="px-3 py-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewClick(user)}
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                      title={t('personnel.lists.actions.view')}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(user)}
                      className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                      title={t('personnel.lists.actions.edit')}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(user)}
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
                <span className="font-medium">{Math.min(endIndex, filteredUsers.length)}</span> {t('personnel.lists.pagination.of')}{' '}
                <span className="font-medium">{filteredUsers.length}</span> {t('personnel.lists.pagination.results')}
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
        onClose={() => setDeleteModal({ isOpen: false, user: null })}
        onConfirm={handleDeleteConfirm}
        itemName={deleteModal.user ? `${deleteModal.user.firstName} ${deleteModal.user.lastName}` : ''}
        itemType="l'utilisateur"
      />

      {/* View Modal */}
      <ViewDetailsModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, user: null })}
        title={t('personnel.lists.modals.viewTitleUser')}
        data={viewModal.user || {}}
        fields={[
          { key: 'id', label: t('personnel.lists.modals.fields.userId') },
          { key: 'employeeNumber', label: t('personnel.forms.labels.employeeNumber') },
          { key: 'firstName', label: t('personnel.forms.labels.firstName') },
          { key: 'lastName', label: t('personnel.forms.labels.lastName') },
          { key: 'email', label: t('personnel.forms.labels.email') },
          { key: 'role', label: t('personnel.forms.labels.role'), render: (val: string) => t(`personnel.forms.options.roles.${val}`) || val },
          { key: 'status', label: t('personnel.forms.labels.userStatus'), render: (val: string) => (
            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(val)}`}>
              {getStatusText(val)}
            </span>
          )},
          { key: 'department', label: t('personnel.lists.columns.department') },
          { key: 'workcountry', label: t('personnel.forms.labels.workCountry') },
          { key: 'structureName', label: 'Structure', render: (val: string | null) => val || '-' },
          { key: 'isStructureResponsible', label: 'Responsable de structure', render: (val: boolean) => val ? 'Oui' : 'Non' },
          { key: 'hireDate', label: t('personnel.forms.labels.hireDate'), render: formatDate },
          { key: 'createdAt', label: t('personnel.lists.modals.fields.createdAt'), render: formatDate },
          { key: 'updatedAt', label: t('personnel.lists.modals.fields.updatedAt'), render: formatDate },
        ]}
      />
    </div>
  );
};

export default UserList;

