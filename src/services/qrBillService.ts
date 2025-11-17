


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
    const svgContainer = bill.element; // This is a DIV element

    // The actual SVG is inside the container div
    const fullSvgElement = svgContainer.querySelector('svg');
    if (!fullSvgElement) {
        throw new Error("Could not find SVG element within the generated bill container.");
    }
    
    // Find the QR code group. Its parent should contain both the code and the cross, correctly positioned.
    const qrCodeGroup = fullSvgElement.querySelector('.qr-code');
    const qrCodeAndCrossContainer = qrCodeGroup?.parentElement;


    if (qrCodeAndCrossContainer) {
      // The container <g> has a `transform` to position it within the payment slip.
      // We clone it and remove the transform to render it at origin (0,0) in our new SVG.
      const containerClone = qrCodeAndCrossContainer.cloneNode(true) as SVGGElement;
      containerClone.removeAttribute('transform');

      // The innerHTML of this cleaned group contains both the qr-code and the swiss-cross paths.
      const content = containerClone.innerHTML;

      return `<svg viewBox="0 0 46 46" width="200" height="200" xmlns="http://www.w3.org/2000/svg">${content}</svg>`;
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