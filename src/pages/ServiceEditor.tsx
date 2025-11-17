import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ServiceData } from '../types';
import { getServiceById, saveService, createNewService } from '../services/serviceService';
import ServiceForm from '../components/ServiceForm';

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
    return <div className="text-center p-10">Lade Leistungsdaten...</div>;
  }

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-white">{id ? 'Leistung bearbeiten' : 'Neue Leistung anlegen'}</h2>
            <div>
                <button
                    onClick={() => navigate('/services')}
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
            <ServiceForm
                data={serviceData}
                onDataChange={handleDataChange}
            />
        </main>
    </div>
  );
};

export default ServiceEditor;
