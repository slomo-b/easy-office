import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Input, Button, ButtonGroup } from '@heroui/react';
import { ExpenseData, RecurringExpenseData } from '../types';
import { getExpenses, deleteExpense, saveExpense, createNewExpense } from '../services/expenseService';
import { getRecurringExpenses, deleteRecurringExpense, saveRecurringExpense, calculateNextDueDate } from '../services/recurringExpenseService';
import { Repeat, Search, Plus, DollarSign, CreditCard } from 'lucide-react';
import { useConfirm } from '../context/ConfirmContext';
import ExpenseList from '../components/ExpenseList';
import PageHeader from '../components/PageHeader';

export type CombinedExpense = 
    (ExpenseData & { type: 'one-time'; sortDate: string }) | 
    (RecurringExpenseData & { type: 'recurring'; sortDate: string; status: 'due' | 'planned' });

export type SortableExpenseKeys = keyof Pick<CombinedExpense, 'vendor' | 'amount' | 'sortDate' | 'status'>;

const Expenses = () => {
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpenseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'due' | 'paid'>('all');
  const [sortConfig, setSortConfig] = useState<{ key: SortableExpenseKeys; direction: 'ascending' | 'descending' } | null>({
      key: 'sortDate',
      direction: 'descending'
  });
  const { confirm } = useConfirm();

  const loadData = useCallback(async () => {
    setLoading(true);
    const [fetchedExpenses, fetchedRecurring] = await Promise.all([getExpenses(), getRecurringExpenses()]);
    setExpenses(fetchedExpenses);
    setRecurringExpenses(fetchedRecurring);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (id: string, type: 'one-time' | 'recurring') => {
    const confirmationMessage = type === 'one-time' 
      ? 'Sind Sie sicher, dass Sie diese Ausgabe löschen möchten?'
      : 'Sind Sie sicher, dass Sie diese wiederkehrende Ausgabe löschen möchten?';

    if (await confirm(confirmationMessage)) {
      if (type === 'one-time') {
        await deleteExpense(id);
      } else {
        await deleteRecurringExpense(id);
      }
      await loadData();
    }
  };
  
  const handleStatusToggle = async (id: string, type: 'one-time' | 'recurring') => {
    if (type === 'one-time') {
      const expense = expenses.find(e => e.id === id);
      if (expense) {
        const isPaid = expense.status === 'paid';
        const updatedExpense: ExpenseData = {
          ...expense,
          status: isPaid ? 'due' : 'paid',
          paidAt: isPaid ? null : new Date().toISOString(),
        };
        await saveExpense(updatedExpense);
      }
    } else { // type is 'recurring'
      const recurringExpense = recurringExpenses.find(r => r.id === id);
      if (recurringExpense) {
        // 1. Create and save new one-time expense, mark as paid
        const newPaidExpense = createNewExpense();
        newPaidExpense.date = recurringExpense.nextDueDate;
        newPaidExpense.vendor = recurringExpense.vendor;
        newPaidExpense.description = recurringExpense.description;
        newPaidExpense.amount = recurringExpense.amount;
        newPaidExpense.currency = recurringExpense.currency;
        newPaidExpense.category = recurringExpense.category;
        newPaidExpense.status = 'paid';
        newPaidExpense.paidAt = new Date().toISOString();
        await saveExpense(newPaidExpense);

        // 2. Update recurring expense to next due date
        const updatedRecurring = {
          ...recurringExpense,
          nextDueDate: calculateNextDueDate(recurringExpense.nextDueDate, recurringExpense.interval),
        };
        await saveRecurringExpense(updatedRecurring);
      }
    }
    await loadData(); // Reload all data
  };
  
  const requestSort = (key: SortableExpenseKeys) => {
      let direction: 'ascending' | 'descending' = 'ascending';
      if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
          direction = 'descending';
      }
      setSortConfig({ key, direction });
  };
  
  const filteredAndSortedExpenses = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    // Include all recurring expenses, marking them as 'due' or 'planned'
    const allRecurringInstances: CombinedExpense[] = recurringExpenses.map(r => ({
      ...r,
      type: 'recurring',
      sortDate: r.nextDueDate,
      status: new Date(r.nextDueDate) <= today ? 'due' : 'planned',
    }));
      
    let combined: CombinedExpense[] = [
      ...expenses.map(e => ({ ...e, type: 'one-time' as const, sortDate: e.date })),
      ...allRecurringInstances
    ];
    
    // Status filtering
    if (statusFilter !== 'all') {
        combined = combined.filter(item => {
            if (statusFilter === 'paid') {
                return item.type === 'one-time' && item.status === 'paid';
            }
            if (statusFilter === 'due') {
                return item.status === 'due';
            }
            return false;
        });
    }

    // Search filtering
    if (searchQuery) {
        const lowercasedQuery = searchQuery.toLowerCase();
        combined = combined.filter(item => 
            item.vendor.toLowerCase().includes(lowercasedQuery) ||
            item.description.toLowerCase().includes(lowercasedQuery) ||
            item.category.toLowerCase().includes(lowercasedQuery)
        );
    }
    
    // Sorting
    if (sortConfig !== null) {
      combined.sort((a, b) => {
        if (sortConfig.key === 'status') {
            const statusOrder = { due: 1, planned: 2, paid: 3 };
            const aOrder = statusOrder[a.status as keyof typeof statusOrder];
            const bOrder = statusOrder[b.status as keyof typeof statusOrder];
            if (aOrder < bOrder) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aOrder > bOrder) return sortConfig.direction === 'ascending' ? 1 : -1;
            return new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime();
        }

        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        if (sortConfig.key === 'sortDate') {
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

    return combined;

  }, [expenses, recurringExpenses, statusFilter, searchQuery, sortConfig]);


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

  const totalExpenses = expenses.length + recurringExpenses.length;
  const dueExpenses = expenses.filter(e => e.status === 'due').length + recurringExpenses.filter(r => new Date(r.nextDueDate) <= new Date()).length;
  const paidExpenses = expenses.filter(e => e.status === 'paid').length;

  return (
    <div>
      <PageHeader
        title="Ausgaben"
        icon={<DollarSign className="h-6 w-6" />}
        actions={
          <div className="flex items-center gap-3">
            <Button
              as={Link}
              to="/recurring-expense/new"
              className="bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white shadow-lg shadow-[#F97316]/20 hover:shadow-[#F97316]/40 font-medium hidden lg:inline-flex"
              startContent={<Repeat size={18} />}
            >
              Wiederkehrende Ausgabe
            </Button>
            <Button
              as={Link}
              to="/recurring-expense/new"
              className="bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white shadow-lg shadow-[#F97316]/20 hover:shadow-[#F97316]/40 font-medium inline-flex lg:hidden"
              isIconOnly
            >
              <Repeat size={18} />
            </Button>
            
            <Button
              as={Link}
              to="/expense/new"
              className="bg-gradient-to-r from-[#00E5FF] to-[#34F0B1] text-white shadow-lg shadow-[#00E5FF]/20 hover:shadow-[#00E5FF]/40 font-medium hidden lg:inline-flex"
              startContent={<Plus size={18} />}
            >
              Einmalige Ausgabe
            </Button>
            <Button
              as={Link}
              to="/expense/new"
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
              placeholder="Ausgaben durchsuchen..."
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
                {filteredAndSortedExpenses.length}
              </div>
            )}
        </div>
      </PageHeader>

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
         {/* Stats */}
         <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 lg:flex-1">
            <div className="bg-[#16232B]/40 border border-[#2A3C4D]/50 rounded-2xl p-4 flex items-center gap-4 backdrop-blur-sm">
                <div className="p-2.5 rounded-xl bg-[#1E2A36] text-[#F97316] border border-[#2A3C4D]">
                    <DollarSign size={20} />
                </div>
                <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#64748B] font-medium">Gesamt</p>
                    <p className="text-2xl font-bold text-[#E2E8F0] leading-none">{totalExpenses}</p>
                </div>
            </div>
            
            <div className="bg-[#16232B]/40 border border-[#2A3C4D]/50 rounded-2xl p-4 flex items-center gap-4 backdrop-blur-sm">
                <div className="p-2.5 rounded-xl bg-[#1E2A36] text-[#EF4444] border border-[#2A3C4D]">
                    <div className="w-5 h-5 rounded-full border-2 border-[#EF4444] flex items-center justify-center">
                        <div className="w-2 h-2 bg-[#EF4444] rounded-full"></div>
                    </div>
                </div>
                <div>
                    <p className="text-[10px] uppercase tracking-wider text-[#64748B] font-medium">Fällig</p>
                    <p className="text-2xl font-bold text-[#EF4444] leading-none">{dueExpenses}</p>
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
                    <p className="text-2xl font-bold text-[#34F0B1] leading-none">{paidExpenses}</p>
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
                    onClick={() => setStatusFilter('due')}
                    variant={statusFilter === 'due' ? 'solid' : 'light'}
                    className={`text-sm font-medium ${statusFilter === 'due' ? 'bg-[#1E2A36] text-[#EF4444] shadow-sm border border-[#2A3C4D]' : 'text-[#64748B] hover:text-[#EF4444]'}`}
                >
                    Fällig
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

      <ExpenseList 
        expenses={filteredAndSortedExpenses}
        onDelete={handleDelete}
        onStatusToggle={handleStatusToggle}
        requestSort={requestSort}
        sortConfig={sortConfig}
      />
    </div>
  );
};

export default Expenses;
