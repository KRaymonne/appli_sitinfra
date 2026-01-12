import React, { useState, useEffect } from 'react';
import { AlertTriangle, Edit2, Eye, Search, Trash2 } from 'lucide-react';
import { useServerPagination } from '../../../hooks/useServerPagination';
import ViewDetailsModal from '../../PersonnelForms/lists/ViewDetailsModal';

interface Software {
  softwareId: number;
  name: string;
  vendor: string;
  version: string;
  type: string;
  purchaseDate?: string;
  amount?: number;
  currency?: string;
  licenseCount?: number;
  maintenance?: {
    endDate?: string;
  } | null;
  description?: string;
}

interface SoftwareListProps {
  softwares?: Software[];
  onEdit?: (software: Software) => void;
  onDelete?: (id: number) => void;
  onView?: (software: Software) => void;
}

const typeLabelMap: Record<string, string> = {
  PURCHASE: 'Achat',
  SUBSCRIPTION: 'Location',
};

const SoftwareList: React.FC<SoftwareListProps> = ({
  softwares = [],
  onEdit,
  onDelete,
  onView,
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
    endpoint: '/.netlify/functions/Software-software',
    initialParams: {
      search: '',
      type: '',
    },
  });

  const [localFilters, setLocalFilters] = useState({
    search: '',
    type: '',
  });

  const [viewModal, setViewModal] = useState<{ isOpen: boolean; software: Software | null }>({
    isOpen: false,
    software: null,
  });

  // Update server filters when local filters change (with debounce for search)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateFilters(localFilters);
    }, localFilters.search ? 300 : 0);
    return () => clearTimeout(timeoutId);
  }, [localFilters, updateFilters]);

  const displayData = serverData.length > 0 ? serverData : softwares;

  const handlePageChange = (page: number) => {
    goToPage(page);
  };

  const handleViewClick = (software: Software) => {
    setViewModal({ isOpen: true, software });
  };

  const formatDate = (value?: string) => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('fr-FR');
  };

  const formatCurrency = (amount?: number, currency?: string) => {
    if (amount === undefined || amount === null) return '-';
    const currencySymbol = currency === 'XAF' ? 'FCFA' : currency || 'FCFA';
    return `${amount.toLocaleString('fr-FR')} ${currencySymbol}`;
  };

  // Fonction pour calculer le statut de l'alarme
  const getAlarmStatus = (endDate?: string): { status: 'none' | 'warning' | 'expired'; daysLeft: number; message: string } => {
    if (!endDate) {
      return { status: 'none', daysLeft: 0, message: '' };
    }

    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        status: 'expired',
        daysLeft: Math.abs(diffDays),
        message: `Alarme dépassée de ${Math.abs(diffDays)} jour${Math.abs(diffDays) > 1 ? 's' : ''}`,
      };
    } else if (diffDays <= 10) {
      return {
        status: 'warning',
        daysLeft: diffDays,
        message: `Expire dans ${diffDays} jour${diffDays > 1 ? 's' : ''}`,
      };
    }

    return { status: 'none', daysLeft: diffDays, message: '' };
  };

  // Filtrer les logiciels avec alarmes
  const softwaresWithAlarms = displayData.filter((software) => {
    const alarm = getAlarmStatus(software.maintenance?.endDate);
    return alarm.status !== 'none';
  });

  if (loading && serverData.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Alarms Section */}
      {softwaresWithAlarms.length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <h3 className="text-sm font-semibold text-red-800">
              Alarmes de maintenance ({softwaresWithAlarms.length})
            </h3>
          </div>
          <div className="mt-2 space-y-1">
            {softwaresWithAlarms.map((software) => {
              const alarm = getAlarmStatus(software.maintenance?.endDate);
              return (
                <div key={software.softwareId} className="text-sm text-red-700">
                  <span className="font-medium">{software.name}</span> - {alarm.message}
                </div>
              );
            })}
          </div>
        </div>
      )}

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
                placeholder="Nom, fournisseur, version..."
                value={localFilters.search}
                onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={localFilters.type}
              onChange={(e) => {
                setLocalFilters({ ...localFilters, type: e.target.value });
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Tous</option>
              <option value="PURCHASE">Achat</option>
              <option value="SUBSCRIPTION">Location</option>
            </select>
          </div>

          {/* Items per page */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Éléments par page
            </label>
            <select
              value={pagination.limit}
              onChange={(e) => changePageSize(Number(e.target.value))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              setLocalFilters({ search: '', type: '' });
              updateFilters({ search: '', type: '' });
            }}
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            Réinitialiser les filtres
          </button>
          <div className="text-sm text-gray-600">
            {pagination.total} logiciel{pagination.total > 1 ? 's' : ''} trouvé{pagination.total > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* List */}
      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Logiciel
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Fournisseur
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Type
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Licences
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Dernier achat
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Maintenance
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayData.map((software) => {
              const alarm = getAlarmStatus(software.maintenance?.endDate);
              const hasAlarm = alarm.status !== 'none';
              return (
                <tr 
                  key={software.softwareId} 
                  className={`hover:bg-gray-50 ${hasAlarm ? alarm.status === 'expired' ? 'bg-red-50' : 'bg-yellow-50' : ''}`}
                >
                  <td className="px-4 py-2 text-sm font-medium text-gray-900">
                    <div className="flex items-center space-x-2">
                      <span>{software.name}</span>
                      {hasAlarm && (
                        <AlertTriangle 
                          className={`w-4 h-4 ${alarm.status === 'expired' ? 'text-red-500' : 'text-yellow-500'}`}
                          title={alarm.message}
                        />
                      )}
                    </div>
                    <div className="text-xs text-gray-500">v{software.version}</div>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">{software.vendor}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {typeLabelMap[software.type] || software.type}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {software.licenseCount || 0} licence{(software.licenseCount || 0) > 1 ? 's' : ''}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">{formatDate(software.purchaseDate)}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    <div className="flex items-center space-x-2">
                      <span>{formatDate(software.maintenance?.endDate)}</span>
                      {hasAlarm && (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          alarm.status === 'expired' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {alarm.message}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <div className="flex items-center space-x-2">
                      {onView && (
                        <button
                          onClick={() => handleViewClick(software)}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          title="Voir"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(software)}
                          className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => {
                            onDelete(software.softwareId);
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
              );
            })}
          </tbody>
        </table>
        {displayData.length === 0 && !loading && (
          <div className="text-center py-10 text-gray-500">Aucun logiciel disponible</div>
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
                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
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
        onClose={() => setViewModal({ isOpen: false, software: null })}
        title="Détails du logiciel"
        data={viewModal.software || {}}
        fields={[
          { key: 'softwareId', label: 'ID' },
          { key: 'name', label: 'Nom' },
          { key: 'vendor', label: 'Fournisseur' },
          { key: 'version', label: 'Version' },
          { key: 'type', label: 'Type', render: (val: string) => typeLabelMap[val] || val },
          { key: 'purchaseDate', label: 'Date d\'achat', render: formatDate },
          { key: 'amount', label: 'Montant', render: (val: number) => formatCurrency(val, viewModal.software?.currency) },
          { key: 'currency', label: 'Devise' },
          { key: 'licenseCount', label: 'Nombre de licences' },
          { 
            key: 'maintenance', 
            label: 'Fin de maintenance', 
            render: () => {
              const endDate = viewModal.software?.maintenance?.endDate;
              return endDate ? formatDate(endDate) : '-';
            }
          },
          { key: 'description', label: 'Description' },
        ]}
      />
    </div>
  );
};

export default SoftwareList;

