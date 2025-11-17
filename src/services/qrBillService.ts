import { InvoiceData } from "../types";
import { SwissQRCode } from 'swissqrbill/svg';

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
    // Use the dedicated SwissQRCode class to generate only the QR code SVG.
    // This is much more robust than generating the full bill and parsing the SVG.
    const qrCode = new SwissQRCode(billData);
    const svgString = qrCode.toString();

    // The library returns a full SVG string with width/height in mm.
    // Replace them with a fixed pixel size for consistent display in the preview component.
    let finalSvg = svgString.replace(/width="(\d+(\.\d+)?)mm"/, 'width="200"');
    finalSvg = finalSvg.replace(/height="(\d+(\.\d+)?)mm"/, 'height="200"');
    
    return finalSvg;

  } catch (error) {
    console.error("Swiss QR Code generation failed:", error);
    if (error instanceof Error) {
      if (error.message.toLowerCase().includes("reference")) {
        throw new Error("Ungültige Referenz für QR-IBAN.\nBitte geben Sie eine 27-stellige QR-Referenz an, oder verwenden Sie eine normale IBAN und lassen Sie das Referenzfeld leer.");
      }
    }
    throw new Error("Fehler bei der QR-Code Generierung. Überprüfen Sie alle Eingaben.");
  }
}