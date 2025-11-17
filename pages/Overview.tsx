import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getInvoices } from '../services/invoiceService';
import { getExpenses } from '../services/expenseService';
import { getRecurringExpenses } from '../services/recurringExpenseService';
import { InvoiceData, ExpenseData, RecurringExpenseData } from '../types';

const StatCard = ({ title, value, colorClass }: { title: string; value: string; colorClass: string }) => (
    <div className={`bg-gray-800 p-4 rounded-lg shadow-md`}>
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <p className={`text-2xl font-bold ${colorClass}`}>{value}</p>
    </div>
);

const RecentList = ({ title, items, linkTo, type }: { title: string; items: (InvoiceData | ExpenseData)[], linkTo: string, type: 'invoice' | 'expense' }) => (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-emerald-400">{title}</h3>
            <Link to={linkTo} className="text-sm text-emerald-400 hover:text-emerald-300">Alle anzeigen</Link>
        </div>
        <ul className="divide-y divide-gray-700">
            {items.length > 0 ? items.slice(0, 5).map(item => (
                <li key={item.id} className="py-2 flex justify-between items-center">
                    <div>
                        <p className="text-white">
                           {type === 'invoice' ? (item as InvoiceData).debtorName : (item as ExpenseData).vendor}
                        </p>
                        <p className="text-xs text-gray-400">
                           {type === 'invoice' ? (item as InvoiceData).unstructuredMessage : (item as ExpenseData).description}
                        </p>
                    </div>
                    <span className="font-mono text-sm">{item.currency} {Number(item.amount).toFixed(2)}</span>
                </li>
            )) : <p className="text-gray-500 text-sm py-2">Keine Einträge vorhanden.</p>}
        </ul>
    </div>
);


const Overview = () => {
    const [invoices, setInvoices] = useState<InvoiceData[]>([]);
    const [expenses, setExpenses] = useState<ExpenseData[]>([]);
    const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpenseData[]>([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const [inv, exp, recExp] = await Promise.all([
                getInvoices(), 
                getExpenses(),
                getRecurringExpenses()
            ]);
            setInvoices(inv);
            setExpenses(exp);
            setRecurringExpenses(recExp);
            setLoading(false);
        };
        
        fetchData();
    }, [location]);
    
    const currentYear = new Date().getFullYear();

    const yearlyInvoices = invoices.filter(inv => {
        try {
            const timestamp = parseInt(inv.id.split('_')[1], 10);
            return new Date(timestamp).getFullYear() === currentYear;
        } catch {
            return false;
        }
    });
    
    const totalIncome = yearlyInvoices.reduce((sum, inv) => sum + Number(inv.amount), 0);
    
    // Calculate total expenses based *only* on the actual, created expense records for the current year.
    // This reflects what has actually been paid/recorded, not a forecast.
    const yearlyExpenses = expenses.filter(exp => new Date(exp.date).getFullYear() === currentYear);
    const totalExpenses = yearlyExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);

    const profit = totalIncome - totalExpenses;

    // For the list view, combine one-time expenses with upcoming recurring expenses to give a full overview.
    const combinedExpensesForList: ExpenseData[] = [
        ...expenses,
        ...recurringExpenses.map(r => ({
            id: r.id,
            date: r.nextDueDate, 
            vendor: r.vendor,
            description: `${r.description} (Nächste Fälligkeit)`,
            amount: r.amount,
            currency: r.currency,
            category: r.category,
        }))
    ].sort((a, b) => b.date.localeCompare(a.date));


    if (loading) {
        return <div className="text-center p-10">Lade Übersicht...</div>;
    }

    return (
        <div>
            <h2 className="text-3xl font-bold text-white mb-6">Übersicht {currentYear}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <StatCard title="Einnahmen (dieses Jahr)" value={`CHF ${totalIncome.toFixed(2)}`} colorClass="text-green-400" />
                <StatCard title="Ausgaben (dieses Jahr)" value={`CHF ${totalExpenses.toFixed(2)}`} colorClass="text-red-400" />
                <StatCard title="Gewinn (dieses Jahr)" value={`CHF ${profit.toFixed(2)}`} colorClass={profit >= 0 ? 'text-white' : 'text-red-400'} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentList title="Letzte Einnahmen" items={invoices} linkTo="/invoices" type="invoice" />
                <RecentList title="Letzte Ausgaben" items={combinedExpensesForList} linkTo="/expenses" type="expense" />
            </div>
        </div>
    );
};

export default Overview;