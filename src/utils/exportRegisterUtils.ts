import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export interface Register {
  registerId: number;
  registerName: string;
  location: string;
  responsiblename: string;
  userId?: number;
  currentBalance: number;
  attachmentfile?: string;
  createdAt: string;
  updatedAt: string;
  devise?: string;
  Inserteridentity?: string;
  InserterCountry?: string;
}

export function exportRegistersToPDF(registers: Register[], title = 'Rapport des caisses') {
  const doc = new jsPDF();
  const date = new Date().toLocaleString('fr-FR');
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`Date d'export : ${date}`, 14, 26);
  
  const body = registers.map(r => [
    r.registerId,
    r.registerName,
    r.location,
    r.responsiblename,
    r.userId || '',
    formatCurrency(r.currentBalance, r.devise),
    r.attachmentfile || '',
    r.Inserteridentity || '',
    r.InserterCountry || '',
    formatDate(r.createdAt),
    formatDate(r.updatedAt)
  ]);

  autoTable(doc, {
    startY: 32,
    head: [[ 'ID', 'Nom', 'Emplacement', 'Responsable', 'ID Utilisateur', 'Solde actuel', 'Pièce jointe', 'Inserter ID', 'Inserter Pays', 'Créé le', 'Mis à jour le' ]],
    body,
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    theme: 'grid',
  });

  doc.save(`${title.replace(/\s+/g, '_')}_${date.replace(/\s|:/g, '_')}.pdf`);
}

export function exportRegistersToExcel(registers: Register[], title = 'Caisses') {
  const wsData = [
    ['ID', 'Nom', 'Emplacement', 'Responsable', 'ID Utilisateur', 'Solde actuel', 'Pièce jointe', 'Inserter ID', 'Inserter Pays', 'Créé le', 'Mis à jour le'],
    ...registers.map((r: Register) => [
      r.registerId,
      r.registerName,
      r.location,
      r.responsiblename,
      r.userId || '',
      formatCurrency(r.currentBalance, r.devise),
      r.attachmentfile || '',
      r.Inserteridentity || '',
      r.InserterCountry || '',
      formatDate(r.createdAt),
      formatDate(r.updatedAt)
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

export function exportRegistersToCSV(registers: Register[], title = 'Caisses') {
  const headers = ['ID', 'Nom', 'Emplacement', 'Responsable', 'ID Utilisateur', 'Solde actuel', 'Pièce jointe', 'Inserter ID', 'Inserter Pays', 'Créé le', 'Mis à jour le'];
  const rows = registers.map(r => [
    r.registerId,
    r.registerName,
    r.location,
    r.responsiblename,
    r.userId || '',
    formatCurrency(r.currentBalance, r.devise),
    r.attachmentfile || '',
    r.Inserteridentity || '',
    r.InserterCountry || '',
    formatDate(r.createdAt),
    formatDate(r.updatedAt)
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
function formatCurrency(amount: number, devise: string = 'XAF') {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + ' ' + devise;
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('fr-FR');
}

// Transaction interface and export functions
export interface Transaction {
  transactionId: number;
  registerId: number;
  transactionType: string;
  amount: number;
  description?: string;
  expenseType?: string;
  referenceNumber?: string;
  receiptNumber?: string;
  transactionDate: string;
  serviceProvider?: string;
  supplyType?: string;
  attachment?: string;
  devise: string;
  createdAt: string;
  updatedAt: string;
  Inserteridentity?: string;
  InserterCountry?: string;
  register?: {
    registerName: string;
  };
}

export function exportTransactionsToPDF(transactions: Transaction[], title = 'Rapport des transactions') {
  const doc = new jsPDF();
  const date = new Date().toLocaleString('fr-FR');
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`Date d'export : ${date}`, 14, 26);
  
  const body = transactions.map(t => [
    t.transactionId,
    t.register?.registerName || '',
    getTransactionTypeText(t.transactionType),
    t.expenseType ? getExpenseTypeText(t.expenseType) : '',
    formatCurrency(t.amount, t.devise),
    t.description || '',
    t.referenceNumber || '',
    t.receiptNumber || '',
    formatDate(t.transactionDate),
    t.serviceProvider || '',
    t.supplyType || '',
    t.attachment || '',
    t.Inserteridentity || '',
    t.InserterCountry || '',
    formatDate(t.createdAt),
    formatDate(t.updatedAt)
  ]);

  autoTable(doc, {
    startY: 32,
    head: [[ 'ID', 'Caisse', 'Type', 'Catégorie', 'Montant', 'Description', 'Référence', 'Reçu', 'Date', 'Fournisseur', 'Approvisionnement', 'Pièce jointe', 'Inserter ID', 'Inserter Pays', 'Créé le', 'Mis à jour le' ]],
    body,
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    theme: 'grid',
  });

  doc.save(`${title.replace(/\s+/g, '_')}_${date.replace(/\s|:/g, '_')}.pdf`);
}

export function exportTransactionsToExcel(transactions: Transaction[], title = 'Transactions') {
  const wsData = [
    ['ID', 'Caisse', 'Type', 'Catégorie', 'Montant', 'Devise', 'Description', 'Référence', 'Reçu', 'Date', 'Fournisseur', 'Approvisionnement', 'Pièce jointe', 'Inserter ID', 'Inserter Pays', 'Créé le', 'Mis à jour le'],
    ...transactions.map((t: Transaction) => [
      t.transactionId,
      t.register?.registerName || '',
      getTransactionTypeText(t.transactionType),
      t.expenseType ? getExpenseTypeText(t.expenseType) : '',
      t.amount,
      t.devise,
      t.description || '',
      t.referenceNumber || '',
      t.receiptNumber || '',
      formatDate(t.transactionDate),
      t.serviceProvider || '',
      t.supplyType || '',
      t.attachment || '',
      t.Inserteridentity || '',
      t.InserterCountry || '',
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

export function exportTransactionsToCSV(transactions: Transaction[], title = 'Transactions') {
  const headers = ['ID', 'Caisse', 'Type', 'Catégorie', 'Montant', 'Devise', 'Description', 'Référence', 'Reçu', 'Date', 'Fournisseur', 'Approvisionnement', 'Pièce jointe', 'Inserter ID', 'Inserter Pays', 'Créé le', 'Mis à jour le'];
  const rows = transactions.map(t => [
    t.transactionId,
    t.register?.registerName || '',
    getTransactionTypeText(t.transactionType),
    t.expenseType ? getExpenseTypeText(t.expenseType) : '',
    t.amount,
    t.devise,
    t.description || '',
    t.referenceNumber || '',
    t.receiptNumber || '',
    formatDate(t.transactionDate),
    t.serviceProvider || '',
    t.supplyType || '',
    t.attachment || '',
    t.Inserteridentity || '',
    t.InserterCountry || '',
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

// Helper functions for transactions
function getTransactionTypeText(type: string) {
  switch (type) {
    case 'INCOME': return 'Revenu';
    case 'EXPENSE': return 'Dépense';
    case 'TRANSFER_OUT': return 'Transfert sortant';
    case 'TRANSFER_IN': return 'Transfert entrant';
    default: return type;
  }
}

function getExpenseTypeText(type: string) {
  switch (type) {
    case 'MTN_PHONE': return 'MTN Téléphone';
    case 'CUSTOMS': return 'Douanes';
    case 'TRANSPORT': return 'Transport';
    case 'TENDER_DOCUMENTS': return "Documents d'appel d'offres";
    case 'ADVERTISING': return 'Publicité';
    case 'INSURANCE': return 'Assurance';
    case 'MISCELLANEOUS': return 'Divers';
    default: return type;
  }
}
