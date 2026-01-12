import React, { useState, useMemo } from 'react';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import ViewDetailsModal from './ViewDetailsModal';
import ExportInvoiceDropdown from './ExportInvoiceDropdown';

interface LocalCompanyExpense {
  companyExpenseId: number;
  chargeType: string;
  employee?: {
    firstName: string;
    lastName: string;
  };
  amount: number;
  devise: string;
  paymentDate: string;
  status: string;
  description?: string;
  service?: string;
  attachment?: string;
}

interface CompanyExpense {
  companyExpenseId: number;
  chargeType: string;
  userId?: number;
  amount: number;
  devise: string; // Changed from currency to devise
  paymentDate: string;
  description?: string;
  status: string;
  service?: string;
  attachment?: string;
  employee?: {
    firstName: string;
    lastName: string;
    employeeNumber: string;
  };
}

interface CompanyExpenseListProps {
  companyExpenses: CompanyExpense[];
  onEdit: (expense: CompanyExpense) => void;
  onDelete: (id: number) => void;
  onView: (expense: CompanyExpense) => void;
}

const CompanyExpenseList: React.FC<CompanyExpenseListProps> = ({
  companyExpenses,
  onEdit,
  onDelete,
  onView
}) => {
  const [filters, setFilters] = useState({
    chargeType: '',
    status: '',
    search: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; expense: CompanyExpense | null }>({
    isOpen: false,
    expense: null,
  });
  const [viewModal, setViewModal] = useState<{ isOpen: boolean; expense: CompanyExpense | null }>({
    isOpen: false,
    expense: null,
  });

  const getChargeTypeText = (type: string) => {
    const types: Record<string, string> = {
      'APPOINTEMENTS_SALAIRES_ET_COMMISSIONS': 'Salaires et commissions',
      'CHARGES_SOCIALES_SUR_REMUNERATION_PERSONNEL_NATIONAL': 'Charges sociales',
      'PERSONNEL_DETACHE_OU_PRETE_A_L_ENTREPRISE_MANUTENTION': 'Personnel détaché',
      'PRESTATAIRE': 'Prestataire',
      'OTHER_CHARGE': 'Autre charge',
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

  const filteredExpenses = useMemo(() => {
    return companyExpenses.filter((expense) => {
      if (filters.chargeType && expense.chargeType !== filters.chargeType) return false;
      if (filters.status && expense.status !== filters.status) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const employeeName = expense.employee 
          ? `${expense.employee.firstName} ${expense.employee.lastName} ${expense.employee.employeeNumber}`.toLowerCase()
          : '';
        return (
          employeeName.includes(searchLower) ||
          (expense.description && expense.description.toLowerCase().includes(searchLower))
        );
      }
      return true;
    });
  }, [companyExpenses, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedExpenses = filteredExpenses.slice(startIndex, endIndex);


  return (
    <div className="space-y-4">
      {/* Filters Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Rechercher</label>
            <input
              type="text"
              placeholder="Employé, description..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type de Charge</label>
            <select
              value={filters.chargeType}
              onChange={(e) => setFilters({ ...filters, chargeType: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="APPOINTEMENTS_SALAIRES_ET_COMMISSIONS">Salaires et commissions</option>
              <option value="CHARGES_SOCIALES_SUR_REMUNERATION_PERSONNEL_NATIONAL">Charges sociales</option>
              <option value="PERSONNEL_DETACHE_OU_PRETE_A_L_ENTREPRISE_MANUTENTION">Personnel détaché</option>
              <option value="PRESTATAIRE">Prestataire</option>
              <option value="OTHER_CHARGE">Autre charge</option>
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
              setFilters({ chargeType: '', status: '', search: '' });
              setCurrentPage(1);
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Réinitialiser les filtres
          </button>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {filteredExpenses.length} charge(s) trouvée(s)
            </span>
            {/* Export Dropdown */}
            <ExportInvoiceDropdown 
              invoices={filteredExpenses.map(expense => ({
                companyExpenseId: expense.companyExpenseId,
                chargeType: expense.chargeType,
                employee: expense.employee ? {
                  firstName: expense.employee.firstName,
                  lastName: expense.employee.lastName
                } : undefined,
                amount: expense.amount,
                devise: expense.devise,
                paymentDate: expense.paymentDate,
                status: expense.status,
                description: expense.description,
                service: expense.service,
                attachment: expense.attachment
              }))} 
              invoiceType="companyexpenses" 
            />
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type Charge</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employé</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Paiement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedExpenses.map((expense) => (
                <tr key={expense.companyExpenseId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {expense.companyExpenseId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getChargeTypeText(expense.chargeType)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {expense.employee 
                      ? `${expense.employee.firstName} ${expense.employee.lastName}` 
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(expense.amount, expense.devise)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(expense.paymentDate).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(expense.status)}`}>
                      {getStatusText(expense.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setViewModal({ isOpen: true, expense })}
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        title="Voir"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(expense)}
                        className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                        title="Modifier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteModal({ isOpen: true, expense })}
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

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Précédent
              </button>
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
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
                  <span className="font-medium">{Math.min(endIndex, filteredExpenses.length)}</span> sur{' '}
                  <span className="font-medium">{filteredExpenses.length}</span> résultats
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Préc.
                  </button>
                  {[...Array(totalPages)].map((_, idx) => (
                    <button
                      key={idx + 1}
                      onClick={() => setCurrentPage(idx + 1)}
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
                    onClick={() => setCurrentPage(currentPage + 1)}
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
        onClose={() => setDeleteModal({ isOpen: false, expense: null })}
        onConfirm={() => {
          if (deleteModal.expense) {
            onDelete(deleteModal.expense.companyExpenseId);
            setDeleteModal({ isOpen: false, expense: null });
          }
        }}
        itemName={deleteModal.expense ? `Charge #${deleteModal.expense.companyExpenseId}` : ''}
      />

      {/* View Details Modal */}
      <ViewDetailsModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, expense: null })}
        title="Détails de la Charge"
        data={viewModal.expense || {}}
        fields={[
          { key: 'companyExpenseId', label: 'ID' },
          { key: 'chargeType', label: 'Type de charge' },
          { key: 'employee', label: 'Employé', render: (val: any) => val ? `${val.firstName} ${val.lastName}` : '-' },
          { key: 'amount', label: 'Montant' },
          { key: 'devise', label: 'Devise' },
          { key: 'paymentDate', label: 'Date de paiement', render: (val: string) => new Date(val).toLocaleDateString('fr-FR') },
          { key: 'status', label: 'Statut' },
          { key: 'description', label: 'Description' },
          { key: 'service', label: 'Service' },
          { key: 'attachment', label: 'Pièce jointe', render: (val: string) => val ? (
            <a
              href={val}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Voir
            </a>
          ) : '-' },
        ]}
      />
    </div>
  );
};

export default CompanyExpenseList;

