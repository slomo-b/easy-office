
import React from 'react';
import { Link } from 'react-router-dom';
import { InvoiceData } from '../types';
import { ArrowUp, ArrowDown, ChevronsUpDown, CheckCircle, CircleDollarSign } from 'lucide-react';
import { SortableInvoiceKeys } from '../pages/Dashboard';

interface InvoiceListProps {
  invoices: InvoiceData[];
  onDelete: (id: string) => void;
  onStatusToggle: (id: string) => void;
  requestSort: (key: SortableInvoiceKeys) => void;
  sortConfig: { key: SortableInvoiceKeys; direction: 'ascending' | 'descending' } | null;
}

const SortableHeader: React.FC<{
    sortKey: SortableInvoiceKeys;
    title: string;
    requestSort: (key: SortableInvoiceKeys) => void;
    sortConfig: InvoiceListProps['sortConfig'];
    className?: string;
}> = ({ sortKey, title, requestSort, sortConfig, className = '' }) => {
    const isSorted = sortConfig?.key === sortKey;
    const direction = sortConfig?.direction;
    const Icon = isSorted ? (direction === 'ascending' ? ArrowUp : ArrowDown) : ChevronsUpDown;

    return (
        <th className={`px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider ${className}`}>
            <button onClick={() => requestSort(sortKey)} className="flex items-center gap-2 hover:text-white transition-colors">
                {title}
                <Icon size={14} className={isSorted ? 'text-white' : 'text-gray-500'}/>
            </button>
        </th>
    );
};


const InvoiceList: React.FC<InvoiceListProps> = ({ invoices, onDelete, onStatusToggle, requestSort, sortConfig }) => {
  if (invoices.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-800 rounded-lg">
        <p className="text-gray-400">Keine Rechnungen gefunden.</p>
        <Link to="/invoice/new" className="mt-4 inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
          Erste Rechnung erstellen
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full">
        <thead className="bg-gray-700">
          <tr>
            <SortableHeader sortKey="status" title="Status" requestSort={requestSort} sortConfig={sortConfig} />
            <SortableHeader sortKey="createdAt" title="Datum" requestSort={requestSort} sortConfig={sortConfig} />
            <SortableHeader sortKey="debtorName" title="Debitor" requestSort={requestSort} sortConfig={sortConfig} />
            <SortableHeader sortKey="total" title="Betrag" requestSort={requestSort} sortConfig={sortConfig} />
            <SortableHeader sortKey="unstructuredMessage" title="Referenz" requestSort={requestSort} sortConfig={sortConfig} />
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Aktionen</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {invoices.map(invoice => {
            const isPaid = invoice.status === 'paid';
            return (
            <tr key={invoice.id} className={`hover:bg-gray-700/50 transition-opacity ${isPaid ? 'opacity-60' : ''}`}>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {isPaid 
                    ? <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-300">Bezahlt</span>
                    : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300">Offen</span>
                }
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                  <div className="flex flex-col">
                      <span>{new Date(invoice.createdAt).toLocaleDateString('de-CH')}</span>
                      {invoice.paidAt && <span className="text-xs text-gray-500">Bezahlt: {new Date(invoice.paidAt).toLocaleDateString('de-CH')}</span>}
                  </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{invoice.debtorName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-mono">{invoice.currency} {Number(invoice.total).toFixed(2)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">{invoice.unstructuredMessage}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <button 
                  onClick={() => onStatusToggle(invoice.id)} 
                  className={`p-2 rounded-lg transition-colors ${isPaid ? 'text-yellow-400 hover:bg-yellow-500/20' : 'text-green-400 hover:bg-green-500/20'}`}
                  title={isPaid ? 'Als offen markieren' : 'Als bezahlt markieren'}
                >
                  {isPaid ? <CircleDollarSign size={16} /> : <CheckCircle size={16} />}
                </button>
                <Link to={`/invoice/edit/${invoice.id}`} className="text-emerald-400 hover:text-emerald-300 p-2 rounded-lg hover:bg-emerald-500/20">
                  Bearbeiten
                </Link>
                <button onClick={() => onDelete(invoice.id)} className="text-red-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/20">
                  Löschen
                </button>
              </td>
            </tr>
          )})}
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceList;