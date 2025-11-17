
import React from 'react';
import { Link } from 'react-router-dom';
import { CustomerData } from '../types';
import { ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';
import { SortableCustomerKeys } from '../pages/Customers';

interface CustomerListProps {
  customers: CustomerData[];
  onDelete: (id: string) => void;
  requestSort: (key: SortableCustomerKeys) => void;
  sortConfig: { key: SortableCustomerKeys; direction: 'ascending' | 'descending' } | null;
}

const SortableHeader: React.FC<{
    sortKey: SortableCustomerKeys;
    title: string;
    requestSort: (key: SortableCustomerKeys) => void;
    sortConfig: CustomerListProps['sortConfig'];
    className?: string;
}> = ({ sortKey, title, requestSort, sortConfig, className = '' }) => {
    const isSorted = sortConfig?.key === sortKey;
    const direction = sortConfig?.direction;

    const Icon = isSorted
        ? (direction === 'ascending' ? ArrowUp : ArrowDown)
        : ChevronsUpDown;

    return (
        <th className={`px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider ${className}`}>
            <button onClick={() => requestSort(sortKey)} className="flex items-center gap-2 hover:text-white transition-colors">
                {title}
                <Icon size={14} className={isSorted ? 'text-white' : 'text-gray-500'}/>
            </button>
        </th>
    );
};

const CustomerList: React.FC<CustomerListProps> = ({ customers, onDelete, requestSort, sortConfig }) => {
  if (customers.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-800 rounded-lg">
        <p className="text-gray-400">Keine Kunden für Ihre Suche gefunden.</p>
        <Link to="/customer/new" className="mt-4 inline-block bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300">
          Ersten Kunden anlegen
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full">
        <thead className="bg-gray-700">
          <tr>
            <SortableHeader sortKey="name" title="Name" requestSort={requestSort} sortConfig={sortConfig} />
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Adresse</th>
            <SortableHeader sortKey="city" title="Ort" requestSort={requestSort} sortConfig={sortConfig} />
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Aktionen</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {customers.map(customer => (
            <tr key={customer.id} className="hover:bg-gray-700/50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{customer.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                {customer.street} {customer.houseNr}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                {customer.zip} {customer.city}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <Link to={`/customer/edit/${customer.id}`} className="text-emerald-400 hover:text-emerald-300 p-2 rounded-lg hover:bg-emerald-500/20">
                  Bearbeiten
                </Link>
                <button onClick={() => onDelete(customer.id)} className="text-red-500 hover:text-red-400 p-2 rounded-lg hover:bg-red-500/20">
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

export default CustomerList;