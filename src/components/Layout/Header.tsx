import React, { useState, useEffect } from 'react';
import { User, Bell, Globe, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  onCountryChange: (country: string) => void;
}

export function Header({ onCountryChange }: HeaderProps) {
  const { logout, role, email, firstName, lastName, effectiveCountryCode } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [country, setCountry] = useState(effectiveCountryCode || '');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showCountryMenu, setShowCountryMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [overdueAlertsCount, setOverdueAlertsCount] = useState(0);
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/signin');
  };

  const handleLogoutConfirm = () => {
    handleLogout();
    setShowLogoutModal(false);
  };

  const toggleLanguageMenu = () => {
    setShowLanguageMenu(!showLanguageMenu);
    setShowCountryMenu(false);
  };

  const toggleCountryMenu = () => {
    if (role !== 'SUPER_ADMIN') return; // Only SUPER_ADMIN can change country
    setShowCountryMenu(!showCountryMenu);
    setShowLanguageMenu(false);
    setShowUserMenu(false);
  };

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setShowLanguageMenu(false);
  };

  const changeCountry = (countryCode: string) => {
    setCountry(countryCode);
    setShowCountryMenu(false);
    if (onCountryChange) {
      onCountryChange(countryCode);
    }
  };

  // Liste des pays avec leurs informations
  // Restrict to Prisma Workcountry enum only
  const countries = [
    { code: 'cameroun', name: 'Cameroun', flag: '/image/cameroun.png' },
    { code: 'coteIvoire', name: 'Côte d\'Ivoire', flag: '/image/coteIvoire.png' },
    { code: 'italie', name: 'Italie', flag: '/image/italie.png' },
    { code: 'guinee', name: 'Guinée Conakry', flag: '/image/guinee.png' },
    { code: 'burkina', name: 'Burkina Faso', flag: '/image/burkina.png' },
    { code: 'ghana', name: 'Ghana', flag: '/image/ghana.jpg' },
    { code: 'benin', name: 'Bénin', flag: '/image/benin.png' },
    { code: 'togo', name: 'Togo', flag: '/image/togo.png' },
    { code: 'romanie', name: 'Roumanie', flag: '/image/romanie.png' },
    { code: 'sierraLeone', name: 'Sierra Leone', flag: '/image/sierraLeone.png' },
    { code: 'italiepkbim', name: 'Italie PKBIM', flag: '/image/italie.png', enterprise: 'PKBIM', logo: '/image/pkbim.png' }
  ];

  // Fonction pour obtenir le chemin du drapeau selon le pays
  const getFlagPath = (countryCode: string) => {
    const countryItem = countries.find(c => c.code === countryCode);
    return countryItem ? countryItem.flag : 'image/cameroun.png';
  };

  // Fetch overdue alerts count
  const fetchOverdueAlertsCount = async () => {
    try {
      const response = await fetch('/.netlify/functions/Alert-overdue');
      if (response.ok) {
        const data = await response.json();
        setOverdueAlertsCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching overdue alerts count:', error);
    }
  };

  // Keep UI country in sync when auth context changes
  useEffect(() => {
    if (effectiveCountryCode) setCountry(effectiveCountryCode);
  }, [effectiveCountryCode]);

  // Load overdue alerts count on component mount and refresh every 5 minutes
  useEffect(() => {
    fetchOverdueAlertsCount();
    const interval = setInterval(fetchOverdueAlertsCount, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Fermer les menus si on clique ailleurs
  React.useEffect(() => {
    const handleClickOutside = () => {
      setShowLanguageMenu(false);
      setShowCountryMenu(false);
      setShowUserMenu(false);
      setShowAlertsModal(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {/* Message de bienvenue */}
          <div className="flex items-center space-x-2">
            <span className="text-lg font-medium text-gray-700">
              {t('header.welcome')}
            </span>
            {firstName && (
              <span className="text-lg font-semibold text-blue-600">
                {firstName}!
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Sélecteur de langue */}
          <div className="relative">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleLanguageMenu();
              }}
              className="flex items-center space-x-2 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Globe className="w-5 h-5" />
              <span className="text-sm font-medium">{i18n.language.toUpperCase()}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {showLanguageMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                <button
                  onClick={() => changeLanguage('fr')}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                    i18n.language === 'fr' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  🇫🇷 Français
                </button>
                <button
                  onClick={() => changeLanguage('en')}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                    i18n.language === 'en' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  🇬🇧 English
                </button>
                <button
                  onClick={() => changeLanguage('it')}
                  className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                    i18n.language === 'it' ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  🇮🇹 Italiano
                </button>
              </div>
            )}
          </div>
          
          {/* Sélecteur de pays */}
          <div className="relative">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleCountryMenu();
              }}
              className="flex items-center space-x-2 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <img 
                src={getFlagPath(country || 'cameroun')} 
                alt={`${country || 'cameroun'}`} 
                className="w-5 h-5 object-cover rounded-sm"
                onError={(e) => {
                  console.error(`Error loading flag: ${getFlagPath(country || 'cameroun')}`);
                  e.currentTarget.src = 'image/cameroun.png'; // Fallback image
                }}
              />
              <span className="text-sm font-medium capitalize">{country || 'cameroun'}</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            
            {showCountryMenu && role === 'SUPER_ADMIN' && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200 max-h-80 overflow-y-auto">
                {countries.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => changeCountry(c.code)}
                    className={`flex items-center space-x-3 w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      country === c.code ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                    }`}
                  >
                    <img 
                      src={c.flag} 
                      alt={c.name} 
                      className="w-5 h-5 object-cover rounded-sm"
                      onError={(e) => {
                        console.error(`Erreur de chargement du drapeau: ${c.flag}`);
                        e.currentTarget.src = 'image/cameroun.png'; // Image de secours
                      }}
                    />
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Notifications */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowAlertsModal(true);
              fetchOverdueAlertsCount(); // Refresh count when opening
            }}
            className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            {overdueAlertsCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                {overdueAlertsCount}
              </span>
            )}
          </button>
          
          {/* User menu */}
          <div className="relative flex items-center space-x-3">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                {firstName && lastName 
                  ? `${firstName} ${lastName}` 
                  : email?.split('@')[0].toUpperCase() || t('header.user')}
              </p>
              <p className="text-xs text-gray-500">{role || t('header.user')}</p>
            </div>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                setShowUserMenu(!showUserMenu);
              }}
              className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              <User className="w-5 h-5" />
            </button>
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowUserMenu(false);
                    setShowLogoutModal(true);
                  }}
                  className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t('header.logout')}
                </button>
              </div>
            )}
          </div>

          {/* Bouton de déconnexion visible */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowLogoutModal(true);
            }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
            title={t('header.logout')}
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">{t('header.logout')}</span>
          </button>
        </div>
      </div>

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
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden transform transition-all">
              {/* Header */}
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 sm:px-6 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Bell className="w-6 h-6 text-blue-600" />
                  <h3 className="text-lg font-medium text-gray-900">{t('header.alertsTitle')}</h3>
                  {overdueAlertsCount > 0 && (
                    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-sm">
                      {overdueAlertsCount === 1 
                        ? t('header.alertsCount', { count: overdueAlertsCount })
                        : t('header.alertsCountPlural', { count: overdueAlertsCount })}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="text-gray-400 hover:text-gray-500"
                  onClick={() => setShowAlertsModal(false)}
                >
                  <ChevronDown className="h-6 w-6 rotate-45" />
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[60vh]">
                <div className="px-4 py-5 sm:px-6">
                  {overdueAlertsCount === 0 ? (
                    <div className="text-center py-12">
                      <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">{t('header.noAlerts')}</p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <Bell className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h4 className="text-red-800 font-semibold text-lg mb-2">
                          {overdueAlertsCount === 1 
                            ? t('header.alertsCount', { count: overdueAlertsCount })
                            : t('header.alertsCountPlural', { count: overdueAlertsCount })}
                        </h4>
                        <p className="text-red-600 mb-4">
                          {overdueAlertsCount === 1 
                            ? t('header.alertsMessage', { count: overdueAlertsCount })
                            : t('header.alertsMessagePlural', { count: overdueAlertsCount })}
                        </p>
                        <button
                          onClick={() => {
                            setShowAlertsModal(false);
                            navigate('/dashboard/alertes');
                          }}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                          {t('header.viewAlerts')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm"
                  onClick={() => setShowAlertsModal(false)}
                >
                  {t('header.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de déconnexion */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => setShowLogoutModal(false)}
            ></div>

            {/* Modal */}
            <div 
              className="relative bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header avec couleur de l'app (bleu) */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white bg-opacity-20 rounded-lg">
                      <LogOut className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white">
                      {t('header.logoutConfirmTitle')}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowLogoutModal(false)}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <span className="sr-only">{t('header.close')}</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 py-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="p-3 bg-blue-100 rounded-full">
                      <LogOut className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-700 text-base leading-relaxed">
                      {t('header.logoutConfirm')}
                    </p>
                    <p className="text-gray-500 text-sm mt-2">
                      {t('header.logoutConfirmMessage')}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer avec boutons */}
              <div className="bg-gray-50 px-6 py-4 rounded-b-xl flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowLogoutModal(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="button"
                  onClick={handleLogoutConfirm}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm hover:shadow-md"
                >
                  {t('header.logoutConfirmButton')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}