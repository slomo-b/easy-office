import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    return <div className="text-center p-10">Lade Kundendaten...</div>;
  }

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-white">{id ? 'Kunde bearbeiten' : 'Neuen Kunden anlegen'}</h2>
            <div>
                <button
                    onClick={() => navigate('/customers')}
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
            <CustomerForm 
                data={customerData}
                onDataChange={handleDataChange}
            />
        </main>
    </div>
  );
};

export default CustomerEditor;
