import React from 'react';
import { PDFViewer } from '@react-pdf/renderer';

interface InvoicePreviewProps {
  children: React.ReactElement; // This will be the <InvoicePDF /> document
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ children }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md" style={{height: 'calc(100vh - 120px)'}}>
      <h3 className="text-lg font-semibold text-emerald-400 border-b border-gray-700 pb-2 mb-4">Vorschau</h3>
      <div className="h-[95%]">
        <PDFViewer width="100%" height="100%" style={{ border: 'none', borderRadius: '4px' }}>
          {children}
        </PDFViewer>
      </div>
    </div>
  );
};

export default InvoicePreview;
