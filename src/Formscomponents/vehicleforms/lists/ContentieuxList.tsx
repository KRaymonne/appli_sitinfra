import React, { useState, useMemo } from 'react';
import { Eye } from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import ViewDetailsModal from './ViewDetailsModal';
import ExportContentieuxDropdown from './ExportContentieuxDropdown';
import { Contentieux } from '../../../utils/exportVehicleUtils';

interface ContentieuxListProps {
  contentieux: Contentieux[];
  onEdit: (contentieux: Contentieux) => void;
  onDelete: (id: number) => void;
  onView: (contentieux: Contentieux) => void;
}

const ContentieuxList: React.FC<ContentieuxListProps> = ({ 
  contentieux, 
  onEdit, 
  onDelete, 
  onView 
}) => {
  const [filters, setFilters] = useState({
    status: '',
    faultAttribution: '',
    search: '',
  });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; contentieux: Contentieux | null }>({
    isOpen: false,
    contentieux: null,
  });
  
  const [viewModal, setViewModal] = useState<{ isOpen: boolean; contentieux: Contentieux | null }>({
    isOpen: false,
    contentieux: null,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-red-100 text-red-800';
      case 'IN_PROGRESS': return 'bg-yellow-100 text-yellow-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'OPEN': return 'Ouvert';
      case 'IN_PROGRESS': return 'En cours';
      case 'RESOLVED': return 'Résolu';
      case 'CLOSED': return 'Fermé';
      default: return status;
    }
  };

  const getFaultColor = (fault: string) => {
    switch (fault) {
      case 'STATE': return 'bg-blue-100 text-blue-800';
      case 'HOLDER': return 'bg-orange-100 text-orange-800';
      case 'UNDETERMINED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFaultText = (fault: string) => {
    switch (fault) {
      case 'STATE': return 'État';
      case 'HOLDER': return 'Détenteur';
      case 'UNDETERMINED': return 'Indéterminé';
      default: return fault;
    }
  };

  const filteredContentieux = useMemo(() => {
    return contentieux.filter((item) => {
      if (filters.status && item.status !== filters.status) return false;
      if (filters.faultAttribution && item.faultAttribution !== filters.faultAttribution) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          item.description.toLowerCase().includes(searchLower) ||
          (item.conclusion && item.conclusion.toLowerCase().includes(searchLower))
        );
      }
      return true;
    });
  }, [contentieux, filters]);

  const handleDeleteClick = (contentieux: Contentieux) => {
    setDeleteModal({ isOpen: true, contentieux });
  };
  
  const handleViewClick = (contentieux: Contentieux) => {
    setViewModal({ isOpen: true, contentieux });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.contentieux) {
      onDelete(deleteModal.contentieux.contentieuxId);
      setDeleteModal({ isOpen: false, contentieux: null });
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rechercher
            </label>
            <input
              type="text"
              placeholder="Description, conclusion..."
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
              <option value="OPEN">Ouvert</option>
              <option value="IN_PROGRESS">En cours</option>
              <option value="RESOLVED">Résolu</option>
              <option value="CLOSED">Fermé</option>
            </select>
          </div>

          {/* Fault Attribution Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Attribution de la faute
            </label>
            <select
              value={filters.faultAttribution}
              onChange={(e) => setFilters({ ...filters, faultAttribution: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="STATE">État</option>
              <option value="HOLDER">Détenteur</option>
              <option value="UNDETERMINED">Indéterminé</option>
            </select>
          </div>
        </div>

        {/* Results count and export */}
        <div className="mt-4 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {filteredContentieux.length} contentieux trouvé(s)
          </div>
          <div className="flex items-center space-x-4">
            {/* Export Dropdown */}
            <ExportContentieuxDropdown contentieux={filteredContentieux} />
          </div>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {filteredContentieux.map((item) => (
          <div
            key={item.contentieuxId}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onView(item)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Contentieux #{item.contentieuxId}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
                      {getStatusText(item.status)}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getFaultColor(item.faultAttribution)}`}>
                      {getFaultText(item.faultAttribution)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Incident: {new Date(item.incidentDate).toLocaleDateString()}
                    </span>
                    {item.resolutionDate && (
                      <span className="flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Résolu: {new Date(item.resolutionDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mt-1 line-clamp-2">
                    {item.description}
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewClick(item);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Voir"
                >
                  <Eye className="w-5 h-5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(item);
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
                    handleDeleteClick(item);
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, contentieux: null })}
        onConfirm={handleDeleteConfirm}
        itemName={deleteModal.contentieux ? `Contentieux #${deleteModal.contentieux.contentieuxId}` : ''}
        itemType="le contentieux"
      />
      
      {/* View Details Modal */}
      <ViewDetailsModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, contentieux: null })}
        title="Détails du Contentieux"
        data={viewModal.contentieux || {}}
        fields={[
          { key: 'contentieuxId', label: 'ID Contentieux' },
          { key: 'incidentDate', label: 'Date d\'incident', render: (val: string) => val ? new Date(val).toLocaleDateString('fr-FR') : '-' },
          { key: 'description', label: 'Description' },
          { key: 'faultAttribution', label: 'Attribution de la faute', render: (val: string) => val ? getFaultText(val) : '-' },
          { key: 'status', label: 'Statut', render: (val: string) => <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(val)}`}>{getStatusText(val)}</span> },
          { key: 'resolutionDate', label: 'Date de résolution', render: (val: string) => val ? new Date(val).toLocaleDateString('fr-FR') : '-' },
          { key: 'conclusion', label: 'Conclusion' },
          { key: 'Inserteridentity', label: 'Inserter Identity' },
          { key: 'InserterCountry', label: 'Inserter Country' }
        ]}
      />
    </div>
  );
};

export default ContentieuxList;