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

const calculateRecurringTotalForYear = (recurringExpenses: RecurringExpenseData[], year: number): number => {
    let total = 0;
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    recurringExpenses.forEach(expense => {
        let cursorDate = new Date(expense.startDate);
        cursorDate.setHours(12, 0, 0, 0);

        while (cursorDate <= today) {
            if (cursorDate.getFullYear() === year && new Date(expense.nextDueDate) > cursorDate) {
                 total += Number(expense.amount);
            }
            
            switch (expense.interval) {
                case 'monthly':
                    cursorDate.setMonth(cursorDate.getMonth() + 1);
                    break;
                case 'quarterly':
                    cursorDate.setMonth(cursorDate.getMonth() + 3);
                    break;
                case 'yearly':
                    cursorDate.setFullYear(cursorDate.getFullYear() + 1);
                    break;
            }
        }
    });

    return total;
};


const Overview = () => {
    const [invoices, setInvoices] = useState<InvoiceData[]>([]);
    const [expenses, setExpenses] = useState<ExpenseData[]>([]);
    const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpenseData[]>([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    const fetchData = useCallback(async () => {
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
    }, []);

    useEffect(() => {
        fetchData();
    }, [location, fetchData]);
    
    const currentYear = new Date().getFullYear();
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const yearlyInvoices = invoices.filter(inv => new Date(inv.createdAt).getFullYear() === currentYear);
    
    const totalPaidIncome = yearlyInvoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + Number(inv.amount), 0);

    const totalOpenInvoices = yearlyInvoices
        .filter(inv => inv.status === 'open')
        .reduce((sum, inv) => sum + Number(inv.amount), 0);
    
    const totalPaidOneTimeExpenses = expenses
        .filter(exp => exp.status === 'paid' && exp.paidAt && new Date(exp.paidAt).getFullYear() === currentYear)
        .reduce((sum, exp) => sum + Number(exp.amount), 0);

    // This logic now calculates past, paid recurring expenses for the year.
    const totalPaidRecurringExpenses = calculateRecurringTotalForYear(recurringExpenses, currentYear);

    const totalPaidExpenses = totalPaidOneTimeExpenses + totalPaidRecurringExpenses;

    const profit = totalPaidIncome - totalPaidExpenses;
    
    // Calculate total due amount
    const totalDueOneTimeExpenses = expenses.filter(e => e.status === 'due').reduce((sum, e) => sum + Number(e.amount), 0);
    const totalDueRecurringExpenses = recurringExpenses.filter(r => new Date(r.nextDueDate) <= today).reduce((sum, r) => sum + Number(r.amount), 0);
    const totalDueAmount = totalDueOneTimeExpenses + totalDueRecurringExpenses;

    const virtualRecurringInstances: ExpenseData[] = [];
    recurringExpenses.forEach(r => {
        let cursorDate = new Date(r.startDate);
        cursorDate.setHours(12, 0, 0, 0);

        while (cursorDate <= today) {
            virtualRecurringInstances.push({
                id: `${r.id}_${cursorDate.toISOString()}`,
                date: cursorDate.toISOString().split('T')[0],
                vendor: r.vendor,
                description: r.description,
                amount: r.amount,
                currency: r.currency,
                category: r.category,
                status: 'paid',
                paidAt: cursorDate.toISOString(),
            });

            if(new Date(r.nextDueDate) <= cursorDate) break;

            switch (r.interval) {
                case 'monthly':
                    cursorDate.setMonth(cursorDate.getMonth() + 1);
                    break;
                case 'quarterly':
                    cursorDate.setMonth(cursorDate.getMonth() + 3);
                    break;
                case 'yearly':
                    cursorDate.setFullYear(cursorDate.getFullYear() + 1);
                    break;
            }
        }
    });

    const combinedExpensesForList: ExpenseData[] = [...expenses.filter(e => e.status === 'paid'), ...virtualRecurringInstances]
        .sort((a, b) => new Date(b.paidAt!).getTime() - new Date(a.paidAt!).getTime());


    if (loading) {
        return <div className="text-center p-10">Lade Übersicht...</div>;
    }

    return (
        <div>
            <h2 className="text-3xl font-bold text-white mb-6">Übersicht {currentYear}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatCard title="Einnahmen (bezahlt)" value={`CHF ${totalPaidIncome.toFixed(2)}`} colorClass="text-green-400" />
                <StatCard title="Offene Rechnungen" value={`CHF ${totalOpenInvoices.toFixed(2)}`} colorClass="text-yellow-400" />
                <StatCard title="Fällige Ausgaben" value={`CHF ${totalDueAmount.toFixed(2)}`} colorClass="text-orange-400" />
                <StatCard title="Gewinn (bezahlt)" value={`CHF ${profit.toFixed(2)}`} colorClass={profit >= 0 ? 'text-white' : 'text-red-400'} />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentList title="Letzte Einnahmen" items={invoices} linkTo="/invoices" type="invoice" />
                <RecentList title="Letzte bezahlte Ausgaben" items={combinedExpensesForList} linkTo="/expenses" type="expense" />
            </div>
        </div>
    );
};

export default Overview;