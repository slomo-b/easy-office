import React from 'react';
import { Link } from 'react-router-dom';
import { InvoiceData } from '../types';

interface InvoiceListProps {
  invoices: InvoiceData[];
  onDelete: (id: string) => void;
}

const InvoiceList: React.FC<InvoiceListProps> = ({ invoices, onDelete }) => {
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
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Debitor</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Betrag</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Referenz</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Aktionen</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {invoices.map(invoice => (
            <tr key={invoice.id} className="hover:bg-gray-700/50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{invoice.debtorName}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{invoice.currency} {Number(invoice.amount).toFixed(2)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-mono">{invoice.reference}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <Link to={`/invoice/edit/${invoice.id}`} className="text-emerald-400 hover:text-emerald-300 mr-4">
                  Bearbeiten
                </Link>
                <button onClick={() => onDelete(invoice.id)} className="text-red-500 hover:text-red-400">
                  Löschen
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default InvoiceList;
