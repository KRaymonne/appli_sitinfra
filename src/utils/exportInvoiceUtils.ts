import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export interface ProfessionalService {
  professionalServiceId: number;
  invoiceNumber: string;
  serviceType: string;
  supplier: string;
  amount: number;
  devise: string;
  invoiceDate: string;
  paymentDate?: string;
  status: string;
  description?: string;
  paymentMethod?: string;
}

export interface CompanyExpense {
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

export interface OtherInvoice {
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

export function exportProfessionalServicesToPDF(services: ProfessionalService[], title = 'Rapport des services professionnels') {
  const doc = new jsPDF();
  const date = new Date().toLocaleString('fr-FR');
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`Date d'export : ${date}`, 14, 26);
  
  const body = services.map(s => [
    s.professionalServiceId,
    s.invoiceNumber,
    getServiceTypeText(s.serviceType),
    s.supplier,
    formatCurrency(s.amount, s.devise),
    formatDate(s.invoiceDate),
    s.paymentDate ? formatDate(s.paymentDate) : '',
    getStatusText(s.status),
    s.description || '',
    s.paymentMethod || ''
  ]);

  autoTable(doc, {
    startY: 32,
    head: [[ 'ID', 'N° Facture', 'Type Service', 'Fournisseur', 'Montant', 'Date Facture', 'Date Paiement', 'Statut', 'Description', 'Méthode Paiement' ]],
    body,
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    theme: 'grid',
  });

  doc.save(`${title.replace(/\s+/g, '_')}_${date.replace(/\s|:/g, '_')}.pdf`);
}

export function exportProfessionalServicesToExcel(services: ProfessionalService[], title = 'Services_professionnels') {
  const wsData = [
    ['ID', 'N° Facture', 'Type Service', 'Fournisseur', 'Montant', 'Devise', 'Date Facture', 'Date Paiement', 'Statut', 'Description', 'Méthode Paiement'],
    ...services.map((s: ProfessionalService) => [
      s.professionalServiceId,
      s.invoiceNumber,
      getServiceTypeText(s.serviceType),
      s.supplier,
      s.amount,
      s.devise,
      formatDate(s.invoiceDate),
      s.paymentDate ? formatDate(s.paymentDate) : '',
      getStatusText(s.status),
      s.description || '',
      s.paymentMethod || ''
    ])
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  // En-têtes en gras et colonnes auto-ajustées
  const ref = ws['!ref'] as string | undefined;
  if (ref) {
    const range = XLSX.utils.decode_range(ref);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell = ws[XLSX.utils.encode_cell({ r: 0, c: C })];
      if (cell) cell.s = { font: { bold: true } };
    }
  }
  ws['!cols'] = wsData[0].map(() => ({ wch: 20 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, title);
  XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}.xlsx`);
}

export function exportProfessionalServicesToCSV(services: ProfessionalService[], title = 'Services_professionnels') {
  const headers = ['ID', 'N° Facture', 'Type Service', 'Fournisseur', 'Montant', 'Devise', 'Date Facture', 'Date Paiement', 'Statut', 'Description', 'Méthode Paiement'];
  const rows = services.map(s => [
    s.professionalServiceId,
    s.invoiceNumber,
    getServiceTypeText(s.serviceType),
    s.supplier,
    s.amount,
    s.devise,
    formatDate(s.invoiceDate),
    s.paymentDate ? formatDate(s.paymentDate) : '',
    getStatusText(s.status),
    s.description || '',
    s.paymentMethod || ''
  ]);

  // BOM UTF-8 pour compat Excel / accents
  const bom = '\uFEFF';
  const csvContent = [headers, ...rows]
    .map((row: (string|number)[]) => row.map(field => `"${String(field).replace(/"/g, '""')}`.replace(/\n/g, ' ')).join(';'))
    .join('\r\n');

  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `${title.replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportCompanyExpensesToPDF(expenses: CompanyExpense[], title = 'Rapport des charges entreprise') {
  const doc = new jsPDF();
  const date = new Date().toLocaleString('fr-FR');
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`Date d'export : ${date}`, 14, 26);
  
  const body = expenses.map(e => [
    e.companyExpenseId,
    getChargeTypeText(e.chargeType),
    e.employee ? `${e.employee.firstName} ${e.employee.lastName}` : '',
    formatCurrency(e.amount, e.devise),
    formatDate(e.paymentDate),
    getStatusText(e.status),
    e.description || '',
    e.service || '',
    e.attachment || ''
  ]);

  autoTable(doc, {
    startY: 32,
    head: [[ 'ID', 'Type Charge', 'Employé', 'Montant', 'Date Paiement', 'Statut', 'Description', 'Service', 'Pièce jointe' ]],
    body,
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    theme: 'grid',
  });

  doc.save(`${title.replace(/\s+/g, '_')}_${date.replace(/\s|:/g, '_')}.pdf`);
}

export function exportCompanyExpensesToExcel(expenses: CompanyExpense[], title = 'Charges_entreprise') {
  const wsData = [
    ['ID', 'Type Charge', 'Employé', 'Montant', 'Devise', 'Date Paiement', 'Statut', 'Description', 'Service', 'Pièce jointe'],
    ...expenses.map((e: CompanyExpense) => [
      e.companyExpenseId,
      getChargeTypeText(e.chargeType),
      e.employee ? `${e.employee.firstName} ${e.employee.lastName}` : '',
      e.amount,
      e.devise,
      formatDate(e.paymentDate),
      getStatusText(e.status),
      e.description || '',
      e.service || '',
      e.attachment || ''
    ])
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  // En-têtes en gras et colonnes auto-ajustées
  const ref = ws['!ref'] as string | undefined;
  if (ref) {
    const range = XLSX.utils.decode_range(ref);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell = ws[XLSX.utils.encode_cell({ r: 0, c: C })];
      if (cell) cell.s = { font: { bold: true } };
    }
  }
  ws['!cols'] = wsData[0].map(() => ({ wch: 20 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, title);
  XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}.xlsx`);
}

export function exportCompanyExpensesToCSV(expenses: CompanyExpense[], title = 'Charges_entreprise') {
  const headers = ['ID', 'Type Charge', 'Employé', 'Montant', 'Devise', 'Date Paiement', 'Statut', 'Description', 'Service', 'Pièce jointe'];
  const rows = expenses.map(e => [
    e.companyExpenseId,
    getChargeTypeText(e.chargeType),
    e.employee ? `${e.employee.firstName} ${e.employee.lastName}` : '',
    e.amount,
    e.devise,
    formatDate(e.paymentDate),
    getStatusText(e.status),
    e.description || '',
    e.service || '',
    e.attachment || ''
  ]);

  // BOM UTF-8 pour compat Excel / accents
  const bom = '\uFEFF';
  const csvContent = [headers, ...rows]
    .map((row: (string|number)[]) => row.map(field => `"${String(field).replace(/"/g, '""')}`.replace(/\n/g, ' ')).join(';'))
    .join('\r\n');

  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `${title.replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportOtherInvoicesToPDF(invoices: OtherInvoice[], title = 'Rapport des autres factures') {
  const doc = new jsPDF();
  const date = new Date().toLocaleString('fr-FR');
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`Date d'export : ${date}`, 14, 26);
  
  const body = invoices.map(i => [
    i.otherInvoiceId,
    i.invoiceNumber,
    getCategoryText(i.category),
    i.supplier,
    i.supplierContact ? `${i.supplierContact.firstName} ${i.supplierContact.lastName}` : '',
    formatCurrency(i.amount, i.devise),
    formatDate(i.invoiceDate),
    i.paymentDate ? formatDate(i.paymentDate) : '',
    getStatusText(i.status),
    i.description || '',
    i.service || '',
    i.attachment || ''
  ]);

  autoTable(doc, {
    startY: 32,
    head: [[ 'ID', 'N° Facture', 'Catégorie', 'Fournisseur', 'Contact Fournisseur', 'Montant', 'Date Facture', 'Date Paiement', 'Statut', 'Description', 'Service', 'Pièce jointe' ]],
    body,
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    theme: 'grid',
  });

  doc.save(`${title.replace(/\s+/g, '_')}_${date.replace(/\s|:/g, '_')}.pdf`);
}

export function exportOtherInvoicesToExcel(invoices: OtherInvoice[], title = 'Autres_factures') {
  const wsData = [
    ['ID', 'N° Facture', 'Catégorie', 'Fournisseur', 'Contact Fournisseur', 'Montant', 'Devise', 'Date Facture', 'Date Paiement', 'Statut', 'Description', 'Service', 'Pièce jointe'],
    ...invoices.map((i: OtherInvoice) => [
      i.otherInvoiceId,
      i.invoiceNumber,
      getCategoryText(i.category),
      i.supplier,
      i.supplierContact ? `${i.supplierContact.firstName} ${i.supplierContact.lastName}` : '',
      i.amount,
      i.devise,
      formatDate(i.invoiceDate),
      i.paymentDate ? formatDate(i.paymentDate) : '',
      getStatusText(i.status),
      i.description || '',
      i.service || '',
      i.attachment || ''
    ])
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  // En-têtes en gras et colonnes auto-ajustées
  const ref = ws['!ref'] as string | undefined;
  if (ref) {
    const range = XLSX.utils.decode_range(ref);
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell = ws[XLSX.utils.encode_cell({ r: 0, c: C })];
      if (cell) cell.s = { font: { bold: true } };
    }
  }
  ws['!cols'] = wsData[0].map(() => ({ wch: 20 }));
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, title);
  XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}.xlsx`);
}

export function exportOtherInvoicesToCSV(invoices: OtherInvoice[], title = 'Autres_factures') {
  const headers = ['ID', 'N° Facture', 'Catégorie', 'Fournisseur', 'Contact Fournisseur', 'Montant', 'Devise', 'Date Facture', 'Date Paiement', 'Statut', 'Description', 'Service', 'Pièce jointe'];
  const rows = invoices.map(i => [
    i.otherInvoiceId,
    i.invoiceNumber,
    getCategoryText(i.category),
    i.supplier,
    i.supplierContact ? `${i.supplierContact.firstName} ${i.supplierContact.lastName}` : '',
    i.amount,
    i.devise,
    formatDate(i.invoiceDate),
    i.paymentDate ? formatDate(i.paymentDate) : '',
    getStatusText(i.status),
    i.description || '',
    i.service || '',
    i.attachment || ''
  ]);

  // BOM UTF-8 pour compat Excel / accents
  const bom = '\uFEFF';
  const csvContent = [headers, ...rows]
    .map((row: (string|number)[]) => row.map(field => `"${String(field).replace(/"/g, '""')}`.replace(/\n/g, ' ')).join(';'))
    .join('\r\n');

  const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `${title.replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Helper functions
function getServiceTypeText(type: string) {
  const types: Record<string, string> = {
    'ACCOUNTING_SOFTWARE_LICENSE_FEE': 'Redevance logiciel',
    'PROFESSIONAL_FEES': 'Honoraires',
    'AIR_TICKET': 'Billet d\'avion',
    'BUILDING_RENTAL': 'Location',
    'INTERNET': 'Internet',
    'BUSINESS_TRIP_ASSIGNMENT': 'Mission',
    'MAINTENANCE_REPAIR_MOVABLE_PROPERTY': 'Entretien',
    'RECEPTIONS_HOSPITALITY': 'Réceptions',
    'OTHER_SERVICE': 'Autre',
  };
  return types[type] || type;
}

function getChargeTypeText(type: string) {
  const types: Record<string, string> = {
    'SALARY': 'Salaire',
    'BONUS': 'Prime',
    'ALLOWANCE': 'Indemnité',
    'INSURANCE': 'Assurance',
    'TAX': 'Taxe',
    'UTILITY': 'Service public',
    'MAINTENANCE': 'Maintenance',
    'OTHER_EXPENSE': 'Autre dépense',
  };
  return types[type] || type;
}

function getCategoryText(category: string) {
  const categories: Record<string, string> = {
    'MATERIAL': 'Matériel',
    'SERVICE': 'Service',
    'EQUIPMENT': 'Équipement',
    'SOFTWARE': 'Logiciel',
    'OTHER': 'Autre',
  };
  return categories[category] || category;
}

function getStatusText(status: string) {
  switch (status) {
    case 'PAID': return 'Payé';
    case 'PENDING': return 'En attente';
    case 'OVERDUE': return 'En retard';
    default: return status;
  }
}

function formatCurrency(amount: number, devise: string) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: devise,
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('fr-FR');
}