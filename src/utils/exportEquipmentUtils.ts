import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Equipment interface and export functions
export interface Equipment {
  equipmentId: number;
  name: string;
  category: string;
  type: string;
  brand: string;
  model?: string;
  serialNumber: string;
  referenceCode: string;
  supplier: string;
  purchaseAmount: number;
  status: string;
  location: string;
  ownership: string;
  purchaseDate?: string;
  warrantyEndDate?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
  devise?: string;
}

export function exportEquipmentToPDF(equipments: Equipment[], title = 'Rapport des équipements') {
  const doc = new jsPDF();
  const date = new Date().toLocaleString('fr-FR');
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`Date d'export : ${date}`, 14, 26);
  
  const body = equipments.map(e => [
    e.equipmentId,
    e.name,
    getCategoryText(e.category),
    getTypeText(e.type),
    getBrandText(e.brand),
    e.model || '',
    e.serialNumber,
    e.referenceCode,
    e.supplier,
    formatCurrency(e.purchaseAmount, e.devise),
    getStatusText(e.status),
    e.location,
    getOwnershipText(e.ownership),
    formatDate(e.purchaseDate),
    formatDate(e.warrantyEndDate),
    e.notes || '',
    formatDate(e.createdAt),
    formatDate(e.updatedAt)
  ]);

  autoTable(doc, {
    startY: 32,
    head: [[ 'ID', 'Nom', 'Catégorie', 'Type', 'Marque', 'Modèle', 'N° Série', 'Code Réf.', 'Fournisseur', 'Prix Achat', 'Statut', 'Emplacement', 'Propriété', 'Date Achat', 'Fin Garantie', 'Notes', 'Créé le', 'Mis à jour le' ]],
    body,
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    theme: 'grid',
  });

  doc.save(`${title.replace(/\s+/g, '_')}_${date.replace(/\s|:/g, '_')}.pdf`);
}

export function exportEquipmentToExcel(equipments: Equipment[], title = 'Équipements') {
  const wsData = [
    ['ID', 'Nom', 'Catégorie', 'Type', 'Marque', 'Modèle', 'N° Série', 'Code Réf.', 'Fournisseur', 'Prix Achat', 'Devise', 'Statut', 'Emplacement', 'Propriété', 'Date Achat', 'Fin Garantie', 'Notes', 'Créé le', 'Mis à jour le'],
    ...equipments.map((e: Equipment) => [
      e.equipmentId,
      e.name,
      getCategoryText(e.category),
      getTypeText(e.type),
      getBrandText(e.brand),
      e.model || '',
      e.serialNumber,
      e.referenceCode,
      e.supplier,
      e.purchaseAmount,
      e.devise || '',
      getStatusText(e.status),
      e.location,
      getOwnershipText(e.ownership),
      formatDate(e.purchaseDate),
      formatDate(e.warrantyEndDate),
      e.notes || '',
      formatDate(e.createdAt),
      formatDate(e.updatedAt)
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

export function exportEquipmentToCSV(equipments: Equipment[], title = 'Équipements') {
  const headers = ['ID', 'Nom', 'Catégorie', 'Type', 'Marque', 'Modèle', 'N° Série', 'Code Réf.', 'Fournisseur', 'Prix Achat', 'Devise', 'Statut', 'Emplacement', 'Propriété', 'Date Achat', 'Fin Garantie', 'Notes', 'Créé le', 'Mis à jour le'];
  const rows = equipments.map(e => [
    e.equipmentId,
    e.name,
    getCategoryText(e.category),
    getTypeText(e.type),
    getBrandText(e.brand),
    e.model || '',
    e.serialNumber,
    e.referenceCode,
    e.supplier,
    e.purchaseAmount,
    e.devise || '',
    getStatusText(e.status),
    e.location,
    getOwnershipText(e.ownership),
    formatDate(e.purchaseDate),
    formatDate(e.warrantyEndDate),
    e.notes || '',
    formatDate(e.createdAt),
    formatDate(e.updatedAt)
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

// Maintenance interface and export functions
export interface Maintenance {
  maintenanceId: number;
  equipmentId: number;
  maintenanceDate: string;
  maintenanceType: string;
  description?: string;
  amount: number;
  supplier: string;
  technician?: string;
  downtimeHours?: number;
  nextMaintenanceDate?: string;
  devise: string;
  equipment?: any;
  createdAt?: string;
  updatedAt?: string;
}

export function exportMaintenanceToPDF(maintenances: Maintenance[], title = 'Rapport des maintenances') {
  const doc = new jsPDF();
  const date = new Date().toLocaleString('fr-FR');
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`Date d'export : ${date}`, 14, 26);
  
  const body = maintenances.map(m => [
    m.maintenanceId,
    m.equipment?.name || '',
    m.equipment?.referenceCode || '',
    formatDate(m.maintenanceDate),
    getTypeText(m.maintenanceType),
    m.description || '',
    formatCurrency(m.amount, m.devise),
    m.supplier,
    m.technician || '',
    m.downtimeHours || '',
    formatDate(m.nextMaintenanceDate),
    formatDate(m.createdAt),
    formatDate(m.updatedAt)
  ]);

  autoTable(doc, {
    startY: 32,
    head: [[ 'ID', 'Équipement', 'Code Réf.', 'Date Maintenance', 'Type', 'Description', 'Montant', 'Fournisseur', 'Technicien', 'Heures Arrêt', 'Prochaine Maintenance', 'Créé le', 'Mis à jour le' ]],
    body,
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    theme: 'grid',
  });

  doc.save(`${title.replace(/\s+/g, '_')}_${date.replace(/\s|:/g, '_')}.pdf`);
}

export function exportMaintenanceToExcel(maintenances: Maintenance[], title = 'Maintenances') {
  const wsData = [
    ['ID', 'Équipement', 'Code Réf.', 'Date Maintenance', 'Type', 'Description', 'Montant', 'Devise', 'Fournisseur', 'Technicien', 'Heures Arrêt', 'Prochaine Maintenance', 'Créé le', 'Mis à jour le'],
    ...maintenances.map((m: Maintenance) => [
      m.maintenanceId,
      m.equipment?.name || '',
      m.equipment?.referenceCode || '',
      formatDate(m.maintenanceDate),
      getTypeText(m.maintenanceType),
      m.description || '',
      m.amount,
      m.devise,
      m.supplier,
      m.technician || '',
      m.downtimeHours || '',
      formatDate(m.nextMaintenanceDate),
      formatDate(m.createdAt),
      formatDate(m.updatedAt)
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

export function exportMaintenanceToCSV(maintenances: Maintenance[], title = 'Maintenances') {
  const headers = ['ID', 'Équipement', 'Code Réf.', 'Date Maintenance', 'Type', 'Description', 'Montant', 'Devise', 'Fournisseur', 'Technicien', 'Heures Arrêt', 'Prochaine Maintenance', 'Créé le', 'Mis à jour le'];
  const rows = maintenances.map(m => [
    m.maintenanceId,
    m.equipment?.name || '',
    m.equipment?.referenceCode || '',
    formatDate(m.maintenanceDate),
    getTypeText(m.maintenanceType),
    m.description || '',
    m.amount,
    m.devise,
    m.supplier,
    m.technician || '',
    m.downtimeHours || '',
    formatDate(m.nextMaintenanceDate),
    formatDate(m.createdAt),
    formatDate(m.updatedAt)
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

// Repair interface and export functions
export interface Repair {
  repairId: number;
  equipmentId: number;
  repairDate: string;
  repairType: string;
  description?: string;
  amount: number;
  supplier: string;
  technician?: string;
  partsReplaced?: string;
  warrantyPeriod?: number;
  devise: string;
  equipment?: any;
  createdAt?: string;
  updatedAt?: string;
}

export function exportRepairsToPDF(repairs: Repair[], title = 'Rapport des réparations') {
  const doc = new jsPDF();
  const date = new Date().toLocaleString('fr-FR');
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`Date d'export : ${date}`, 14, 26);
  
  const body = repairs.map(r => [
    r.repairId,
    r.equipment?.name || '',
    r.equipment?.referenceCode || '',
    formatDate(r.repairDate),
    getTypeText(r.repairType),
    r.description || '',
    formatCurrency(r.amount, r.devise),
    r.supplier,
    r.technician || '',
    r.partsReplaced || '',
    r.warrantyPeriod || '',
    formatDate(r.createdAt),
    formatDate(r.updatedAt)
  ]);

  autoTable(doc, {
    startY: 32,
    head: [[ 'ID', 'Équipement', 'Code Réf.', 'Date Réparation', 'Type', 'Description', 'Montant', 'Fournisseur', 'Technicien', 'Pièces Remplacées', 'Garantie (jours)', 'Créé le', 'Mis à jour le' ]],
    body,
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    theme: 'grid',
  });

  doc.save(`${title.replace(/\s+/g, '_')}_${date.replace(/\s|:/g, '_')}.pdf`);
}

export function exportRepairsToExcel(repairs: Repair[], title = 'Réparations') {
  const wsData = [
    ['ID', 'Équipement', 'Code Réf.', 'Date Réparation', 'Type', 'Description', 'Montant', 'Devise', 'Fournisseur', 'Technicien', 'Pièces Remplacées', 'Garantie (jours)', 'Créé le', 'Mis à jour le'],
    ...repairs.map((r: Repair) => [
      r.repairId,
      r.equipment?.name || '',
      r.equipment?.referenceCode || '',
      formatDate(r.repairDate),
      getTypeText(r.repairType),
      r.description || '',
      r.amount,
      r.devise,
      r.supplier,
      r.technician || '',
      r.partsReplaced || '',
      r.warrantyPeriod || '',
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

export function exportRepairsToCSV(repairs: Repair[], title = 'Réparations') {
  const headers = ['ID', 'Équipement', 'Code Réf.', 'Date Réparation', 'Type', 'Description', 'Montant', 'Devise', 'Fournisseur', 'Technicien', 'Pièces Remplacées', 'Garantie (jours)', 'Créé le', 'Mis à jour le'];
  const rows = repairs.map(r => [
    r.repairId,
    r.equipment?.name || '',
    r.equipment?.referenceCode || '',
    formatDate(r.repairDate),
    getTypeText(r.repairType),
    r.description || '',
    r.amount,
    r.devise,
    r.supplier,
    r.technician || '',
    r.partsReplaced || '',
    r.warrantyPeriod || '',
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

// EquipmentExpense interface and export functions
export interface EquipmentExpense {
  expenseId: number;
  equipmentId: number;
  expenseDate: string;
  expenseType: string;
  description?: string;
  amount: number;
  supplier?: string;
  invoiceNumber?: string;
  devise: string;
  equipment?: any;
  createdAt?: string;
  updatedAt?: string;
}

export function exportEquipmentExpensesToPDF(expenses: EquipmentExpense[], title = 'Rapport des dépenses équipements') {
  const doc = new jsPDF();
  const date = new Date().toLocaleString('fr-FR');
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`Date d'export : ${date}`, 14, 26);
  
  const body = expenses.map(e => [
    e.expenseId,
    e.equipment?.name || '',
    e.equipment?.referenceCode || '',
    formatDate(e.expenseDate),
    getTypeText(e.expenseType),
    e.description || '',
    formatCurrency(e.amount, e.devise),
    e.supplier || '',
    e.invoiceNumber || '',
    formatDate(e.createdAt),
    formatDate(e.updatedAt)
  ]);

  autoTable(doc, {
    startY: 32,
    head: [[ 'ID', 'Équipement', 'Code Réf.', 'Date Dépense', 'Type', 'Description', 'Montant', 'Fournisseur', 'N° Facture', 'Créé le', 'Mis à jour le' ]],
    body,
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    theme: 'grid',
  });

  doc.save(`${title.replace(/\s+/g, '_')}_${date.replace(/\s|:/g, '_')}.pdf`);
}

export function exportEquipmentExpensesToExcel(expenses: EquipmentExpense[], title = 'Dépenses_équipements') {
  const wsData = [
    ['ID', 'Équipement', 'Code Réf.', 'Date Dépense', 'Type', 'Description', 'Montant', 'Devise', 'Fournisseur', 'N° Facture', 'Créé le', 'Mis à jour le'],
    ...expenses.map((e: EquipmentExpense) => [
      e.expenseId,
      e.equipment?.name || '',
      e.equipment?.referenceCode || '',
      formatDate(e.expenseDate),
      getTypeText(e.expenseType),
      e.description || '',
      e.amount,
      e.devise,
      e.supplier || '',
      e.invoiceNumber || '',
      formatDate(e.createdAt),
      formatDate(e.updatedAt)
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

export function exportEquipmentExpensesToCSV(expenses: EquipmentExpense[], title = 'Dépenses_équipements') {
  const headers = ['ID', 'Équipement', 'Code Réf.', 'Date Dépense', 'Type', 'Description', 'Montant', 'Devise', 'Fournisseur', 'N° Facture', 'Créé le', 'Mis à jour le'];
  const rows = expenses.map(e => [
    e.expenseId,
    e.equipment?.name || '',
    e.equipment?.referenceCode || '',
    formatDate(e.expenseDate),
    getTypeText(e.expenseType),
    e.description || '',
    e.amount,
    e.devise,
    e.supplier || '',
    e.invoiceNumber || '',
    formatDate(e.createdAt),
    formatDate(e.updatedAt)
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

// EquipmentRevision interface and export functions
export interface EquipmentRevision {
  revisionId: number;
  equipmentId: number;
  revisionDate: string;
  validityDate?: string;
  amount: number;
  supplier: string;
  referenceNumber?: string;
  description?: string;
  status: string;
  nextRevisionDate?: string;
  devise: string;
  equipment?: any;
  createdAt?: string;
  updatedAt?: string;
}

export function exportEquipmentRevisionsToPDF(revisions: EquipmentRevision[], title = 'Rapport des révisions équipements') {
  const doc = new jsPDF();
  const date = new Date().toLocaleString('fr-FR');
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`Date d'export : ${date}`, 14, 26);
  
  const body = revisions.map(r => [
    r.revisionId,
    r.equipment?.name || '',
    r.equipment?.referenceCode || '',
    formatDate(r.revisionDate),
    formatDate(r.validityDate),
    formatCurrency(r.amount, r.devise),
    r.supplier,
    r.referenceNumber || '',
    r.description || '',
    getStatusText(r.status),
    formatDate(r.nextRevisionDate),
    formatDate(r.createdAt),
    formatDate(r.updatedAt)
  ]);

  autoTable(doc, {
    startY: 32,
    head: [[ 'ID', 'Équipement', 'Code Réf.', 'Date Révision', 'Date Validité', 'Montant', 'Fournisseur', 'N° Référence', 'Description', 'Statut', 'Prochaine Révision', 'Créé le', 'Mis à jour le' ]],
    body,
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    theme: 'grid',
  });

  doc.save(`${title.replace(/\s+/g, '_')}_${date.replace(/\s|:/g, '_')}.pdf`);
}

export function exportEquipmentRevisionsToExcel(revisions: EquipmentRevision[], title = 'Révisions_équipements') {
  const wsData = [
    ['ID', 'Équipement', 'Code Réf.', 'Date Révision', 'Date Validité', 'Montant', 'Devise', 'Fournisseur', 'N° Référence', 'Description', 'Statut', 'Prochaine Révision', 'Créé le', 'Mis à jour le'],
    ...revisions.map((r: EquipmentRevision) => [
      r.revisionId,
      r.equipment?.name || '',
      r.equipment?.referenceCode || '',
      formatDate(r.revisionDate),
      formatDate(r.validityDate),
      r.amount,
      r.devise,
      r.supplier,
      r.referenceNumber || '',
      r.description || '',
      getStatusText(r.status),
      formatDate(r.nextRevisionDate),
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

export function exportEquipmentRevisionsToCSV(revisions: EquipmentRevision[], title = 'Révisions_équipements') {
  const headers = ['ID', 'Équipement', 'Code Réf.', 'Date Révision', 'Date Validité', 'Montant', 'Devise', 'Fournisseur', 'N° Référence', 'Description', 'Statut', 'Prochaine Révision', 'Créé le', 'Mis à jour le'];
  const rows = revisions.map(r => [
    r.revisionId,
    r.equipment?.name || '',
    r.equipment?.referenceCode || '',
    formatDate(r.revisionDate),
    formatDate(r.validityDate),
    r.amount,
    r.devise,
    r.supplier,
    r.referenceNumber || '',
    r.description || '',
    getStatusText(r.status),
    formatDate(r.nextRevisionDate),
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

// Calibration interface and export functions
export interface Calibration {
  calibrationId: number;
  equipmentId: number;
  calibrationDate: string;
  validityDate?: string;
  amount: number;
  supplier: string;
  referenceNumber?: string;
  description?: string;
  nextCalibrationDate?: string;
  devise: string;
  equipment?: any;
  createdAt?: string;
  updatedAt?: string;
}

export function exportCalibrationsToPDF(calibrations: Calibration[], title = 'Rapport des calibrations') {
  const doc = new jsPDF();
  const date = new Date().toLocaleString('fr-FR');
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`Date d'export : ${date}`, 14, 26);
  
  const body = calibrations.map(c => [
    c.calibrationId,
    c.equipment?.name || '',
    c.equipment?.referenceCode || '',
    formatDate(c.calibrationDate),
    formatDate(c.validityDate),
    formatCurrency(c.amount, c.devise),
    c.supplier,
    c.referenceNumber || '',
    c.description || '',
    formatDate(c.nextCalibrationDate),
    formatDate(c.createdAt),
    formatDate(c.updatedAt)
  ]);

  autoTable(doc, {
    startY: 32,
    head: [[ 'ID', 'Équipement', 'Code Réf.', 'Date Calibration', 'Date Validité', 'Montant', 'Fournisseur', 'N° Référence', 'Description', 'Prochaine Calibration', 'Créé le', 'Mis à jour le' ]],
    body,
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    theme: 'grid',
  });

  doc.save(`${title.replace(/\s+/g, '_')}_${date.replace(/\s|:/g, '_')}.pdf`);
}

export function exportCalibrationsToExcel(calibrations: Calibration[], title = 'Calibrations') {
  const wsData = [
    ['ID', 'Équipement', 'Code Réf.', 'Date Calibration', 'Date Validité', 'Montant', 'Devise', 'Fournisseur', 'N° Référence', 'Description', 'Prochaine Calibration', 'Créé le', 'Mis à jour le'],
    ...calibrations.map((c: Calibration) => [
      c.calibrationId,
      c.equipment?.name || '',
      c.equipment?.referenceCode || '',
      formatDate(c.calibrationDate),
      formatDate(c.validityDate),
      c.amount,
      c.devise,
      c.supplier,
      c.referenceNumber || '',
      c.description || '',
      formatDate(c.nextCalibrationDate),
      formatDate(c.createdAt),
      formatDate(c.updatedAt)
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

export function exportCalibrationsToCSV(calibrations: Calibration[], title = 'Calibrations') {
  const headers = ['ID', 'Équipement', 'Code Réf.', 'Date Calibration', 'Date Validité', 'Montant', 'Devise', 'Fournisseur', 'N° Référence', 'Description', 'Prochaine Calibration', 'Créé le', 'Mis à jour le'];
  const rows = calibrations.map(c => [
    c.calibrationId,
    c.equipment?.name || '',
    c.equipment?.referenceCode || '',
    formatDate(c.calibrationDate),
    formatDate(c.validityDate),
    c.amount,
    c.devise,
    c.supplier,
    c.referenceNumber || '',
    c.description || '',
    formatDate(c.nextCalibrationDate),
    formatDate(c.createdAt),
    formatDate(c.updatedAt)
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

// Assignment interface and export functions
export interface Assignment {
  assignmentId: number;
  equipmentId: number;
  userId: number;
  assignmentDate: string;
  returnDate?: string;
  purpose?: string;
  notes?: string;
  status: string;
  attachmentFile?: string;
  equipment?: any;
  user?: any;
  createdAt?: string;
  updatedAt?: string;
}

export function exportAssignmentsToPDF(assignments: Assignment[], title = 'Rapport des affectations') {
  const doc = new jsPDF();
  const date = new Date().toLocaleString('fr-FR');
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`Date d'export : ${date}`, 14, 26);
  
  const body = assignments.map(a => [
    a.assignmentId,
    a.equipment?.name || '',
    a.equipment?.referenceCode || '',
    a.user?.firstName && a.user?.lastName ? `${a.user.firstName} ${a.user.lastName}` : '',
    formatDate(a.assignmentDate),
    formatDate(a.returnDate),
    a.purpose || '',
    a.notes || '',
    getStatusText(a.status),
    a.attachmentFile || '',
    formatDate(a.createdAt),
    formatDate(a.updatedAt)
  ]);

  autoTable(doc, {
    startY: 32,
    head: [[ 'ID', 'Équipement', 'Code Réf.', 'Utilisateur', 'Date Affectation', 'Date Retour', 'Objectif', 'Notes', 'Statut', 'Document', 'Créé le', 'Mis à jour le' ]],
    body,
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    theme: 'grid',
  });

  doc.save(`${title.replace(/\s+/g, '_')}_${date.replace(/\s|:/g, '_')}.pdf`);
}

export function exportAssignmentsToExcel(assignments: Assignment[], title = 'Affectations') {
  const wsData = [
    ['ID', 'Équipement', 'Code Réf.', 'Utilisateur', 'Date Affectation', 'Date Retour', 'Objectif', 'Notes', 'Statut', 'Document', 'Créé le', 'Mis à jour le'],
    ...assignments.map((a: Assignment) => [
      a.assignmentId,
      a.equipment?.name || '',
      a.equipment?.referenceCode || '',
      a.user?.firstName && a.user?.lastName ? `${a.user.firstName} ${a.user.lastName}` : '',
      formatDate(a.assignmentDate),
      formatDate(a.returnDate),
      a.purpose || '',
      a.notes || '',
      getStatusText(a.status),
      a.attachmentFile || '',
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

export function exportAssignmentsToCSV(assignments: Assignment[], title = 'Affectations') {
  const headers = ['ID', 'Équipement', 'Code Réf.', 'Utilisateur', 'Date Affectation', 'Date Retour', 'Objectif', 'Notes', 'Statut', 'Document', 'Créé le', 'Mis à jour le'];
  const rows = assignments.map(a => [
    a.assignmentId,
    a.equipment?.name || '',
    a.equipment?.referenceCode || '',
    a.user?.firstName && a.user?.lastName ? `${a.user.firstName} ${a.user.lastName}` : '',
    formatDate(a.assignmentDate),
    formatDate(a.returnDate),
    a.purpose || '',
    a.notes || '',
    getStatusText(a.status),
    a.attachmentFile || '',
    formatDate(a.createdAt),
    formatDate(a.updatedAt)
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
    case 'GOOD': return 'Bon';
    case 'BAD': return 'Mauvais';
    case 'BROKEN': return 'En panne';
    case 'DECOMMISSIONED': return 'Réformé';
    case 'LOST': return 'Perdu';
    default: return status;
  }
}

function getCategoryText(category: string) {
  switch (category) {
    case 'TOPOGRAPHIC_MATERIALS': return 'Matériels Topographiques';
    case 'COMPUTER_MATERIALS': return 'Matériels Informatiques';
    case 'OTHERS': return 'Autres';
    default: return category;
  }
}

function getTypeText(type: string) {
  // For equipment types
  switch (type) {
    case 'NIVEAUX_LASER': return 'Niveaux Laser';
    case 'PELETEUSES': return 'Pelleuses';
    case 'BETONNIERES': return 'Bétonnières';
    case 'SCIES_A_BETON': return 'Scies à Béton';
    case 'ECHAFAUDAGES': return 'Échafaudages';
    case 'COMPRESSEURS_AIR': return 'Compresseurs d\'Air';
    case 'ENGIN_DE_COMPACTAGE': return 'Engin de Compactage';
    case 'CAMIONS_DE_TRANSPORT': return 'Camions de Transport';
    case 'MESUREURS_DE_DISTANCE_LASER': return 'Mesureurs de Distance Laser';
    case 'GENERATEURS': return 'Générateurs';
    case 'ORDINATEURS_PORTABLES': return 'Ordinateurs Portables';
    case 'TABLETTES': return 'Tablettes';
    case 'LOGICIELS_DE_GESTION_DE_PROJET': return 'Logiciels de Gestion de Projet';
    case 'DRONES': return 'Drones';
    case 'IMPRIMANTES_3D': return 'Imprimantes 3D';
    case 'OTHER_Equipement': return 'Autre Équipement';
    // For maintenance types
    case 'PREVENTIVE': return 'Préventive';
    case 'CORRECTIVE': return 'Corrective';
    case 'PREDICTIVE': return 'Prédictive';
    // For repair types
    case 'MECHANICAL': return 'Mécanique';
    case 'ELECTRONIC': return 'Électronique';
    case 'SOFTWARE': return 'Logiciel';
    case 'BODYWORK': return 'Carrosserie';
    case 'OTHER': return 'Autre';
    default: return type;
  }
}

function getBrandText(brand: string) {
  switch (brand) {
    case 'LEICA': return 'Leica';
    case 'TRIMBLE': return 'Trimble';
    case 'TOPCON': return 'Topcon';
    case 'SOKKIA': return 'Sokkia';
    case 'NIKON': return 'Nikon';
    case 'PENTAX': return 'Pentax';
    case 'SPECTRA': return 'Spectra';
    case 'GEO_FENNEL': return 'Geo Fennel';
    case 'SOUTH': return 'South';
    case 'STONEX': return 'Stonex';
    case 'OTHER_BRAND': return 'Autre Marque';
    default: return brand;
  }
}

function getOwnershipText(ownership: string) {
  switch (ownership) {
    case 'OWNED': return 'Propriété';
    case 'LEASED': return 'Location';
    case 'BORROWED': return 'Emprunté';
    default: return ownership;
  }
}

function formatCurrency(amount: number, currency: string = 'EUR') {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}

function formatDate(dateString?: string) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('fr-FR');
}