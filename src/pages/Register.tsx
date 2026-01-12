import React, { useState, Component, ErrorInfo, ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/Common/PageHeader';
import { Button } from '../components/Common/Button';
import { Wallet, Plus, Eye, X } from 'lucide-react';

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

import { RegisterForm, TransactionForm } from '../Formscomponents/RegisterForms';
import { RegisterList, TransactionList } from '../Formscomponents/RegisterForms/lists';
import { useRegisterSelection } from '../hooks/useRegisterSelection';
import { useUsersSelection } from '../hooks/useUsersSelection';

interface RegisterModule {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  color?: string;
  apiEndpoint?: string;
  formComponent: React.ComponentType<any>;
  listComponent?: React.ComponentType<any>;
}

const Register: React.FC = () => {
  const [activeModule, setActiveModule] = useState<string | null>('registers');
  const [showForm, setShowForm] = useState(false);
  const [showList, setShowList] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [moduleData, setModuleData] = useState<Record<string, any[]>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [insertCountryFilter, setInsertCountryFilter] = useState<string>('');
  const WORKCOUNTRY_OPTIONS = ['IVORY_COAST','GHANA','BENIN','CAMEROON','TOGO','ROMANIE','ITALIE'];
  const { userId, effectiveCountryCode } = useAuth();

  const { registers, loading: registersLoading, refetch: refetchRegisters } = useRegisterSelection();
  const { users } = useUsersSelection();

  const endpointMap: Record<string, string> = {
    registers: '/.netlify/functions/register-registers',
    transactions: '/.netlify/functions/register-transactions',
  };

  const idKeyMap: Record<string, string> = {
    registers: 'registerId',
    transactions: 'transactionId',
  };

  const modules: RegisterModule[] = [
    {
      id: 'registers',
      title: 'Caisses',
      description: 'Gestion des caisses de l\'entreprise',
      icon: <Wallet className="w-6 h-6" />,
      color: 'bg-purple-500',
      apiEndpoint: endpointMap.registers,
      formComponent: RegisterForm,
      listComponent: RegisterList
    },
    {
      id: 'transactions',
      title: 'Transactions',
      description: 'Gestion des transactions',
      icon: <Wallet className="w-6 h-6" />,
      color: 'bg-green-500',
      apiEndpoint: endpointMap.transactions,
      formComponent: TransactionForm,
      listComponent: TransactionList
    }
  ];

  const getCurrentModule = () => {
    return modules.find(m => m.id === activeModule) || null;
  };

  const getDataKey = (moduleId: string): string => {
    const keyMap: Record<string, string> = {
      'registers': 'registers',
      'transactions': 'transactions',
    };
    return keyMap[moduleId] || moduleId;
  };

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
        const dataKey = getDataKey(moduleId);
        let dataArray: any[] = [];
        
        if (Array.isArray(responseData)) {
          dataArray = responseData;
        } else if (responseData && typeof responseData === 'object') {
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
    const currentModule = modules.find(m => m.id === moduleId);
    const hasList = currentModule?.listComponent !== undefined;
    
    if (moduleId !== 'registers' && hasList) {
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
        if (activeModule === 'registers') refetchRegisters();
        else fetchModuleData(activeModule);
      }
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const handleView = (item: any) => {
    console.log('View item:', item);
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

        if (activeModule === 'registers') refetchRegisters();
        else fetchModuleData(activeModule);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const getCurrentData = () => {
    if (!activeModule) return [];
    const applyFilter = (arr: any[]) => insertCountryFilter ? arr.filter((x: any) => x.InserterCountry === insertCountryFilter) : arr;
    switch (activeModule) {
      case 'registers': {
        const data = registers || [];
        return applyFilter(Array.isArray(data) ? data : []);
      }
      default: {
        const data = moduleData[activeModule];
        return applyFilter(Array.isArray(data) ? data : []);
      }
    }
  };

  const getCurrentLoading = () => {
    switch (activeModule) {
      case 'registers': return registersLoading;
      default: return loadingStates[activeModule || ''] || false;
    }
  };

  const getListPropName = () => {
    switch (activeModule) {
      case 'registers': return 'registers';
      case 'transactions': return 'transactions';
      default: return 'data';
    }
  };

  const currentModule = getCurrentModule() as RegisterModule | null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des Caisses" 
        subtitle="Gérez toutes les caisses et transactions de l'entreprise"
      />

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

      {activeModule && currentModule && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              {currentModule.icon}
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
                <Button variant="secondary" onClick={() => { setShowForm(false); setShowList(true); setEditingItem(null); }} className="flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>Voir la liste</span>
                </Button>
              )}
              <Button variant="secondary" onClick={() => { setActiveModule(null); setShowForm(false); setShowList(false); setEditingItem(null); }}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {showForm && currentModule && (
            <div className="mb-6">
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  Mode: {editingItem ? 'Édition' : 'Création'} | Module: {currentModule.title}
                </p>
              </div>
              {React.createElement(currentModule.formComponent, {
                onSubmit: handleFormSubmit,
                initialData: editingItem,
                isEdit: !!editingItem,
                users,
                registers,
                onCancel: () => {
                  setShowForm(false);
                  setShowList(true);
                  setEditingItem(null);
                }
              })}
            </div>
          )}

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
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune donnée disponible</h3>
                    <p className="text-gray-500 mb-4">Commencez par créer un nouvel élément</p>
                    <Button onClick={handleCreateNew} className="flex items-center space-x-2">
                      <Plus className="w-4 h-4" />
                      <span>Créer la première caisse</span>
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

export default Register;

