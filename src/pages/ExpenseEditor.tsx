import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ExpenseData } from '../types';
import { getExpenseById, saveExpense, createNewExpense } from '../services/expenseService';
import ExpenseForm from '../components/ExpenseForm';

const ExpenseEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [expenseData, setExpenseData] = useState<ExpenseData | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    const loadExpense = async () => {
        if (id) {
          const existingExpense = await getExpenseById(id);
          if (existingExpense) {
            setExpenseData(existingExpense);
          } else {
            navigate('/expenses'); // Expense not found, redirect
          }
        } else {
          const searchParams = new URLSearchParams(location.search);
          const projectId = searchParams.get('projectId') || undefined;
          setExpenseData(createNewExpense(projectId));
        }
    };
    loadExpense();
  }, [id, navigate, location.search]);

  const handleDataChange = (field: keyof ExpenseData, value: string | number) => {
    setExpenseData(prev => prev ? { ...prev, [field]: value } : null);
  };
  
  const handleSave = async () => {
    if (expenseData) {
      setIsSaving(true);
      await saveExpense(expenseData);
      setIsSaving(false);
      if (expenseData.projectId) {
          navigate(`/project/edit/${expenseData.projectId}`);
      } else {
          navigate('/expenses');
      }
    }
  };
  
  if (!expenseData) {
    return <div className="text-center p-10">Lade Ausgabedaten...</div>;
  }
  
  const handleCancel = () => {
      if (expenseData && expenseData.projectId) {
          navigate(`/project/edit/${expenseData.projectId}`);
      } else {
          navigate('/expenses');
      }
  };

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-white">{id ? 'Ausgabe bearbeiten' : 'Neue Ausgabe erfassen'}</h2>
            <div>
                <button
                    onClick={handleCancel}
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
            <ExpenseForm 
                data={expenseData}
                onDataChange={handleDataChange}
            />
        </main>
    </div>
  );
};

export default ExpenseEditor;
