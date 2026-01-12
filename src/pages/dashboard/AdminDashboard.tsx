import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Users, Contact, Wrench, Package, 
  Briefcase, AlertTriangle, Car, FileText, 
  Banknote, Wallet, Calculator, Monitor, FolderOpen, Network, Building } from 'lucide-react';

export function AdminDashboard() {
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
    return 'Admin';
  };
  const displayName = getDisplayName();

  const quickLinks = [
    { icon: Users, label: t('sidebar.personnel'), path: '/dashboard/personnel', color: 'bg-blue-100 text-blue-600' },
    { icon: Contact, label: t('sidebar.contacts'), path: '/dashboard/contacts', color: 'bg-green-100 text-green-600' },
    { icon: Wrench, label: t('sidebar.equipment'), path: '/dashboard/equipements', color: 'bg-purple-100 text-purple-600' },
    { icon: Package, label: t('sidebar.offers'), path: '/dashboard/offres', color: 'bg-orange-100 text-orange-600' },
    { icon: Briefcase, label: t('sidebar.business'), path: '/dashboard/affaires', color: 'bg-indigo-100 text-indigo-600' },
    { icon: AlertTriangle, label: t('sidebar.alertsShort'), path: '/dashboard/alertes', color: 'bg-red-100 text-red-600' },
    { icon: Car, label: t('sidebar.vehicles'), path: '/dashboard/parc-auto', color: 'bg-cyan-100 text-cyan-600' },
    { icon: FileText, label: t('sidebar.invoices'), path: '/dashboard/factures', color: 'bg-yellow-100 text-yellow-600' },
    { icon: Banknote, label: t('sidebar.banks'), path: '/dashboard/banques', color: 'bg-emerald-100 text-emerald-600' },
    { icon: Wallet, label: t('sidebar.registers'), path: '/dashboard/registres', color: 'bg-pink-100 text-pink-600' },
    { icon: Calculator, label: t('sidebar.taxes'), path: '/dashboard/impots', color: 'bg-amber-100 text-amber-600' },
    { icon: Monitor, label: t('sidebar.software'), path: '/dashboard/software', color: 'bg-teal-100 text-teal-600' },
    { icon: FolderOpen, label: t('sidebar.documents'), path: '/dashboard/documents', color: 'bg-violet-100 text-violet-600' },
    { icon: Network, label: t('sidebar.organigramme'), path: '/dashboard/organigramme', color: 'bg-sky-100 text-sky-600' },
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
                {t('dashboard.welcome')}, {displayName} !
              </h1>
              <p className="text-gray-600 mt-1">
                {t('dashboard.admin.subtitle')}
              </p>
            </div>
          </div>
          
          <div className="mt-6 p-6 bg-blue-50 rounded-lg border-l-4 border-blue-500">
            <p className="text-gray-700 leading-relaxed">
              👋 <strong>{t('dashboard.admin.welcomeMessage')}</strong>
            </p>
            <p className="text-gray-600 mt-2 leading-relaxed">
              {t('dashboard.admin.description')}
            </p>
          </div>
        </div>

        {/* Quick Links Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            {t('dashboard.quickAccess')}
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
                        {t('dashboard.clickToAccess')}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Information Card */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <LayoutDashboard className="w-5 h-5 text-blue-600" />
            {t('dashboard.navigationInstructions')}
          </h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>{t('dashboard.navigationPoint1')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>{t('dashboard.navigationPoint2')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>{t('dashboard.navigationPoint3')}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>{t('dashboard.navigationPoint4')}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

