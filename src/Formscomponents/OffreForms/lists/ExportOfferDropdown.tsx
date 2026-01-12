import React from 'react';
import { 
  exportOffreDevisToPDF, 
  exportOffreDevisToExcel, 
  exportOffreDevisToCSV,
  exportOffreDAOToPDF,
  exportOffreDAOToExcel,
  exportOffreDAOToCSV,
  exportOffreAMIToPDF,
  exportOffreAMIToExcel,
  exportOffreAMIToCSV,
  OffreDevis,
  OffreDAO,
  OffreAMI
} from '../../../utils/exportOfferUtils';

// Define the interfaces that match the actual list components
interface LocalOffreDevis {
  devisId: number;
  indexNumber: string;
  clientname: string;
  amount: number;
  validityDate: string;
  status: string;
  description?: string;
  attachment?: string;
  devise?: string;
}

interface LocalOffreDAO {
  daoId: number;
  activityCode?: string;
  transmissionDate: string;
  daoNumber: string;
  clientname: string;
  contactname?: string;
  submissionDate?: string;
  submissionType: string;
  object: string;
  status: string;
  attachment?: string;
  devise?: string;
}

interface LocalOffreAMI {
  amiId: number;
  activityCode?: string;
  depositDate: string;
  name: string;
  client: string;
  contact?: string;
  submissionDate: string;
  object: string;
  status: string;
  comment?: string;
  soumissionType?: string;
  attachment?: string;
}

interface ExportOfferDropdownProps {
  offers: (LocalOffreDevis | LocalOffreDAO | LocalOffreAMI)[];
  offerType: 'devis' | 'dao' | 'ami';
}

const ExportOfferDropdown: React.FC<ExportOfferDropdownProps> = ({ offers, offerType }) => {
  const [open, setOpen] = React.useState(false);
  const [selectedMonth, setSelectedMonth] = React.useState<string>('');
  const [selectedYear, setSelectedYear] = React.useState<string>('');

  // Get date field based on offer type
  const getDateField = (offer: LocalOffreDevis | LocalOffreDAO | LocalOffreAMI): string => {
    switch (offerType) {
      case 'devis': 
        return (offer as LocalOffreDevis).validityDate;
      case 'dao': 
        return (offer as LocalOffreDAO).transmissionDate;
      case 'ami': 
        return (offer as LocalOffreAMI).depositDate;
      default: 
        return '';
    }
  };

  // Extraire les mois et années disponibles dans les offres
  const months = React.useMemo(() => {
    const ms = new Set<string>();
    offers.forEach((offer) => {
      const dateField = getDateField(offer);
      if (dateField) {
        const d = new Date(dateField);
        ms.add((d.getMonth() + 1).toString().padStart(2, '0'));
      }
    });
    return Array.from(ms);
  }, [offers, offerType]);
  
  const years = React.useMemo(() => {
    const ys = new Set<string>();
    offers.forEach((offer) => {
      const dateField = getDateField(offer);
      if (dateField) {
        const d = new Date(dateField);
        ys.add(d.getFullYear().toString());
      }
    });
    return Array.from(ys);
  }, [offers, offerType]);

  // Filtrer les offres selon le mois et l'année sélectionnés
  const filtered = React.useMemo(() => {
    return offers.filter((offer) => {
      const dateField = getDateField(offer);
      if (!dateField) return true;
      const d = new Date(dateField);
      const m = (d.getMonth() + 1).toString().padStart(2, '0');
      const y = d.getFullYear().toString();
      return (!selectedMonth || m === selectedMonth) && (!selectedYear || y === selectedYear);
    });
  }, [offers, selectedMonth, selectedYear, offerType]);

  // Map local interfaces to export interfaces
  const mapDevisToExport = (devis: LocalOffreDevis): OffreDevis => ({
    devisId: devis.devisId,
    indexNumber: devis.indexNumber,
    clientname: devis.clientname,
    amount: devis.amount,
    validityDate: devis.validityDate,
    status: devis.status,
    description: devis.description,
    attachment: devis.attachment,
    devise: devis.devise
  });

  const mapDAOToExport = (dao: LocalOffreDAO): OffreDAO => ({
    daoId: dao.daoId,
    referenceNumber: dao.daoNumber,
    title: dao.object,
    client: dao.clientname,
    amount: 0, // DAO doesn't have amount in the local interface, defaulting to 0
    submissionDeadline: dao.transmissionDate,
    status: dao.status,
    description: dao.object,
    attachment: dao.attachment,
    devise: dao.devise
  });

  const mapAMIToExport = (ami: LocalOffreAMI): OffreAMI => ({
    amiId: ami.amiId,
    referenceNumber: ami.name,
    title: ami.object,
    client: ami.client,
    amount: 0, // AMI doesn't have amount in the local interface
    submissionDeadline: ami.depositDate,
    status: ami.status,
    description: ami.object,
    attachment: ami.attachment,
    devise: undefined // AMI doesn't have devise in the local interface
  });

  const handleExport = (type: 'pdf' | 'excel' | 'csv') => {
    if (!filtered || filtered.length === 0) return;
    
    switch (offerType) {
      case 'devis':
        const devisToExport = filtered.map(item => mapDevisToExport(item as LocalOffreDevis));
        if (type === 'pdf') exportOffreDevisToPDF(devisToExport);
        if (type === 'excel') exportOffreDevisToExcel(devisToExport);
        if (type === 'csv') exportOffreDevisToCSV(devisToExport);
        break;
      case 'dao':
        const daoToExport = filtered.map(item => mapDAOToExport(item as LocalOffreDAO));
        if (type === 'pdf') exportOffreDAOToPDF(daoToExport);
        if (type === 'excel') exportOffreDAOToExcel(daoToExport);
        if (type === 'csv') exportOffreDAOToCSV(daoToExport);
        break;
      case 'ami':
        const amiToExport = filtered.map(item => mapAMIToExport(item as LocalOffreAMI));
        if (type === 'pdf') exportOffreAMIToPDF(amiToExport);
        if (type === 'excel') exportOffreAMIToExcel(amiToExport);
        if (type === 'csv') exportOffreAMIToCSV(amiToExport);
        break;
    }
    
    setOpen(false);
  };

  const getTitle = () => {
    switch (offerType) {
      case 'devis': return 'Télécharger les devis';
      case 'dao': return 'Télécharger les DAO';
      case 'ami': return 'Télécharger les AMI';
      default: return 'Télécharger';
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
        onClick={() => setOpen((o) => !o)}
        title={getTitle()}
      >
        Télécharger ▼
      </button>
      {open && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-2 px-3 border-b border-gray-100 flex gap-2">
            <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="border rounded px-2 py-1 text-sm">
              <option value="">Mois</option>
              {months.sort().map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="border rounded px-2 py-1 text-sm">
              <option value="">Année</option>
              {years.sort().map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="py-1">
            <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onClick={() => handleExport('pdf')}>PDF</button>
            <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onClick={() => handleExport('excel')}>Excel</button>
            <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onClick={() => handleExport('csv')}>CSV</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportOfferDropdown;