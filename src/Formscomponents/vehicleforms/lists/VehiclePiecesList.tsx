import React, { useState, useMemo } from 'react';
import { Eye } from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import ViewDetailsModal from './ViewDetailsModal';
import ExportVehiclePieceDropdown from './ExportVehiclePieceDropdown';

interface VehiclePiece {
  pieceId: number;
  type: string;
  typeLibre?: string;
  description?: string;
  montant: number;
  dateDebut: string;
  dateFin: string;
  dateProchaine?: string;
}

interface VehiclePiecesListProps {
  pieces: VehiclePiece[];
  onEdit: (piece: VehiclePiece) => void;
  onDelete: (id: number) => void;
  onView: (piece: VehiclePiece) => void;
}

const VehiclePiecesList: React.FC<VehiclePiecesListProps> = ({ 
  pieces, 
  onEdit, 
  onDelete, 
  onView 
}) => {
  const [filters, setFilters] = useState({
    type: '',
    search: '',
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; piece: VehiclePiece | null }>({
    isOpen: false,
    piece: null,
  });
  
  const [viewModal, setViewModal] = useState<{ isOpen: boolean; piece: VehiclePiece | null }>({
    isOpen: false,
    piece: null,
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'INSURANCE': return 'bg-blue-100 text-blue-800';
      case 'TECHNICAL_VISIT': return 'bg-green-100 text-green-800';
      case 'REGISTRATION': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'REPAIR': return 'Réparation';
      case 'REPLACEMENT': return 'Remplacement';
      case 'MAINTENANCE': return 'Maintenance';
      case 'OTHER': return 'Autre';
      default: return type;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XAF',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredPieces = useMemo(() => {
    return pieces.filter((piece) => {
      if (filters.type && piece.type !== filters.type) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          (piece.description && piece.description.toLowerCase().includes(searchLower)) ||
          (piece.typeLibre && piece.typeLibre.toLowerCase().includes(searchLower))
        );
      }
      return true;
    });
  }, [pieces, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredPieces.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPieces = filteredPieces.slice(startIndex, endIndex);

  const handleDeleteClick = (piece: VehiclePiece) => {
    setDeleteModal({ isOpen: true, piece });
  };
  
  const handleViewClick = (piece: VehiclePiece) => {
    setViewModal({ isOpen: true, piece });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.piece) {
      onDelete(deleteModal.piece.pieceId);
      setDeleteModal({ isOpen: false, piece: null });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-4">
      {/* Filters Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rechercher
            </label>
            <input
              type="text"
              placeholder="Description..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de pièce
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="INSURANCE">Assurance</option>
              <option value="TECHNICAL_VISIT">Visite technique</option>
              <option value="REGISTRATION">Enregistrement</option>
            </select>
          </div>

          {/* Items per page */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Éléments par page
            </label>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-3 flex justify-between items-center">
          <button
            onClick={() => {
              setFilters({ type: '', search: '' });
              setCurrentPage(1);
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Réinitialiser les filtres
          </button>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {filteredPieces.length} pièce(s) trouvée(s)
            </span>
            {/* Export Dropdown */}
            <ExportVehiclePieceDropdown pieces={filteredPieces} />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {paginatedPieces.map((piece) => (
          <div
            key={piece.pieceId}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onView(piece)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {piece.typeLibre || getTypeText(piece.type)}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(piece.type)}`}>
                      {getTypeText(piece.type)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Du {new Date(piece.dateDebut).toLocaleDateString()} au {new Date(piece.dateFin).toLocaleDateString()}
                    </span>
                    <span className="flex items-center font-semibold text-gray-700">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {formatCurrency(piece.montant)}
                    </span>
                    {piece.dateProchaine && (
                      <span className="flex items-center text-orange-600">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Prochaine: {new Date(piece.dateProchaine).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  {piece.description && (
                    <div className="text-sm text-gray-600 mt-1 line-clamp-1">
                      {piece.description}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewClick(piece);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Voir"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(piece);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Modifier"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(piece);
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Supprimer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border border-gray-200 rounded-lg sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Précédent
            </button>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Suivant
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Affichage de <span className="font-medium">{startIndex + 1}</span> à{' '}
                <span className="font-medium">{Math.min(endIndex, filteredPieces.length)}</span> sur{' '}
                <span className="font-medium">{filteredPieces.length}</span> résultats
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Précédent</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                {[...Array(totalPages)].map((_, idx) => (
                  <button
                    key={idx + 1}
                    onClick={() => handlePageChange(idx + 1)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      currentPage === idx + 1
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, piece: null })}
        onConfirm={handleDeleteConfirm}
        itemName={deleteModal.piece ? (deleteModal.piece.typeLibre || getTypeText(deleteModal.piece.type)) : ''}
        itemType="la pièce"
      />
      
      {/* View Details Modal */}
      <ViewDetailsModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, piece: null })}
        title="Détails de la Pièce"
        data={viewModal.piece || {}}
        fields={[
          { key: 'pieceId', label: 'ID Pièce' },
          { key: 'type', label: 'Type', render: (val: string) => val ? getTypeText(val) : '-' },
          { key: 'typeLibre', label: 'Type libre' },
          { key: 'description', label: 'Description' },
          { key: 'montant', label: 'Montant', render: (val: number) => val ? formatCurrency(val) : '-' },
          { key: 'dateDebut', label: 'Date de début', render: (val: string) => val ? new Date(val).toLocaleDateString('fr-FR') : '-' },
          { key: 'dateFin', label: 'Date de fin', render: (val: string) => val ? new Date(val).toLocaleDateString('fr-FR') : '-' },
          { key: 'dateProchaine', label: 'Date prochaine', render: (val: string) => val ? new Date(val).toLocaleDateString('fr-FR') : '-' },
          { key: 'fichierJoint', label: 'Fichier joint', render: (val: string) => val ? (
            <a
              href={val}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Voir
            </a>
          ) : '-' },
          { key: 'Inserteridentity', label: 'Inserter Identity' },
          { key: 'InserterCountry', label: 'Inserter Country' }
        ]}
      />
    </div>
  );
};

export default VehiclePiecesList;

