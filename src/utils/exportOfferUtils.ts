import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export interface OffreDevis {
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

export interface OffreDAO {
  daoId: number;
  referenceNumber: string;
  title: string;
  client: string;
  amount: number;
  submissionDeadline: string;
  status: string;
  description?: string;
  attachment?: string;
  devise?: string;
}

export interface OffreAMI {
  amiId: number;
  referenceNumber: string;
  title: string;
  client: string;
  amount: number;
  submissionDeadline: string;
  status: string;
  description?: string;
  attachment?: string;
  devise?: string;
}

export function exportOffreDevisToPDF(devis: OffreDevis[], title = 'Rapport des devis') {
  const doc = new jsPDF();
  const date = new Date().toLocaleString('fr-FR');
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`Date d'export : ${date}`, 14, 26);
  
  const body = devis.map(d => [
    d.devisId,
    d.indexNumber,
    d.clientname,
    formatCurrency(d.amount, d.devise),
    formatDate(d.validityDate),
    getStatusText(d.status),
    d.description || '',
    d.attachment || '',
  ]);

  autoTable(doc, {
    startY: 32,
    head: [[ 'ID', 'Numéro Index', 'Client', 'Montant', 'Date de validité', 'Statut', 'Description', 'Pièce jointe' ]],
    body,
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    theme: 'grid',
  });

  doc.save(`${title.replace(/\s+/g, '_')}_${date.replace(/\s|:/g, '_')}.pdf`);
}

export function exportOffreDevisToExcel(devis: OffreDevis[], title = 'Devis') {
  const wsData = [
    ['ID', 'Numéro Index', 'Client', 'Montant', 'Date de validité', 'Statut', 'Description', 'Pièce jointe'],
    ...devis.map((d: OffreDevis) => [
      d.devisId,
      d.indexNumber,
      d.clientname,
      formatCurrency(d.amount, d.devise),
      formatDate(d.validityDate),
      getStatusText(d.status),
      d.description || '',
      d.attachment || '',
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

export function exportOffreDevisToCSV(devis: OffreDevis[], title = 'Devis') {
  const headers = ['ID', 'Numéro Index', 'Client', 'Montant', 'Date de validité', 'Statut', 'Description', 'Pièce jointe'];
  const rows = devis.map(d => [
    d.devisId,
    d.indexNumber,
    d.clientname,
    formatCurrency(d.amount, d.devise),
    formatDate(d.validityDate),
    getStatusText(d.status),
    d.description || '',
    d.attachment || '',
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

export function exportOffreDAOToPDF(daos: OffreDAO[], title = 'Rapport des DAO') {
  const doc = new jsPDF();
  const date = new Date().toLocaleString('fr-FR');
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`Date d'export : ${date}`, 14, 26);
  
  const body = daos.map(d => [
    d.daoId,
    d.referenceNumber,
    d.title,
    d.client,
    formatCurrency(d.amount, d.devise),
    formatDate(d.submissionDeadline),
    getStatusText(d.status),
    d.description || '',
    d.attachment || '',
  ]);

  autoTable(doc, {
    startY: 32,
    head: [[ 'ID', 'Numéro Référence', 'Titre', 'Client', 'Montant', 'Date limite', 'Statut', 'Description', 'Pièce jointe' ]],
    body,
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    theme: 'grid',
  });

  doc.save(`${title.replace(/\s+/g, '_')}_${date.replace(/\s|:/g, '_')}.pdf`);
}

export function exportOffreDAOToExcel(daos: OffreDAO[], title = 'DAO') {
  const wsData = [
    ['ID', 'Numéro Référence', 'Titre', 'Client', 'Montant', 'Date limite', 'Statut', 'Description', 'Pièce jointe'],
    ...daos.map((d: OffreDAO) => [
      d.daoId,
      d.referenceNumber,
      d.title,
      d.client,
      formatCurrency(d.amount, d.devise),
      formatDate(d.submissionDeadline),
      getStatusText(d.status),
      d.description || '',
      d.attachment || '',
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

export function exportOffreDAOToCSV(daos: OffreDAO[], title = 'DAO') {
  const headers = ['ID', 'Numéro Référence', 'Titre', 'Client', 'Montant', 'Date limite', 'Statut', 'Description', 'Pièce jointe'];
  const rows = daos.map(d => [
    d.daoId,
    d.referenceNumber,
    d.title,
    d.client,
    formatCurrency(d.amount, d.devise),
    formatDate(d.submissionDeadline),
    getStatusText(d.status),
    d.description || '',
    d.attachment || '',
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

export function exportOffreAMIToPDF(amis: OffreAMI[], title = 'Rapport des AMI') {
  const doc = new jsPDF();
  const date = new Date().toLocaleString('fr-FR');
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`Date d'export : ${date}`, 14, 26);
  
  const body = amis.map(a => [
    a.amiId,
    a.referenceNumber,
    a.title,
    a.client,
    formatCurrency(a.amount, a.devise),
    formatDate(a.submissionDeadline),
    getStatusText(a.status),
    a.description || '',
    a.attachment || '',
  ]);

  autoTable(doc, {
    startY: 32,
    head: [[ 'ID', 'Numéro Référence', 'Titre', 'Client', 'Montant', 'Date limite', 'Statut', 'Description', 'Pièce jointe' ]],
    body,
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    theme: 'grid',
  });

  doc.save(`${title.replace(/\s+/g, '_')}_${date.replace(/\s|:/g, '_')}.pdf`);
}

export function exportOffreAMIToExcel(amis: OffreAMI[], title = 'AMI') {
  const wsData = [
    ['ID', 'Numéro Référence', 'Titre', 'Client', 'Montant', 'Date limite', 'Statut', 'Description', 'Pièce jointe'],
    ...amis.map((a: OffreAMI) => [
      a.amiId,
      a.referenceNumber,
      a.title,
      a.client,
      formatCurrency(a.amount, a.devise),
      formatDate(a.submissionDeadline),
      getStatusText(a.status),
      a.description || '',
      a.attachment || '',
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

export function exportOffreAMIToCSV(amis: OffreAMI[], title = 'AMI') {
  const headers = ['ID', 'Numéro Référence', 'Titre', 'Client', 'Montant', 'Date limite', 'Statut', 'Description', 'Pièce jointe'];
  const rows = amis.map(a => [
    a.amiId,
    a.referenceNumber,
    a.title,
    a.client,
    formatCurrency(a.amount, a.devise),
    formatDate(a.submissionDeadline),
    getStatusText(a.status),
    a.description || '',
    a.attachment || '',
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
    case 'APPLICATION': return 'Candidature';
    case 'UNDER_REVIEW': return 'En Étude';
    case 'PENDING': return 'En Attente';
    case 'SHORTLISTED': return 'Retenu';
    case 'BID_SUBMITTED': return 'Soumission';
    case 'NOT_PURSUED': return 'Pas de suite';
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

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR');
}