import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@heroui/react';
import { ServiceData } from '../types';
import { getServiceById, saveService, createNewService } from '../services/serviceService';
import ServiceForm from '../components/ServiceForm';
import { Briefcase, Save, X } from 'lucide-react';
import PageHeader from '../components/PageHeader';

const ServiceEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [serviceData, setServiceData] = useState<ServiceData | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    const loadService = async () => {
        if (id) {
          const existingService = await getServiceById(id);
          if (existingService) {
            setServiceData(existingService);
          } else {
            navigate('/services'); 
          }
        } else {
          setServiceData(createNewService());
        }
    };
    loadService();
  }, [id, navigate]);

  const handleDataChange = (field: keyof ServiceData, value: string | number) => {
    setServiceData(prev => prev ? { ...prev, [field]: value } : null);
  };
  
  const handleSave = async () => {
    if (serviceData) {
      setIsSaving(true);
      await saveService(serviceData);
      setIsSaving(false);
      navigate('/services');
    }
  };
  
  if (!serviceData) {
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
            title={id ? 'Leistung bearbeiten' : 'Neue Leistung anlegen'}
            icon={<Briefcase className="h-6 w-6" />}
            actions={
                <>
                    <Button
                        onClick={() => navigate('/services')}
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
                <Briefcase className="h-5 w-5 text-[#00E5FF]" />
              </div>
              <h2 className="text-2xl font-bold text-[#E2E8F0]">Leistungsdaten</h2>
            </div>

            <ServiceForm
              data={serviceData}
              onDataChange={handleDataChange}
            />
          </div>
        </main>
    </div>
  );
};

export default ServiceEditor;
