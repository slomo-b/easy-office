import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Button, Chip, Spinner } from '@heroui/react';
import { ExpenseData } from '../types';
import { getExpenseById, saveExpense, createNewExpense } from '../services/expenseService';
import ExpenseForm from '../components/ExpenseForm';
import { CheckCircle, XCircle } from 'lucide-react';

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
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner size="lg" color="primary" />
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
    <div className="space-y-6">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
                <div>
                  <h2 className="text-4xl font-bold text-foreground mb-2">{id ? 'Ausgabe bearbeiten' : 'Neue Ausgabe erfassen'}</h2>
                  <p className="text-default-500">{id ? 'Bearbeite die Ausgabedaten' : 'Erfasse eine neue Ausgabe'}</p>
                </div>
                {expenseData.status === 'paid' ? (
                  <Chip color="success" variant="flat" startContent={<CheckCircle size={16} />}>
                    Bezahlt am {expenseData.paidAt ? new Date(expenseData.paidAt).toLocaleDateString('de-CH') : ''}
                  </Chip>
                ) : (
                  <Chip color="warning" variant="flat">
                    Fällig
                  </Chip>
                )}
            </div>
            <div className="flex items-center gap-2">
                <Button
                    variant="bordered"
                    onClick={handleCancel}
                >
                    Abbrechen
                </Button>
                {expenseData.status === 'due' ? (
                    <Button 
                        color="warning" 
                        onClick={handleStatusToggle}
                        startContent={<CheckCircle size={16} />}
                    >
                        Als bezahlt markieren
                    </Button>
                 ) : (
                    <Button 
                        variant="bordered"
                        onClick={handleStatusToggle}
                        startContent={<XCircle size={16} />}
                    >
                        Zahlung zurücksetzen
                    </Button>
                 )}
                <Button
                    color="primary"
                    onClick={handleSave}
                    disabled={isSaving}
                    isLoading={isSaving}
                >
                    {isSaving ? 'Speichern...' : 'Speichern'}
                </Button>
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
