import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  exportBankTransactionsToExcel,
  exportBankTransactionsToPDF,
  exportBankTransactionsToCSV,
  BankTransaction
} from '../../../utils/exportBankTransactionUtils';

interface ExportBankTransactionDropdownProps {
  transactions: BankTransaction[];
  filters?: {
    dateFrom?: string;
    dateTo?: string;
  };
}

const MONTHS = [
  'Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'
];

const ExportBankTransactionDropdown: React.FC<ExportBankTransactionDropdownProps> = ({ transactions, filters }) => {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<string>(''); // '' = any
  const [year, setYear] = useState<string>('');
  const ref = useRef<HTMLDivElement | null>(null);

  // Extraire les mois et années disponibles dans les transactions
  const months = useMemo(() => {
    const ms = new Set<string>();
    transactions.forEach(t => {
      const d = new Date(t.date);
      ms.add((d.getMonth() + 1).toString().padStart(2, '0'));
    });
    return Array.from(ms);
  }, [transactions]);

  const years = useMemo(() => {
    const ys = new Set<string>();
    transactions.forEach(t => {
      const d = new Date(t.date);
      ys.add(d.getFullYear().toString());
    });
    return Array.from(ys);
  }, [transactions]);

  // Filtrer les transactions selon le mois et l'année sélectionnés
  const filtered = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.date);
      const m = (d.getMonth() + 1).toString().padStart(2, '0');
      const y = d.getFullYear().toString();
      return (!month || m === month) && (!year || y === year);
    });
  }, [transactions, filters, month, year]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [open]);

  const handleExport = (type: 'pdf' | 'excel' | 'csv') => {
    if (!filtered || filtered.length === 0) return;
    if (type === 'pdf') exportBankTransactionsToPDF(filtered);
    if (type === 'excel') exportBankTransactionsToExcel(filtered);
    if (type === 'csv') exportBankTransactionsToCSV(filtered);
    setOpen(false);
  };

  return (
    <div className="relative inline-block text-left" ref={ref}>
      <button
        type="button"
        className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-3 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
        onClick={() => setOpen((o) => !o)}
        title="Télécharger les transactions"
        aria-haspopup="true"
        aria-expanded={open}
      >
        Télécharger ▼
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-md shadow-lg z-20" style={{ minWidth: '220px' }}>
          <div className="p-3 border-b border-gray-100 flex items-center gap-2">
            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="w-1/2 rounded-md border border-gray-300 px-2 py-1 text-sm"
            >
              <option value="">Mois</option>
              {MONTHS.map((m, idx) => (
                <option key={m} value={idx.toString()}>{m}</option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="w-1/2 rounded-md border border-gray-300 px-2 py-1 text-sm"
            >
              <option value="">Année</option>
              {years.map(y => (
                <option key={y} value={y.toString()}>{y}</option>
              ))}
            </select>
          </div>

          <button className="block w-full text-left px-4 py-2 hover:bg-gray-50" onClick={() => handleExport('pdf')}>
            PDF
          </button>
          <button className="block w-full text-left px-4 py-2 hover:bg-gray-50" onClick={() => handleExport('excel')}>
            Excel
          </button>
          <button className="block w-full text-left px-4 py-2 hover:bg-gray-50" onClick={() => handleExport('csv')}>
            CSV
          </button>
        </div>
      )}
    </div>
  );
};

export default ExportBankTransactionDropdown;
