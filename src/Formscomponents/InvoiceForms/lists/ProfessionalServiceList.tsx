import React, { useState, useMemo } from 'react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import ViewDetailsModal from './ViewDetailsModal';
import ExportInvoiceDropdown from './ExportInvoiceDropdown';

interface ProfessionalService {
  professionalServiceId: number;
  invoiceNumber: string;
  serviceType: string;
  supplier: string;
  amount: number;
  currency: string;
  invoiceDate: string;
  paymentDate?: string;
  status: string;
  description?: string;
}

interface ProfessionalServiceListProps {
  professionalServices: ProfessionalService[];
  onEdit: (service: ProfessionalService) => void;
  onDelete: (id: number) => void;
  onView: (service: ProfessionalService) => void;
}

const ProfessionalServiceList: React.FC<ProfessionalServiceListProps> = ({ 
  professionalServices, 
  onEdit, 
  onDelete, 
  onView 
}) => {
  const [filters, setFilters] = useState({
    serviceType: '',
    status: '',
    search: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; service: ProfessionalService | null }>({
    isOpen: false,
    service: null,
  });
  const [viewModal, setViewModal] = useState<{ isOpen: boolean; service: ProfessionalService | null }>({
    isOpen: false,
    service: null,
  });

  const getServiceTypeText = (type: string) => {
    const types: Record<string, string> = {
      'ACCOUNTING_SOFTWARE_LICENSE_FEE': 'Redevance logiciel',
      'PROFESSIONAL_FEES': 'Honoraires',
      'AIR_TICKET': 'Billet d\'avion',
      'BUILDING_RENTAL': 'Location',
      'INTERNET': 'Internet',
      'BUSINESS_TRIP_ASSIGNMENT': 'Mission',
      'MAINTENANCE_REPAIR_MOVABLE_PROPERTY': 'Entretien',
      'RECEPTIONS_HOSPITALITY': 'Réceptions',
      'OTHER_SERVICE': 'Autre',
    };
    return types[type] || type;
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PAID': return 'Payé';
      case 'PENDING': return 'En attente';
      case 'OVERDUE': return 'En retard';
      default: return status;
    }
  };

  const formatCurrency = (amount: number, devise: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: devise,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'OVERDUE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredServices = useMemo(() => {
    return professionalServices.filter((service) => {
      if (filters.serviceType && service.serviceType !== filters.serviceType) return false;
      if (filters.status && service.status !== filters.status) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          service.invoiceNumber.toLowerCase().includes(searchLower) ||
          service.supplier.toLowerCase().includes(searchLower) ||
          (service.description && service.description.toLowerCase().includes(searchLower))
        );
      }
      return true;
    });
  }, [professionalServices, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedServices = filteredServices.slice(startIndex, endIndex);

  const handleDeleteClick = (service: ProfessionalService) => {
    setDeleteModal({ isOpen: true, service });
  };

  const handleViewClick = (service: ProfessionalService) => {
    setViewModal({ isOpen: true, service });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.service) {
      onDelete(deleteModal.service.professionalServiceId);
      setDeleteModal({ isOpen: false, service: null });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="space-y-4">
      {/* Filters Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rechercher</label>
            <input
              type="text"
              placeholder="N° facture, fournisseur..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de Service</label>
            <select
              value={filters.serviceType}
              onChange={(e) => setFilters({ ...filters, serviceType: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="ACCOUNTING_SOFTWARE_LICENSE_FEE">Redevance logiciel</option>
              <option value="PROFESSIONAL_FEES">Honoraires</option>
              <option value="AIR_TICKET">Billet d'avion</option>
              <option value="BUILDING_RENTAL">Location</option>
              <option value="INTERNET">Internet</option>
              <option value="BUSINESS_TRIP_ASSIGNMENT">Mission</option>
              <option value="MAINTENANCE_REPAIR_MOVABLE_PROPERTY">Entretien</option>
              <option value="RECEPTIONS_HOSPITALITY">Réceptions</option>
              <option value="OTHER_SERVICE">Autre</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="PAID">Payé</option>
              <option value="PENDING">En attente</option>
              <option value="OVERDUE">En retard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Éléments/page</label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => {
              setFilters({ serviceType: '', status: '', search: '' });
              setCurrentPage(1);
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Réinitialiser les filtres
          </button>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {filteredServices.length} service(s) trouvé(s)
            </span>
            {/* Export Dropdown */}
            <ExportInvoiceDropdown invoices={filteredServices} invoiceType="professionalservices" />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">N° Facture</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type Service</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fournisseur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Facture</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedServices.map((service) => (
                <tr key={service.professionalServiceId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {service.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getServiceTypeText(service.serviceType)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {service.supplier}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(service.amount, service.devise)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(service.invoiceDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(service.status)}`}>
                      {getStatusText(service.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleViewClick(service)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Voir"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => onEdit(service)}
                        className="text-green-600 hover:text-green-900 p-1"
                        title="Modifier"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(service)}
                        className="text-red-600 hover:text-red-900 p-1"
                        title="Supprimer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
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
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Précédent
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Affichage de <span className="font-medium">{startIndex + 1}</span> à{' '}
                  <span className="font-medium">{Math.min(endIndex, filteredServices.length)}</span> sur{' '}
                  <span className="font-medium">{filteredServices.length}</span> résultats
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Préc.
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
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Suiv.
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, service: null })}
        onConfirm={handleDeleteConfirm}
        itemName={deleteModal.service ? `Facture ${deleteModal.service.invoiceNumber}` : ''}
      />
      
      {/* View Details Modal */}
      <ViewDetailsModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, service: null })}
        title="Détails du Service"
        data={viewModal.service || {}}
        fields={[
          { key: 'professionalServiceId', label: 'ID' },
          { key: 'invoiceNumber', label: 'Numéro de facture' },
          { key: 'serviceType', label: 'Type de service' },
          { key: 'supplier', label: 'Fournisseur' },
          { key: 'amount', label: 'Montant' },
          { key: 'devise', label: 'Devise' },
          { key: 'invoiceDate', label: 'Date de facture', render: (val: string) => formatDate(val) },
          { key: 'paymentDate', label: 'Date de paiement', render: (val: string) => val ? formatDate(val) : '-' },
          { key: 'status', label: 'Statut' },
          { key: 'description', label: 'Description' },
          { key: 'paymentMethod', label: 'Méthode de paiement' },
        ]}
      />
    </div>
  );
};

export default ProfessionalServiceList;