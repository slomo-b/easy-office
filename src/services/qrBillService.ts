

import { InvoiceData } from "../types";
import { SwissQRBill } from 'swissqrbill/svg';

export async function generateQrCode(data: InvoiceData): Promise<string> {
  if (!data || !data.amount || Number(data.amount) <= 0) {
    throw new Error('Amount must be greater than zero to generate a QR code.');
  }

  const billData = {
      currency: data.currency,
      amount: Number(data.amount),
      reference: data.reference.replace(/\s/g, ''),
      additionalInformation: data.unstructuredMessage,
      creditor: {
          name: data.creditorName,
          address: data.creditorStreet,
          buildingNumber: data.creditorHouseNr,
          zip: Number(data.creditorZip),
          city: data.creditorCity,
          account: data.creditorIban.replace(/\s/g, ''),
          country: data.creditorCountry,
      },
      debtor: {
          name: data.debtorName,
          address: data.debtorStreet,
          buildingNumber: data.debtorHouseNr,
          zip: Number(data.debtorZip),
          city: data.debtorCity,
          country: data.debtorCountry,
      }
  };

  try {
    const bill = new SwissQRBill(billData);
    const svgElement = bill.element;

    const qrCodeGroup = svgElement.querySelector('.qr-code');
    const swissCrossGroup = svgElement.querySelector('.swiss-cross');

    if (qrCodeGroup && swissCrossGroup) {
      const qrCodePaths = qrCodeGroup.innerHTML;
      const swissCrossPaths = swissCrossGroup.innerHTML;
      
      // The swiss cross (7x7mm) is centered inside the QR code (46x46mm).
      // Its top-left corner is therefore at half the size of the QR code minus half the size of the cross.
      // (46 / 2) - (7 / 2) = 23 - 3.5 = 19.5
      const crossTranslate = 19.5;

      return `<svg viewBox="0 0 46 46" width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <g>${qrCodePaths}</g>
        <g transform="translate(${crossTranslate}, ${crossTranslate})">${swissCrossPaths}</g>
      </svg>`;
    }
    
    throw new Error("Could not extract QR code from generated bill SVG.");

  } catch (error) {
    console.error("Swiss QR Bill generation failed:", error);
    if (error instanceof Error) {
      if (error.message.toLowerCase().includes("reference")) {
        throw new Error("Ungültige Referenz für QR-IBAN.\nBitte geben Sie eine 27-stellige QR-Referenz an, oder verwenden Sie eine normale IBAN und lassen Sie das Referenzfeld leer.");
      }
    }
    throw new Error("Fehler bei der QR-Code Generierung. Überprüfen Sie alle Eingaben.");
  }
}