import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ExpenseData, RecurringExpenseData } from '../types';
import { getExpenses, deleteExpense, createNewExpense, saveExpense } from '../services/expenseService';
import { getRecurringExpenses, deleteRecurringExpense, saveRecurringExpense, calculateNextDueDate } from '../services/recurringExpenseService';

const Expenses = () => {
  const [expenses, setExpenses] = useState<ExpenseData[]>([]);
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpenseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

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

  const handleCreateExpense = async (recurringExpense: RecurringExpenseData) => {
    setIsProcessing(recurringExpense.id);
    const newExpense = createNewExpense();
    newExpense.date = recurringExpense.nextDueDate;
    newExpense.vendor = recurringExpense.vendor;
    newExpense.description = recurringExpense.description;
    newExpense.amount = recurringExpense.amount;
    newExpense.currency = recurringExpense.currency;
    newExpense.category = recurringExpense.category;
    await saveExpense(newExpense);

    const updatedRecurringExpense = {
        ...recurringExpense,
        nextDueDate: calculateNextDueDate(recurringExpense.nextDueDate, recurringExpense.interval)
    };
    await saveRecurringExpense(updatedRecurringExpense);

    await loadData();
    setIsProcessing(null);
  };

  if (loading) {
    return <div className="text-center p-10">Lade Ausgaben...</div>;
  }
  
  type CombinedExpense = (ExpenseData & { type: 'one-time'; sortDate: string }) | (RecurringExpenseData & { type: 'recurring'; sortDate: string });
        
  const combinedExpenses: CombinedExpense[] = [
    ...expenses.map(e => ({ ...e, type: 'one-time' as const, sortDate: e.date })),
    ...recurringExpenses.map(r => ({ ...r, type: 'recurring' as const, sortDate: r.nextDueDate }))
  ];
        
  combinedExpenses.sort((a, b) => b.sortDate.localeCompare(a.sortDate));

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Ausgaben</h2>
        <div className="flex items-center gap-4">
          <Link to="/recurring-expense/new" className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M15.312 5.312a1 1 0 010 1.414L12.414 10l2.898 2.898a1 1 0 11-1.414 1.414L11 11.414l-2.898 2.898a1 1 0 11-1.414-1.414L9.586 10 6.688 7.102a1 1 0 111.414-1.414L11 8.586l2.898-2.898a1 1 0 011.414 0zM10 18a8 8 0 100-16 8 8 0 000 16z" clipRule="evenodd" /></svg>
            Wiederkehrende Ausgabe
          </Link>
          <Link to="/expense/new" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2 text-sm">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
            Einmalige Ausgabe
          </Link>
        </div>
      </div>
      
      <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Datum / Fälligkeit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Anbieter</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Beschreibung</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Betrag</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Typ</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {combinedExpenses.length > 0 ? combinedExpenses.map(item => {
              const isRecurring = item.type === 'recurring';
              const isDue = isRecurring && new Date(item.nextDueDate) <= today;

              return (
              <tr key={item.id} className="hover:bg-gray-700/50">
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDue ? 'text-yellow-400 font-semibold' : 'text-gray-400'}`}>
                    {new Date(item.sortDate).toLocaleDateString('de-CH')}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{item.vendor}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{item.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-mono">{item.currency} {Number(item.amount).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                    {isRecurring 
                        ? <span className="capitalize">{item.interval === 'monthly' ? 'Monatlich' : item.interval === 'quarterly' ? 'Quartalsweise' : 'Jährlich'}</span>
                        : 'Einmalig'
                    }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                  {isDue && (
                      <button 
                        onClick={() => handleCreateExpense(item)} 
                        disabled={isProcessing === item.id}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-2 rounded text-xs transition-colors duration-300 disabled:bg-gray-500">
                          {isProcessing === item.id ? 'Erstelle...' : 'Ausgabe erstellen'}
                      </button>
                  )}
                  <Link to={isRecurring ? `/recurring-expense/edit/${item.id}` : `/expense/edit/${item.id}`} className="text-emerald-400 hover:text-emerald-300">
                    Bearbeiten
                  </Link>
                  <button onClick={() => handleDelete(item.id, item.type)} className="text-red-500 hover:text-red-400">
                    Löschen
                  </button>
                </td>
              </tr>
            )}) : (
                <tr>
                    <td colSpan={6} className="text-center py-10 text-gray-400">
                        Keine Ausgaben gefunden.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Expenses;