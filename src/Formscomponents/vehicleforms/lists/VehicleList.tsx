import React, { useState, useMemo } from 'react';
import { Eye, Edit2, Trash2 } from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import ViewDetailsModal from './ViewDetailsModal';
import ExportVehicleDropdown from './ExportVehicleDropdown';

interface Vehicle {
  vehicleId: number;
  licensePlate: string;
  brand: string;
  model: string;
  type?: string;
  vehiclecountry?: string;
  year: number;
  status: string;
  fuelType: string;
  mileage: number;
  createdAt?: string;
  updatedAt?: string;
}

interface VehicleListProps {
  vehicles: Vehicle[];
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (id: number) => void;
  onView: (vehicle: Vehicle) => void;
}

const VehicleList: React.FC<VehicleListProps> = ({ vehicles, onEdit, onDelete, onView }) => {
  const [filters, setFilters] = useState({
    status: '',
    fuelType: '',
    type: '',
    vehiclecountry: '',
    search: '',
  });
  
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; vehicle: Vehicle | null }>({
    isOpen: false,
    vehicle: null,
  });
  
  const [viewModal, setViewModal] = useState<{ isOpen: boolean; vehicle: Vehicle | null }>({
    isOpen: false,
    vehicle: null,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-100 text-green-800';
      case 'IN_USE': return 'bg-blue-100 text-blue-800';
      case 'MAINTENANCE': return 'bg-yellow-100 text-yellow-800';
      case 'OUT_OF_SERVICE': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'Disponible';
      case 'IN_USE': return 'En service';
      case 'UNDER_MAINTENANCE': return 'Maintenance';
      case 'OUT_OF_SERVICE': return 'Hors service';
      default: return status;
    }
  };

  const getFuelTypeText = (fuelType: string) => {
    switch (fuelType) {
      case 'GASOLINE': return 'Essence';
      case 'DIESEL': return 'Diesel';
      case 'ELECTRIC': return 'Électrique';
      case 'HYBRID': return 'Hybride';
      default: return fuelType;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'CAR': return 'Voiture';
      case 'TRUCK': return 'Camion';
      case 'VAN': return 'Fourgon';
      case 'MOTORCYCLE': return 'Moto';
      default: return type;
    }
  };

  const getCountryText = (country: string) => {
    switch (country) {
      case 'IVORY_COAST': return 'Côte d\'Ivoire';
      case 'GHANA': return 'Ghana';
      case 'BENIN': return 'Bénin';
      case 'CAMEROON': return 'Cameroun';
      case 'TOGO': return 'Togo';
      case 'ROMANIE': return 'Romanie';
      case 'ITALIE': return 'Italie';
      default: return country;
    }
  };

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((vehicle) => {
      if (filters.status && vehicle.status !== filters.status) return false;
      if (filters.fuelType && vehicle.fuelType !== filters.fuelType) return false;
      if (filters.type && vehicle.type !== filters.type) return false;
      if (filters.vehiclecountry && vehicle.vehiclecountry !== filters.vehiclecountry) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          vehicle.licensePlate.toLowerCase().includes(searchLower) ||
          vehicle.brand.toLowerCase().includes(searchLower) ||
          vehicle.model.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [vehicles, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredVehicles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedVehicles = filteredVehicles.slice(startIndex, endIndex);

  const handleDeleteClick = (vehicle: Vehicle) => {
    setDeleteModal({ isOpen: true, vehicle });
  };
  
  const handleViewClick = (vehicle: Vehicle) => {
    setViewModal({ isOpen: true, vehicle });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.vehicle) {
      onDelete(deleteModal.vehicle.vehicleId);
      setDeleteModal({ isOpen: false, vehicle: null });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
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
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rechercher
            </label>
            <input
              type="text"
              placeholder="Plaque, marque, modèle..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Statut
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="AVAILABLE">Disponible</option>
              <option value="IN_USE">En service</option>
              <option value="UNDER_MAINTENANCE">Maintenance</option>
              <option value="OUT_OF_SERVICE">Hors service</option>
            </select>
          </div>

          {/* Fuel Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de carburant
            </label>
            <select
              value={filters.fuelType}
              onChange={(e) => setFilters({ ...filters, fuelType: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="GASOLINE">Essence</option>
              <option value="DIESEL">Diesel</option>
              <option value="ELECTRIC">Électrique</option>
              <option value="HYBRID">Hybride</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de véhicule
            </label>
            <select
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="CAR">Voiture</option>
              <option value="TRUCK">Camion</option>
              <option value="VAN">Fourgon</option>
              <option value="MOTORCYCLE">Moto</option>
            </select>
          </div>

          {/* Country Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pays
            </label>
            <select
              value={filters.vehiclecountry}
              onChange={(e) => setFilters({ ...filters, vehiclecountry: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="IVORY_COAST">Côte d'Ivoire</option>
              <option value="GHANA">Ghana</option>
              <option value="BENIN">Bénin</option>
              <option value="CAMEROON">Cameroun</option>
              <option value="TOGO">Togo</option>
              <option value="ROMANIE">Romanie</option>
              <option value="ITALIE">Italie</option>
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

        {/* Reset Filters */}
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => {
              setFilters({ status: '', fuelType: '', type: '', vehiclecountry: '', search: '' });
              setCurrentPage(1);
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Réinitialiser les filtres
          </button>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              {filteredVehicles.length} véhicule(s) trouvé(s)
            </span>
            {/* Export Dropdown */}
            <ExportVehicleDropdown vehicles={filteredVehicles} />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {paginatedVehicles.map((vehicle) => (
          <div
            key={vehicle.vehicleId}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1a1 1 0 001-1v-3a1 1 0 00-1-1h-1a1 1 0 00-1 1v3z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">{vehicle.licensePlate}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(vehicle.status)}`}>
                      {getStatusText(vehicle.status)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span>{vehicle.brand} {vehicle.model}</span>
                    <span>•</span>
                    <span>{vehicle.year}</span>
                    <span>•</span>
                    <span>{getFuelTypeText(vehicle.fuelType)}</span>
                    <span>•</span>
                    <span>{vehicle.mileage.toLocaleString()} km</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleViewClick(vehicle)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Voir"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(vehicle);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Modifier"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClick(vehicle);
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
                Affichage de <span className="font-medium">{startIndex + 1}</span> à{' '}
                <span className="font-medium">{Math.min(endIndex, filteredVehicles.length)}</span> sur{' '}
                <span className="font-medium">{filteredVehicles.length}</span> résultats
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
        onClose={() => setDeleteModal({ isOpen: false, vehicle: null })}
        onConfirm={handleDeleteConfirm}
        itemName={deleteModal.vehicle ? `Véhicule ${deleteModal.vehicle.licensePlate}` : ''}
        itemType="le véhicule"
      />
      
      {/* View Details Modal */}
      <ViewDetailsModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, vehicle: null })}
        title="Détails du Véhicule"
        data={viewModal.vehicle || {}}
        fields={[
          { key: 'vehicleId', label: 'ID' },
          { key: 'licensePlate', label: 'Plaque d\'immatriculation' },
          { key: 'brand', label: 'Marque' },
          { key: 'model', label: 'Modèle' },
          { key: 'type', label: 'Type', render: (val: string) => val ? getTypeText(val) : '-' },
          { key: 'vehiclecountry', label: 'Pays', render: (val: string) => val ? getCountryText(val) : '-' },
          { key: 'year', label: 'Année' },
          { key: 'status', label: 'Statut', render: (val: string) => <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(val)}`}>{getStatusText(val)}</span> },
          { key: 'fuelType', label: 'Type de carburant', render: (val: string) => val ? getFuelTypeText(val) : '-' },
          { key: 'mileage', label: 'Kilométrage', render: (val: number) => val ? `${val.toLocaleString()} km` : '-' },
          { key: 'chassisNumber', label: 'Numéro de châssis' },
          { key: 'acquisitionDate', label: 'Date d\'acquisition', render: (val: string) => val ? formatDate(val) : '-' },
          { key: 'usingEntity', label: 'Entité utilisatrice' },
          { key: 'holder', label: 'Titulaire' },
          { key: 'civilRegistration', label: 'Immatriculation civile' },
          { key: 'administrativeRegistration', label: 'Immatriculation administrative' },
          { key: 'assignedTo', label: 'Assigné à' },
          { key: 'Inserteridentity', label: 'Inserter Identity' },
          { key: 'InserterCountry', label: 'Inserter Country' },
          { key: 'createdAt', label: 'Créé le', render: (val: string) => val ? formatDate(val) : '-' },
          { key: 'updatedAt', label: 'Mis à jour le', render: (val: string) => val ? formatDate(val) : '-' }
        ]}
      />
    </div>
  );
};

export default VehicleList;