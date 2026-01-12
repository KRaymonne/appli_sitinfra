import React, { useState, useEffect } from 'react';
import { Edit2, Eye, Search, Trash2, Filter } from 'lucide-react';
import { useServerPagination } from '../../../hooks/useServerPagination';

interface SoftwareContract {
  contractId: number;
  softwareId: number;
  contractNumber: string;
  provider: string;
  startDate: string;
  endDate: string;
  renewalDate: string;
  amount: number;
  currency: string;
  contractType: string;
  status: string;
  description: string;
  software?: {
    name: string;
    version?: string;
  };
}

interface SoftwareContractListProps {
  contracts?: SoftwareContract[];
  onEdit?: (contract: SoftwareContract) => void;
  onDelete?: (id: number) => void;
  onView?: (contract: SoftwareContract) => void;
}

const statusColorMap: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  EXPIRED: 'bg-red-100 text-red-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  CANCELLED: 'bg-gray-100 text-gray-800',
};

const statusLabelMap: Record<string, string> = {
  ACTIVE: 'Actif',
  EXPIRED: 'Expiré',
  PENDING: 'En attente',
  CANCELLED: 'Annulé',
};

const contractTypeLabelMap: Record<string, string> = {
  LICENSE: 'Licence',
  MAINTENANCE: 'Maintenance',
  SUBSCRIPTION: 'Abonnement',
  SUPPORT: 'Support',
};

const SoftwareContractList: React.FC<SoftwareContractListProps> = ({
  contracts = [],
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
    endpoint: '/.netlify/functions/Software-contracts',
    initialParams: {
      search: '',
      status: '',
      contractType: '',
    },
  });

  const [localFilters, setLocalFilters] = useState({
    search: '',
    status: '',
    contractType: '',
  });
  const hasActions = Boolean(onEdit || onDelete || onView);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateFilters(localFilters);
    }, localFilters.search ? 300 : 0);
    return () => clearTimeout(timeoutId);
  }, [localFilters, updateFilters]);

  const displayData = serverData.length > 0 ? serverData : contracts;
  const formatDate = (value: string) =>
    value ? new Date(value).toLocaleDateString('fr-FR') : '-';

  const handlePageChange = (page: number) => {
    goToPage(page);
  };

  if (loading && serverData.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
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
                placeholder="Numéro, fournisseur, logiciel..."
                value={localFilters.search}
                onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              value={localFilters.status}
              onChange={(e) => {
                setLocalFilters({ ...localFilters, status: e.target.value });
                updateFilters({ ...localFilters, status: e.target.value });
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Tous</option>
              <option value="ACTIVE">Actif</option>
              <option value="EXPIRED">Expiré</option>
              <option value="PENDING">En attente</option>
              <option value="CANCELLED">Annulé</option>
            </select>
          </div>

          {/* Contract Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de contrat
            </label>
            <select
              value={localFilters.contractType}
              onChange={(e) => {
                setLocalFilters({ ...localFilters, contractType: e.target.value });
                updateFilters({ ...localFilters, contractType: e.target.value });
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Tous</option>
              <option value="LICENSE">Licence</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="SUBSCRIPTION">Abonnement</option>
              <option value="SUPPORT">Support</option>
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
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
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
              setLocalFilters({ search: '', status: '', contractType: '' });
              updateFilters({ search: '', status: '', contractType: '' });
            }}
            className="text-sm text-amber-600 hover:text-amber-800"
          >
            Réinitialiser les filtres
          </button>
          <div className="text-sm text-gray-600">
            {pagination.total} contrat{pagination.total > 1 ? 's' : ''} trouvé{pagination.total > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-amber-50">
                Contrat
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-amber-50">
                Logiciel
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-amber-50">
                Fournisseur
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-amber-50">
                Dates
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-amber-50">
                Montant
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-amber-50">
                Type
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-amber-50">
                Statut
              </th>
              {hasActions && (
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-amber-50">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayData.map((contract) => (
              <tr key={contract.contractId} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {contract.contractNumber || 'N/A'}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="font-medium text-gray-900">{contract.software?.name || '-'}</div>
                  {contract.software?.version && (
                    <div className="text-xs text-gray-500">v{contract.software.version}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">{contract.provider}</td>
                <td className="px-4 py-3 text-sm">
                  <div>Début: {formatDate(contract.startDate)}</div>
                  <div>Fin: {formatDate(contract.endDate)}</div>
                  {contract.renewalDate && (
                    <div className="text-amber-600 font-medium">Renouv.: {formatDate(contract.renewalDate)}</div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  {contract.amount > 0 ? (
                    <div className="font-medium">
                      {contract.amount.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} {contract.currency}
                    </div>
                  ) : (
                    <div>-</div>
                  )}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                    {contractTypeLabelMap[contract.contractType] || contract.contractType}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      statusColorMap[contract.status] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {statusLabelMap[contract.status] || contract.status}
                  </span>
                </td>
                {hasActions && (
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center space-x-2">
                      {onView && (
                        <button
                          onClick={() => onView(contract)}
                          className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded transition-colors"
                          title="Voir"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(contract)}
                          className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => {
                            onDelete(contract.contractId);
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
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {displayData.length === 0 && !loading && (
          <div className="text-center py-10 text-gray-500">Aucun contrat trouvé</div>
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
                        ? 'z-10 bg-amber-50 border-amber-500 text-amber-600'
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
    </div>
  );
};

export default SoftwareContractList;