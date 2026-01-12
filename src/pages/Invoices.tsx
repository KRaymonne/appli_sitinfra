import React, { useState, Component, ErrorInfo, ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/Common/PageHeader';
import { Button } from '../components/Common/Button';
import { 
  FileText, 
  Users,
  Package,
  Plus,
  Eye,
  X
} from 'lucide-react';

// Import ViewDetailsModal
import { ViewDetailsModal } from '../Formscomponents/InvoiceForms/lists';

// Error Boundary Component
interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center p-8 bg-red-50 rounded-lg border border-red-200">
          <div className="text-red-600 text-lg font-semibold mb-2">
            Une erreur s'est produite
          </div>
          <div className="text-red-500 text-sm mb-4">
            {this.state.error?.message || 'Erreur inconnue'}
          </div>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Import invoice forms
import {
  ProfessionalServiceForm,
  CompanyExpenseForm,
  OtherInvoiceForm
} from '../Formscomponents/InvoiceForms';

// Import list components
import { 
  ProfessionalServiceList,
  CompanyExpenseList,
  OtherInvoiceList
} from '../Formscomponents/InvoiceForms/lists';

// Import hooks for data selection
import { useProfessionalServiceSelection } from '../hooks/useProfessionalServiceSelection';
import { useCompanyExpenseSelection } from '../hooks/useCompanyExpenseSelection';
import { useOtherInvoiceSelection } from '../hooks/useOtherInvoiceSelection';
import { useUsersSelection } from '../hooks/useUsersSelection';
import { useContactSelection } from '../hooks/useContactSelection';

interface InvoiceModule {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  color?: string;
  apiEndpoint?: string;
  formComponent: React.ComponentType<any>;
  listComponent?: React.ComponentType<any>;
}

export function Invoices() {
  const [activeModule, setActiveModule] = useState<string | null>('professionalservices');
  const [showForm, setShowForm] = useState(false);
  const [showList, setShowList] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [viewItem, setViewItem] = useState<any>(null); // Added viewItem state
  const [insertCountryFilter, setInsertCountryFilter] = useState<string>('');
  const WORKCOUNTRY_OPTIONS = ['IVORY_COAST','GHANA','BENIN','CAMEROON','TOGO','ROMANIE','ITALIE'];
  const { userId, effectiveCountryCode } = useAuth();

  // Data hooks for all invoice types
  const { professionalServices, loading: servicesLoading, refetch: refetchServices } = useProfessionalServiceSelection();
  const { companyExpenses, loading: expensesLoading, refetch: refetchExpenses } = useCompanyExpenseSelection();
  const { otherInvoices, loading: otherLoading, refetch: refetchOther } = useOtherInvoiceSelection();
  
  // Data hooks for foreign keys
  const { users } = useUsersSelection();
  const { contacts } = useContactSelection();

  // API endpoints map
  const endpointMap: Record<string, string> = {
    professionalservices: '/.netlify/functions/Invoice-professionalservices',
    companyexpenses: '/.netlify/functions/Invoice-companyexpenses',
    otherinvoices: '/.netlify/functions/Invoice-otherinvoices',
  };

  // Primary key field names per module
  const idKeyMap: Record<string, string> = {
    professionalservices: 'professionalServiceId',
    companyexpenses: 'companyExpenseId',
    otherinvoices: 'otherInvoiceId',
  };

  const modules: InvoiceModule[] = [
    {
      id: 'professionalservices',
      title: 'Services Professionnels',
      description: 'Gestion des factures de services professionnels',
      icon: <FileText className="w-6 h-6" />,
      color: 'bg-purple-500',
      apiEndpoint: endpointMap.professionalservices,
      formComponent: ProfessionalServiceForm,
      listComponent: ProfessionalServiceList
    },
    {
      id: 'companyexpenses',
      title: 'Charges Entreprise',
      description: 'Gestion des charges de l\'entreprise',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-blue-500',
      apiEndpoint: endpointMap.companyexpenses,
      formComponent: CompanyExpenseForm,
      listComponent: CompanyExpenseList
    },
    {
      id: 'otherinvoices',
      title: 'Autres Factures',
      description: 'Gestion des autres types de factures',
      icon: <Package className="w-6 h-6" />,
      color: 'bg-green-500',
      apiEndpoint: endpointMap.otherinvoices,
      formComponent: OtherInvoiceForm,
      listComponent: OtherInvoiceList
    }
  ];

  const getCurrentModule = () => {
    return modules.find(m => m.id === activeModule);
  };

  const handleModuleClick = (moduleId: string) => {
    setActiveModule(moduleId);
    setEditingItem(null);
    setViewItem(null); // Reset view item
    const currentModule = modules.find(m => m.id === moduleId);
    const hasList = currentModule?.listComponent !== undefined;
    
    setShowList(hasList);
    setShowForm(!hasList);
  };

  const handleCreateNew = () => {
    setShowForm(true);
    setShowList(false);
    setEditingItem(null);
    setViewItem(null); // Reset view item
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setViewItem(null); // Reset view item
    setShowForm(true);
    setShowList(false);
  };

  const handleDelete = async (id: number) => {
    if (!activeModule) return;
    try {
      const endpoint = endpointMap[activeModule];
      if (!endpoint) return;
      const response = await fetch(`${endpoint}?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        // Refetch data based on module
        if (activeModule === 'professionalservices') refetchServices();
        else if (activeModule === 'companyexpenses') refetchExpenses();
        else if (activeModule === 'otherinvoices') refetchOther();
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleView = (item: any) => {
    setViewItem(item); // Set the item to view
  };

  const handleFormSubmit = async (data: any) => {
    try {
      if (!activeModule) return;
      const endpoint = endpointMap[activeModule];
      if (!endpoint) return;

      const idKey = idKeyMap[activeModule];
      const currentId = editingItem ? editingItem[idKey] : undefined;
      const url = currentId ? `${endpoint}?id=${currentId}` : endpoint;
      const method = currentId ? 'PUT' : 'POST';

      const mapCodeToEnum = (code: string): string => {
        switch (code) {
          case 'cameroun': return 'CAMEROON';
          case 'coteIvoire': return 'IVORY_COAST';
          case 'italie': return 'ITALIE';
          case 'ghana': return 'GHANA';
          case 'benin': return 'BENIN';
          case 'togo': return 'TOGO';
          case 'romanie': return 'ROMANIE';
          default: return 'CAMEROON';
        }
      };
      const payload = {
        ...data,
        Inserteridentity: userId != null ? String(userId) : null,
        InserterCountry: mapCodeToEnum(effectiveCountryCode)
      };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowForm(false);
        const currentModule = modules.find(m => m.id === activeModule);
        const hasList = currentModule?.listComponent !== undefined;
        setShowList(hasList);
        setEditingItem(null);
        setViewItem(null); // Reset view item

        // Refetch data based on module
        if (activeModule === 'professionalservices') refetchServices();
        else if (activeModule === 'companyexpenses') refetchExpenses();
        else if (activeModule === 'otherinvoices') refetchOther();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const getCurrentData = () => {
    if (!activeModule) return [];
    const applyFilter = (arr: any[]) => insertCountryFilter ? arr.filter((x: any) => x.InserterCountry === insertCountryFilter) : arr;
    switch (activeModule) {
      case 'professionalservices': return applyFilter(professionalServices || []);
      case 'companyexpenses': return applyFilter(companyExpenses || []);
      case 'otherinvoices': return applyFilter(otherInvoices || []);
      default: return [];
    }
  };

  const getCurrentLoading = () => {
    switch (activeModule) {
      case 'professionalservices': return servicesLoading;
      case 'companyexpenses': return expensesLoading;
      case 'otherinvoices': return otherLoading;
      default: return false;
    }
  };

  const getListPropName = () => {
    switch (activeModule) {
      case 'professionalservices': return 'professionalServices';
      case 'companyexpenses': return 'companyExpenses';
      case 'otherinvoices': return 'otherInvoices';
      default: return 'data';
    }
  };

  // Get view modal title based on module
  const getViewModalTitle = () => {
    switch (activeModule) {
      case 'professionalservices': return 'Détails du Service';
      case 'companyexpenses': return 'Détails de la Charge';
      case 'otherinvoices': return 'Détails de la Facture';
      default: return 'Détails';
    }
  };

  // Get view modal fields based on module
  const getViewModalFields = () => {
    switch (activeModule) {
      case 'professionalservices':
        return [
          { key: 'professionalServiceId', label: 'ID' },
          { key: 'invoiceNumber', label: 'Numéro de facture' },
          { key: 'serviceType', label: 'Type de service' },
          { key: 'supplier', label: 'Fournisseur' },
          { key: 'amount', label: 'Montant' },
          { key: 'devise', label: 'Devise' },
          { key: 'invoiceDate', label: 'Date de facture' },
          { key: 'paymentDate', label: 'Date de paiement' },
          { key: 'status', label: 'Statut' },
          { key: 'description', label: 'Description' },
          { key: 'paymentMethod', label: 'Méthode de paiement' },
        ];
      case 'companyexpenses':
        return [
          { key: 'companyExpenseId', label: 'ID' },
          { key: 'chargeType', label: 'Type de charge' },
          { key: 'employee', label: 'Employé', render: (val: any) => val ? `${val.firstName} ${val.lastName}` : '-' },
          { key: 'amount', label: 'Montant' },
          { key: 'devise', label: 'Devise' },
          { key: 'paymentDate', label: 'Date de paiement' },
          { key: 'status', label: 'Statut' },
          { key: 'description', label: 'Description' },
          { key: 'service', label: 'Service' },
          { key: 'attachment', label: 'Pièce jointe (URL)' },
        ];
      case 'otherinvoices':
        return [
          { key: 'otherInvoiceId', label: 'ID' },
          { key: 'invoiceNumber', label: 'Numéro de facture' },
          { key: 'category', label: 'Catégorie' },
          { key: 'supplier', label: 'Fournisseur' },
          { key: 'supplierContact', label: 'Contact fournisseur', render: (val: any) => val ? `${val.firstName} ${val.lastName}` : '-' },
          { key: 'amount', label: 'Montant' },
          { key: 'devise', label: 'Devise' },
          { key: 'invoiceDate', label: 'Date de facture' },
          { key: 'paymentDate', label: 'Date de paiement' },
          { key: 'status', label: 'Statut' },
          { key: 'description', label: 'Description' },
          { key: 'service', label: 'Service' },
          { key: 'attachment', label: 'Pièce jointe (URL)' },
        ];
      default:
        return [];
    }
  };

  const currentModule = getCurrentModule() as InvoiceModule | null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des Factures" 
        subtitle="Gérez toutes les factures et charges de l'entreprise"
      />

      {/* Top module tabs */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200 px-4">
          <nav className="flex -mb-px overflow-x-auto">
            {modules.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleModuleClick(tab.id)}
                className={`px-3 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeModule === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.title}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Active Module Content */}
      {activeModule && currentModule && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              {currentModule.icon ? currentModule.icon : null}
              <h2 className="text-xl font-semibold text-gray-900">{currentModule.title}</h2>
            </div>
            <div className="flex items-center space-x-3">
              {showList && (
                <select
                  value={insertCountryFilter}
                  onChange={(e) => setInsertCountryFilter(e.target.value)}
                  className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Tous les pays (InserterCountry)</option>
                  {WORKCOUNTRY_OPTIONS.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              )}
              {showList && (
                <Button onClick={handleCreateNew} className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Nouveau</span>
                </Button>
              )}
              {showForm && (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowForm(false);
                    setShowList(true);
                    setEditingItem(null);
                    setViewItem(null); // Reset view item
                  }}
                  className="flex items-center space-x-2"
                >
                  <Eye className="w-4 h-4" />
                  <span>Voir la liste</span>
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={() => {
                  setActiveModule(null);
                  setShowForm(false);
                  setShowList(false);
                  setEditingItem(null);
                  setViewItem(null); // Reset view item
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Form View */}
          {showForm && currentModule && (
            <div className="mb-6">
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  Mode: {editingItem ? 'Édition' : 'Création'} | Module: {activeModule}
                </p>
              </div>
              {React.createElement(currentModule.formComponent, {
                onSubmit: handleFormSubmit,
                onCancel: () => {
                  setShowForm(false);
                  setShowList(true);
                  setEditingItem(null);
                  setViewItem(null);
                },
                initialData: editingItem,
                isEdit: !!editingItem,
                users,
                contacts
              })}
            </div>
          )}

          {/* List View */}
          {showList && currentModule && currentModule.listComponent && (
            <ErrorBoundary>
              <div>
                {getCurrentLoading() ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : getCurrentData().length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Aucune donnée disponible
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Commencez par créer une nouvelle facture
                    </p>
                    <Button onClick={handleCreateNew} className="flex items-center space-x-2">
                      <Plus className="w-4 h-4" />
                      <span>Créer la première facture</span>
                    </Button>
                  </div>
                ) : (
                  <div className="min-h-[200px]">
                    {React.createElement(currentModule.listComponent, {
                      [getListPropName()]: getCurrentData(),
                      onEdit: handleEdit,
                      onDelete: handleDelete,
                      onView: handleView
                    })}
                  </div>
                )}
              </div>
            </ErrorBoundary>
          )}
        </div>
      )}

      {/* View Details Modal */}
      <ViewDetailsModal
        isOpen={!!viewItem}
        onClose={() => setViewItem(null)}
        title={getViewModalTitle()}
        data={viewItem || {}}
        fields={getViewModalFields()}
      />
    </div>
  );
}

export default Invoices;