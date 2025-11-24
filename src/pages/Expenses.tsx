import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Input, Button, Tabs, Tab, Spinner } from '@heroui/react';
import { ExpenseData, RecurringExpenseData } from '../types';
import { getExpenses, deleteExpense, saveExpense, createNewExpense } from '../services/expenseService';
import { getRecurringExpenses, deleteRecurringExpense, saveRecurringExpense, calculateNextDueDate } from '../services/recurringExpenseService';
import { Repeat, Search, Plus } from 'lucide-react';
import ExpenseList from '../components/ExpenseList';

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
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-bold text-foreground mb-2">Ausgaben</h2>
          <p className="text-default-500">Verwalte deine Ausgaben und wiederkehrende Kosten</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            as={Link}
            to="/recurring-expense/new"
            variant="bordered"
            startContent={<Repeat className="h-4 w-4" />}
          >
            Wiederkehrende Ausgabe
          </Button>
          <Button
            as={Link}
            to="/expense/new"
            color="primary"
            startContent={<Plus className="h-4 w-4" />}
          >
            Einmalige Ausgabe
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <Input
          type="text"
          placeholder="Ausgaben durchsuchen..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          startContent={<Search className="h-4 w-4 text-default-400" />}
          className="flex-1"
          variant="bordered"
        />
        <Tabs
          selectedKey={statusFilter}
          onSelectionChange={(key) => setStatusFilter(key as typeof statusFilter)}
          variant="underlined"
          classNames={{
            tabList: "gap-6 w-full relative rounded-none p-0 border-b border-divider",
            cursor: "w-full bg-primary",
            tab: "max-w-fit px-0 h-12",
            tabContent: "group-data-[selected=true]:text-primary"
          }}
        >
          <Tab key="all" title="Alle" />
          <Tab key="due" title="Fällig" />
          <Tab key="paid" title="Bezahlt" />
        </Tabs>
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
