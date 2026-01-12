import React, { useState, useEffect } from 'react';
import { Edit2, Eye, Mail, Phone, Search, Trash2 } from 'lucide-react';
import { useServerPagination } from '../../../hooks/useServerPagination';
import ViewDetailsModal from '../../PersonnelForms/lists/ViewDetailsModal';

interface SoftwareContact {
  contactId: number;
  softwareId: number;
  role: string;
  name?: string;
  phone?: string;
  email?: string;
  onlineAssistant?: string;
  notes?: string;
  software?: {
    name: string;
    version?: string;
  };
}

interface SoftwareContactListProps {
  contacts?: SoftwareContact[];
  onEdit?: (contact: SoftwareContact) => void;
  onDelete?: (id: number) => void;
}

const SoftwareContactList: React.FC<SoftwareContactListProps> = ({
  contacts = [],
  onEdit,
  onDelete,
}) => {
  const {
    data: serverData,
    pagination,
    loading,
    error,
    filters: serverFilters,
    updateFilters,
    goToPage,
    changePageSize,
    refetch,
  } = useServerPagination({
    endpoint: '/.netlify/functions/Software-contacts',
    initialParams: {
      search: '',
      role: '',
    },
  });

  const [localFilters, setLocalFilters] = useState({
    search: '',
    role: '',
  });

  const [viewModal, setViewModal] = useState<{ isOpen: boolean; contact: SoftwareContact | null }>({
    isOpen: false,
    contact: null,
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateFilters(localFilters);
    }, localFilters.search ? 300 : 0);
    return () => clearTimeout(timeoutId);
  }, [localFilters, updateFilters]);

  const displayData = serverData.length > 0 ? serverData : contacts;

  const handlePageChange = (page: number) => {
    goToPage(page);
  };

  const handleViewClick = (contact: SoftwareContact) => {
    setViewModal({ isOpen: true, contact });
  };

  if (loading && serverData.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Nom, rôle, logiciel..."
                value={localFilters.search}
                onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Role Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rôle
            </label>
            <input
              type="text"
              placeholder="Filtrer par rôle..."
              value={localFilters.role}
              onChange={(e) => {
                setLocalFilters({ ...localFilters, role: e.target.value });
                updateFilters({ ...localFilters, role: e.target.value });
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Items per page */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Éléments par page
            </label>
            <select
              value={pagination.limit}
              onChange={(e) => changePageSize(Number(e.target.value))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
              setLocalFilters({ search: '', role: '' });
              updateFilters({ search: '', role: '' });
            }}
            className="text-sm text-emerald-600 hover:text-emerald-800"
          >
            Réinitialiser les filtres
          </button>
          <div className="text-sm text-gray-600">
            {pagination.total} contact{pagination.total > 1 ? 's' : ''} trouvé{pagination.total > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-emerald-50">
                Logiciel
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-emerald-50">
                Rôle
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-emerald-50">
                Contact
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-emerald-50">
                Coordonnées
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-emerald-50">
                Assistance en ligne
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-emerald-50">
                Notes
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-emerald-50">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayData.map((contact) => (
              <tr key={contact.contactId} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  <div className="font-semibold">{contact.software?.name || 'Logiciel supprimé'}</div>
                  <div className="text-xs text-gray-500">
                    {contact.software?.version ? `v${contact.software.version}` : ''}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs">
                    {contact.role}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {contact.name || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  <div className="space-y-1">
                    {contact.phone && (
                      <div className="flex items-center text-gray-600">
                        <Phone className="w-4 h-4 mr-2" />
                        <span>{contact.phone}</span>
                      </div>
                    )}
                    {contact.email && (
                      <div className="flex items-center text-gray-600">
                        <Mail className="w-4 h-4 mr-2" />
                        <span>{contact.email}</span>
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {contact.onlineAssistant || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900 max-w-xs">
                  <div className="truncate" title={contact.notes || '-'}>
                    {contact.notes || '-'}
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewClick(contact)}
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                      title="Voir"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {onEdit && (
                      <button
                        onClick={() => onEdit(contact)}
                        className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                        title="Modifier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => {
                          onDelete(contact.contactId);
                          setTimeout(() => refetch(), 500);
                        }}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {displayData.length === 0 && !loading && (
          <div className="text-center py-10 text-gray-500">Aucun contact enregistré</div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border border-gray-200 rounded-lg sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Affichage de <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> à{' '}
                <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> sur{' '}
                <span className="font-medium">{pagination.total}</span> résultats
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Précédent</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                {[...Array(pagination.totalPages)].map((_, idx) => (
                  <button
                    key={idx + 1}
                    onClick={() => handlePageChange(idx + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      pagination.page === idx + 1
                        ? 'z-10 bg-emerald-50 border-emerald-500 text-emerald-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
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

      {/* View Modal */}
      <ViewDetailsModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, contact: null })}
        title="Détails du contact"
        data={viewModal.contact || {}}
        fields={[
          { key: 'contactId', label: 'ID' },
          { key: 'software', label: 'Logiciel', render: (val: any) => val?.name || '-' },
          { key: 'role', label: 'Rôle' },
          { key: 'name', label: 'Nom' },
          { key: 'phone', label: 'Téléphone' },
          { key: 'email', label: 'Email' },
          { key: 'onlineAssistant', label: 'Assistant en ligne' },
          { key: 'notes', label: 'Notes' },
        ]}
      />
    </div>
  );
};

export default SoftwareContactList;
