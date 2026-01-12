import React from 'react';
import { 
  exportProfessionalServicesToPDF, 
  exportProfessionalServicesToExcel, 
  exportProfessionalServicesToCSV,
  exportCompanyExpensesToPDF,
  exportCompanyExpensesToExcel,
  exportCompanyExpensesToCSV,
  exportOtherInvoicesToPDF,
  exportOtherInvoicesToExcel,
  exportOtherInvoicesToCSV,
  ProfessionalService,
  CompanyExpense,
  OtherInvoice
} from '../../../utils/exportInvoiceUtils';

// Define local interfaces that match the actual list components
interface LocalProfessionalService {
  professionalServiceId: number;
  invoiceNumber: string;
  serviceType: string;
  supplier: string;
  amount: number;
  currency: string; // Using currency instead of devise
  invoiceDate: string;
  paymentDate?: string;
  status: string;
  description?: string;
  paymentMethod?: string;
}

interface LocalCompanyExpense {
  companyExpenseId: number;
  chargeType: string;
  employee?: {
    firstName: string;
    lastName: string;
  };
  amount: number;
  devise: string;
  paymentDate: string;
  status: string;
  description?: string;
  service?: string;
  attachment?: string;
}

interface LocalOtherInvoice {
  otherInvoiceId: number;
  invoiceNumber: string;
  category: string;
  supplier: string;
  supplierContact?: {
    firstName: string;
    lastName: string;
  };
  amount: number;
  devise: string;
  invoiceDate: string;
  paymentDate?: string;
  status: string;
  description?: string;
  service?: string;
  attachment?: string;
}

interface ExportInvoiceDropdownProps {
  invoices: (LocalProfessionalService | LocalCompanyExpense | LocalOtherInvoice)[];
  invoiceType: 'professionalservices' | 'companyexpenses' | 'otherinvoices';
}

const ExportInvoiceDropdown: React.FC<ExportInvoiceDropdownProps> = ({ invoices, invoiceType }) => {
  const [open, setOpen] = React.useState(false);
  const [selectedMonth, setSelectedMonth] = React.useState<string>('');
  const [selectedYear, setSelectedYear] = React.useState<string>('');

  // Get date field based on invoice type
  const getDateField = (invoice: LocalProfessionalService | LocalCompanyExpense | LocalOtherInvoice): string => {
    switch (invoiceType) {
      case 'professionalservices': 
        return (invoice as LocalProfessionalService).invoiceDate;
      case 'companyexpenses': 
        return (invoice as LocalCompanyExpense).paymentDate;
      case 'otherinvoices': 
        return (invoice as LocalOtherInvoice).invoiceDate;
      default: 
        return '';
    }
  };

  // Extraire les mois et années disponibles dans les factures
  const months = React.useMemo(() => {
    const ms = new Set<string>();
    invoices.forEach((invoice) => {
      const dateField = getDateField(invoice);
      if (dateField) {
        const d = new Date(dateField);
        ms.add((d.getMonth() + 1).toString().padStart(2, '0'));
      }
    });
    return Array.from(ms);
  }, [invoices, invoiceType]);
  
  const years = React.useMemo(() => {
    const ys = new Set<string>();
    invoices.forEach((invoice) => {
      const dateField = getDateField(invoice);
      if (dateField) {
        const d = new Date(dateField);
        ys.add(d.getFullYear().toString());
      }
    });
    return Array.from(ys);
  }, [invoices, invoiceType]);

  // Filtrer les factures selon le mois et l'année sélectionnés
  const filtered = React.useMemo(() => {
    return invoices.filter((invoice) => {
      const dateField = getDateField(invoice);
      if (!dateField) return true;
      const d = new Date(dateField);
      const m = (d.getMonth() + 1).toString().padStart(2, '0');
      const y = d.getFullYear().toString();
      return (!selectedMonth || m === selectedMonth) && (!selectedYear || y === selectedYear);
    });
  }, [invoices, selectedMonth, selectedYear, invoiceType]);

  // Map local interfaces to export interfaces
  const mapProfessionalServiceToExport = (service: LocalProfessionalService): ProfessionalService => ({
    professionalServiceId: service.professionalServiceId,
    invoiceNumber: service.invoiceNumber,
    serviceType: service.serviceType,
    supplier: service.supplier,
    amount: service.amount,
    devise: service.currency, // Map currency to devise
    invoiceDate: service.invoiceDate,
    paymentDate: service.paymentDate,
    status: service.status,
    description: service.description,
    paymentMethod: service.paymentMethod
  });

  const mapCompanyExpenseToExport = (expense: LocalCompanyExpense): CompanyExpense => ({
    companyExpenseId: expense.companyExpenseId,
    chargeType: expense.chargeType,
    employee: expense.employee,
    amount: expense.amount,
    devise: expense.devise,
    paymentDate: expense.paymentDate,
    status: expense.status,
    description: expense.description,
    service: expense.service,
    attachment: expense.attachment
  });

  const mapOtherInvoiceToExport = (invoice: LocalOtherInvoice): OtherInvoice => ({
    otherInvoiceId: invoice.otherInvoiceId,
    invoiceNumber: invoice.invoiceNumber,
    category: invoice.category,
    supplier: invoice.supplier,
    supplierContact: invoice.supplierContact,
    amount: invoice.amount,
    devise: invoice.devise,
    invoiceDate: invoice.invoiceDate,
    paymentDate: invoice.paymentDate,
    status: invoice.status,
    description: invoice.description,
    service: invoice.service,
    attachment: invoice.attachment
  });

  const handleExport = (type: 'pdf' | 'excel' | 'csv') => {
    if (!filtered || filtered.length === 0) return;
    
    switch (invoiceType) {
      case 'professionalservices':
        const servicesToExport = filtered.map(item => mapProfessionalServiceToExport(item as LocalProfessionalService));
        if (type === 'pdf') exportProfessionalServicesToPDF(servicesToExport);
        if (type === 'excel') exportProfessionalServicesToExcel(servicesToExport);
        if (type === 'csv') exportProfessionalServicesToCSV(servicesToExport);
        break;
      case 'companyexpenses':
        const expensesToExport = filtered.map(item => mapCompanyExpenseToExport(item as LocalCompanyExpense));
        if (type === 'pdf') exportCompanyExpensesToPDF(expensesToExport);
        if (type === 'excel') exportCompanyExpensesToExcel(expensesToExport);
        if (type === 'csv') exportCompanyExpensesToCSV(expensesToExport);
        break;
      case 'otherinvoices':
        const invoicesToExport = filtered.map(item => mapOtherInvoiceToExport(item as LocalOtherInvoice));
        if (type === 'pdf') exportOtherInvoicesToPDF(invoicesToExport);
        if (type === 'excel') exportOtherInvoicesToExcel(invoicesToExport);
        if (type === 'csv') exportOtherInvoicesToCSV(invoicesToExport);
        break;
    }
    
    setOpen(false);
  };

  const getTitle = () => {
    switch (invoiceType) {
      case 'professionalservices': return 'Télécharger les services';
      case 'companyexpenses': return 'Télécharger les charges';
      case 'otherinvoices': return 'Télécharger les factures';
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

export default ExportInvoiceDropdown;