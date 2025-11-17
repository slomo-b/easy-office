import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { RecurringExpenseData } from '../types';
import { getRecurringExpenses, deleteRecurringExpense, saveRecurringExpense, calculateNextDueDate } from '../services/recurringExpenseService';
import { createNewExpense, saveExpense } from '../services/expenseService';


const RecurringExpenses = () => {
  const [recurringExpenses, setRecurringExpenses] = useState<RecurringExpenseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const loadRecurringExpenses = useCallback(async () => {
    setLoading(true);
    const fetchedExpenses = await getRecurringExpenses();
    setRecurringExpenses(fetchedExpenses);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadRecurringExpenses();
  }, [loadRecurringExpenses]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Sind Sie sicher, dass Sie diese wiederkehrende Ausgabe löschen möchten?')) {
      await deleteRecurringExpense(id);
      await loadRecurringExpenses();
    }
  };

  const handleCreateExpense = async (recurringExpense: RecurringExpenseData) => {
    setIsProcessing(recurringExpense.id);
    // 1. Create a new one-time expense
    const newExpense = createNewExpense();
    newExpense.date = recurringExpense.nextDueDate;
    newExpense.vendor = recurringExpense.vendor;
    newExpense.description = recurringExpense.description;
    newExpense.amount = recurringExpense.amount;
    newExpense.currency = recurringExpense.currency;
    newExpense.category = recurringExpense.category;
    await saveExpense(newExpense);

    // 2. Update the next due date of the recurring expense
    const updatedRecurringExpense = {
        ...recurringExpense,
        nextDueDate: calculateNextDueDate(recurringExpense.nextDueDate, recurringExpense.interval)
    };
    await saveRecurringExpense(updatedRecurringExpense);

    // 3. Refresh the list
    await loadRecurringExpenses();
    setIsProcessing(null);
  };

  if (loading) {
    return <div className="text-center p-10">Lade wiederkehrende Ausgaben...</div>;
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-white">Wiederkehrende Ausgaben</h2>
        <Link to="/recurring-expense/new" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" /></svg>
          Neue hinzufügen
        </Link>
      </div>
      
      <div className="bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Anbieter</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Betrag</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Intervall</th>
               <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Nächste Fälligkeit</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">Aktionen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {recurringExpenses.length > 0 ? recurringExpenses.map(expense => {
              const isDue = new Date(expense.nextDueDate) <= today;
              return (
              <tr key={expense.id} className="hover:bg-gray-700/50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white">{expense.vendor}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-mono">{expense.currency} {Number(expense.amount).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 capitalize">{expense.interval === 'monthly' ? 'Monatlich' : expense.interval === 'quarterly' ? 'Quartalsweise' : 'Jährlich' }</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm ${isDue ? 'text-yellow-400' : 'text-gray-400'}`}>{new Date(expense.nextDueDate).toLocaleDateString('de-CH')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                  {isDue && (
                      <button 
                        onClick={() => handleCreateExpense(expense)} 
                        disabled={isProcessing === expense.id}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-1 px-2 rounded text-xs transition-colors duration-300 disabled:bg-gray-500">
                          {isProcessing === expense.id ? 'Erstelle...' : 'Ausgabe erstellen'}
                      </button>
                  )}
                  <Link to={`/recurring-expense/edit/${expense.id}`} className="text-emerald-400 hover:text-emerald-300">
                    Bearbeiten
                  </Link>
                  <button onClick={() => handleDelete(expense.id)} className="text-red-500 hover:text-red-400">
                    Löschen
                  </button>
                </td>
              </tr>
            )}) : (
                <tr>
                    <td colSpan={5} className="text-center py-10 text-gray-400">
                        Keine wiederkehrenden Ausgaben gefunden.
                    </td>
                </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecurringExpenses;
