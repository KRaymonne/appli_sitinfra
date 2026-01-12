import React from 'react';
import { exportSanctionsToPDF, exportSanctionsToExcel, exportSanctionsToCSV, Sanction } from '../../../utils/exportPersonnelUtils';

interface ExportSanctionDropdownProps {
  sanctions: Sanction[];
}

const ExportSanctionDropdown: React.FC<ExportSanctionDropdownProps> = ({ sanctions }) => {
  const [open, setOpen] = React.useState(false);
  const [selectedMonth, setSelectedMonth] = React.useState<string>('');
  const [selectedYear, setSelectedYear] = React.useState<string>('');

  // Extraire les mois et années disponibles dans les sanctions
  const months = React.useMemo(() => {
    const ms = new Set<string>();
    sanctions.forEach(s => {
      const d = new Date(s.sanctionDate);
      ms.add((d.getMonth() + 1).toString().padStart(2, '0'));
    });
    return Array.from(ms);
  }, [sanctions]);
  
  const years = React.useMemo(() => {
    const ys = new Set<string>();
    sanctions.forEach(s => {
      const d = new Date(s.sanctionDate);
      ys.add(d.getFullYear().toString());
    });
    return Array.from(ys);
  }, [sanctions]);

  // Filtrer les sanctions selon le mois et l'année sélectionnés
  const filtered = React.useMemo(() => {
    return sanctions.filter(s => {
      const d = new Date(s.sanctionDate);
      const m = (d.getMonth() + 1).toString().padStart(2, '0');
      const y = d.getFullYear().toString();
      return (!selectedMonth || m === selectedMonth) && (!selectedYear || y === selectedYear);
    });
  }, [sanctions, selectedMonth, selectedYear]);

  const handleExport = (type: 'pdf' | 'excel' | 'csv') => {
    if (!filtered || filtered.length === 0) return;
    if (type === 'pdf') exportSanctionsToPDF(filtered);
    if (type === 'excel') exportSanctionsToExcel(filtered);
    if (type === 'csv') exportSanctionsToCSV(filtered);
    setOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
        onClick={() => setOpen((o) => !o)}
        title="Télécharger les sanctions"
      >
        Télécharger ▼
      </button>
      {open && (
        <div className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-2 px-3 border-b border-gray-100 flex gap-2">
            <select value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="border rounded px-2 py-1 text-sm">
              <option value="">Mois</option>
              {months.sort().map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} className="border rounded px-2 py-1 text-sm">
              <option value="">Année</option>
              {years.sort().map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="py-1">
            <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onClick={() => handleExport('pdf')}>PDF</button>
            <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onClick={() => handleExport('excel')}>Excel</button>
            <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100" onClick={() => handleExport('csv')}>CSV</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExportSanctionDropdown;