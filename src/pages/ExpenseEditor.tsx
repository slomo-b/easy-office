import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button, Chip, Spinner } from '@heroui/react';
import { ExpenseData } from '../types';
import { getExpenseById, saveExpense, createNewExpense } from '../services/expenseService';
import ExpenseForm from '../components/ExpenseForm';
import { CheckCircle, XCircle, DollarSign, Save, X } from 'lucide-react';

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
        {/* Header with Title and Status */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#FF6B35]/20 to-[#F7931E]/10 border border-[#1E2A36]">
              <DollarSign className="h-8 w-8 text-[#FF6B35]" />
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
                {id ? 'Ausgabe bearbeiten' : 'Neue Ausgabe erfassen'}
              </h1>
            </div>
          </div>

          {expenseData.status === 'paid' ? (
            <div className="bg-gradient-to-r from-[#34F0B1] to-[#00E5FF] px-4 py-2 rounded-full border border-[#1E2A36] shadow-lg shadow-[#34F0B1]/20">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#0B141A]">
                <CheckCircle className="h-4 w-4" />
                <span>Bezahlt am {expenseData.paidAt ? new Date(expenseData.paidAt).toLocaleDateString('de-CH') : ''}</span>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-r from-[#FF6B35]/20 to-[#F7931E]/20 px-4 py-2 rounded-full border border-[#FF6B35]/30">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#FF6B35]">
                <XCircle className="h-4 w-4" />
                <span>Fällig</span>
              </div>
            </div>
          )}
        </div>

        {/* Gradient Line Separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#00E5FF]/30 to-transparent mb-8" />

        

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

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
          <Button
            onClick={handleCancel}
            className="bg-[#16232B] border border-[#64748B]/30 text-[#E2E8F0] hover:bg-[#1E2A36] hover:border-[#64748B]/50"
            variant="solid"
            size="lg"
            radius="lg"
            startContent={<X className="h-5 w-5" />}
          >
            Abbrechen
          </Button>

          <div className="flex gap-3">
            {expenseData.status === 'due' ? (
              <Button
                onClick={handleStatusToggle}
                className="bg-gradient-to-r from-[#34F0B1] to-[#00E5FF] text-white shadow-lg shadow-[#34F0B1]/25 hover:shadow-xl hover:shadow-[#34F0B1]/30"
                variant="solid"
                size="lg"
                radius="lg"
                startContent={<CheckCircle className="h-5 w-5" />}
              >
                Als bezahlt markieren
              </Button>
            ) : (
              <Button
                onClick={handleStatusToggle}
                className="bg-[#16232B] border border-[#64748B]/30 text-[#E2E8F0] hover:bg-[#1E2A36] hover:border-[#64748B]/50"
                variant="solid"
                size="lg"
                radius="lg"
                startContent={<XCircle className="h-5 w-5" />}
              >
                Zahlung zurücksetzen
              </Button>
            )}

            <Button
              onClick={handleSave}
              isLoading={isSaving}
              className="bg-gradient-to-r from-[#00E5FF] to-[#34F0B1] text-white shadow-lg shadow-[#00E5FF]/25 hover:shadow-xl hover:shadow-[#00E5FF]/30"
              variant="solid"
              size="lg"
              radius="lg"
              startContent={!isSaving && <Save className="h-5 w-5" />}
            >
              {!isSaving && (id ? 'Änderungen speichern' : 'Ausgabe erstellen')}
            </Button>
          </div>
        </div>
    </div>
  );
};

export default ExpenseEditor;
