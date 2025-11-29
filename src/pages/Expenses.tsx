import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Input, Button, Spinner } from '@heroui/react';
import { ExpenseData, RecurringExpenseData } from '../types';
import { getExpenses, deleteExpense, saveExpense, createNewExpense } from '../services/expenseService';
import { getRecurringExpenses, deleteRecurringExpense, saveRecurringExpense, calculateNextDueDate } from '../services/recurringExpenseService';
import { Repeat, Search, Plus, DollarSign, CreditCard } from 'lucide-react';
import ExpenseList from '../../components/ExpenseList';

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

    if (window.confirm(confirmationMessage)) {
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
    <div className="space-y-8">
      {/* Header with Title and Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#FC5445]/20 to-[#F97316]/10 border border-[#1E2A36]">
            <DollarSign className="h-8 w-8 text-[#FC5445]" />
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
              Ausgaben
            </h1>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            as={Link}
            to="/recurring-expense/new"
            className="bg-gradient-to-r from-[#F97316] to-[#FC5445] text-white shadow-lg shadow-[#FC5445]/25 hover:shadow-xl hover:shadow-[#FC5445]/30"
            radius="lg"
            size="lg"
            startContent={<Repeat className="h-5 w-5" />}
          >
            Wiederkehrende Ausgabe
          </Button>
          <Button
            as={Link}
            to="/expense/new"
            className="bg-gradient-to-r from-[#00E5FF] to-[#34F0B1] text-white shadow-lg shadow-[#00E5FF]/25 hover:shadow-xl hover:shadow-[#00E5FF]/30"
            radius="lg"
            size="lg"
            startContent={<Plus className="h-5 w-5" />}
          >
            Einmalige Ausgabe
          </Button>
        </div>
      </div>

      <div className="h-px bg-gradient-to-r from-transparent via-[#FC5445]/30 to-transparent" />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-[#111B22]/80 to-[#16232B]/60 border border-[#1E2A36] rounded-xl p-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-[#F97316]" />
            <div>
              <p className="text-sm text-[#64748B] uppercase tracking-wider">Gesamt</p>
              <p className="text-2xl font-bold text-[#E2E8F0]">{totalExpenses}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#111B22]/80 to-[#16232B]/60 border border-[#1E2A36] rounded-xl p-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#F9174A] to-[#FC5445] flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full" />
            </div>
            <div>
              <p className="text-sm text-[#64748B] uppercase tracking-wider">Fällig</p>
              <p className="text-2xl font-bold text-[#FC5445]">{dueExpenses}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-[#111B22]/80 to-[#16232B]/60 border border-[#1E2A36] rounded-xl p-4 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#A7F3D0] to-[#34F0B1] flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full" />
            </div>
            <div>
              <p className="text-sm text-[#64748B] uppercase tracking-wider">Bezahlt</p>
              <p className="text-2xl font-bold text-[#34F0B1]">{paidExpenses}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-6 mb-8">
        {/* Search Input Container */}
        <div className="flex-1 relative min-w-0 bg-[#16232B] border border-[#1E2A36] rounded-2xl shadow-xl h-full">
          <div className="relative group h-full">
            <div className="absolute inset-0 bg-gradient-to-r from-[#00E5FF] to-[#34F0B1] rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-sm" />
            <Input
              label=" "
              placeholder="Ausgaben durchsuchen..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              startContent={
                <div className="flex items-center justify-center h-6 w-6 my-auto">
                  <Search className="h-4 w-4 text-[#94A3B8] group-hover:text-[#E2E8F0] transition-colors duration-300" />
                </div>
              }
              className="w-full"
              classNames={{
                input: "bg-[#16232B] border-[#1E2A36] text-[#E2E8F0] placeholder:text-[#64748B] h-[42px] py-0",
                inputWrapper: "bg-[#16232B] border-2 border-[#1E2A36] hover:border-[#00E5FF]/40 focus:border-[#00E5FF] hover:shadow-lg hover:shadow-[#00E5FF]/10 focus:shadow-none transition-all duration-300 rounded-[16px] h-[52px] py-0",
                label: "text-[#94A3B8]",
                base: "relative h-[52px]",
                innerWrapper: "items-center h-[42px]"
              }}
            />

            {/* Search Results Indicator */}
            {searchQuery && (
              <div className="absolute -top-2 -right-2 bg-gradient-to-r from-[#00E5FF] to-[#34F0B1] text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
                {filteredAndSortedExpenses.length}
              </div>
            )}
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="relative">
          <div className="flex items-center gap-2 bg-[#16232B] border-2 border-[#1E2A36] rounded-2xl p-2 shadow-xl h-full">
            {/* Tab: Alle */}
            <button
              onClick={() => setStatusFilter('all')}
              className={`relative px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
                statusFilter === 'all'
                  ? 'bg-gradient-to-r from-[#00E5FF] to-[#34F0B1] text-white shadow-lg scale-105'
                  : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1E2A36]'
              }`}
            >
              <span className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                  statusFilter === 'all' ? 'bg-white' : 'bg-[#00E5FF]'
                }`} />
                Alle
              </span>
            </button>

            {/* Tab: Fällig */}
            <button
              onClick={() => setStatusFilter('due')}
              className={`relative px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                statusFilter === 'due'
                  ? 'bg-gradient-to-r from-[#F9174A] to-[#FC5445] text-white shadow-lg scale-105'
                  : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1E2A36]'
              }`}
            >
              <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                statusFilter === 'due' ? 'bg-white' : 'bg-[#FC5445]'
              }`} />
              Fällig
            </button>

            {/* Tab: Bezahlt */}
            <button
              onClick={() => setStatusFilter('paid')}
              className={`relative px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 ${
                statusFilter === 'paid'
                  ? 'bg-gradient-to-r from-[#A7F3D0] to-[#34F0B1] text-white shadow-lg scale-105'
                  : 'text-[#94A3B8] hover:text-[#E2E8F0] hover:bg-[#1E2A36]'
              }`}
            >
              <div className={`w-2 h-2 rounded-full transition-colors duration-300 ${statusFilter === 'paid' ? 'bg-white' : 'bg-[#34F0B1]'}`} />
              Bezahlt
            </button>
          </div>

          {/* Filter Results Counter */}
          {statusFilter !== 'all' && (
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-[#00E5FF] to-[#34F0B1] text-white text-xs px-2 py-1 rounded-full font-medium shadow-lg">
              {statusFilter === 'paid' ? paidExpenses : dueExpenses}
            </div>
          )}
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
