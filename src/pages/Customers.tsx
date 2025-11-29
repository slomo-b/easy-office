import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Input, Button } from '@heroui/react';
import { CustomerData } from '../types';
import { getCustomers, deleteCustomer } from '../services/customerService';
import CustomerList from '../components/CustomerList';
import { Search, Plus, Users } from 'lucide-react';

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
      <div className="space-y-8">
        {/* Header Skeleton */}
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#1E2A36] rounded-xl animate-pulse" />
            <div className="space-y-2">
              <div className="h-10 w-64 bg-[#16232B] rounded-xl animate-pulse" />
              <div className="h-5 w-80 bg-[#64748B]/30 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>

        {/* Controls Skeleton */}
        <div className="space-y-4">
          <div className="h-12 w-full bg-[#16232B] rounded-xl animate-pulse" />
        </div>

        {/* Content Skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 w-full bg-[#16232B] rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header with Title and Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#00E5FF]/20 to-[#34F0B1]/10 border border-[#1E2A36]">
            <Users className="h-8 w-8 text-[#00E5FF]" />
          </div>
          <div>
            <h1 className="text-4xl font-bold mb-1" style={{
                background: 'linear-gradient(135deg, #E2E8F0 0%, #94A3B8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                lineHeight: '1.1',
                display: 'inline-block',
                paddingBottom: '2px'
            }}>
              Kunden
            </h1>
          </div>
        </div>

        <Button
          as={Link}
          to="/customer/new"
          className="bg-gradient-to-r from-[#00E5FF] to-[#34F0B1] text-white shadow-lg shadow-[#00E5FF]/25 hover:shadow-xl hover:shadow-[#00E5FF]/30 self-start sm:self-center"
          radius="lg"
          size="lg"
          startContent={<Plus className="h-5 w-5" />}
        >
          Neuen Kunden anlegen
        </Button>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-[#00E5FF]/30 to-transparent mb-8" />

      {/* Enhanced Search Controls */}
      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        {/* Search Input Container */}
        <div className="flex-1 relative min-w-0 bg-[#16232B] border border-[#1E2A36] rounded-2xl shadow-xl h-full">
          <div className="relative group h-full">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00E5FF] to-[#34F0B1] rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm" />
            <Input
              label=" "
              placeholder="Kunden durchsuchen..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={
                <div className="flex items-center justify-center h-6 w-6 my-auto">
                  <Search className="h-4 w-4 text-[#94A3B8] group-hover:text-[#E2E8F0] transition-colors duration-300" />
                </div>
              }
              className="w-full"
              classNames={{
                input: "bg-[#16232B] border-[#1E2A36] text-[#E2E8F0] placeholder:text-[#64748B] h-[42px] py-0",
                inputWrapper: "bg-[#16232B] border-2 border-[#1E2A36] hover:border-[#00E5FF]/40 focus:border-[#00E5FF] hover:shadow-lg hover:shadow-[#00E5FF]/10 focus:shadow-none transition-all duration-300 rounded-[16px] h-[52px] py-0",
                label: "text-[#94A3B8]",
                base: "relative h-[52px]",
                innerWrapper: "items-center h-[42px]"
              }}
            />

            {/* Search Results Indicator */}
            {searchQuery && (
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-[#00E5FF] to-[#34F0B1] text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                {filteredAndSortedCustomers.length}
              </div>
            )}
          </div>
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
