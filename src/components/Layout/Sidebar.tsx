import React, { useEffect, useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Contact, Wrench, Package, 
  Briefcase, AlertTriangle, Car, FileText, 
  Banknote, Wallet, Calculator, Bell, X, Monitor, FolderOpen, Network
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

// Helper function to get menu items with translations
const getMenuItems = (t: any, role: string): Array<{ icon: any; labelKey: string; path: string }> => {
  const adminItems = [
    { icon: LayoutDashboard, labelKey: 'sidebar.dashboard', path: '/dashboard' },
    { icon: Network, labelKey: 'sidebar.organigramme', path: '/dashboard/organigramme' },
    { icon: Users, labelKey: 'sidebar.groupe', path: '/dashboard/groupe' },
    { icon: Users, labelKey: 'sidebar.personnel', path: '/dashboard/personnel' },
    { icon: Contact, labelKey: 'sidebar.contacts', path: '/dashboard/contacts' },
    { icon: Wrench, labelKey: 'sidebar.equipment', path: '/dashboard/equipements' },
    { icon: Package, labelKey: 'sidebar.offers', path: '/dashboard/offres' },
    { icon: Briefcase, labelKey: 'sidebar.business', path: '/dashboard/affaires' },
    { icon: AlertTriangle, labelKey: 'sidebar.alerts', path: '/dashboard/alertes' },
    { icon: Car, labelKey: 'sidebar.vehicles', path: '/dashboard/parc-auto' },
    { icon: FileText, labelKey: 'sidebar.invoices', path: '/dashboard/factures' },
    { icon: Banknote, labelKey: 'sidebar.banks', path: '/dashboard/banques' },
    { icon: Wallet, labelKey: 'sidebar.registers', path: '/dashboard/registres' },
    { icon: Calculator, labelKey: 'sidebar.taxes', path: '/dashboard/impots' },
    { icon: Monitor, labelKey: 'sidebar.software', path: '/dashboard/software' },
    { icon: FolderOpen, labelKey: 'sidebar.documents', path: '/dashboard/documents' },
  ];

  const secretaryItems = [
    { icon: LayoutDashboard, labelKey: 'sidebar.dashboard', path: '/dashboard' },
    { icon: Network, labelKey: 'sidebar.organigramme', path: '/dashboard/organigramme' },
    { icon: Users, labelKey: 'sidebar.groupe', path: '/dashboard/groupe' },
    { icon: FileText, labelKey: 'sidebar.invoices', path: '/dashboard/factures' },
    { icon: Wrench, labelKey: 'sidebar.equipment', path: '/dashboard/equipements' },
    { icon: Contact, labelKey: 'sidebar.contacts', path: '/dashboard/contacts' },
    { icon: Package, labelKey: 'sidebar.offers', path: '/dashboard/offres' },
    { icon: Briefcase, labelKey: 'sidebar.business', path: '/dashboard/affaires' },
    { icon: AlertTriangle, labelKey: 'sidebar.alertsShort', path: '/dashboard/alertes' },
    { icon: Car, labelKey: 'sidebar.vehicles', path: '/dashboard/parc-auto' },
    { icon: Users, labelKey: 'sidebar.personnel', path: '/dashboard/personnel' },
    { icon: Monitor, labelKey: 'sidebar.software', path: '/dashboard/software' },
    { icon: FolderOpen, labelKey: 'sidebar.documents', path: '/dashboard/documents' },
  ];

  const accountantItems = [
    { icon: LayoutDashboard, labelKey: 'sidebar.dashboard', path: '/dashboard' },
    { icon: Network, labelKey: 'sidebar.organigramme', path: '/dashboard/organigramme' },
    { icon: Users, labelKey: 'sidebar.groupe', path: '/dashboard/groupe' },
    { icon: Wallet, labelKey: 'sidebar.registers', path: '/dashboard/registres' },
    { icon: Banknote, labelKey: 'sidebar.banks', path: '/dashboard/banques' },
    { icon: FileText, labelKey: 'sidebar.invoices', path: '/dashboard/factures' },
    { icon: Car, labelKey: 'sidebar.vehicles', path: '/dashboard/parc-auto' },
    { icon: AlertTriangle, labelKey: 'sidebar.alertsShort', path: '/dashboard/alertes' },
    { icon: Calculator, labelKey: 'sidebar.taxes', path: '/dashboard/impots' },
    { icon: Users, labelKey: 'sidebar.personnel', path: '/dashboard/personnel' },
    { icon: Contact, labelKey: 'sidebar.contacts', path: '/dashboard/contacts' },
    { icon: Wrench, labelKey: 'sidebar.equipment', path: '/dashboard/equipements' },
    { icon: Package, labelKey: 'sidebar.offers', path: '/dashboard/offres' },
    { icon: Briefcase, labelKey: 'sidebar.business', path: '/dashboard/affaires' },
    { icon: Monitor, labelKey: 'sidebar.software', path: '/dashboard/software' },
    { icon: FolderOpen, labelKey: 'sidebar.documents', path: '/dashboard/documents' },
  ];

  const employeeItems = [
    { icon: LayoutDashboard, labelKey: 'sidebar.dashboard', path: '/dashboard' },
    { icon: Network, labelKey: 'sidebar.organigramme', path: '/dashboard/organigramme' },
    { icon: Users, labelKey: 'sidebar.groupe', path: '/dashboard/groupe' },
    { icon: FileText, labelKey: 'sidebar.invoices', path: '/dashboard/factures' },
    { icon: Wrench, labelKey: 'sidebar.equipment', path: '/dashboard/equipements' },
    { icon: Contact, labelKey: 'sidebar.contacts', path: '/dashboard/contacts' },
    { icon: Package, labelKey: 'sidebar.offers', path: '/dashboard/offres' },
    { icon: Briefcase, labelKey: 'sidebar.business', path: '/dashboard/affaires' },
    { icon: AlertTriangle, labelKey: 'sidebar.alertsShort', path: '/dashboard/alertes' },
    { icon: Car, labelKey: 'sidebar.vehicles', path: '/dashboard/parc-auto' },
    { icon: Monitor, labelKey: 'sidebar.software', path: '/dashboard/software' },
    { icon: FolderOpen, labelKey: 'sidebar.documents', path: '/dashboard/documents' },
  ];

  // Items de menu par défaut pour les rôles qui n'ont pas de menu spécifique
  const defaultItems = [
    { icon: LayoutDashboard, labelKey: 'sidebar.dashboard', path: '/dashboard' },
    { icon: Network, labelKey: 'sidebar.organigramme', path: '/dashboard/organigramme' },
    { icon: Users, labelKey: 'sidebar.groupe', path: '/dashboard/groupe' },
    { icon: Contact, labelKey: 'sidebar.contacts', path: '/dashboard/contacts' },
    { icon: Wrench, labelKey: 'sidebar.equipment', path: '/dashboard/equipements' },
    { icon: Package, labelKey: 'sidebar.offers', path: '/dashboard/offres' },
    { icon: Briefcase, labelKey: 'sidebar.business', path: '/dashboard/affaires' },
    { icon: AlertTriangle, labelKey: 'sidebar.alertsShort', path: '/dashboard/alertes' },
    { icon: Car, labelKey: 'sidebar.vehicles', path: '/dashboard/parc-auto' },
    { icon: FileText, labelKey: 'sidebar.invoices', path: '/dashboard/factures' },
    { icon: Monitor, labelKey: 'sidebar.software', path: '/dashboard/software' },
    { icon: FolderOpen, labelKey: 'sidebar.documents', path: '/dashboard/documents' },
  ];

  if (['SUPER_ADMIN', 'PRESIDENT_DIRECTEUR_GENERALE_GLOBALE', 'PRESIDENT_DIRECTEUR_GENERALE', 'ADMIN', 'DIRECTEUR_TECHNIQUE', 'DIRECTEUR_ADMINISTRATIF'].includes(role)) {
    return adminItems;
  }
  if (role === 'SECRETARY') return secretaryItems;
  if (role === 'ACCOUNTANT') return accountantItems;
  if (role === 'EMPLOYEE') return employeeItems;
  // Pour tous les autres rôles, retourner les items par défaut
  return defaultItems;
};

interface SidebarProps {
  country: string;
}

interface Alert {
  alertId: number;
  title: string;
  description?: string | null;
  dueDate: string;
  dueTime?: string | null;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  type: string;
  user?: {
    firstName: string;
    lastName: string;
  } | null;
}

export function Sidebar({ country }: SidebarProps) {
  const location = useLocation();
  const { role } = useAuth();
  const { t } = useTranslation();
  const [logoPath, setLogoPath] = useState('https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1');
  const [companyName, setCompanyName] = useState('SITINFRA');
  const [showLogo, setShowLogo] = useState(true);
  const [showCompanyName, setShowCompanyName] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [overdueCount, setOverdueCount] = useState(0);
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [loadingAlerts, setLoadingAlerts] = useState(false);

  // Obtenir les items de menu selon le rôle avec traductions
  const menuItems = useMemo(() => {
    if (!role) return [];
    return getMenuItems(t, role).map(item => ({
      ...item,
      label: t(item.labelKey)
    }));
  }, [role, t]);

  useEffect(() => {
    // Reset defaults
    setShowLogo(true);
    setShowCompanyName(true);
    
    // Mettre à jour le logo et le nom de l'entreprise lorsque le pays change
    switch(country) {
      case 'cameroun':
        setLogoPath('/image/logo_sitinfra_C.png');
        setCompanyName('SITINFRA');
        break;
      case 'coteIvoire':
        setLogoPath('/image/logo_sitinfra_CI.png');
        setCompanyName('SITINFRA');
        break;
      case 'romanie':
        setLogoPath(''); // No logo for Romania
        setCompanyName('SIT Infrastructure');
        setShowLogo(false);
        break;
      case 'italie':
        setLogoPath('/image/logo_sitinfra_I.png');
        setCompanyName('SITALIA');
        break;
      case 'italiepkbim':
        setLogoPath('/image/pkbim.png');
        setCompanyName('PKBIM');
        break;
      case 'ghana':
        setLogoPath('/image/geotop.png');
        setCompanyName('GEOTOP');
        break;
      case 'guinee':
      case 'burkina':
        setLogoPath('');
        setCompanyName('');
        setShowLogo(false);
        setShowCompanyName(false);
        break;
      case 'benin':
      case 'togo':
      case 'sierraLeone':
        setLogoPath('/image/geotop.png');
        setCompanyName('GEOTOP');
        break;
      default:
        setLogoPath('/image/logo_sitinfra_C.png');
        setCompanyName('SITINFRA');
    }
  }, [country]);

  // Map country code to flag path (reuse list from Header)
  const getFlagPath = (code: string) => {
    const map: Record<string, string> = {
      cameroun: '/image/cameroun.png',
      coteIvoire: '/image/coteIvoire.png',
      italie: '/image/italie.png',
      guinee: '/image/guinee.png',
      burkina: '/image/burkina.png',
      ghana: '/image/ghana.jpg',
      benin: '/image/benin.png',
      togo: '/image/togo.png',
      romanie: '/image/romanie.png',
      sierraLeone: '/image/sierraLeone.png',
      italiepkbim: '/image/italie.png',
    };
    return map[code] || 'image/cameroun.png';
  };

  // Fetch alerts and overdue count
  const fetchAlerts = async () => {
    setLoadingAlerts(true);
    try {
      // Fetch all alerts
      const alertsResponse = await fetch('/.netlify/functions/Alert-alerts');
      if (alertsResponse.ok) {
        const alertsData = await alertsResponse.json();
        setAlerts(alertsData.alerts || []);
      }

      // Fetch overdue count
      const overdueResponse = await fetch('/.netlify/functions/Alert-overdue');
      if (overdueResponse.ok) {
        const overdueData = await overdueResponse.json();
        setOverdueCount(overdueData.count || 0);
      }
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoadingAlerts(false);
    }
  };

  // Load alerts on component mount and refresh every 5 minutes
  useEffect(() => {
    fetchAlerts();
    
    // Refresh alerts every 5 minutes
    const interval = setInterval(fetchAlerts, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  // Use the overdue count from the API instead of calculating locally
  const hasOverdueAlerts = overdueCount > 0;

  const handleAlertsClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowAlertsModal(true);
    fetchAlerts(); // Refresh alerts when opening modal
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600 bg-red-50';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-50';
      case 'LOW': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'Élevée';
      case 'MEDIUM': return 'Moyenne';
      case 'LOW': return 'Faible';
      default: return priority;
    }
  };

  const formatDate = (dateString: string, timeString?: string | null) => {
    const date = new Date(dateString);
    const formattedDate = date.toLocaleDateString('fr-FR');
    
    if (timeString) {
      return `${formattedDate} à ${timeString}`;
    }
    
    return formattedDate;
  };

  const isOverdue = (dueDate: string, dueTime?: string | null) => {
    const now = new Date();
    const due = new Date(dueDate);
    
    // If no time specified, compare only dates
    if (!dueTime) {
      return due < new Date(now.toDateString());
    }
    
    // If time is specified, compare date and time
    const [hours, minutes] = dueTime.split(':').map(Number);
    due.setHours(hours, minutes, 0, 0);
    
    return due < now;
  };

  return (
    <div className="w-64 bg-white shadow-lg h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          {/* Logo de l'entreprise */}
          {showLogo && logoPath && (
            <img 
              src={logoPath} 
              alt={`Logo ${companyName}`} 
              className="w-12 h-12 object-contain" 
              onError={(e) => {
                console.error(`Erreur de chargement du logo: ${logoPath}`);
                e.currentTarget.src = 'image/logo_sitinfra_C.png'; // Image de secours
              }}
            />
          )}
          {showCompanyName && companyName && (
            <div>
              <h1 className="text-xl font-bold text-gray-800">{t('sidebar.companyName')}</h1>
              <div className="flex items-center space-x-2">
                <img
                  src={getFlagPath(country || 'cameroun')}
                  alt={`Drapeau ${country}`}
                  className="w-4 h-4 object-cover rounded-sm"
                  onError={(e) => {
                    console.error(`Erreur de chargement du drapeau: ${getFlagPath(country || 'cameroun')}`);
                    e.currentTarget.src = 'image/cameroun.png';
                  }}
                />
                <p className="text-xs text-gray-500 capitalize">{country || 'cameroun'}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto">
        <div className="p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path || location.pathname === '/dashboard' && item.path === '/dashboard';
              const isAlertsItem = item.path === '/dashboard/alertes';
              
              return (
                <li key={item.path}>
                  {isAlertsItem ? (
                    <button
                      onClick={handleAlertsClick}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 w-full text-left ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                      }`}
                    >
                      <div className="relative">
                        <Icon className={`w-5 h-5 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
                        {hasOverdueAlerts && (
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        )}
                      </div>
                      <span className="font-medium">{item.label}</span>
                      {hasOverdueAlerts && (
                        <span className="ml-auto text-xs bg-red-500 text-white px-2 py-1 rounded-full">
                          {overdueCount}
                        </span>
                      )}
                    </button>
                  ) : (
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                        isActive || location.pathname.startsWith(item.path + '/')
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                      }`}
                    >
                      <Icon className={`w-5 h-5 ${isActive || location.pathname.startsWith(item.path + '/') ? 'text-blue-700' : 'text-gray-500'}`} />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Alerts Modal */}
      {showAlertsModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => setShowAlertsModal(false)}
            ></div>

            {/* Modal */}
            <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden transform transition-all">
              {/* Header */}
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 sm:px-6 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-medium text-gray-900">{t('sidebar.alerts')}</h3>
                  {hasOverdueAlerts && (
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm">
                      {t('sidebar.alertsCount', { count: overdueCount })}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500"
                  onClick={() => setShowAlertsModal(false)}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[70vh]">
                <div className="px-4 py-5 sm:px-6">
                  {loadingAlerts ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : alerts.length === 0 ? (
                    <div className="text-center py-12">
                      <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">{t('sidebar.noAlerts')}</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Overdue Alerts */}
                      {alerts.filter(alert => isOverdue(alert.dueDate, alert.dueTime)).length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <h4 className="text-red-800 font-semibold mb-3 flex items-center">
                            <AlertTriangle className="w-5 h-5 mr-2" />
                            {t('sidebar.alertsCount', { count: alerts.filter(alert => isOverdue(alert.dueDate, alert.dueTime)).length })}
                          </h4>
                          <div className="space-y-3">
                            {alerts.filter(alert => isOverdue(alert.dueDate, alert.dueTime)).map((alert) => (
                              <div key={alert.alertId} className="bg-white border border-red-200 rounded-lg p-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h5 className="font-medium text-gray-900">{alert.title}</h5>
                                    {alert.description && (
                                      <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                                    )}
                                    <div className="flex items-center space-x-4 mt-2 text-sm">
                                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(alert.priority)}`}>
                                        {getPriorityLabel(alert.priority)}
                                      </span>
                                      <span className="text-gray-500">Type: {alert.type}</span>
                                      <span className="text-red-600 font-medium">
                                        Échéance: {formatDate(alert.dueDate, alert.dueTime)}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* All Alerts */}
                      <div>
                        <h4 className="text-gray-800 font-semibold mb-3">{t('sidebar.alerts')} ({alerts.length})</h4>
                        <div className="space-y-3">
                          {alerts.map((alert) => (
                            <div key={alert.alertId} className={`border rounded-lg p-3 ${
                              isOverdue(alert.dueDate, alert.dueTime) 
                                ? 'bg-red-50 border-red-200' 
                                : 'bg-gray-50 border-gray-200'
                            }`}>
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <h5 className="font-medium text-gray-900">{alert.title}</h5>
                                  {alert.description && (
                                    <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                                  )}
                                  <div className="flex items-center space-x-4 mt-2 text-sm">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(alert.priority)}`}>
                                      {getPriorityLabel(alert.priority)}
                                    </span>
                                    <span className="text-gray-500">Type: {alert.type}</span>
                                    <span className={`font-medium ${
                                      isOverdue(alert.dueDate, alert.dueTime) ? 'text-red-600' : 'text-gray-600'
                                    }`}>
                                      Échéance: {formatDate(alert.dueDate, alert.dueTime)}
                                    </span>
                                    {alert.user && (
                                      <span className="text-gray-500">
                                        Assigné à: {alert.user.firstName} {alert.user.lastName}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Link
                  to="/dashboard/alertes"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowAlertsModal(false)}
                >
                  {t('sidebar.alerts')}
                </Link>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowAlertsModal(false)}
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}