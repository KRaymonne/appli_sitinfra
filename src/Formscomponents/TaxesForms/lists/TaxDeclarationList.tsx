import React, { useState, useMemo } from 'react';
import { Search, Edit2, Trash2, Eye, Receipt, Calendar, AlertCircle, CheckCircle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../../../components/Common/Button';
import ViewDetailsModal from './ViewDetailsModal';
import ExportTaxDropdown from './ExportTaxDropdown';

interface TaxDeclaration {
  id: number;
  taxType: 'VAT' | 'INCOME_TAX' | 'CORPORATE_TAX' | 'SOCIAL_CONTRIBUTIONS' | 'OTHER_TAX';
  taxAmount: number;
  penalties: number;
  declarationDate: string;
  paymentDate?: string | null;
  status: 'TO_PAY' | 'PAID' | 'OVERDUE';
  referenceNumber: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  devise?: string; // Added devise field
}

interface TaxDeclarationListProps {
  taxDeclarations: TaxDeclaration[];
  onEdit: (tax: TaxDeclaration) => void;
  onDelete: (id: number) => void;
  onView?: (tax: TaxDeclaration) => void;
}

export const TaxDeclarationList: React.FC<TaxDeclarationListProps> = ({
  taxDeclarations,
  onEdit,
  onDelete,
  onView
}) => {
  const [filters, setFilters] = useState({
    searchTerm: '',
    statusFilter: 'all',
    typeFilter: 'all',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [viewModal, setViewModal] = useState<{ isOpen: boolean; tax: TaxDeclaration | null }>({
    isOpen: false,
    tax: null,
  });

  // Filter and search
  const filteredTaxes = useMemo(() => {
    return taxDeclarations.filter(tax => {
      const matchesSearch = filters.searchTerm === '' || 
        tax.referenceNumber.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        tax.notes?.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        getTaxTypeLabel(tax.taxType).toLowerCase().includes(filters.searchTerm.toLowerCase());
      
      const matchesStatus = filters.statusFilter === 'all' || tax.status === filters.statusFilter;
      const matchesType = filters.typeFilter === 'all' || tax.taxType === filters.typeFilter;
      
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [taxDeclarations, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredTaxes.length / itemsPerPage);
  const paginatedTaxes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTaxes.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTaxes, currentPage, itemsPerPage]);

  // Reset to page 1 when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const getTaxTypeLabel = (type: string) => {
    switch (type) {
      case 'VAT': return 'TVA';
      case 'INCOME_TAX': return 'Impôt sur le revenu';
      case 'CORPORATE_TAX': return 'Impôt sur les sociétés';
      case 'SOCIAL_CONTRIBUTIONS': return 'Cotisations sociales';
      case 'OTHER_TAX': return 'Autre taxe';
      default: return type;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-100 text-green-800 border-green-300';
      case 'TO_PAY': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'OVERDUE': return 'bg-red-100 text-red-800 border-red-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PAID': return 'Payé';
      case 'TO_PAY': return 'À payer';
      case 'OVERDUE': return 'En retard';
      default: return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAID': return <CheckCircle className="w-4 h-4" />;
      case 'TO_PAY': return <Clock className="w-4 h-4" />;
      case 'OVERDUE': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number, devise: string = 'XAF') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: devise,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return '-';
    
    try {
      const date = new Date(dateString);
      
      // Check if date is valid
      if (isNaN(date.getTime())) {
        return '-';
      }
      
      // Return date in DD/MM/YYYY format
      return date.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return '-';
    }
  };

  const handleViewClick = (tax: TaxDeclaration) => {
    setViewModal({ isOpen: true, tax });
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par référence, type, notes..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filters.statusFilter}
              onChange={(e) => setFilters({ ...filters, statusFilter: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="TO_PAY">À payer</option>
              <option value="PAID">Payé</option>
              <option value="OVERDUE">En retard</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={filters.typeFilter}
              onChange={(e) => setFilters({ ...filters, typeFilter: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les types</option>
              <option value="VAT">TVA</option>
              <option value="INCOME_TAX">Impôt sur le revenu</option>
              <option value="CORPORATE_TAX">Impôt sur les sociétés</option>
              <option value="SOCIAL_CONTRIBUTIONS">Cotisations sociales</option>
              <option value="OTHER_TAX">Autre taxe</option>
            </select>
          </div>

          {/* Items per page */}
          <div>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        {/* Reset Filters and Results count */}
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => {
              setFilters({ searchTerm: '', statusFilter: 'all', typeFilter: 'all' });
              setCurrentPage(1);
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Réinitialiser les filtres
          </button>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              {filteredTaxes.length} déclaration{filteredTaxes.length !== 1 ? 's' : ''} trouvée{filteredTaxes.length !== 1 ? 's' : ''}
            </div>
            {/* Export Dropdown */}
            <ExportTaxDropdown taxes={filteredTaxes} />
          </div>
        </div>
      </div>

      {/* Tax Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Référence
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type de taxe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Montant
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pénalités
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date déclaration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date paiement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedTaxes.map((tax) => (
                <tr key={tax.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Receipt className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{tax.referenceNumber}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{getTaxTypeLabel(tax.taxType)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-red-600">{formatCurrency(tax.taxAmount, tax.devise)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-red-600">
                      {tax.penalties > 0 ? formatCurrency(tax.penalties, tax.devise) : '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-1 text-sm text-gray-900">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span>{formatDate(tax.declarationDate)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{formatDate(tax.paymentDate)}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(tax.status)}`}>
                      {getStatusIcon(tax.status)}
                      <span className="ml-1">{getStatusLabel(tax.status)}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleViewClick(tax)}
                        className="text-blue-600 hover:text-blue-900 p-1"
                        title="Voir"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(tax)}
                        className="text-green-600 hover:text-green-900 p-1"
                        title="Modifier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Êtes-vous sûr de vouloir supprimer cette déclaration ?')) {
                            onDelete(tax.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-900 p-1"
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

        {paginatedTaxes.length === 0 && (
          <div className="text-center py-12">
            <Receipt className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Aucune déclaration trouvée</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-700">
              Page {currentPage} sur {totalPages}
            </span>
            <span className="text-sm text-gray-500">
              ({filteredTaxes.length} total)
            </span>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="secondary"
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex items-center space-x-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Précédent</span>
            </Button>
            <Button
              variant="secondary"
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center space-x-1"
            >
              <span>Suivant</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      <ViewDetailsModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, tax: null })}
        title="Détails de la Déclaration"
        data={viewModal.tax || {}}
        fields={[
          { key: 'id', label: 'ID' },
          { key: 'referenceNumber', label: 'Numéro de référence' },
          { key: 'taxType', label: 'Type de taxe' },
          { key: 'taxAmount', label: 'Montant de la taxe' },
          { key: 'penalties', label: 'Pénalités' },
          { key: 'devise', label: 'Devise' }, // Added devise field
          { key: 'declarationDate', label: 'Date de déclaration' },
          { key: 'paymentDate', label: 'Date de paiement' },
          { key: 'status', label: 'Statut' },
          { key: 'notes', label: 'Notes' },
          { key: 'createdAt', label: 'Créé le' },
          { key: 'updatedAt', label: 'Mis à jour le' }
        ]}
      />
    </div>
  );
};