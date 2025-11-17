
import React from 'react';

interface InvoicePreviewProps {
  processedTemplate: string;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ processedTemplate }) => {
  return (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md h-full">
      <h3 className="text-lg font-semibold text-emerald-400 border-b border-gray-700 pb-2 mb-4">Vorschau</h3>
      <div className="bg-white rounded-sm overflow-auto" style={{aspectRatio: '210 / 297'}}>
        <div dangerouslySetInnerHTML={{ __html: processedTemplate }} />
      </div>
    </div>
  );
};

export default InvoicePreview;