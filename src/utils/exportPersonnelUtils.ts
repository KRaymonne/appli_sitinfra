import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// User interface and export functions
export interface User {
  id: number;
  employeeNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  department: string;
  workcountry: string;
  hireDate: string;
  createdAt: string;
  updatedAt: string;
}

export function exportUsersToPDF(users: User[], title = 'Rapport des utilisateurs') {
  const doc = new jsPDF();
  const date = new Date().toLocaleString('fr-FR');
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`Date d'export : ${date}`, 14, 26);
  
  const body = users.map(u => [
    u.id,
    u.employeeNumber,
    u.firstName,
    u.lastName,
    u.email,
    getRoleText(u.role),
    getStatusText(u.status),
    u.department,
    u.workcountry,
    formatDate(u.hireDate),
    formatDate(u.createdAt),
    formatDate(u.updatedAt)
  ]);

  autoTable(doc, {
    startY: 32,
    head: [[ 'ID', 'Matricule', 'Prénom', 'Nom', 'Email', 'Rôle', 'Statut', 'Département', 'Pays', 'Date embauche', 'Créé le', 'Mis à jour le' ]],
    body,
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    theme: 'grid',
  });

  doc.save(`${title.replace(/\s+/g, '_')}_${date.replace(/\s|:/g, '_')}.pdf`);
}

export function exportUsersToExcel(users: User[], title = 'Utilisateurs') {
  const wsData = [
    ['ID', 'Matricule', 'Prénom', 'Nom', 'Email', 'Rôle', 'Statut', 'Département', 'Pays', 'Date embauche', 'Créé le', 'Mis à jour le'],
    ...users.map((u: User) => [
      u.id,
      u.employeeNumber,
      u.firstName,
      u.lastName,
      u.email,
      getRoleText(u.role),
      getStatusText(u.status),
      u.department,
      u.workcountry,
      formatDate(u.hireDate),
      formatDate(u.createdAt),
      formatDate(u.updatedAt)
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

export function exportUsersToCSV(users: User[], title = 'Utilisateurs') {
  const headers = ['ID', 'Matricule', 'Prénom', 'Nom', 'Email', 'Rôle', 'Statut', 'Département', 'Pays', 'Date embauche', 'Créé le', 'Mis à jour le'];
  const rows = users.map(u => [
    u.id,
    u.employeeNumber,
    u.firstName,
    u.lastName,
    u.email,
    getRoleText(u.role),
    getStatusText(u.status),
    u.department,
    u.workcountry,
    formatDate(u.hireDate),
    formatDate(u.createdAt),
    formatDate(u.updatedAt)
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

// Absence interface and export functions
export interface Absence {
  absenceId: number;
  userId: number;
  absenceType: string;
  description: string | null;
  startDate: string;
  endDate: string;
  daysCount: number;
  returnDate: string;
  supportingDocument: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    employeeNumber: string;
    email: string;
  };
}

export function exportAbsencesToPDF(absences: Absence[], title = 'Rapport des absences') {
  const doc = new jsPDF();
  const date = new Date().toLocaleString('fr-FR');
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`Date d'export : ${date}`, 14, 26);
  
  const body = absences.map(a => [
    a.absenceId,
    a.user?.firstName + ' ' + a.user?.lastName,
    a.user?.employeeNumber,
    getAbsenceTypeText(a.absenceType),
    a.description || '',
    formatDate(a.startDate),
    formatDate(a.endDate),
    a.daysCount,
    formatDate(a.returnDate),
    a.supportingDocument || '',
    formatDate(a.createdAt),
    formatDate(a.updatedAt)
  ]);

  autoTable(doc, {
    startY: 32,
    head: [[ 'ID', 'Employé', 'Matricule', 'Type', 'Description', 'Date début', 'Date fin', 'Jours', 'Date retour', 'Document', 'Créé le', 'Mis à jour le' ]],
    body,
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    theme: 'grid',
  });

  doc.save(`${title.replace(/\s+/g, '_')}_${date.replace(/\s|:/g, '_')}.pdf`);
}

export function exportAbsencesToExcel(absences: Absence[], title = 'Absences') {
  const wsData = [
    ['ID', 'Employé', 'Matricule', 'Type', 'Description', 'Date début', 'Date fin', 'Jours', 'Date retour', 'Document', 'Créé le', 'Mis à jour le'],
    ...absences.map((a: Absence) => [
      a.absenceId,
      a.user?.firstName + ' ' + a.user?.lastName,
      a.user?.employeeNumber,
      getAbsenceTypeText(a.absenceType),
      a.description || '',
      formatDate(a.startDate),
      formatDate(a.endDate),
      a.daysCount,
      formatDate(a.returnDate),
      a.supportingDocument || '',
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

export function exportAbsencesToCSV(absences: Absence[], title = 'Absences') {
  const headers = ['ID', 'Employé', 'Matricule', 'Type', 'Description', 'Date début', 'Date fin', 'Jours', 'Date retour', 'Document', 'Créé le', 'Mis à jour le'];
  const rows = absences.map(a => [
    a.absenceId,
    a.user?.firstName + ' ' + a.user?.lastName,
    a.user?.employeeNumber,
    getAbsenceTypeText(a.absenceType),
    a.description || '',
    formatDate(a.startDate),
    formatDate(a.endDate),
    a.daysCount,
    formatDate(a.returnDate),
    a.supportingDocument || '',
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

// Contract interface and export functions
export interface Contract {
  contractId: number;
  userId: number;
  contractType: string;
  startDate: string;
  endDate: string | null;
  post: string;
  department: string;
  unit: string | null;
  grossSalary: number;
  netSalary: number;
  currency: string;
  contractFile: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    employeeNumber: string;
    email: string;
  };
}

export function exportContractsToPDF(contracts: Contract[], title = 'Rapport des contrats') {
  const doc = new jsPDF();
  const date = new Date().toLocaleString('fr-FR');
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`Date d'export : ${date}`, 14, 26);
  
  const body = contracts.map(c => [
    c.contractId,
    c.user?.firstName + ' ' + c.user?.lastName,
    c.user?.employeeNumber,
    getContractTypeText(c.contractType),
    c.post,
    c.department,
    c.unit || '',
    formatCurrency(c.grossSalary, c.currency),
    formatCurrency(c.netSalary, c.currency),
    formatDate(c.startDate),
    c.endDate ? formatDate(c.endDate) : '',
    c.contractFile || '',
    formatDate(c.createdAt),
    formatDate(c.updatedAt)
  ]);

  autoTable(doc, {
    startY: 32,
    head: [[ 'ID', 'Employé', 'Matricule', 'Type', 'Poste', 'Département', 'Unité', 'Salaire brut', 'Salaire net', 'Date début', 'Date fin', 'Fichier', 'Créé le', 'Mis à jour le' ]],
    body,
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    theme: 'grid',
  });

  doc.save(`${title.replace(/\s+/g, '_')}_${date.replace(/\s|:/g, '_')}.pdf`);
}

export function exportContractsToExcel(contracts: Contract[], title = 'Contrats') {
  const wsData = [
    ['ID', 'Employé', 'Matricule', 'Type', 'Poste', 'Département', 'Unité', 'Salaire brut', 'Devise', 'Salaire net', 'Devise', 'Date début', 'Date fin', 'Fichier', 'Créé le', 'Mis à jour le'],
    ...contracts.map((c: Contract) => [
      c.contractId,
      c.user?.firstName + ' ' + c.user?.lastName,
      c.user?.employeeNumber,
      getContractTypeText(c.contractType),
      c.post,
      c.department,
      c.unit || '',
      c.grossSalary,
      c.currency,
      c.netSalary,
      c.currency,
      formatDate(c.startDate),
      c.endDate ? formatDate(c.endDate) : '',
      c.contractFile || '',
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

export function exportContractsToCSV(contracts: Contract[], title = 'Contrats') {
  const headers = ['ID', 'Employé', 'Matricule', 'Type', 'Poste', 'Département', 'Unité', 'Salaire brut', 'Devise', 'Salaire net', 'Devise', 'Date début', 'Date fin', 'Fichier', 'Créé le', 'Mis à jour le'];
  const rows = contracts.map(c => [
    c.contractId,
    c.user?.firstName + ' ' + c.user?.lastName,
    c.user?.employeeNumber,
    getContractTypeText(c.contractType),
    c.post,
    c.department,
    c.unit || '',
    c.grossSalary,
    c.currency,
    c.netSalary,
    c.currency,
    formatDate(c.startDate),
    c.endDate ? formatDate(c.endDate) : '',
    c.contractFile || '',
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

// Bonus interface and export functions
export interface Bonus {
  bonusId: number;
  userId: number;
  bonusType: string;
  amount: number;
  currency: string;
  awardDate: string;
  reason: string | null;
  paymentMethod: string;
  status: string;
  supportingDocument: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    employeeNumber: string;
    email: string;
  };
}

export function exportBonusesToPDF(bonuses: Bonus[], title = 'Rapport des primes') {
  const doc = new jsPDF();
  const date = new Date().toLocaleString('fr-FR');
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`Date d'export : ${date}`, 14, 26);
  
  const body = bonuses.map(b => [
    b.bonusId,
    b.user?.firstName + ' ' + b.user?.lastName,
    b.user?.employeeNumber,
    getBonusTypeText(b.bonusType),
    formatCurrency(b.amount, b.currency),
    formatDate(b.awardDate),
    b.reason || '',
    b.paymentMethod,
    getStatusText(b.status),
    b.supportingDocument || '',
    formatDate(b.createdAt),
    formatDate(b.updatedAt)
  ]);

  autoTable(doc, {
    startY: 32,
    head: [[ 'ID', 'Employé', 'Matricule', 'Type', 'Montant', 'Date attribution', 'Raison', 'Méthode paiement', 'Statut', 'Document', 'Créé le', 'Mis à jour le' ]],
    body,
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    theme: 'grid',
  });

  doc.save(`${title.replace(/\s+/g, '_')}_${date.replace(/\s|:/g, '_')}.pdf`);
}

export function exportBonusesToExcel(bonuses: Bonus[], title = 'Primes') {
  const wsData = [
    ['ID', 'Employé', 'Matricule', 'Type', 'Montant', 'Devise', 'Date attribution', 'Raison', 'Méthode paiement', 'Statut', 'Document', 'Créé le', 'Mis à jour le'],
    ...bonuses.map((b: Bonus) => [
      b.bonusId,
      b.user?.firstName + ' ' + b.user?.lastName,
      b.user?.employeeNumber,
      getBonusTypeText(b.bonusType),
      b.amount,
      b.currency,
      formatDate(b.awardDate),
      b.reason || '',
      b.paymentMethod,
      getStatusText(b.status),
      b.supportingDocument || '',
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

export function exportBonusesToCSV(bonuses: Bonus[], title = 'Primes') {
  const headers = ['ID', 'Employé', 'Matricule', 'Type', 'Montant', 'Devise', 'Date attribution', 'Raison', 'Méthode paiement', 'Statut', 'Document', 'Créé le', 'Mis à jour le'];
  const rows = bonuses.map(b => [
    b.bonusId,
    b.user?.firstName + ' ' + b.user?.lastName,
    b.user?.employeeNumber,
    getBonusTypeText(b.bonusType),
    b.amount,
    b.currency,
    formatDate(b.awardDate),
    b.reason || '',
    b.paymentMethod,
    getStatusText(b.status),
    b.supportingDocument || '',
    formatDate(b.createdAt),
    formatDate(b.updatedAt)
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

// Affectation interface and export functions
export interface Affectation {
  affectationsId: number;
  userId: number;
  workLocation: string;
  site: string;
  affectationtype: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  attached_file: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    employeeNumber: string;
    email: string;
  };
}

export function exportAffectationsToPDF(affectations: Affectation[], title = 'Rapport des affectations') {
  const doc = new jsPDF();
  const date = new Date().toLocaleString('fr-FR');
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`Date d'export : ${date}`, 14, 26);
  
  const body = affectations.map(a => [
    a.affectationsId,
    a.user?.firstName + ' ' + a.user?.lastName,
    a.user?.employeeNumber,
    a.workLocation,
    a.site,
    getAffectationTypeText(a.affectationtype),
    a.description || '',
    formatDate(a.startDate),
    a.endDate ? formatDate(a.endDate) : '',
    a.attached_file || '',
    formatDate(a.createdAt),
    formatDate(a.updatedAt)
  ]);

  autoTable(doc, {
    startY: 32,
    head: [[ 'ID', 'Employé', 'Matricule', 'Lieu', 'Site', 'Type', 'Description', 'Date début', 'Date fin', 'Fichier', 'Créé le', 'Mis à jour le' ]],
    body,
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    theme: 'grid',
  });

  doc.save(`${title.replace(/\s+/g, '_')}_${date.replace(/\s|:/g, '_')}.pdf`);
}

export function exportAffectationsToExcel(affectations: Affectation[], title = 'Affectations') {
  const wsData = [
    ['ID', 'Employé', 'Matricule', 'Lieu', 'Site', 'Type', 'Description', 'Date début', 'Date fin', 'Fichier', 'Créé le', 'Mis à jour le'],
    ...affectations.map((a: Affectation) => [
      a.affectationsId,
      a.user?.firstName + ' ' + a.user?.lastName,
      a.user?.employeeNumber,
      a.workLocation,
      a.site,
      getAffectationTypeText(a.affectationtype),
      a.description || '',
      formatDate(a.startDate),
      a.endDate ? formatDate(a.endDate) : '',
      a.attached_file || '',
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

export function exportAffectationsToCSV(affectations: Affectation[], title = 'Affectations') {
  const headers = ['ID', 'Employé', 'Matricule', 'Lieu', 'Site', 'Type', 'Description', 'Date début', 'Date fin', 'Fichier', 'Créé le', 'Mis à jour le'];
  const rows = affectations.map(a => [
    a.affectationsId,
    a.user?.firstName + ' ' + a.user?.lastName,
    a.user?.employeeNumber,
    a.workLocation,
    a.site,
    getAffectationTypeText(a.affectationtype),
    a.description || '',
    formatDate(a.startDate),
    a.endDate ? formatDate(a.endDate) : '',
    a.attached_file || '',
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

// Sanction interface and export functions
export interface Sanction {
  sanctionId: number;
  userId: number;
  sanctionType: string;
  reason: string;
  sanctionDate: string;
  durationDays: number | null;
  decision: string | null;
  supportingDocument: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    employeeNumber: string;
    email: string;
  };
}

export function exportSanctionsToPDF(sanctions: Sanction[], title = 'Rapport des sanctions') {
  const doc = new jsPDF();
  const date = new Date().toLocaleString('fr-FR');
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`Date d'export : ${date}`, 14, 26);
  
  const body = sanctions.map(s => [
    s.sanctionId,
    s.user?.firstName + ' ' + s.user?.lastName,
    s.user?.employeeNumber,
    getSanctionTypeText(s.sanctionType),
    s.reason,
    formatDate(s.sanctionDate),
    s.durationDays ? `${s.durationDays} jours` : '',
    s.decision || '',
    s.supportingDocument || '',
    formatDate(s.createdAt),
    formatDate(s.updatedAt)
  ]);

  autoTable(doc, {
    startY: 32,
    head: [[ 'ID', 'Employé', 'Matricule', 'Type', 'Motif', 'Date', 'Durée', 'Décision', 'Document', 'Créé le', 'Mis à jour le' ]],
    body,
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    theme: 'grid',
  });

  doc.save(`${title.replace(/\s+/g, '_')}_${date.replace(/\s|:/g, '_')}.pdf`);
}

export function exportSanctionsToExcel(sanctions: Sanction[], title = 'Sanctions') {
  const wsData = [
    ['ID', 'Employé', 'Matricule', 'Type', 'Motif', 'Date', 'Durée', 'Décision', 'Document', 'Créé le', 'Mis à jour le'],
    ...sanctions.map((s: Sanction) => [
      s.sanctionId,
      s.user?.firstName + ' ' + s.user?.lastName,
      s.user?.employeeNumber,
      getSanctionTypeText(s.sanctionType),
      s.reason,
      formatDate(s.sanctionDate),
      s.durationDays ? `${s.durationDays} jours` : '',
      s.decision || '',
      s.supportingDocument || '',
      formatDate(s.createdAt),
      formatDate(s.updatedAt)
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

export function exportSanctionsToCSV(sanctions: Sanction[], title = 'Sanctions') {
  const headers = ['ID', 'Employé', 'Matricule', 'Type', 'Motif', 'Date', 'Durée', 'Décision', 'Document', 'Créé le', 'Mis à jour le'];
  const rows = sanctions.map(s => [
    s.sanctionId,
    s.user?.firstName + ' ' + s.user?.lastName,
    s.user?.employeeNumber,
    getSanctionTypeText(s.sanctionType),
    s.reason,
    formatDate(s.sanctionDate),
    s.durationDays ? `${s.durationDays} jours` : '',
    s.decision || '',
    s.supportingDocument || '',
    formatDate(s.createdAt),
    formatDate(s.updatedAt)
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

// MedicalRecord interface and export functions
export interface MedicalRecord {
  medicalRecordsId: number;
  userId: number;
  visitDate: string;
  description: string | null;
  diagnosis: string | null;
  testsPerformed: string | null;
  testResults: string | null;
  prescribedAction: string | null;
  notes: string | null;
  nextVisitDate: string | null;
  medicalFile: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    employeeNumber: string;
    email: string;
  };
}

export function exportMedicalRecordsToPDF(records: MedicalRecord[], title = 'Rapport des dossiers médicaux') {
  const doc = new jsPDF();
  const date = new Date().toLocaleString('fr-FR');
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`Date d'export : ${date}`, 14, 26);
  
  const body = records.map(r => [
    r.medicalRecordsId,
    r.user?.firstName + ' ' + r.user?.lastName,
    r.user?.employeeNumber,
    formatDate(r.visitDate),
    r.description || '',
    r.diagnosis || '',
    r.testsPerformed || '',
    r.testResults || '',
    r.prescribedAction || '',
    r.notes || '',
    formatDate(r.nextVisitDate),
    r.medicalFile || '',
    formatDate(r.createdAt),
    formatDate(r.updatedAt)
  ]);

  autoTable(doc, {
    startY: 32,
    head: [[ 'ID', 'Employé', 'Matricule', 'Date visite', 'Description', 'Diagnostic', 'Tests effectués', 'Résultats tests', 'Action prescrite', 'Notes', 'Prochaine visite', 'Fichier médical', 'Créé le', 'Mis à jour le' ]],
    body,
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    theme: 'grid',
  });

  doc.save(`${title.replace(/\s+/g, '_')}_${date.replace(/\s|:/g, '_')}.pdf`);
}

export function exportMedicalRecordsToExcel(records: MedicalRecord[], title = 'Dossiers_médicaux') {
  const wsData = [
    ['ID', 'Employé', 'Matricule', 'Date visite', 'Description', 'Diagnostic', 'Tests effectués', 'Résultats tests', 'Action prescrite', 'Notes', 'Prochaine visite', 'Fichier médical', 'Créé le', 'Mis à jour le'],
    ...records.map((r: MedicalRecord) => [
      r.medicalRecordsId,
      r.user?.firstName + ' ' + r.user?.lastName,
      r.user?.employeeNumber,
      formatDate(r.visitDate),
      r.description || '',
      r.diagnosis || '',
      r.testsPerformed || '',
      r.testResults || '',
      r.prescribedAction || '',
      r.notes || '',
      formatDate(r.nextVisitDate),
      r.medicalFile || '',
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

export function exportMedicalRecordsToCSV(records: MedicalRecord[], title = 'Dossiers_médicaux') {
  const headers = ['ID', 'Employé', 'Matricule', 'Date visite', 'Description', 'Diagnostic', 'Tests effectués', 'Résultats tests', 'Action prescrite', 'Notes', 'Prochaine visite', 'Fichier médical', 'Créé le', 'Mis à jour le'];
  const rows = records.map(r => [
    r.medicalRecordsId,
    r.user?.firstName + ' ' + r.user?.lastName,
    r.user?.employeeNumber,
    formatDate(r.visitDate),
    r.description || '',
    r.diagnosis || '',
    r.testsPerformed || '',
    r.testResults || '',
    r.prescribedAction || '',
    r.notes || '',
    formatDate(r.nextVisitDate),
    r.medicalFile || '',
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
function getRoleText(role: string) {
  switch (role) {
    case 'ADMIN': return 'Admin';
    case 'ACCOUNTANT': return 'Comptable';
    case 'DIRECTOR': return 'Directeur';
    case 'DIRECTEUR_TECHNIQUE': return 'Directeur Technique';
    case 'DIRECTEUR_ADMINISTRATIF': return 'Directeur Administratif';
    case 'EMPLOYEE': return 'Employé';
    case 'SECRETARY': return 'Secrétaire';
    case 'DRIVER': return 'Chauffeur';
    default: return role;
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'ACTIVE': return 'Actif';
    case 'SUSPENDED': return 'Suspendu';
    case 'FIRED': return 'Licencié';
    case 'ON_HOLIDAY': return 'En congé';
    case 'APPROVED': return 'Approuvé';
    case 'PENDING': return 'En attente';
    case 'REJECTED': return 'Rejeté';
    default: return status;
  }
}

function getAbsenceTypeText(type: string) {
  switch (type) {
    case 'SICK_LEAVE': return 'Congé maladie';
    case 'ANNUAL_LEAVE': return 'Congé annuel';
    case 'MATERNITY_LEAVE': return 'Congé maternité';
    case 'PATERNITY_LEAVE': return 'Congé paternité';
    case 'UNPAID_LEAVE': return 'Congé sans solde';
    case 'OTHER': return 'Autre';
    default: return type;
  }
}

function getContractTypeText(type: string) {
  switch (type) {
    case 'PERMANENT_CONTRACT_CDI': return 'CDI';
    case 'FIXED_TERM_CONTRACT_CDD': return 'CDD';
    case 'INTERNSHIP': return 'Stage';
    case 'CONSULTANT': return 'Consultant';
    default: return type;
  }
}

function getBonusTypeText(type: string) {
  switch (type) {
    case 'PERFORMANCE_BONUS': return 'Prime de performance';
    case 'YEAR_END_BONUS': return 'Prime de fin d\'année';
    case 'SPECIAL_BONUS': return 'Prime spéciale';
    case 'OTHER': return 'Autre';
    default: return type;
  }
}

function getSanctionTypeText(type: string) {
  switch (type) {
    case 'VERBAL_WARNING': return 'Avertissement verbal';
    case 'WRITTEN_WARNING': return 'Avertissement écrit';
    case 'SUSPENSION': return 'Suspension';
    case 'DEMOTION': return 'Rétrogradation';
    case 'TERMINATION': return 'Licenciement';
    case 'OTHER': return 'Autre';
    default: return type;
  }
}

function getAffectationTypeText(type: string) {
  switch (type) {
    case 'PERMANENT': return 'Permanente';
    case 'TEMPORARY': return 'Temporaire';
    case 'TRANSFER': return 'Mutation';
    case 'PROJECT_BASED': return 'Basée sur projet';
    case 'SPECIAL_ASSIGNMENT': return 'Mission spéciale';
    default: return type;
  }
}

function formatCurrency(amount: number, currency: string) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

function formatDate(dateString: string | null) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('fr-FR');
}