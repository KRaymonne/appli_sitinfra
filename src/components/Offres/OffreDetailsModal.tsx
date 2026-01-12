import React, { useState, useEffect, useRef } from 'react';
import { X, Eye, Calendar, User, FileText, DollarSign, Globe } from 'lucide-react';

interface OffreDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  type: 'dao' | 'devis' | 'ami';
}

export const OffreDetailsModal: React.FC<OffreDetailsModalProps> = ({
  isOpen,
  onClose,
  data,
  type
}) => {
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

  if (!isOpen || !data) return null;

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

  const renderFileAttachment = (url: string) => {
    if (!url) return null;
    const local = isLocalFile(url);
    return (
      <div className="mt-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-3">Pièce jointe</h4>
        <button
          onClick={() => handleFileView(url)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Eye className="w-4 h-4 mr-2" />
          Voir le fichier
        </button>
        {local && (
          <span className="ml-3 text-sm text-gray-500">({url.split('/').pop()})</span>
        )}
      </div>
    );
  };

  const formatCurrency = (amount: number, currency: string = 'XAF') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPLICATION':
      case 'Application':
        return 'bg-blue-100 text-blue-800';
      case 'UNDER_REVIEW':
      case 'Under Review':
        return 'bg-yellow-100 text-yellow-800';
      case 'PENDING':
      case 'Pending':
        return 'bg-orange-100 text-orange-800';
      case 'SHORTLISTED':
      case 'Shortlisted':
        return 'bg-green-100 text-green-800';
      case 'BID_SUBMITTED':
      case 'Bid Submitted':
        return 'bg-purple-100 text-purple-800';
      case 'NOT_PURSUED':
      case 'Not Pursued':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'APPLICATION': return 'Candidature';
      case 'UNDER_REVIEW': return 'En Étude';
      case 'PENDING': return 'En Attente';
      case 'SHORTLISTED': return 'Retenu';
      case 'BID_SUBMITTED': return 'Soumission';
      case 'NOT_PURSUED': return 'Pas de suite';
      default: return status;
    }
  };

  const getSubmissionTypeText = (type: string) => {
    switch (type) {
      case 'ELECTRONIC': return 'Électronique';
      case 'PHYSICAL': return 'Physique';
      case 'EMAIL': return 'Email';
      default: return type;
    }
  };

  const renderDAOFields = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-500">N° DAO</p>
              <p className="text-lg font-semibold text-gray-900">{data.daoNumber}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-500">Client</p>
              <p className="text-lg font-semibold text-gray-900">{data.clientname}</p>
            </div>
          </div>

          {data.contactname && (
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-500">Contact</p>
                <p className="text-lg font-semibold text-gray-900">{data.contactname}</p>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-orange-600" />
            <div>
              <p className="text-sm font-medium text-gray-500">Date de transmission</p>
              <p className="text-lg font-semibold text-gray-900">{formatDate(data.transmissionDate)}</p>
            </div>
          </div>

          {data.submissionDate && (
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-sm font-medium text-gray-500">Date de soumission</p>
                <p className="text-lg font-semibold text-gray-900">{formatDate(data.submissionDate)}</p>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Globe className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-500">Type de soumission</p>
              <p className="text-lg font-semibold text-gray-900">{getSubmissionTypeText(data.submissionType)}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Eye className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-500">Statut</p>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(data.status)}`}>
                {getStatusText(data.status)}
              </span>
            </div>
          </div>

          {data.activityCode && (
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-500">Code d'activité</p>
                <p className="text-lg font-semibold text-gray-900">{data.activityCode}</p>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3">
            <Globe className="w-5 h-5 text-indigo-600" />
            <div>
              <p className="text-sm font-medium text-gray-500">Devise</p>
              <p className="text-lg font-semibold text-gray-900">{data.devise}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-3">Objet</h4>
        <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{data.object}</p>
      </div>

      {data.attachment && renderFileAttachment(data.attachment)}
    </>
  );

  const renderDevisFields = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-500">N° Index</p>
              <p className="text-lg font-semibold text-gray-900">{data.indexNumber}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-500">Client</p>
              <p className="text-lg font-semibold text-gray-900">{data.clientname}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <DollarSign className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-500">Montant</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(data.amount, data.devise)}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-orange-600" />
            <div>
              <p className="text-sm font-medium text-gray-500">Date de validité</p>
              <p className="text-lg font-semibold text-gray-900">{formatDate(data.validityDate)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Eye className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-500">Statut</p>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(data.status)}`}>
                {getStatusText(data.status)}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Globe className="w-5 h-5 text-indigo-600" />
            <div>
              <p className="text-sm font-medium text-gray-500">Devise</p>
              <p className="text-lg font-semibold text-gray-900">{data.devise}</p>
            </div>
          </div>
        </div>
      </div>

      {data.description && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Description</h4>
          <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{data.description}</p>
        </div>
      )}

      {data.attachment && renderFileAttachment(data.attachment)}
    </>
  );

  const renderAMIFields = () => (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-gray-500">Nom</p>
              <p className="text-lg font-semibold text-gray-900">{data.name}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <User className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-500">Client</p>
              <p className="text-lg font-semibold text-gray-900">{data.client}</p>
            </div>
          </div>

          {data.contact && (
            <div className="flex items-center space-x-3">
              <User className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-500">Contact</p>
                <p className="text-lg font-semibold text-gray-900">{data.contact}</p>
              </div>
            </div>
          )}

          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-orange-600" />
            <div>
              <p className="text-sm font-medium text-gray-500">Date de dépôt</p>
              <p className="text-lg font-semibold text-gray-900">{formatDate(data.depositDate)}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <div>
              <p className="text-sm font-medium text-gray-500">Date de soumission</p>
              <p className="text-lg font-semibold text-gray-900">{formatDate(data.submissionDate)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Eye className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm font-medium text-gray-500">Statut</p>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(data.status)}`}>
                {data.status}
              </span>
            </div>
          </div>

          {data.activityCode && (
            <div className="flex items-center space-x-3">
              <FileText className="w-5 h-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-500">Code d'activité</p>
                <p className="text-lg font-semibold text-gray-900">{data.activityCode}</p>
              </div>
            </div>
          )}

          {data.soumissionType && (
            <div className="flex items-center space-x-3">
              <Globe className="w-5 h-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-500">Type de soumission</p>
                <p className="text-lg font-semibold text-gray-900">{data.soumissionType}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-3">Objet</h4>
        <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{data.object}</p>
      </div>

      {data.comment && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">Commentaire</h4>
          <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{data.comment}</p>
        </div>
      )}

      {data.attachment && renderFileAttachment(data.attachment)}
    </>
  );

  const getTitle = () => {
    switch (type) {
      case 'dao': return `Détails du DAO ${data.daoNumber}`;
      case 'devis': return `Détails du Devis ${data.indexNumber}`;
      case 'ami': return `Détails de l'AMI ${data.name}`;
      default: return 'Détails';
    }
  };

  const renderFields = () => {
    switch (type) {
      case 'dao': return renderDAOFields();
      case 'devis': return renderDevisFields();
      case 'ami': return renderAMIFields();
      default: return null;
    }
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
          <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
            <div className="bg-white px-6 pt-5 pb-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900">{getTitle()}</h3>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mt-4">
                {renderFields()}
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-3 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
              >
                Fermer
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
