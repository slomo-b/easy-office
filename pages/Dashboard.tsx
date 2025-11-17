import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { InvoiceData } from '../types';
import { getInvoices, deleteInvoice } from '../services/invoiceService';
import InvoiceList from '../components/InvoiceList';

const Invoices = () => {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div className="text-center p-10">Lade Rechnungen...</div>;
  }

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
      <InvoiceList invoices={invoices} onDelete={handleDelete} />
    </div>
  );
};

export default Invoices;