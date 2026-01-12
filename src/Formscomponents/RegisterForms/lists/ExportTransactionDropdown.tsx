import React from 'react';
import { exportTransactionsToPDF, exportTransactionsToExcel, exportTransactionsToCSV, Transaction } from '../../../utils/exportRegisterUtils';

interface ExportTransactionDropdownProps {
  transactions: Transaction[];
}

const ExportTransactionDropdown: React.FC<ExportTransactionDropdownProps> = ({ transactions }) => {
  const [open, setOpen] = React.useState(false);
  const [selectedMonth, setSelectedMonth] = React.useState<string>('');
  const [selectedYear, setSelectedYear] = React.useState<string>('');

  // Extraire les mois et années disponibles dans les transactions
  const months = React.useMemo(() => {
    const ms = new Set<string>();
    transactions.forEach(t => {
      const d = new Date(t.transactionDate);
      ms.add((d.getMonth() + 1).toString().padStart(2, '0'));
    });
    return Array.from(ms);
  }, [transactions]);
  
  const years = React.useMemo(() => {
    const ys = new Set<string>();
    transactions.forEach(t => {
      const d = new Date(t.transactionDate);
      ys.add(d.getFullYear().toString());
    });
    return Array.from(ys);
  }, [transactions]);

  // Filtrer les transactions selon le mois et l'année sélectionnés
  const filtered = React.useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.transactionDate);
      const m = (d.getMonth() + 1).toString().padStart(2, '0');
      const y = d.getFullYear().toString();
      return (!selectedMonth || m === selectedMonth) && (!selectedYear || y === selectedYear);
    });
  }, [transactions, selectedMonth, selectedYear]);

  const handleExport = (type: 'pdf' | 'excel' | 'csv') => {
    if (!filtered || filtered.length === 0) return;
    if (type === 'pdf') exportTransactionsToPDF(filtered);
    if (type === 'excel') exportTransactionsToExcel(filtered);
    if (type === 'csv') exportTransactionsToCSV(filtered);
    setOpen(false);
  };

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
        onClick={() => setOpen((o) => !o)}
        title="Télécharger les transactions"
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

export default ExportTransactionDropdown;