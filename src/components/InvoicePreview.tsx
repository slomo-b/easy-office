
import React from 'react';
import { InvoiceData } from '../types';

interface InvoicePreviewProps {
  data: InvoiceData;
  qrCodeSvg: string;
  isLoadingQr: boolean;
}

const InvoicePreview: React.FC<InvoicePreviewProps> = ({ data, qrCodeSvg, isLoadingQr }) => {
  const formatAmount = (amount: number | '') => {
      if (amount === '') return '...';
      return Number(amount).toFixed(2);
  }

  const logoHtml = data.logoSrc 
    ? `<img src="${data.logoSrc}" alt="Firmenlogo" style="max-height: 80px;"/>`
    : `<div class="h-20 w-40 flex items-center justify-center text-gray-500 text-sm" style="background-color: #f3f4f6; border: 1px dashed #d1d5db; border-radius: 0.5rem;">Ihr Logo</div>`;

  let qrCodeHtml: string;
  if (isLoadingQr) {
    qrCodeHtml = `<div style="width: 200px; height: 200px;" class="bg-gray-200 animate-pulse flex items-center justify-center text-gray-500">Generiere QR...</div>`;
  } else if (qrCodeSvg) {
    qrCodeHtml = qrCodeSvg;
  } else {
    qrCodeHtml = `<div style="width: 200px; height: 200px;" class="bg-gray-100 flex items-center justify-center text-center text-xs text-gray-500 p-2 border border-dashed border-gray-300">QR-Code kann nicht generiert werden.<br/>(Betrag muss grösser als 0 sein)</div>`;
  }
  
  const itemsHtml = data.items.map((item, index) => {
    const quantity = Number(item.quantity);
    const price = Number(item.price);
    const total = quantity * price;
    const isEven = index % 2 === 0;
    const rowClass = isEven ? 'bg-gray-50' : '';

    return `
        <tr class="${rowClass}">
            <td class="py-3 px-4 text-gray-800">${item.description}</td>
            <td class="text-right py-3 px-4 text-gray-600">${quantity.toFixed(2)} ${item.unit}</td>
            <td class="text-right py-3 px-4 text-gray-600">${formatAmount(price)}</td>
            <td class="text-right py-3 px-4 font-semibold text-gray-800">${formatAmount(total)}</td>
        </tr>
    `;
  }).join('');
  
  const projectLineHtml = data.projectName 
    ? `<p><span class="font-semibold text-gray-600">Projekt:</span> ${data.projectName}</p>`
    : '';

  const processedTemplate = data.htmlTemplate
    .replace(/{{logoImage}}/g, logoHtml)
    .replace(/{{qrCodeImage}}/g, qrCodeHtml)
    .replace(/{{invoiceItems}}/g, itemsHtml)
    .replace(/{{projectLine}}/g, projectLineHtml)
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
