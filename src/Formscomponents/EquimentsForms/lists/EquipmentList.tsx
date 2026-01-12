import React, { useState, useMemo } from 'react';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import ViewDetailsModal from './ViewDetailsModal';
import { useServerPagination as useServerPaginationHook } from '../../../hooks/useServerPagination';
import ExportEquipmentDropdown from './ExportEquipmentDropdown';

interface Equipment {
  equipmentId: number;
  name: string;
  category: string;
  type: string;
  brand: string;
  model?: string;
  serialNumber: string;
  referenceCode: string;
  supplier: string;
  purchaseAmount: number;
  status: string;
  location: string;
  ownership: string;
  purchaseDate?: string;
  warrantyEndDate?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  devise?: string; // Changed from currency to devise to match Prisma model
}

interface EquipmentListProps {
  equipments?: Equipment[]; // Made optional for server-side pagination
  onEdit: (equipment: Equipment) => void;
  onDelete: (id: number) => void;
  onView: (equipment: Equipment) => void;
  useServerPagination?: boolean; // New prop to enable server-side pagination
}

const EquipmentList: React.FC<EquipmentListProps> = ({ 
  equipments = [], 
  onEdit, 
  onDelete, 
  onView, 
  useServerPagination = false 
}) => {
  // Server-side pagination hook
  const {
    data: serverData,
    pagination,
    loading,
    error,
    filters: serverFilters,
    updateFilters,
    goToPage,
    changePageSize,
    } = useServerPaginationHook({
      endpoint: '/.netlify/functions/equipment-equipment',
      initialParams: {
        search: '',
        status: '',
      category: '',
    },
  });

  // Client-side filters (used when useServerPagination is false)
  const [clientFilters, setClientFilters] = useState({
    status: '',
    category: '',
    type: '',
    brand: '',
    search: '',
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; equipment: Equipment | null }>({
    isOpen: false,
    equipment: null,
  });
  
  const [viewModal, setViewModal] = useState<{ isOpen: boolean; equipment: Equipment | null }>({
    isOpen: false,
    equipment: null,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'GOOD': return 'bg-green-100 text-green-800';
      case 'BAD': return 'bg-yellow-100 text-yellow-800';
      case 'BROKEN': return 'bg-red-100 text-red-800';
      case 'DECOMMISSIONED': return 'bg-gray-100 text-gray-800';
      case 'LOST': return 'bg-orange-100 text-orange-800';
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

  const filteredEquipments = useMemo(() => {
    if (useServerPagination) {
      return serverData;
    }
    
    return equipments.filter((equipment) => {
      if (clientFilters.status && equipment.status !== clientFilters.status) return false;
      if (clientFilters.category && equipment.category !== clientFilters.category) return false;
      if (clientFilters.type && equipment.type !== clientFilters.type) return false;
      if (clientFilters.brand && equipment.brand !== clientFilters.brand) return false;
      if (clientFilters.search) {
        const searchLower = clientFilters.search.toLowerCase();
        return (
          equipment.name.toLowerCase().includes(searchLower) ||
          equipment.referenceCode.toLowerCase().includes(searchLower) ||
          equipment.serialNumber.toLowerCase().includes(searchLower) ||
          (equipment.model && equipment.model.toLowerCase().includes(searchLower)) ||
          equipment.supplier.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [equipments, clientFilters, useServerPagination, serverData]);

  // Pagination logic
  const totalPages = useServerPagination ? pagination.totalPages : Math.ceil(filteredEquipments.length / itemsPerPage);
  const startIndex = useServerPagination ? ((pagination.page - 1) * pagination.limit) + 1 : (currentPage - 1) * itemsPerPage;
  const endIndex = useServerPagination ? Math.min(pagination.page * pagination.limit, pagination.total) : Math.min(startIndex + itemsPerPage, filteredEquipments.length);
  const paginatedEquipments = useServerPagination ? filteredEquipments : filteredEquipments.slice(startIndex, endIndex);

  const handleDeleteClick = (equipment: Equipment) => {
    setDeleteModal({ isOpen: true, equipment });
  };
  
  const handleViewClick = (equipment: Equipment) => {
    setViewModal({ isOpen: true, equipment });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.equipment) {
      onDelete(deleteModal.equipment.equipmentId);
      setDeleteModal({ isOpen: false, equipment: null });
    }
  };

  const handlePageChange = (page: number) => {
    if (useServerPagination) {
      goToPage(page);
    } else {
      setCurrentPage(page);
    }
  };

  const handleFilterChange = (filterType: string, value: string) => {
    if (useServerPagination) {
      updateFilters({ [filterType]: value });
    } else {
      setClientFilters(prev => ({ ...prev, [filterType]: value }));
      setCurrentPage(1);
    }
  };

  const handlePageSizeChange = (size: number) => {
    if (useServerPagination) {
      changePageSize(size);
    } else {
      setItemsPerPage(size);
      setCurrentPage(1);
    }
  };

  const handleResetFilters = () => {
    if (useServerPagination) {
      updateFilters({ search: '', status: '', category: '', type: '', brand: '' });
    } else {
      setClientFilters({ status: '', category: '', type: '', brand: '', search: '' });
      setCurrentPage(1);
    }
  };

  const formatCurrency = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  return (
    <div className="space-y-4">
      {/* Filters Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rechercher
            </label>
            <input
              type="text"
              placeholder="Nom, référence, série..."
              value={useServerPagination ? serverFilters.search : clientFilters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              value={useServerPagination ? serverFilters.status : clientFilters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="GOOD">Bon</option>
              <option value="BAD">Mauvais</option>
              <option value="BROKEN">En panne</option>
              <option value="DECOMMISSIONED">Réformé</option>
              <option value="LOST">Perdu</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catégorie
            </label>
            <select
              value={useServerPagination ? serverFilters.category : clientFilters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="TOPOGRAPHIC_MATERIALS">Matériels Topographiques</option>
              <option value="COMPUTER_MATERIALS">Matériels Informatiques</option>
              <option value="OTHERS">Autres</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={useServerPagination ? serverFilters.type || '' : clientFilters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="NIVEAUX_LASER">Niveaux Laser</option>
              <option value="PELETEUSES">Pelleuses</option>
              <option value="BETONNIERES">Bétonnières</option>
              <option value="SCIES_A_BETON">Scies à Béton</option>
              <option value="ECHAFAUDAGES">Échafaudages</option>
              <option value="COMPRESSEURS_AIR">Compresseurs d'Air</option>
              <option value="ENGIN_DE_COMPACTAGE">Engin de Compactage</option>
              <option value="CAMIONS_DE_TRANSPORT">Camions de Transport</option>
              <option value="MESUREURS_DE_DISTANCE_LASER">Mesureurs de Distance Laser</option>
              <option value="GENERATEURS">Générateurs</option>
              <option value="ORDINATEURS_PORTABLES">Ordinateurs Portables</option>
              <option value="TABLETTES">Tablettes</option>
              <option value="LOGICIELS_DE_GESTION_DE_PROJET">Logiciels de Gestion de Projet</option>
              <option value="DRONES">Drones</option>
              <option value="IMPRIMANTES_3D">Imprimantes 3D</option>
              <option value="OTHER_Equipement">Autre Équipement</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Marque
            </label>
            <select
              value={useServerPagination ? serverFilters.brand || '' : clientFilters.brand}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="LEICA">Leica</option>
              <option value="TRIMBLE">Trimble</option>
              <option value="TOPCON">Topcon</option>
              <option value="SOKKIA">Sokkia</option>
              <option value="NIKON">Nikon</option>
              <option value="PENTAX">Pentax</option>
              <option value="SPECTRA">Spectra</option>
              <option value="GEO_FENNEL">Geo Fennel</option>
              <option value="SOUTH">South</option>
              <option value="STONEX">Stonex</option>
              <option value="OTHER_BRAND">Autre Marque</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Éléments par page
            </label>
            <select
              value={useServerPagination ? pagination.limit : itemsPerPage}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
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
            onClick={handleResetFilters}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Réinitialiser les filtres
          </button>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {useServerPagination ? pagination.total : filteredEquipments.length} équipement(s) trouvé(s)
            </span>
            {/* Export Dropdown */}
            <ExportEquipmentDropdown equipments={filteredEquipments} />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {paginatedEquipments.map((equipment: any) => (
          <div
            key={equipment.equipmentId}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">{equipment.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(equipment.status)}`}>
                      {getStatusText(equipment.status)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span>{equipment.referenceCode}</span>
                    <span>•</span>
                    <span>{equipment.serialNumber}</span>
                    <span>•</span>
                    <span>{equipment.brand}</span>
                    <span>•</span>
                    <span>{equipment.location}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleViewClick(equipment)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Voir"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(equipment);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Modifier"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(equipment);
                  }}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-5 h-5" />
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
                Affichage de <span className="font-medium">{startIndex}</span> à{' '}
                <span className="font-medium">{endIndex}</span> sur{' '}
                <span className="font-medium">{useServerPagination ? pagination.total : filteredEquipments.length}</span> résultats
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(useServerPagination ? pagination.page - 1 : currentPage - 1)}
                  disabled={useServerPagination ? pagination.page === 1 : currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">Précédent</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                {[...Array(totalPages)].map((_, idx) => {
                  const pageNumber = idx + 1;
                  const isCurrentPage = useServerPagination ? pagination.page === pageNumber : currentPage === pageNumber;
                  return (
                    <button
                      key={pageNumber}
                      onClick={() => handlePageChange(pageNumber)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        isCurrentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(useServerPagination ? pagination.page + 1 : currentPage + 1)}
                  disabled={useServerPagination ? pagination.page === totalPages : currentPage === totalPages}
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
        onClose={() => setDeleteModal({ isOpen: false, equipment: null })}
        onConfirm={handleDeleteConfirm}
        itemName={deleteModal.equipment ? `${deleteModal.equipment.name} (${deleteModal.equipment.referenceCode})` : ''}
        itemType="l'équipement"
      />
      
      {/* View Details Modal */}
      <ViewDetailsModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, equipment: null })}
        title="Détails de l'Équipement"
        data={viewModal.equipment || {}}
        fields={[
          { key: 'equipmentId', label: 'ID' },
          { key: 'name', label: 'Nom' },
          { key: 'category', label: 'Catégorie', render: (val: string) => val ? getCategoryText(val) : '-' },
          { key: 'type', label: 'Type', render: (val: string) => val ? getTypeText(val) : '-' },
          { key: 'brand', label: 'Marque', render: (val: string) => val ? getBrandText(val) : '-' },
          { key: 'model', label: 'Modèle' },
          { key: 'serialNumber', label: 'Numéro de série' },
          { key: 'referenceCode', label: 'Code de référence' },
          { key: 'supplier', label: 'Fournisseur' },
          { key: 'purchaseAmount', label: 'Montant d\'achat', render: (val: number) => val ? formatCurrency(val, viewModal.equipment?.devise) : '-' },
          { key: 'devise', label: 'Devise' },
          { key: 'purchaseDate', label: 'Date d\'achat', render: (val: string) => val ? formatDate(val) : '-' },
          { key: 'warrantyEndDate', label: 'Fin de garantie', render: (val: string) => val ? formatDate(val) : '-' },
          { key: 'status', label: 'Statut', render: (val: string) => <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(val)}`}>{getStatusText(val)}</span> },
          { key: 'location', label: 'Emplacement' },
          { key: 'ownership', label: 'Propriété', render: (val: string) => val ? getOwnershipText(val) : '-' },
          { key: 'attachmentFile', label: 'Fichier attaché', render: (val: string) => val ? (
            <div className="flex items-center space-x-2">
              
              <button
                onClick={() => window.open(val, '_blank')}
                className="px-2 py-1 text-xs bg-blue-100 text-blue-900 rounded hover:bg-blue-200 transition-colors"
                title="Ouvrir le fichier"
              >
                Voir
              </button>
            </div>
          ) : '-' },
          { key: 'observations', label: 'Observations' },
          { key: 'Inserteridentity', label: 'Inserter Identity' },
          { key: 'InserterCountry', label: 'Inserter Country' },
          { key: 'createdAt', label: 'Créé le', render: (val: string) => val ? formatDate(val) : '-' },
          { key: 'updatedAt', label: 'Mis à jour le', render: (val: string) => val ? formatDate(val) : '-' }
        ]}
      />
    </div>
  );
};

export default EquipmentList;