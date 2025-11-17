
import { InvoiceData } from "../types";
import { Generator } from 'swissqrbill';

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
          address: `${data.creditorStreet} ${data.creditorHouseNr}`,
          zip: data.creditorZip,
          city: data.creditorCity,
          account: data.creditorIban.replace(/\s/g, ''),
          country: data.creditorCountry,
      },
      debtor: {
          name: data.debtorName,
          address: `${data.debtorStreet} ${data.debtorHouseNr}`,
          zip: data.debtorZip,
          city: data.debtorCity,
          country: data.debtorCountry,
      }
  };

  try {
    // A4 paper size in mm is 210 x 297. The QR Bill part is 210 x 105.
    // The QR Code itself is 46x46mm. We generate an SVG which is scalable.
    // The library handles the sizing internally when generating the bill.
    const bill = new Generator(billData, { size: "A4-PERFORATED-SHEET" });
    
    // We only need the QR code part for the preview, not the whole bill.
    // The library doesn't have a public method for just the QR SVG, so we extract it.
    // This is a bit of a hack, but it works with the current library version.
    const fullSvg = bill.getSVG();
    const qrCodeMatch = fullSvg.match(/<g transform="translate\(17.000, 17.000\)"(?:.|\n)*?<\/g>/);
    
    if (qrCodeMatch) {
      // The extracted part is just the QR code paths and the swiss cross.
      // We need to wrap it in an SVG tag to make it a valid, renderable SVG.
      const qrCodeContent = qrCodeMatch[0];
      return `<svg viewBox="0 0 46 46" width="200" height="200" xmlns="http://www.w3.org/2000/svg">${qrCodeContent}</svg>`;
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