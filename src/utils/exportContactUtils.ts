import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export interface Contact {
  contactId: number;
  contactGroupe: string;
  companyName: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  secondPhone?: string;
  address?: string;
  country?: string;
  createdAt?: string;
  Inserteridentity?: string;
  InserterCountry?: string;
}

export function exportContactsToPDF(contacts: Contact[], title = 'Rapport des contacts') {
  const doc = new jsPDF();
  const date = new Date().toLocaleString('fr-FR');
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`Date d'export : ${date}`, 14, 26);
  autoTable(doc, {
    startY: 32,
    head: [[
      'ID', 'Nom Complet', 'Groupe', 'Entreprise', 'Email', 'Téléphone', 'Deuxième Téléphone', 'Adresse', 'Pays', 'Créé le'
    ]],
    body: contacts.map((c: Contact) => [
      c.contactId,
      `${c.firstName} ${c.lastName}`,
      c.contactGroupe,
      c.companyName,
      c.email || '',
      c.phone || '',
      c.secondPhone || '',
      c.address || '',
      c.country || '',
      c.createdAt ? new Date(c.createdAt).toLocaleDateString('fr-FR') : ''
    ]),
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    theme: 'grid',
  });
  doc.save(`${title.replace(/\s+/g, '_')}_${date.replace(/\s|:/g, '_')}.pdf`);
}

export function exportContactsToExcel(contacts: Contact[], title = 'Contacts') {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR');
  };
  const wsData = [
    ['ID', 'Nom Complet', 'Groupe', 'Entreprise', 'Email', 'Téléphone', 'Deuxième Téléphone', 'Adresse', 'Pays', 'Créé le'],
    ...contacts.map((c: Contact) => [
      c.contactId,
      `${c.firstName} ${c.lastName}`,
      c.contactGroupe,
      c.companyName,
      c.email || '',
      c.phone || '',
      c.secondPhone || '',
      c.address || '',
      c.country || '',
      formatDate(c.createdAt)
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

export function exportContactsToCSV(contacts: Contact[], title = 'Contacts') {
  const headers = ['ID', 'Nom Complet', 'Groupe', 'Entreprise', 'Email', 'Téléphone', 'Deuxième Téléphone', 'Adresse', 'Pays', 'Créé le'];
  const rows = contacts.map((c: Contact) => [
    c.contactId,
    `${c.firstName} ${c.lastName}`,
    c.contactGroupe,
    c.companyName,
    c.email || '',
    c.phone || '',
    c.secondPhone || '',
    c.address || '',
    c.country || '',
    c.createdAt ? new Date(c.createdAt).toLocaleDateString('fr-FR') : ''
  ]);
  const csvContent = [headers, ...rows]
    .map((row: (string | number)[]) => row.map((field: string | number) => `"${String(field).replace(/"/g, '""')}`.replace(/\n/g, ' ')).join(';'))
    .join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `${title.replace(/\s+/g, '_')}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}