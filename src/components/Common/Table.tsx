import React from 'react';

interface Column<T> {
  key: keyof T | string;
  title: string;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  width?: string;
}

interface TableProps<T> {
  data: (T & { id?: string })[];
  columns: Column<T>[];
  onRowClick?: (record: T) => void;
}

export function Table<T extends { id?: string }>({ data, columns, onRowClick }: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                style={{ width: column.width }}
              >
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((record, rowIndex) => {
            // Utilise _id si présent, sinon id
            const rowKey = (record as any)._id || record.id;
            return (
              <tr
                key={rowKey}
                className={`${onRowClick ? 'cursor-pointer hover:bg-gray-50' : ''} transition-colors`}
                onClick={() => onRowClick?.(record)}
              >
                {columns.map((column, colIndex) => {
                  const keyStr = String(column.key);
                  const value = keyStr.includes('.') 
                    ? keyStr.split('.').reduce((obj: any, key: any) => obj?.[key], record as any)
                    : (record as any)[keyStr];
                  // Utilise une clé unique pour chaque cellule : colonne + ligne
                  const cellKey = `${rowKey}-${keyStr}`;
                  return (
                    <td key={cellKey} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {column.render ? column.render(value, record, rowIndex) : value}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}