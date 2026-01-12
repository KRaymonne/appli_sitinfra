import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export interface TaxDeclaration {
  id: number;
  taxType: 'VAT' | 'INCOME_TAX' | 'CORPORATE_TAX' | 'SOCIAL_CONTRIBUTIONS' | 'OTHER_TAX';
  taxAmount: number;
  penalties: number;
  declarationDate: string;
  paymentDate?: string | null;
  status: 'TO_PAY' | 'PAID' | 'OVERDUE';
  referenceNumber: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  devise?: string;
}

export function exportTaxesToPDF(taxes: TaxDeclaration[], title = 'Rapport des déclarations fiscales') {
  const doc = new jsPDF();
  const date = new Date().toLocaleString('fr-FR');
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`Date d'export : ${date}`, 14, 26);
  
  const body = taxes.map(t => [
    t.id,
    t.referenceNumber,
    getTaxTypeLabel(t.taxType),
    formatCurrency(t.taxAmount, t.devise),
    formatCurrency(t.penalties, t.devise),
    formatDate(t.declarationDate),
    formatDate(t.paymentDate),
    getStatusLabel(t.status),
    t.notes || '',
    formatDate(t.createdAt),
    formatDate(t.updatedAt)
  ]);

  autoTable(doc, {
    startY: 32,
    head: [[ 'ID', 'Référence', 'Type', 'Montant', 'Pénalités', 'Date déclaration', 'Date paiement', 'Statut', 'Notes', 'Créé le', 'Mis à jour le' ]],
    body,
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    theme: 'grid',
  });

  doc.save(`${title.replace(/\s+/g, '_')}_${date.replace(/\s|:/g, '_')}.pdf`);
}

export function exportTaxesToExcel(taxes: TaxDeclaration[], title = 'Déclarations fiscales') {
  const wsData = [
    ['ID', 'Référence', 'Type', 'Montant', 'Pénalités', 'Date déclaration', 'Date paiement', 'Statut', 'Notes', 'Créé le', 'Mis à jour le'],
    ...taxes.map((t: TaxDeclaration) => [
      t.id,
      t.referenceNumber,
      getTaxTypeLabel(t.taxType),
      formatCurrency(t.taxAmount, t.devise),
      formatCurrency(t.penalties, t.devise),
      formatDate(t.declarationDate),
      formatDate(t.paymentDate),
      getStatusLabel(t.status),
      t.notes || '',
      formatDate(t.createdAt),
      formatDate(t.updatedAt)
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

export function exportTaxesToCSV(taxes: TaxDeclaration[], title = 'Déclarations_fiscales') {
  const headers = ['ID', 'Référence', 'Type', 'Montant', 'Pénalités', 'Date déclaration', 'Date paiement', 'Statut', 'Notes', 'Créé le', 'Mis à jour le'];
  const rows = taxes.map(t => [
    t.id,
    t.referenceNumber,
    getTaxTypeLabel(t.taxType),
    formatCurrency(t.taxAmount, t.devise),
    formatCurrency(t.penalties, t.devise),
    formatDate(t.declarationDate),
    formatDate(t.paymentDate),
    getStatusLabel(t.status),
    t.notes || '',
    formatDate(t.createdAt),
    formatDate(t.updatedAt)
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
function getTaxTypeLabel(type: string) {
  switch (type) {
    case 'VAT': return 'TVA';
    case 'INCOME_TAX': return 'Impôt sur le revenu';
    case 'CORPORATE_TAX': return 'Impôt sur les sociétés';
    case 'SOCIAL_CONTRIBUTIONS': return 'Cotisations sociales';
    case 'OTHER_TAX': return 'Autre taxe';
    default: return type;
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'PAID': return 'Payé';
    case 'TO_PAY': return 'À payer';
    case 'OVERDUE': return 'En retard';
    default: return status;
  }
}

function formatCurrency(amount: number, devise: string = 'XAF') {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: devise,
    minimumFractionDigits: 0
  }).format(amount);
}

function formatDate(dateString?: string | null) {
  if (!dateString) return '-';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return '-';
    }
    
    // Return date in DD/MM/YYYY format
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return '-';
  }
}