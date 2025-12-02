import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button, Chip, Spinner } from '@heroui/react';
import { ExpenseData } from '../types';
import { getExpenseById, saveExpense, createNewExpense } from '../services/expenseService';
import ExpenseForm from '../components/ExpenseForm';
import { CheckCircle, XCircle, DollarSign, Save, X } from 'lucide-react';
import PageHeader from '../components/PageHeader';

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
  
  const handleStatusToggle = () => {
    setExpenseData(prev => {
        if (!prev) return null;
        const isPaid = prev.status === 'paid';
        return {
            ...prev,
            status: isPaid ? 'due' : 'paid',
            paidAt: isPaid ? null : new Date().toISOString(),
        };
    });
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
  
  const handleCancel = () => {
      if (expenseData && expenseData.projectId) {
          navigate(`/project/edit/${expenseData.projectId}`);
      } else {
          navigate('/expenses');
      }
  };

  return (
    <div>
        <PageHeader
            title={id ? 'Ausgabe bearbeiten' : 'Neue Ausgabe erfassen'}
            icon={<DollarSign className="h-6 w-6" />}
            actions={
                <div className="flex items-center gap-3">
                    <Button
                        onClick={handleCancel}
                        className="bg-[#16232B] border border-[#64748B]/30 text-[#E2E8F0] hover:bg-[#1E2A36] hover:border-[#64748B]/50 font-medium"
                        variant="solid"
                        startContent={<X className="h-4 w-4" />}
                    >
                        Abbrechen
                    </Button>

                    {expenseData.status === 'due' ? (
                      <Button
                        onClick={handleStatusToggle}
                        className="bg-[#16232B] border border-[#34F0B1]/30 text-[#34F0B1] hover:bg-[#34F0B1]/10 font-medium"
                        variant="solid"
                        startContent={<CheckCircle className="h-4 w-4" />}
                      >
                        Als bezahlt markieren
                      </Button>
                    ) : (
                      <Button
                        onClick={handleStatusToggle}
                        className="bg-[#16232B] border border-[#FF6B35]/30 text-[#FF6B35] hover:bg-[#FF6B35]/10 font-medium"
                        variant="solid"
                        startContent={<XCircle className="h-4 w-4" />}
                      >
                        Zahlung zurücksetzen
                      </Button>
                    )}

                    <Button
                        onClick={handleSave}
                        isLoading={isSaving}
                        className="bg-gradient-to-r from-[#00E5FF] to-[#34F0B1] text-white shadow-lg shadow-[#00E5FF]/20 hover:shadow-[#00E5FF]/40 font-medium"
                        variant="solid"
                        startContent={!isSaving && <Save className="h-4 w-4" />}
                    >
                        Speichern
                    </Button>
                </div>
            }
        />

        {/* Main Content */}
        <main className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-[#111B22]/80 to-[#16232B]/60 p-8 rounded-2xl backdrop-blur-xl shadow-2xl border border-[#1E2A36]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#00E5FF]/20 to-[#34F0B1]/10 border border-[#1E2A36]">
                <DollarSign className="h-5 w-5 text-[#00E5FF]" />
              </div>
              <h2 className="text-2xl font-bold text-[#E2E8F0]">Ausgabedaten</h2>
            </div>

            <ExpenseForm
              data={expenseData}
              onDataChange={handleDataChange}
            />
          </div>
        </main>
    </div>
  );
};

export default ExpenseEditor;
