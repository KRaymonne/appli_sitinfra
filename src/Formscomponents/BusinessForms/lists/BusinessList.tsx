import React, { useState, useMemo } from 'react';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import DeleteConfirmationModal from '../../vehicleforms/lists/DeleteConfirmationModal';
import ViewDetailsModal from '../../ContactForms/lists/ViewDetailsModal';
import ExportBusinessDropdown from './ExportBusinessDropdown';

interface Business {
  businessId: number;
  name: string;
  status: string;
  client: string;
  contact?: number; // Changed from string to number to match the database schema
  startDate: string;
  endDate?: string;
  estimatedCost: number;
  salePrice: number;
  comment?: string;
  progress: number;
  attachment?: string;
  devise?: string; // Using devise as per Prisma schema
  createdAt?: string;
  updatedAt?: string; // Added updatedAt field
  Inserteridentity?: string;
  InserterCountry?: string;
}

interface BusinessListProps {
  businesses: Business[];
  onEdit: (business: Business) => void;
  onDelete: (id: number) => void;
  onView: (business: Business) => void;
}

const BusinessList: React.FC<BusinessListProps> = ({ businesses, onEdit, onDelete, onView }) => {
  const [filters, setFilters] = useState({
    status: '',
    search: '',
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Added itemsPerPage state like Contact page
  
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; business: Business | null }>({
    isOpen: false,
    business: null,
  });
  
  const [viewModal, setViewModal] = useState<{ isOpen: boolean; business: Business | null }>({
    isOpen: false,
    business: null,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PROSPECT': return 'bg-yellow-100 text-yellow-800';
      case 'NEGOTIATION': return 'bg-blue-100 text-blue-800';
      case 'WON': return 'bg-green-100 text-green-800';
      case 'LOST': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PROSPECT': return 'Prospect';
      case 'NEGOTIATION': return 'Négociation';
      case 'WON': return 'Gagnée';
      case 'LOST': return 'Perdue';
      default: return status;
    }
  };

  const filteredBusinesses = useMemo(() => {
    return businesses.filter((business) => {
      if (filters.status && business.status !== filters.status) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          business.name.toLowerCase().includes(searchLower) ||
          business.client.toLowerCase().includes(searchLower) ||
          (business.contact && business.contact.toString().includes(searchLower))
        );
      }
      return true;
    });
  }, [businesses, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredBusinesses.length / itemsPerPage); // Use itemsPerPage
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedBusinesses = filteredBusinesses.slice(startIndex, endIndex);

  const handleDeleteClick = (business: Business) => {
    setDeleteModal({ isOpen: true, business });
  };
  
  const handleViewClick = (business: Business) => {
    setViewModal({ isOpen: true, business });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.business) {
      onDelete(deleteModal.business.businessId);
    }
    setDeleteModal({ isOpen: false, business: null });
  };

  const handlePageChange = (page: number) => { // Added handlePageChange function like Contact page
    setCurrentPage(page);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const formatCurrency = (amount: number, devise: string = 'XAF') => {
    // Map DEVISE enum to currency codes
    const deviseToCurrency: Record<string, string> = {
      'XAF': 'XAF',
      'XOF': 'XOF',
      'EUR': 'EUR',
      'GNF': 'GNF',
      'GHS': 'GHS',
      'RON': 'RON',
      'SLE': 'SLE',
      'USD': 'USD'
    };
    
    const currencyCode = deviseToCurrency[devise] || 'XAF';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Helper function to render file links with "Voir" button
  const renderFileLink = (url: string): React.ReactNode => {
    if (!url) return '-';
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
      >
        Voir
      </a>
    );
  };

  return (
    <div className="space-y-4">
      {/* Filters Section - Updated to match Contact page layout */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rechercher
            </label>
            <input
              type="text"
              placeholder="Nom, client, contact..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="PROSPECT">Prospect</option>
              <option value="NEGOTIATION">Négociation</option>
              <option value="WON">Gagnée</option>
              <option value="LOST">Perdue</option>
            </select>
          </div>

          {/* Items per page - Added like Contact page */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Éléments par page
            </label>
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

          {/* Reset Filters - Added like Contact page */}
        </div>

        {/* Results count - Updated to match Contact page */}
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => {
              setFilters({ status: '', search: '' });
              setCurrentPage(1);
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Réinitialiser les filtres
          </button>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {filteredBusinesses.length} affaire(s) trouvée(s)
            </span>
            {/* Export Dropdown */}
            <ExportBusinessDropdown businesses={filteredBusinesses} />
          </div>
        </div>
      </div>

      {/* Table Section - Updated to match Contact page table layout */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom de l'affaire
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date de début
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix de vente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progression
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedBusinesses.map((business) => (
                <tr key={business.businessId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {business.businessId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {business.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(business.status)}`}>
                      {getStatusText(business.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {business.client}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {business.contact || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(business.startDate)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(business.salePrice, business.devise)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-xs mr-2">{business.progress}%</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${business.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleViewClick(business)}
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        title="Voir"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(business)}
                        className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                        title="Modifier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(business)}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        title="Supprimer"
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

        {/* Pagination - Updated to match Contact page pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Précédent
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Affichage de <span className="font-medium">{startIndex + 1}</span> à{' '}
                  <span className="font-medium">{Math.min(endIndex, filteredBusinesses.length)}</span> sur{' '}
                  <span className="font-medium">{filteredBusinesses.length}</span> résultats
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="sr-only">Précédent</span>
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, business: null })}
        onConfirm={handleDeleteConfirm}
        itemName={deleteModal.business ? `${deleteModal.business.name} (${deleteModal.business.client})` : ''}
        itemType="l'affaire"
      />
      
      {/* View Details Modal */}
      <ViewDetailsModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, business: null })}
        title="Détails de l'Affaire"
        data={viewModal.business || {}}
        fields={[
          { key: 'businessId', label: 'ID' },
          { key: 'name', label: 'Nom de l\'affaire' },
          { key: 'status', label: 'Statut', render: (val: string) => getStatusText(val) },
          { key: 'client', label: 'Client' },
          { key: 'contact', label: 'Contact (numéro de téléphone)' },
          { key: 'startDate', label: 'Date de début', render: (val: string) => val ? formatDate(val) : '-' },
          { key: 'endDate', label: 'Date de fin estimée', render: (val: string) => val ? formatDate(val) : '-' },
          { key: 'estimatedCost', label: 'Coût estimé', render: (val: number) => val ? formatCurrency(val, viewModal.business?.devise) : '-' },
          { key: 'salePrice', label: 'Prix de vente', render: (val: number) => val ? formatCurrency(val, viewModal.business?.devise) : '-' },
          { key: 'devise', label: 'Devise' }, // Using devise as per Prisma schema
          { key: 'progress', label: 'Progression (%)' },
          { key: 'attachment', label: 'Document', render: (val: string) => renderFileLink(val) },
          { key: 'comment', label: 'Commentaire' },
          { key: 'Inserteridentity', label: 'Inserter Identity' },
          { key: 'InserterCountry', label: 'Inserter Country' },
          { key: 'createdAt', label: 'Créé le', render: (val: string) => val ? formatDate(val) : '-' },
          { key: 'updatedAt', label: 'Mis à jour le', render: (val: string) => val ? formatDate(val) : '-' } // Added updatedAt field
        ]}
      />
    </div>
  );
};

export default BusinessList;