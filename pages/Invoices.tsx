
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Input, Tabs, Tab, Button } from '@heroui/react';
import { InvoiceData } from '../types';
import { getInvoices, deleteInvoice, saveInvoice } from '../services/invoiceService';
import InvoiceList from '../components/InvoiceList';
import { Search, Plus, FileText, CreditCard } from 'lucide-react';

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
          <div className="flex gap-4">
            <div className="h-10 w-48 bg-[#1E2A36] rounded-lg animate-pulse" />
            <div className="h-10 w-32 bg-[#1E2A36] rounded-lg animate-pulse" />
            <div className="h-10 w-32 bg-[#1E2A36] rounded-lg animate-pulse" />
          </div>
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

  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter(inv => inv.status === 'paid').length;
  const openInvoices = invoices.filter(inv => inv.status === 'open').length;

  return (
    <div className="space-y-8">
      {/* Header with Title and Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#00E5FF]/20 to-[#34F0B1]/10 border border-[#1E2A36]">
            <CreditCard className="h-8 w-8 text-[#00E5FF]" />
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
              Rechnungen / Einnahmen
            </h1>
          </div>
        </div>

        <Button
          as={Link}
          to="/invoice/new"
          className="bg-gradient-to-r from-[#00E5FF] to-[#34F0B1] text-white shadow-lg shadow-[#00E5FF]/25 hover:shadow-xl hover:shadow-[#00E5FF]/30 self-start sm:self-center"
          radius="lg"
          size="lg"
          startContent={<Plus className="h-5 w-5" />}
        >
          Neue Rechnung
        </Button>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-[#00E5FF]/30 to-transparent" />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-[#111B22]/80 to-[#16232B]/60 border border-[#1E2A36] rounded-xl p-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-[#A7F3D0]" />
            <div>
              <p className="text-sm text-[#64748B] uppercase tracking-wider">Gesamt</p>
              <p className="text-2xl font-bold text-[#E2E8F0]">{totalInvoices}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#111B22]/80 to-[#16232B]/60 border border-[#1E2A36] rounded-xl p-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#FCD34D] to-[#FBBF24] flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full" />
            </div>
            <div>
              <p className="text-sm text-[#64748B] uppercase tracking-wider">Offen</p>
              <p className="text-2xl font-bold text-[#FBBF24]">{openInvoices}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#111B22]/80 to-[#16232B]/60 border border-[#1E2A36] rounded-xl p-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#A7F3D0] to-[#34F0B1] flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full" />
            </div>
            <div>
              <p className="text-sm text-[#64748B] uppercase tracking-wider">Bezahlt</p>
              <p className="text-2xl font-bold text-[#34F0B1]">{paidInvoices}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        {/* Search Input Container */}
        <div className="flex-1 relative min-w-0 bg-[#16232B] border border-[#1E2A36] rounded-2xl shadow-xl h-full">
          <div className="relative group h-full">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00E5FF] to-[#34F0B1] rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm" />
            <Input
              label=" "
              placeholder="Rechnungen durchsuchen..."
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
                {filteredAndSortedInvoices.length}
              </div>
            )}
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="relative">
          <div className="flex items-center gap-2 bg-[#16232B] border-2 border-[#1E2A36] rounded-2xl p-2 shadow-xl">
            {/* Tab: Alle */}
            <button
              onClick={() => setStatusFilter('all')}
              className={`relative px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                statusFilter === 'all'
                  ? 'bg-gradient-to-r from-[#00E5FF] to-[#34F0B1] text-white shadow-lg scale-105'
                  : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1E2A36]'
              }`}
            >
              <span className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  statusFilter === 'all' ? 'bg-white' : 'bg-[#00E5FF]'
                }`} />
                Alle
              </span>
            </button>

            {/* Tab: Offen */}
            <button
              onClick={() => setStatusFilter('open')}
              className={`relative px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                statusFilter === 'open'
                  ? 'bg-gradient-to-r from-[#FCD34D] to-[#FBBF24] text-white shadow-lg scale-105'
                  : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1E2A36]'
              }`}
            >
              <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                statusFilter === 'open' ? 'bg-white' : 'bg-[#FBBF24]'
              }`} />
              Offen
            </button>

            {/* Tab: Bezahlt */}
            <button
              onClick={() => setStatusFilter('paid')}
              className={`relative px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                statusFilter === 'paid'
                  ? 'bg-gradient-to-r from-[#A7F3D0] to-[#34F0B1] text-white shadow-lg scale-105'
                  : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1E2A36]'
              }`}
            >
              <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                statusFilter === 'paid' ? 'bg-white' : 'bg-[#34F0B1]'
              }`} />
              Bezahlt
            </button>
          </div>

          {/* Filter Results Counter */}
          {statusFilter !== 'all' && (
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-[#00E5FF] to-[#34F0B1] text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg min-w-[20px] text-center">
              {statusFilter === 'open' ? openInvoices : paidInvoices}
            </div>
          )}
        </div>
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
