import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Input, Button, ButtonGroup } from '@heroui/react';
import { InvoiceData } from '../types';
import { getInvoices, deleteInvoice, saveInvoice } from '../services/invoiceService';
import InvoiceList from '../components/InvoiceList';
import { Search, Plus, FileText, CreditCard } from 'lucide-react';
import { useConfirm } from '../context/ConfirmContext';
import PageHeader from '../components/PageHeader';

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
  const { confirm } = useConfirm();

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
    if (await confirm('Sind Sie sicher, dass Sie diese Rechnung löschen möchten?')) {
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
    <div className="space-y-6">
      <PageHeader
        title="Einnahmen"
        icon={<CreditCard className="h-6 w-6" />}
        actions={
            <div className="flex items-center gap-3">
                <Button
                    as={Link}
                    to="/invoice/new"
                    className="bg-gradient-to-r from-[#00E5FF] to-[#34F0B1] text-white shadow-lg shadow-[#00E5FF]/20 hover:shadow-[#00E5FF]/40 font-medium hidden lg:inline-flex"
                    startContent={<Plus size={18} />}
                >
                    Neue Rechnung
                </Button>
                <Button
                    as={Link}
                    to="/invoice/new"
                    className="bg-gradient-to-r from-[#00E5FF] to-[#34F0B1] text-white shadow-lg shadow-[#00E5FF]/20 hover:shadow-[#00E5FF]/40 font-medium inline-flex lg:hidden"
                    isIconOnly
                >
                    <Plus size={18} />
                </Button>
            </div>
        }
      >
        <div className="relative max-w-md w-full mx-auto">
            <Input
              placeholder="Rechnungen durchsuchen..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={
                  <Search className="h-4 w-4 text-[#94A3B8]" />
              }
              classNames={{
                input: "bg-[#16232B] text-[#E2E8F0] placeholder:text-[#64748B]",
                inputWrapper: "bg-[#16232B] border border-[#2A3C4D] hover:border-[#00E5FF]/50 focus-within:border-[#00E5FF] h-10",
              }}
            />
            {searchQuery && (
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-[#00E5FF] to-[#34F0B1] text-white text-[10px] px-1.5 py-0.5 rounded-full font-medium shadow-lg pointer-events-none">
                {filteredAndSortedInvoices.length}
              </div>
            )}
        </div>
      </PageHeader>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
         {/* Stats */}
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:flex-1">
            <div className="bg-[#16232B]/40 border border-[#2A3C4D]/50 rounded-2xl p-4 flex items-center gap-4 backdrop-blur-sm">
                <div className="p-2.5 rounded-xl bg-[#1E2A36] text-[#34F0B1] border border-[#2A3C4D]">
                    <FileText size={20} />
                </div>
                <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#64748B] font-medium">Gesamt</p>
                    <p className="text-2xl font-bold text-[#E2E8F0] leading-none">{totalInvoices}</p>
                </div>
            </div>
            
            <div className="bg-[#16232B]/40 border border-[#2A3C4D]/50 rounded-2xl p-4 flex items-center gap-4 backdrop-blur-sm">
                <div className="p-2.5 rounded-xl bg-[#1E2A36] text-[#FBBF24] border border-[#2A3C4D]">
                    <div className="w-5 h-5 rounded-full border-2 border-[#FBBF24] flex items-center justify-center">
                        <div className="w-2 h-2 bg-[#FBBF24] rounded-full"></div>
                    </div>
                </div>
                <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#64748B] font-medium">Offen</p>
                    <p className="text-2xl font-bold text-[#FBBF24] leading-none">{openInvoices}</p>
                </div>
            </div>

            <div className="bg-[#16232B]/40 border border-[#2A3C4D]/50 rounded-2xl p-4 flex items-center gap-4 backdrop-blur-sm">
                <div className="p-2.5 rounded-xl bg-[#1E2A36] text-[#34F0B1] border border-[#2A3C4D]">
                     <div className="w-5 h-5 rounded-full border-2 border-[#34F0B1] flex items-center justify-center">
                        <div className="w-2 h-2 bg-[#34F0B1] rounded-full"></div>
                    </div>
                </div>
                <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#64748B] font-medium">Bezahlt</p>
                    <p className="text-2xl font-bold text-[#34F0B1] leading-none">{paidInvoices}</p>
                </div>
            </div>
         </div>

         {/* Filter Toggle */}
         <div className="w-full lg:w-auto">
             <ButtonGroup fullWidth>
                <Button
                    onClick={() => setStatusFilter('all')}
                    variant={statusFilter === 'all' ? 'solid' : 'light'}
                    className={`text-sm font-medium ${statusFilter === 'all' ? 'bg-[#1E2A36] text-[#E2E8F0] shadow-sm border border-[#2A3C4D]' : 'text-[#64748B] hover:text-[#94A3B8]'}`}
                >
                    Alle
                </Button>
                <Button
                    onClick={() => setStatusFilter('open')}
                    variant={statusFilter === 'open' ? 'solid' : 'light'}
                    className={`text-sm font-medium ${statusFilter === 'open' ? 'bg-[#1E2A36] text-[#FBBF24] shadow-sm border border-[#2A3C4D]' : 'text-[#64748B] hover:text-[#FBBF24]'}`}
                >
                    Offen
                </Button>
                <Button
                    onClick={() => setStatusFilter('paid')}
                    variant={statusFilter === 'paid' ? 'solid' : 'light'}
                    className={`text-sm font-medium ${statusFilter === 'paid' ? 'bg-[#1E2A36] text-[#34F0B1] shadow-sm border border-[#2A3C4D]' : 'text-[#64748B] hover:text-[#34F0B1]'}`}
                >
                    Bezahlt
                </Button>
             </ButtonGroup>
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
