import React, { useState, useEffect } from 'react';
import { Edit2, Eye, Search, Trash2 } from 'lucide-react';
import { useServerPagination } from '../../../hooks/useServerPagination';
import ViewDetailsModal from '../../PersonnelForms/lists/ViewDetailsModal';

interface SoftwareMaintenance {
  maintenanceId: number;
  softwareId: number;
  provider: string;
  startDate: string;
  endDate: string;
  price: number;
  currency: string;
  periodicity: string;
  maintenanceType: string;
  observations?: string;
  software?: {
    name: string;
    version?: string;
  };
}

interface SoftwareMaintenanceListProps {
  maintenances?: SoftwareMaintenance[];
  onEdit?: (maintenance: SoftwareMaintenance) => void;
  onDelete?: (id: number) => void;
}

const periodicityLabels: Record<string, string> = {
  MONTHLY: 'Mensuelle',
  QUARTERLY: 'Trimestrielle',
  ANNUAL: 'Annuelle',
  ONE_TIME: 'Unique',
};

const maintenanceTypeLabels: Record<string, string> = {
  SUPPORT: 'Support',
  CORRECTIVE: 'Corrective',
  EVOLUTIVE: 'Évolutive',
  PREVENTIVE: 'Préventive',
};

const SoftwareMaintenanceList: React.FC<SoftwareMaintenanceListProps> = ({
  maintenances = [],
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
    endpoint: '/.netlify/functions/Software-maintenance',
    initialParams: {
      search: '',
      maintenanceType: '',
      periodicity: '',
    },
  });

  const [localFilters, setLocalFilters] = useState({
    search: '',
    maintenanceType: '',
    periodicity: '',
  });

  const [viewModal, setViewModal] = useState<{ isOpen: boolean; maintenance: SoftwareMaintenance | null }>({
    isOpen: false,
    maintenance: null,
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateFilters(localFilters);
    }, localFilters.search ? 300 : 0);
    return () => clearTimeout(timeoutId);
  }, [localFilters, updateFilters]);

  const displayData = serverData.length > 0 ? serverData : maintenances;
  const formatDate = (value: string) => new Date(value).toLocaleDateString('fr-FR');

  const handlePageChange = (page: number) => {
    goToPage(page);
  };

  const handleViewClick = (maintenance: SoftwareMaintenance) => {
    setViewModal({ isOpen: true, maintenance });
  };

  if (loading && serverData.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Fournisseur, logiciel..."
                value={localFilters.search}
                onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Maintenance Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de maintenance
            </label>
            <select
              value={localFilters.maintenanceType}
              onChange={(e) => {
                setLocalFilters({ ...localFilters, maintenanceType: e.target.value });
                updateFilters({ ...localFilters, maintenanceType: e.target.value });
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="SUPPORT">Support</option>
              <option value="CORRECTIVE">Corrective</option>
              <option value="EVOLUTIVE">Évolutive</option>
              <option value="PREVENTIVE">Préventive</option>
            </select>
          </div>

          {/* Periodicity Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Périodicité
            </label>
            <select
              value={localFilters.periodicity}
              onChange={(e) => {
                setLocalFilters({ ...localFilters, periodicity: e.target.value });
                updateFilters({ ...localFilters, periodicity: e.target.value });
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes</option>
              <option value="MONTHLY">Mensuelle</option>
              <option value="QUARTERLY">Trimestrielle</option>
              <option value="ANNUAL">Annuelle</option>
              <option value="ONE_TIME">Unique</option>
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
              setLocalFilters({ search: '', maintenanceType: '', periodicity: '' });
              updateFilters({ search: '', maintenanceType: '', periodicity: '' });
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Réinitialiser les filtres
          </button>
          <div className="text-sm text-gray-600">
            {pagination.total} contrat{pagination.total > 1 ? 's' : ''} trouvé{pagination.total > 1 ? 's' : ''}
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
                Période
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Prix
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Périodicité
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Type
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayData.map((maintenance) => (
              <tr key={maintenance.maintenanceId} className="hover:bg-gray-50">
                <td className="px-4 py-2 text-sm font-medium text-gray-900">
                  <div>{maintenance.software?.name || 'Logiciel supprimé'}</div>
                  <div className="text-xs text-gray-500">
                    {maintenance.software?.version ? `v${maintenance.software.version}` : ''}
                  </div>
                </td>
                <td className="px-4 py-2 text-sm text-gray-900">{maintenance.provider}</td>
                <td className="px-4 py-2 text-sm text-gray-900">
                  {formatDate(maintenance.startDate)} - {formatDate(maintenance.endDate)}
                </td>
                <td className="px-4 py-2 text-sm text-gray-900">
                  {maintenance.price.toLocaleString('fr-FR', {
                    style: 'currency',
                    currency: maintenance.currency || 'XAF',
                  })}
                </td>
                <td className="px-4 py-2 text-sm text-gray-900">
                  {periodicityLabels[maintenance.periodicity] || maintenance.periodicity}
                </td>
                <td className="px-4 py-2 text-sm text-gray-900">
                  {maintenanceTypeLabels[maintenance.maintenanceType] || maintenance.maintenanceType}
                </td>
                <td className="px-4 py-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleViewClick(maintenance)}
                      className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                      title="Voir"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {onEdit && (
                      <button
                        onClick={() => onEdit(maintenance)}
                        className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                        title="Modifier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => {
                          onDelete(maintenance.maintenanceId);
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
          <div className="text-center py-10 text-gray-500">Aucune maintenance enregistrée</div>
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
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
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
        onClose={() => setViewModal({ isOpen: false, maintenance: null })}
        title="Détails de la maintenance"
        data={viewModal.maintenance || {}}
        fields={[
          { key: 'maintenanceId', label: 'ID' },
          { key: 'software', label: 'Logiciel', render: (val: any) => val?.name || '-' },
          { key: 'provider', label: 'Fournisseur' },
          { key: 'startDate', label: 'Date de début', render: formatDate },
          { key: 'endDate', label: 'Date de fin', render: formatDate },
          { 
            key: 'price', 
            label: 'Prix', 
            render: (val: number) => {
              const currency = viewModal.maintenance?.currency || 'XAF';
              return val.toLocaleString('fr-FR', { style: 'currency', currency });
            }
          },
          { key: 'currency', label: 'Devise' },
          { key: 'periodicity', label: 'Périodicité', render: (val: string) => periodicityLabels[val] || val },
          { key: 'maintenanceType', label: 'Type', render: (val: string) => maintenanceTypeLabels[val] || val },
          { key: 'observations', label: 'Observations' },
        ]}
      />
    </div>
  );
};

export default SoftwareMaintenanceList;

