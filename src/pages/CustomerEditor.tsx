import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@heroui/react';
import { CustomerData } from '../types';
import { getCustomerById, saveCustomer, createNewCustomer } from '../services/customerService';
import CustomerForm from '../components/CustomerForm';
import { Users, Save, X } from 'lucide-react';

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
        {/* Header with Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[#00E5FF]/20 to-[#34F0B1]/10 border border-[#1E2A36]">
              <Users className="h-8 w-8 text-[#00E5FF]" />
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
                {id ? 'Kunde bearbeiten' : 'Neuen Kunden anlegen'}
              </h1>
            </div>
          </div>
        </div>

        {/* Gradient Line Separator */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#00E5FF]/30 to-transparent mb-8" />

        
        {/* Main Content */}
        <main className="max-w-2xl mx-auto">
          <div className="bg-gradient-to-br from-[#111B22]/80 to-[#16232B]/60 p-8 rounded-2xl backdrop-blur-xl shadow-2xl border border-[#1E2A36]">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-gradient-to-br from-[#00E5FF]/20 to-[#34F0B1]/10 border border-[#1E2A36]">
                <Users className="h-5 w-5 text-[#00E5FF]" />
              </div>
              <h2 className="text-2xl font-bold text-[#E2E8F0]">Kundendaten</h2>
            </div>

            

        


            <CustomerForm
              data={customerData}
              onDataChange={handleDataChange}
            />
          </div>
        </main>
        {/* Action Button */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 mt-8">
          <Button
            onClick={() => navigate('/customers')}
            className="bg-[#16232B] border border-[#64748B]/30 text-[#E2E8F0] hover:bg-[#1E2A36] hover:border-[#64748B]/50"
            variant="solid"
            size="lg"
            radius="lg"
            startContent={<X className="h-5 w-5" />}
          >
            Abbrechen
          </Button>

          <Button
            onClick={handleSave}
            isLoading={isSaving}
            className="bg-gradient-to-r from-[#00E5FF] to-[#34F0B1] text-white shadow-lg shadow-[#00E5FF]/25 hover:shadow-xl hover:shadow-[#00E5FF]/30"
            variant="solid"
            size="lg"
            radius="lg"
            startContent={!isSaving && <Save className="h-5 w-5" />}
          >
            {!isSaving && (id ? 'Änderungen speichern' : 'Kunden anlegen')}
          </Button>
        </div>
    </div>
  );
};

export default CustomerEditor;
