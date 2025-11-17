import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { InvoiceData } from '../types';
import { getInvoiceById, saveInvoice, createNewInvoice } from '../services/invoiceService';
import { generateQrCode } from '../services/qrBillService';
import InvoiceForm from '../components/InvoiceForm';
import InvoicePreview from '../components/InvoicePreview';
import HtmlEditor from '../components/HtmlEditor';

const InvoiceEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isLoadingQr, setIsLoadingQr] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    const loadInvoice = async () => {
        if (id) {
          const existingInvoice = await getInvoiceById(id);
          if (existingInvoice) {
            setInvoiceData(existingInvoice);
          } else {
            navigate('/invoices'); // Invoice not found, redirect
          }
        } else {
          const newInvoice = await createNewInvoice();
          setInvoiceData(newInvoice);
        }
    };
    loadInvoice();
  }, [id, navigate]);

  const regenerateQrCode = useCallback(async () => {
    if (!invoiceData || !invoiceData.amount) return;
    setIsLoadingQr(true);
    try {
      const url = await generateQrCode(invoiceData);
      setQrCodeDataUrl(url);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      setQrCodeDataUrl('');
    } finally {
      setIsLoadingQr(false);
    }
  }, [invoiceData]);

  useEffect(() => {
    regenerateQrCode();
  }, [regenerateQrCode]);

  const handleDataChange = (field: keyof InvoiceData, value: string | number) => {
    setInvoiceData(prev => prev ? { ...prev, [field]: value } : null);
  };
  
  const handleTemplateChange = (template: string) => {
    setInvoiceData(prev => prev ? { ...prev, htmlTemplate: template } : null);
  };

  const handleLogoChange = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
         setInvoiceData(prev => prev ? { ...prev, logoSrc: e.target?.result as string } : null);
      };
      reader.readAsDataURL(file);
    } else {
       setInvoiceData(prev => prev ? { ...prev, logoSrc: '' } : null);
    }
  };

  const handleSave = async () => {
    if (invoiceData) {
      setIsSaving(true);
      await saveInvoice(invoiceData);
      setIsSaving(false);
      navigate('/invoices');
    }
  };
  
  const handlePrint = () => {
    window.print();
  };

  if (!invoiceData) {
    return <div className="text-center p-10">Lade Rechnungsdaten...</div>;
  }

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-white">{id ? 'Rechnung bearbeiten' : 'Neue Rechnung erstellen'}</h2>
            <div>
                 <button
                    onClick={handlePrint}
                    className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 mr-4"
                >
                    Drucken / PDF
                </button>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 disabled:bg-gray-500"
                >
                    {isSaving ? 'Speichern...' : 'Speichern & Schliessen'}
                </button>
            </div>
        </div>
        
        <main className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-1/3 flex flex-col gap-6">
            <InvoiceForm 
                data={invoiceData}
                onDataChange={handleDataChange}
                onLogoChange={handleLogoChange}
            />
            <HtmlEditor
                template={invoiceData.htmlTemplate}
                onTemplateChange={handleTemplateChange}
            />
            </div>
            
            <div className="lg:w-2/3">
            <InvoicePreview
                data={invoiceData}
                qrCodeSrc={qrCodeDataUrl}
                isLoadingQr={isLoadingQr}
            />
            </div>
        </main>
    </div>
  );
};

export default InvoiceEditor;