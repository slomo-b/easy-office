import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { CustomerData } from '../types';
import { getCustomers, deleteCustomer } from '../services/customerService';
import CustomerList from '../components/CustomerList';
import { Search } from 'lucide-react';

export type SortableCustomerKeys = keyof Pick<CustomerData, 'name' | 'city'>;

const Customers = () => {
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortableCustomerKeys; direction: 'ascending' | 'descending' } | null>({
    key: 'name',
    direction: 'ascending',
  });

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    const fetchedCustomers = await getCustomers();
    setCustomers(fetchedCustomers);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Sind Sie sicher, dass Sie diesen Kunden löschen möchten? Alle zugehörigen Projekte und Rechnungen bleiben erhalten, sind aber nicht mehr verknüpft.')) {
      await deleteCustomer(id);
      await loadCustomers();
    }
  };

  const requestSort = (key: SortableCustomerKeys) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedCustomers = useMemo(() => {
    let processableCustomers = [...customers];

    if (searchQuery) {
      const lowercasedQuery = searchQuery.toLowerCase();
      processableCustomers = processableCustomers.filter(customer =>
        Object.values(customer).some(value =>
          String(value).toLowerCase().includes(lowercasedQuery)
        )
      );
    }

    if (sortConfig !== null) {
      processableCustomers.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }

    return processableCustomers;
  }, [customers, searchQuery, sortConfig]);

  if (loading) {
    return <div className="text-center p-10">Lade Kunden...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Kunden</h2>
        <Link to="/customer/new" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
          Neuen Kunden anlegen
        </Link>
      </div>

      <div className="mb-4">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-5 w-5 text-gray-400" />
          </span>
          <input
            type="text"
            placeholder="Kunden durchsuchen..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full max-w-sm bg-gray-700 border border-gray-600 rounded-md pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
          />
        </div>
      </div>

      <CustomerList
        customers={filteredAndSortedCustomers}
        onDelete={handleDelete}
        requestSort={requestSort}
        sortConfig={sortConfig}
      />
    </div>
  );
};

export default Customers;
