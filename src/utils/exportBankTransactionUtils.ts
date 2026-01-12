import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export interface BankTransaction {
  transactionId: number;
  bankId: number;
  date: string;
  description?: string;
  amount: number;
  accountType: string;
  accountNumber: string;
  attachment?: string;
  devise: string;
  name?: string;
  createdAt: string;
  updatedAt: string;
}

export function exportBankTransactionsToExcel(transactions: BankTransaction[], title = 'Transactions bancaires') {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR');
  };
  const wsData = [
    ['ID', 'Nom', 'Type de compte', 'Numéro de compte', 'Montant', 'Devise', 'Description', 'Pièce jointe', 'Date', 'Créé le', 'Mis à jour le'],
    ...transactions.map((t: BankTransaction) => [
      t.transactionId,
      t.name || '',
      t.accountType,
      t.accountNumber,
      t.amount,
      t.devise,
      t.description || '',
      t.attachment || '',
      formatDate(t.date),
      formatDate(t.createdAt),
      formatDate(t.updatedAt)
    ])
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
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

export function exportBankTransactionsToPDF(transactions: BankTransaction[], title = 'Rapport des transactions bancaires') {
  const doc = new jsPDF();
  const date = new Date().toLocaleString('fr-FR');
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`Date d'export : ${date}`, 14, 26);

  const body = transactions.map(t => [
    t.transactionId,
    t.name || '',
    t.accountType,
    t.accountNumber,
    t.amount,
    t.devise,
    t.description || '',
    t.attachment || '',
    new Date(t.date).toLocaleDateString('fr-FR'),
    new Date(t.createdAt).toLocaleDateString('fr-FR'),
    new Date(t.updatedAt).toLocaleDateString('fr-FR')
  ]);

  autoTable(doc, {
    startY: 32,
    head: [[ 'ID', 'Nom', 'Type de compte', 'Numéro de compte', 'Montant', 'Devise', 'Description', 'Pièce jointe', 'Date', 'Créé le', 'Mis à jour le' ]],
    body,
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    theme: 'grid',
  });

  doc.save(`${title.replace(/\s+/g, '_')}_${date.replace(/\s|:/g, '_')}.pdf`);
}

export function exportBankTransactionsToCSV(transactions: BankTransaction[], title = 'Transactions_bancaires') {
  const headers = ['ID', 'Nom', 'Type de compte', 'Numéro de compte', 'Montant', 'Devise', 'Description', 'Pièce jointe', 'Date', 'Créé le', 'Mis à jour le'];
  const rows = transactions.map(t => [
    t.transactionId,
    t.name || '',
    t.accountType,
    t.accountNumber,
    t.amount,
    t.devise,
    t.description || '',
    t.attachment || '',
    new Date(t.date).toLocaleDateString('fr-FR'),
    new Date(t.createdAt).toLocaleDateString('fr-FR'),
    new Date(t.updatedAt).toLocaleDateString('fr-FR')
  ]);

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
