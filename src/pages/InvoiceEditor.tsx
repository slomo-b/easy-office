import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { InvoiceData, CustomerData, InvoiceItem } from '../types';
import { getInvoiceById, saveInvoice, createNewInvoice } from '../services/invoiceService';
import { getCustomers } from '../services/customerService';
import { generateQrCode } from '../services/qrBillService';
import InvoiceForm from '../components/InvoiceForm';
import InvoicePreview from '../components/InvoicePreview';
import HtmlEditor from '../components/HtmlEditor';
import { Download } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const InvoiceEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [qrCodeSvg, setQrCodeSvg] = useState<string>('');
  const [qrError, setQrError] = useState<string | null>(null);
  const [isLoadingQr, setIsLoadingQr] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);

  useEffect(() => {
    const loadData = async () => {
        const fetchedCustomers = await getCustomers();
        setCustomers(fetchedCustomers);

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
    loadData();
  }, [id, navigate]);
  

  const regenerateQrCode = useCallback(async () => {
    if (!invoiceData || !invoiceData.amount || Number(invoiceData.amount) <= 0) {
        setQrCodeSvg('');
        setIsLoadingQr(false);
        return;
    };
    setIsLoadingQr(true);
    try {
      const svg = await generateQrCode(invoiceData);
      setQrCodeSvg(svg);
      setQrError(null);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      setQrCodeSvg('');
      if (error instanceof Error) {
        setQrError(error.message);
      } else {
        setQrError("Unbekannter Fehler bei der QR-Code-Generierung.");
      }
    } finally {
      setIsLoadingQr(false);
    }
  }, [invoiceData]);

  useEffect(() => {
    regenerateQrCode();
  }, [regenerateQrCode]);

  const handleDataChange = (field: keyof InvoiceData, value: any) => {
    setInvoiceData(prev => {
        if (!prev) return null;

        if (field === 'items') {
            const newItems = value as InvoiceItem[];
            const total = newItems.reduce((sum, item) => {
                const quantity = Number(item.quantity) || 0;
                const price = Number(item.price) || 0;
                return sum + (quantity * price);
            }, 0);
            return { ...prev, items: newItems, amount: total };
        }
        
        return { ...prev, [field]: value };
    });
  };
  
  const handleTemplateChange = (template: string) => {
    setInvoiceData(prev => prev ? { ...prev, htmlTemplate: template } : null);
  };

  const handleSave = async () => {
    if (invoiceData) {
      setIsSaving(true);
      await saveInvoice(invoiceData);
      setIsSaving(false);
      navigate('/invoices');
    }
  };
  
  const handleDownloadPdf = () => {
    if (!invoiceData) return;
    setIsDownloadingPdf(true);
    const element = document.getElementById('print-area');
    const opt = {
      margin:       0,
      filename:     `Rechnung-${invoiceData.unstructuredMessage || invoiceData.id}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().from(element).set(opt).save().then(() => {
        setIsDownloadingPdf(false);
    });
  };


  if (!invoiceData) {
    return <div className="text-center p-10">Lade Rechnungsdaten...</div>;
  }

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-white">{id ? 'Rechnung bearbeiten' : 'Neue Rechnung erstellen'}</h2>
            <div className="flex items-center gap-2">
                 <button
                    onClick={handleDownloadPdf}
                    disabled={isDownloadingPdf}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2 disabled:bg-gray-500"
                >
                    <Download size={16} />
                    {isDownloadingPdf ? 'Generiere...' : 'PDF herunterladen'}
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
                customers={customers}
                onDataChange={handleDataChange}
            />
            <HtmlEditor
                template={invoiceData.htmlTemplate}
                onTemplateChange={handleTemplateChange}
            />
            </div>
            
            <div className="lg:w-2/3">
            <InvoicePreview
                data={invoiceData}
                qrCodeSvg={qrCodeSvg}
                qrError={qrError}
                isLoadingQr={isLoadingQr}
            />
            </div>
        </main>
    </div>
  );
};

export default InvoiceEditor;