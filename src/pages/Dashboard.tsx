import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { InvoiceData } from '../types';
import { getInvoices, deleteInvoice } from '../services/invoiceService';
import InvoiceList from '../components/InvoiceList';

const Invoices = () => {
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectFilter, setProjectFilter] = useState<string>('all');

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

  const projectNames = Array.from(new Set(invoices.map(inv => inv.projectName).filter(Boolean))) as string[];
  const hasInvoicesWithoutProject = invoices.some(inv => !inv.projectName);

  const filteredInvoices = invoices.filter(invoice => {
      if (projectFilter === 'all') return true;
      if (projectFilter === 'none') return !invoice.projectName;
      return invoice.projectName === projectFilter;
  });


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

       <div className="mb-4 flex items-center">
        <label htmlFor="project-filter" className="text-sm text-gray-400 mr-2">Nach Projekt filtern:</label>
        <select
            id="project-filter"
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="bg-gray-700 border border-gray-600 rounded-md px-3 py-1 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
        >
            <option value="all">Alle Projekte</option>
            {projectNames.map(name => (
                <option key={name} value={name}>{name}</option>
            ))}
            {hasInvoicesWithoutProject && <option value="none">Kein Projekt</option>}
        </select>
      </div>

      <InvoiceList invoices={filteredInvoices} onDelete={handleDelete} />
    </div>
  );
};

export default Invoices;