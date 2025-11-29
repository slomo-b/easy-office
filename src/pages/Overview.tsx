import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardBody, CardHeader, Chip, Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, Avatar, Skeleton, Button } from '@heroui/react';
import { getInvoices } from '../services/invoiceService';
import { getExpenses } from '../services/expenseService';
import { getRecurringExpenses } from '../services/recurringExpenseService';
import { InvoiceData, ExpenseData, RecurringExpenseData } from '../types';
import { TrendingUp, TrendingDown, DollarSign, Wallet, ArrowRight, Calendar, Target } from 'lucide-react';

const StatCard = ({
    title,
    value,
    subtitle,
    color,
    icon
}: {
    title: string;
    value: string;
    subtitle?: string;
    color: 'success' | 'warning' | 'danger' | 'primary' | 'default';
    icon: React.ReactNode;
}) => {
    const getGradient = (color: string) => {
        switch (color) {
            case 'success':
                return 'from-[#A7F3D0] to-[#34F0B1]';
            case 'warning':
                return 'from-[#FCD34D] to-[#FBBF24]';
            case 'danger':
                return 'from-[#F87171] to-[#EF4444]';
            case 'primary':
                return 'from-[#00E5FF] to-[#34F0B1]';
            default:
                return 'from-[#94A3B8] to-[#64748B]';
        }
    };

    const getBgGradient = (color: string) => {
        switch (color) {
            case 'success':
                return 'bg-gradient-to-br from-[#A7F3D0]/20 to-[#34F0B1]/10';
            case 'warning':
                return 'bg-gradient-to-br from-[#FCD34D]/20 to-[#FBBF24]/10';
            case 'danger':
                return 'bg-gradient-to-br from-[#F87171]/20 to-[#EF4444]/10';
            case 'primary':
                return 'bg-gradient-to-br from-[#00E5FF]/20 to-[#34F0B1]/10';
            default:
                return 'bg-gradient-to-br from-[#94A3B8]/20 to-[#64748B]/10';
        }
    };

    const getIconColor = (color: string) => {
        switch (color) {
            case 'success':
                return 'text-[#34F0B1]';
            case 'warning':
                return 'text-[#FBBF24]';
            case 'danger':
                return 'text-[#F87171]';
            case 'primary':
                return 'text-[#00E5FF]';
            default:
                return 'text-[#94A3B8]';
        }
    };

    return (
        <Card className={`relative overflow-hidden border border-[#1E2A36] ${getBgGradient(color)} backdrop-blur-xl hover:shadow-2xl hover:shadow-[#00E5FF]/5 transition-all duration-300 group cursor-pointer`}>
            {/* Subtle gradient border on hover */}
            <div className={`absolute inset-0 bg-gradient-to-r ${getGradient(color)} opacity-0 group-hover:opacity-20 transition-opacity duration-300`} />

            <CardBody className="p-6 relative z-10">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                            <p className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider">{title}</p>
                        </div>
                        <p className={`text-2xl font-bold bg-gradient-to-r ${getGradient(color)} bg-clip-text text-transparent mb-1`}>
                            {value}
                        </p>
                        {subtitle && (
                            <p className="text-xs text-[#64748B]">{subtitle}</p>
                        )}
                    </div>
                    <div className={`p-3 rounded-xl bg-gradient-to-br ${getGradient(color)}/15 border border-[#1E2A36] ${getIconColor(color)} shadow-lg`}>
                        <div className="h-8 w-8">
                            {icon}
                        </div>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
};

const RecentList = ({ title, items, linkTo, type }: { title: string; items: (InvoiceData | ExpenseData)[], linkTo: string, type: 'invoice' | 'expense' }) => {
    const colorScheme = type === 'invoice' ? {
        primary: '#A7F3D0',
        secondary: '#34F0B1',
        avatar: 'success'
    } : {
        primary: '#F87171',
        secondary: '#EF4444',
        avatar: 'danger'
    };

    return (
        <Card className="relative overflow-hidden border border-[#1E2A36] bg-gradient-to-br from-[#111B22]/80 to-[#16232B]/60 backdrop-blur-xl hover:shadow-2xl hover:shadow-[#00E5FF]/5 transition-all duration-300">
            {/* Subtle gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br from-[${colorScheme.primary}]/5 to-[${colorScheme.secondary}]/5`} />

            <CardHeader className="flex justify-between items-center pb-3 px-6 pt-6 relative z-10">
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg bg-gradient-to-br from-[${colorScheme.primary}]/20 to-[${colorScheme.secondary}]/10 border border-[#1E2A36]`}>
                        {type === 'invoice' ? <TrendingUp className="h-5 w-5 text-[#34F0B1]" /> : <TrendingDown className="h-5 w-5 text-[#F87171]" />}
                    </div>
                    <h3 className="text-lg font-semibold bg-gradient-to-r from-[#E2E8F0] to-[#94A3B8] bg-clip-text text-transparent">{title}</h3>
                </div>
                <Button
                    as={Link}
                    to={linkTo}
                    variant="light"
                    size="sm"
                    className="bg-[#16232B] border border-[#1E2A36] text-[#94A3B8] hover:text-[#E2E8F0] hover:border-[#00E5FF]/30 hover:bg-[#1E2A36] transition-all duration-300"
                    endContent={<ArrowRight className="h-3 w-3" />}
                >
                    Alle anzeigen
                </Button>
            </CardHeader>

            <CardBody className="px-3 pb-4 relative z-10">
                <div className="space-y-3">
                    {items.slice(0, 5).map((item) => (
                        <div key={item.id} className="group flex items-center justify-between p-3 rounded-xl bg-[#16232B]/40 border border-[#1E2A36] hover:border-[#00E5FF]/30 hover:bg-[#16232B]/60 transition-all duration-300">
                            <div className="flex items-center gap-3">
                                <Avatar
                                    name={type === 'invoice' ? (item as InvoiceData).debtorName : (item as ExpenseData).vendor}
                                    size="sm"
                                    isBordered
                                    className="border-[#1E2A36] transition-all duration-300 group-hover:scale-105"
                                    color={colorScheme.avatar as any}
                                />
                                <div className="min-w-0 flex-1">
                                    <p className="text-[#E2E8F0] font-medium text-sm truncate">
                                        {type === 'invoice' ? (item as InvoiceData).debtorName : (item as ExpenseData).vendor}
                                    </p>
                                    <p className="text-[#64748B] text-xs truncate">
                                        {type === 'invoice' ?
                                            ((item as InvoiceData).unstructuredMessage || 'Rechnung') :
                                            ((item as ExpenseData).description || 'Ausgabe')
                                        }
                                    </p>
                                </div>
                            </div>
                            <Chip
                                size="sm"
                                variant="flat"
                                className={`font-medium ${type === 'invoice' ?
                                    'bg-gradient-to-r from-[#A7F3D0]/20 to-[#34F0B1]/10 text-[#34F0B1] border-[#34F0B1]/30' :
                                    'bg-gradient-to-r from-[#F87171]/20 to-[#EF4444]/10 text-[#F87171] border-[#EF4444]/30'
                                } border`}
                            >
                                {item.currency} {Number(type === 'invoice' ? (item as InvoiceData).total : (item as ExpenseData).amount).toFixed(2)}
                            </Chip>
                        </div>
                    ))}
                    {items.length === 0 && (
                        <div className="text-center py-8">
                            <div className={`mx-auto w-12 h-12 rounded-full bg-gradient-to-br from-[${colorScheme.primary}]/10 to-[${colorScheme.secondary}]/5 border border-[#1E2A36] flex items-center justify-center mb-3`}>
                                {type === 'invoice' ? <Wallet className="h-6 w-6 text-[#64748B]" /> : <Target className="h-6 w-6 text-[#64748B]" />}
                            </div>
                            <p className="text-[#64748B] text-sm">Keine Einträge vorhanden</p>
                        </div>
                    )}
                </div>
            </CardBody>
        </Card>
    );
};

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
            <div className="space-y-8">
                {/* Header Skeleton */}
                <div className="space-y-3">
                    <Skeleton className="h-12 w-72 bg-[#16232B] rounded-xl" />
                    <Skeleton className="h-5 w-96 bg-[#1E2A36] rounded-lg" />
                </div>

                {/* Stats Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <Card key={i} className="relative overflow-hidden border border-[#1E2A36] bg-gradient-to-br from-[#111B22]/80 to-[#16232B]/60 backdrop-blur-xl">
                            <CardBody className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <Skeleton className="h-3 w-24 bg-[#1E2A36] rounded-full mb-3" />
                                        <Skeleton className="h-8 w-32 bg-[#16232B] rounded-lg mb-2" />
                                        <Skeleton className="h-3 w-16 bg-[#64748B]/30 rounded-full" />
                                    </div>
                                    <Skeleton className="h-12 w-12 bg-[#1E2A36] rounded-xl" />
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>

                {/* Lists Skeleton */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {Array.from({ length: 2 }).map((_, i) => (
                        <Card key={i} className="relative overflow-hidden border border-[#1E2A36] bg-gradient-to-br from-[#111B22]/80 to-[#16232B]/60 backdrop-blur-xl">
                            <CardHeader className="flex justify-between items-center pb-3 px-6 pt-6">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-9 w-9 bg-[#1E2A36] rounded-lg" />
                                    <Skeleton className="h-6 w-32 bg-[#16232B] rounded-lg" />
                                </div>
                                <Skeleton className="h-8 w-24 bg-[#16232B] rounded-lg" />
                            </CardHeader>
                            <CardBody className="px-3 pb-4 space-y-3">
                                {Array.from({ length: 4 }).map((_, j) => (
                                    <div key={j} className="flex items-center justify-between p-3 rounded-xl bg-[#16232B]/40 border border-[#1E2A36]">
                                        <div className="flex items-center gap-3">
                                            <Skeleton className="h-8 w-8 bg-[#1E2A36] rounded-full" />
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-28 bg-[#64748B] rounded" />
                                                <Skeleton className="h-3 w-20 bg-[#64748B]/50 rounded" />
                                            </div>
                                        </div>
                                        <Skeleton className="h-6 w-20 bg-[#1E2A36] rounded-full" />
                                    </div>
                                ))}
                            </CardBody>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="space-y-2">
                <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-br from-[#00E5FF]/20 to-[#34F0B1]/10 border border-[#1E2A36]">
                        <Calendar className="h-8 w-8 text-[#00E5FF]" />
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
                            Übersicht {currentYear}
                        </h1>
                    </div>
                </div>
                <div className="h-px bg-gradient-to-r from-transparent via-[#00E5FF]/30 to-transparent mb-8" />
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatCard
                    title="Einnahmen (bezahlt)"
                    subtitle={`${paidInvoices.length} Rechnungen`}
                    value={`CHF ${totalIncome.toFixed(2)}`}
                    color="success"
                    icon={<TrendingUp className="h-8 w-8" />}
                />
                <StatCard
                    title="Offene Rechnungen"
                    subtitle={`${openInvoices.length} ausstehend`}
                    value={`CHF ${totalOpenAmount.toFixed(2)}`}
                    color="warning"
                    icon={<Wallet className="h-8 w-8" />}
                />
                <StatCard
                    title="Ausgaben (bezahlt)"
                    subtitle={`${expenses.filter(e => e.status === 'paid').length} Transaktionen`}
                    value={`CHF ${totalExpenses.toFixed(2)}`}
                    color="danger"
                    icon={<TrendingDown className="h-8 w-8" />}
                />
                <StatCard
                    title="Gewinn (Cashflow)"
                    subtitle={`${profit >= 0 ? 'Positive' : 'Negative'} Bilanz`}
                    value={`CHF ${profit.toFixed(2)}`}
                    color={profit >= 0 ? 'success' : 'danger'}
                    icon={<DollarSign className="h-8 w-8" />}
                />
            </div>

            {/* Activity Lists */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentList title="Letzte Einnahmen" items={invoices} linkTo="/invoices" type="invoice" />
                <RecentList title="Letzte Ausgaben" items={combinedExpensesForList} linkTo="/expenses" type="expense" />
            </div>
        </div>
    );
};

export default Overview;
