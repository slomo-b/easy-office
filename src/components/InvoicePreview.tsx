import React from 'react';
import { PDFViewer } from '@react-pdf/renderer';
import { ZoomIn } from 'lucide-react';

interface InvoicePreviewProps {
  children: React.ReactElement; // This will be the <InvoicePDF /> document
  onZoomClick: () => void;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ children, onZoomClick }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md flex flex-col" style={{height: 'calc(100vh - 120px)'}}>
      <div className="flex justify-between items-center border-b border-gray-700 pb-2 mb-4">
        <h3 className="text-lg font-semibold text-emerald-400">Vorschau</h3>
        <button
            onClick={onZoomClick}
            className="p-1 text-gray-400 rounded-full hover:bg-gray-700 hover:text-white transition-all"
            title="Vorschau vergrössern"
            aria-label="Vorschau vergrössern"
        >
            <ZoomIn size={20} />
        </button>
      </div>
      <div className="flex-grow min-h-0">
        <PDFViewer width="100%" height="100%" showToolbar={false} style={{ border: 'none', borderRadius: '4px' }}>
          {children}
        </PDFViewer>
      </div>
    </div>
  );
};

export default InvoicePreview;