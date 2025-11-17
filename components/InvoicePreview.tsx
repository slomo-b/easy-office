import React from 'react';
import { InvoiceData } from '../types';

interface InvoicePreviewProps {
  data: InvoiceData;
  qrCodeSrc: string;
  isLoadingQr: boolean;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ data, qrCodeSrc, isLoadingQr }) => {
  const formatAmount = (amount: number | '') => {
      if (amount === '') return '...';
      return amount.toFixed(2);
  }

  const logoHtml = data.logoSrc 
    ? `<img src="${data.logoSrc}" alt="Firmenlogo" style="max-height: 80px;"/>`
    : `<div class="h-20 w-40 bg-gray-200 flex items-center justify-center text-gray-500 text-sm">Ihr Logo</div>`;

  const qrCodeHtml = isLoadingQr
    ? `<div class="w-[200px] h-[200px] bg-gray-200 animate-pulse flex items-center justify-center text-gray-500">Generiere QR...</div>`
    : `<img src="${qrCodeSrc}" alt="Swiss QR Code" style="width: 200px; height: 200px;" />`;
  
  const processedTemplate = data.htmlTemplate
    .replace(/{{logoImage}}/g, logoHtml)
    .replace(/{{qrCodeImage}}/g, qrCodeHtml)
    .replace(/{{creditorName}}/g, data.creditorName)
    .replace(/{{creditorStreet}}/g, data.creditorStreet)
    .replace(/{{creditorHouseNr}}/g, data.creditorHouseNr)
    .replace(/{{creditorZip}}/g, data.creditorZip)
    .replace(/{{creditorCity}}/g, data.creditorCity)
    .replace(/{{creditorIban}}/g, data.creditorIban)
    .replace(/{{debtorName}}/g, data.debtorName)
    .replace(/{{debtorStreet}}/g, data.debtorStreet)
    .replace(/{{debtorHouseNr}}/g, data.debtorHouseNr)
    .replace(/{{debtorZip}}/g, data.debtorZip)
    .replace(/{{debtorCity}}/g, data.debtorCity)
    .replace(/{{currency}}/g, data.currency)
    .replace(/{{amount}}/g, formatAmount(data.amount))
    .replace(/{{reference}}/g, data.reference)
    .replace(/{{unstructuredMessage}}/g, data.unstructuredMessage)


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