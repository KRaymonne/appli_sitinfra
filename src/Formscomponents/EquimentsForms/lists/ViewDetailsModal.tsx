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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'GOOD': return 'bg-green-100 text-green-800';
      case 'BAD': return 'bg-yellow-100 text-yellow-800';
      case 'BROKEN': return 'bg-red-100 text-red-800';
      case 'DECOMMISSIONED': return 'bg-gray-100 text-gray-800';
      case 'LOST': return 'bg-orange-100 text-orange-800';
      case 'ASSIGNED': return 'bg-blue-100 text-blue-800';
      case 'IN_TRANSIT': return 'bg-yellow-100 text-yellow-800';
      case 'RETURNED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'GOOD': return 'Bon';
      case 'BAD': return 'Mauvais';
      case 'BROKEN': return 'En panne';
      case 'DECOMMISSIONED': return 'Réformé';
      case 'LOST': return 'Perdu';
      case 'ASSIGNED': return 'Affecté';
      case 'IN_TRANSIT': return 'En transit';
      case 'RETURNED': return 'Retourné';
      case 'CANCELLED': return 'Annulé';
      default: return status;
    }
  };

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'TOPOGRAPHIC_MATERIALS': return 'Matériels Topographiques';
      case 'COMPUTER_MATERIALS': return 'Matériels Informatiques';
      case 'OTHERS': return 'Autres';
      default: return category;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'NIVEAUX_LASER': return 'Niveaux Laser';
      case 'PELETEUSES': return 'Pelleuses';
      case 'BETONNIERES': return 'Bétonnières';
      case 'SCIES_A_BETON': return 'Scies à Béton';
      case 'ECHAFAUDAGES': return 'Échafaudages';
      case 'COMPRESSEURS_AIR': return 'Compresseurs d\'Air';
      case 'ENGIN_DE_COMPACTAGE': return 'Engin de Compactage';
      case 'CAMIONS_DE_TRANSPORT': return 'Camions de Transport';
      case 'MESUREURS_DE_DISTANCE_LASER': return 'Mesureurs de Distance Laser';
      case 'GENERATEURS': return 'Générateurs';
      case 'ORDINATEURS_PORTABLES': return 'Ordinateurs Portables';
      case 'TABLETTES': return 'Tablettes';
      case 'LOGICIELS_DE_GESTION_DE_PROJET': return 'Logiciels de Gestion de Projet';
      case 'DRONES': return 'Drones';
      case 'IMPRIMANTES_3D': return 'Imprimantes 3D';
      case 'OTHER_Equipement': return 'Autre Équipement';
      default: return type;
    }
  };

  const getBrandText = (brand: string) => {
    switch (brand) {
      case 'LEICA': return 'Leica';
      case 'TRIMBLE': return 'Trimble';
      case 'TOPCON': return 'Topcon';
      case 'SOKKIA': return 'Sokkia';
      case 'NIKON': return 'Nikon';
      case 'PENTAX': return 'Pentax';
      case 'SPECTRA': return 'Spectra';
      case 'GEO_FENNEL': return 'Geo Fennel';
      case 'SOUTH': return 'South';
      case 'STONEX': return 'Stonex';
      case 'OTHER_BRAND': return 'Autre Marque';
      default: return brand;
    }
  };

  const getOwnershipText = (ownership: string) => {
    switch (ownership) {
      case 'OWNED': return 'Propriété';
      case 'LEASED': return 'Location';
      case 'BORROWED': return 'Emprunté';
      default: return ownership;
    }
  };

  const formatCurrency = (amount: number, devise: string = 'XAF') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: devise,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Helper function to get nested property values
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, prop) => current && current[prop], obj);
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
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  {title}
                </h3>
                <div className="mt-2 grid grid-cols-1 gap-3">
                  {fields.map((field) => {
                    const value = getNestedValue(data, field.key);
                    let displayValue = value;
                    
                    if (field.render) {
                      displayValue = field.render(value);
                    } else if (field.key === 'status') {
                      displayValue = (
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(value)}`}>
                          {getStatusText(value)}
                        </span>
                      );
                    } else if (field.key === 'category') {
                      displayValue = getCategoryText(value);
                    } else if (field.key === 'type') {
                      displayValue = getTypeText(value);
                    } else if (field.key === 'brand') {
                      displayValue = getBrandText(value);
                    } else if (field.key === 'ownership') {
                      displayValue = getOwnershipText(value);
                    } else if (field.key.includes('Amount') && typeof value === 'number') {
                      const devise = data.devise || 'XAF';
                      displayValue = formatCurrency(value, devise);
                    } else if (field.key.includes('Date') && value) {
                      displayValue = formatDate(value);
                    } else if (field.key.toLowerCase().includes('file') || 
                                field.key.toLowerCase().includes('attachment') ||
                                field.key.toLowerCase().includes('document') ||
                                (typeof value === 'string' && (isLocalFile(value) || value.startsWith('http')))) {
                      displayValue = renderFileField(value);
                    } else if (value === null || value === undefined || value === '') {
                      displayValue = '-';
                    }
                    
                    return (
                      <div key={field.key} className="py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:py-3">
                        <dt className="text-sm font-medium text-gray-500">{field.label}</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {displayValue}
                        </dd>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
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