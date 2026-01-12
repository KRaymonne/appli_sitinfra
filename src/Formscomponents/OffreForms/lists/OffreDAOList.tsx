import React, { useState, useMemo } from 'react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { OffreDetailsModal } from '../../../components/Offres/OffreDetailsModal';
import ExportOfferDropdown from './ExportOfferDropdown';

interface OffreDAO {
  daoId: number;
  activityCode?: string;
  transmissionDate: string;
  daoNumber: string;
  clientname: string; // Changé selon le modèle Prisma
  contactname?: string; // Changé selon le modèle Prisma
  submissionDate?: string;
  submissionType: string;
  object: string;
  status: string;
  attachment?: string;
  devise?: string; // Changé de currency à devise
}

interface OffreDAOListProps {
  offreDAO: OffreDAO[];
  onEdit: (dao: OffreDAO) => void;
  onDelete: (id: number) => void;
  onView: (dao: OffreDAO) => void;
}

const OffreDAOList: React.FC<OffreDAOListProps> = ({ offreDAO, onEdit, onDelete, onView }) => {
  const [filters, setFilters] = useState({
    status: '',
    submissionType: '',
    search: '',
  });
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; dao: OffreDAO | null }>({
    isOpen: false,
    dao: null,
  });
  const [detailsModal, setDetailsModal] = useState<{ isOpen: boolean; dao: OffreDAO | null }>({
    isOpen: false,
    dao: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPLICATION': return 'bg-blue-100 text-blue-800';
      case 'UNDER_REVIEW': return 'bg-yellow-100 text-yellow-800';
      case 'PENDING': return 'bg-orange-100 text-orange-800';
      case 'SHORTLISTED': return 'bg-green-100 text-green-800';
      case 'BID_SUBMITTED': return 'bg-purple-100 text-purple-800';
      case 'NOT_PURSUED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const filteredDAO = useMemo(() => {
    return offreDAO.filter((dao) => {
      if (filters.status && dao.status !== filters.status) return false;
      if (filters.submissionType && dao.submissionType !== filters.submissionType) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          dao.daoNumber.toLowerCase().includes(searchLower) ||
          dao.activityCode?.toLowerCase().includes(searchLower) ||
          dao.clientname.toLowerCase().includes(searchLower) ||
          dao.contactname?.toLowerCase().includes(searchLower) ||
          dao.object.toLowerCase().includes(searchLower)
        );
      }
      return true;
    });
  }, [offreDAO, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredDAO.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedDAO = filteredDAO.slice(startIndex, startIndex + itemsPerPage);

  const handleViewClick = (dao: OffreDAO) => {
    setDetailsModal({ isOpen: true, dao });
  };

  const handleDeleteClick = (dao: OffreDAO) => {
    setDeleteModal({ isOpen: true, dao });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.dao) {
      onDelete(deleteModal.dao.daoId);
      setDeleteModal({ isOpen: false, dao: null });
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
              placeholder="N° DAO, code, client, objet..."
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
              <option value="APPLICATION">Candidature</option>
              <option value="UNDER_REVIEW">En Étude</option>
              <option value="PENDING">En Attente</option>
              <option value="SHORTLISTED">Retenu</option>
              <option value="BID_SUBMITTED">Soumission</option>
              <option value="NOT_PURSUED">Pas de suite</option>
            </select>
          </div>

          {/* Submission Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type de soumission
            </label>
            <select
              value={filters.submissionType}
              onChange={(e) => setFilters({ ...filters, submissionType: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous</option>
              <option value="ELECTRONIC">Électronique</option>
              <option value="PHYSICAL">Physique</option>
              <option value="EMAIL">Email</option>
            </select>
          </div>
        </div>

        {/* Results count and Export */}
        <div className="mt-3 flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {filteredDAO.length} DAO trouvé(s)
          </div>
          {/* Export Dropdown */}
          <ExportOfferDropdown offers={filteredDAO} offerType="dao" />
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {paginatedDAO.map((dao) => (
          <div
            key={dao.daoId}
            className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onView(dao)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {dao.daoNumber}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(dao.status)}`}>
                      {getStatusText(dao.status)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {dao.clientname}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(dao.transmissionDate).toLocaleDateString('fr-FR')}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {getSubmissionTypeText(dao.submissionType)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 truncate">{dao.object}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewClick(dao);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Voir les détails"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(dao);
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
                    handleDeleteClick(dao);
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
        <div className="flex justify-center space-x-2 mt-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Précédent
          </button>
          <span className="px-3 py-1 text-gray-700">
            Page {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, dao: null })}
        onConfirm={handleDeleteConfirm}
        itemName={deleteModal.dao ? `DAO ${deleteModal.dao.daoNumber}` : ''}
        itemType="le DAO"
      />

      {/* Details Modal */}
      <OffreDetailsModal
        isOpen={detailsModal.isOpen}
        onClose={() => setDetailsModal({ isOpen: false, dao: null })}
        data={detailsModal.dao}
        type="dao"
      />
    </div>
  );
};

export default OffreDAOList;

