import React, { useEffect, useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardBody, CardHeader, Chip, Table, TableHeader, TableBody, TableColumn, TableRow, TableCell, Avatar, Skeleton, Button, Select, SelectItem } from '@heroui/react';
import { getInvoices } from '../services/invoiceService';
import { getExpenses } from '../services/expenseService';
import { getRecurringExpenses } from '../services/recurringExpenseService';
import { InvoiceData, ExpenseData, RecurringExpenseData } from '../types';
import { TrendingUp, TrendingDown, DollarSign, Wallet, ArrowRight, Calendar, Target } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const StatCard = ({
    title,
    amount,
    currency = 'CHF',
    subtitle,
    color,
    icon,
    to
}: {
    title: string;
    amount: string;
    currency?: string;
    subtitle?: string;
    color: 'success' | 'warning' | 'danger' | 'primary' | 'default';
    icon: React.ReactNode;
    to?: string;
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

    const CardContent = (
        <>
            {/* Subtle gradient border on hover */}
            <div className={`absolute inset-0 bg-gradient-to-r ${getGradient(color)} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

            <CardBody className="p-5 relative z-10 flex flex-col justify-between h-full overflow-hidden">
                {/* Header: Title and Icon */}
                <div className="flex justify-between items-start w-full mb-2">
                    <p className="text-xs font-medium text-[#94A3B8] uppercase tracking-wider truncate pr-2 mt-1">
                        {title}
                    </p>
                    <div className={`p-2 rounded-lg bg-[#111B22]/40 border border-[#1E2A36] ${getIconColor(color)} shadow-sm flex items-center justify-center`}>
                        <div className="h-5 w-5 flex items-center justify-center">
                            {icon}
                        </div>
                    </div>
                </div>

                {/* Content: Amount */}
                <div className="flex flex-col items-start gap-1 my-1">
                    <p className={`text-4xl font-bold bg-gradient-to-r ${getGradient(color)} bg-clip-text text-transparent tracking-tight leading-none py-1`}>
                        {amount}
                    </p>
                    <div className="px-2 py-0.5 rounded-md bg-[#111B22]/50 border border-[#1E2A36] text-[10px] text-[#94A3B8] font-medium tracking-wide">
                        {currency}
                    </div>
                </div>

                {/* Footer: Subtitle */}
                {subtitle && (
                    <div className="mt-auto pt-2">
                        <p className="text-xs text-[#64748B] truncate">
                            {subtitle}
                        </p>
                    </div>
                )}
            </CardBody>
        </>
    );

    const cardClasses = `relative overflow-hidden border border-[#1E2A36] ${getBgGradient(color)} backdrop-blur-xl hover:shadow-2xl hover:shadow-[#00E5FF]/5 transition-all duration-300 group cursor-pointer min-h-[170px] flex flex-col items-stretch`;

    if (to) {
        return (
            <Link to={to} className="block w-full">
                <Card className={cardClasses}>
                    {CardContent}
                </Card>
            </Link>
        );
    }

    return (
        <Card className={cardClasses}>
            {CardContent}
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
        <Card className="relative overflow-hidden border border-[#1E2A36] bg-gradient-to-br from-[#111B22]/80 to-[#16232B]/60 backdrop-blur-xl hover:shadow-2xl hover:shadow-[#00E5FF]/5 transition-all duration-300 min-h-[300px] flex flex-col items-stretch">
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

            <CardBody className="px-3 pb-4 relative z-10 flex flex-col justify-between flex-grow">
                <div className="space-y-3 flex-grow">
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
                            <div className="flex flex-col items-end gap-1">
                                <Chip
                                    size="sm"
                                    variant="flat"
                                    className={`font-medium ${type === 'invoice' ?
                                        'bg-gradient-to-r from-[#A7F3D0]/20 to-[#34F0B1]/10 text-[#34F0B1] border-[#34F0B1]/30' :
                                        'bg-gradient-to-r from-[#F87171]/20 to-[#EF4444]/10 text-[#F87171] border-[#EF4444]/30'
                                    } border`}
                                >
                                    {Number(type === 'invoice' ? (item as InvoiceData).total : (item as ExpenseData).amount).toFixed(2)}
                                </Chip>
                                <Chip
                                    size="sm"
                                    variant="flat"
                                    className="h-5 min-h-0 px-2 text-[10px] bg-[#1E2A36] border border-[#2A3C4D] text-[#94A3B8]"
                                >
                                    {item.currency}
                                </Chip>
                            </div>
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

const Overview = () => {
    const [invoices, setInvoices] = useState<InvoiceData[]>([]);
    const [expenses, setExpenses] = useState<ExpenseData[]>([]);
    const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpenseData[]>([]);
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState<'year' | 'quarter' | 'month'>('year');
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
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentQuarter = Math.floor(currentMonth / 3);

    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const isInRange = (dateString: string | null) => {
        if (!dateString) return false;
        const date = new Date(dateString);
        if (date.getFullYear() !== currentYear) return false;

        if (timeRange === 'year') return true;
        if (timeRange === 'month') return date.getMonth() === currentMonth;
        if (timeRange === 'quarter') return Math.floor(date.getMonth() / 3) === currentQuarter;
        return false;
    };

    const calculateRecurringTotal = (recurringExpenses: RecurringExpenseData[]): number => {
        let total = 0;
        const today = new Date();
        today.setHours(23, 59, 59, 999);

        // Define range boundaries
        let rangeStart = new Date(currentYear, 0, 1);
        let rangeEnd = new Date(currentYear, 11, 31, 23, 59, 59);

        if (timeRange === 'month') {
            rangeStart = new Date(currentYear, currentMonth, 1);
            rangeEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);
        } else if (timeRange === 'quarter') {
            rangeStart = new Date(currentYear, currentQuarter * 3, 1);
            rangeEnd = new Date(currentYear, (currentQuarter + 1) * 3, 0, 23, 59, 59);
        }

        // Limit rangeEnd to today to prevent calculating future expenses in "paid" totals?
        // Usually overview shows YTD or period totals. Let's assume we show what "should be paid" or "is paid" in this period.
        // For simplicity, let's include all due dates in the range <= today for "actuals".
        const effectiveEnd = rangeEnd > today ? today : rangeEnd;

        recurringExpenses.forEach(expense => {
            let cursorDate = new Date(expense.startDate);
            cursorDate.setHours(12, 0, 0, 0);

            while (cursorDate <= effectiveEnd) {
                if (cursorDate >= rangeStart) {
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

    const filteredInvoices = invoices.filter(inv => {
        try {
            const dateStr = inv.createdAt || inv.id.split('_')[1]; // Fallback if createdAt missing
            // For invoices, created date determines which period they fall into generally,
            // or maybe 'paidAt' for income? 
            // Usually 'Einnahmen (bezahlt)' uses paidAt. 'Offene' uses createdAt or due date.
            // Let's use generic isInRange for filtering the *list*, but specific logic for stats.
            return true; 
        } catch { return false; }
    });
    
    // Stats Calculations
    const paidInvoices = invoices.filter(inv => inv.status === 'paid' && isInRange(inv.paidAt));
    const totalIncome = paidInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);
    
    const openInvoices = invoices.filter(inv => inv.status === 'open' && isInRange(inv.createdAt)); // Open invoices created in this period
    const totalOpenAmount = openInvoices.reduce((sum, inv) => sum + Number(inv.total), 0);
    
    const totalOneTimeExpensesPaid = expenses
        .filter(exp => exp.status === 'paid' && isInRange(exp.paidAt))
        .reduce((sum, exp) => sum + Number(exp.amount), 0);

    const totalRecurringExpenses = calculateRecurringTotal(recurringExpenses);

    const totalExpenses = totalOneTimeExpensesPaid + totalRecurringExpenses;

    const profit = totalIncome - totalExpenses;
    
    const getTitleText = () => {
        if (timeRange === 'month') return `Übersicht ${currentDate.toLocaleString('de-CH', { month: 'long', year: 'numeric' })}`;
        if (timeRange === 'quarter') return `Übersicht Q${currentQuarter + 1} ${currentYear}`;
        return `Übersicht ${currentYear}`;
    };

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
                        <Card key={i} className="relative overflow-hidden border border-[#1E2A36] bg-gradient-to-br from-[#111B22]/80 to-[#16232B]/60 backdrop-blur-xl min-h-[170px] flex flex-col items-stretch">
                            <CardBody className="p-6 flex flex-col justify-between flex-grow">
                                <div className="flex items-start justify-between flex-grow">
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
                        <Card key={i} className="relative overflow-hidden border border-[#1E2A36] bg-gradient-to-br from-[#111B22]/80 to-[#16232B]/60 backdrop-blur-xl min-h-[300px] flex flex-col items-stretch">
                            <CardHeader className="flex justify-between items-center pb-3 px-6 pt-6">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-9 w-9 bg-[#1E2A36] rounded-lg" />
                                    <Skeleton className="h-6 w-32 bg-[#16232B] rounded-lg" />
                                </div>
                                <Skeleton className="h-8 w-24 bg-[#16232B] rounded-lg" />
                            </CardHeader>
                            <CardBody className="px-3 pb-4 space-y-3 flex flex-col justify-between flex-grow overflow-y-auto">
                                <div className="space-y-3 flex-grow">
                                    {Array.from({ length: 4 }).map((_, j) => (
                                        <div key={j} className="flex items-center justify-between p-3 rounded-xl bg-[#16232B]/40 border border-[#1E2A36]">
                                            <div className="flex items-center gap-3">
                                                <Skeleton className="h-8 w-8 bg-[#1E2A36] rounded-full" />
                                                <div className="space-y-2">
                                                    <Skeleton className="h-4 w-28 bg-[#64748B] rounded" />
                                                    <Skeleton className="h-3 w-20 bg-[#64748B]/50 rounded" />
                                                </div>
                                        </div>
                                        <div className="flex flex-col items-end gap-1">
                                            <Skeleton className="h-6 w-20 bg-[#1E2A36] rounded-full" />
                                            <Skeleton className="h-5 w-12 bg-[#1E2A36] rounded-full" />
                                        </div>
                                    </div>
                                ))}
                                </div>
                            </CardBody>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div>
            <PageHeader
                title={getTitleText()}
                icon={<Calendar className="h-6 w-6" />}
                actions={
                    <div className="w-full sm:w-48">
                        <Select
                            selectedKeys={[timeRange]}
                            onSelectionChange={(keys) => setTimeRange(Array.from(keys)[0] as 'year' | 'quarter' | 'month')}
                            classNames={{
                                trigger: "bg-[#16232B] border border-[#1E2A36] hover:border-[#00E5FF]/30 text-[#E2E8F0]",
                                value: "text-[#E2E8F0] font-medium",
                                popoverContent: "bg-[#16232B] border border-[#1E2A36] text-[#E2E8F0]"
                            }}
                            disallowEmptySelection
                            aria-label="Zeitraum wählen"
                        >
                            <SelectItem key="year" classNames={{base: "text-[#E2E8F0] data-[hover=true]:bg-[#1E2A36] data-[hover=true]:text-[#00E5FF]"}}>Dieses Jahr</SelectItem>
                            <SelectItem key="quarter" classNames={{base: "text-[#E2E8F0] data-[hover=true]:bg-[#1E2A36] data-[hover=true]:text-[#00E5FF]"}}>Dieses Quartal</SelectItem>
                            <SelectItem key="month" classNames={{base: "text-[#E2E8F0] data-[hover=true]:bg-[#1E2A36] data-[hover=true]:text-[#00E5FF]"}}>Dieser Monat</SelectItem>
                        </Select>
                    </div>
                }
            />

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatCard
                    title="Einnahmen (bezahlt)"
                    subtitle={`${paidInvoices.length} Rechnungen`}
                    amount={totalIncome.toFixed(2)}
                    color="success"
                    icon={<TrendingUp className="h-8 w-8" />}
                    to="/invoices"
                />
                <StatCard
                    title="Offene Rechnungen"
                    subtitle={`${openInvoices.length} ausstehend`}
                    amount={totalOpenAmount.toFixed(2)}
                    color="warning"
                    icon={<Wallet className="h-8 w-8" />}
                    to="/invoices"
                />
                <StatCard
                    title="Ausgaben (bezahlt)"
                    subtitle={`${expenses.filter(e => e.status === 'paid').length} Transaktionen`}
                    amount={totalExpenses.toFixed(2)}
                    color="danger"
                    icon={<TrendingDown className="h-8 w-8" />}
                    to="/expenses"
                />
                <StatCard
                    title="Gewinn (Cashflow)"
                    subtitle={`${profit >= 0 ? 'Positive' : 'Negative'} Bilanz`}
                    amount={profit.toFixed(2)}
                    color={profit >= 0 ? 'success' : 'danger'}
                    icon={<DollarSign className="h-8 w-8" />}
                    to="/invoices"
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
