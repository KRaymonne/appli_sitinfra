import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export interface Business {
  businessId: number;
  name: string;
  status: string;
  client: string;
  contact?: number;
  startDate: string;
  endDate?: string;
  estimatedCost: number;
  salePrice: number;
  comment?: string;
  progress: number;
  attachment?: string;
  devise?: string;
  createdAt?: string;
  updatedAt?: string;
  Inserteridentity?: string;
  InserterCountry?: string;
}

export function exportBusinessesToPDF(businesses: Business[], title = 'Rapport des affaires') {
  const doc = new jsPDF();
  const date = new Date().toLocaleString('fr-FR');
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`Date d'export : ${date}`, 14, 26);
  
  const body = businesses.map(b => [
    b.businessId,
    b.name,
    getStatusText(b.status),
    b.client,
    b.contact || '',
    formatDate(b.startDate),
    b.endDate ? formatDate(b.endDate) : '',
    formatCurrency(b.estimatedCost, b.devise),
    formatCurrency(b.salePrice, b.devise),
    b.progress,
    b.comment || '',
    b.attachment || '',
    b.Inserteridentity || '',
    b.InserterCountry || '',
    b.createdAt ? formatDate(b.createdAt) : '',
    b.updatedAt ? formatDate(b.updatedAt) : ''
  ]);

  autoTable(doc, {
    startY: 32,
    head: [[ 'ID', 'Nom', 'Statut', 'Client', 'Contact', 'Date début', 'Date fin', 'Coût estimé', 'Prix vente', 'Progression (%)', 'Commentaire', 'Pièce jointe', 'Inserter ID', 'Inserter Pays', 'Créé le', 'Mis à jour le' ]],
    body,
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    theme: 'grid',
  });

  doc.save(`${title.replace(/\s+/g, '_')}_${date.replace(/\s|:/g, '_')}.pdf`);
}

export function exportBusinessesToExcel(businesses: Business[], title = 'Affaires') {
  const wsData = [
    ['ID', 'Nom', 'Statut', 'Client', 'Contact', 'Date début', 'Date fin', 'Coût estimé', 'Prix vente', 'Progression (%)', 'Commentaire', 'Pièce jointe', 'Inserter ID', 'Inserter Pays', 'Créé le', 'Mis à jour le'],
    ...businesses.map((b: Business) => [
      b.businessId,
      b.name,
      getStatusText(b.status),
      b.client,
      b.contact || '',
      formatDate(b.startDate),
      b.endDate ? formatDate(b.endDate) : '',
      formatCurrency(b.estimatedCost, b.devise),
      formatCurrency(b.salePrice, b.devise),
      b.progress,
      b.comment || '',
      b.attachment || '',
      b.Inserteridentity || '',
      b.InserterCountry || '',
      b.createdAt ? formatDate(b.createdAt) : '',
      b.updatedAt ? formatDate(b.updatedAt) : ''
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

export function exportBusinessesToCSV(businesses: Business[], title = 'Affaires') {
  const headers = ['ID', 'Nom', 'Statut', 'Client', 'Contact', 'Date début', 'Date fin', 'Coût estimé', 'Prix vente', 'Progression (%)', 'Commentaire', 'Pièce jointe', 'Inserter ID', 'Inserter Pays', 'Créé le', 'Mis à jour le'];
  const rows = businesses.map(b => [
    b.businessId,
    b.name,
    getStatusText(b.status),
    b.client,
    b.contact || '',
    formatDate(b.startDate),
    b.endDate ? formatDate(b.endDate) : '',
    formatCurrency(b.estimatedCost, b.devise),
    formatCurrency(b.salePrice, b.devise),
    b.progress,
    b.comment || '',
    b.attachment || '',
    b.Inserteridentity || '',
    b.InserterCountry || '',
    b.createdAt ? formatDate(b.createdAt) : '',
    b.updatedAt ? formatDate(b.updatedAt) : ''
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
function getStatusText(status: string) {
  switch (status) {
    case 'PROSPECT': return 'Prospect';
    case 'NEGOTIATION': return 'Négociation';
    case 'WON': return 'Gagnée';
    case 'LOST': return 'Perdue';
    default: return status;
  }
}

function formatCurrency(amount: number, devise: string = 'XAF') {
  // Map DEVISE enum to currency codes
  const deviseToCurrency: Record<string, string> = {
    'XAF': 'XAF',
    'XOF': 'XOF',
    'EUR': 'EUR',
    'GNF': 'GNF',
    'GHS': 'GHS',
    'RON': 'RON',
    'SLE': 'SLE',
    'USD': 'USD'
  };
  
  const currencyCode = deviseToCurrency[devise] || 'XAF';
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString?: string) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('fr-FR');
}