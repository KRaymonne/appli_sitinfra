import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

// Mapping des anciennes URLs vers les nouvelles
const urlMappings: Record<string, string> = {
  '/ContactCreate': '/contacts/create',
  '/ContactList': '/contacts/list',
  '/BankCreate': '/banks/create',
  '/BankList': '/banks/list',
  '/BusinessCreate': '/business/create',
  '/BusinessList': '/business/list',
  '/CashRegisterCreate': '/cash-registers/create',
  '/CashRegisterList': '/cash-registers/list',
  '/EquipmentCreate': '/equipments/create',
  '/EquipmentList': '/equipments/list',
  '/InvoiceCreate': '/invoices/create',
  '/InvoiceList': '/invoices/list',
  '/OfferCreate': '/offers/create',
  '/OfferList': '/offers/list',
  '/PersonnelCreate': '/personnel/create',
  '/PersonnelList': '/personnel/list',
  '/TaxCreate': '/taxes/create',
  '/TaxList': '/taxes/list',
  '/VehicleCreate': '/vehicles/create',
  '/VehicleList': '/vehicles/list',
};

export function RedirectHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;
    
    // Vérifier si l'URL actuelle correspond à une ancienne URL
    if (urlMappings[currentPath]) {
      console.log(`Redirection de ${currentPath} vers ${urlMappings[currentPath]}`);
      navigate(urlMappings[currentPath], { replace: true });
    }
  }, [location.pathname, navigate]);

  return null; // Ce composant ne rend rien
}

