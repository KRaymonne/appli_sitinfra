import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { X, Eye } from 'lucide-react';

interface ViewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: any;
  fields: Array<{
    key: string;
    label: string;
    render?: (value: any) => string | React.ReactNode;
  }>;
}

const ViewDetailsModal: React.FC<ViewDetailsModalProps> = ({
  isOpen,
  onClose,
  title,
  data,
  fields,
}) => {
  const { t } = useTranslation();
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
    if (!isOpen) {
      setViewingFile(null);
      setPdfError(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isLocalFile = (url: string | null | undefined): boolean => {
    if (!url || typeof url !== 'string') return false;
    // Check if it's a relative path (starts with /) and not an HTTP/HTTPS URL
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
      // For local files, show in modal with appropriate display
      setViewingFile({ url, isLocal: true, fileType });
      setPdfError(false);
      
      // For PDFs, set a timeout to check if loading failed
      if (fileType === 'pdf') {
        if (pdfTimeoutRef.current) {
          clearTimeout(pdfTimeoutRef.current);
        }
        // Give PDF 5 seconds to load before showing error
        pdfTimeoutRef.current = setTimeout(() => {
          setPdfError(true);
        }, 5000);
      }
    } else {
      // For HTTP/HTTPS URLs, open in new tab
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const formatValue = (value: any, render?: (value: any) => string | React.ReactNode): string | React.ReactNode => {
    if (render) {
      return render(value);
    }
    if (value === null || value === undefined) return '-';
    if (typeof value === 'boolean') return value ? t('common.yes') : t('common.no');
    if (value instanceof Date) return value.toLocaleDateString('fr-FR');
    if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
      return new Date(value).toLocaleDateString('fr-FR');
    }
    if (typeof value === 'object' && value !== null) {
      // Handle nested objects (e.g., user object)
      if (value.firstName && value.lastName) {
        return `${value.firstName} ${value.lastName}`;
      }
      return JSON.stringify(value);
    }
    return String(value);
  };

  const renderFileField = (url: string | null | undefined) => {
    if (!url) return '-';
    
    const local = isLocalFile(url);
    
    return (
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handleFileView(url)}
          className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          <Eye className="w-4 h-4 mr-1" />
          {t('personnel.lists.actions.view')}
        </button>
        {local && (
          <span className="text-xs text-gray-500">({url.split('/').pop()})</span>
        )}
      </div>
    );
  };

  return (
    <>
      <div className="fixed inset-0 z-[9999] overflow-y-auto">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        ></div>

        {/* Modal Container */}
        <div className="flex min-h-full items-center justify-center p-4">
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label={t('common.close')}
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto">
                {fields.map((field) => {
                  const value = data[field.key];
                  let displayValue = formatValue(value, field.render);

                  // Auto-detect file fields and render appropriately
                  if (field.key.toLowerCase().includes('file') || 
                      field.key.toLowerCase().includes('attachment') ||
                      field.key.toLowerCase().includes('document') ||
                      (typeof value === 'string' && (isLocalFile(value) || value.startsWith('http')))) {
                    displayValue = renderFileField(value);
                  }

                  return (
                    <div key={field.key} className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-sm font-medium text-gray-500">{field.label}:</span>
                      <span className="text-sm text-gray-900">{displayValue || '-'}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={onClose}
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* File Viewer Modal for Local Files */}
      {viewingFile && viewingFile.isLocal && (
        <div className="fixed inset-0 z-[10001] overflow-y-auto">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
            onClick={() => setViewingFile(null)}
            aria-hidden="true"
          ></div>

          {/* Modal Container */}
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {t('personnel.lists.modals.viewTitle')}
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
                    // Affichage des images avec balise img
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
                    // Affichage des PDFs avec iframe et fallback
                    <div className="relative" style={{ minHeight: '500px', maxHeight: '70vh' }}>
                      {!pdfError ? (
                        <iframe
                          src={viewingFile.url}
                          className="w-full"
                          style={{ minHeight: '500px', border: 'none' }}
                          title="PDF preview"
                          onLoad={() => {
                            // Si l'iframe se charge, annuler le timeout
                            if (pdfTimeoutRef.current) {
                              clearTimeout(pdfTimeoutRef.current);
                              pdfTimeoutRef.current = null;
                            }
                          }}
                        />
                      ) : (
                        // Fallback avec message d'erreur et lien de téléchargement
                        <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50" style={{ minHeight: '500px' }}>
                          <p className="text-red-600 mb-2 text-lg font-semibold">{t('personnel.forms.messages.errorUnknown')}</p>
                          <p className="text-gray-600 mb-6">{t('personnel.forms.messages.errorUnknown')}</p>
                          <div className="flex space-x-4">
                            <a
                              href={viewingFile.url}
                              download
                              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            >
                              {t('common.download')}
                            </a>
                            <a
                              href={viewingFile.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              {t('common.openInNewTab')}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    // Pour les autres types de fichiers, utiliser iframe avec fallback
                    <div className="relative" style={{ minHeight: '500px', maxHeight: '70vh' }}>
                      <iframe
                        src={viewingFile.url}
                        className="w-full"
                        style={{ minHeight: '500px', border: 'none' }}
                        title="File preview"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <div className="flex space-x-2">
                  {viewingFile.url && (
                    <a
                      href={viewingFile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      {t('common.openInNewTab')}
                    </a>
                  )}
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => {
                      setViewingFile(null);
                      setPdfError(false);
                    }}
                  >
                    {t('common.close')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ViewDetailsModal;
