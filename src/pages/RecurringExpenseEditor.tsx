import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@heroui/react';
import { RecurringExpenseData } from '../types';
import {
    getRecurringExpenseById,
    saveRecurringExpense,
    createNewRecurringExpense
} from '../services/recurringExpenseService';
import RecurringExpenseForm from '../components/RecurringExpenseForm';
import { DollarSign, Save, X } from 'lucide-react';
import PageHeader from '../components/PageHeader';

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
      
      // The logic to create an initial one-time expense has been removed.
      // We now only save the recurring expense template.
      // The total cost is calculated dynamically on the overview page.
      await saveRecurringExpense(expenseData);

      setIsSaving(false);
      navigate('/expenses');
    }
  };
  
  if (!expenseData) {
    return (
      <div className="space-y-8">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#1E2A36] rounded-xl animate-pulse" />
            <div className="space-y-2">
              <div className="h-10 w-64 bg-[#16232B] rounded-xl animate-pulse" />
              <div className="h-5 w-80 bg-[#64748B]/30 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="max-w-2xl mx-auto">
            <div className="h-96 bg-[#16232B] rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
        <PageHeader
            title={id ? 'Wiederkehrende Ausgabe bearbeiten' : 'Neue wiederkehrende Ausgabe'}
            icon={<DollarSign className="h-6 w-6" />}
            actions={
                <>
                    <Button
                        onClick={() => navigate('/expenses')}
                        className="bg-[#16232B] border border-[#64748B]/30 text-[#E2E8F0] hover:bg-[#1E2A36] hover:border-[#64748B]/50 font-medium"
                        variant="solid"
                        startContent={<X size={18} />}
                    >
                        Abbrechen
                    </Button>
                    <Button
                        onClick={handleSave}
                        isLoading={isSaving}
                        className="bg-gradient-to-r from-[#00E5FF] to-[#34F0B1] text-white shadow-lg shadow-[#00E5FF]/20 hover:shadow-[#00E5FF]/40 font-medium"
                        variant="solid"
                        startContent={!isSaving && <Save size={18} />}
                    >
                        {!isSaving && (id ? 'Speichern' : 'Erstellen')}
                    </Button>
                </>
            }
        />

        {/* Main Content */}
        <main className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-[#111B22]/80 to-[#16232B]/60 p-8 rounded-2xl backdrop-blur-xl shadow-2xl border border-[#1E2A36]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#00E5FF]/20 to-[#34F0B1]/10 border border-[#1E2A36]">
                <DollarSign className="h-5 w-5 text-[#00E5FF]" />
              </div>
              <h2 className="text-2xl font-bold text-[#E2E8F0]">Ausgabendaten</h2>
            </div>

            <RecurringExpenseForm
              data={expenseData}
              onDataChange={handleDataChange}
            />
          </div>
        </main>
    </div>
  );
};

export default RecurringExpenseEditor;
