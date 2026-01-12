import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// Vehicle interface and export functions
export interface Vehicle {
  vehicleId: number;
  licensePlate: string;
  brand: string;
  model: string;
  type?: string;
  vehiclecountry?: string;
  year: number;
  status: string;
  fuelType: string;
  mileage: number;
  chassisNumber?: string;
  acquisitionDate?: string;
  usingEntity?: string;
  holder?: string;
  civilRegistration?: string;
  administrativeRegistration?: string;
  assignedTo?: string;
  Inserteridentity?: string;
  InserterCountry?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function exportVehiclesToPDF(vehicles: Vehicle[], title = 'Rapport des véhicules') {
  const doc = new jsPDF();
  const date = new Date().toLocaleString('fr-FR');
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`Date d'export : ${date}`, 14, 26);
  
  const body = vehicles.map(v => [
    v.vehicleId,
    v.licensePlate,
    v.brand,
    v.model,
    getTypeText(v.type),
    getCountryText(v.vehiclecountry),
    v.year,
    getStatusText(v.status),
    getFuelTypeText(v.fuelType),
    v.mileage,
    v.chassisNumber || '',
    formatDate(v.acquisitionDate),
    v.usingEntity || '',
    v.holder || '',
    v.civilRegistration || '',
    v.administrativeRegistration || '',
    v.assignedTo || '',
    formatDate(v.createdAt),
    formatDate(v.updatedAt)
  ]);

  autoTable(doc, {
    startY: 32,
    head: [[ 'ID', 'Plaque', 'Marque', 'Modèle', 'Type', 'Pays', 'Année', 'Statut', 'Carburant', 'Kilométrage', 'Châssis', "Date d'acquisition", 'Entité utilisatrice', 'Titulaire', 'Immatriculation civile', 'Immatriculation admin', 'Assigné à', 'Créé le', 'Mis à jour le' ]],
    body,
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    theme: 'grid',
  });

  doc.save(`${title.replace(/\s+/g, '_')}_${date.replace(/\s|:/g, '_')}.pdf`);
}

export function exportVehiclesToExcel(vehicles: Vehicle[], title = 'Véhicules') {
  const wsData = [
    ['ID', 'Plaque', 'Marque', 'Modèle', 'Type', 'Pays', 'Année', 'Statut', 'Carburant', 'Kilométrage', 'Châssis', "Date d'acquisition", 'Entité utilisatrice', 'Titulaire', 'Immatriculation civile', 'Immatriculation admin', 'Assigné à', 'Créé le', 'Mis à jour le'],
    ...vehicles.map((v: Vehicle) => [
      v.vehicleId,
      v.licensePlate,
      v.brand,
      v.model,
      getTypeText(v.type),
      getCountryText(v.vehiclecountry),
      v.year,
      getStatusText(v.status),
      getFuelTypeText(v.fuelType),
      v.mileage,
      v.chassisNumber || '',
      formatDate(v.acquisitionDate),
      v.usingEntity || '',
      v.holder || '',
      v.civilRegistration || '',
      v.administrativeRegistration || '',
      v.assignedTo || '',
      formatDate(v.createdAt),
      formatDate(v.updatedAt)
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

export function exportVehiclesToCSV(vehicles: Vehicle[], title = 'Véhicules') {
  const headers = ['ID', 'Plaque', 'Marque', 'Modèle', 'Type', 'Pays', 'Année', 'Statut', 'Carburant', 'Kilométrage', 'Châssis', "Date d'acquisition", 'Entité utilisatrice', 'Titulaire', 'Immatriculation civile', 'Immatriculation admin', 'Assigné à', 'Créé le', 'Mis à jour le'];
  const rows = vehicles.map(v => [
    v.vehicleId,
    v.licensePlate,
    v.brand,
    v.model,
    getTypeText(v.type),
    getCountryText(v.vehiclecountry),
    v.year,
    getStatusText(v.status),
    getFuelTypeText(v.fuelType),
    v.mileage,
    v.chassisNumber || '',
    formatDate(v.acquisitionDate),
    v.usingEntity || '',
    v.holder || '',
    v.civilRegistration || '',
    v.administrativeRegistration || '',
    v.assignedTo || '',
    formatDate(v.createdAt),
    formatDate(v.updatedAt)
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

// StateVehicle interface and export functions
export interface StateVehicle {
  stateVehicleId: number;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
  ministry: string;
  department: string;
  service: string;
  budgetAllocation: string;
  statePropertyNumber: string;
  status: string;
  Inserteridentity?: string;
  InserterCountry?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function exportStateVehiclesToPDF(stateVehicles: StateVehicle[], title = 'Rapport des véhicules d\'État') {
  const doc = new jsPDF();
  const date = new Date().toLocaleString('fr-FR');
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`Date d'export : ${date}`, 14, 26);
  
  const body = stateVehicles.map(v => [
    v.stateVehicleId,
    v.licensePlate,
    v.brand,
    v.model,
    v.year,
    v.mileage,
    v.ministry,
    v.department,
    v.service,
    v.budgetAllocation,
    v.statePropertyNumber,
    getStatusText(v.status),
    v.Inserteridentity || '',
    v.InserterCountry || '',
    formatDate(v.createdAt),
    formatDate(v.updatedAt)
  ]);

  autoTable(doc, {
    startY: 32,
    head: [[ 'ID', 'Plaque', 'Marque', 'Modèle', 'Année', 'Kilométrage', 'Ministère', 'Département', 'Service', 'Allocation budgétaire', 'Numéro de propriété', 'Statut', 'Inserter Identity', 'Inserter Country', 'Créé le', 'Mis à jour le' ]],
    body,
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    theme: 'grid',
  });

  doc.save(`${title.replace(/\s+/g, '_')}_${date.replace(/\s|:/g, '_')}.pdf`);
}

export function exportStateVehiclesToExcel(stateVehicles: StateVehicle[], title = 'Véhicules_État') {
  const wsData = [
    ['ID', 'Plaque', 'Marque', 'Modèle', 'Année', 'Kilométrage', 'Ministère', 'Département', 'Service', 'Allocation budgétaire', 'Numéro de propriété', 'Statut', 'Inserter Identity', 'Inserter Country', 'Créé le', 'Mis à jour le'],
    ...stateVehicles.map((v: StateVehicle) => [
      v.stateVehicleId,
      v.licensePlate,
      v.brand,
      v.model,
      v.year,
      v.mileage,
      v.ministry,
      v.department,
      v.service,
      v.budgetAllocation,
      v.statePropertyNumber,
      getStatusText(v.status),
      v.Inserteridentity || '',
      v.InserterCountry || '',
      formatDate(v.createdAt),
      formatDate(v.updatedAt)
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

export function exportStateVehiclesToCSV(stateVehicles: StateVehicle[], title = 'Véhicules_État') {
  const headers = ['ID', 'Plaque', 'Marque', 'Modèle', 'Année', 'Kilométrage', 'Ministère', 'Département', 'Service', 'Allocation budgétaire', 'Numéro de propriété', 'Statut', 'Inserter Identity', 'Inserter Country', 'Créé le', 'Mis à jour le'];
  const rows = stateVehicles.map(v => [
    v.stateVehicleId,
    v.licensePlate,
    v.brand,
    v.model,
    v.year,
    v.mileage,
    v.ministry,
    v.department,
    v.service,
    v.budgetAllocation,
    v.statePropertyNumber,
    getStatusText(v.status),
    v.Inserteridentity || '',
    v.InserterCountry || '',
    formatDate(v.createdAt),
    formatDate(v.updatedAt)
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

// VehicleExpense interface and export functions
export interface VehicleExpense {
  expenseId: number;
  date: string;
  nextDate?: string;
  code?: string;
  description: string;
  distance: number;
  amount: number;
  statut: string;
  devise?: string;
}

export function exportVehicleExpensesToPDF(expenses: VehicleExpense[], title = 'Rapport des dépenses véhicules') {
  const doc = new jsPDF();
  const date = new Date().toLocaleString('fr-FR');
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`Date d'export : ${date}`, 14, 26);
  
  const body = expenses.map(e => [
    e.expenseId,
    formatDate(e.date),
    formatDate(e.nextDate),
    e.code || '',
    e.description,
    e.distance,
    formatCurrency(e.amount, e.devise),
    getStatusText(e.statut),
    e.devise || ''
  ]);

  autoTable(doc, {
    startY: 32,
    head: [[ 'ID', 'Date', 'Prochaine date', 'Code', 'Description', 'Distance (km)', 'Montant', 'Statut', 'Devise' ]],
    body,
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    theme: 'grid',
  });

  doc.save(`${title.replace(/\s+/g, '_')}_${date.replace(/\s|:/g, '_')}.pdf`);
}

export function exportVehicleExpensesToExcel(expenses: VehicleExpense[], title = 'Dépenses_véhicules') {
  const wsData = [
    ['ID', 'Date', 'Prochaine date', 'Code', 'Description', 'Distance (km)', 'Montant', 'Statut', 'Devise'],
    ...expenses.map((e: VehicleExpense) => [
      e.expenseId,
      formatDate(e.date),
      formatDate(e.nextDate),
      e.code || '',
      e.description,
      e.distance,
      e.amount,
      getStatusText(e.statut),
      e.devise || ''
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

export function exportVehicleExpensesToCSV(expenses: VehicleExpense[], title = 'Dépenses_véhicules') {
  const headers = ['ID', 'Date', 'Prochaine date', 'Code', 'Description', 'Distance (km)', 'Montant', 'Statut', 'Devise'];
  const rows = expenses.map(e => [
    e.expenseId,
    formatDate(e.date),
    formatDate(e.nextDate),
    e.code || '',
    e.description,
    e.distance,
    e.amount,
    getStatusText(e.statut),
    e.devise || ''
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

// VehicleIntervention interface and export functions
export interface VehicleIntervention {
  interventionId: number;
  interventionDate: string;
  type: string;
  description: string;
  cost: number;
  technician: string;
  status: string;
  nextInterventionDate?: string;
  devise?: string;
}

export function exportVehicleInterventionsToPDF(interventions: VehicleIntervention[], title = 'Rapport des interventions véhicules') {
  const doc = new jsPDF();
  const date = new Date().toLocaleString('fr-FR');
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`Date d'export : ${date}`, 14, 26);
  
  const body = interventions.map(i => [
    i.interventionId,
    formatDate(i.interventionDate),
    getTypeText(i.type),
    i.description,
    formatCurrency(i.cost, i.devise),
    i.technician,
    getStatusText(i.status),
    formatDate(i.nextInterventionDate),
    i.devise || ''
  ]);

  autoTable(doc, {
    startY: 32,
    head: [[ 'ID', 'Date', 'Type', 'Description', 'Coût', 'Technicien', 'Statut', 'Prochaine intervention', 'Devise' ]],
    body,
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    theme: 'grid',
  });

  doc.save(`${title.replace(/\s+/g, '_')}_${date.replace(/\s|:/g, '_')}.pdf`);
}

export function exportVehicleInterventionsToExcel(interventions: VehicleIntervention[], title = 'Interventions_véhicules') {
  const wsData = [
    ['ID', 'Date', 'Type', 'Description', 'Coût', 'Technicien', 'Statut', 'Prochaine intervention', 'Devise'],
    ...interventions.map((i: VehicleIntervention) => [
      i.interventionId,
      formatDate(i.interventionDate),
      getTypeText(i.type),
      i.description,
      i.cost,
      i.technician,
      getStatusText(i.status),
      formatDate(i.nextInterventionDate),
      i.devise || ''
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

export function exportVehicleInterventionsToCSV(interventions: VehicleIntervention[], title = 'Interventions_véhicules') {
  const headers = ['ID', 'Date', 'Type', 'Description', 'Coût', 'Technicien', 'Statut', 'Prochaine intervention', 'Devise'];
  const rows = interventions.map(i => [
    i.interventionId,
    formatDate(i.interventionDate),
    getTypeText(i.type),
    i.description,
    i.cost,
    i.technician,
    getStatusText(i.status),
    formatDate(i.nextInterventionDate),
    i.devise || ''
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

// VehiclePiece interface and export functions
export interface VehiclePiece {
  pieceId: number;
  type: string;
  typeLibre?: string;
  description?: string;
  montant: number;
  dateDebut: string;
  dateFin: string;
  dateProchaine?: string;
}

export function exportVehiclePiecesToPDF(pieces: VehiclePiece[], title = 'Rapport des pièces véhicules') {
  const doc = new jsPDF();
  const date = new Date().toLocaleString('fr-FR');
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`Date d'export : ${date}`, 14, 26);
  
  const body = pieces.map(p => [
    p.pieceId,
    getTypeText(p.type),
    p.typeLibre || '',
    p.description || '',
    formatCurrency(p.montant),
    formatDate(p.dateDebut),
    formatDate(p.dateFin),
    formatDate(p.dateProchaine)
  ]);

  autoTable(doc, {
    startY: 32,
    head: [[ 'ID', 'Type', 'Type libre', 'Description', 'Montant', 'Date début', 'Date fin', 'Date prochaine' ]],
    body,
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    theme: 'grid',
  });

  doc.save(`${title.replace(/\s+/g, '_')}_${date.replace(/\s|:/g, '_')}.pdf`);
}

export function exportVehiclePiecesToExcel(pieces: VehiclePiece[], title = 'Pièces_véhicules') {
  const wsData = [
    ['ID', 'Type', 'Type libre', 'Description', 'Montant', 'Date début', 'Date fin', 'Date prochaine'],
    ...pieces.map((p: VehiclePiece) => [
      p.pieceId,
      getTypeText(p.type),
      p.typeLibre || '',
      p.description || '',
      p.montant,
      formatDate(p.dateDebut),
      formatDate(p.dateFin),
      formatDate(p.dateProchaine)
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

export function exportVehiclePiecesToCSV(pieces: VehiclePiece[], title = 'Pièces_véhicules') {
  const headers = ['ID', 'Type', 'Type libre', 'Description', 'Montant', 'Date début', 'Date fin', 'Date prochaine'];
  const rows = pieces.map(p => [
    p.pieceId,
    getTypeText(p.type),
    p.typeLibre || '',
    p.description || '',
    p.montant,
    formatDate(p.dateDebut),
    formatDate(p.dateFin),
    formatDate(p.dateProchaine)
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

// FuelManagement interface and export functions
export interface FuelManagement {
  fuelManagementId: number;
  date: string;
  typePaiement: string;
  distance: number;
  quantity: number;
  amount: number;
  prixLitre: number;
  station: string;
  fichierJoint?: string;
  devise?: string;
}

export function exportFuelManagementsToPDF(fuelManagements: FuelManagement[], title = 'Rapport des ravitaillements') {
  const doc = new jsPDF();
  const date = new Date().toLocaleString('fr-FR');
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`Date d'export : ${date}`, 14, 26);
  
  const body = fuelManagements.map(f => [
    f.fuelManagementId,
    formatDate(f.date),
    getPaymentText(f.typePaiement),
    f.distance,
    f.quantity,
    formatCurrency(f.amount, f.devise),
    formatCurrency(f.prixLitre, f.devise),
    f.station,
    f.devise || ''
  ]);

  autoTable(doc, {
    startY: 32,
    head: [[ 'ID', 'Date', 'Type de paiement', 'Distance (km)', 'Quantité (L)', 'Montant total', 'Prix par litre', 'Station', 'Devise' ]],
    body,
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    theme: 'grid',
  });

  doc.save(`${title.replace(/\s+/g, '_')}_${date.replace(/\s|:/g, '_')}.pdf`);
}

export function exportFuelManagementsToExcel(fuelManagements: FuelManagement[], title = 'Ravitaillements') {
  const wsData = [
    ['ID', 'Date', 'Type de paiement', 'Distance (km)', 'Quantité (L)', 'Montant total', 'Prix par litre', 'Station', 'Devise'],
    ...fuelManagements.map((f: FuelManagement) => [
      f.fuelManagementId,
      formatDate(f.date),
      getPaymentText(f.typePaiement),
      f.distance,
      f.quantity,
      f.amount,
      f.prixLitre,
      f.station,
      f.devise || ''
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

export function exportFuelManagementsToCSV(fuelManagements: FuelManagement[], title = 'Ravitaillements') {
  const headers = ['ID', 'Date', 'Type de paiement', 'Distance (km)', 'Quantité (L)', 'Montant total', 'Prix par litre', 'Station', 'Devise'];
  const rows = fuelManagements.map(f => [
    f.fuelManagementId,
    formatDate(f.date),
    getPaymentText(f.typePaiement),
    f.distance,
    f.quantity,
    f.amount,
    f.prixLitre,
    f.station,
    f.devise || ''
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

// VehicleReform interface and export functions
export interface VehicleReform {
  reformId: number;
  reformDate: string;
  reformReason: string;
  salePrice?: number;
  buyer?: string;
  buyerNumber?: string;
  disposalMethod: string;
  devise?: string;
}

export function exportVehicleReformsToPDF(reforms: VehicleReform[], title = 'Rapport des réformes véhicules') {
  const doc = new jsPDF();
  const date = new Date().toLocaleString('fr-FR');
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`Date d'export : ${date}`, 14, 26);
  
  const body = reforms.map(r => [
    r.reformId,
    formatDate(r.reformDate),
    r.reformReason,
    r.salePrice ? formatCurrency(r.salePrice, r.devise) : '',
    r.buyer || '',
    r.buyerNumber || '',
    getMethodText(r.disposalMethod),
    r.devise || ''
  ]);

  autoTable(doc, {
    startY: 32,
    head: [[ 'ID', 'Date de réforme', 'Raison de réforme', 'Prix de vente', 'Acheteur', 'Numéro acheteur', 'Méthode de disposition', 'Devise' ]],
    body,
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    theme: 'grid',
  });

  doc.save(`${title.replace(/\s+/g, '_')}_${date.replace(/\s|:/g, '_')}.pdf`);
}

export function exportVehicleReformsToExcel(reforms: VehicleReform[], title = 'Réformes_véhicules') {
  const wsData = [
    ['ID', 'Date de réforme', 'Raison de réforme', 'Prix de vente', 'Acheteur', 'Numéro acheteur', 'Méthode de disposition', 'Devise'],
    ...reforms.map((r: VehicleReform) => [
      r.reformId,
      formatDate(r.reformDate),
      r.reformReason,
      r.salePrice || '',
      r.buyer || '',
      r.buyerNumber || '',
      getMethodText(r.disposalMethod),
      r.devise || ''
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

export function exportVehicleReformsToCSV(reforms: VehicleReform[], title = 'Réformes_véhicules') {
  const headers = ['ID', 'Date de réforme', 'Raison de réforme', 'Prix de vente', 'Acheteur', 'Numéro acheteur', 'Méthode de disposition', 'Devise'];
  const rows = reforms.map(r => [
    r.reformId,
    formatDate(r.reformDate),
    r.reformReason,
    r.salePrice || '',
    r.buyer || '',
    r.buyerNumber || '',
    getMethodText(r.disposalMethod),
    r.devise || ''
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

// CardOperation interface and export functions
export interface CardOperation {
  operationId: number;
  operationDate: string;
  amount: number;
  description?: string;
  devise?: string;
}

export function exportCardOperationsToPDF(operations: CardOperation[], title = 'Rapport des opérations carte') {
  const doc = new jsPDF();
  const date = new Date().toLocaleString('fr-FR');
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`Date d'export : ${date}`, 14, 26);
  
  const body = operations.map(o => [
    o.operationId,
    formatDate(o.operationDate),
    formatCurrency(o.amount, o.devise),
    o.description || '',
    o.devise || ''
  ]);

  autoTable(doc, {
    startY: 32,
    head: [[ 'ID', 'Date d\'opération', 'Montant', 'Description', 'Devise' ]],
    body,
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    theme: 'grid',
  });

  doc.save(`${title.replace(/\s+/g, '_')}_${date.replace(/\s|:/g, '_')}.pdf`);
}

export function exportCardOperationsToExcel(operations: CardOperation[], title = 'Opérations_carte') {
  const wsData = [
    ['ID', 'Date d\'opération', 'Montant', 'Description', 'Devise'],
    ...operations.map((o: CardOperation) => [
      o.operationId,
      formatDate(o.operationDate),
      o.amount,
      o.description || '',
      o.devise || ''
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

export function exportCardOperationsToCSV(operations: CardOperation[], title = 'Opérations_carte') {
  const headers = ['ID', 'Date d\'opération', 'Montant', 'Description', 'Devise'];
  const rows = operations.map(o => [
    o.operationId,
    formatDate(o.operationDate),
    o.amount,
    o.description || '',
    o.devise || ''
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

// PaymentCard interface and export functions
export interface PaymentCard {
  cardId: number;
  numBadge: string;
  dateAchat: string;
  dateMiseEnService: string;
  typeBadge: string;
  typeBadgeLibre?: string;
  description?: string;
  montant: number;
  fichierJoint?: string;
  createdAt?: string;
  updatedAt?: string;
  devise?: string;
}

export function exportPaymentCardsToPDF(cards: PaymentCard[], title = 'Rapport des cartes de paiement') {
  const doc = new jsPDF();
  const date = new Date().toLocaleString('fr-FR');
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`Date d'export : ${date}`, 14, 26);
  
  const body = cards.map(c => [
    c.cardId,
    c.numBadge,
    formatDate(c.dateAchat),
    formatDate(c.dateMiseEnService),
    getTypeText(c.typeBadge),
    c.typeBadgeLibre || '',
    c.description || '',
    formatCurrency(c.montant, c.devise),
    c.devise || '',
    formatDate(c.createdAt),
    formatDate(c.updatedAt)
  ]);

  autoTable(doc, {
    startY: 32,
    head: [[ 'ID', 'Numéro badge', 'Date d\'achat', 'Date mise en service', 'Type badge', 'Type badge libre', 'Description', 'Montant', 'Devise', 'Créé le', 'Mis à jour le' ]],
    body,
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    theme: 'grid',
  });

  doc.save(`${title.replace(/\s+/g, '_')}_${date.replace(/\s|:/g, '_')}.pdf`);
}

export function exportPaymentCardsToExcel(cards: PaymentCard[], title = 'Cartes_paiement') {
  const wsData = [
    ['ID', 'Numéro badge', 'Date d\'achat', 'Date mise en service', 'Type badge', 'Type badge libre', 'Description', 'Montant', 'Devise', 'Créé le', 'Mis à jour le'],
    ...cards.map((c: PaymentCard) => [
      c.cardId,
      c.numBadge,
      formatDate(c.dateAchat),
      formatDate(c.dateMiseEnService),
      getTypeText(c.typeBadge),
      c.typeBadgeLibre || '',
      c.description || '',
      c.montant,
      c.devise || '',
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

export function exportPaymentCardsToCSV(cards: PaymentCard[], title = 'Cartes_paiement') {
  const headers = ['ID', 'Numéro badge', 'Date d\'achat', 'Date mise en service', 'Type badge', 'Type badge libre', 'Description', 'Montant', 'Devise', 'Créé le', 'Mis à jour le'];
  const rows = cards.map(c => [
    c.cardId,
    c.numBadge,
    formatDate(c.dateAchat),
    formatDate(c.dateMiseEnService),
    getTypeText(c.typeBadge),
    c.typeBadgeLibre || '',
    c.description || '',
    c.montant,
    c.devise || '',
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

// VehicleAuthorization interface and export functions
export interface VehicleAuthorization {
  authorizationId: number;
  authorizationNumber: string;
  issueDate: string;
  expiryDate: string;
  issuingAuthority: string;
  autorisationtype: string;
  purpose: string;
  status: string;
  Inserteridentity?: string;
  InserterCountry?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function exportVehicleAuthorizationsToPDF(authorizations: VehicleAuthorization[], title = 'Rapport des autorisations véhicules') {
  const doc = new jsPDF();
  const date = new Date().toLocaleString('fr-FR');
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`Date d'export : ${date}`, 14, 26);
  
  const body = authorizations.map(a => [
    a.authorizationId,
    a.authorizationNumber,
    formatDate(a.issueDate),
    formatDate(a.expiryDate),
    a.issuingAuthority,
    getTypeText(a.autorisationtype),
    a.purpose,
    getStatusText(a.status),
    a.Inserteridentity || '',
    a.InserterCountry || '',
    formatDate(a.createdAt),
    formatDate(a.updatedAt)
  ]);

  autoTable(doc, {
    startY: 32,
    head: [[ 'ID', 'Numéro', "Date d'émission", "Date d'expiration", 'Autorité émettrice', "Type d'autorisation", 'Objet', 'Statut', 'Inserter Identity', 'Inserter Country', 'Créé le', 'Mis à jour le' ]],
    body,
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    theme: 'grid',
  });

  doc.save(`${title.replace(/\s+/g, '_')}_${date.replace(/\s|:/g, '_')}.pdf`);
}

export function exportVehicleAuthorizationsToExcel(authorizations: VehicleAuthorization[], title = 'Autorisations_véhicules') {
  const wsData = [
    ['ID', 'Numéro', "Date d'émission", "Date d'expiration", 'Autorité émettrice', "Type d'autorisation", 'Objet', 'Statut', 'Inserter Identity', 'Inserter Country', 'Créé le', 'Mis à jour le'],
    ...authorizations.map((a: VehicleAuthorization) => [
      a.authorizationId,
      a.authorizationNumber,
      formatDate(a.issueDate),
      formatDate(a.expiryDate),
      a.issuingAuthority,
      getTypeText(a.autorisationtype),
      a.purpose,
      getStatusText(a.status),
      a.Inserteridentity || '',
      a.InserterCountry || '',
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

export function exportVehicleAuthorizationsToCSV(authorizations: VehicleAuthorization[], title = 'Autorisations_véhicules') {
  const headers = ['ID', 'Numéro', "Date d'émission", "Date d'expiration", 'Autorité émettrice', "Type d'autorisation", 'Objet', 'Statut', 'Inserter Identity', 'Inserter Country', 'Créé le', 'Mis à jour le'];
  const rows = authorizations.map(a => [
    a.authorizationId,
    a.authorizationNumber,
    formatDate(a.issueDate),
    formatDate(a.expiryDate),
    a.issuingAuthority,
    getTypeText(a.autorisationtype),
    a.purpose,
    getStatusText(a.status),
    a.Inserteridentity || '',
    a.InserterCountry || '',
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

// Garage interface and export functions
export interface Garage {
  garageId: number;
  name: string;
  address: string;
  phoneNumber: string;
  manager: string;
  capacity: number;
  type: string;
  Inserteridentity?: string;
  InserterCountry?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function exportGaragesToPDF(garages: Garage[], title = 'Rapport des garages') {
  const doc = new jsPDF();
  const date = new Date().toLocaleString('fr-FR');
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`Date d'export : ${date}`, 14, 26);
  
  const body = garages.map(g => [
    g.garageId,
    g.name,
    g.address,
    g.phoneNumber,
    g.manager,
    g.capacity,
    getTypeText(g.type),
    g.Inserteridentity || '',
    g.InserterCountry || '',
    formatDate(g.createdAt),
    formatDate(g.updatedAt)
  ]);

  autoTable(doc, {
    startY: 32,
    head: [[ 'ID', 'Nom', 'Adresse', 'Téléphone', 'Responsable', 'Capacité', 'Type', 'Inserter Identity', 'Inserter Country', 'Créé le', 'Mis à jour le' ]],
    body,
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    theme: 'grid',
  });

  doc.save(`${title.replace(/\s+/g, '_')}_${date.replace(/\s|:/g, '_')}.pdf`);
}

export function exportGaragesToExcel(garages: Garage[], title = 'Garages') {
  const wsData = [
    ['ID', 'Nom', 'Adresse', 'Téléphone', 'Responsable', 'Capacité', 'Type', 'Inserter Identity', 'Inserter Country', 'Créé le', 'Mis à jour le'],
    ...garages.map((g: Garage) => [
      g.garageId,
      g.name,
      g.address,
      g.phoneNumber,
      g.manager,
      g.capacity,
      getTypeText(g.type),
      g.Inserteridentity || '',
      g.InserterCountry || '',
      formatDate(g.createdAt),
      formatDate(g.updatedAt)
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

export function exportGaragesToCSV(garages: Garage[], title = 'Garages') {
  const headers = ['ID', 'Nom', 'Adresse', 'Téléphone', 'Responsable', 'Capacité', 'Type', 'Inserter Identity', 'Inserter Country', 'Créé le', 'Mis à jour le'];
  const rows = garages.map(g => [
    g.garageId,
    g.name,
    g.address,
    g.phoneNumber,
    g.manager,
    g.capacity,
    getTypeText(g.type),
    g.Inserteridentity || '',
    g.InserterCountry || '',
    formatDate(g.createdAt),
    formatDate(g.updatedAt)
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

// Contentieux interface and export functions
export interface Contentieux {
  contentieuxId: number;
  incidentDate: string;
  description: string;
  faultAttribution: string;
  status: string;
  resolutionDate?: string;
  conclusion?: string;
  Inserteridentity?: string;
  InserterCountry?: string;
  createdAt?: string;
  updatedAt?: string;
}

export function exportContentieuxToPDF(contentieux: Contentieux[], title = 'Rapport des contentieux') {
  const doc = new jsPDF();
  const date = new Date().toLocaleString('fr-FR');
  doc.setFontSize(16);
  doc.text(title, 14, 18);
  doc.setFontSize(10);
  doc.text(`Date d'export : ${date}`, 14, 26);
  
  const body = contentieux.map(c => [
    c.contentieuxId,
    formatDate(c.incidentDate),
    c.description,
    getFaultText(c.faultAttribution),
    getStatusText(c.status),
    formatDate(c.resolutionDate),
    c.conclusion || '',
    c.Inserteridentity || '',
    c.InserterCountry || '',
    formatDate(c.createdAt),
    formatDate(c.updatedAt)
  ]);

  autoTable(doc, {
    startY: 32,
    head: [[ 'ID', 'Date d\'incident', 'Description', 'Attribution de la faute', 'Statut', 'Date de résolution', 'Conclusion', 'Inserter Identity', 'Inserter Country', 'Créé le', 'Mis à jour le' ]],
    body,
    styles: { font: 'helvetica', fontSize: 9 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' },
    theme: 'grid',
  });

  doc.save(`${title.replace(/\s+/g, '_')}_${date.replace(/\s|:/g, '_')}.pdf`);
}

export function exportContentieuxToExcel(contentieux: Contentieux[], title = 'Contentieux') {
  const wsData = [
    ['ID', 'Date d\'incident', 'Description', 'Attribution de la faute', 'Statut', 'Date de résolution', 'Conclusion', 'Inserter Identity', 'Inserter Country', 'Créé le', 'Mis à jour le'],
    ...contentieux.map((c: Contentieux) => [
      c.contentieuxId,
      formatDate(c.incidentDate),
      c.description,
      getFaultText(c.faultAttribution),
      getStatusText(c.status),
      formatDate(c.resolutionDate),
      c.conclusion || '',
      c.Inserteridentity || '',
      c.InserterCountry || '',
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

export function exportContentieuxToCSV(contentieux: Contentieux[], title = 'Contentieux') {
  const headers = ['ID', 'Date d\'incident', 'Description', 'Attribution de la faute', 'Statut', 'Date de résolution', 'Conclusion', 'Inserter Identity', 'Inserter Country', 'Créé le', 'Mis à jour le'];
  const rows = contentieux.map(c => [
    c.contentieuxId,
    formatDate(c.incidentDate),
    c.description,
    getFaultText(c.faultAttribution),
    getStatusText(c.status),
    formatDate(c.resolutionDate),
    c.conclusion || '',
    c.Inserteridentity || '',
    c.InserterCountry || '',
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

// Helper functions
function getFaultText(fault: string) {
  switch (fault) {
    case 'STATE': return 'État';
    case 'HOLDER': return 'Détenteur';
    case 'UNDETERMINED': return 'Indéterminé';
    default: return fault;
  }
}

function getMethodText(method: string) {
  switch (method) {
    case 'SALE': return 'Vente';
    case 'DESTRUCTION': return 'Destruction';
    case 'DONATION': return 'Don';
    default: return method;
  }
}

function getStatusText(status: string) {
  switch (status) {
    case 'AVAILABLE': return 'Disponible';
    case 'IN_USE': return 'En service';
    case 'UNDER_MAINTENANCE': return 'Maintenance';
    case 'OUT_OF_SERVICE': return 'Hors service';
    default: return status;
  }
}

function getFuelTypeText(fuelType: string) {
  switch (fuelType) {
    case 'GASOLINE': return 'Essence';
    case 'DIESEL': return 'Diesel';
    case 'ELECTRIC': return 'Électrique';
    case 'HYBRID': return 'Hybride';
    default: return fuelType;
  }
}

function getTypeText(type: string = '') {
  switch (type) {
    case 'CAR': return 'Voiture';
    case 'TRUCK': return 'Camion';
    case 'VAN': return 'Fourgon';
    case 'MOTORCYCLE': return 'Moto';
    default: return type;
  }
}

function getCountryText(country: string = '') {
  switch (country) {
    case 'IVORY_COAST': return 'Côte d\'Ivoire';
    case 'GHANA': return 'Ghana';
    case 'BENIN': return 'Bénin';
    case 'CAMEROON': return 'Cameroun';
    case 'TOGO': return 'Togo';
    case 'ROMANIE': return 'Romanie';
    case 'ITALIE': return 'Italie';
    default: return country;
  }
}

function getPaymentText(typePaiement: string) {
  switch (typePaiement) {
    case 'ESPÈCES': return 'Espèces';
    case 'CARTE_BANCAIRE': return 'Carte bancaire';
    case 'VIREMENT': return 'Virement';
    case 'AUTRE': return 'Autre';
    default: return typePaiement;
  }
}

function formatDate(dateString?: string) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('fr-FR');
}

function formatCurrency(amount: number, devise?: string) {
  if (!devise) return amount.toLocaleString('fr-FR');
  return `${amount.toLocaleString('fr-FR')} ${devise}`;
}
