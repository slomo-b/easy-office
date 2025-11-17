import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ExpenseData, RecurringExpenseData } from '../types';
import { getExpenses, deleteExpense, saveExpense, createNewExpense } from '../services/expenseService';
import { getRecurringExpenses, deleteRecurringExpense, saveRecurringExpense, calculateNextDueDate } from '../services/recurringExpenseService';
import { Repeat, Search } from 'lucide-react';
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
    return <div className="text-center p-10">Lade Ausgaben...</div>;
  }
  
  const StatusButton: React.FC<{ filterValue: typeof statusFilter, text: string }> = ({ filterValue, text }) => (
    <button
      onClick={() => setStatusFilter(filterValue)}
      className={`px-3 py-1 text-sm rounded-md transition ${statusFilter === filterValue ? 'bg-emerald-500 text-white' : 'bg-gray-700 hover:bg-gray-600'}`}
    >
      {text}
    </button>
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Ausgaben</h2>
        <div className="flex items-center gap-4">
          <Link to="/recurring-expense/new" className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2 text-sm">
            <Repeat className="h-4 w-4" />
            Wiederkehrende Ausgabe
          </Link>
          <Link to="/expense/new" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
            Einmalige Ausgabe
          </Link>
        </div>
      </div>
      
      <div className="mb-4 flex flex-col md:flex-row gap-4">
            <div className="relative flex-grow">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="h-5 w-5 text-gray-400" />
                </span>
                <input
                    type="text"
                    placeholder="Ausgaben durchsuchen..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition"
                />
            </div>
            <div className="flex items-center gap-2 bg-gray-800 p-1 rounded-lg">
                <StatusButton filterValue="all" text="Alle" />
                <StatusButton filterValue="due" text="Fällig" />
                <StatusButton filterValue="paid" text="Bezahlt" />
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
