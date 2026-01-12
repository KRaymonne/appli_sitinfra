import React, { useState, useEffect, useRef } from 'react';
import { Edit2, Eye, Search, Trash2, X } from 'lucide-react';
import { useServerPagination } from '../../../hooks/useServerPagination';

interface Document {
  documentId: number;
  version?: string;
  date: string;
  title: string;
  createdBy: string;
  verifiedBy?: string;
  validatedBy?: string;
  fileName?: string;
  fileSize?: string;
  filePath?: string;
  status: 'ACTIVE' | 'OBSOLETE' | 'DRAFT' | 'ARCHIVE';
  entity?: string;
  countryCode?: string;
  documentType?: string;
  documentNumber?: string;
  description?: string;
}

interface DocumentListProps {
  documents?: Document[];
  onEdit?: (document: Document) => void;
  onDelete?: (id: number) => void;
  onView?: (document: Document) => void;
}

const statusColorMap: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  OBSOLETE: 'bg-red-100 text-red-800',
  DRAFT: 'bg-yellow-100 text-yellow-800',
  ARCHIVE: 'bg-gray-100 text-gray-800',
};

const statusLabelMap: Record<string, string> = {
  ACTIVE: 'Actif',
  OBSOLETE: 'Obsolète',
  DRAFT: 'Brouillon',
  ARCHIVE: 'Archivé',
};

const documentTypeLabelMap: Record<string, string> = {
  PROCEDURE: 'Procédure',
  POLICY: 'Politique',
  MANUAL: 'Manuel',
  CONTRACT: 'Contrat',
  REPORT: 'Rapport',
};

const entityLabelMap: Record<string, string> = {
  SIL: 'SITALIA',
  GEO: 'GEOTOP',
  SIT: 'SITINFRA',
  GRP: 'Groupe',
};

const DocumentList: React.FC<DocumentListProps> = ({
  documents = [],
  onEdit,
  onDelete,
  onView,
}) => {
  const {
    data: serverData,
    pagination,
    loading,
    updateFilters,
    goToPage,
    changePageSize,
    refetch,
  } = useServerPagination({
    endpoint: '/.netlify/functions/Document-documents',
    initialParams: {
      search: '',
      status: '',
      documentType: '',
      entity: '',
    },
  });

  const [localFilters, setLocalFilters] = useState({
    search: '',
    status: '',
    documentType: '',
    entity: '',
  });
  const hasActions = Boolean(onEdit || onDelete || onView);

  const [viewModal, setViewModal] = useState<{ isOpen: boolean; document: Document | null }>({
    isOpen: false,
    document: null,
  });

  const [viewingFile, setViewingFile] = useState<{ url: string; isLocal: boolean; fileType: 'image' | 'pdf' | 'other' } | null>(null);
  const [pdfError, setPdfError] = useState(false);
  const pdfTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeout on unmount or when file changes
  useEffect(() => {
    return () => {
      if (pdfTimeoutRef.current) {
        clearTimeout(pdfTimeoutRef.current);
      }
    };
  }, [viewingFile]);

  // Close file viewer when modal closes
  useEffect(() => {
    if (!viewModal.isOpen) {
      setViewingFile(null);
      setPdfError(false);
    }
  }, [viewModal.isOpen]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateFilters(localFilters);
    }, localFilters.search ? 300 : 0);
    return () => clearTimeout(timeoutId);
  }, [localFilters, updateFilters]);

  const displayData = serverData.length > 0 ? serverData : documents;

  const handlePageChange = (page: number) => {
    goToPage(page);
  };

  const handleViewClick = (document: Document) => {
    setViewModal({ isOpen: true, document });
  };

  if (loading && serverData.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const formatDate = (value: string) => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('fr-FR');
  };

  const isLocalFile = (url: string | null | undefined): boolean => {
    if (!url || typeof url !== 'string') return false;
    return url.startsWith('/') && !url.startsWith('http://') && !url.startsWith('https://');
  };

  const getFileType = (url: string): 'image' | 'pdf' | 'other' => {
    const lowerUrl = url.toLowerCase();
    if (lowerUrl.match(/\.(jpg|jpeg|png|gif|bmp|webp|svg)$/)) {
      return 'image';
    }
    if (lowerUrl.match(/\.pdf$/)) {
      return 'pdf';
    }
    return 'other';
  };

  const handleFileView = (url: string) => {
    if (!url) return;
    
    const local = isLocalFile(url);
    const fileType = getFileType(url);
    
    if (local) {
      setViewingFile({ url, isLocal: true, fileType });
      setPdfError(false);
      
      if (fileType === 'pdf') {
        if (pdfTimeoutRef.current) {
          clearTimeout(pdfTimeoutRef.current);
        }
        pdfTimeoutRef.current = setTimeout(() => {
          setPdfError(true);
        }, 5000);
      }
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rechercher
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Titre, auteur, version..."
                value={localFilters.search}
                onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              value={localFilters.status}
              onChange={(e) => {
                setLocalFilters({ ...localFilters, status: e.target.value });
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="ACTIVE">Actif</option>
              <option value="DRAFT">Brouillon</option>
              <option value="OBSOLETE">Obsolète</option>
              <option value="ARCHIVE">Archivé</option>
            </select>
          </div>

          {/* Document Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de document
            </label>
            <select
              value={localFilters.documentType}
              onChange={(e) => {
                setLocalFilters({ ...localFilters, documentType: e.target.value });
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="PROCEDURE">Procédure</option>
              <option value="POLICY">Politique</option>
              <option value="MANUAL">Manuel</option>
              <option value="CONTRACT">Contrat</option>
              <option value="REPORT">Rapport</option>
            </select>
          </div>

          {/* Entity Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Entité
            </label>
            <select
              value={localFilters.entity}
              onChange={(e) => {
                setLocalFilters({ ...localFilters, entity: e.target.value });
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Toutes</option>
              <option value="SIL">SITALIA</option>
              <option value="GEO">GEOTOP</option>
              <option value="SIT">SITINFRA</option>
              <option value="GRP">Groupe</option>
            </select>
          </div>

          {/* Items per page */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Éléments par page
            </label>
            <select
              value={pagination.limit}
              onChange={(e) => changePageSize(Number(e.target.value))}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        {/* Reset Filters */}
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => {
              setLocalFilters({ search: '', status: '', documentType: '', entity: '' });
              updateFilters({ search: '', status: '', documentType: '', entity: '' });
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Réinitialiser les filtres
          </button>
          <div className="text-sm text-gray-600">
            {pagination.total} document{pagination.total > 1 ? 's' : ''} trouvé{pagination.total > 1 ? 's' : ''}
          </div>
        </div>
      </div>

      <div className="overflow-x-auto border border-gray-200 rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-blue-50">
                Indice
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-blue-50">
                Date
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-blue-50">
                Libellé
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-blue-50">
                Réalisé par
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-blue-50">
                Vérifié par
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-blue-50">
                Validé par
              </th>
              <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-blue-50">
                Statut
              </th>
              {hasActions && (
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider bg-blue-50">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayData.map((doc) => (
              <tr key={doc.documentId} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{doc.version || doc.index || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{formatDate(doc.date)}</td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{doc.title}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{doc.createdBy}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{doc.verifiedBy || '-'}</td>
                <td className="px-4 py-3 text-sm text-gray-900">{doc.validatedBy || '-'}</td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      statusColorMap[doc.status] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {statusLabelMap[doc.status] || doc.status}
                  </span>
                </td>
                {hasActions && (
                  <td className="px-4 py-3 text-sm">
                    <div className="flex items-center space-x-2">
                      {onView && (
                        <button
                          onClick={() => handleViewClick(doc)}
                          className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                          title="Voir"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      {onEdit && (
                        <button
                          onClick={() => onEdit(doc)}
                          className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => {
                            onDelete(doc.documentId);
                            setTimeout(() => refetch(), 500);
                          }}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {displayData.length === 0 && !loading && (
          <div className="text-center py-10 text-gray-500">Aucun document trouvé</div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border border-gray-200 rounded-lg sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Affichage de <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> à{' '}
                <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> sur{' '}
                <span className="font-medium">{pagination.total}</span> résultats
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Précédent</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                {[...Array(pagination.totalPages)].map((_, idx) => (
                  <button
                    key={idx + 1}
                    onClick={() => handlePageChange(idx + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      pagination.page === idx + 1
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages}
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

      {/* View Modal */}
      {viewModal.isOpen && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            onClick={() => setViewModal({ isOpen: false, document: null })}
            aria-hidden="true"
          ></div>

          {/* Modal Container */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Détails du document
                  </h3>
                  <button
                    onClick={() => setViewModal({ isOpen: false, document: null })}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Fermer"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                  {viewModal.document && (
                    <>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-500">ID:</span>
                        <span className="text-sm text-gray-900">{viewModal.document.documentId || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-500">Version:</span>
                        <span className="text-sm text-gray-900">{viewModal.document.version || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-500">Date:</span>
                        <span className="text-sm text-gray-900">{formatDate(viewModal.document.date)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-500">Titre:</span>
                        <span className="text-sm text-gray-900">{viewModal.document.title || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-500">Réalisé par:</span>
                        <span className="text-sm text-gray-900">{viewModal.document.createdBy || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-500">Vérifié par:</span>
                        <span className="text-sm text-gray-900">{viewModal.document.verifiedBy || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-500">Validé par:</span>
                        <span className="text-sm text-gray-900">{viewModal.document.validatedBy || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-500">Nom du fichier:</span>
                        <span className="text-sm text-gray-900">{viewModal.document.fileName || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-500">Taille du fichier:</span>
                        <span className="text-sm text-gray-900">{viewModal.document.fileSize || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-500">Statut:</span>
                        <span className="text-sm text-gray-900">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            statusColorMap[viewModal.document.status] || 'bg-gray-100 text-gray-800'
                          }`}>
                            {statusLabelMap[viewModal.document.status] || viewModal.document.status}
                          </span>
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-500">Entité:</span>
                        <span className="text-sm text-gray-900">
                          {viewModal.document.entity ? (entityLabelMap[viewModal.document.entity] || viewModal.document.entity) : '-'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-500">Code pays:</span>
                        <span className="text-sm text-gray-900">{viewModal.document.countryCode || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-500">Type de document:</span>
                        <span className="text-sm text-gray-900">
                          {viewModal.document.documentType ? (documentTypeLabelMap[viewModal.document.documentType] || viewModal.document.documentType) : '-'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-500">Numéro de document:</span>
                        <span className="text-sm text-gray-900">{viewModal.document.documentNumber || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-500">Description:</span>
                        <span className="text-sm text-gray-900">{viewModal.document.description || '-'}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <span className="text-sm font-medium text-gray-500">Document:</span>
                        <span className="text-sm text-gray-900">
                          {viewModal.document.filePath ? (
                            <button
                              onClick={() => handleFileView(viewModal.document!.filePath!)}
                              className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Visualiser
                            </button>
                          ) : (
                            '-'
                          )}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setViewModal({ isOpen: false, document: null })}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* File Viewer Modal */}
      {viewingFile && viewingFile.isLocal && (
        <div className="fixed inset-0 z-[10001] overflow-y-auto">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
            onClick={() => {
              setViewingFile(null);
              setPdfError(false);
            }}
            aria-hidden="true"
          ></div>

          {/* Modal Container */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Visualisation du document
                  </h3>
                  <button
                    onClick={() => {
                      setViewingFile(null);
                      setPdfError(false);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="mt-4 border border-gray-300 rounded-lg overflow-hidden" style={{ minHeight: '500px', maxHeight: '70vh' }}>
                  {viewingFile.fileType === 'image' ? (
                    <div className="flex items-center justify-center bg-gray-100" style={{ minHeight: '500px', maxHeight: '70vh' }}>
                      <img
                        src={viewingFile.url}
                        alt="Aperçu"
                        className="max-w-full max-h-[70vh] object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = '';
                          target.alt = 'Erreur de chargement de l\'image';
                        }}
                      />
                    </div>
                  ) : viewingFile.fileType === 'pdf' ? (
                    <div className="relative" style={{ minHeight: '500px', maxHeight: '70vh' }}>
                      {!pdfError ? (
                        <iframe
                          src={viewingFile.url}
                          className="w-full"
                          style={{ minHeight: '500px', border: 'none' }}
                          title="PDF preview"
                          onLoad={() => {
                            if (pdfTimeoutRef.current) {
                              clearTimeout(pdfTimeoutRef.current);
                              pdfTimeoutRef.current = null;
                            }
                          }}
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50" style={{ minHeight: '500px' }}>
                          <p className="text-red-600 mb-2 text-lg font-semibold">Erreur de chargement du document PDF</p>
                          <p className="text-gray-600 mb-6">Le PDF ne peut pas être affiché dans le navigateur. Veuillez le télécharger ou l'ouvrir dans un nouvel onglet.</p>
                          <div className="flex space-x-4">
                            <a
                              href={viewingFile.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              Ouvrir dans un nouvel onglet
                            </a>
                            <a
                              href={viewingFile.url}
                              download
                              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                            >
                              Télécharger
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="relative" style={{ minHeight: '500px', maxHeight: '70vh' }}>
                      <iframe
                        src={viewingFile.url}
                        className="w-full"
                        style={{ minHeight: '500px', border: 'none' }}
                        title="Document preview"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentList;