import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Spinner } from '@heroui/react';
import { CustomerData } from '../types';
import { getCustomerById, saveCustomer, createNewCustomer } from '../services/customerService';
import CustomerForm from '../components/CustomerForm';

const CustomerEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customerData, setCustomerData] = useState<CustomerData | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    const loadCustomer = async () => {
        if (id) {
          const existingCustomer = await getCustomerById(id);
          if (existingCustomer) {
            setCustomerData(existingCustomer);
          } else {
            navigate('/customers'); // Customer not found, redirect
          }
        } else {
          setCustomerData(createNewCustomer());
        }
    };
    loadCustomer();
  }, [id, navigate]);

  const handleDataChange = (field: keyof CustomerData, value: string) => {
    setCustomerData(prev => prev ? { ...prev, [field]: value } : null);
  };
  
  const handleSave = async () => {
    if (customerData) {
      setIsSaving(true);
      await saveCustomer(customerData);
      setIsSaving(false);
      navigate('/customers');
    }
  };
  
  if (!customerData) {
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
              <h2 className="text-4xl font-bold text-foreground mb-2">{id ? 'Kunde bearbeiten' : 'Neuen Kunden anlegen'}</h2>
              <p className="text-default-500">{id ? 'Bearbeite die Kundendaten' : 'Erstelle einen neuen Kunden'}</p>
            </div>
            <div className="flex gap-3">
                <Button
                    variant="bordered"
                    onClick={() => navigate('/customers')}
                >
                    Abbrechen
                </Button>
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
            <CustomerForm 
                data={customerData}
                onDataChange={handleDataChange}
            />
        </main>
    </div>
  );
};

export default CustomerEditor;
