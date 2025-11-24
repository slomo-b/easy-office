import React, { useEffect, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardBody, CardHeader, Chip, Spinner, Table, TableHeader, TableBody, TableColumn, TableRow, TableCell } from '@heroui/react';
import { getInvoices } from '../services/invoiceService';
import { getExpenses } from '../services/expenseService';
import { getRecurringExpenses } from '../services/recurringExpenseService';
import { InvoiceData, ExpenseData, RecurringExpenseData } from '../types';
import { TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react';

const StatCard = ({ title, value, color, icon }: { title: string; value: string; color: 'success' | 'warning' | 'danger' | 'default'; icon: React.ReactNode }) => {
    const colorClasses = {
        success: 'text-success',
        warning: 'text-warning',
        danger: 'text-danger',
        default: 'text-foreground'
    };
    const bgClasses = {
        success: 'bg-success/10',
        warning: 'bg-warning/10',
        danger: 'bg-danger/10',
        default: 'bg-default/10'
    };
    
    return (
        <Card className="border-none bg-content1">
            <CardBody className="p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm text-default-500 mb-1">{title}</p>
                        <p className={`text-3xl font-bold ${colorClasses[color]}`}>
                            {value}
                        </p>
                    </div>
                    <div className={`p-4 rounded-lg flex items-center justify-center ${bgClasses[color]}`}>
                        {icon}
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};

const RecentList = ({ title, items, linkTo, type }: { title: string; items: (InvoiceData | ExpenseData)[], linkTo: string, type: 'invoice' | 'expense' }) => (
    <Card className="border-none bg-content1">
        <CardHeader className="flex justify-between items-center pb-2 px-4 pt-4">
            <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            <Link to={linkTo} className="text-sm text-primary hover:opacity-80 transition-opacity">Alle anzeigen</Link>
        </CardHeader>
        <CardBody className="px-2 pb-2">
            <Table 
                aria-label={title} 
                removeWrapper 
                hideHeader
                classNames={{
                    base: "min-h-[100px]",
                }}
            >
                <TableHeader>
                    <TableColumn>NAME</TableColumn>
                    <TableColumn align="end">AMOUNT</TableColumn>
                </TableHeader>
                <TableBody items={items.slice(0, 5)} emptyContent={<p className="text-default-400 text-sm">Keine Einträge vorhanden.</p>}>
                    {(item) => (
                        <TableRow key={item.id} className="border-b border-divider last:border-none">
                            <TableCell className="py-2">
                                <div>
                                    <p className="text-foreground font-medium text-sm">
                                        {type === 'invoice' ? (item as InvoiceData).debtorName : (item as ExpenseData).vendor}
                                    </p>
                                    <p className="text-tiny text-default-500">
                                        {type === 'invoice' ? (item as InvoiceData).unstructuredMessage : (item as ExpenseData).description}
                                    </p>
                                </div>
                            </TableCell>
                            <TableCell className="py-2">
                                <Chip size="sm" variant="flat" color={type === 'invoice' ? 'success' : 'danger'}>
                                    {item.currency} {Number(type === 'invoice' ? (item as InvoiceData).total : (item as ExpenseData).amount).toFixed(2)}
                                </Chip>
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardBody>
    </Card>
);

const calculateRecurringTotalForYear = (recurringExpenses: RecurringExpenseData[], year: number): number => {
    let total = 0;
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Ensure today is included in comparisons

    recurringExpenses.forEach(expense => {
        let cursorDate = new Date(expense.startDate);
        cursorDate.setHours(12, 0, 0, 0); // Avoid timezone issues around midnight

        while (cursorDate <= today) {
            if (cursorDate.getFullYear() === year) {
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
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const yearlyInvoices = invoices.filter(inv => {
        try {
             // Prioritize createdAt, fallback to parsing ID for old invoices
            const date = inv.createdAt ? new Date(inv.createdAt) : new Date(parseInt(inv.id.split('_')[1], 10));
            return date.getFullYear() === currentYear;
        } catch {
            return false;
        }
    });
    
    const paidInvoices = yearlyInvoices.filter(inv => inv.status === 'paid');
    const totalIncome = paidInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);
    
    const openInvoices = yearlyInvoices.filter(inv => inv.status === 'open');
    const totalOpenAmount = openInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);
    
    const totalOneTimeExpensesPaid = expenses
        .filter(exp => exp.status === 'paid' && exp.paidAt && new Date(exp.paidAt).getFullYear() === currentYear)
        .reduce((sum, exp) => sum + Number(exp.amount), 0);

    const totalRecurringExpensesForYear = calculateRecurringTotalForYear(recurringExpenses, currentYear);

    const totalExpenses = totalOneTimeExpensesPaid + totalRecurringExpensesForYear;

    const profit = totalIncome - totalExpenses;

    // Generate virtual expense instances from recurring expenses for the list view
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
                status: 'due',
                paidAt: null,
            });

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

    const combinedExpensesForList: ExpenseData[] = [...expenses, ...virtualRecurringInstances]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Spinner size="lg" color="primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-4xl font-bold text-foreground mb-2">Übersicht {currentYear}</h2>
                <p className="text-default-500">Finanzübersicht und aktuelle Transaktionen</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    title="Einnahmen (bezahlt)" 
                    value={`CHF ${totalIncome.toFixed(2)}`} 
                    color="success"
                    icon={<TrendingUp className="h-6 w-6 text-success" />}
                />
                <StatCard 
                    title="Offene Rechnungen" 
                    value={`CHF ${totalOpenAmount.toFixed(2)}`} 
                    color="warning"
                    icon={<Wallet className="h-6 w-6 text-warning" />}
                />
                <StatCard 
                    title="Ausgaben (bezahlt)" 
                    value={`CHF ${totalExpenses.toFixed(2)}`} 
                    color="danger"
                    icon={<TrendingDown className="h-6 w-6 text-danger" />}
                />
                <StatCard 
                    title="Gewinn (Cashflow)" 
                    value={`CHF ${profit.toFixed(2)}`} 
                    color={profit >= 0 ? 'success' : 'danger'}
                    icon={<DollarSign className={`h-6 w-6 ${profit >= 0 ? 'text-success' : 'text-danger'}`} />}
                />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <RecentList title="Letzte Einnahmen" items={invoices} linkTo="/invoices" type="invoice" />
                <RecentList title="Letzte Ausgaben" items={combinedExpensesForList} linkTo="/expenses" type="expense" />
            </div>
        </div>
    );
};

export default Overview;
