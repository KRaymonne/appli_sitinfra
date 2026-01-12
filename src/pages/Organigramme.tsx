import { useState, useEffect, useMemo } from 'react';
import { AlertCircle } from 'lucide-react';
import ViewDetailsModal from '../Formscomponents/PersonnelForms/lists/ViewDetailsModal';
import { useAuth } from '../context/AuthContext';

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

// Mapping des rôles vers les labels d'affichage
const countryToTopRoleLabel: Record<string, string> = {
  CAMEROON: 'Responsable SITINFRA CMR',
  IVORY_COAST: 'Responsable SITINFRA CIV',
  ITALIE: 'Responsable SITALIA IT',
  ITALIEPKBIM: 'Responsable PKBIM ITPKBIM',
  ROMANIE: 'Responsable SIT Infrastructure ROM',
  GHANA: 'Responsable GEOTOP GHA',
  BENIN: 'Responsable GEOTOP BEN',
  TOGO: 'Responsable GEOTOP TOG',
  SIERRALEONE: 'Responsable GEOTOP SL',
  GUINEE: 'Responsable GUI',
  BURKINAFASO: 'Responsable BUR',
};

const getRoleLabels = (country: string) => ({
  PRESIDENT_DIRECTEUR_GENERALE: countryToTopRoleLabel[country] || 'PRÉSIDENT DIRECTEUR GÉNÉRALE',
  SECRETARIAT: 'SECRÉTARIAT',
  DIRECTION_ADMINISTRATIVE: 'DIRECTION ADMINISTRATIVE',
  AUDIT_ET_CONTROLE_DE_GESTION: 'AUDIT ET CONTRÔLE DE GESTION',
  ADMINISTRATIF_FINANCIER: 'ADMINISTRATIF / FINANCIER',
  RESSOURCES_HUMAINES: 'RESSOURCES HUMAINES',
  DIRECTION_COMMERCIALE: 'DIRECTION COMMERCIALE',
  DEMARCHE_COMMERCIALE: 'DÉMARCHE COMMERCIALE',
  AMID_DAO: 'AMID/DAO',
  DIRECTION_TECHNIQUE: 'DIRECTION TECHNIQUE',
  PROJET_VRD: 'PROJET VRD',
  TOPOGRAPHIE: 'TOPOGRAPHIE',
  SIG: 'SIG',
  ENVIRONNEMENT_SOCIOLOGUE: 'ENVIRONNEMENT / SOCIOLOGUE',
  DIRECTION_INFORMATIQUE: 'DIRECTION INFORMATIQUE',
  BD_GENIE: 'BD GÉNIE',
  PK_BIM: 'PK/BIM',
  APP: 'APP',
  WEB_MIA: 'WEB/IA',
});

// Structure de l'organigramme par lignes
const organigrammeStructure = [
  {
    level: 1,
    roles: ['PRESIDENT_DIRECTEUR_GENERALE'],
  },
  {
    level: 2,
    roles: ['SECRETARIAT'],
  },
  {
    level: 3,
    roles: ['DIRECTION_ADMINISTRATIVE', 'AUDIT_ET_CONTROLE_DE_GESTION'],
  },
  {
    level: 4,
    roles: ['ADMINISTRATIF_FINANCIER', 'RESSOURCES_HUMAINES'],
  },
  {
    level: 5,
    roles: ['DIRECTION_COMMERCIALE'],
  },
  {
    level: 6,
    roles: ['DEMARCHE_COMMERCIALE', 'AMID_DAO'],
  },
  {
    level: 7,
    roles: ['DIRECTION_TECHNIQUE'],
  },
  {
    level: 8,
    roles: ['PROJET_VRD', 'TOPOGRAPHIE', 'SIG', 'ENVIRONNEMENT_SOCIOLOGUE'],
  },
  {
    level: 9,
    roles: ['DIRECTION_INFORMATIQUE'],
  },
  {
    level: 10,
    roles: ['BD_GENIE', 'PK_BIM', 'APP', 'WEB_MIA'],
  },
];

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

export function Organigramme() {
  const { role, workcountry: userWorkcountry, userId } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [userStructureName, setUserStructureName] = useState<string | null>(null);
  const [loadingUserData, setLoadingUserData] = useState(true);
  
  // Determine if user is admin (can click to see details)
  const isAdmin = role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'DIRECTEUR_TECHNIQUE' || role === 'DIRECTEUR_ADMINISTRATIF';
  const isSuperAdmin = role === 'SUPER_ADMIN';
  
  // For non-super-admin users, use their own workcountry and structureName
  const [selectedCountry, setSelectedCountry] = useState<string>('CAMEROON');
  const [selectedStructure, setSelectedStructure] = useState<string>('SITINFRA');
  
  // Fetch current user's structureName
  useEffect(() => {
    const fetchUserData = async () => {
      if (!userId) {
        setLoadingUserData(false);
        return;
      }
      
      try {
        const response = await fetch(`/.netlify/functions/personnel-users?id=${userId}`);
        if (response.ok) {
          const userData = await response.json();
          const user = Array.isArray(userData) ? userData.find((u: any) => u.id === Number(userId)) : userData;
          if (user) {
            setUserStructureName(user.structureName || null);
            // Set default filters for non-super-admin users
            if (!isSuperAdmin) {
              if (user.workcountry) {
                setSelectedCountry(user.workcountry);
              }
              if (user.structureName) {
                setSelectedStructure(user.structureName);
              }
            }
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoadingUserData(false);
      }
    };
    
    fetchUserData();
  }, [userId, isSuperAdmin]);

  // Fetch users based on filters (only if user can view organigramme)
  useEffect(() => {
    // Don't fetch if user data is still loading or if user cannot view
    if (loadingUserData || !userWorkcountry || !userStructureName) {
      return;
    }
    
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          workcountry: selectedCountry,
          structureName: selectedStructure,
        });
        const response = await fetch(`/.netlify/functions/organigramme-responsibles?${params}`);
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        const data = await response.json();
        setUsers(data.users || []);
      } catch (error) {
        console.error('Error fetching users:', error);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [selectedCountry, selectedStructure, loadingUserData, userWorkcountry, userStructureName]);

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
  
  // Check if user can view organigramme
  const canViewOrganigramme = userWorkcountry && userStructureName;
  const missingInfo = [];
  if (!userWorkcountry) missingInfo.push('pays de travail (workcountry)');
  if (!userStructureName) missingInfo.push('structure (structureName)');

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

  // Show error message if user cannot view organigramme
  if (loadingUserData) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }
  
  if (!canViewOrganigramme) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Organigramme</h1>
        </div>
        
        <div className="bg-red-50 border-l-4 border-red-400 p-6 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="h-6 w-6 text-red-400 mr-3 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">
                Impossible d'afficher l'organigramme
              </h3>
              <p className="text-red-700 mb-2">
                Vous ne pouvez pas voir l'organigramme car certaines informations sont manquantes dans votre profil :
              </p>
              <ul className="list-disc list-inside text-red-700 mb-4 space-y-1">
                {missingInfo.map((info, index) => (
                  <li key={index}>{info}</li>
                ))}
              </ul>
              <p className="text-red-700 font-medium">
                Veuillez contacter un administrateur pour qu'il complète votre profil avec ces informations.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (() => {
    const roleLabels = getRoleLabels(selectedCountry);
    return (
    <div className="p-6 space-y-6">

      {/* Filters - Only editable for SUPER_ADMIN */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pays
            </label>
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              disabled={!isSuperAdmin}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                !isSuperAdmin ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            >
              {Object.entries(WorkcountryEnum).map(([key, value]) => (
                <option key={key} value={value}>
                  {value.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
            {!isSuperAdmin && (
              <p className="text-xs text-gray-500 mt-1">Votre pays de travail</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Structure
            </label>
            <select
              value={selectedStructure}
              onChange={(e) => setSelectedStructure(e.target.value)}
              disabled={!isSuperAdmin}
              className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
                !isSuperAdmin ? 'bg-gray-100 cursor-not-allowed' : ''
              }`}
            >
              {Object.entries(StructureEnum).map(([key, value]) => (
                <option key={key} value={value}>
                  {value}
                </option>
              ))}
            </select>
            {!isSuperAdmin && (
              <p className="text-xs text-gray-500 mt-1">Votre structure</p>
            )}
          </div>
        </div>
      </div>

      {/* Organigramme */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="space-y-8">
            {organigrammeStructure.map((level) => (
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
            { key: 'role', label: 'Rôle', render: (val: string) => roleLabels[val] || val },
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
            { key: 'workcountry', label: 'Pays de travail' },
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
  })();
}

