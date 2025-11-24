import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Input, Button, Tabs, Tab, Spinner } from '@heroui/react';
import { InvoiceData } from '../types';
import { getInvoices, deleteInvoice, saveInvoice } from '../services/invoiceService';
import InvoiceList from '../components/InvoiceList';
import { Search, Plus } from 'lucide-react';

// Define a type for sortable keys to ensure type safety
export type SortableInvoiceKeys = keyof Pick<InvoiceData, 'debtorName' | 'projectName' | 'unstructuredMessage' | 'total' | 'createdAt' | 'status'>;

const Invoices = () => {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'paid'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: SortableInvoiceKeys; direction: 'ascending' | 'descending' } | null>({
      key: 'createdAt',
      direction: 'descending'
  });

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    const fetchedInvoices = await getInvoices();
    setInvoices(fetchedInvoices);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Sind Sie sicher, dass Sie diese Rechnung löschen möchten?')) {
      await deleteInvoice(id);
      await loadInvoices();
    }
  };

  const handleStatusToggle = async (invoiceId: string) => {
    const invoice = invoices.find(inv => inv.id === invoiceId);
    if (invoice) {
      const isPaid = invoice.status === 'paid';
      const updatedInvoice: InvoiceData = {
        ...invoice,
        status: isPaid ? 'open' : 'paid',
        paidAt: isPaid ? null : new Date().toISOString(),
      };
      await saveInvoice(updatedInvoice);
      await loadInvoices(); // Reload to reflect changes
    }
  };
  
  const requestSort = (key: SortableInvoiceKeys) => {
      let direction: 'ascending' | 'descending' = 'ascending';
      if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
          direction = 'descending';
      }
      setSortConfig({ key, direction });
  };

  const filteredAndSortedInvoices = useMemo(() => {
      let processableInvoices = [...invoices];
      
      // Status filtering
      if (statusFilter !== 'all') {
          processableInvoices = processableInvoices.filter(invoice => invoice.status === statusFilter);
      }

      // Search filtering
      if (searchQuery) {
          const lowercasedQuery = searchQuery.toLowerCase();
          processableInvoices = processableInvoices.filter(invoice => 
              invoice.debtorName.toLowerCase().includes(lowercasedQuery) ||
              (invoice.projectName || '').toLowerCase().includes(lowercasedQuery) ||
              invoice.unstructuredMessage.toLowerCase().includes(lowercasedQuery) ||
              invoice.items.some(item => item.description.toLowerCase().includes(lowercasedQuery))
          );
      }

      // Sorting logic
      if (sortConfig !== null) {
          processableInvoices.sort((a, b) => {
              const aValue = a[sortConfig.key];
              const bValue = b[sortConfig.key];

              if (aValue === null || aValue === undefined) return 1;
              if (bValue === null || bValue === undefined) return -1;
              
              if (sortConfig.key === 'createdAt') {
                return sortConfig.direction === 'ascending'
                  ? new Date(aValue as string).getTime() - new Date(bValue as string).getTime()
                  : new Date(bValue as string).getTime() - new Date(aValue as string).getTime();
              }

              if (typeof aValue === 'number' && typeof bValue === 'number') {
                  if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                  if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
              } else {
                  const stringA = String(aValue).toLowerCase();
                  const stringB = String(bValue).toLowerCase();
                  if (stringA < stringB) return sortConfig.direction === 'ascending' ? -1 : 1;
                  if (stringA > stringB) return sortConfig.direction === 'ascending' ? 1 : -1;
              }

              return 0;
          });
      }

      return processableInvoices;
  }, [invoices, searchQuery, sortConfig, statusFilter]);

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
          <h2 className="text-4xl font-bold text-foreground mb-2">Einnahmen / Rechnungen</h2>
          <p className="text-default-500">Verwalte deine Rechnungen und Einnahmen</p>
        </div>
        <Button
          as={Link}
          to="/invoice/new"
          className="bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-lg"
          radius="full"
          size="lg"
          startContent={<Plus className="h-6 w-6 font-bold" />}
          variant="shadow"
        >
          Neue Rechnung erstellen
        </Button>
      </div>
       
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          type="text"
          placeholder="Rechnungen durchsuchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          startContent={<Search className="h-4 w-4 text-default-400" />}
          className="flex-1"
          variant="bordered"
        />
        <Tabs
          selectedKey={statusFilter}
          onSelectionChange={(key) => setStatusFilter(key as typeof statusFilter)}
          variant="underlined"
          classNames={{
            tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
            cursor: "w-full bg-primary",
            tab: "max-w-fit px-0 h-12",
            tabContent: "group-data-[selected=true]:text-primary"
          }}
        >
          <Tab key="all" title="Alle" />
          <Tab key="open" title="Offen" />
          <Tab key="paid" title="Bezahlt" />
        </Tabs>
      </div>

      <InvoiceList 
        invoices={filteredAndSortedInvoices} 
        onDelete={handleDelete}
        onStatusToggle={handleStatusToggle}
        requestSort={requestSort}
        sortConfig={sortConfig}
      />
    </div>
  );
};

export default Invoices;
