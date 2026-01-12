import React, { useState, useEffect, Component, ErrorInfo, ReactNode } from 'react';
import { PageHeader } from '../components/Common/PageHeader';
import { Button } from '../components/Common/Button';
import { 
  Bell,
  AlertTriangle,
  Plus,
  Eye,
  X
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

// Import alert forms
import {
  AlertForm,
  AlertList
} from '../Formscomponents/AlertForms';

interface AlertModule {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  color?: string;
  apiEndpoint?: string;
  formComponent: React.ComponentType<any>;
  listComponent?: React.ComponentType<any>;
}

const Alerts: React.FC = () => {
  const [activeModule, setActiveModule] = useState<string | null>('alerts');
  const [showForm, setShowForm] = useState(false);
  const [showList, setShowList] = useState(true);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [moduleData, setModuleData] = useState<Record<string, any[]>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  // API endpoints map for alert modules
  const endpointMap: Record<string, string> = {
    alerts: '/.netlify/functions/Alert-alerts',
  };

  // Primary key field names per module
  const idKeyMap: Record<string, string> = {
    alerts: 'alertId',
  };

  const modules: AlertModule[] = [
    {
      id: 'alerts',
      title: 'Alertes',
      description: 'Gestion des alertes et échéances',
      icon: <Bell className="w-6 h-6" />,
      color: 'bg-red-500',
      apiEndpoint: endpointMap.alerts,
      formComponent: AlertForm,
      listComponent: AlertList
    }
  ];

  const getCurrentModule = () => {
    return modules.find(m => m.id === activeModule) || null;
  };

  // Get the data key from API response
  const getDataKey = (moduleId: string): string => {
    const keyMap: Record<string, string> = {
      'alerts': 'alerts',
    };
    return keyMap[moduleId] || moduleId;
  };

  // Fetch data for modules
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
    const currentModule = modules.find(m => m.id === moduleId);
    const hasList = currentModule?.listComponent !== undefined;
    
    // Initialize with empty array if data doesn't exist yet
    if (hasList) {
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
        fetchModuleData(activeModule);
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

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        setShowForm(false);
        const currentModule = modules.find(m => m.id === activeModule);
        const hasList = currentModule?.listComponent !== undefined;
        setShowList(hasList);
        setEditingItem(null);

        fetchModuleData(activeModule);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const getCurrentData = () => {
    if (!activeModule) return [];
    const data = moduleData[activeModule];
    return Array.isArray(data) ? data : [];
  };

  const getCurrentLoading = () => {
    return loadingStates[activeModule || ''] || false;
  };

  // Load alerts data on component mount
  useEffect(() => {
    if (activeModule === 'alerts') {
      fetchModuleData('alerts');
    }
  }, [activeModule]);

  // Get the prop name for the list component
  const getListPropName = () => {
    switch (activeModule) {
      case 'alerts': return 'alerts';
      default: return 'data';
    }
  };

  const currentModule = getCurrentModule() as AlertModule | null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des Alertes" 
        subtitle="Gérez toutes les alertes et échéances de l'entreprise"
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
                    ? 'border-red-500 text-red-600'
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
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  Mode: {editingItem ? 'Édition' : 'Création'} | Module: {activeModule}
                </p>
              </div>
              {React.createElement(currentModule.formComponent, {
                onSubmit: handleFormSubmit,
                initialData: editingItem,
                isEdit: !!editingItem,
              })}
            </div>
          )}

          {/* List View */}
          {showList && currentModule && currentModule.listComponent && (
            <ErrorBoundary>
              <div>
                {getCurrentLoading() ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                  </div>
                ) : getCurrentData().length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="text-gray-400 mb-4">
                      <AlertTriangle className="w-16 h-16 mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Aucune alerte disponible
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Commencez par créer une nouvelle alerte
                    </p>
                    <Button onClick={handleCreateNew} className="flex items-center space-x-2">
                      <Plus className="w-4 h-4" />
                      <span>Créer la première alerte</span>
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

export default Alerts;
