import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { SuperAdminDashboard } from './dashboard/SuperAdminDashboard';
import { AdminDashboard } from './dashboard/AdminDashboard';
import { DirectorDashboard } from './dashboard/DirectorDashboard';
import { DirecteurTechniqueDashboard } from './dashboard/DirecteurTechniqueDashboard';
import { DirecteurAdministratifDashboard } from './dashboard/DirecteurAdministratifDashboard';
import { EmployeeDashboard } from './dashboard/EmployeeDashboard';
import { SecretaryDashboard } from './dashboard/SecretaryDashboard';
import { AccountantDashboard } from './dashboard/AccountantDashboard';
import { DefaultDashboard } from './dashboard/DefaultDashboard';

// Liste des rôles qui ont un dashboard spécifique
const ROLES_WITH_SPECIFIC_DASHBOARD = [
  'SUPER_ADMIN',
  'ADMIN',
  'DIRECTOR',
  'DIRECTEUR_TECHNIQUE',
  'DIRECTEUR_ADMINISTRATIF',
  'EMPLOYEE',
  'SECRETARY',
  'ACCOUNTANT'
];

export function RoleBasedDashboard() {
  const { role } = useAuth();
  const { t } = useTranslation();

  // Si le rôle n'a pas de dashboard spécifique, utiliser le dashboard par défaut
  if (!role || !ROLES_WITH_SPECIFIC_DASHBOARD.includes(role)) {
    return <DefaultDashboard />;
  }

  switch (role) {
    case 'SUPER_ADMIN':
      return <SuperAdminDashboard />;
    case 'ADMIN':
      return <AdminDashboard />;
    case 'DIRECTOR':
      return <DirectorDashboard />;
    case 'DIRECTEUR_TECHNIQUE':
      return <DirecteurTechniqueDashboard />;
    case 'DIRECTEUR_ADMINISTRATIF':
      return <DirecteurAdministratifDashboard />;
    case 'EMPLOYEE':
      return <EmployeeDashboard />;
    case 'SECRETARY':
      return <SecretaryDashboard />;
    case 'ACCOUNTANT':
      return <AccountantDashboard />;
    default:
      return <DefaultDashboard />;
  }
}

