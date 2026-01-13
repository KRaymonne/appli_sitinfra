import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Building, MapPin, Users, Filter, X } from 'lucide-react';
import ViewDetailsModal from '../Formscomponents/PersonnelForms/lists/ViewDetailsModal';

// Types 
interface User {
  id: number;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  dateOfBirth: string;
  placeOfBirth: string;
  devise: string;
  civilityDropdown: string;
  maritalStatus: string;
  nationality: string;
  identityType: string;
  identity: string;
  workcountry: string;
  structureName: string | null;
  isStructureResponsible: boolean;
  address: string;
  phone: string;
  phoneno: string;
  gender: string;
  country: string;
  emergencyName: string;
  emergencyContact: string;
  childrenCount: number;
  department: string;
  salary: number;
  hireDate: string;
  createdAt: string;
  updatedAt: string;
}

// Structure de l'organigramme groupe par lignes
const groupeOrganigrammeStructure = [
  {
    level: 1,
    roles: ['PRESIDENT_DIRECTEUR_GENERALE_GLOBALE'],
  },
  {
    level: 2,
    roles: ['SECRETARIAT_GLOBALE'],
  },
  {
    level: 3,
    roles: ['DIRECTION_ADMINISTRATIVE_COMMERCIAL_GLOBALE', 'DIRECTION_TECHNIQUE_GLOBALE'],
  },
];

// Labels des rôles globaux
const getGlobalRoleLabels = () => ({
  PRESIDENT_DIRECTEUR_GENERALE_GLOBALE: 'PRÉSIDENT DIRECTEUR GÉNÉRAL GLOBAL',
  SECRETARIAT_GLOBALE: 'SECRÉTARIAT GLOBAL',
  DIRECTION_ADMINISTRATIVE_COMMERCIAL_GLOBALE: 'DIRECTION ADMINISTRATIVE ET COMMERCIALE GLOBALE',
  DIRECTION_TECHNIQUE_GLOBALE: 'DIRECTION TECHNIQUE GLOBALE',
});

// Enum values
const StructureEnum = {
  SITINFRA: 'SITINFRA',
  SITALIA: 'SITALIA',
  PKBIM: 'PKBIM',
  GEOTOP: 'GEOTOP',
  SITInfrastructure: 'SITInfrastructure',
} as const;

const WorkcountryEnum = {
  IVORY_COAST: 'IVORY_COAST',
  GHANA: 'GHANA',
  BENIN: 'BENIN',
  CAMEROON: 'CAMEROON',
  TOGO: 'TOGO',
  ROMANIE: 'ROMANIE',
  ITALIE: 'ITALIE',
  ITALIEPKBIM: 'ITALIEPKBIM',
  GUINEE: 'GUINEE',
  BURKINAFASO: 'BURKINAFASO',
  SIERRALEONE: 'SIERRALEONE',
} as const;

// Mapping des pays vers les labels
const countryLabels: Record<string, string> = {
  IVORY_COAST: 'Côte d\'Ivoire',
  GHANA: 'Ghana',
  BENIN: 'Bénin',
  CAMEROON: 'Cameroun',
  TOGO: 'Togo',
  ROMANIE: 'Roumanie',
  ITALIE: 'Italie',
  ITALIEPKBIM: 'Italie PKBIM',
  GUINEE: 'Guinée',
  BURKINAFASO: 'Burkina Faso',
  SIERRALEONE: 'Sierra Leone',
};

// Liste de tous les rôles disponibles
const allRoles = [
  'SUPER_ADMIN',
  'ADMIN',
  'ACCOUNTANT',
  'DIRECTOR',
  'EMPLOYEE',
  'HR',
  'SECRETARY',
  'TECHNICIAN',
  'DIRECTEUR_TECHNIQUE',
  'DIRECTEUR_ADMINISTRATIF',
  'SENIOR_TECHNICIAN',
  'ENGINEER',
  'EXECUTIVE',
  'INTERN',
  'DRIVER',
  'PRESIDENT_DIRECTEUR_GENERALE',
  'PRESIDENT_DIRECTEUR_GENERALE_GLOBALE',
  'SECRETARIAT',
  'SECRETARIAT_GLOBALE',
  'DIRECTION_ADMINISTRATIVE',
  'DIRECTION_ADMINISTRATIVE_COMMERCIAL_GLOBALE',
  'DIRECTION_TECHNIQUE_GLOBALE',
  'AUDIT_ET_CONTROLE_DE_GESTION',
  'ADMINISTRATIF_FINANCIER',
  'RESSOURCES_HUMAINES',
  'DIRECTION_COMMERCIALE',
  'DEMARCHE_COMMERCIALE',
  'AMID_DAO',
  'DIRECTION_TECHNIQUE',
  'PROJET_VRD',
  'TOPOGRAPHIE',
  'SIG',
  'ENVIRONNEMENT_SOCIOLOGUE',
  'BD_GENIE',
  'PK_BIM',
  'APP',
  'WEB_MIA',
  'DIRECTION_INFORMATIQUE',
];

// Labels des rôles pour l'affichage
const roleDisplayLabels: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  ACCOUNTANT: 'Comptable',
  DIRECTOR: 'Directeur',
  EMPLOYEE: 'Employé',
  HR: 'Ressources Humaines',
  SECRETARY: 'Secrétaire',
  TECHNICIAN: 'Technicien',
  DIRECTEUR_TECHNIQUE: 'Directeur Technique',
  DIRECTEUR_ADMINISTRATIF: 'Directeur Administratif',
  SENIOR_TECHNICIAN: 'Technicien Senior',
  ENGINEER: 'Ingénieur',
  EXECUTIVE: 'Cadre',
  INTERN: 'Stagiaire',
  DRIVER: 'Chauffeur',
  PRESIDENT_DIRECTEUR_GENERALE: 'Président Directeur Général',
  PRESIDENT_DIRECTEUR_GENERALE_GLOBALE: 'Président Directeur Général Global',
  SECRETARIAT: 'Secrétariat',
  SECRETARIAT_GLOBALE: 'Secrétariat Global',
  DIRECTION_ADMINISTRATIVE: 'Direction Administrative',
  DIRECTION_ADMINISTRATIVE_COMMERCIAL_GLOBALE: 'Direction Administrative et Commerciale Globale',
  DIRECTION_TECHNIQUE_GLOBALE: 'Direction Technique Globale',
  AUDIT_ET_CONTROLE_DE_GESTION: 'Audit et Contrôle de Gestion',
  ADMINISTRATIF_FINANCIER: 'Administratif Financier',
  RESSOURCES_HUMAINES: 'Ressources Humaines',
  DIRECTION_COMMERCIALE: 'Direction Commerciale',
  DEMARCHE_COMMERCIALE: 'Démarche Commerciale',
  AMID_DAO: 'AMID DAO',
  DIRECTION_TECHNIQUE: 'Direction Technique',
  PROJET_VRD: 'Projet VRD',
  TOPOGRAPHIE: 'Topographie',
  SIG: 'SIG',
  ENVIRONNEMENT_SOCIOLOGUE: 'Environnement Sociologue',
  BD_GENIE: 'BD Génie',
  PK_BIM: 'PK BIM',
  APP: 'APP',
  WEB_MIA: 'WEB MIA',
  DIRECTION_INFORMATIQUE: 'Direction Informatique',
};

export function OrganigrammeGroupe() {
  const { role, userId } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  // Filtres
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('ALL');
  
  // Determine if user is admin (can click to see details)
  const isAdmin = role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'PRESIDENT_DIRECTEUR_GENERALE_GLOBALE' || role === 'PRESIDENT_DIRECTEUR_GENERALE' || role === 'DIRECTEUR_TECHNIQUE' || role === 'DIRECTEUR_ADMINISTRATIF';

  // Vérifier si des filtres sont actifs
  const hasActiveFilters = selectedRole !== '' || (selectedCountry !== '' && selectedCountry !== 'ALL');

  // Fetch global users (pour l'organigramme par défaut)
  useEffect(() => {
    if (hasActiveFilters) {
      // Ne pas charger les utilisateurs globaux si des filtres sont actifs
      return;
    }
    
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const globalRoles = [
          'PRESIDENT_DIRECTEUR_GENERALE_GLOBALE',
          'SECRETARIAT_GLOBALE',
          'DIRECTION_ADMINISTRATIVE_COMMERCIAL_GLOBALE',
          'DIRECTION_TECHNIQUE_GLOBALE'
        ];
        
        // Fetch users with global roles
        const allUsers: User[] = [];
        for (const globalRole of globalRoles) {
          try {
            const response = await fetch(`/.netlify/functions/personnel-users?role=${globalRole}`);
            if (response.ok) {
              const data = await response.json();
              const roleUsers = Array.isArray(data) ? data : (data.users || []);
              allUsers.push(...roleUsers);
            }
          } catch (error) {
            console.error(`Error fetching users for role ${globalRole}:`, error);
          }
        }
        
        setUsers(allUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [hasActiveFilters]);

  // Fetch filtered users
  useEffect(() => {
    if (!hasActiveFilters) {
      setFilteredUsers([]);
      setLoading(false);
      return;
    }

    const fetchFilteredUsers = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (selectedRole) {
          params.append('role', selectedRole);
        }
        if (selectedCountry && selectedCountry !== 'ALL') {
          params.append('workcountry', selectedCountry);
        }

        const url = `/.netlify/functions/personnel-users?${params.toString()}`;
        console.log('Fetching filtered users with URL:', url);
        
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          const fetchedUsers = Array.isArray(data) ? data : (data.users || []);
          console.log('Fetched users:', fetchedUsers.length, 'users');
          setFilteredUsers(fetchedUsers);
        } else {
          console.error('Failed to fetch users:', response.status, response.statusText);
          setFilteredUsers([]);
        }
      } catch (error) {
        console.error('Error fetching filtered users:', error);
        setFilteredUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredUsers();
  }, [selectedRole, selectedCountry, hasActiveFilters]);

  // Group users by role
  const usersByRole = useMemo(() => {
    const grouped: Record<string, User[]> = {};
    users.forEach((user) => {
      if (!grouped[user.role]) {
        grouped[user.role] = [];
      }
      grouped[user.role].push(user);
    });
    return grouped;
  }, [users]);

  // Handle user click (only for admins)
  const handleUserClick = (user: User) => {
    if (isAdmin) {
      setSelectedUser(user);
      setShowModal(true);
    }
  };

  // Handle box click - navigate to organigramme with country and structure
  const handleBoxClick = (country: string, structure: string) => {
    navigate(`/dashboard/organigramme?country=${country}&structure=${structure}&fromGroupe=true`);
  };

  // Liste des combinaisons réelles pays/structure (seulement les pays qui ont une structure)
  const countryStructureCombinations = useMemo(() => {
    const combinations: Array<{ country: string; structure: string }> = [
      { country: 'CAMEROON', structure: 'SITINFRA' },
      { country: 'IVORY_COAST', structure: 'SITINFRA' },
      { country: 'ROMANIE', structure: 'SITInfrastructure' },
      { country: 'ITALIE', structure: 'SITALIA' },
      { country: 'ITALIEPKBIM', structure: 'PKBIM' },
      { country: 'GHANA', structure: 'GEOTOP' },
      { country: 'BENIN', structure: 'GEOTOP' },
      { country: 'TOGO', structure: 'GEOTOP' },
      { country: 'SIERRALEONE', structure: 'GEOTOP' },
    ];
    return combinations;
  }, []);

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'ON_HOLIDAY':
        return 'bg-yellow-100 text-yellow-800';
      case 'SUSPENDED':
        return 'bg-orange-100 text-orange-800';
      case 'FIRED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Actif';
      case 'ON_HOLIDAY':
        return 'En congé';
      case 'SUSPENDED':
        return 'Suspendu';
      case 'FIRED':
        return 'Licencié';
      default:
        return status;
    }
  };

  const roleLabels = getGlobalRoleLabels();

  // Reset filters
  const handleResetFilters = () => {
    setSelectedRole('');
    setSelectedCountry('ALL');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Organigramme Groupe</h1>
      </div>

      {/* Filtres */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center gap-4 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-800">Filtres de recherche</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Filtre par rôle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rôle
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Tous les rôles</option>
              {allRoles.map((roleOption) => (
                <option key={roleOption} value={roleOption}>
                  {roleDisplayLabels[roleOption] || roleOption}
                </option>
              ))}
            </select>
          </div>

          {/* Filtre par pays */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pays
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="ALL">Tous les pays</option>
              {Object.entries(WorkcountryEnum).map(([key, value]) => (
                <option key={value} value={value}>
                  {countryLabels[value] || value}
                </option>
              ))}
            </select>
          </div>

          {/* Bouton réinitialiser */}
          <div className="flex items-end">
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
              >
                <X className="w-4 h-4" />
                Réinitialiser
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Résultats de recherche */}
      {hasActiveFilters && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-800">
                Résultats de la recherche
              </h2>
              <span className="text-sm text-gray-500">
                ({filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? 's' : ''})
              </span>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">Aucun utilisateur trouvé avec ces critères</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => handleUserClick(user)}
                  className={`bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-all duration-200 hover:scale-105 group ${
                    isAdmin ? 'cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-blue-100 text-blue-600 group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {user.firstName} {user.lastName}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                        <MapPin className="w-3 h-3" />
                        <span>{countryLabels[user.workcountry] || user.workcountry}</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {roleDisplayLabels[user.role] || user.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Organigramme Global - Masqué si filtres actifs */}
      {!hasActiveFilters && (
        <>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="space-y-8">
                {groupeOrganigrammeStructure.map((level) => (
                  <div key={level.level} className="flex flex-wrap gap-4 justify-center">
                    {level.roles.map((role) => {
                      const roleUsers = usersByRole[role] || [];
                      const roleLabel = roleLabels[role] || role;
                      const count = roleUsers.length;

                      return (
                        <div
                          key={role}
                          className="flex-1 min-w-[250px] max-w-[350px] border-2 border-gray-300 rounded-lg p-4 bg-gradient-to-br from-blue-50 to-white hover:shadow-lg transition-shadow"
                        >
                          <div className="text-center mb-3">
                            <h3 className="text-sm font-bold text-gray-800 mb-1">
                              {level.level}. {roleLabel}
                            </h3>
                            <p className="text-xs text-gray-600">
                              ({count} responsable{count !== 1 ? 's' : ''})
                            </p>
                          </div>
                          <div className="space-y-2">
                            {count === 0 ? (
                              <p className="text-sm text-gray-400 italic text-center py-2">
                                Aucun responsable
                              </p>
                            ) : (
                              roleUsers.map((user) => (
                                <div
                                  key={user.id}
                                  onClick={() => handleUserClick(user)}
                                  className={`w-full text-left px-3 py-2 bg-white border border-gray-200 rounded-md transition-colors ${
                                    isAdmin
                                      ? 'hover:bg-blue-50 hover:border-blue-300 cursor-pointer'
                                      : 'cursor-default'
                                  }`}
                                >
                                  <p className="text-sm font-medium text-gray-900">
                                    {user.firstName} {user.lastName}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {user.employeeNumber}
                                  </p>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Country/Structure Boxes */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Organigrammes par Structure et Pays
          </h2>
          <p className="text-sm text-gray-600 italic">
            (Cliquez sur une boîte ci-dessous pour visualiser l'organigramme correspondant)
          </p>
        </div>
        <div className="overflow-x-auto pb-2">
          <div className="flex flex-wrap gap-4 min-w-max">
            {countryStructureCombinations.map(({ country, structure }, index) => {
              // Assign colors based on structure for visual variety
              const structureColors: Record<string, string> = {
                'SITINFRA': 'bg-blue-100 text-blue-600',
                'SITALIA': 'bg-green-100 text-green-600',
                'PKBIM': 'bg-purple-100 text-purple-600',
                'GEOTOP': 'bg-orange-100 text-orange-600',
                'SITInfrastructure': 'bg-indigo-100 text-indigo-600',
              };
              const boxColor = structureColors[structure] || 'bg-gray-100 text-gray-600';
              
              return (
                <div
                  key={`${country}-${structure}-${index}`}
                  onClick={() => handleBoxClick(country, structure)}
                  className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-all duration-200 hover:scale-105 group cursor-pointer min-w-[220px] flex-shrink-0 active:scale-95"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`p-3 rounded-lg ${boxColor} group-hover:scale-110 transition-transform mb-3`}>
                      <Building className="w-6 h-6" />
                    </div>
                    <div className="mb-2">
                      <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors text-base">
                        {structure}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      <span>{countryLabels[country] || country}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-2 group-hover:text-blue-500 transition-colors">
                      Cliquez pour visualiser
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* User Details Modal - Only for admins */}
      {selectedUser && isAdmin && (
        <ViewDetailsModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setSelectedUser(null);
          }}
          title={`Détails - ${selectedUser.firstName} ${selectedUser.lastName}`}
          data={selectedUser}
          fields={[
            { key: 'id', label: 'ID' },
            { key: 'employeeNumber', label: 'Numéro d\'employé' },
            { key: 'firstName', label: 'Prénom' },
            { key: 'lastName', label: 'Nom' },
            { key: 'email', label: 'Email' },
            { key: 'role', label: 'Rôle', render: (val: string) => roleDisplayLabels[val] || roleLabels[val] || val },
            {
              key: 'status',
              label: 'Statut',
              render: (val: string) => (
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(val)}`}>
                  {getStatusText(val)}
                </span>
              ),
            },
            { key: 'department', label: 'Département' },
            { key: 'workcountry', label: 'Pays de travail', render: (val: string) => countryLabels[val] || val },
            { key: 'structureName', label: 'Structure', render: (val: string | null) => val || '-' },
            { key: 'isStructureResponsible', label: 'Responsable de structure', render: (val: boolean) => val ? 'Oui' : 'Non' },
            { key: 'phone', label: 'Téléphone' },
            { key: 'address', label: 'Adresse' },
            { key: 'hireDate', label: 'Date d\'embauche', render: formatDate },
            { key: 'dateOfBirth', label: 'Date de naissance', render: formatDate },
            { key: 'nationality', label: 'Nationalité' },
            { key: 'createdAt', label: 'Créé le', render: formatDate },
            { key: 'updatedAt', label: 'Mis à jour le', render: formatDate },
          ]}
        />
      )}
    </div>
  );
}
