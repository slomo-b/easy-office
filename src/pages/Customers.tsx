import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Input, Button, Spinner } from '@heroui/react';
import { CustomerData } from '../types';
import { getCustomers, deleteCustomer } from '../services/customerService';
import CustomerList from '../components/CustomerList';
import { Search, Plus } from 'lucide-react';

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
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-bold text-foreground mb-2">Kunden</h2>
          <p className="text-default-500">Verwalte deine Kunden und Kontakte</p>
        </div>
        <Button
          as={Link}
          to="/customer/new"
          color="primary"
          size="lg"
          startContent={<Plus className="h-5 w-5" />}
        >
          Neuen Kunden anlegen
        </Button>
      </div>

      <div className="max-w-sm">
        <Input
          type="text"
          placeholder="Kunden durchsuchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          startContent={<Search className="h-4 w-4 text-default-400" />}
          variant="bordered"
        />
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
