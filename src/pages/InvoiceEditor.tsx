
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { InvoiceData, CustomerData, InvoiceItem, SettingsData } from '../types';
import { getInvoiceById, saveInvoice, createNewInvoice, calculateInvoiceTotals } from '../services/invoiceService';
import { getCustomers } from '../services/customerService';
import { getSettings } from '../services/settingsService';
import { generateQrBillSvg } from '../services/qrBillService';
import InvoiceForm from '../components/InvoiceForm';
import InvoicePreview from '../components/InvoicePreview';
import HtmlEditor from '../components/HtmlEditor';
import { Download, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';


const InvoiceEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [qrCodeSvg, setQrCodeSvg] = useState<string>('');
  const [isLoadingQr, setIsLoadingQr] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);
  const [isZoomModalOpen, setIsZoomModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const loadData = async () => {
        const [fetchedCustomers, fetchedSettings] = await Promise.all([getCustomers(), getSettings()]);
        setCustomers(fetchedCustomers);
        setSettings(fetchedSettings);
        if (id) {
          const existingInvoice = await getInvoiceById(id);
          if (existingInvoice) setInvoiceData(existingInvoice);
          else navigate('/invoices');
        } else {
          const newInvoice = await createNewInvoice(fetchedSettings);
          setInvoiceData(newInvoice);
        }
    };
    loadData();
  }, [id, navigate]);

  useEffect(() => {
      if(invoiceData) {
          setIsLoadingQr(true);
          const svg = generateQrBillSvg(invoiceData);
          setQrCodeSvg(svg);
          setTimeout(() => setIsLoadingQr(false), 50); 
      }
  }, [invoiceData]);

  const handleDataChange = (field: keyof InvoiceData, value: any) => {
    setInvoiceData(prev => {
        if (!prev) return null;
        let updatedData: InvoiceData = { ...prev, [field]: value };
        if (field === 'items' || field === 'vatEnabled') {
            const items = field === 'items' ? value : updatedData.items;
            const vatEnabled = field === 'vatEnabled' ? value : updatedData.vatEnabled;
            if (field === 'vatEnabled' && settings) {
                const updatedItems = items.map((item: InvoiceItem) => ({...item, vatRate: vatEnabled ? (item.vatRate || settings.vatRate) : '' }));
                updatedData.items = updatedItems;
            }
            const { subtotal, vatAmount, total } = calculateInvoiceTotals(updatedData.items, vatEnabled);
            updatedData = { ...updatedData, subtotal, vatAmount, total };
        }
        if (field === 'unstructuredMessage') updatedData.reference = value;
        return updatedData;
    });
  };

  const handleTemplateChange = (template: string) => {
    setInvoiceData(prev => prev ? { ...prev, htmlTemplate: template } : null);
  };
  
  const processedTemplate = useMemo(() => {
    if (!invoiceData) return '';
    const formatAmount = (amount: number | '') => (amount === '' ? '...' : Number(amount).toFixed(2));
    const logoHtml = invoiceData.logoSrc 
      ? `<img src="${invoiceData.logoSrc}" alt="Firmenlogo" style="max-height: 80px;"/>`
      : `<div class="h-20 w-40 flex items-center justify-center text-gray-500 text-sm" style="background-color: #f3f4f6; border: 1px dashed #d1d5db; border-radius: 0.5rem;">Ihr Logo</div>`;
    let qrBillHtml = isLoadingQr 
      ? `<div style="height: 105mm; display: flex; align-items: center; justify-content: center;" class="bg-gray-200 animate-pulse text-gray-500">Generiere QR-Rechnung...</div>`
      : qrCodeSvg || `<div style="height: 105mm; display: flex; align-items: center; justify-content: center;" class="bg-gray-100 text-center text-xs text-gray-500 p-2 border border-dashed border-gray-300">QR-Rechnung kann nicht generiert werden.<br/>(Betrag muss grösser als 0 sein)</div>`;
    const itemsHtml = invoiceData.items.map((item, index) => `
          <tr class="${index % 2 === 0 ? 'bg-gray-50' : ''}">
              <td class="py-3 px-4 text-gray-800">${item.description}</td>
              <td class="text-right py-3 px-4 text-gray-600">${Number(item.quantity).toFixed(2)} ${item.unit}</td>
              <td class="text-right py-3 px-4 text-gray-600">${formatAmount(item.price)}</td>
              <td class="text-right py-3 px-4 font-semibold text-gray-800">${formatAmount(Number(item.quantity) * Number(item.price))}</td>
          </tr>`).join('');
    const projectLineHtml = invoiceData.projectName ? `<p><span class="font-semibold text-gray-600">Projekt:</span> ${invoiceData.projectName}</p>` : '';
    const totalsBlockHtml = invoiceData.vatEnabled
      ? `<div class="text-sm"><div class="flex justify-between py-1 text-gray-600"><span>Zwischentotal</span><span>${invoiceData.currency} ${formatAmount(invoiceData.subtotal)}</span></div><div class="flex justify-between py-1 text-gray-600"><span>MwSt.</span><span>${invoiceData.currency} ${formatAmount(invoiceData.vatAmount)}</span></div><div class="flex justify-between py-2 font-bold text-lg text-gray-900 border-t border-gray-300 mt-2"><span>Total</span><span>${invoiceData.currency} ${formatAmount(invoiceData.total)}</span></div></div>`
      : `<div class="flex justify-between py-2 font-bold text-lg text-gray-900"><span>Total</span><span>${invoiceData.currency} ${formatAmount(invoiceData.total)}</span></div>`;
    return invoiceData.htmlTemplate
      .replace(/{{logoImage}}/g, logoHtml)
      .replace(/{{qrBillSvg}}/g, qrBillHtml)
      .replace(/{{invoiceItems}}/g, itemsHtml)
      .replace(/{{projectLine}}/g, projectLineHtml)
      .replace(/{{totalsBlock}}/g, totalsBlockHtml)
      .replace(/{{creditorName}}/g, invoiceData.creditorName)
      .replace(/{{creditorStreet}}/g, invoiceData.creditorStreet)
      .replace(/{{creditorHouseNr}}/g, invoiceData.creditorHouseNr)
      .replace(/{{creditorZip}}/g, invoiceData.creditorZip)
      .replace(/{{creditorCity}}/g, invoiceData.creditorCity)
      .replace(/{{creditorIban}}/g, invoiceData.creditorIban)
      .replace(/{{debtorName}}/g, invoiceData.debtorName)
      .replace(/{{debtorStreet}}/g, invoiceData.debtorStreet)
      .replace(/{{debtorHouseNr}}/g, invoiceData.debtorHouseNr)
      .replace(/{{debtorZip}}/g, invoiceData.debtorZip)
      .replace(/{{debtorCity}}/g, invoiceData.debtorCity)
      .replace(/{{currency}}/g, invoiceData.currency)
      .replace(/{{date}}/g, new Date(invoiceData.createdAt).toLocaleDateString('de-CH'))
      .replace(/{{unstructuredMessage}}/g, invoiceData.unstructuredMessage)
  }, [invoiceData, qrCodeSvg, isLoadingQr]);

  const handleSave = async () => {
    if (invoiceData) {
      setIsSaving(true);
      await saveInvoice(invoiceData);
      setIsSaving(false);
      navigate('/invoices');
    }
  };
  
  const handlePrintPdf = async () => {
    if (!invoiceData) return;
    setIsPrinting(true);

    const printContainer = document.createElement('div');
    printContainer.style.position = 'absolute';
    printContainer.style.left = '-9999px';
    document.body.appendChild(printContainer);
    printContainer.innerHTML = processedTemplate;
    
    const elementToRender = printContainer.querySelector<HTMLElement>('#print-area');
    if (!elementToRender) {
        console.error("Could not find element with id 'print-area' in the template.");
        document.body.removeChild(printContainer);
        setIsPrinting(false);
        return;
    }

    try {
        const canvas = await html2canvas(elementToRender, {
            scale: 2, // Higher scale for better quality
            useCORS: true,
        });

        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
            orientation: 'p',
            unit: 'mm',
            format: 'a4',
        });
        
        const pdfWidth = 210;
        const pdfHeight = 297;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`rechnung-${invoiceData.unstructuredMessage || 'entwurf'}.pdf`);

    } catch (error) {
        console.error("Error generating PDF:", error);
        alert("PDF konnte nicht generiert werden.");
    } finally {
        document.body.removeChild(printContainer);
        setIsPrinting(false);
    }
  };

  if (!invoiceData || !settings) {
    return <div className="text-center p-10">Lade Rechnungsdaten...</div>;
  }

  return (
    <div>
        {isZoomModalOpen && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setIsZoomModalOpen(false)}>
                <div className="relative bg-white rounded-md shadow-2xl overflow-y-auto h-[95vh] w-auto" style={{ aspectRatio: '210 / 297' }} onClick={e => e.stopPropagation()}>
                    <button 
                        onClick={() => setIsZoomModalOpen(false)} 
                        className="sticky top-2 right-2 z-10 p-1.5 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
                        aria-label="Vorschau schliessen"
                    >
                        <X size={24} />
                    </button>
                    <div dangerouslySetInnerHTML={{ __html: processedTemplate }} />
                </div>
            </div>
        )}

        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-white">{id ? 'Rechnung bearbeiten' : 'Neue Rechnung erstellen'}</h2>
            <div className="flex items-center gap-2">
                 <button
                    onClick={handlePrintPdf}
                    disabled={isPrinting}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2 disabled:bg-gray-500"
                >
                    <Download size={16} />
                    {isPrinting ? 'Generiere PDF...' : 'PDF herunterladen'}
                </button>
                <button onClick={handleSave} disabled={isSaving} className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 disabled:bg-gray-500">
                    {isSaving ? 'Speichern...' : 'Speichern & Schliessen'}
                </button>
            </div>
        </div>
        
        <main className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 flex flex-col gap-6">
              <InvoiceForm data={invoiceData} customers={customers} onDataChange={handleDataChange} defaultVatRate={settings.vatRate} />
              <HtmlEditor template={invoiceData.htmlTemplate} onTemplateChange={handleTemplateChange} />
            </div>
            <div className="w-full lg:w-[420px] flex-shrink-0">
              <div className="sticky top-6">
                  <InvoicePreview processedTemplate={processedTemplate} onZoomClick={() => setIsZoomModalOpen(true)} />
              </div>
            </div>
        </main>
    </div>
  );
};

export default InvoiceEditor;
