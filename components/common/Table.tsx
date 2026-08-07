import React from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  className?: string;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T) => string;
  emptyMessage?: string;
  className?: string;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = 'No data available',
  className = '',
}: TableProps<T>) {
  return (
    <div className={`w-full overflow-x-auto border border-white/10 rounded-sm ${className}`}>
      <table className="w-full text-left font-mono text-xs">
        <thead>
          <tr className="bg-white/5 border-b border-white/10 text-[10px] text-gray-400 uppercase tracking-wider">
            {columns.map((col) => (
              <th key={col.key} className={`py-2.5 px-4 font-bold ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5 text-gray-300">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-6 text-center text-gray-500 text-xs">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={keyExtractor(row)} className="hover:bg-white/[0.02] transition-colors">
                {columns.map((col) => (
                  <td key={col.key} className={`py-2.5 px-4 ${col.className || ''}`}>
                    {col.render ? col.render(row) : (row as any)[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Table;
