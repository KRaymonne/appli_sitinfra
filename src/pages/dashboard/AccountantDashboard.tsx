import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Users, Contact, Wrench, Package, 
  Briefcase, AlertTriangle, Car, FileText, 
  Banknote, Wallet, Calculator, Monitor, FolderOpen, Network, Building } from 'lucide-react';

export function AccountantDashboard() {
  const { email, firstName, lastName } = useAuth();
  const { t } = useTranslation();
  
  const getDisplayName = () => {
    if (firstName && lastName) {
      return `${firstName} ${lastName}`;
    }
    if (firstName) {
      return firstName;
    }
    if (email) {
      const emailPart = email.split('@')[0];
      const firstPart = emailPart.split('.')[0];
      if (firstPart) {
        return firstPart.charAt(0).toUpperCase() + firstPart.slice(1);
      }
    }
    return 'Comptable';
  };
  const displayName = getDisplayName();

  const quickLinks = [
    { icon: Wallet, label: 'Caisses', path: '/dashboard/registres', color: 'bg-pink-100 text-pink-600' },
    { icon: Banknote, label: 'Banques', path: '/dashboard/banques', color: 'bg-emerald-100 text-emerald-600' },
    { icon: FileText, label: 'Factures', path: '/dashboard/factures', color: 'bg-yellow-100 text-yellow-600' },
    { icon: Car, label: 'Parc Auto', path: '/dashboard/parc-auto', color: 'bg-cyan-100 text-cyan-600' },
    { icon: AlertTriangle, label: 'Alertes', path: '/dashboard/alertes', color: 'bg-red-100 text-red-600' },
    { icon: Calculator, label: 'Impôts et Taxes', path: '/dashboard/impots', color: 'bg-amber-100 text-amber-600' },
    { icon: Users, label: 'Personnel', path: '/dashboard/personnel', color: 'bg-blue-100 text-blue-600' },
    { icon: Contact, label: 'Contacts', path: '/dashboard/contacts', color: 'bg-green-100 text-green-600' },
    { icon: Wrench, label: 'Équipements', path: '/dashboard/equipements', color: 'bg-purple-100 text-purple-600' },
    { icon: Package, label: 'Offres', path: '/dashboard/offres', color: 'bg-orange-100 text-orange-600' },
    { icon: Briefcase, label: 'Affaires', path: '/dashboard/affaires', color: 'bg-indigo-100 text-indigo-600' },
    { icon: Monitor, label: 'Logiciels', path: '/dashboard/software', color: 'bg-teal-100 text-teal-600' },
    { icon: FolderOpen, label: 'Documents', path: '/dashboard/documents', color: 'bg-violet-100 text-violet-600' },
    { icon: Network, label: 'Organigramme', path: '/dashboard/organigramme', color: 'bg-sky-100 text-sky-600' },
    { icon: Building, label: t('sidebar.groupe'), path: '/dashboard/groupe', color: 'bg-rose-100 text-rose-600' },
  ];

  return (
    <div className="min-h-full bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border border-gray-200">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-4 bg-blue-100 rounded-xl">
              <LayoutDashboard className="w-10 h-10 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Bienvenue, {displayName} !
              </h1>
              <p className="text-gray-600 mt-1">
                Tableau de bord de gestion financière et comptable
              </p>
            </div>
          </div>
          
          <div className="mt-6 p-6 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <p className="text-gray-700 leading-relaxed">
              👋 <strong>Bienvenue dans votre espace comptable !</strong>
            </p>
            <p className="text-gray-600 mt-2 leading-relaxed">
              Utilisez la <strong>barre latérale (Sidebar)</strong> à gauche pour naviguer entre les différents modules. 
              Vous pouvez gérer les caisses, les banques, les factures, le parc auto, les alertes, les impôts et taxes, 
              le personnel, les contacts, les équipements, les offres et les affaires.
            </p>
          </div>
        </div>

        {/* Quick Links Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Accès rapide aux modules
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {quickLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-all duration-200 hover:scale-105 group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg ${link.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {link.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Cliquez pour accéder
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

