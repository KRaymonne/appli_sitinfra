import React, { useState, useEffect, useRef } from 'react';
import { X, Eye } from 'lucide-react';

interface ViewDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: Record<string, any>;
  fields: Array<{
    key: string;
    label: string;
    render?: (value: any) => React.ReactNode;
  }>;
}

const ViewDetailsModal: React.FC<ViewDetailsModalProps> = ({ isOpen, onClose, title, data, fields }) => {
  const [viewingFile, setViewingFile] = useState<{ url: string; isLocal: boolean; fileType: 'image' | 'pdf' | 'other' } | null>(null);
  const [pdfError, setPdfError] = useState(false);
  const pdfTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  if (!isOpen) return null;

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

  useEffect(() => {
    return () => {
      if (pdfTimeoutRef.current) {
        clearTimeout(pdfTimeoutRef.current);
      }
    };
  }, [viewingFile]);

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
          Voir
        </button>
        {local && (
          <span className="text-xs text-gray-500">({url.split('/').pop()})</span>
        )}
      </div>
    );
  };

  const renderValue = (field: any, value: any) => {
    if (field.render) {
      return field.render(value);
    }

    // Handle specific field types
    if (field.key === 'type') {
      return getTypeText(value);
    }

    if (field.key === 'balance' || field.key === 'amount') {
      const currency = data.devise || data.currency || 'XAF';
      return formatCurrency(value, currency);
    }

    // Handle attachment field as file
    if (field.key === 'attachment' || 
        field.key.toLowerCase().includes('file') ||
        field.key.toLowerCase().includes('attachment') ||
        field.key.toLowerCase().includes('document') ||
        (typeof value === 'string' && (isLocalFile(value) || value.startsWith('http')))) {
      return renderFileField(value);
    }

    if (value === null || value === undefined) {
      return '-';
    }

    return String(value);
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={onClose}
          ></div>

          {/* Modal */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden transform transition-all">
            {/* Header */}
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 sm:px-6 flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500"
                onClick={onClose}
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[70vh]">
              <div className="px-4 py-5 sm:px-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                  {fields.map((field) => (
                    <div key={field.key} className="sm:col-span-1">
                      <dt className="text-sm font-medium text-gray-500">{field.label}</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {renderValue(field, data[field.key])}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                onClick={onClose}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* File Viewer Modal for Local Files */}
      {viewingFile && viewingFile.isLocal && (
        <div className="fixed inset-0 z-[60] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity"
              onClick={() => setViewingFile(null)}
            ></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Aperçu du fichier
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
                              download
                              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            >
                              Télécharger le PDF
                            </a>
                            <a
                              href={viewingFile.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              Ouvrir dans un nouvel onglet
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
                      Ouvrir dans un nouvel onglet
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
                    Fermer
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
