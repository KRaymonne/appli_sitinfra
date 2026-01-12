import React, { useState, Component, ErrorInfo, ReactNode } from 'react';
import { PageHeader } from '../components/Common/PageHeader';
import { Button } from '../components/Common/Button';
import { 
  CreditCard, 
  Plus,
  Eye,
  X,
  Landmark
} from 'lucide-react';

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

// Import bank forms
import {
  BankForm,
  BankTransactionForm,
} from '../Formscomponents/BankForms';

// Import list components
import { 
  BankList, 
  BankTransactionList,
} from '../Formscomponents/BankForms/lists';

// Import hooks for data selection
import { useBankSelection } from '../hooks/useBankSelection';

interface BankModule {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  color?: string;
  apiEndpoint?: string;
  formComponent: React.ComponentType<any>;
  listComponent?: React.ComponentType<any>;
}

export const Banks: React.FC = () => {
  const [activeModule, setActiveModule] = useState<string | null>('banks');
  const [showForm, setShowForm] = useState(false);
  const [showList, setShowList] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [moduleData, setModuleData] = useState<Record<string, any[]>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  // Data hooks for primary modules
  const { banks, loading: banksLoading, refetch: refetchBanks } = useBankSelection();

  // API endpoints map for all bank-related modules
  const endpointMap: Record<string, string> = {
    banks: '/.netlify/functions/Banks-banks',
    transactions: '/.netlify/functions/Banks-banktransactions',
  };

  // Primary key field names per module (for edit/delete)
  const idKeyMap: Record<string, string> = {
    banks: 'bankId',
    transactions: 'transactionId',
  };

  const modules: BankModule[] = [
    {
      id: 'banks',
      title: 'Comptes Bancaires',
      description: 'Gestion des comptes bancaires',
      icon: <Landmark className="w-6 h-6" />,
      color: 'bg-blue-500',
      apiEndpoint: endpointMap.banks,
      formComponent: BankForm,
      listComponent: BankList
    },
    {
      id: 'transactions',
      title: 'Transactions',
      description: 'Gestion des transactions bancaires',
      icon: <CreditCard className="w-6 h-6" />,
      color: 'bg-green-500',
      apiEndpoint: endpointMap.transactions,
      formComponent: BankTransactionForm,
      listComponent: BankTransactionList
    }
  ];

  const getCurrentModule = () => {
    if (activeModule && modules.find(m => m.id === activeModule)) {
      return modules.find(m => m.id === activeModule);
    }
    return null;
  };

  // Get the data key from API response (APIs return nested objects)
  const getDataKey = (moduleId: string): string => {
    const keyMap: Record<string, string> = {
      'banks': 'banks',
      'transactions': 'transactions',
    };
    return keyMap[moduleId] || moduleId;
  };

  // Fetch data for modules without hooks
  const fetchModuleData = async (moduleId: string) => {
    const endpoint = endpointMap[moduleId];
    if (!endpoint) {
      console.warn(`No endpoint found for module: ${moduleId}`);
      return;
    }

    setLoadingStates(prev => ({ ...prev, [moduleId]: true }));
    try {
      const response = await fetch(endpoint);
      if (response.ok) {
        const responseData = await response.json();
        
        // Extract the data array from the response object
        const dataKey = getDataKey(moduleId);
        let dataArray: any[] = [];
        
        if (Array.isArray(responseData)) {
          // Direct array response
          dataArray = responseData;
        } else if (responseData && typeof responseData === 'object') {
          // Nested object response (most common case)
          dataArray = responseData[dataKey] || [];
        }
        
        console.log(`Fetched ${moduleId}:`, dataArray.length, 'items');
        setModuleData(prev => ({ ...prev, [moduleId]: dataArray }));
      } else {
        console.error(`Failed to fetch ${moduleId}: ${response.status}`);
        setModuleData(prev => ({ ...prev, [moduleId]: [] }));
      }
    } catch (error) {
      console.error(`Error fetching ${moduleId} data:`, error);
      setModuleData(prev => ({ ...prev, [moduleId]: [] }));
    } finally {
      setLoadingStates(prev => ({ ...prev, [moduleId]: false }));
    }
  };

  const handleModuleClick = (moduleId: string) => {
    setActiveModule(moduleId);
    setEditingItem(null);
    const allModules = [...modules];
    const currentModule = allModules.find(m => m.id === moduleId);
    const hasList = currentModule?.listComponent !== undefined;
    
    // Initialize with empty array if data doesn't exist yet
    if (!['banks'].includes(moduleId) && hasList) {
      if (!moduleData[moduleId]) {
        setModuleData(prev => ({ ...prev, [moduleId]: [] }));
      }
      fetchModuleData(moduleId);
    }
    
    setShowList(hasList);
    setShowForm(!hasList);
  };

  const handleCreateNew = () => {
    setShowForm(true);
    setShowList(false);
    setEditingItem(null);
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
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
        if (activeModule === 'banks') refetchBanks();
        else fetchModuleData(activeModule);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleView = (item: any) => {
    // Show the form with pre-filled data for viewing/editing
    setEditingItem(item);
    setShowForm(true);
    setShowList(false);
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

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setShowForm(false);
        const allModules = [...modules];
        const currentModule = allModules.find(m => m.id === activeModule);
        const hasList = currentModule?.listComponent !== undefined;
        setShowList(hasList);
        setEditingItem(null);

        // Refetch data based on module
        if (activeModule === 'banks') refetchBanks();
        else fetchModuleData(activeModule);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const getCurrentData = () => {
    if (!activeModule) return [];
    
    switch (activeModule) {
      case 'banks': return banks || [];
      default: {
        const data = moduleData[activeModule];
        return Array.isArray(data) ? data : [];
      }
    }
  };

  const getCurrentLoading = () => {
    switch (activeModule) {
      case 'banks': return banksLoading;
      default: return loadingStates[activeModule || ''] || false;
    }
  };

  // Get the prop name for the list component
  const getListPropName = () => {
    switch (activeModule) {
      case 'banks': return 'banks';
      case 'transactions': return 'transactions';
      default: return 'data';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'CHECKING_ACCOUNT': return 'Compte courant';
      case 'SAVINGS_ACCOUNT': return 'Compte épargne';
      case 'PROJECT_ACCOUNT': return 'Compte projet';
      default: return type;
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const currentModule = (getCurrentModule() as BankModule | null);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion Bancaire" 
        subtitle="Gérez tous les comptes bancaires et transactions de l'entreprise"
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
            <div className="flex items-center space-x-2">
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
                  const currentModule = modules.find(m => m.id === activeModule);
                  const hasList = currentModule?.listComponent !== undefined;
                  setShowList(hasList);
                  setEditingItem(null);
                },
                initialData: editingItem,
                isEdit: !!editingItem,
                banks
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
                      Commencez par créer un nouvel élément
                    </p>
                    <Button onClick={handleCreateNew} className="flex items-center space-x-2">
                      <Plus className="w-4 h-4" />
                      <span>Créer le premier élément</span>
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


    </div>
  );
};

export default Banks;
