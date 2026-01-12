import React, { useState, useMemo } from 'react';
import { Eye, Edit2, Trash2, Search } from 'lucide-react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import ViewDetailsModal from './ViewDetailsModal';
import ExportContactDropdown from './ExportContactDropdown';

interface Contact {
  contactId: number;
  contactGroupe: string;
  companyName: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  secondPhone?: string;
  address?: string;
  country?: string;
  createdAt?: string;
  Inserteridentity?: string;
  InserterCountry?: string;
}

interface ContactListProps {
  contacts: Contact[];
  onEdit: (contact: Contact) => void;
  onDelete: (id: number) => void;
  onView: (contact: Contact) => void;
}

const ContactList: React.FC<ContactListProps> = ({ contacts, onEdit, onDelete, onView }) => {
  const [filters, setFilters] = useState({
    contactGroupe: '',
    companyName: '',
    search: '',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; contact: Contact | null }>({
    isOpen: false,
    contact: null,
  });
  const [viewModal, setViewModal] = useState<{ isOpen: boolean; contact: Contact | null }>({
    isOpen: false,
    contact: null,
  });

  const getGroupeText = (groupe: string) => {
    switch (groupe) {
      case 'CLIENT': return 'Client';
      case 'SUPPLIER': return 'Fournisseur';
      case 'CONSULTANTS': return 'Consultants';
      case 'PUBLIC_ADMINISTRATION': return 'Administration Publique';
      case 'OTHERS': return 'Autres';
      default: return groupe;
    }
  };

  const getGroupeColor = (groupe: string) => {
    switch (groupe) {
      case 'CLIENT': return 'bg-blue-100 text-blue-800';
      case 'SUPPLIER': return 'bg-green-100 text-green-800';
      case 'CONSULTANTS': return 'bg-purple-100 text-purple-800';
      case 'PUBLIC_ADMINISTRATION': return 'bg-orange-100 text-orange-800';
      case 'OTHERS': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCompanyText = (company: string) => {
    switch (company) {
      case 'SITINFRA_SARL': return 'SITINFRA SARL';
      case 'GEOTOP': return 'GEOTOP';
      case 'SITALIA': return 'SITALIA';
      case 'OTHER_COMPANY': return 'Autre Entreprise';
      default: return company;
    }
  };

  const filteredContacts = useMemo(() => {
    return contacts.filter((contact) => {
      if (filters.contactGroupe && contact.contactGroupe !== filters.contactGroupe) return false;
      if (filters.companyName && contact.companyName !== filters.companyName) return false;
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          contact.firstName.toLowerCase().includes(searchLower) ||
          contact.lastName.toLowerCase().includes(searchLower) ||
          (contact.email && contact.email.toLowerCase().includes(searchLower)) ||
          (contact.phone && contact.phone.toLowerCase().includes(searchLower)) ||
          (contact.secondPhone && contact.secondPhone.toLowerCase().includes(searchLower)) ||
          (contact.country && contact.country.toLowerCase().includes(searchLower))
        );
      }
      return true;
    });
  }, [contacts, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedContacts = filteredContacts.slice(startIndex, endIndex);

  const handleDeleteClick = (contact: Contact) => {
    setDeleteModal({ isOpen: true, contact });
  };

  const handleViewClick = (contact: Contact) => {
    setViewModal({ isOpen: true, contact });
  };

  const handleDeleteConfirm = () => {
    if (deleteModal.contact) {
      onDelete(deleteModal.contact.contactId);
      setDeleteModal({ isOpen: false, contact: null });
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Rechercher par nom, prénom, email, téléphone..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Contact Groupe Filter */}
          <div>
            <select
              value={filters.contactGroupe}
              onChange={(e) => setFilters({ ...filters, contactGroupe: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tous les groupes</option>
              <option value="CLIENT">Client</option>
              <option value="SUPPLIER">Fournisseur</option>
              <option value="CONSULTANTS">Consultants</option>
              <option value="PUBLIC_ADMINISTRATION">Administration Publique</option>
              <option value="OTHERS">Autres</option>
            </select>
          </div>

          {/* Company Name Filter */}
          <div>
            <select
              value={filters.companyName}
              onChange={(e) => setFilters({ ...filters, companyName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Toutes les entreprises</option>
              <option value="SITINFRA_SARL">SITINFRA SARL</option>
              <option value="GEOTOP">GEOTOP</option>
              <option value="SITALIA">SITALIA</option>
              <option value="OTHER_COMPANY">Autre Entreprise</option>
            </select>
          </div>

          {/* Items per page */}
          <div>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
            </select>
          </div>
        </div>

        {/* Reset Filters and Results count */}
        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => {
              setFilters({ contactGroupe: '', companyName: '', search: '' });
              setCurrentPage(1);
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Réinitialiser les filtres
          </button>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''} trouvé{filteredContacts.length !== 1 ? 's' : ''}
            </div>
            {/* Export Dropdown */}
            <ExportContactDropdown contacts={filteredContacts} />
          </div>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nom Complet
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Groupe
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entreprise
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Téléphones
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pays
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedContacts.map((contact) => (
                <tr key={contact.contactId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contact.contactId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {contact.firstName} {contact.lastName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getGroupeColor(contact.contactGroupe)}`}>
                      {getGroupeText(contact.contactGroupe)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getCompanyText(contact.companyName)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contact.email || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      {contact.phone || '-'}
                      {contact.secondPhone && (
                        <div className="text-xs text-gray-500 mt-1">2ème: {contact.secondPhone}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {contact.country || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => handleViewClick(contact)}
                        className="p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        title="Voir"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(contact)}
                        className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
                        title="Modifier"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(contact)}
                        className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
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
                  <span className="font-medium">{Math.min(endIndex, filteredContacts.length)}</span> sur{' '}
                  <span className="font-medium">{filteredContacts.length}</span> résultats
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
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, contact: null })}
        onConfirm={handleDeleteConfirm}
        itemName={deleteModal.contact ? `${deleteModal.contact.firstName} ${deleteModal.contact.lastName}` : ''}
      />

      {/* View Details Modal */}
      <ViewDetailsModal
        isOpen={viewModal.isOpen}
        onClose={() => setViewModal({ isOpen: false, contact: null })}
        title="Détails du Contact"
        data={viewModal.contact || {}}
        fields={[
          { key: 'contactId', label: 'ID' },
          { key: 'firstName', label: 'Prénom' },
          { key: 'lastName', label: 'Nom' },
          { key: 'contactGroupe', label: 'Groupe' },
          { key: 'companyName', label: 'Entreprise' },
          { key: 'email', label: 'Email' },
          { key: 'phone', label: 'Téléphone Principal' },
          { key: 'secondPhone', label: 'Deuxième Téléphone' },
          { key: 'address', label: 'Adresse' },
          { key: 'country', label: 'Pays' },
          { key: 'Inserteridentity', label: 'Inserter Identity' },
          { key: 'InserterCountry', label: 'Inserter Country' },
          { key: 'createdAt', label: 'Créé le', render: (val: string) => val ? new Date(val).toLocaleDateString('fr-FR') : '-' }
        ]}
      />
    </div>
  );
};

export default ContactList;