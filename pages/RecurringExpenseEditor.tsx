import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RecurringExpenseData } from '../types';
import { getRecurringExpenseById, saveRecurringExpense, createNewRecurringExpense } from '../services/recurringExpenseService';
import RecurringExpenseForm from '../components/RecurringExpenseForm';

const RecurringExpenseEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [expenseData, setExpenseData] = useState<RecurringExpenseData | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    const loadExpense = async () => {
        if (id) {
          const existingExpense = await getRecurringExpenseById(id);
          if (existingExpense) {
            setExpenseData(existingExpense);
          } else {
            navigate('/expenses'); // Expense not found, redirect
          }
        } else {
          setExpenseData(createNewRecurringExpense());
        }
    };
    loadExpense();
  }, [id, navigate]);

  const handleDataChange = (field: keyof RecurringExpenseData, value: string | number) => {
    let updatedData = { ...expenseData, [field]: value } as RecurringExpenseData;
    
    // If startDate changes, also update nextDueDate for new entries
    if (field === 'startDate' && !id) {
        updatedData.nextDueDate = value as string;
    }
    
    setExpenseData(updatedData);
  };
  
  const handleSave = async () => {
    if (expenseData) {
      setIsSaving(true);
      await saveRecurringExpense(expenseData);
      setIsSaving(false);
      navigate('/expenses');
    }
  };
  
  if (!expenseData) {
    return <div className="text-center p-10">Lade Daten...</div>;
  }

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-white">{id ? 'Wiederkehrende Ausgabe bearbeiten' : 'Neue wiederkehrende Ausgabe'}</h2>
            <div>
                <button
                    onClick={() => navigate('/expenses')}
                    className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 mr-4"
                >
                    Abbrechen
                </button>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 disabled:bg-gray-500"
                >
                    {isSaving ? 'Speichern...' : 'Speichern'}
                </button>
            </div>
        </div>
        
        <main className="max-w-2xl mx-auto">
            <RecurringExpenseForm 
                data={expenseData}
                onDataChange={handleDataChange}
            />
        </main>
    </div>
  );
};

export default RecurringExpenseEditor;