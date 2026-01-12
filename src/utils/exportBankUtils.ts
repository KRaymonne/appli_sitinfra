import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export interface Bank {
  bankId: number;
  name: string;
  type: string;
  balance: number;
  devise: string;
  attachment?: string;
  createdAt: string;
  updatedAt: string;
}

export function exportBanksToExcel(banks: Bank[], title = 'Comptes bancaires') {
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR');
  };
  const wsData = [
    ['ID', 'Nom', 'Type', 'Solde', 'Devise', 'Pièce jointe', 'Créé le', 'Mis à jour le'],
    ...banks.map((b: Bank) => [
      b.bankId,
      b.name,
      b.type,
      b.balance,
      b.devise,
      b.attachment || '',
      formatDate(b.createdAt),
      formatDate(b.updatedAt)
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

export function exportBanksToPDF(banks: Bank[], title = 'Rapport des comptes bancaires') {
  const doc = new jsPDF();
  const date = new Date().toLocaleString('fr-FR');
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`Date d'export : ${date}`, 14, 26);

  const body = banks.map(b => [
    b.bankId,
    b.name,
    b.type,
    b.balance,
    b.devise,
    b.attachment || '',
    new Date(b.createdAt).toLocaleDateString('fr-FR'),
    new Date(b.updatedAt).toLocaleDateString('fr-FR')
  ]);

  autoTable(doc, {
    startY: 32,
    head: [[ 'ID', 'Nom', 'Type', 'Solde', 'Devise', 'Pièce jointe', 'Créé le', 'Mis à jour le' ]],
    body,
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    theme: 'grid',
  });

  doc.save(`${title.replace(/\s+/g, '_')}_${date.replace(/\s|:/g, '_')}.pdf`);
}

export function exportBanksToCSV(banks: Bank[], title = 'Comptes_bancaires') {
  const headers = ['ID', 'Nom', 'Type', 'Solde', 'Devise', 'Pièce jointe', 'Créé le', 'Mis à jour le'];
  const rows = banks.map(b => [
    b.bankId,
    b.name,
    b.type,
    b.balance,
    b.devise,
    b.attachment || '',
    new Date(b.createdAt).toLocaleDateString('fr-FR'),
    new Date(b.updatedAt).toLocaleDateString('fr-FR')
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
