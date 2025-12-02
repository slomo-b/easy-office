
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Spinner } from '@heroui/react';
import { InvoiceData, CustomerData, InvoiceItem, SettingsData } from '../types';
import { getInvoiceById, saveInvoice, createNewInvoice, calculateInvoiceTotals } from '../services/invoiceService';
import { getCustomers } from '../services/customerService';
import { getSettings } from '../services/settingsService';
import { generateQrCode } from '../services/qrBillService';
import InvoiceForm from '../components/InvoiceForm';
import InvoicePreview from '../components/InvoicePreview';
import HtmlEditor from '../components/HtmlEditor';
import { Download, X, FileText, Save } from 'lucide-react';
import PageHeader from '../components/PageHeader';
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
        const [fetchedCustomers, fetchedSettings] = await Promise.all([
            getCustomers(),
            getSettings(),
        ]);
        setCustomers(fetchedCustomers);
        setSettings(fetchedSettings);

        if (id) {
          const existingInvoice = await getInvoiceById(id);
          if (existingInvoice) {
            setInvoiceData(existingInvoice);
          } else {
            navigate('/invoices'); // Invoice not found, redirect
          }
        } else {
          const newInvoice = await createNewInvoice(fetchedSettings);
          setInvoiceData(newInvoice);
        }
    };
    loadData();
  }, [id, navigate]);
  

  const regenerateQrCode = useCallback(async () => {
    if (!invoiceData || !invoiceData.total || Number(invoiceData.total) <= 0) {
        setQrCodeSvg('');
        setIsLoadingQr(false);
        return;
    };
    setIsLoadingQr(true);
    try {
      const svg = await generateQrCode(invoiceData);
      setQrCodeSvg(svg);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      setQrCodeSvg('');
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

        let updatedData: InvoiceData = { ...prev, [field]: value };

        if (field === 'items' || field === 'vatEnabled') {
            const items = field === 'items' ? value : updatedData.items;
            const vatEnabled = field === 'vatEnabled' ? value : updatedData.vatEnabled;

            // When toggling vatEnabled, update vatRate on items
            if (field === 'vatEnabled' && settings) {
                const updatedItems = items.map((item: InvoiceItem) => ({
                    ...item,
                    vatRate: vatEnabled ? (item.vatRate || settings.vatRate) : ''
                }));
                updatedData.items = updatedItems;
            }
            
            const { subtotal, vatAmount, total } = calculateInvoiceTotals(updatedData.items, vatEnabled);
            updatedData = { ...updatedData, subtotal, vatAmount, total };
        }
        
        // When invoice number changes, also update the reference number
        if (field === 'unstructuredMessage') {
            updatedData.reference = value;
        }
        
        return updatedData;
    });
  };
  
  const handleTemplateChange = (template: string) => {
    setInvoiceData(prev => prev ? { ...prev, htmlTemplate: template } : null);
  };
  
  const fullHtml = useMemo(() => {
    if (!invoiceData) return '';

    const formatAmount = (amount: number | '') => {
        if (amount === '') return '...';
        return Number(amount).toFixed(2);
    }
  
    const logoHtml = invoiceData.logoSrc
      ? `<img src="${invoiceData.logoSrc}" alt="Firmenlogo" style="max-height: 80px;"/>`
      : `<div class="h-20 w-40 flex items-center justify-center text-[#64748B] text-sm" style="background-color: #16232B; border: 1px dashed #64748B; border-radius: 0.5rem;">Ihr Logo</div>`;

    let qrBillHtml: string;
    if (isLoadingQr) {
      qrBillHtml = `<div style="height: 105mm; display: flex; align-items: center; justify-content: center;" class="bg-[#16232B] animate-pulse text-[#64748B]">Generiere QR-Rechnung...</div>`;
    } else if (qrCodeSvg) {
      qrBillHtml = qrCodeSvg;
    } else {
      qrBillHtml = `<div style="height: 105mm; display: flex; align-items: center; justify-content: center;" class="bg-[#1E2A36] text-center text-xs text-[#64748B] p-2 border border-dashed border-[#64748B]/30" style="border-color: #64748B;">QR-Rechnung kann nicht generiert werden.<br/>(Betrag muss grösser als 0 sein)</div>`;
    }
    
    const itemsHtml = invoiceData.items.map((item, index) => {
      const quantity = Number(item.quantity);
      const price = Number(item.price);
      const total = quantity * price;
      const isEven = index % 2 === 0;
      const rowClass = isEven ? 'bg-[#16232B]' : 'bg-[#1E2A36]';

      return `
          <tr class="${rowClass}">
              <td class="py-3 px-4 text-[#E2E8F0]">${item.description}</td>
              <td class="text-right py-3 px-4 text-[#94A3B8]">${quantity.toFixed(2)} ${item.unit}</td>
              <td class="text-right py-3 px-4 text-[#94A3B8]">${formatAmount(price)}</td>
              <td class="text-right py-3 px-4 font-semibold text-[#00E5FF]">${formatAmount(total)}</td>
          </tr>
      `;
    }).join('');
    
    const projectLineHtml = invoiceData.projectName
      ? `<p><span class="font-semibold text-[#94A3B8]">Projekt:</span> ${invoiceData.projectName}</p>`
      : '';

    const totalsBlockHtml = invoiceData.vatEnabled
      ? `<div class="text-sm">
          <div class="flex justify-between py-1 text-[#94A3B8]"><span>Zwischentotal</span><span>${invoiceData.currency} ${formatAmount(invoiceData.subtotal)}</span></div>
          <div class="flex justify-between py-1 text-[#94A3B8]"><span>MwSt.</span><span>${invoiceData.currency} ${formatAmount(invoiceData.vatAmount)}</span></div>
          <div class="flex justify-between py-2 font-bold text-xl text-[#00E5FF] border-t border-[#64748B]/50 mt-2"><span>Total</span><span>${invoiceData.currency} ${formatAmount(invoiceData.total)}</span></div>
         </div>`
      : `<div class="flex justify-between py-2 font-bold text-xl text-[#00E5FF]"><span>Total</span><span>${invoiceData.currency} ${formatAmount(invoiceData.total)}</span></div>`;
  
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
      .replace(/{{amount}}/g, formatAmount(invoiceData.total))
      .replace(/{{reference}}/g, invoiceData.reference)
      .replace(/{{unstructuredMessage}}/g, invoiceData.unstructuredMessage)
      .replace(/{{date}}/g, new Date(invoiceData.createdAt).toLocaleDateString('de-CH'));
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
    printContainer.innerHTML = fullHtml;
    
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
        
        const contentHeight = canvas.height * 210 / canvas.width;
        const pageCount = Math.ceil(contentHeight / 297);
        
        for (let i = 0; i < pageCount; i++) {
            if (i > 0) {
                pdf.addPage();
            }
            pdf.addImage(imgData, 'PNG', 0, -i * 297, 210, contentHeight);
        }

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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="h-80 bg-[#16232B] rounded-2xl animate-pulse" />
              <div className="h-96 bg-[#16232B] rounded-2xl animate-pulse" />
            </div>
            <div className="h-[500px] bg-[#16232B] rounded-2xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
        {isZoomModalOpen && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4" onClick={() => setIsZoomModalOpen(false)}>
                <div
                    className="relative bg-gradient-to-br from-[#111B22]/95 to-[#16232B]/90 rounded-3xl shadow-2xl border border-[#1E2A36] overflow-hidden w-full max-w-6xl h-[95vh]"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="absolute top-4 right-4 z-20 p-1.5 bg-[#0B141A] border border-[#1E2A36] text-[#64748B] rounded-xl hover:text-[#E2E8F0] hover:border-[#00E5FF]/50 transition-all duration-200 opacity-80 hover:opacity-100">
                        <X size={20} className="cursor-pointer" onClick={() => setIsZoomModalOpen(false)} />
                    </div>

                    <div className="p-4 border-b border-[#64748B]/30">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-xl bg-gradient-to-br from-[#00E5FF]/20 to-[#34F0B1]/10 border border-[#1E2A36]">
                                <FileText className="h-6 w-6 text-[#00E5FF]" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-[#E2E8F0]">Vollbild-Vorschau</h3>
                                <p className="text-[#94A3B8] text-sm">Live-Rechnungsvorschau - klicke ausserhalb um zu schliessen</p>
                            </div>
                        </div>
                    </div>

                    <div className="overflow-y-auto h-full p-6">
                        <div className="bg-white rounded-lg shadow-inner p-6 min-h-[600px]">
                            <div dangerouslySetInnerHTML={{ __html: fullHtml }} />
                        </div>
                    </div>
                </div>
            </div>
        )}

        <PageHeader
            title={id ? 'Rechnung bearbeiten' : 'Neue Rechnung erstellen'}
            icon={<FileText className="h-6 w-6" />}
            actions={
                <>
                    <Button
                        onClick={handlePrintPdf}
                        isLoading={isPrinting}
                        className="bg-gradient-to-r from-[#00E5FF] to-[#34F0B1] text-white shadow-lg shadow-[#00E5FF]/20 hover:shadow-[#00E5FF]/40 font-medium"
                        startContent={!isPrinting && <Download size={18} />}
                    >
                        {!isPrinting && 'PDF exportieren'}
                    </Button>
                    <Button
                        onClick={handleSave}
                        isLoading={isSaving}
                        className="bg-gradient-to-r from-[#00E5FF] to-[#34F0B1] text-white shadow-lg shadow-[#00E5FF]/20 hover:shadow-[#00E5FF]/40 font-medium"
                        startContent={!isSaving && <Save size={18} />}
                    >
                        {!isSaving && (id ? 'Speichern' : 'Erstellen')}
                    </Button>
                </>
            }
        />
        
        <main className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 flex flex-col gap-6">
              <div className="bg-gradient-to-br from-[#111B22]/80 to-[#16232B]/60 p-6 rounded-2xl backdrop-blur-xl shadow-2xl border border-[#1E2A36]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-[#00E5FF]/20 to-[#34F0B1]/10 border border-[#1E2A36]">
                    <FileText className="h-5 w-5 text-[#00E5FF]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#E2E8F0]">Rechnungsdaten</h2>
                </div>
                <InvoiceForm data={invoiceData} customers={customers} onDataChange={handleDataChange} defaultVatRate={settings.vatRate} />
              </div>

              <div className="bg-gradient-to-br from-[#111B22]/80 to-[#16232B]/60 p-6 rounded-2xl backdrop-blur-xl shadow-2xl border border-[#1E2A36]">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-[#00E5FF]/20 to-[#34F0B1]/10 border border-[#1E2A36]">
                    <FileText className="h-5 w-5 text-[#00E5FF]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#E2E8F0]">HTML-Template</h2>
                </div>
                <HtmlEditor template={invoiceData.htmlTemplate} onTemplateChange={handleTemplateChange} />
              </div>
            </div>

            <div className="w-full lg:w-[420px] flex-shrink-0">
              <div className="sticky top-8 space-y-4">
                <div className="bg-gradient-to-br from-[#111B22]/80 to-[#16232B]/60 p-6 rounded-2xl backdrop-blur-xl shadow-2xl border border-[#1E2A36]">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-[#00E5FF]/20 to-[#34F0B1]/10 border border-[#1E2A36]">
                      <FileText className="h-5 w-5 text-[#00E5FF]" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#E2E8F0]">Live-Vorschau</h2>
                  </div>

                  <InvoicePreview
                      processedTemplate={fullHtml}
                      onZoomClick={() => setIsZoomModalOpen(true)}
                  />
                </div>
              </div>
            </div>
        </main>
    </div>
  );
};

export default InvoiceEditor;
