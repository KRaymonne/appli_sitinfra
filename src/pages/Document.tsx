import React, { Component, ErrorInfo, ReactNode, useEffect, useState } from 'react';
import { FileText, Plus, Eye, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/Common/PageHeader';
import { Button } from '../components/Common/Button';
import {
  DocumentForm,
} from '../Formscomponents/DocumentForms';
import {
  DocumentList,
} from '../Formscomponents/DocumentForms/lists';

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
    console.error('Document module error:', error, errorInfo);
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
  id: 'documents';
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  endpoint?: string;
  formComponent?: React.ComponentType<any>;
  listComponent?: React.ComponentType<any>;
}

const endpointMap: Record<string, string> = {
  documents: '/.netlify/functions/Document-documents',
};

const idKeyMap: Record<string, string> = {
  documents: 'documentId',
};

const listPropMap: Record<string, string> = {
  documents: 'documents',
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
    id: 'documents',
    title: 'Documents',
    description: 'Liste des documents + création + gestion',
    icon: <FileText className="w-6 h-6 text-blue-600" />,
    color: 'bg-blue-100 text-blue-800',
    endpoint: endpointMap.documents,
    formComponent: DocumentForm,
    listComponent: DocumentList,
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

export function DocumentManagement() {
  const { userId, effectiveCountryCode } = useAuth();
  const [activeModule, setActiveModule] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showList, setShowList] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const getModule = (id?: string | null) => modules.find((m) => m.id === id) || null;
  const currentModule = getModule(activeModule);

  const handleModuleClick = (moduleId: string) => {
    const moduleConfig = getModule(moduleId);
    if (!moduleConfig) return;

    setActiveModule(moduleId);
    setEditingItem(null);
    setShowForm(false);
    setShowList(Boolean(moduleConfig.listComponent));
  };

  const handleCreateNew = () => {
    if (!currentModule?.formComponent) return;
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
      }
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const handleView = (item: any) => {
    console.info('Document item:', item);
  };

  // Note: Lists now handle their own data fetching via useServerPagination
  const listPropName = listPropMap[currentModule?.id || 'documents'];

  const additionalFormProps = {};

  useEffect(() => {
    handleModuleClick('documents');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestion documentaire"
        subtitle="Gestion complète des documents avec filtres par statut, entité et type"
      />

      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200 px-4">
          <nav className="flex -mb-px overflow-x-auto">
            {modules.map((module) => (
              <button
                key={module.id}
                onClick={() => handleModuleClick(module.id)}
                className={`px-3 py-2.5 text-xs sm:text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeModule === module.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <span>{module.icon}</span>
                  <span>{module.title}</span>
                </div>
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
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
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
