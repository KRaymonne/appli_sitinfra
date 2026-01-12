
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export interface Alert {
  alertId: number;
  title: string;
  description?: string | null;
  dueDate: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  type: string;
  userId?: number | null;
  user?: {
    firstName: string;
    lastName: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export function exportAlertsToPDF(alerts: Alert[], title = 'Rapport des alertes') {
  const doc = new jsPDF();
  const date = new Date().toLocaleString('fr-FR');
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`Date d'export : ${date}`, 14, 26);
  autoTable(doc, {
    startY: 32,
    head: [[
      'ID', 'Titre', 'Description', "Date d'échéance", 'Priorité', 'Type', 'Utilisateur', 'Créé le', 'Mis à jour le'
    ]],
    body: alerts.map((a: Alert) => [
      a.alertId,
      a.title,
      a.description || '',
      a.dueDate,
      a.priority,
      a.type,
      a.user ? `${a.user.firstName} ${a.user.lastName}` : 'Non assigné',
      a.createdAt,
      a.updatedAt
    ]),
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    theme: 'grid',
  });
  doc.save(`${title.replace(/\s+/g, '_')}_${date.replace(/\s|:/g, '_')}.pdf`);
}

export function exportAlertsToExcel(alerts: Alert[], title = 'Alertes') {
  // Format date en JJ/MM/AAAA
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('fr-FR');
  };
  const wsData = [
    ['ID', 'Titre', 'Description', "Date d'échéance", 'Priorité', 'Type', 'Utilisateur', 'Créé le', 'Mis à jour le'],
    ...alerts.map((a: Alert) => [
      a.alertId,
      a.title,
      a.description || '',
      formatDate(a.dueDate),
      a.priority,
      a.type,
      a.user ? `${a.user.firstName} ${a.user.lastName}` : 'Non assigné',
      formatDate(a.createdAt),
      formatDate(a.updatedAt)
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

export function exportAlertsToCSV(alerts: Alert[], title = 'Alertes') {
  const headers = ['ID', 'Titre', 'Description', "Date d'échéance", 'Priorité', 'Type', 'Utilisateur', 'Créé le', 'Mis à jour le'];
  const rows = alerts.map((a: Alert) => [
    a.alertId,
    a.title,
    a.description || '',
    a.dueDate,
    a.priority,
    a.type,
    a.user ? `${a.user.firstName} ${a.user.lastName}` : 'Non assigné',
    a.createdAt,
    a.updatedAt
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
