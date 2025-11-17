
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { InvoiceData } from '../types';
import { getInvoices, deleteInvoice, saveInvoice } from '../services/invoiceService';
import InvoiceList from '../components/InvoiceList';
import { Search } from 'lucide-react';

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
    return <div className="text-center p-10">Lade Rechnungen...</div>;
  }
  
  const StatusButton: React.FC<{ filterValue: typeof statusFilter, text: string }> = ({ filterValue, text }) => (
    <button
      onClick={() => setStatusFilter(filterValue)}
      className={`px-3 py-1 text-sm rounded-md transition ${statusFilter === filterValue ? 'bg-emerald-500 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
    >
      {text}
    </button>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Einnahmen / Rechnungen</h2>
        <Link to="/invoice/new" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          Neue Rechnung erstellen
        </Link>
      </div>
       
       <div className="mb-4 flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-5 w-5 text-gray-400" />
                </span>
                <input
                    type="text"
                    placeholder="Rechnungen durchsuchen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                />
            </div>
            <div className="flex items-center gap-2 bg-gray-800 p-1 rounded-lg">
                <StatusButton filterValue="all" text="Alle" />
                <StatusButton filterValue="open" text="Offen" />
                <StatusButton filterValue="paid" text="Bezahlt" />
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