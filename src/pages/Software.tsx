import React, { Component, ErrorInfo, ReactNode, useEffect, useState } from 'react';
import { Monitor, Wrench, Users, Share2, FileText, Plus, Eye, X, BarChart3 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useUsersSelection } from '../hooks/useUsersSelection';
import { PageHeader } from '../components/Common/PageHeader';
import { Button } from '../components/Common/Button';
import {
  SoftwareForm,
  SoftwareMaintenanceForm,
  SoftwareContactForm,
  SoftwareAssignmentForm,
  SoftwareContractForm,
} from '../Formscomponents/SoftwareForms';
import { 
  SoftwareList,
  SoftwareMaintenanceList,
  SoftwareContactList,
  SoftwareAssignmentList,
  SoftwareContractList,
} from '../Formscomponents/SoftwareForms/lists';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Software module error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-sm text-red-800">
          Une erreur est survenue: {this.state.error?.message}
        </div>
      );
    }
    return this.props.children;
  }
}

interface ModuleConfig {
  id: 'softwares' | 'maintenance' | 'contacts' | 'assignments' | 'contracts' | 'statistics';
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  endpoint?: string;
  formComponent?: React.ComponentType<any>;
  listComponent?: React.ComponentType<any>;
}

const endpointMap: Record<string, string> = {
  softwares: '/.netlify/functions/Software-software',
  maintenance: '/.netlify/functions/Software-maintenance',
  contacts: '/.netlify/functions/Software-contacts',
  assignments: '/.netlify/functions/Software-assignments',
  contracts: '/.netlify/functions/Software-contracts',
};

const idKeyMap: Record<string, string> = {
  softwares: 'softwareId',
  maintenance: 'maintenanceId',
  contacts: 'contactId',
  assignments: 'assignmentId',
  contracts: 'contractId',
};

const listPropMap: Record<string, string> = {
  softwares: 'softwares',
  maintenance: 'maintenances',
  contacts: 'contacts',
  assignments: 'assignments',
  contracts: 'contracts',
};

const WORKCOUNTRY_OPTIONS = [
  'IVORY_COAST',
  'GHANA',
  'BENIN',
  'CAMEROON',
  'TOGO',
  'ROMANIE',
  'ITALIE',
];

const modules: ModuleConfig[] = [
  {
    id: 'softwares',
    title: 'Inventaire',
    description: 'Gestion des logiciels et licences',
    icon: <Monitor className="w-6 h-6 text-indigo-600" />,
    color: 'bg-indigo-100 text-indigo-800',
    endpoint: endpointMap.softwares,
    formComponent: SoftwareForm,
    listComponent: SoftwareList,
  },
  {
    id: 'maintenance',
    title: 'Maintenance',
    description: 'Contrats et interventions',
    icon: <Wrench className="w-6 h-6 text-blue-600" />,
    color: 'bg-blue-100 text-blue-800',
    endpoint: endpointMap.maintenance,
    formComponent: SoftwareMaintenanceForm,
    listComponent: SoftwareMaintenanceList,
  },
  {
    id: 'contacts',
    title: 'Contacts',
    description: 'Interlocuteurs et fournisseurs',
    icon: <Users className="w-6 h-6 text-emerald-600" />,
    color: 'bg-emerald-100 text-emerald-800',
    endpoint: endpointMap.contacts,
    formComponent: SoftwareContactForm,
    listComponent: SoftwareContactList,
  },
  {
    id: 'assignments',
    title: 'Affectations',
    description: 'Utilisation par utilisateur/service',
    icon: <Share2 className="w-6 h-6 text-purple-600" />,
    color: 'bg-purple-100 text-purple-800',
    endpoint: endpointMap.assignments,
    formComponent: SoftwareAssignmentForm,
    listComponent: SoftwareAssignmentList,
  },
  {
    id: 'contracts',
    title: 'Contrats',
    description: 'Gestion des contrats logiciels',
    icon: <FileText className="w-6 h-6 text-amber-600" />,
    color: 'bg-amber-100 text-amber-800',
    endpoint: endpointMap.contracts,
    formComponent: SoftwareContractForm,
    listComponent: SoftwareContractList,
  },
];

const mapCodeToEnum = (code: string): string => {
  switch (code) {
    case 'cameroun':
      return 'CAMEROON';
    case 'coteIvoire':
      return 'IVORY_COAST';
    case 'italie':
      return 'ITALIE';
    case 'ghana':
      return 'GHANA';
    case 'benin':
      return 'BENIN';
    case 'togo':
      return 'TOGO';
    case 'romanie':
      return 'ROMANIE';
    default:
      return 'CAMEROON';
  }
};

export function SoftwareManagement() {
  const { userId, effectiveCountryCode } = useAuth();
  const { users } = useUsersSelection();
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showList, setShowList] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [moduleData, setModuleData] = useState<Record<string, any[]>>({});
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const getModule = (id?: string | null) => modules.find((m) => m.id === id) || null;
  const currentModule = getModule(activeModule);

  const ensureSoftwaresLoaded = async () => {
    if (!moduleData.softwares) {
      // Load softwares for dropdowns in forms
      setLoadingStates((prev) => ({ ...prev, softwares: true }));
      try {
        const response = await fetch(endpointMap.softwares + '?limit=1000');
        if (response.ok) {
          const payload = await response.json();
          const normalized = Array.isArray(payload)
            ? payload
            : payload.softwares || [];
          setModuleData((prev) => ({ ...prev, softwares: normalized }));
        }
      } catch (error) {
        console.error('Error loading softwares:', error);
      } finally {
        setLoadingStates((prev) => ({ ...prev, softwares: false }));
      }
    }
  };

  const handleModuleClick = (moduleId: string) => {
    const moduleConfig = getModule(moduleId);
    if (!moduleConfig) return;

    // Load softwares for dependent modules (maintenance, contacts, assignments, contracts)
    if (moduleId !== 'softwares' && moduleId !== 'statistics') {
      ensureSoftwaresLoaded();
    }

    setActiveModule(moduleId);
    setEditingItem(null);
    setShowForm(false);
    setShowList(Boolean(moduleConfig.listComponent));
  };

  const handleCreateNew = () => {
    if (!currentModule?.formComponent) return;
    if (currentModule.id !== 'softwares') {
      ensureSoftwaresLoaded();
    }
    setEditingItem(null);
    setShowForm(true);
    setShowList(false);
  };

  const handleEdit = (item: any) => {
    if (!currentModule?.formComponent) return;
    setEditingItem(item);
    setShowForm(true);
    setShowList(false);
  };

  const handleDelete = async (id: number) => {
    if (!activeModule) return;
    const endpoint = endpointMap[activeModule];
    if (!endpoint) return;
    try {
      const response = await fetch(`${endpoint}?id=${id}`, { method: 'DELETE' });
      if (response.ok) {
        // Lists will refetch automatically via their useServerPagination hooks
        // Just reload softwares if we deleted a software (for dropdowns)
        if (activeModule === 'softwares') {
          ensureSoftwaresLoaded();
        }
      }
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleFormSubmit = async (data: any) => {
    if (!activeModule) return;
    const endpoint = endpointMap[activeModule];
    if (!endpoint) return;

    const idKey = idKeyMap[activeModule];
    const currentId = editingItem ? editingItem[idKey] : undefined;
    const url = currentId ? `${endpoint}?id=${currentId}` : endpoint;
    const method = currentId ? 'PUT' : 'POST';

    const payload = {
      ...data,
      Inserteridentity: userId,
      InserterCountry: mapCodeToEnum(effectiveCountryCode),
    };

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        setShowForm(false);
        setShowList(Boolean(currentModule?.listComponent));
        setEditingItem(null);
        // Lists will refetch automatically via their useServerPagination hooks
        // Just reload softwares if we created/updated a software (for dropdowns)
        if (activeModule === 'softwares') {
          ensureSoftwaresLoaded();
        }
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const handleView = (item: any) => {
    console.info('Software item:', item);
  };

  // Note: Lists now handle their own data fetching via useServerPagination
  // We only need moduleData for softwares (for dropdowns in forms)
  const listPropName = listPropMap[currentModule?.id || 'softwares'];

  const additionalFormProps = (() => {
    switch (currentModule?.id) {
      case 'maintenance':
        return { softwares: moduleData.softwares || [] };
      case 'contacts':
        return { softwares: moduleData.softwares || [] };
      case 'assignments':
        return { softwares: moduleData.softwares || [], users };
      case 'contracts':
        return { softwares: moduleData.softwares || [] };
      default:
        return {};
    }
  })();

  useEffect(() => {
    handleModuleClick('softwares');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
    
    return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion des logiciels"
        subtitle="Centralisez achats, contrats et affectations de vos solutions métiers."
      />

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200 px-4">
        <nav className="flex -mb-px overflow-x-auto">
            {modules.map((module) => (
            <button
                key={module.id}
                onClick={() => handleModuleClick(module.id)}
              className={`px-3 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex items-center space-x-1.5 ${
                  activeModule === module.id
                    ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span>{module.icon}</span>
              <span>{module.title}</span>
            </button>
          ))}
        </nav>
        </div>
      </div>

      {activeModule && currentModule && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${currentModule.color}`}>
                {currentModule.icon}
              </div>
              <div>
              <h2 className="text-xl font-semibold text-gray-900">
                  {currentModule.title}
              </h2>
                <p className="text-sm text-gray-500">{currentModule.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Country filter removed - lists handle their own filters via useServerPagination */}
              {showList && currentModule.formComponent && (
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
                    setShowList(Boolean(currentModule.listComponent));
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
            
          
          {showForm && currentModule.formComponent && (
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-indigo-800">
                Mode {editingItem ? 'édition' : 'création'}
              </div>
              {React.createElement(currentModule.formComponent, {
                onSubmit: handleFormSubmit,
                initialData: editingItem,
                isEdit: Boolean(editingItem),
                ...additionalFormProps,
              })}
          </div>
      )}

          {showList && currentModule.listComponent && (
            <ErrorBoundary>
              <div className="min-h-[200px]">
                {React.createElement(currentModule.listComponent, {
                  [listPropName]: [], // Lists fetch their own data via useServerPagination
                  onEdit: currentModule.formComponent ? handleEdit : undefined,
                  onDelete: handleDelete,
                  onView: handleView,
                })}
              </div>
            </ErrorBoundary>
          )}
        </div>
      )}
    </div>
  );
}

