import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { InvoiceData, CustomerData, InvoiceItem, SettingsData } from '../types';
import { getInvoiceById, saveInvoice, createNewInvoice, calculateInvoiceTotals } from '../services/invoiceService';
import { getCustomers } from '../services/customerService';
import { getSettings } from '../services/settingsService';
import { generateQrCode } from '../services/qrBillService';
import InvoiceForm from '../components/InvoiceForm';
import InvoicePreview from '../components/InvoicePreview';
import { Download, X } from 'lucide-react';
import { Document, Page, View, Text, StyleSheet, Image, Font, PDFViewer } from '@react-pdf/renderer';
import { PDFDownloadLink } from '@react-pdf/renderer';

// --- PDF Document Component ---

// Register fonts - it's good practice for consistency, though Helvetica is standard
Font.register({
  family: 'Helvetica',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/npm/helveticaneue@2.2.0/fonts/Regular/HelveticaNeue-Regular.otf' },
    { src: 'https://cdn.jsdelivr.net/npm/helveticaneue@2.2.0/fonts/Bold/HelveticaNeue-Bold.otf', fontWeight: 'bold' },
  ],
});


const styles = StyleSheet.create({
    page: { 
        fontFamily: 'Helvetica', 
        fontSize: 10, 
        backgroundColor: '#FFFFFF', 
        color: '#1f2937', 
        lineHeight: 1.5,
        paddingHorizontal: 48,
        paddingTop: 48,
        // Reserve space for the fixed QR bill. 105mm is ~298 points. Add buffer.
        paddingBottom: 320,
    },
    header: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start', 
        marginBottom: 64
    },
    headerLogo: { 
        width: '50%' 
    },
    logoImage: { 
        maxHeight: 60, 
        maxWidth: 180 
    },
    headerCreditor: { 
        width: '50%', 
        textAlign: 'right', 
        fontSize: 9,
        color: '#374151'
    },
    creditorName: { 
        fontWeight: 'bold', 
        fontSize: 11,
        color: '#111827'
    },
    metaSection: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        marginBottom: 48
    },
    metaDebtor: { 
        width: '60%' 
    },
    metaInfo: { 
        width: '40%', 
        textAlign: 'right' 
    },
    metaLabel: { 
        fontSize: 8, 
        color: '#6b7280', 
        marginBottom: 2 
    },
    invoiceTitle: { 
        fontSize: 24, 
        fontWeight: 'bold', 
        color: '#059669', 
        marginBottom: 4 
    },
    metaLine: { 
        flexDirection: 'row', 
        justifyContent: 'flex-end', 
        fontSize: 10 
    },
    metaLineLabel: { 
        fontWeight: 'bold', 
        color: '#4b5563' 
    },
    table: { 
        display: 'table', 
        width: 'auto', 
        marginBottom: 48 
    },
    tableHeader: { 
        flexDirection: 'row', 
        backgroundColor: '#1f2937', 
        color: 'white', 
        borderRadius: 4,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
    },
    tableRow: { 
        flexDirection: 'row' 
    },
    tableRowAlt: { 
        backgroundColor: '#f9fafb' 
    },
    th: { 
        padding: '8px 12px', 
        fontWeight: 'bold', 
        fontSize: 9
    },
    td: { 
        padding: '10px 12px', 
        fontSize: 9,
        borderBottom: '1px solid #f3f4f6'
    },
    totalsSection: { 
        flexDirection: 'row', 
        justifyContent: 'flex-end', 
        marginBottom: 64
    },
    totalsBox: { 
        width: '45%', 
        backgroundColor: '#f3f4f6', 
        padding: 12, 
        borderRadius: 6 
    },
    totalLine: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        paddingVertical: 2, 
        fontSize: 10,
        color: '#4b5563'
    },
    totalLineMain: { 
        fontWeight: 'bold', 
        fontSize: 12, 
        marginTop: 6, 
        paddingTop: 6, 
        borderTop: '1px solid #d1d5db',
        color: '#111827'
    },
    footer: { 
        textAlign: 'center', 
        fontSize: 8, 
        color: '#6b7280', 
        borderTop: '1px solid #e5e7eb', 
        paddingTop: 16
    },
    qrBillContainer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        height: '105mm',
    },
});

const InvoicePDF: React.FC<{ invoiceData: InvoiceData; qrCodeSvg: string; }> = ({ invoiceData, qrCodeSvg }) => {
    const formatAmount = (amount: number | '') => Number(amount).toFixed(2);

    return (
        <Document title={`Rechnung-${invoiceData.unstructuredMessage}`}>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLogo}>
                        {invoiceData.logoSrc && <Image src={invoiceData.logoSrc} style={styles.logoImage} />}
                    </View>
                    <View style={styles.headerCreditor}>
                        <Text style={styles.creditorName}>{invoiceData.creditorName}</Text>
                        <Text>{invoiceData.creditorStreet} {invoiceData.creditorHouseNr}</Text>
                        <Text>{invoiceData.creditorZip} {invoiceData.creditorCity}</Text>
                    </View>
                </View>
                {/* Recipient & Meta */}
                <View style={styles.metaSection}>
                    <View style={styles.metaDebtor}>
                        <Text style={styles.metaLabel}>Zahlungspflichtig</Text>
                        <Text style={{ fontWeight: 'bold' }}>{invoiceData.debtorName}</Text>
                        <Text>{invoiceData.debtorStreet} {invoiceData.debtorHouseNr}</Text>
                        <Text>{invoiceData.debtorZip} {invoiceData.debtorCity}</Text>
                    </View>
                    <View style={styles.metaInfo}>
                        <Text style={styles.invoiceTitle}>RECHNUNG</Text>
                        <View style={styles.metaLine}>
                            <Text style={styles.metaLineLabel}>Datum:</Text>
                            <Text> {new Date(invoiceData.createdAt).toLocaleDateString('de-CH')}</Text>
                        </View>
                        <View style={styles.metaLine}>
                            <Text style={styles.metaLineLabel}>Rechnungs-Nr:</Text>
                            <Text> {invoiceData.unstructuredMessage}</Text>
                        </View>
                        {invoiceData.projectName && (
                            <View style={styles.metaLine}>
                                <Text style={styles.metaLineLabel}>Projekt:</Text>
                                <Text> {invoiceData.projectName}</Text>
                            </View>
                        )}
                    </View>
                </View>
                {/* Items Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.th, { width: '50%' }]}>Beschreibung</Text>
                        <Text style={[styles.th, { width: '15%', textAlign: 'right' }]}>Menge</Text>
                        <Text style={[styles.th, { width: '15%', textAlign: 'right' }]}>Preis</Text>
                        <Text style={[styles.th, { width: '20%', textAlign: 'right' }]}>Total</Text>
                    </View>
                    {invoiceData.items.map((item, index) => (
                        <View key={index} style={[styles.tableRow, index % 2 !== 0 && styles.tableRowAlt]}>
                            <Text style={[styles.td, { width: '50%', color: '#374151' }]}>{item.description}</Text>
                            <Text style={[styles.td, { width: '15%', textAlign: 'right', color: '#4b5563' }]}>{Number(item.quantity).toFixed(2)} {item.unit}</Text>
                            <Text style={[styles.td, { width: '15%', textAlign: 'right', color: '#4b5563' }]}>{formatAmount(item.price)}</Text>
                            <Text style={[styles.td, { width: '20%', textAlign: 'right', fontWeight: 'bold', color: '#111827' }]}>{formatAmount(Number(item.quantity) * Number(item.price))}</Text>
                        </View>
                    ))}
                </View>
                {/* Totals */}
                <View style={styles.totalsSection}>
                    <View style={styles.totalsBox}>
                        {invoiceData.vatEnabled ? (
                            <>
                                <View style={styles.totalLine}><Text>Zwischentotal</Text><Text>{invoiceData.currency} {formatAmount(invoiceData.subtotal)}</Text></View>
                                <View style={styles.totalLine}><Text>MwSt.</Text><Text>{invoiceData.currency} {formatAmount(invoiceData.vatAmount)}</Text></View>
                                <View style={[styles.totalLine, styles.totalLineMain]}><Text>Total</Text><Text>{invoiceData.currency} {formatAmount(invoiceData.total)}</Text></View>
                            </>
                        ) : (
                            <View style={[styles.totalLine, styles.totalLineMain]}><Text>Total</Text><Text>{invoiceData.currency} {formatAmount(invoiceData.total)}</Text></View>
                        )}
                    </View>
                </View>
                {/* Footer */}
                <View style={styles.footer}>
                    <Text>Vielen Dank für Ihren Auftrag. Bitte begleichen Sie den Betrag innert 30 Tagen.</Text>
                    <Text>{invoiceData.creditorName} - {invoiceData.creditorIban}</Text>
                </View>
                {/* QR Bill Section */}
                {qrCodeSvg && (
                    <Image src={qrCodeSvg} style={styles.qrBillContainer} />
                )}
            </Page>
        </Document>
    );
};


// --- Main Editor Component ---
const InvoiceEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [customers, setCustomers] = useState<CustomerData[]>([]);
  const [qrCodeSvg, setQrCodeSvg] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
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
        return;
    };
    try {
      const dataUrl = await generateQrCode(invoiceData);
      setQrCodeSvg(dataUrl);
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      setQrCodeSvg('');
    }
  }, [invoiceData]);

  useEffect(() => {
    if (invoiceData) {
        regenerateQrCode();
    }
  }, [invoiceData, regenerateQrCode]);

  const handleDataChange = (field: keyof InvoiceData, value: any) => {
    setInvoiceData(prev => {
        if (!prev) return null;
        let updatedData: InvoiceData = { ...prev, [field]: value };

        if (field === 'items' || field === 'vatEnabled') {
            const items = field === 'items' ? value : updatedData.items;
            const vatEnabled = field === 'vatEnabled' ? value : updatedData.vatEnabled;

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
        
        if (field === 'unstructuredMessage') {
            updatedData.reference = value;
        }
        
        return updatedData;
    });
  };
  
  const handleSave = async () => {
    if (invoiceData) {
      setIsSaving(true);
      await saveInvoice(invoiceData);
      setIsSaving(false);
      navigate('/invoices');
    }
  };
  
  if (!invoiceData || !settings) {
    return <div className="text-center p-10">Lade Rechnungsdaten...</div>;
  }
  
  const invoicePdfDocument = <InvoicePDF invoiceData={invoiceData} qrCodeSvg={qrCodeSvg} />;

  return (
    <div>
        {isZoomModalOpen && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={() => setIsZoomModalOpen(false)}>
                <div className="relative bg-gray-900 rounded-md shadow-2xl h-[95vh] w-[95vw] overflow-hidden flex flex-col" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-end p-2">
                        <button 
                            onClick={() => setIsZoomModalOpen(false)} 
                            className="z-10 p-1.5 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
                            aria-label="Vorschau schliessen"
                        >
                            <X size={24} />
                        </button>
                    </div>
                    <div className="flex-grow min-h-0">
                        <PDFViewer width="100%" height="100%" style={{ border: 'none' }}>
                        {invoicePdfDocument}
                        </PDFViewer>
                    </div>
                </div>
            </div>
        )}

        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-white">{id ? 'Rechnung bearbeiten' : 'Neue Rechnung erstellen'}</h2>
            <div className="flex items-center gap-2">
                 <PDFDownloadLink
                    document={invoicePdfDocument}
                    fileName={`Rechnung-${invoiceData.unstructuredMessage || invoiceData.id}.pdf`}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300 flex items-center gap-2"
                >
                    {({ loading }) => (
                        loading ? (
                            'Generiere...'
                        ) : (
                            <>
                               <Download size={16} />
                               PDF herunterladen
                            </>
                        )
                    )}
                </PDFDownloadLink>

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
            <div className="lg:w-2/3 flex flex-col gap-6">
              <InvoiceForm 
                  data={invoiceData}
                  customers={customers}
                  onDataChange={handleDataChange}
                  defaultVatRate={settings.vatRate}
              />
            </div>
            
            <div className="lg:w-1/3">
              <div className="sticky top-6">
                  <InvoicePreview onZoomClick={() => setIsZoomModalOpen(true)}>
                     {invoicePdfDocument}
                  </InvoicePreview>
              </div>
            </div>
        </main>
    </div>
  );
};

export default InvoiceEditor;
